import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface KPICardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  trend?: {
    value: string;
    direction: "up" | "down";
  };
  iconClassName?: string;
}

export function KPICard({ icon: Icon, label, value, trend, iconClassName }: KPICardProps) {
  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-on-surface-variant">{label}</p>
          <p className="mt-1 text-2xl font-semibold text-on-surface">{value}</p>
          {trend && (
            <p
              className={cn(
                "mt-1 text-xs",
                trend.direction === "up"
                  ? "text-error"
                  : "text-green-400"
              )}
            >
              {trend.direction === "up" ? "↑" : "↓"} {trend.value}
            </p>
          )}
        </div>
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-lg bg-surface-container-higher",
            iconClassName
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </Card>
  );
}
