// Agent context — builds messages array (history + system prompt) for LLM calls

// 上下文构建

import type { LLMMessage } from "../provider/base";

import { MESSAGE_ROLE } from "@/lib/constants";

export function buildContext(
  history: LLMMessage[],
  userMessage: string,
): LLMMessage[] {
  return [
    ...history,
    {
      role: MESSAGE_ROLE.USER,
      content: [{ type: "text", text: userMessage }],
    },
  ];
}
