// Agent loop
export const DEFAULT_MAX_TURNS = 25;
export const DOOM_LOOP_THRESHOLD = 4;

// Tool output
export const MAX_TOOL_OUTPUT_CHARS = 30_000;

// File read
export const DEFAULT_READ_LINE_LIMIT = 2000;

// Bash
export const DEFAULT_BASH_TIMEOUT_MS = 120_000;
export const MAX_BASH_TIMEOUT_MS = 600_000;
export const MAX_BASH_OUTPUT_CHARS = 30_000;

// Write
export const MAX_WRITE_CONTENT_CHARS = 100_000;

// Glob
export const MAX_GLOB_RESULTS = 1000;

// Grep
export const MAX_GREP_MATCHES = 500;

// SSE
export const SSE_BATCH_INTERVAL_MS = 16;
export const SSE_HEARTBEAT_INTERVAL_MS = 30_000;

// Retry
export const MAX_RETRY_ATTEMPTS = 3;
export const RETRY_BASE_DELAY_MS = 1_000;

/** chat message role */
export const MESSAGE_ROLE = {
  USER: "user",
  ASSISTANT: "assistant",
  SYSTEM: "system",
} as const;
