// Agent type definitions

import type { LLMMessage, LLMStreamParams } from "../provider/base";
import type { LLMProvider } from "../provider/base";

import type { LoopEndReason } from "../events/types";
import type { EventEmitter } from "../events/emitter";

/** Agent Loop 的启动参数 */
export interface AgentLoopStartParams {
  /** 对应当此会话的 id */
  sessionId: string;
  /** 使用的 LLM provider */
  provider: LLMProvider;
  /** EventEmitter */
  emitter: EventEmitter;
  /** 内置的系统 prompt */
  systemPrompt: string;
  /** 用户开启本次 loop 所发送的消息 */
  userMessage: string;
  /** 历史聊天 */
  history: LLMMessage[];
  /** 最大循环轮数 */
  maxTurns?: number;
  /** 外部中断信号 */
  interruptSignal?: AbortSignal;
}

/** Agent Loop 运行结果 */
export interface AgentLoopResult {
  /** 最终全部的消息 */
  messages: LLMMessage[];
  /** 实际已经执行几轮 loop */
  turnCount: number;
  /** 结束原因 */
  endReason: LoopEndReason;
}

/** 一次 Turn 的输入 */
export interface TurnParams {
  provider: LLMProvider;
  emitter: EventEmitter;
  streamParams: LLMStreamParams;
}

/** 一次 Turn 的输出 */
export interface TurnResult {
  /** 本轮 Turn 产生的消息增量 */
  assistantMessage: LLMMessage;
  /** 是否有工具调用 */
  hasToolCalls: boolean;
}
