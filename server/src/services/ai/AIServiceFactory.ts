
import { AIProvider } from "./types";
import { GeminiProvider } from "./GeminiProvider";
import { OpenAIProvider } from "./OpenAIProvider";
import { AnthropicProvider } from "./AnthropicProvider";
import { OpenRouterProvider } from "./OpenRouterProvider";

export class AIServiceFactory {
    private static instance: AIProvider;

    static getProvider(): AIProvider {
        return this.getProvidersByPriority()[0];
    }

    static getProvidersByPriority(): AIProvider[] {
        const primaryType = (process.env.AI_PROVIDER || 'gemini').toLowerCase();

        const providers: AIProvider[] = [];

        // Add primary
        providers.push(this.createProvider(primaryType));

        // Add fallbacks (avoid duplicates)
        const fallbacks = ['gemini', 'openrouter', 'openai'];
        for (const type of fallbacks) {
            if (type !== primaryType) {
                providers.push(this.createProvider(type));
            }
        }

        return providers;
    }

    private static createProvider(type: string): AIProvider {
        switch (type.toLowerCase()) {
            case 'openai':
                return new OpenAIProvider();
            case 'anthropic':
            case 'claude':
                return new AnthropicProvider();
            case 'openrouter':
                return new OpenRouterProvider();
            case 'gemini':
            default:
                return new GeminiProvider();
        }
    }

    // Force reset for testing or runtime switching
    static setProvider(type: 'gemini' | 'openai' | 'anthropic' | 'openrouter') {
        process.env.AI_PROVIDER = type;
        this.instance = null as any;
        this.getProvider();
    }
}
