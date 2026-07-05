// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Badge } from "@/components/ui/badge";

describe("Badge", () => {
  it("renders with default variant", () => {
    render(<Badge>Hello</Badge>);
    expect(screen.getByText("Hello")).toBeTruthy();
  });

  it("renders with specific variant", () => {
    render(<Badge variant="P0">P0</Badge>);
    expect(screen.getByText("P0")).toBeTruthy();
  });

  it("renders with RESOLVED variant", () => {
    render(<Badge variant="RESOLVED">Resolved</Badge>);
    expect(screen.getByText("Resolved")).toBeTruthy();
  });
});
