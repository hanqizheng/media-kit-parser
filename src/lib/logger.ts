type LogLevel = "debug" | "info" | "warn" | "error";

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

function getMinLevel(): LogLevel {
  const env = process.env.LOG_LEVEL as LogLevel | undefined;
  if (env && env in LOG_LEVELS) return env;
  return process.env.NODE_ENV === "production" ? "info" : "debug";
}

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[getMinLevel()];
}

function formatMessage(level: LogLevel, context: string, message: string, data?: unknown): string {
  const timestamp = new Date().toISOString();
  const base = `[${timestamp}] ${level.toUpperCase()} [${context}] ${message}`;
  if (data !== undefined) {
    return `${base} ${JSON.stringify(data)}`;
  }
  return base;
}

export function createLogger(context: string) {
  return {
    debug(message: string, data?: unknown) {
      if (shouldLog("debug")) console.debug(formatMessage("debug", context, message, data));
    },
    info(message: string, data?: unknown) {
      if (shouldLog("info")) console.info(formatMessage("info", context, message, data));
    },
    warn(message: string, data?: unknown) {
      if (shouldLog("warn")) console.warn(formatMessage("warn", context, message, data));
    },
    error(message: string, data?: unknown) {
      if (shouldLog("error")) console.error(formatMessage("error", context, message, data));
    },
  };
}
