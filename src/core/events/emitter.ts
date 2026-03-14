// Event emitter helper — auto-assigns seq/timestamp to events

/**
 *回想一下，每个事件都需要 sessionId、seq、timestamp 三个字段（EventBase）。如果让 Agent Loop 每次 emit
  都手动填这三个，既啰嗦又容易出错。

  EventEmitter 的职责就是自动补全这些字段。调用方只需要关心业务数据：

  // 没有 EventEmitter 时，agent loop 要这样写：
  bus.emit({
    type: "message.text.delta",
    sessionId: "s_abc123",    // 每次都要写
    seq: 42,                   // 还要自己维护计数器
    timestamp: Date.now(),     // 每次都要写
    messageId: "m_xyz",
    partIndex: 0,
    content: "你好",
  });

  // 有了 EventEmitter，agent loop 只需要写：
  emitter.emit({
    type: "message.text.delta",
    messageId: "m_xyz",
    partIndex: 0,
    content: "你好",
  });
  // sessionId, seq, timestamp 自动填充
 */

import type { AgentEvent, EventBase } from "./types";
import { EventBus } from "./bus";

type EventPayload = {
  [K in AgentEvent["type"]]: Omit<
    Extract<AgentEvent, { type: K }>,
    keyof EventBase
  >;
}[AgentEvent["type"]];

export class EventEmitter {
  private seq = 0;

  constructor(
    private readonly bus: EventBus,
    private readonly sessionId: string,
  ) {}

  emit(payload: EventPayload) {
    const event = {
      ...payload,
      sessionId: this.sessionId,
      seq: this.seq++,
      timestamp: Date.now(),
    };

    this.bus.emit(event);
  }
}
