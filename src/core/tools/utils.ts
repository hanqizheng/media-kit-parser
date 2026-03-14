// Shared tool utilities

import path from "path";

/**
 * Path safety check — ensure resolved path is within workspace root.
 * Returns null if safe, or an error message string if not.
 */
export function checkPathSafety(
  filePath: string,
  workspaceRoot: string,
): string | null {
  const resolved = path.resolve(filePath);
  const root = path.resolve(workspaceRoot);

  if (!resolved.startsWith(root + path.sep) && resolved !== root) {
    return `Error: path "${filePath}" is outside workspace root "${workspaceRoot}"`;
  }

  return null;
}

/** Truncate output to MAX_TOOL_OUTPUT_CHARS */
export function truncateOutput(output: string, maxChars: number): string {
  if (output.length > maxChars) {
    return output.slice(0, maxChars) + "\n... [truncated]";
  }
  return output;
}
