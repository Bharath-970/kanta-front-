export const colors = {
  dark: {
    bg: "#030305",
    surface: "#0a0a0f",
    border: "rgba(255, 255, 255, 0.08)",
    text: "#E8E6E3",
    textMuted: "#6B6B7B",
    accent: "#FF4D00",
    accentDim: "#C7511F",
  },
  light: {
    bg: "#F5F0E8",
    surface: "#FFFFFF",
    border: "rgba(0, 0, 0, 0.08)",
    text: "#1a1a1a",
    textMuted: "#6B6B7B",
    accent: "#C7511F",
    accentDim: "#8F2D1F",
  },
} as const;

export type Theme = "dark" | "light";
