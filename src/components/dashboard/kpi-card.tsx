import type { LucideIcon } from "lucide-react";
import { CircleAlert, Gauge, CheckCircle, Activity, ArrowUp, ArrowDown } from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  CircleAlert,
  Gauge,
  CheckCircle,
  Activity,
};

interface Trend {
  value: string;
  direction: "up" | "down";
}

interface KPICardProps {
  icon: string;
  label: string;
  value: string;
  unit?: string;
  sublabel?: string;
  trend?: Trend;
  trendColor?: "error" | "success";
  progress?: number;
  glow?: boolean;
}

export function KPICard({ icon, label, value, unit, sublabel, trend, trendColor, progress, glow }: KPICardProps) {
  const Icon = iconMap[icon];

  return (
    <div className="relative overflow-hidden rounded-xl bg-black/70 backdrop-blur-xl border border-[#1F1F1F] p-3 group">
      {glow && (
        <div className="absolute top-0 right-0 w-24 h-24 bg-error/5 rounded-full blur-2xl -mr-8 -mt-8 pointer-events-none" />
      )}
      <div className="flex justify-between items-start mb-1">
        <span className="text-[10px] font-medium uppercase tracking-wider text-on-surface-variant">{label}</span>
        {Icon && <Icon className={cn("h-4 w-4", trendColor === "error" ? "text-error" : "text-outline")} />}
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-2xl font-bold leading-none tracking-tight text-on-surface">{value}</span>
        {unit && <span className="text-xs text-on-surface-variant">{unit}</span>}
        {sublabel && <span className="text-[10px] text-on-surface-variant">{sublabel}</span>}
      </div>
      {trend && (
        <span className={cn(
          "inline-flex items-center gap-0.5 mt-1 px-1.5 py-0.5 rounded text-[11px]",
          trendColor === "error" ? "bg-error/10 text-error" : "bg-[#4ADE80]/10 text-[#4ADE80]"
        )}>
          {trend.direction === "up" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
          {trend.value}
        </span>
      )}
      {progress !== undefined && (
        <div className="w-full bg-surface-variant h-0.5 rounded-full mt-2 overflow-hidden">
          <div className="bg-primary h-full rounded-full" style={{ width: `${progress}%` }} />
        </div>
      )}
    </div>
  );
}

function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}
