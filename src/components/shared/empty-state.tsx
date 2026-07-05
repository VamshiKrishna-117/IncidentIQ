import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-16 text-center", className)}>
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-surface-container-higher">
        <Icon className="h-7 w-7 text-on-surface-variant" />
      </div>
      <h3 className="mb-1 text-lg font-semibold text-on-surface">{title}</h3>
      <p className="mb-6 max-w-sm text-sm text-on-surface-variant">{description}</p>
      {action}
    </div>
  );
}
