import { z } from "zod";

import { LLMToolDefinition } from "../provider/base";
import type { ToolDefinition } from "./types";

export class ToolRegistry {
  /** 所有注册的工具 */
  private tools = new Map<string, ToolDefinition>();

  /** 注册 */
  register(tool: ToolDefinition) {
    if (this.tools.has(tool.name)) {
      throw new Error(`Tool "${tool.name}" is already registered!`);
    }
    this.tools.set(tool.name, tool);
  }

  get(toolName: string) {
    const currentTool = this.tools.get(toolName);

    if (!currentTool) {
      throw new Error(`Tool "${toolName}" doesn't register yet!`);
    }

    return currentTool;
  }

  has(toolName: string) {
    return this.tools.has(toolName);
  }

  list() {
    return Array.from(this.tools.values());
  }

  /** 关键： zod schema -> JSON schema -> LLM api tools 参数 */
  toLLMToolDefinitions(): LLMToolDefinition[] {
    return this.list().map((tool) => ({
      name: tool.name,
      description: tool.description,
      inputSchema: z.toJSONSchema(tool.parameters) as Record<string, unknown>,
    }));
  }
}
