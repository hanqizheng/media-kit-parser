// SSE encoder — converts JSON events to SSE wire format

/**
 * 
 * 先理解 SSE 的协议格式。SSE 不是 JSON，而是一种简单的文本协议，每个事件长这样：

  id: 42
  event: message.text.delta
  data: {"messageId":"m_abc","partIndex":0,"text":"你好"}


  注意最后有一个空行，这是事件的分隔符。浏览器的 EventSource API 靠空行来判断一个事件结束了。

  字段含义：
  - id — 对应我们的 seq，客户端断线重连时会发 Last-Event-ID: 42
  - event — 事件类型，对应我们的 type 字段
  - data — JSON 数据体
 */

// encoder 做的事情就是：把一个 AgentEvent 转成这种文本格式

import type { AgentEvent } from "../events/types";

export function encodeSSE(event: AgentEvent): string {
  const lines: string[] = [];

  lines.push(`id: ${event.seq}`);
  lines.push(`event: ${event.type}`);
  lines.push(`data: ${JSON.stringify(event)}`);

  return lines.join("\n") + "\n\n";
}
