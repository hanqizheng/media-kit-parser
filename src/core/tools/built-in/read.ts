import { z } from "zod";
import path from "path";
import fs from "fs/promises";

import { ToolDefinition } from "../types";
import {
  DEFAULT_READ_LINE_LIMIT,
  MAX_TOOL_OUTPUT_CHARS,
} from "@/lib/constants";

const readParams = z.object({
  file_path: z.string().describe("Absolute path to the file to read"),
  offset: z
    .number()
    .optional()
    .describe("Line number to start reading from (1-based, default 1)"),
  limit: z
    .number()
    .optional()
    .describe("Number of lines to read (default 2000)"),
});

export const readTool: ToolDefinition<z.infer<typeof readParams>> = {
  name: "read",
  description:
    "Read file contents with line numbers. Supports offset and limit for partial reading.",
  riskLevel: "low",
  parameters: readParams,

  async execute(input, ctx) {
    const { file_path, offset = 1, limit = DEFAULT_READ_LINE_LIMIT } = input;

    // 路径安全检查：解析绝对路径，确保不超出 workspaceRoot
    const resolved = path.resolve(file_path);
    const workspaceRoot = path.resolve(ctx.workspaceRoot);

    if (
      !resolved.startsWith(workspaceRoot + path.sep) &&
      resolved !== workspaceRoot
    ) {
      return {
        output: `Error: path "${file_path}" is outside workspace root "${ctx.workspaceRoot}"`,
        isError: true,
      };
    }

    // 读取文件
    let raw: string;
    try {
      raw = await fs.readFile(resolved, "utf-8");
    } catch (err) {
      const code = (err as NodeJS.ErrnoException).code;
      if (code === "ENOENT") {
        return {
          output: `Error reading file: file not found: ${file_path}`,
          isError: true,
        };
      }

      if (code === "EISDIR") {
        return {
          output: `Error reading file: ${file_path} is a directory, not a file`,
          isError: true,
        };
      }

      return {
        output: `Error reading file: ${(err as Error).message}`,
        isError: true,
      };
    }

    // 简单的二进制检测（包含 null byte）
    if (raw.includes("\0")) {
      return {
        output: `Error: "${file_path}" appears to be a binary file`,
        isError: true,
      };
    }

    // 按 offset/limit 截取行，添加行号（cat -n 格式）
    const lines = raw.split("\n");
    const startIndex = Math.max(0, offset - 1); // 转 0-based
    const selected = lines.slice(startIndex, startIndex + limit);

    const numbered = selected.map((line, i) => {
      const lineNum = startIndex + i + 1; // 回到 1-based
      return `${String(lineNum).padStart(6, " ")}\t${line}`;
    });

    let output = numbered.join("\n");

    // 超长截断
    if (output.length > MAX_TOOL_OUTPUT_CHARS) {
      output = output.slice(0, MAX_TOOL_OUTPUT_CHARS) + "\n... [truncated]";
    }

    // 提示是否有更多内容
    const totalLines = lines.length;
    const endLine = startIndex + selected.length;
    if (endLine < totalLines) {
      output += `\n\n(Showing lines ${offset}-${endLine} of ${totalLines} total)`;
    }

    return { output, isError: false };
  },
};
