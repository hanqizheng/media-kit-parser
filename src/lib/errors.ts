export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 500,
    public readonly recoverable: boolean = false
  ) {
    super(message);
    this.name = "AppError";
  }
}

// LLM provider errors
export class ProviderError extends AppError {
  constructor(message: string, code = "PROVIDER_ERROR", statusCode = 502, recoverable = false) {
    super(message, code, statusCode, recoverable);
    this.name = "ProviderError";
  }
}

export class RateLimitError extends ProviderError {
  constructor(message = "Rate limit exceeded") {
    super(message, "RATE_LIMIT", 502, true);
    this.name = "RateLimitError";
  }
}

export class AuthError extends ProviderError {
  constructor(message = "Authentication failed") {
    super(message, "AUTH_ERROR", 401, false);
    this.name = "AuthError";
  }
}

// Tool execution errors
export class ToolExecutionError extends AppError {
  constructor(
    public readonly toolName: string,
    message: string,
    recoverable = true
  ) {
    super(message, "TOOL_ERROR", 500, recoverable);
    this.name = "ToolExecutionError";
  }
}

export class PermissionDeniedError extends AppError {
  constructor(message: string) {
    super(message, "PERMISSION_DENIED", 403, false);
    this.name = "PermissionDeniedError";
  }
}

// Session errors
export class SessionNotFoundError extends AppError {
  constructor(sessionId: string) {
    super(`Session not found: ${sessionId}`, "SESSION_NOT_FOUND", 404, false);
    this.name = "SessionNotFoundError";
  }
}

export class SessionBusyError extends AppError {
  constructor(sessionId: string) {
    super(`Session is busy: ${sessionId}`, "SESSION_BUSY", 409, false);
    this.name = "SessionBusyError";
  }
}

// Agent loop errors
export class MaxTurnsExceededError extends AppError {
  constructor(maxTurns: number) {
    super(`Max turns exceeded: ${maxTurns}`, "MAX_TURNS_EXCEEDED", 500, false);
    this.name = "MaxTurnsExceededError";
  }
}

export class DoomLoopError extends AppError {
  constructor() {
    super("Doom loop detected: repeated identical tool calls", "DOOM_LOOP", 500, false);
    this.name = "DoomLoopError";
  }
}

export function isRetryable(error: unknown): boolean {
  if (error instanceof AppError) {
    return error.recoverable;
  }
  return false;
}
