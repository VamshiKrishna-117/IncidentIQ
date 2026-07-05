import { cn } from "@/lib/utils";
import { formatTime } from "@/lib/utils";
import { Terminal, User, Cpu, Brain, AlertTriangle } from "lucide-react";

const typeConfig = {
  USER: { icon: User, bg: "bg-blue-500/10", color: "text-blue-400" },
  SYSTEM: { icon: Cpu, bg: "bg-purple-500/10", color: "text-purple-400" },
  AI: { icon: Brain, bg: "bg-green-500/10", color: "text-green-400" },
} as const;

interface TimelineItemProps {
  message: string;
  authorName: string;
  timestamp: string;
  type: "USER" | "SYSTEM" | "AI";
  isFirst?: boolean;
  isLast?: boolean;
}

export function TimelineItem({ message, authorName, timestamp, type, isFirst, isLast }: TimelineItemProps) {
  const config = typeConfig[type] ?? typeConfig.USER;

  return (
    <div className="relative flex gap-4 pb-6">
      <div className="flex flex-col items-center">
        <div
          className={cn(
            "relative z-10 flex h-7 w-7 items-center justify-center rounded-full",
            config.bg
          )}
        >
          <config.icon className={cn("h-3.5 w-3.5", config.color)} />
        </div>
        {!isLast && (
          <div className="mt-1 w-px flex-1 bg-border" />
        )}
      </div>

      <div className="min-w-0 flex-1 pt-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-on-surface">
            {authorName}
          </span>
          {type === "AI" && (
            <span className="rounded bg-green-500/10 px-1.5 py-0.5 text-[10px] font-medium text-green-400">
              AI Analysis
            </span>
          )}
          <span className="ml-auto text-xs text-on-surface-variant">
            {formatTime(timestamp)}
          </span>
        </div>

        {type === "SYSTEM" && (
          <p className="mt-1 rounded-lg bg-[#000000] p-3 font-mono text-xs text-green-400">
            {message}
          </p>
        )}

        {type === "AI" && (
          <div className="mt-1 rounded-lg border border-green-500/20 bg-green-500/5 p-3">
            <p className="text-sm text-green-300">{message}</p>
          </div>
        )}

        {type === "USER" && (
          <p className="mt-1 text-sm text-on-surface-variant">{message}</p>
        )}
      </div>
    </div>
  );
}
