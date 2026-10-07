import { appConfig, type LogLevel } from "@global/config/config";

type LogFields = Record<string, unknown>;

const LEVEL_WEIGHT: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
  silent: 100,
};

const SENSITIVE_KEY = /password|token|authorization|cookie|session.?id|secret/i;

function sanitize(value: unknown, key = "", depth = 0): unknown {
  if (SENSITIVE_KEY.test(key)) return "[REDACTED]";
  if (depth > 3) return "[TRUNCATED]";

  if (value instanceof Error) {
    return {
      name: value.name,
      message: value.message,
      cause:
        value.cause === undefined
          ? undefined
          : sanitize(value.cause, "cause", depth + 1),
    };
  }

  if (Array.isArray(value)) {
    return value.slice(0, 20).map((item) => sanitize(item, "", depth + 1));
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(
        ([childKey, childValue]) => [
          childKey,
          sanitize(childValue, childKey, depth + 1),
        ],
      ),
    );
  }

  return value;
}

function isLogLevelEnabled(level: LogLevel): boolean {
  return LEVEL_WEIGHT[level] >= LEVEL_WEIGHT[appConfig.logger.level];
}

function writeLog(
  level: Exclude<LogLevel, "silent">,
  event: string,
  fields?: LogFields,
): void {
  if (!isLogLevelEnabled(level)) return;

  const payload = fields ? sanitize(fields) : undefined;
  const prefix = `[EIF] ${event}`;

  if (level === "error") console.error(prefix, payload ?? "");
  else if (level === "warn") console.warn(prefix, payload ?? "");
  else if (level === "debug") console.debug(prefix, payload ?? "");
  else console.info(prefix, payload ?? "");
}

export const logger = {
  debug: (event: string, fields?: LogFields) =>
    writeLog("debug", event, fields),
  info: (event: string, fields?: LogFields) => writeLog("info", event, fields),
  warn: (event: string, fields?: LogFields) => writeLog("warn", event, fields),
  error: (event: string, fields?: LogFields) =>
    writeLog("error", event, fields),
} as const;
