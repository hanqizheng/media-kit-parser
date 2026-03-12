// LangChain format converters — normalize between internal and LangChain message types

import {
  HumanMessage,
  AIMessage,
  ToolMessage,
} from "@langchain/core/messages";
import type { LLMMessage } from "./base";

type LangChainMessage = HumanMessage | AIMessage | ToolMessage;

export function toLangChainMessages(messages: LLMMessage[]): LangChainMessage[] {
  const result: LangChainMessage[] = [];

  for (const msg of messages) {
    if (msg.role === "user") {
      // user 消息里可能混合 text 和 tool_result
      // text → 收集为一条 HumanMessage
      // tool_result → 每个拆成独立的 ToolMessage
      const textParts: string[] = [];

      for (const block of msg.content) {
        if (block.type === "text") {
          textParts.push(block.text);
        } else if (block.type === "tool_result") {
          // 如果前面积攒了文本，先创建 HumanMessage
          if (textParts.length > 0) {
            result.push(new HumanMessage(textParts.join("\n")));
            textParts.length = 0;
          }
          result.push(
            new ToolMessage({
              content: block.content,
              tool_call_id: block.toolCallId,
              status: block.isError ? "error" : "success",
            })
          );
        }
      }

      // 处理剩余的文本
      if (textParts.length > 0) {
        result.push(new HumanMessage(textParts.join("\n")));
      }
    } else if (msg.role === "assistant") {
      // assistant 消息里可能有 text、reasoning、tool_use
      const contentParts: string[] = [];
      const toolCalls: { id: string; name: string; args: Record<string, unknown> }[] = [];

      for (const block of msg.content) {
        if (block.type === "text") {
          contentParts.push(block.text);
        } else if (block.type === "reasoning") {
          // reasoning 不传给 LangChain，它是展示给用户的，不参与消息历史
          // LangChain 的 AIMessage 没有 reasoning 字段
        } else if (block.type === "tool_use") {
          toolCalls.push({
            id: block.id,
            name: block.name,
            args: block.input,
          });
        }
      }

      result.push(
        new AIMessage({
          content: contentParts.join("\n"),
          tool_calls: toolCalls.length > 0 ? toolCalls : undefined,
        })
      );
    }
  }

  return result;
}
