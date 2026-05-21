// @vitest-environment jsdom

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, describe, expect, it } from "vitest";

import ProcessShowcase from "./ProcessShowcase";

const TestViz = () => <div>viz</div>;

beforeAll(() => {
  Object.defineProperty(HTMLCanvasElement.prototype, "getContext", {
    value: () => ({
      scale: () => {},
      clearRect: () => {},
      beginPath: () => {},
      arc: () => {},
      fill: () => {},
      moveTo: () => {},
      lineTo: () => {},
      stroke: () => {},
      setLineDash: () => {},
      fillText: () => {},
    }),
  });

  class TestIntersectionObserver {
    observe() {}
    disconnect() {}
    unobserve() {}
  }

  Object.defineProperty(window, "IntersectionObserver", {
    writable: true,
    value: TestIntersectionObserver,
  });

  Object.defineProperty(window, "requestAnimationFrame", {
    writable: true,
    value: () => 1,
  });

  Object.defineProperty(window, "cancelAnimationFrame", {
    writable: true,
    value: () => {},
  });
});

describe("ProcessShowcase", () => {
  it("renders supplied chamber steps and switches active operational state", async () => {
    const user = userEvent.setup();

    render(
      <ProcessShowcase
        steps={[
          {
            id: "ingest",
            num: "01",
            label: "Ingest",
            tagline: "Any source. Real-time.",
            body: "Collect the evidence stream.",
            tags: ["Kafka"],
            stateLabel: "Stream Captured",
            stateValue: "Nominal",
            statusLine: "INGESTION CHANNEL ONLINE",
            Viz: TestViz,
          },
          {
            id: "detect",
            num: "02",
            label: "Detect",
            tagline: "Sub-50ms. Explainable.",
            body: "Correlate anomalies against live traffic.",
            tags: ["BentoML"],
            stateLabel: "Threat Signal",
            stateValue: "Flagged",
            statusLine: "ANOMALY CORRELATION ENGAGED",
            Viz: TestViz,
          },
        ]}
      />
    );

    expect(screen.getByText("Stream Captured")).toBeTruthy();
    expect(screen.getAllByText("Nominal")).toHaveLength(2);
    expect(screen.getAllByText("INGESTION CHANNEL ONLINE")).toHaveLength(2);

    await user.click(screen.getByRole("button", { name: /Detect/i }));

    expect(screen.getByText("Threat Signal")).toBeTruthy();
    expect(screen.getByText("Flagged")).toBeTruthy();
    await waitFor(() => {
      expect(screen.getAllByText("ANOMALY CORRELATION ENGAGED")).toHaveLength(2);
    });
  });
});
