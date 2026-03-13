import { genSessionId } from "@/lib/id";
import { EventBus } from "@/core/events/bus";
import { EventEmitter } from "@/core/events/emitter";
import { SSEBatcher } from "@/core/sse/batcher";
import { createAnthropicProvider } from "@/core/provider/anthropic";
import { runAgentLoop } from "@/core/agent/loop";
import { systemPrompt } from "@/core/prompt/system";

/**
 *   curl POST /api/chat { message: "你好" }
    │
    ├─ 创建 EventBus + EventEmitter
    ├─ 创建 TransformStream（readable + writable）
    ├─ 创建 SSEBatcher（持有 writable）
    ├─ 订阅 EventBus → batcher.push（事件桥接）
    ├─ 启动 runAgentLoop（后台运行，不 await 阻塞 response）
    │    └─ loop 内部 emit 事件 → bus → batcher → writable → readable
    └─ 立刻返回 Response(readable)，curl 开始收到 SSE 流

  关键点：Agent Loop 不能 await。如果在 route handler 里 await runAgentLoop()，那要等 loop 跑完才返回 Response，就不是流式了。正确做法是启动 loop
  但不等它完成，让 Response 立刻返回，数据通过流异步推送。
 * 
 */

// POST /api/chat — send message, trigger agent loop
export async function POST(req: Request) {
  const body = await req.json();

  const { message } = body;

  if (!message || typeof message !== "string") {
    return new Response("message is required", { status: 400 });
  }

  // TODO: 创建 session， 每次请求创建一个 session。 后续是接入数据库以后，从 body 里读取 sessionId
  const sessionId = genSessionId();

  // 创建 EventBus + EventEmitter
  const bus = new EventBus();
  const emitter = new EventEmitter(bus, sessionId);

  // 创建 SSE 响应流
  const { readable, writable } = new TransformStream<Uint8Array>();

  // 创建 batcher 来对 SSE 流返回的事件进行合并
  const batcher = new SSEBatcher(writable);

  // 开始唤醒 EventBus, on 接收一个 listener，listener 内部调用 batcher.push(event)，实现事件桥接，连接的是 Loop 和 SSE 流
  bus.on((event) => {
    batcher.push(event);
  });

  // 创建 provider
  // TODO: 现在是每次对话都创建，后面应该是从 registry 中获取
  const provider = createAnthropicProvider({
    apiKey: process.env.ANTHROPIC_AUTH_TOKEN!,
    baseURL: process.env.ANTHROPIC_BASE_URL!,
  });

  // 启动 Agent Loop， 但不 await，让它在后台运行
  runAgentLoop({
    emitter,
    provider,
    systemPrompt,
    userMessage: message,
    history: [],
  })
    .then(() => {})
    .finally(() => {
      batcher.close();
      bus.dispose();
    });

  // 立刻返回响应流，curl 开始收到 SSE 流
  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
