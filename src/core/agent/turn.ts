// Turn execution — single LLM call + tool parsing within one loop iteration

/**
 * Turn 负责一次 LLM 调用，是 loop 的最小执行单元。它做三件事
 * 1. 调用 provider.stream() 获取流
 * 2. 消费流中的每个 chunk，通过 EventEmitter 发射事件
 * 3. 收集完整的 assistant 响应，返回给 loop
 */

import { MESSAGE_ROLE } from "@/lib/constants";
import { LLMContentBlock } from "../provider/base";
import type { TurnParams, TurnResult, PendingToolCall } from "./types";

import { genMessageId } from "@/lib/id";
import { TOOL_END_STATE } from "../events/constants";

export async function executeTurn(params: TurnParams): Promise<TurnResult> {
  const { emitter, provider, streamParams, toolRegistry, toolContext } = params;
  const msgId = genMessageId();

  // 开始 turn，先 emit 一次消息
  emitter.emit({ type: "message.start", messageId: msgId, role: "assistant" });

  const contentBlocks: LLMContentBlock[] = [];
  const pendingToolCalls: PendingToolCall[] = [];
  let currentText = "";
  let partIndex = 0;

  // === Phase 1: 消费 LLM stream ===

  const stream = await provider.stream(streamParams);

  for await (const chunk of stream) {
    switch (chunk.type) {
      case "text_delta":
        currentText += chunk.text;
        emitter.emit({
          type: "message.text.delta",
          messageId: msgId,
          partIndex,
          text: chunk.text,
        });
        break;
      case "reasoning_delta":
        emitter.emit({
          type: "message.reasoning.delta",
          messageId: msgId,
          partIndex,
          content: chunk.text,
        });
        break;
      case "tool_use":
        // 先把积累的文本 flush 成一个 content block
        if (currentText.length > 0) {
          emitter.emit({
            type: "message.text.done",
            messageId: msgId,
            partIndex,
          });

          contentBlocks.push({
            type: "tool_use",
            id: chunk.id,
            name: chunk.name,
            input: chunk.input,
          });

          partIndex++;

          pendingToolCalls.push({
            id: chunk.id,
            name: chunk.name,
            input: chunk.input,
          });
        }
        break;
      case "usage":
        // TODO: 这一次实现暂时不设计
        break;
    }
  }

  // flush 剩余文本
  // text flush 逻辑：当收到 tool_use chunk 时，先把之前积累的 text 封装成 block，因为 LLM 可能先说 "让我读一下文件" 再调用 tool
  if (currentText.length > 0) {
    emitter.emit({
      type: "message.text.done",
      messageId: msgId,
      partIndex,
    });
    contentBlocks.push({ type: "text", text: currentText });
  }

  // === Phase 2: 执行 tool 调用 ===

  const toolResultBlocks: LLMContentBlock[] = [];

  if (pendingToolCalls.length > 0 && toolRegistry && toolContext) {
    for (const toolCall of pendingToolCalls) {
      emitter.emit({
        type: "message.tool.start",
        messageId: msgId,
        toolCallId: toolCall.id,
        toolName: toolCall.name,
        input: toolCall.input,
      });

      emitter.emit({
        type: "message.tool.running",
        toolCallId: toolCall.id,
      });

      const startTime = Date.now();
      let output: string;
      let isError = false;

      try {
        const tool = toolRegistry.get(toolCall.name);
        const parsed = tool.parameters.parse(toolCall.input);
        const result = await tool.execute(parsed, toolContext);
        output = result.output;
        isError = result.isError;
      } catch {
        output = `Error executing tool ${toolCall.name}`;
        isError = true;
      }

      emitter.emit({
        type: "message.tool.end",
        toolCallId: toolCall.id,
        output,
        error: isError ? output : undefined,
        durationMs: Date.now() - startTime,
        state: isError ? TOOL_END_STATE.ERROR : TOOL_END_STATE.COMPLETE,
      });

      toolResultBlocks.push({
        type: "tool_result",
        toolCallId: toolCall.id,
        content: output,
        isError,
      });
    }
  }

  // 本轮 turn 结束
  emitter.emit({ type: "message.end", messageId: msgId });

  return {
    assistantMessage: {
      role: MESSAGE_ROLE.ASSISTANT,
      content: contentBlocks,
    },
    hasToolCalls: pendingToolCalls.length > 0,
    toolResultMessage:
      pendingToolCalls.length > 0
        ? { role: MESSAGE_ROLE.USER, content: toolResultBlocks }
        : undefined,
  };
}
