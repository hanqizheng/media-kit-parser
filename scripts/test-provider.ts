// 测试 Anthropic provider 流式输出
import { createAnthropicProvider } from "../src/core/provider/anthropic";

const provider = createAnthropicProvider({
  apiKey: process.env.ANTHROPIC_AUTH_TOKEN!,
  baseURL: process.env.ANTHROPIC_BASE_URL!,
});

async function main() {
  console.log("--- Testing Anthropic Provider ---\n");

  const stream = await provider.stream({
    messages: [
      {
        role: "user",
        content: [{ type: "text", text: "用一句话介绍你自己" }],
      },
    ],
    systemPrompt: "You are a helpful assistant.",
  });

  let fullText = "";
  for await (const chunk of stream) {
    if (chunk.type === "text_delta") {
      process.stdout.write(chunk.text);
      fullText += chunk.text;
    } else if (chunk.type === "usage") {
      console.log(`\n\n[Usage] input: ${chunk.inputTokens}, output: ${chunk.outputTokens}`);
    }
  }

  console.log("\n--- Done ---");
}

main().catch(console.error);
