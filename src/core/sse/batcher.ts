// SSE batcher — 16ms batch flush for efficient streaming

// batcher 的作用，是把高频，频繁的 SSE (AgentEvent) 事件，完成整合，大概 16ms 一次合并，返回给前端

import type { AgentEvent } from "../events/types";
import { encodeSSE } from "./encoder";

import { SSE_BATCH_INTERVAL_MS } from "@/lib/constants";

export class SSEBatcher {
  private buffer: string[] = [];
  private writer: WritableStreamDefaultWriter<Uint8Array>;

  private timer: ReturnType<typeof setTimeout> | null = null;

  private encoder = new TextEncoder();

  constructor(writable: WritableStream<Uint8Array>) {
    this.writer = writable.getWriter();
  }

  push(event: AgentEvent) {
    this.buffer.push(encodeSSE(event));

    if (!this.timer) {
      this.timer = setTimeout(() => this.flush(), SSE_BATCH_INTERVAL_MS);
    }
  }

  async flush() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    if (this.buffer.length === 0) {
      return;
    }

    /**
     * this.buffer = [
     *   "id: 0\nevent: message.text.delta\ndata: {\"text\":\"你\"}\n\n",
     *   "id: 1\nevent: message.text.delta\ndata: {\"text\":\"好\"}\n\n",
     * ];
     * 
     * id: 0
     * event: message.text.delta
     * data: {"text":"你"}
     *
     * id: 1
     * event: message.text.delta
     * data: {"text":"好"}
     * 
     */

    const chunk = this.buffer.join("");
    this.buffer = [];

    await this.writer.write(this.encoder.encode(chunk));
  }

  async close() {
    await this.flush();
    await this.writer.close();
  }
}
