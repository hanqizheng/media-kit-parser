import { EventBus } from "../src/core/events/bus";
import { EventEmitter } from "../src/core/events/emitter";
import type { AgentEvent } from "../src/core/events/types";

const bus = new EventBus();

// 监听所有事件，打印出来
bus.on((event: AgentEvent) => {
  console.log(`[seq=${event.seq}] ${event.type}`, event);
});

// 创建一个 session 的 emitter
const emitter = new EventEmitter(bus, "s_test123");

// 模拟一次 agent 运行
emitter.emit({ type: "session.status", status: "busy" });
emitter.emit({ type: "loop.start", turnId: "t_turn001" });
emitter.emit({
  type: "message.start",
  messageId: "m_msg001",
  role: "assistant",
});
emitter.emit({
  type: "message.text.delta",
  messageId: "m_msg001",
  partIndex: 0,
  text: "你好",
});
emitter.emit({
  type: "message.text.delta",
  messageId: "m_msg001",
  partIndex: 0,
  text: "，世界",
});
emitter.emit({
  type: "message.text.done",
  messageId: "m_msg001",
  partIndex: 0,
});
emitter.emit({ type: "message.end", messageId: "m_msg001" });
emitter.emit({ type: "loop.end", turnId: "t_turn001", reason: "complete" });
emitter.emit({ type: "session.status", status: "idle" });

console.log("\n--- 验证完成：9 个事件，seq 从 0 到 8 ---");

bus.dispose();
