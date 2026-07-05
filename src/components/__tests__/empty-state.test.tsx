// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { EmptyState } from "@/components/shared/empty-state";
import { AlertTriangle } from "lucide-react";

describe("EmptyState", () => {
  it("renders title and description", () => {
    render(<EmptyState icon={AlertTriangle} title="No Data" description="Nothing to show." />);
    expect(screen.getByText("No Data")).toBeTruthy();
    expect(screen.getByText("Nothing to show.")).toBeTruthy();
  });

  it("renders action when provided", () => {
    render(<EmptyState icon={AlertTriangle} title="Empty" description="No items" action={<button>Create</button>} />);
    expect(screen.getByText("Create")).toBeTruthy();
  });

  it("does not render action when not provided", () => {
    const { container } = render(<EmptyState icon={AlertTriangle} title="Empty" description="No items" />);
    expect(container.querySelector("button")).toBeNull();
  });
});
