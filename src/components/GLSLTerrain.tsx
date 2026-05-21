"use client";

import { useEffect, useRef } from "react";

const VERT = `attribute vec2 a_position;
void main() { gl_Position = vec4(a_position, 0.0, 1.0); }`;

const FRAG = `precision highp float;
uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_dark;

#define PI 3.14159265359
#define TAU 6.28318530718

vec3 permute3(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                      -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute3(permute3(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m; m = m*m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

float fbm(vec2 p) {
  float f = 0.5 * snoise(p);
  p *= 2.02;
  f += 0.25 * snoise(p);
  return f / 0.75;
}

// Full-screen flowing fingerprint lines
float fingerprint(vec2 uv, float time) {
  float n1 = snoise(uv * 1.4 + vec2(0.0, time * 0.02));
  float n2 = snoise(uv * 0.8 + vec2(time * 0.01, 50.0));
  vec2 warped = uv + vec2(n1 * 0.35 + n2 * 0.15, n1 * 0.25 - n2 * 0.1);

  // Primary flowing ridges — more organic with extra noise
  float ridges1 = sin(warped.y * 22.0 + warped.x * 4.0 + fbm(warped * 2.5) * 5.0);
  ridges1 = smoothstep(-0.08, 0.08, ridges1);

  // Whorl — use higher frequency to avoid obvious 3-spoke pattern
  float dist = length(uv);
  float angle = atan(uv.y, uv.x);
  float whorl = sin(angle * 7.0 + dist * 18.0 + n1 * 5.0 + n2 * 3.0);
  whorl = smoothstep(-0.08, 0.08, whorl);

  float blend = smoothstep(0.7, 0.15, dist);
  return mix(ridges1, whorl, blend);
}

void main() {
  vec2 uv = (gl_FragCoord.xy - u_resolution * 0.5) / min(u_resolution.x, u_resolution.y);
  uv.y -= 0.12; // Nudge pattern center up to meet the title text
  uv *= 1.65; // Zoom level
  vec2 screenUV = gl_FragCoord.xy / u_resolution;
  float aspect = u_resolution.x / u_resolution.y;
  float time = u_time;

  vec3 col = vec3(0.0);

  // Mouse interaction
  vec2 mouseUV = (u_mouse - 0.5) * vec2(aspect, 1.0) * 1.65;
  float mouseDist = length(uv - mouseUV);
  vec2 ripple = (uv - mouseUV) / (mouseDist + 0.05);
  float rippleWave = sin(mouseDist * 30.0 - time * 4.0) * 0.002;
  vec2 distortedUV = uv + ripple * rippleWave * smoothstep(0.3, 0.0, mouseDist);

  // Fingerprint
  float fp = fingerprint(distortedUV, time);

  // Sonar sweep
  float angle = atan(uv.y, uv.x);
  float dist = length(uv);
  float sweepAngle = mod(time * 0.5, TAU);
  float angleDiff = mod(sweepAngle - angle + TAU, TAU);

  // Clamp angleDiff to avoid opposite side glow (only light up behind beam, not across)
  float beam = smoothstep(0.04, 0.0, angleDiff) * smoothstep(1.85, 0.0, dist);

  float afterglow = angleDiff < PI ? smoothstep(1.65, 0.0, angleDiff) * (1.0 - angleDiff / 1.65) : 0.0;
  afterglow *= afterglow;
  afterglow *= smoothstep(1.9, 0.0, dist) * 0.72;

  // Radar rings — fit within screen
  float rings = 0.0;
  for (float i = 1.0; i <= 6.0; i++) {
    float r = i * 0.08;
    float ring = smoothstep(0.003, 0.0, abs(dist - r));
    float pulse = 0.6 + 0.4 * sin(time * 1.2 + i * 0.9);
    rings += ring * (0.08 + pulse * 0.04);
  }

  // Crosshairs
  float crossH = smoothstep(0.001, 0.0, abs(uv.y)) * step(0.02, abs(uv.x)) * 0.06;
  float crossV = smoothstep(0.001, 0.0, abs(uv.x)) * step(0.02, abs(uv.y)) * 0.06;

  // Blips
  float blips = 0.0;
  float bp[16];
  bp[0]=0.8; bp[1]=0.25; bp[2]=2.1; bp[3]=0.32;
  bp[4]=3.5; bp[5]=0.17; bp[6]=4.8; bp[7]=0.29;
  bp[8]=5.9; bp[9]=0.21; bp[10]=1.4; bp[11]=0.37;
  bp[12]=3.9; bp[13]=0.13; bp[14]=5.2; bp[15]=0.41;

  for (int i = 0; i < 8; i++) {
    float bA = bp[i*2];
    float bD = bp[i*2+1];
    vec2 bPos = vec2(cos(bA), sin(bA)) * bD;
    float bLen = length(uv - bPos);
    float bAD = mod(sweepAngle - bA + TAU, TAU);
    float det = smoothstep(2.0, 0.0, bAD);

    blips += smoothstep(0.01, 0.003, bLen) * det;
    blips += smoothstep(0.003, 0.0, abs(bLen - bAD * 0.04)) * det * 0.4;
    blips += det * 0.025 / (bLen + 0.01);
  }

  // ── Colours ──────────────────────────────────────────────────────────────
  vec3 orange = vec3(1.0, 0.302, 0.0);
  vec3 warm   = vec3(1.0, 0.45,  0.1);
  vec3 bgDark  = vec3(0.011, 0.011, 0.020);
  vec3 bgLight = vec3(0.961, 0.941, 0.910);
  vec3 lineCol = vec3(0.12, 0.06, 0.02);    // dark brown — fingerprint lines in light
  vec3 oc      = mix(vec3(0.78, 0.32, 0.12), orange, u_dark); // amber↔orange

  // ── Derived quantities ────────────────────────────────────────────────────
  float centerPulse = 0.5 + 0.3 * sin(time * 3.0);
  float mouseLight  = smoothstep(0.6, 0.0, mouseDist);
  float dormantFingerprint = fp * mix(0.028, 0.10, u_dark);
  float fpExcited = fp * (afterglow * 0.7 + beam * 1.0);
  float fpMouse  = fp * mouseLight * 0.55;
  float mpGlow   = 0.015 / (mouseDist + 0.04) * 0.15;

  // ── Background ────────────────────────────────────────────────────────────
  col = mix(bgLight, bgDark, u_dark);

  // ── Fingerprint ───────────────────────────────────────────────────────────
  // Dark mode:  ADD orange glow on black
  // Light mode: MIX cream → lineCol (properly darkens the cream)
  float fpMask = clamp(dormantFingerprint * mix(16.0, 2.4, u_dark), 0.0, 1.0);
  col = mix(col, mix(lineCol, col + orange * dormantFingerprint * 0.8, u_dark), fpMask);

  // Sweep-lit fingerprint — keep a dormant field, then energize it on contact.
  col += oc * fpExcited * mix(0.55, 0.9, u_dark);
  col += mix(lineCol * fpMouse * 0.5, warm * fpMouse, u_dark);
  col += oc * mpGlow * mix(0.4, 1.0, u_dark);

  // ── Sonar ─────────────────────────────────────────────────────────────────
  // All elements strong in both modes — rings, beam, trail, blips
  col += oc * beam  * mix(1.2, 0.4, u_dark);
  col += oc * afterglow * mix(0.45, 0.12, u_dark);
  col += oc * rings * mix(2.5, 1.0, u_dark);   // rings × 2.5 in light
  col += oc * (crossH + crossV) * mix(1.8, 1.0, u_dark);
  col += mix(vec3(0.78,0.32,0.12), warm, u_dark) * blips * mix(1.2, 0.7, u_dark);

  // Centre reticle
  col += oc * smoothstep(0.006, 0.002, dist) * centerPulse * mix(1.2, 1.0, u_dark);
  col += oc * smoothstep(0.002, 0.0, abs(dist - 0.012)) * centerPulse * 0.5;

  // ── Post-process ──────────────────────────────────────────────────────────
  float vigDark  = 1.0 - dot(screenUV-0.5, screenUV-0.5) * 0.35;
  float vigLight = 1.0 - dot(screenUV-0.5, screenUV-0.5) * 0.1;
  col *= mix(vigLight, vigDark, u_dark);
  col *= 0.97 + 0.03 * sin(gl_FragCoord.y * 1.5);
  col.r *= mix(1.0, 1.1, u_dark);
  col.b *= mix(1.0, 1.05, u_dark);
  col = clamp(col, 0.0, 1.0);
  col = pow(col, vec3(0.95));

  gl_FragColor = vec4(col, 1.0);
}`;

interface DataPoint {
  angle: number;
  dist: number;
  label: string;
  detected: number;
}

export default function GLSLTerrain() {
  const glRef = useRef<HTMLCanvasElement>(null);
  const hudRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });

  useEffect(() => {
    const glCanvas = glRef.current;
    const hudCanvas = hudRef.current;
    const container = containerRef.current;
    if (!glCanvas || !hudCanvas || !container) return;

    const gl = glCanvas.getContext("webgl", { alpha: true, premultipliedAlpha: false })!;
    if (!gl) return;

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,1,1]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(prog, "a_position");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(prog, "u_time");
    const uRes = gl.getUniformLocation(prog, "u_resolution");
    const uMouse = gl.getUniformLocation(prog, "u_mouse");
    const uDark = gl.getUniformLocation(prog, "u_dark");

    const isDark = () => document.documentElement.getAttribute("data-theme") !== "light" ? 1.0 : 0.0;
    gl.uniform1f(uDark, isDark());

    const themeObs = new MutationObserver(() => gl.uniform1f(uDark, isDark()));
    themeObs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    const ctx = hudCanvas.getContext("2d")!;
    const dpr = 1; // Render at 1x for proper scale

    const dataPoints: DataPoint[] = [
      { angle: 0.8, dist: 0.55, label: "NODE-7A", detected: -99 },
      { angle: 2.1, dist: 0.72, label: "SIG-14", detected: -99 },
      { angle: 3.5, dist: 0.38, label: "TRACE-3", detected: -99 },
      { angle: 4.8, dist: 0.65, label: "FRG-09", detected: -99 },
      { angle: 5.9, dist: 0.48, label: "PKT-22", detected: -99 },
      { angle: 1.4, dist: 0.82, label: "AUX-01", detected: -99 },
      { angle: 3.9, dist: 0.29, label: "CORE-X", detected: -99 },
      { angle: 5.2, dist: 0.91, label: "EXT-44", detected: -99 },
    ];

    let time = 0;
    let raf: number;
    let running = true;
    let lastFrame = 0;
    const TARGET_FPS = 30;
    const FRAME_MS = 1000 / TARGET_FPS;

    const resize = () => {
      const w = container.offsetWidth;
      const h = container.offsetHeight;
      glCanvas.width = w * dpr;
      glCanvas.height = h * dpr;
      hudCanvas.width = w * dpr;
      hudCanvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      gl.viewport(0, 0, glCanvas.width, glCanvas.height);
    };
    resize();
    window.addEventListener("resize", resize);

    const onMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseRef.current = {
        x: (e.clientX - rect.left) / rect.width,
        y: (e.clientY - rect.top) / rect.height,
      };
    };
    container.addEventListener("mousemove", onMove);

    const draw = (now: number) => {
      if (!running) return;
      if (now - lastFrame < FRAME_MS) {
        raf = requestAnimationFrame(draw);
        return;
      }
      const dt = lastFrame === 0 ? FRAME_MS / 1000 : (now - lastFrame) / 1000;
      lastFrame = now;
      const w = container.offsetWidth;
      const h = container.offsetHeight;
      time += dt;

      gl.uniform1f(uTime, time);
      gl.uniform2f(uRes, glCanvas.width, glCanvas.height);
      gl.uniform2f(uMouse, mouseRef.current.x, 1.0 - mouseRef.current.y);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      // HUD overlay
      ctx.clearRect(0, 0, w, h);
      const cx = w / 2;
      const cy = h / 2;
      const radius = Math.min(w, h) * 0.44;
      const sweepAngle = (time * 0.5) % (Math.PI * 2);

      dataPoints.forEach((dp) => {
        const angleDiff = ((sweepAngle - dp.angle) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
        if (angleDiff < 0.1 && time - dp.detected > 3) dp.detected = time;

        const age = time - dp.detected;
        if (age > 5) return;

        const fade = Math.max(0, 1 - age / 5);
        const px = cx + Math.cos(dp.angle) * radius * dp.dist;
        const py = cy - Math.sin(dp.angle) * radius * dp.dist;

        const isLightHUD = document.documentElement.getAttribute("data-theme") === "light";
        const hudAccent = isLightHUD ? "199, 81, 31" : "255, 77, 0";
        ctx.font = "bold 9px monospace";
        ctx.fillStyle = `rgba(${hudAccent}, ${fade * 0.8})`;
        ctx.fillText(dp.label, px + 10, py - 6);

        ctx.beginPath();
        ctx.moveTo(px + 4, py - 2);
        ctx.lineTo(px + 9, py - 5);
        ctx.strokeStyle = `rgba(${hudAccent}, ${fade * 0.4})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      });

      const isLight = document.documentElement.getAttribute("data-theme") === "light";
      const acc = isLight ? "199, 81, 31" : "255, 77, 0";
      ctx.font = "10px monospace";
      ctx.fillStyle = `rgba(${acc}, 0.35)`;
      const deg = ((sweepAngle * 180 / Math.PI) % 360).toFixed(1);
      ctx.fillText(`AZM ${deg}°`, 24, 34);
      ctx.fillText(`SCAN ACTIVE`, 24, 50);
      ctx.fillText(`MODE: BIOMETRIC`, 24, 66);

      const detected = dataPoints.filter(d => time - d.detected < 5).length;
      ctx.textAlign = "right";
      ctx.fillText(`RNG ${(radius / 100).toFixed(1)}km`, w - 24, 34);
      ctx.fillText(`SIG ${detected}/${dataPoints.length}`, w - 24, 50);
      ctx.fillText(`THR 0.${Math.floor(82 + Math.sin(time) * 5)}`, w - 24, 66);
      ctx.textAlign = "left";

      ctx.textAlign = "center";
      ctx.fillStyle = `rgba(${acc}, 0.2)`;
      ctx.fillText("KANTAKA ŚODHANA // BIOMETRIC SWEEP v2.1 // LIVE", cx, h - 24);
      ctx.textAlign = "left";

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);

    // Pause when tab hidden
    const onVisibility = () => {
      running = document.visibilityState === "visible";
      if (running) raf = requestAnimationFrame(draw);
    };
    document.addEventListener("visibilitychange", onVisibility);

    // Pause when scrolled off screen
    const obs = new IntersectionObserver(
      ([entry]) => {
        running = entry.isIntersecting;
        if (running) { lastFrame = 0; raf = requestAnimationFrame(draw); }
      },
      { threshold: 0 }
    );
    obs.observe(container);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      container.removeEventListener("mousemove", onMove);
      document.removeEventListener("visibilitychange", onVisibility);
      obs.disconnect();
      themeObs.disconnect();
    };
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 w-full h-full">
      <canvas ref={glRef} className="absolute inset-0 w-full h-full" />
      <canvas ref={hudRef} className="absolute inset-0 w-full h-full pointer-events-none" />
    </div>
  );
}
