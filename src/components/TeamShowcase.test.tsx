// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import TeamShowcase from "./TeamShowcase";

describe("TeamShowcase", () => {
  it("reveals dossier metadata for the active operator", async () => {
    const user = userEvent.setup();

    render(
      <TeamShowcase
        members={[
          {
            id: "1",
            name: "Member 1",
            role: "Founder & CEO",
            image: "",
            unitCode: "KS-01",
            mission: "Systems command",
            capability: "Fraud strategy",
          },
          {
            id: "2",
            name: "Member 2",
            role: "CTO",
            image: "",
            unitCode: "KS-02",
            mission: "Infra control",
            capability: "Platform engineering",
          },
        ]}
      />
    );

    await user.click(screen.getByRole("button", { name: /Member 1/i }));

    expect(screen.getAllByText("KS-01")).toHaveLength(3);
    expect(screen.getByText("Systems command")).toBeTruthy();
    expect(screen.getByText("Fraud strategy")).toBeTruthy();
  });
});
