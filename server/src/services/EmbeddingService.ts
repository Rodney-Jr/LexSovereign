
import { OpenAI } from 'openai';
import axios from 'axios';

export class EmbeddingService {
    private static _openai: OpenAI | null = null;

    private static getOpenAI() {
        if (!this._openai) {
            const apiKey = process.env.OPENAI_API_KEY;
            if (!apiKey) {
                console.warn("[EmbeddingService] OPENAI_API_KEY not found in environment.");
            }
            this._openai = new OpenAI({ apiKey: apiKey || 'dummy-key' });
        }
        return this._openai;
    }

    /**
     * Generates a vector embedding for the given text.
     * Tries OpenRouter first (if configured), falls back to OpenAI.
     */
    static async generateEmbedding(text: string): Promise<number[]> {
        const useOpenRouter = process.env.AI_PROVIDER === 'openrouter';

        if (useOpenRouter && process.env.OPENROUTER_API_KEY) {
            try {
                const response = await axios.post(
                    'https://openrouter.ai/api/v1/embeddings',
                    {
                        model: 'openai/text-embedding-3-small', // Use standard embedding model on OpenRouter
                        input: text,
                    },
                    {
                        headers: {
                            'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                            'HTTP-Referer': process.env.OPENROUTER_SITE_URL || 'https://app.nomosdesk.com',
                            'X-Title': process.env.OPENROUTER_SITE_NAME || 'NomosDesk',
                        },
                        timeout: 10000
                    }
                );
                if (response.data && response.data.error) {
                    throw new Error(`OpenRouter API Error: ${JSON.stringify(response.data.error)}`);
                }
                if (response.data && response.data.data && response.data.data[0]) {
                    return response.data.data[0].embedding;
                }
                throw new Error("Invalid response structure from OpenRouter.");
            } catch (err: any) {
                console.warn("[EmbeddingService] OpenRouter embedding failed:", err.response?.data || err.message);
                if (!process.env.OPENAI_API_KEY) throw err;
                console.log("[EmbeddingService] Falling back to direct OpenAI...");
            }
        }

        // Direct OpenAI Fallback
        try {
            const openai = this.getOpenAI();
            const response = await openai.embeddings.create({
                model: "text-embedding-3-small",
                input: text,
                encoding_format: "float",
            });
            return response.data[0].embedding;
        } catch (err: any) {
            console.error("[EmbeddingService] Direct OpenAI Fallback failed:", err.message);
            throw err;
        }
    }
}
