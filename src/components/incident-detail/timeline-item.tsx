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

function MessageContent({ text }: { text: string }) {
  const [lightbox, setLightbox] = useState<string | null>(null);
  const nodes: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    const codeIdx = remaining.indexOf("```");
    const imgIdx = remaining.indexOf("![");

    const nextCode = codeIdx === -1 ? Infinity : codeIdx;
    const nextImg = imgIdx === -1 ? Infinity : imgIdx;
    const earliest = Math.min(nextCode, nextImg);

    if (earliest === Infinity) {
      nodes.push(<span key={key++} className="whitespace-pre-wrap">{remaining}</span>);
      break;
    }

    if (earliest > 0) {
      nodes.push(<span key={key++} className="whitespace-pre-wrap">{remaining.slice(0, earliest)}</span>);
    }

    if (earliest === nextCode) {
      const endIdx = remaining.indexOf("```", codeIdx + 3);
      if (endIdx === -1) {
        nodes.push(<span key={key++} className="whitespace-pre-wrap">{remaining.slice(codeIdx)}</span>);
        break;
      }
      const code = remaining.slice(codeIdx + 3, endIdx).replace(/^\n/, "");
      nodes.push(
        <pre key={key++} className="mb-2 h-40 overflow-x-auto overflow-y-auto rounded-lg bg-[#000000] p-3 font-mono text-xs text-green-400 leading-relaxed last:mb-0">
          <code className="block h-full">{code || " "}</code>
        </pre>
      );
      remaining = remaining.slice(endIdx + 3);
    } else {
      const closeParen = remaining.indexOf(")", imgIdx + 2);
      if (closeParen === -1) {
        nodes.push(<span key={key++} className="whitespace-pre-wrap">{remaining.slice(imgIdx)}</span>);
        break;
      }
      const altEnd = remaining.indexOf("](", imgIdx + 2);
      if (altEnd === -1 || altEnd > closeParen) {
        nodes.push(<span key={key++} className="whitespace-pre-wrap">{remaining.slice(imgIdx)}</span>);
        remaining = remaining.slice(imgIdx + 2);
        continue;
      }
      const alt = remaining.slice(imgIdx + 2, altEnd);
      const url = remaining.slice(altEnd + 2, closeParen);
      nodes.push(
        <img key={key++} src={url} alt={alt} loading="lazy" onClick={() => setLightbox(url)} className="inline-block h-24 w-auto max-w-[200px] rounded object-cover cursor-pointer hover:opacity-80 transition-opacity border border-border mb-1 mr-1" />
      );
      remaining = remaining.slice(closeParen + 1);
    }
  }

  return (
    <>
      <div className="flex flex-wrap items-start gap-1">{nodes}</div>
      {lightbox && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={() => setLightbox(null)}>
          <img src={lightbox} alt="enlarged" className="max-h-[90vh] max-w-[90vw] rounded object-contain" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </>
  );
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
            <MessageContent text={message} />
          </div>
        )}

        {type === "AI" && (
          <div className="mt-1 rounded-lg border border-green-500/20 bg-green-500/5 p-3">
            <div className="text-sm text-green-300"><MessageContent text={message} /></div>
          </div>
        )}

        {type === "USER" && (
          <div className="mt-1 text-sm text-on-surface-variant"><MessageContent text={message} /></div>
        )}
      </div>
    </div>
  );
}
