import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const __dirname = dirname(fileURLToPath(import.meta.url));
const shaderSource = readFileSync(resolve(__dirname, "GLSLTerrain.tsx"), "utf8");

describe("GLSLTerrain fragment shader", () => {
  it("keeps fingerprint waves dormant before the sweep and lets them decay after contact", () => {
    expect(shaderSource).toContain("float dormantFingerprint");
    expect(shaderSource).toContain("float afterglow");
    expect(shaderSource).toContain("float fpExcited");
  });

  it("keeps the dormant fingerprint visible toward the outer radius", () => {
    expect(shaderSource).toContain("smoothstep(2.25, 0.08, dist)");
    expect(shaderSource).toContain("mix(0.028, 0.11, u_dark)");
  });

  it("keeps the simpler mouse ripple without the heavier cursor wake uniforms", () => {
    expect(shaderSource).not.toContain("uniform float u_mouse_activity");
    expect(shaderSource).not.toContain("uniform vec2 u_mouse_prev");
    expect(shaderSource).not.toContain("uniform float u_mouse_prev_activity");
    expect(shaderSource).toContain("float mouseLight");
    expect(shaderSource).toContain("float fpMouse");
  });
});
