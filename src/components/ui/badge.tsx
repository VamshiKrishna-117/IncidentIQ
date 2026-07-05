import { cn } from "@/lib/utils";
import type { Priority, Status } from "@/types";

type BadgeVariant = "default" | Priority | Status;

const variantStyles: Record<string, string> = {
  default: "bg-surface-container-highest text-on-surface",
  P0: "bg-red-500/10 text-red-400",
  P1: "bg-orange-500/10 text-orange-400",
  P2: "bg-yellow-500/10 text-yellow-400",
  P3: "bg-blue-500/10 text-blue-400",
  OPEN: "bg-blue-500/10 text-blue-400",
  INVESTIGATING: "bg-yellow-500/10 text-yellow-400",
  IDENTIFIED: "bg-orange-500/10 text-orange-400",
  MONITORING: "bg-purple-500/10 text-purple-400",
  RESOLVED: "bg-green-500/10 text-green-400",
};

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant = "default", children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        variantStyles[variant] ?? variantStyles.default,
        className
      )}
    >
      {children}
    </span>
  );
}
