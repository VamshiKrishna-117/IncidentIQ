const LOG_LEVELS = ["debug", "info", "warn", "error"] as const;
type LogLevel = (typeof LOG_LEVELS)[number];

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, unknown>;
}

const MAX_ENTRIES = 100;
const entries: LogEntry[] = [];

function log(level: LogLevel, message: string, context?: Record<string, unknown>) {
  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    context,
  };
  entries.push(entry);
  if (entries.length > MAX_ENTRIES) entries.shift();

  const prefix = `[IncidentIQ] ${level.toUpperCase()}`;
  if (typeof window === "undefined") {
    const method = level === "error" ? "error" : level === "warn" ? "warn" : "log";
    console[method](prefix, message, context ?? "");
  }
}

export const logger = {
  debug: (msg: string, ctx?: Record<string, unknown>) => log("debug", msg, ctx),
  info: (msg: string, ctx?: Record<string, unknown>) => log("info", msg, ctx),
  warn: (msg: string, ctx?: Record<string, unknown>) => log("warn", msg, ctx),
  error: (msg: string, ctx?: Record<string, unknown>) => log("error", msg, ctx),
  getEntries: () => [...entries],
  clear: () => (entries.length = 0),
};
