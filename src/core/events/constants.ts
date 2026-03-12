/** session 状态 */
export const SESSION_STATUS = {
  /** 空闲*/
  IDLE: "idle",
  /** 忙碌 */
  BUSY: "busy",
  /** 错误 */
  ERROR: "error",
} as const;

/** Agent Loop 整体结束原因 */
export const LOOP_END_REASON = {
  /** 正常完成 */
  COMPLETE: "complete",
  /** 用户中断 */
  INTERRUPTED: "interrupted",
  /** 错误 */
  ERROR: "error",
  /** 达到最大循环次数 */
  MAX_TURNS: "max_turns",
} as const;

/** 单次 Turn 结束原因 */
export const TURN_END_REASON = {
  /** 正常完成 */
  COMPLETE: "complete",
  /** 错误 */
  ERROR: "error",
} as const;

export const TOOL_END_STATE = {
  /** 正常完成 */
  COMPLETE: "complete",
  /** 错误 */
  ERROR: "error",
} as const;

export const EVENT_KEY = "agent_event";
