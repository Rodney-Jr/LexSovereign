
import { AIProvider } from "./types";
import { GeminiProvider } from "./GeminiProvider";
import { OpenAIProvider } from "./OpenAIProvider";
import { AnthropicProvider } from "./AnthropicProvider";

export class AIServiceFactory {
    private static instance: AIProvider;

    static getProvider(): AIProvider {
        if (this.instance) return this.instance;

        const providerType = process.env.AI_PROVIDER || 'gemini';

        switch (providerType.toLowerCase()) {
            case 'openai':
                console.log("Initializing OpenAI Provider");
                this.instance = new OpenAIProvider();
                break;
            case 'anthropic':
            case 'claude':
                console.log("Initializing Anthropic Provider");
                this.instance = new AnthropicProvider();
                break;
            case 'gemini':
            default:
                console.log("Initializing Gemini Provider");
                this.instance = new GeminiProvider();
                break;
        }

        return this.instance;
    }

    // Force reset for testing or runtime switching
    static setProvider(type: 'gemini' | 'openai' | 'anthropic') {
        process.env.AI_PROVIDER = type;
        this.instance = null as any;
        this.getProvider();
    }
}
