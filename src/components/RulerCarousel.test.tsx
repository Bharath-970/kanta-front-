// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import RulerCarousel from "./RulerCarousel";

describe("RulerCarousel", () => {
  it("renders archive-oriented metadata without changing the carousel mechanic", () => {
    render(
      <RulerCarousel
        items={[
          {
            id: 1,
            title: "NHA Hackathon — Problem Statement 2",
            subtitle: "National Health Authority",
            description: "Radiological image-based correlation.",
            badge: "Runner-up · 2nd Place",
            year: "2026",
            meta: "PS-02 · Radiology",
            recordId: "ARC-PS02-2026",
            authority: "NHA VERIFIED",
            recordStatus: "FILE OPENED",
          },
        ]}
      />
    );

    expect(screen.getByText("ARC-PS02-2026")).toBeTruthy();
    expect(screen.getByText("NHA VERIFIED")).toBeTruthy();
    expect(screen.getByText("FILE OPENED")).toBeTruthy();
  });
});
