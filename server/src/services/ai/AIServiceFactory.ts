
import { AIProvider } from "./types";
import { GeminiProvider } from "./GeminiProvider";
import { OpenAIProvider } from "./OpenAIProvider";
import { AnthropicProvider } from "./AnthropicProvider";
import { OpenRouterProvider } from "./OpenRouterProvider";
import { SovereignEnclaveProvider } from "./SovereignEnclaveProvider";

export class AIServiceFactory {
    private static instance: AIProvider;

    static getProvider(tenant?: any): AIProvider {
        return this.getProvidersByPriority(tenant)[0];
    }

    static getProvidersByPriority(tenant?: any): AIProvider[] {
        const primaryType = (process.env.AI_PROVIDER || 'gemini').toLowerCase();
        const providers: AIProvider[] = [];

        // 1. If Tenant is in "Enclave Only" mode, prioritize the local regional provider
        if (tenant?.enclaveOnlyProcessing && tenant?.jurisdiction) {
            providers.push(new SovereignEnclaveProvider(tenant.jurisdiction));
            
            // If strictly enforced, we might return only the enclave provider
            // but usually we include others for internal fallback if permitted
            if (process.env.STRICT_ENCLAVE_ONLY === 'true') {
                return providers;
            }
        }

        // 2. Add standard primary provider
        providers.push(this.createProvider(primaryType));

        // Add fallbacks (avoid duplicates)
        const fallbacks = ['openrouter', 'gemini', 'openai'];
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
