// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { KPICard } from "@/components/dashboard/kpi-card";
import { AlertTriangle } from "lucide-react";

describe("KPICard", () => {
  it("renders label and value", () => {
    render(<KPICard icon={AlertTriangle} label="Active Incidents" value="5" />);
    expect(screen.getByText("Active Incidents")).toBeTruthy();
    expect(screen.getByText("5")).toBeTruthy();
  });

  it("renders trend indicator", () => {
    render(<KPICard icon={AlertTriangle} label="Errors" value="3" trend={{ value: "+2", direction: "up" }} />);
    expect(screen.getByText(/\+2/)).toBeTruthy();
  });

  it("renders without trend", () => {
    render(<KPICard icon={AlertTriangle} label="Stable" value="0" />);
    expect(screen.getByText("Stable")).toBeTruthy();
    expect(screen.getByText("0")).toBeTruthy();
  });
});
