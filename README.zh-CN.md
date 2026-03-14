# Media Kit Parser

[English](./README.md)

一个自动解析 KOL/达人媒体报价单（Media Kit）的 AI Agent —— 从 PDF 或文档中提取粉丝数、互动率、平台账号、合作报价、受众画像等结构化数据。为联盟营销工作流而构建。

基于 [general-agent](https://github.com/hanqizheng/general-agent) 通用 AI Agent 引擎，支持多轮自主决策、工具调用和实时 SSE 流式输出。

## 什么是 Media Kit？

Media Kit 是 KOL/达人向品牌方和代理商提供的合作资料文档（通常为 PDF），包含：

- 各社交平台账号及粉丝数据
- 互动率与受众画像
- 合作报价及可选广告形式
- 过往品牌合作案例

人工审阅和提取这些文档中的数据既繁琐又容易出错，这个 Agent 旨在自动化这一过程。

## 功能

### 当前

- [x] 通用 Agent 引擎（多轮 LLM 循环 + 工具调用）
- [x] 内置工具：文件读写/编辑、Bash、Grep、Glob
- [x] 多模型支持（Anthropic Claude、Moonshot Kimi）
- [x] 实时 SSE 流式输出

### 路线图

- [ ] PDF Media Kit 导入与结构化数据提取
- [ ] 多平台数据标准化（Instagram、TikTok、YouTube、小红书等）
- [ ] 批量处理 Media Kit
- [ ] 结构化输出 Schema，便于下游系统集成
- [ ] 报价对比与 KOL 排名工具
- [ ] 扩展至更多联盟营销场景（投放追踪、佣金分析、合作伙伴匹配）
- [ ] 前端 UI：Media Kit 审阅与数据修正
- [ ] 解析结果数据库持久化

## 快速开始

```bash
git clone git@github.com:hanqizheng/media-kit-parser.git
cd media-kit-parser
npm install
docker compose up -d        # MySQL
cp .env.local.example .env.local
# 编辑 .env.local，填入 LLM 服务商的 API Key
npm run dev
```

## 技术栈

Next.js 16 (App Router) / TypeScript / LangChain / Zod v4 / MySQL + Drizzle ORM / Web Streams API + SSE

## 许可证

本项目采用 [CC BY-NC 4.0（知识共享 署名-非商业性使用 4.0 国际许可协议）](https://creativecommons.org/licenses/by-nc/4.0/deed.zh-hans)。

- **非商业用途**：可自由使用、修改和分发。
- **商业用途**：需购买商业许可。请联系 hanqizheng598@gmail.com。
