// @vitest-environment jsdom

import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import SecureContactForm from "./SecureContactForm";

afterEach(() => {
  vi.useRealTimers();
});

describe("SecureContactForm", () => {
  it("uses secure-channel framing and confirms transmission on submit", async () => {
    vi.useFakeTimers();

    render(<SecureContactForm />);

    expect(screen.getByText("Channel State")).toBeTruthy();
    expect(screen.getByText("Secure")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Transmit Secure Brief" })).toBeTruthy();

    fireEvent.change(screen.getByLabelText("Operator Name"), { target: { value: "Bharath" } });
    fireEvent.change(screen.getByLabelText("Return Channel"), { target: { value: "bharath@example.com" } });
    fireEvent.change(screen.getByLabelText("Transmission Brief"), {
      target: { value: "Need a fraud detection deployment." },
    });
    fireEvent.click(screen.getByRole("button", { name: "Transmit Secure Brief" }));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1200);
    });

    expect(screen.getByText("Transmission Accepted")).toBeTruthy();
  });
});
