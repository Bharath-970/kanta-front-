"use client";

import { useEffect, useRef } from "react";

const VERT = `
attribute vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const FRAG = `
precision mediump float;
uniform float u_time;
uniform vec2 u_resolution;

#define PI 3.14159265358979

float ring(vec2 uv, float r, float width, float softness) {
  float d = length(uv) - r;
  return smoothstep(width + softness, width, abs(d));
}

void main() {
  vec2 uv = (gl_FragCoord.xy - u_resolution * 0.5) / min(u_resolution.x, u_resolution.y);

  float t = u_time * 0.5;
  vec3 col = vec3(0.0);

  // Outer slow ring
  float r1 = ring(uv, 0.38 + sin(t * 0.7) * 0.01, 0.004, 0.006);
  col += r1 * vec3(1.0, 0.30, 0.0) * 0.5;

  // Mid pulsing ring
  float r2 = ring(uv, 0.28 + sin(t * 1.3 + 1.0) * 0.015, 0.006, 0.008);
  col += r2 * vec3(1.0, 0.22, 0.0) * 0.7;

  // Inner fast ring
  float r3 = ring(uv, 0.16 + sin(t * 2.1 + 2.5) * 0.02, 0.008, 0.01);
  col += r3 * vec3(1.0, 0.18, 0.0) * 0.9;

  // Rotating arc overlays
  float angle = atan(uv.y, uv.x);
  float arc = smoothstep(0.3, 1.0, sin(angle * 3.0 - t * 2.0));
  float arcRing = ring(uv, 0.33, 0.002, 0.004) * arc;
  col += arcRing * vec3(1.0, 0.5, 0.1) * 0.6;

  // Glow core
  float glow = exp(-length(uv) * 6.0) * 0.15;
  col += glow * vec3(1.0, 0.3, 0.0);

  // Radial gradient fade out
  float fade = 1.0 - smoothstep(0.3, 0.55, length(uv));
  col *= fade;

  gl_FragColor = vec4(col, max(col.r, max(col.g, col.b)));
}
`;

function createShader(gl: WebGLRenderingContext, type: number, src: string) {
  const s = gl.createShader(type)!;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  return s;
}

function createProgram(gl: WebGLRenderingContext) {
  const prog = gl.createProgram()!;
  gl.attachShader(prog, createShader(gl, gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, createShader(gl, gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(prog);
  return prog;
}

export default function EnergyRing({
  size = 420,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", { alpha: true, premultipliedAlpha: false });
    if (!gl) return;

    const dpr = Math.min(window.devicePixelRatio, 2);
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    gl.viewport(0, 0, canvas.width, canvas.height);

    const prog = createProgram(gl);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW
    );

    const pos = gl.getAttribLocation(prog, "a_position");
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(prog, "u_time");
    const uRes = gl.getUniformLocation(prog, "u_resolution");
    gl.uniform2f(uRes, canvas.width, canvas.height);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    const start = performance.now();
    let active = true;
    const render = () => {
      if (!active) return;
      const t = (performance.now() - start) / 1000;
      gl.uniform1f(uTime, t);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      rafRef.current = requestAnimationFrame(render);
    };
    rafRef.current = requestAnimationFrame(render);

    const obs = new IntersectionObserver(
      ([entry]) => {
        active = entry.isIntersecting;
        if (active) rafRef.current = requestAnimationFrame(render);
      },
      { threshold: 0 }
    );
    obs.observe(canvas);

    const onVisibility = () => {
      active = document.visibilityState === "visible";
      if (active) rafRef.current = requestAnimationFrame(render);
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      active = false;
      cancelAnimationFrame(rafRef.current);
      obs.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [size]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ width: size, height: size }}
    />
  );
}
