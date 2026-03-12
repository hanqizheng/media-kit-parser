// LLMProvider interface — abstract contract for all LLM providers

/**
 * 定义 LLM Provider 的统一契约。不管底层是 Anthropic 还是 Moonshot，对上层（Agent Loop）暴露的接口都一样
 *
 * 先想清楚 Agent Loop 需要从 Provider 拿到什么：
 *  1. 传入：消息历史、system prompt、tool 定义、模型配置
 *  2. 拿回：一个异步可迭代的流，逐块吐出 LLM 的响应
 */

import type { MessageRole } from "@/lib/types";

/**
 * 输入
 */
export type LLMContentBlock =
  | { type: "text"; text: string }
  | { type: "reasoning"; text: string }
  | {
      type: "tool_use";
      id: string;
      name: string;
      input: Record<string, unknown>;
    }
  | {
      type: "tool_result";
      toolCallId: string;
      content: string;
      isError?: boolean;
    };

export interface LLMMessage {
  role: MessageRole;
  // LLM 的一次响应不是纯文本，而是由多个"内容块"组成的
  content: LLMContentBlock[];
}

export interface LLMToolDefinition {
  name: string;
  description: string;
  // JSON
  inputSchema: Record<string, unknown>;
}

export interface LLMStreamParams {
  messages: LLMMessage[];
  systemPrompt: string;
  tools?: LLMToolDefinition[];
  temperature?: number;
  maxTokens?: number;
}

/**
 * 输出
 * */
export type LLMStreamChunk =
  | {
      /** 小段文本片段，比如"你好" */
      type: "text_delta";
      text: string;
    }
  | {
      /** 小段思维链片段 */
      type: "reasoning_delta";
      text: string;
    }
  | {
      /** LLM 决定调用某个 tool（这个不是流式的，LLM 完整返回一个 tool 调用） */
      type: "tool_use";
      id: string;
      name: string;
      input: Record<string, unknown>;
    }
  | {
      /** token 使用量统计，流结束时吐出一次，用于成本监控 */
      type: "usage";
      inputTokens: number;
      outputTokens: number;
    };

export interface LLMProvider {
  /** provider 标识符，比如 "anthropic"、"moonshot" */
  name: string;
  /** 接收参数，返回一个异步可迭代对象。Agent Loop 用 for await (const chunk of stream) 逐块消费 */
  stream(params: LLMStreamParams): Promise<AsyncIterable<LLMStreamChunk>>;
}
