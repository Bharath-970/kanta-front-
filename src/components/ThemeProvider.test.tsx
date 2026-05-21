// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";

import { ThemeProvider, useTheme } from "./ThemeProvider";

function ThemeProbe() {
  const { theme, toggle } = useTheme();

  return (
    <>
      <button onClick={toggle}>toggle</button>
      <span>{theme}</span>
    </>
  );
}

afterEach(() => {
  cleanup();
});

describe("ThemeProvider", () => {
  it("starts in dark mode even if localStorage previously stored light", () => {
    localStorage.setItem("ks-theme", "light");

    render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>
    );

    expect(screen.getByText("dark")).toBeTruthy();
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });

  it("still allows toggling to light during the current visit", async () => {
    const user = userEvent.setup();

    render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>
    );

    await user.click(screen.getByRole("button", { name: "toggle" }));

    expect(screen.getByText("light")).toBeTruthy();
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
  });
});
