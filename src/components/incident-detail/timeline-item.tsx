import { cn } from "@/lib/utils";
import { formatTime } from "@/lib/utils";
import { User, Cpu, Brain, Trash2 } from "lucide-react";
import { useState } from "react";

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
  onDelete?: () => void;
}

function renderMessage(text: string) {
  const nodes: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    const startIdx = remaining.indexOf("```");
    if (startIdx === -1) {
      nodes.push(<span key={key++} className="whitespace-pre-wrap">{remaining}</span>);
      break;
    }

    if (startIdx > 0) {
      nodes.push(<span key={key++} className="whitespace-pre-wrap">{remaining.slice(0, startIdx)}</span>);
    }

    const endIdx = remaining.indexOf("```", startIdx + 3);
    if (endIdx === -1) {
      nodes.push(<span key={key++} className="whitespace-pre-wrap">{remaining.slice(startIdx)}</span>);
      break;
    }

    const code = remaining.slice(startIdx + 3, endIdx).replace(/^\n/, "");
    nodes.push(
      <pre key={key++} className="mb-2 h-40 overflow-x-auto overflow-y-auto rounded-lg bg-[#000000] p-3 font-mono text-xs text-green-400 leading-relaxed last:mb-0">
        <code className="block h-full">{code || " "}</code>
      </pre>
    );

    remaining = remaining.slice(endIdx + 3);
  }

  return nodes.length > 0 ? nodes : <span className="whitespace-pre-wrap">{text}</span>;
}

export function TimelineItem({ message, authorName, timestamp, type, isFirst, isLast, onDelete }: TimelineItemProps) {
  const [deleting, setDeleting] = useState(false);
  const config = typeConfig[type] ?? typeConfig.USER;

  return (
    <div className="relative flex gap-4 pb-6 group">
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
          {onDelete && (
            deleting ? (
              <div className="flex items-center gap-1">
                <button onClick={() => { onDelete(); setDeleting(false); }} className="rounded px-1.5 py-0.5 text-[10px] font-medium text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer">Confirm</button>
                <button onClick={() => setDeleting(false)} className="rounded px-1.5 py-0.5 text-[10px] font-medium text-on-surface-variant hover:bg-white/5 transition-colors cursor-pointer">Cancel</button>
              </div>
            ) : (
              <button onClick={() => setDeleting(true)} className="opacity-0 group-hover:opacity-100 rounded p-1 text-on-surface-variant hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer" title="Delete update">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )
          )}
        </div>

        {type === "SYSTEM" && (
          <div className="mt-1 rounded-lg bg-[#000000] p-3 font-mono text-xs text-green-400">
            {renderMessage(message)}
          </div>
        )}

        {type === "AI" && (
          <div className="mt-1 rounded-lg border border-green-500/20 bg-green-500/5 p-3">
            <div className="text-sm text-green-300">{renderMessage(message)}</div>
          </div>
        )}

        {type === "USER" && (
          <div className="mt-1 text-sm text-on-surface-variant">{renderMessage(message)}</div>
        )}
      </div>
    </div>
  );
}
