// Built-in tool: bash — shell command execution with timeout and output truncation

import { z } from "zod";
import { exec } from "child_process";

import type { ToolDefinition } from "../types";
import {
  DEFAULT_BASH_TIMEOUT_MS,
  MAX_BASH_TIMEOUT_MS,
  MAX_TOOL_OUTPUT_CHARS,
} from "@/lib/constants";
import { truncateOutput } from "../utils";

const bashParams = z.object({
  command: z.string().describe("The shell command to execute"),
  timeout: z
    .number()
    .optional()
    .describe(
      `Timeout in milliseconds (default ${DEFAULT_BASH_TIMEOUT_MS}, max ${MAX_BASH_TIMEOUT_MS})`,
    ),
});

export const bashTool: ToolDefinition<z.infer<typeof bashParams>> = {
  name: "bash",
  description:
    "Execute a shell command and return its output (stdout + stderr). Commands run in the workspace root directory. Use timeout parameter for long-running commands.",
  riskLevel: "high",
  parameters: bashParams,

  async execute(input, ctx) {
    const { command, timeout: rawTimeout } = input;

    // Clamp timeout
    const timeout = Math.min(rawTimeout ?? DEFAULT_BASH_TIMEOUT_MS, MAX_BASH_TIMEOUT_MS);

    return new Promise((resolve) => {
      const child = exec(
        command,
        {
          cwd: ctx.workspaceRoot,
          timeout,
          maxBuffer: 10 * 1024 * 1024, // 10MB buffer
          env: { ...process.env, TERM: "dumb" }, // Disable interactive terminal features
        },
        (error, stdout, stderr) => {
          // Combine stdout and stderr
          let output = "";
          if (stdout) output += stdout;
          if (stderr) {
            if (output) output += "\n--- stderr ---\n";
            output += stderr;
          }

          // Handle timeout / killed
          if (error && error.killed) {
            output += `\n[Process killed: timeout after ${timeout}ms]`;
            resolve({
              output: truncateOutput(output, MAX_TOOL_OUTPUT_CHARS),
              isError: true,
            });
            return;
          }

          // Handle non-zero exit code (not necessarily an "error" for LLM)
          if (error && !error.killed) {
            if (!output) {
              output = error.message;
            }
            output += `\n[Exit code: ${error.code ?? "unknown"}]`;
          }

          if (!output) {
            output = "(no output)";
          }

          resolve({
            output: truncateOutput(output, MAX_TOOL_OUTPUT_CHARS),
            isError: false,
          });
        },
      );

      // Wire up abort signal to kill the process tree
      if (ctx.signal) {
        const onAbort = () => {
          child.kill("SIGTERM");
          // Follow up with SIGKILL if still alive after 1s
          setTimeout(() => child.kill("SIGKILL"), 1000);
        };
        if (ctx.signal.aborted) {
          onAbort();
        } else {
          ctx.signal.addEventListener("abort", onAbort, { once: true });
        }
      }
    });
  },
};
