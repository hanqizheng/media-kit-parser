// Built-in tool: write — file creation/overwrite with parent dir auto-creation

import { z } from "zod";
import path from "path";
import fs from "fs/promises";

import type { ToolDefinition } from "../types";
import { MAX_WRITE_CONTENT_CHARS } from "@/lib/constants";
import { checkPathSafety } from "../utils";

const writeParams = z.object({
  file_path: z.string().describe("Absolute path to the file to write"),
  content: z.string().describe("The content to write to the file"),
});

export const writeTool: ToolDefinition<z.infer<typeof writeParams>> = {
  name: "write",
  description:
    "Write content to a file. Creates the file if it does not exist, overwrites if it does. Automatically creates parent directories as needed.",
  riskLevel: "medium",
  parameters: writeParams,

  async execute(input, ctx) {
    const { file_path, content } = input;

    // Path safety check
    const pathError = checkPathSafety(file_path, ctx.workspaceRoot);
    if (pathError) {
      return { output: pathError, isError: true };
    }

    // Content size limit
    if (content.length > MAX_WRITE_CONTENT_CHARS) {
      return {
        output: `Error: content too large (${content.length} chars, max ${MAX_WRITE_CONTENT_CHARS})`,
        isError: true,
      };
    }

    const resolved = path.resolve(file_path);

    try {
      // Auto-create parent directories
      await fs.mkdir(path.dirname(resolved), { recursive: true });
      await fs.writeFile(resolved, content, "utf-8");
    } catch (err) {
      return {
        output: `Error writing file: ${(err as Error).message}`,
        isError: true,
      };
    }

    const lineCount = content.split("\n").length;
    return {
      output: `Successfully wrote ${lineCount} lines to ${file_path}`,
      isError: false,
    };
  },
};
