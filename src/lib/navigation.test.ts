import { describe, expect, it } from "vitest";

import { getNavSectionId, shouldHandleNavInPage } from "./navigation";

describe("navigation helpers", () => {
  it("extracts section ids from home hash links", () => {
    expect(getNavSectionId("/#stack")).toBe("stack");
    expect(getNavSectionId("/#contact")).toBe("contact");
    expect(getNavSectionId("/login")).toBeNull();
  });

  it("only handles section links in-page on the homepage", () => {
    expect(shouldHandleNavInPage("/", "/#process")).toBe(true);
    expect(shouldHandleNavInPage("/team", "/#process")).toBe(false);
    expect(shouldHandleNavInPage("/", "/login")).toBe(false);
  });
});
