// AgentEvent union type — all event types emitted during agent execution

import type {
  SESSION_STATUS,
  LOOP_END_REASON,
  TOOL_END_STATE,
} from "./constants";
import type { MESSAGE_ROLE } from "../../lib/constants";

export type SessionStatus =
  (typeof SESSION_STATUS)[keyof typeof SESSION_STATUS];
export type LoopEndReason =
  (typeof LOOP_END_REASON)[keyof typeof LOOP_END_REASON];

export type MessageRole = (typeof MESSAGE_ROLE)[keyof typeof MESSAGE_ROLE];
export type ToolEndState = (typeof TOOL_END_STATE)[keyof typeof TOOL_END_STATE];

export interface EventBase {
  /** 唯一标识事件属于哪个会话， SSE 推送是按照 session id 隔离的 */
  sessionId: string;
  /** 事件顺序，每个 session 从 0 开始递增 */
  seq: number;
  /** 时间戳 */
  timestamp: number;
}

/** 会话事件 */
interface SessionStatusEvent extends EventBase {
  type: "session.status";
  status: SessionStatus;
}

/** AgentLoop 新一轮 loop 开始 事件 */
interface LoopTurnStartEvent extends EventBase {
  type: "loop.start";
  turnId: string;
}

/** AgentLoop 一轮 loop 结束 事件 */
interface LoopTurnEndEvent extends EventBase {
  type: "loop.end";
  turnId: string;
  reason: LoopEndReason;
}

/** 消息开始事件 */
interface MessageStartEvent extends EventBase {
  type: "message.start";
  messageId: string;
  role: MessageRole;
}

/** 消息结束事件 */
interface MessageEndEvent extends EventBase {
  type: "message.end";
  messageId: string;
}

// LLM 的输出是流式的，一个字一个字地蹦出来。我们用 delta/done 模式来表达

/**
 * partIndex — 一条 assistant 消息可能包含多个"部分"。比如 LLM 先输出一段文本（partIndex=0），然后调用一个
 * tool，再输出一段文本（partIndex=1）。partIndex 标识当前是第几个 part，对应数据库 message_parts 表。
 */

/** 文本流 - 过程中 */
interface TextDeltaEvent extends EventBase {
  type: "message.text.delta";
  messageId: string;
  partIndex: number;
  text: string;
}

/** 文本流 - 完成 */
interface TextDoneEvent extends EventBase {
  type: "message.text.done";
  messageId: string;
  partIndex: number;
}

/** 推理流 - 过程中 */
interface MessageReasoningDeltaEvent extends EventBase {
  type: "message.reasoning.delta";
  messageId: string;
  partIndex: number;
  /** 这次增量事件携带的具体文本片段内容，比如 "让我想想"。 */
  content: string;
}

/** 推理流 - 完成 */
interface MessageReasoningDoneEvent extends EventBase {
  type: "message.reasoning.done";
  messageId: string;
  partIndex: number;
  text: string;
}

/** 工具调用 - 开始 */
interface ToolStartEvent extends EventBase {
  type: "message.tool.start";
  messageId: string;
  toolCallId: string;
  toolName: string;
  input: Record<string, unknown>;
}

/** 工具调用 - 运行 */
interface ToolRunningEvent extends EventBase {
  type: "message.tool.running";
  toolCallId: string;
}

/** 工具调用 - 增量更新 */
interface ToolUpdateEvent extends EventBase {
  type: "message.tool.update";
  toolCallId: string;
  /** 这次增量事件携带的具体文本片段内容，比如 "正在查询数据库"。 */
  content: string;
}

/** 工具调用 - 完成 */
interface ToolEndEvent extends EventBase {
  type: "message.tool.end";
  toolCallId: string;
  state: ToolEndState;
  output: string;
  error?: string;
  /** 耗时 */
  durationMs: number;
}

/** 错误事件 */
interface ErrorEvent extends EventBase {
  type: "session.error";
  error: {
    code: string;
    message: string;
    recoverable: boolean;
  };
}

/** 心跳事件 */
interface HeartbeatEvent extends EventBase {
  type: "session.heartbeat";
}

export type AgentEvent =
  | SessionStatusEvent
  | LoopTurnStartEvent
  | LoopTurnEndEvent
  | MessageStartEvent
  | MessageEndEvent
  | TextDeltaEvent
  | TextDoneEvent
  | MessageReasoningDeltaEvent
  | MessageReasoningDoneEvent
  | ToolStartEvent
  | ToolRunningEvent
  | ToolUpdateEvent
  | ToolEndEvent
  | ErrorEvent
  | HeartbeatEvent;
