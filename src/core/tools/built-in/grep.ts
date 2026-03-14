// Built-in tool: grep — content search using regex patterns

import { z } from "zod";
import path from "path";
import fs from "fs/promises";
import fg from "fast-glob";

import type { ToolDefinition } from "../types";
import {
  MAX_TOOL_OUTPUT_CHARS,
  MAX_GREP_MATCHES,
} from "@/lib/constants";
import { checkPathSafety, truncateOutput } from "../utils";

const grepParams = z.object({
  pattern: z.string().describe("Regex pattern to search for in file contents"),
  search_path: z
    .string()
    .optional()
    .describe("Directory or file to search in (default: workspace root)"),
  include: z
    .string()
    .optional()
    .describe("Glob pattern to filter files (e.g. '*.ts', '*.{js,jsx}')"),
});

export const grepTool: ToolDefinition<z.infer<typeof grepParams>> = {
  name: "grep",
  description:
    "Search file contents using a regex pattern. Returns matching lines with file path and line numbers. Searches recursively within the workspace.",
  riskLevel: "low",
  parameters: grepParams,

  async execute(input, ctx) {
    const { pattern, search_path, include } = input;

    // Resolve search path
    const searchDir = search_path
      ? path.resolve(search_path)
      : path.resolve(ctx.workspaceRoot);

    // Path safety check
    const pathError = checkPathSafety(searchDir, ctx.workspaceRoot);
    if (pathError) {
      return { output: pathError, isError: true };
    }

    // Validate regex
    let regex: RegExp;
    try {
      regex = new RegExp(pattern);
    } catch {
      return {
        output: `Error: invalid regex pattern: ${pattern}`,
        isError: true,
      };
    }

    // Find files using fast-glob
    const globPattern = include ?? "**/*";
    let files: string[];
    try {
      files = await fg(globPattern, {
        cwd: searchDir,
        absolute: true,
        ignore: ["**/node_modules/**", "**/.git/**", "**/dist/**", "**/.next/**"],
        onlyFiles: true,
        suppressErrors: true,
      });
    } catch (err) {
      return {
        output: `Error finding files: ${(err as Error).message}`,
        isError: true,
      };
    }

    // Search each file
    const matches: string[] = [];
    let matchCount = 0;

    for (const filePath of files) {
      if (matchCount >= MAX_GREP_MATCHES) break;

      let content: string;
      try {
        content = await fs.readFile(filePath, "utf-8");
      } catch {
        continue; // Skip unreadable files (binary, permissions, etc.)
      }

      // Skip binary files
      if (content.includes("\0")) continue;

      const lines = content.split("\n");
      const relativePath = path.relative(ctx.workspaceRoot, filePath);

      for (let i = 0; i < lines.length; i++) {
        if (matchCount >= MAX_GREP_MATCHES) break;

        if (regex.test(lines[i])) {
          matches.push(`${relativePath}:${i + 1}: ${lines[i]}`);
          matchCount++;
        }
      }
    }

    if (matches.length === 0) {
      return { output: `No matches found for pattern: ${pattern}`, isError: false };
    }

    let output = matches.join("\n");
    if (matchCount >= MAX_GREP_MATCHES) {
      output += `\n\n(Showing first ${MAX_GREP_MATCHES} matches, more may exist)`;
    }

    return {
      output: truncateOutput(output, MAX_TOOL_OUTPUT_CHARS),
      isError: false,
    };
  },
};
