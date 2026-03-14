// Built-in tool: glob — file pattern matching

import { z } from "zod";
import path from "path";
import fg from "fast-glob";

import type { ToolDefinition } from "../types";
import { MAX_GLOB_RESULTS, MAX_TOOL_OUTPUT_CHARS } from "@/lib/constants";
import { checkPathSafety, truncateOutput } from "../utils";

const globParams = z.object({
  pattern: z
    .string()
    .describe("Glob pattern to match files (e.g. '**/*.ts', 'src/**/*.tsx')"),
  search_path: z
    .string()
    .optional()
    .describe("Directory to search in (default: workspace root)"),
});

export const globTool: ToolDefinition<z.infer<typeof globParams>> = {
  name: "glob",
  description:
    "Find files matching a glob pattern. Returns file paths relative to the workspace root. Automatically ignores node_modules, .git, dist, and .next directories.",
  riskLevel: "low",
  parameters: globParams,

  async execute(input, ctx) {
    const { pattern, search_path } = input;

    // Resolve search path
    const searchDir = search_path
      ? path.resolve(search_path)
      : path.resolve(ctx.workspaceRoot);

    // Path safety check
    const pathError = checkPathSafety(searchDir, ctx.workspaceRoot);
    if (pathError) {
      return { output: pathError, isError: true };
    }

    let files: string[];
    try {
      files = await fg(pattern, {
        cwd: searchDir,
        absolute: true,
        ignore: ["**/node_modules/**", "**/.git/**", "**/dist/**", "**/.next/**"],
        onlyFiles: true,
        suppressErrors: true,
      });
    } catch (err) {
      return {
        output: `Error matching pattern: ${(err as Error).message}`,
        isError: true,
      };
    }

    if (files.length === 0) {
      return { output: `No files found matching pattern: ${pattern}`, isError: false };
    }

    // Convert to relative paths and limit results
    const relativePaths = files.map((f) => path.relative(ctx.workspaceRoot, f));
    const limited = relativePaths.slice(0, MAX_GLOB_RESULTS);

    let output = limited.join("\n");
    if (relativePaths.length > MAX_GLOB_RESULTS) {
      output += `\n\n(Showing first ${MAX_GLOB_RESULTS} of ${relativePaths.length} matches)`;
    } else {
      output += `\n\n(${relativePaths.length} files found)`;
    }

    return {
      output: truncateOutput(output, MAX_TOOL_OUTPUT_CHARS),
      isError: false,
    };
  },
};
