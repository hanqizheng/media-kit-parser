// Built-in tool: edit — precise string replacement in files

import { z } from "zod";
import path from "path";
import fs from "fs/promises";

import type { ToolDefinition } from "../types";
import { checkPathSafety } from "../utils";

const editParams = z.object({
  file_path: z.string().describe("Absolute path to the file to edit"),
  old_string: z.string().describe("The exact string to find and replace"),
  new_string: z.string().describe("The replacement string"),
  replace_all: z
    .boolean()
    .optional()
    .describe("Replace all occurrences (default false, errors if multiple matches found)"),
});

export const editTool: ToolDefinition<z.infer<typeof editParams>> = {
  name: "edit",
  description:
    "Replace an exact string in a file. By default errors if the string appears more than once — pass replace_all=true to replace all occurrences. The old_string must match exactly (including whitespace and indentation).",
  riskLevel: "medium",
  parameters: editParams,

  async execute(input, ctx) {
    const { file_path, old_string, new_string, replace_all = false } = input;

    // Path safety check
    const pathError = checkPathSafety(file_path, ctx.workspaceRoot);
    if (pathError) {
      return { output: pathError, isError: true };
    }

    if (old_string === new_string) {
      return {
        output: "Error: old_string and new_string are identical",
        isError: true,
      };
    }

    const resolved = path.resolve(file_path);

    // Read existing file
    let content: string;
    try {
      content = await fs.readFile(resolved, "utf-8");
    } catch (err) {
      const code = (err as NodeJS.ErrnoException).code;
      if (code === "ENOENT") {
        return {
          output: `Error: file not found: ${file_path}`,
          isError: true,
        };
      }
      return {
        output: `Error reading file: ${(err as Error).message}`,
        isError: true,
      };
    }

    // Count occurrences
    let count = 0;
    let searchFrom = 0;
    while (true) {
      const idx = content.indexOf(old_string, searchFrom);
      if (idx === -1) break;
      count++;
      searchFrom = idx + old_string.length;
    }

    if (count === 0) {
      return {
        output: `Error: old_string not found in ${file_path}`,
        isError: true,
      };
    }

    if (count > 1 && !replace_all) {
      return {
        output: `Error: old_string found ${count} times in ${file_path}. Use replace_all=true to replace all, or provide more context to make the match unique.`,
        isError: true,
      };
    }

    // Perform replacement
    let updated: string;
    if (replace_all) {
      updated = content.split(old_string).join(new_string);
    } else {
      // Replace only the first occurrence
      const idx = content.indexOf(old_string);
      updated =
        content.slice(0, idx) + new_string + content.slice(idx + old_string.length);
    }

    try {
      await fs.writeFile(resolved, updated, "utf-8");
    } catch (err) {
      return {
        output: `Error writing file: ${(err as Error).message}`,
        isError: true,
      };
    }

    return {
      output: `Successfully replaced ${replace_all ? count : 1} occurrence(s) in ${file_path}`,
      isError: false,
    };
  },
};
