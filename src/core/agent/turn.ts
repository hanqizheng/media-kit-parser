// Turn execution — single LLM call + tool parsing within one loop iteration

/**
 * Turn 负责一次 LLM 调用，是 loop 的最小执行单元。它做三件事
 * 1. 调用 provider.stream() 获取流
 * 2. 消费流中的每个 chunk，通过 EventEmitter 发射事件
 * 3. 收集完整的 assistant 响应，返回给 loop
 */

import { MESSAGE_ROLE } from "@/lib/constants";
import { LLMContentBlock } from "../provider/base";
import type { TurnParams, TurnResult } from "./types";

import { genMessageId } from "@/lib/id";

export async function executeTurn(params: TurnParams): Promise<TurnResult> {
  const { emitter, provider, streamParams } = params;
  const msgId = genMessageId();

  // 开始 turn，先 emit 一次消息
  emitter.emit({ type: "message.start", messageId: msgId, role: "assistant" });

  const contentBlocks: LLMContentBlock[] = [];
  let currentText = "";
  const partIndex = 0;

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
        // TODO: 这一次实现暂时不设计
        break;
      case "usage":
        // TODO: 这一次实现暂时不设计
        break;
    }
  }

  if (currentText.length > 0) {
    emitter.emit({
      type: "message.text.done",
      messageId: msgId,
      partIndex,
    });
    contentBlocks.push({ type: "text", text: currentText });
  }

  // 本轮 turn 结束
  emitter.emit({ type: "message.end", messageId: msgId });

  return {
    assistantMessage: {
      role: MESSAGE_ROLE.ASSISTANT,
      content: contentBlocks,
    },
    hasToolCalls: false, // TODO: 这一次实现暂时不设计
  };
}
