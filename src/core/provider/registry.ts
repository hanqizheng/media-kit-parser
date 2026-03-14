// Provider registry — manages available LLM providers

// Registry 的职责很简单：管理多个 provider 实例，按 name 查找

import type { LLMProvider } from "./base";
export class ProviderRegistry {
  private providers: Map<string, LLMProvider> = new Map();

  register(provider: LLMProvider) {
    if (this.providers.has(provider.name)) {
      throw new Error(
        `Provider with name "${provider.name}" is already registered.`,
      );
    }

    this.providers.set(provider.name, provider);
  }

  get(name: string): LLMProvider {
    const provider = this.providers.get(name);
    if (!provider) {
      throw new Error(`Provider with name "${name}" not found.`);
    }
    return provider;
  }

  has(name: string): boolean {
    return this.providers.has(name);
  }

  list(): string[] {
    return Array.from(this.providers.keys());
  }
}
