# General Agent

A from-scratch AI agent engine built with TypeScript and Next.js. Implements the core agentic loop pattern — LLM reasoning, tool calling, result feedback, repeat — with real-time SSE streaming.

Designed as a **generic foundation** for building vertical AI agents. This project provides the agent runtime, tool system, provider abstraction, and event streaming infrastructure. Domain-specific capabilities are added by downstream projects.

## Architecture

```
User Message → Agent Loop → LLM Call → Tool Execution → Result Feedback → LLM Call → ...
                                                                                    ↓
                              ← ← ← ← SSE Event Stream ← ← ← ← ← ← ← ← ← ← ← ←
```

The engine is organized into five layers:

- **Agent Loop** — Multi-turn autonomous execution. Each turn: call the LLM, execute any tool calls, feed results back. Repeats until the LLM has nothing more to do.
- **Provider Layer** — Unified `LLMProvider` interface. Swap between Anthropic (Claude), Moonshot (Kimi), or any LangChain-compatible model.
- **Tool System** — Pluggable tools with Zod schema validation. Built-in: file read/write/edit, bash, grep, glob. Easy to extend with custom tools.
- **Event System** — Structured lifecycle events (session, loop, turn, message, tool) enabling real-time observability.
- **SSE Streaming** — Batched Server-Sent Events delivering token-level streaming to the client.

## Quick Start

```bash
git clone git@github.com:hanqizheng/general-agent.git
cd general-agent
npm install
docker compose up -d        # MySQL
cp .env.local.example .env.local
# Edit .env.local — add at least one LLM provider API key
npm run dev
```

Test with curl:

```bash
curl -N -X POST http://localhost:3891/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "List files in the current directory"}'
```

## Building Vertical Agents

Fork this repo on GitHub, then clone your fork:

```bash
git clone git@github.com:<you>/general-agent.git my-agent
cd my-agent

# Add upstream to sync future base updates
git remote add upstream git@github.com:hanqizheng/general-agent.git

# Sync base updates anytime:
git fetch upstream && git merge upstream/main
```

Extension points:
- **Custom tools** — Implement `ToolDefinition`, register in `ToolRegistry`
- **Custom providers** — Implement the `LLMProvider` interface
- **System prompt** — Customize `src/core/prompt/` for your domain
- **Skills** — Planned skill loading and injection system

## Tech Stack

Next.js 16 (App Router) / TypeScript / LangChain / Zod v4 / MySQL + Drizzle ORM / Web Streams API + SSE / nanoid

## License

MIT
