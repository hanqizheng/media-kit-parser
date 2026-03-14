# Media Kit Parser

[中文文档](./README.zh-CN.md)

An AI agent that automatically parses KOL/influencer media kits — extracting follower counts, engagement rates, platform profiles, pricing, and audience demographics from PDF or document files. Built for affiliate marketing workflows.

Powered by [general-agent](https://github.com/hanqizheng/general-agent), a generic AI agent engine with multi-turn autonomous execution, tool calling, and real-time SSE streaming.

## What is a Media Kit?

A media kit is a document (typically PDF) provided by KOLs/influencers to brands and agencies, containing:

- Social platform accounts and follower statistics
- Engagement rates and audience demographics
- Collaboration pricing and available ad formats
- Past brand partnership cases

Manually reviewing and extracting data from these documents is tedious and error-prone. This agent automates the process.

## Features

### Current

- [x] General agent engine (multi-turn LLM loop with tool calling)
- [x] Built-in tools: file read/write/edit, bash, grep, glob
- [x] Multi-provider support (Anthropic Claude, Moonshot Kimi)
- [x] Real-time SSE streaming

### Roadmap

- [ ] PDF media kit ingestion and structured data extraction
- [ ] Multi-platform data normalization (Instagram, TikTok, YouTube, Xiaohongshu, etc.)
- [ ] Batch processing for bulk media kit parsing
- [ ] Structured output schema for downstream integrations
- [ ] Pricing comparison and KOL ranking tools
- [ ] Expansion into broader affiliate marketing workflows (campaign tracking, commission analysis, partner matching)
- [ ] Frontend UI for media kit review and data correction
- [ ] Database persistence for parsed results

## Getting Started

```bash
git clone git@github.com:hanqizheng/media-kit-parser.git
cd media-kit-parser
npm install
docker compose up -d        # MySQL
cp .env.local.example .env.local
# Edit .env.local — add your LLM provider API key
npm run dev
```

## Tech Stack

Next.js 16 (App Router) / TypeScript / LangChain / Zod v4 / MySQL + Drizzle ORM / Web Streams API + SSE

## License

This project is licensed under the [Creative Commons Attribution-NonCommercial 4.0 International License (CC BY-NC 4.0)](https://creativecommons.org/licenses/by-nc/4.0/).

- **Non-commercial use**: Free to use, modify, and distribute.
- **Commercial use**: Requires a paid license. Contact hanqizheng598@gmail.com for commercial licensing.
