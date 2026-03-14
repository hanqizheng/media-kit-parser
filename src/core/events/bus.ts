// In-process EventEmitter for agent events
import { EventEmitter } from "events";
import type { AgentEvent } from "./types";

import { EVENT_KEY } from "./constants";

export type AgentEventListener = (event: AgentEvent) => void;

export class EventBus {
  private emitter = new EventEmitter();

  on(listener: AgentEventListener) {
    this.emitter.on(EVENT_KEY, listener);
  }

  off(listener: AgentEventListener) {
    this.emitter.off(EVENT_KEY, listener);
  }

  emit(event: AgentEvent) {
    this.emitter.emit(EVENT_KEY, event);
  }

  dispose() {
    this.emitter.removeAllListeners(EVENT_KEY);
  }
}
