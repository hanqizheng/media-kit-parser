// 测试 Agent Loop — 真实调用 Anthropic，验证完整事件流
import { EventBus } from "../src/core/events/bus";
import { EventEmitter } from "../src/core/events/emitter";
import { createAnthropicProvider } from "../src/core/provider/anthropic";
import { runAgentLoop } from "../src/core/agent/loop";
import type { AgentEvent } from "../src/core/events/types";

const bus = new EventBus();

// 监听所有事件
bus.on((event: AgentEvent) => {
  if (event.type === "message.text.delta") {
    process.stdout.write(event.text);
  } else {
    console.log(`\n[${event.type}]`, JSON.stringify(event, null, 2));
  }
});

const emitter = new EventEmitter(bus, "s_test");

const provider = createAnthropicProvider({
  apiKey: process.env.ANTHROPIC_AUTH_TOKEN!,
  baseURL: process.env.ANTHROPIC_BASE_URL!,
});

async function main() {
  const result = await runAgentLoop({
    emitter,
    provider,
    systemPrompt: "You are a helpful assistant. Reply in Chinese.",
    userMessage: "用一句话介绍什么是 Agent Loop",
    history: [],
    maxTurns: 1,
  });

  console.log("\n\n--- Result ---");
  console.log("turnCount:", result.turnCount);
  console.log("endReason:", result.endReason);
}

main().catch(console.error).finally(() => bus.dispose());
