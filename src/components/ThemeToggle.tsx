"use client";

import { useTheme } from "@/components/ThemeProvider";

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();

  return (
    <label className="switch" aria-label="Toggle dark/light mode">
      <input
        type="checkbox"
        checked={theme === "light"}
        onChange={toggle}
      />
      <span className="slider" />
      <style jsx>{`
        .switch {
          font-size: 14px;
          position: relative;
          display: inline-block;
          width: 3.5em;
          height: 2em;
        }
        .switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }
        .slider {
          position: absolute;
          cursor: pointer;
          inset: 0;
          background-color: var(--toggle-track, #0a0a0f);
          transition: 0.5s;
          border-radius: 30px;
          border: 1px solid var(--toggle-border, rgba(255, 77, 0, 0.3));
        }
        .slider:before {
          position: absolute;
          content: "";
          height: 1.4em;
          width: 1.4em;
          border-radius: 50%;
          left: 10%;
          bottom: 15%;
          box-shadow: inset 8px -4px 0px 0px var(--toggle-glow, #FF4D00);
          background: var(--toggle-track, #0a0a0f);
          transition: 0.5s;
        }
        input:checked + .slider {
          background-color: var(--toggle-track-active, #E8E6E3);
          border-color: var(--toggle-border-active, rgba(199, 81, 31, 0.4));
        }
        input:checked + .slider:before {
          transform: translateX(100%);
          box-shadow: inset 15px -4px 0px 15px var(--toggle-glow, #FF4D00);
        }
      `}</style>
    </label>
  );
}
