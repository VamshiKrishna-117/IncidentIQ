import { describe, it, expect } from "vitest";
import { cn, formatTimestamp } from "../utils";

describe("cn", () => {
  it("merges class names correctly", () => {
    expect(cn("px-4", "py-2")).toBe("px-4 py-2");
  });

  it("handles conditional classes", () => {
    expect(cn("base", false && "hidden", "visible")).toBe("base visible");
  });

  it("resolves tailwind conflicts", () => {
    expect(cn("px-4", "px-6")).toBe("px-6");
  });
});

describe("formatTimestamp", () => {
  it("returns relative time for recent dates", () => {
    const recent = new Date(Date.now() - 5 * 60 * 1000);
    expect(formatTimestamp(recent.toISOString())).toMatch(/^\d+m ago$/);
  });

  it("returns formatted date for old dates", () => {
    const old = new Date("2025-01-15T08:30:00Z");
    const result = formatTimestamp(old);
    expect(result).toContain("Jan");
    expect(result).toContain("15");
  });

  it("returns placeholder for invalid date", () => {
    const result = formatTimestamp("not-a-date");
    expect(result).toMatch(/Invalid/i);
  });
});
