"use client";

import { Brain, Shield, AlertTriangle, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatTimestamp, stripImageMarkdown } from "@/lib/utils";
import type { AIResult, Incident } from "@/types";

interface AIAnalysisCardProps {
  incident: Incident;
  result?: AIResult;
  onGenerate?: () => void;
  generating?: boolean;
}

export function AIAnalysisCard({ incident, result, onGenerate, generating }: AIAnalysisCardProps) {
  const summary = result?.metadata ? (result.metadata as Record<string, string>) : null;

  return (
    <Card className={result ? "border-green-500/20" : ""}>
      <CardContent className="p-4">
        <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex flex-wrap items-center gap-1.5">
              <span className="font-mono text-xs text-on-surface-variant">{incident.display_id}</span>
              <Badge variant={incident.priority}>{incident.priority}</Badge>
              <Badge variant={incident.status}>{incident.status}</Badge>
            </div>
            <h3 className="truncate text-sm font-semibold text-on-surface">{incident.title}</h3>
          </div>
          {onGenerate && !result && (
            <button
              onClick={onGenerate}
              disabled={generating}
              className="min-h-[44px] sm:min-h-[36px] flex items-center gap-1 rounded-lg bg-green-500/10 px-3 sm:px-2.5 text-xs font-medium text-green-400 hover:bg-green-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
            >
              <Brain className="h-3.5 w-3.5" />
              {generating ? "Analyzing..." : "Analyze"}
            </button>
          )}
          {result && (
            <div className="flex items-center gap-1 shrink-0 min-h-[36px]">
              <Shield className="h-3.5 w-3.5 text-green-400" />
              <span className="text-xs font-medium text-green-400">{result.confidence ?? "?"}%</span>
            </div>
          )}
        </div>

        {summary?.root_cause ? (
          <p className="mb-3 break-words text-xs text-on-surface-variant leading-relaxed">
            {stripImageMarkdown(summary.root_cause)}
          </p>
        ) : result ? (
          <p className="mb-3 break-words text-xs text-on-surface-variant">{stripImageMarkdown(result.result_text)}</p>
        ) : (
          <p className="mb-3 text-xs text-on-surface-variant italic">
            No AI analysis yet. Click "Analyze" to generate.
          </p>
        )}

        {summary?.recommended_action && (
          <div className="mb-2 flex items-start gap-2 rounded-lg bg-green-500/5 p-2">
            <TerminalSmall className="mt-0.5 h-3.5 w-3.5 shrink-0 text-green-400" />
            <p className="min-w-0 break-words text-xs text-green-300 leading-relaxed">
              {stripImageMarkdown(summary.recommended_action)}
            </p>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 pt-2 border-t border-border">
          <div className="flex items-center gap-1 text-[10px] text-on-surface-variant">
            <Clock className="h-3 w-3 shrink-0" />
            <span className="break-words">{result ? formatTimestamp(result.created_at) : "Not yet analyzed"}</span>
          </div>
          {summary?.blast_radius && (
            <div className="flex items-center gap-1 text-[10px] text-yellow-400">
              <AlertTriangle className="h-3 w-3 shrink-0" />
              <span className="break-words">{summary.blast_radius}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function TerminalSmall(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="4 17 10 11 4 5" /><line x1="12" y1="19" x2="20" y2="19" />
    </svg>
  );
}
