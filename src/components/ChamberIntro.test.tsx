// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import ChamberIntro from "./ChamberIntro";

describe("ChamberIntro", () => {
  it("renders chamber framing, title, and metadata rails", () => {
    render(
      <ChamberIntro
        index="01"
        eyebrow="Chamber 01 // Evidence Flow"
        title="The Process"
        description="Live forensic routing from ingest to governed response."
        railItems={[
          { label: "State", value: "Active Trace" },
          { label: "Mode", value: "Biometric" },
        ]}
      />
    );

    expect(screen.getByText("Chamber 01 // Evidence Flow")).toBeTruthy();
    expect(screen.getByText("The Process")).toBeTruthy();
    expect(
      screen.getByText("Live forensic routing from ingest to governed response.")
    ).toBeTruthy();
    expect(screen.getByText("State")).toBeTruthy();
    expect(screen.getByText("Active Trace")).toBeTruthy();
    expect(screen.getByText("Mode")).toBeTruthy();
    expect(screen.getByText("Biometric")).toBeTruthy();
  });
});
