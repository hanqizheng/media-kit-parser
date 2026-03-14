// Moonshot provider — Kimi via OpenAI-compatible API

import { ChatOpenAI } from "@langchain/openai";
import type { AIMessageChunk } from "@langchain/core/messages";
import type {
  LLMProvider,
  LLMStreamParams,
  LLMStreamChunk,
  LLMToolDefinition,
} from "./base";
import { toLangChainMessages } from "./converters";

interface MoonshotProviderOptions {
  apiKey: string;
  baseURL?: string;
  model?: string;
}

export function createMoonshotProvider(
  options: MoonshotProviderOptions,
): LLMProvider {
  const {
    apiKey,
    baseURL = "https://api.moonshot.cn/v1",
    model: defaultModel = "kimi-k2-0711-preview",
  } = options;

  return {
    name: "moonshot",

    async stream(
      params: LLMStreamParams,
    ): Promise<AsyncIterable<LLMStreamChunk>> {
      const { messages, tools, temperature, maxTokens } = params;

      const llm = new ChatOpenAI({
        apiKey,
        configuration: { baseURL },
        model: defaultModel,
        maxTokens: maxTokens ?? 4096,
        temperature: temperature ?? 0,
        streaming: true,
        streamUsage: true,
      });

      // system prompt 作为第一条消息注入
      const langChainMessages = toLangChainMessages(messages);

      // 绑定 tools（如果有）
      const llmWithTools =
        tools && tools.length > 0
          ? llm.bindTools(tools.map(toLangChainTool))
          : llm;

      const stream = await llmWithTools.stream(langChainMessages);

      return transformStream(stream);
    },
  };
}

/** 将我们的 LLMToolDefinition 转成 LangChain 的 tool 格式 */
function toLangChainTool(tool: LLMToolDefinition) {
  return {
    name: tool.name,
    description: tool.description,
    schema: tool.inputSchema,
  };
}

/** 将 LangChain 的 AIMessageChunk 流转成我们的 LLMStreamChunk 流 */
async function* transformStream(
  stream: AsyncIterable<AIMessageChunk>,
): AsyncIterable<LLMStreamChunk> {
  for await (const chunk of stream) {
    // 文本内容 — OpenAI 兼容格式通常是字符串
    if (typeof chunk.content === "string" && chunk.content.length > 0) {
      yield { type: "text_delta", text: chunk.content };
    } else if (Array.isArray(chunk.content)) {
      for (const block of chunk.content) {
        if (typeof block === "object" && block !== null) {
          const b = block as Record<string, unknown>;
          if (
            b.type === "text" &&
            typeof b.text === "string" &&
            b.text.length > 0
          ) {
            yield { type: "text_delta", text: b.text };
          }
        }
      }
    }

    // Tool 调用
    if (chunk.tool_calls && chunk.tool_calls.length > 0) {
      for (const tc of chunk.tool_calls) {
        if (tc.name && tc.id) {
          yield {
            type: "tool_use",
            id: tc.id,
            name: tc.name,
            input: tc.args ?? {},
          };
        }
      }
    }

    // Token 使用量
    if (chunk.usage_metadata) {
      yield {
        type: "usage",
        inputTokens: chunk.usage_metadata.input_tokens,
        outputTokens: chunk.usage_metadata.output_tokens,
      };
    }
  }
}
