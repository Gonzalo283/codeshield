// Structured logger — JSON output in production, readable in dev.
// Replace console.log calls with log.info/warn/error for observability.
// Easy to swap for Sentry/Datadog/LogRocket later.

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogContext {
  [key: string]: unknown;
}

const IS_PROD = process.env.NODE_ENV === "production";

function write(level: LogLevel, message: string, context?: LogContext) {
  const entry = {
    ts: new Date().toISOString(),
    level,
    message,
    ...(context || {}),
  };

  if (IS_PROD) {
    // Structured JSON (Vercel/Datadog-friendly)
    const line = JSON.stringify(entry);
    if (level === "error") console.error(line);
    else if (level === "warn") console.warn(line);
    else console.log(line);
  } else {
    // Dev: human-readable
    const tag = level.toUpperCase().padEnd(5);
    const ctxStr = context ? ` ${JSON.stringify(context)}` : "";
    const method =
      level === "error" ? console.error : level === "warn" ? console.warn : console.log;
    method(`[${entry.ts}] ${tag} ${message}${ctxStr}`);
  }
}

export const log = {
  debug: (msg: string, ctx?: LogContext) => {
    if (!IS_PROD) write("debug", msg, ctx);
  },
  info: (msg: string, ctx?: LogContext) => write("info", msg, ctx),
  warn: (msg: string, ctx?: LogContext) => write("warn", msg, ctx),
  error: (msg: string, ctx?: LogContext | Error) => {
    if (ctx instanceof Error) {
      write("error", msg, { error: ctx.message, stack: ctx.stack });
    } else {
      write("error", msg, ctx);
    }
  },
};

// Convenience for API routes — logs request with action + outcome
export function logApi(
  method: string,
  path: string,
  action: string,
  context?: LogContext
) {
  log.info(`${method} ${path} — ${action}`, context);
}
