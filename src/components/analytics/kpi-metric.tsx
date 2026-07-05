import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface KPIMetricProps {
  icon: LucideIcon;
  label: string;
  value: string;
  trend?: {
    value: string;
    direction: "up" | "down";
  };
  iconBg?: string;
}

export function KPIMetric({ icon: Icon, label, value, trend, iconBg }: KPIMetricProps) {
  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-on-surface-variant">{label}</p>
          <p className="mt-1 text-2xl font-semibold text-on-surface">{value}</p>
          {trend && (
            <div className="mt-1 flex items-center gap-1">
              {trend.direction === "up" ? (
                <TrendingUp className="h-3.5 w-3.5 text-error" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5 text-green-400" />
              )}
              <span className={cn("text-xs", trend.direction === "up" ? "text-error" : "text-green-400")}>
                {trend.value}
              </span>
            </div>
          )}
        </div>
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", iconBg ?? "bg-surface-container-higher")}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </Card>
  );
}
