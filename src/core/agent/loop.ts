// Agent loop — core while loop driving autonomous decision-making

import { DEFAULT_MAX_TURNS } from "@/lib/constants";
import { buildContext } from "./context";
import { AgentLoopResult, AgentLoopStartParams } from "./types";
import { LoopEndReason } from "../events/types";
import {
  LOOP_END_REASON,
  SESSION_STATUS,
  TURN_END_REASON,
} from "../events/constants";
import { genTurnId } from "@/lib/id";
import { executeTurn } from "./turn";

export async function runAgentLoop(
  params: AgentLoopStartParams,
): Promise<AgentLoopResult> {
  const {
    emitter,
    history,
    userMessage,
    maxTurns = DEFAULT_MAX_TURNS,
    interruptSignal,
    provider,
    systemPrompt,
  } = params;

  emitter.emit({ type: "session.status", status: SESSION_STATUS.BUSY });

  let messages = buildContext(history, userMessage);
  let turnCount = 0;

  let endReason: LoopEndReason = LOOP_END_REASON.COMPLETE;

  emitter.emit({ type: "loop.start" });

  while (turnCount < maxTurns) {
    const turnId = genTurnId();

    if (interruptSignal?.aborted) {
      endReason = LOOP_END_REASON.INTERRUPTED;
      break;
    }

    turnCount += 1;

    emitter.emit({ type: "turn.start", turnId });

    try {
      const result = await executeTurn({
        provider,
        emitter,
        streamParams: {
          messages,
          systemPrompt,
        },
      });

      messages = [...messages, result.assistantMessage];

      emitter.emit({
        type: "turn.end",
        turnId,
        reason: TURN_END_REASON.COMPLETE,
      });

      if (!result.hasToolCalls) {
        endReason = LOOP_END_REASON.COMPLETE;
        break;
      }
    } catch {
      emitter.emit({ type: "turn.end", turnId, reason: TURN_END_REASON.ERROR });
      endReason = LOOP_END_REASON.ERROR;
      break;
    }
  }

  if (turnCount >= maxTurns && endReason === LOOP_END_REASON.COMPLETE) {
    endReason = LOOP_END_REASON.MAX_TURNS;
  }

  emitter.emit({ type: "loop.end", reason: endReason });
  emitter.emit({ type: "session.status", status: SESSION_STATUS.IDLE });

  return {
    endReason,
    messages,
    turnCount,
  };
}
