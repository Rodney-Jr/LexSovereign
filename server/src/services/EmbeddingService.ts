
import { OpenAI } from 'openai';
import axios from 'axios';

export class EmbeddingService {
    private static openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    /**
     * Generates a vector embedding for the given text.
     * Tries OpenRouter/Gemini first (if configured for sovereign use), 
     * falls back to OpenAI if direct keys are available.
     */
    static async generateEmbedding(text: string): Promise<number[]> {
        const useOpenRouter = process.env.AI_PROVIDER === 'openrouter' || !process.env.OPENAI_API_KEY;

        if (useOpenRouter && process.env.OPENROUTER_API_KEY) {
            try {
                const response = await axios.post(
                    'https://openrouter.ai/api/v1/embeddings',
                    {
                        model: 'google/gemini-2.0-flash-001', // Or another embedding compatible model
                        input: text,
                    },
                    {
                        headers: {
                            'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                            'HTTP-Referer': process.env.OPENROUTER_SITE_URL || 'https://app.nomosdesk.com',
                            'X-Title': process.env.OPENROUTER_SITE_NAME || 'NomosDesk',
                        },
                    }
                );
                return response.data.data[0].embedding;
            } catch (err) {
                console.warn("[EmbeddingService] OpenRouter embedding failed, attempting fallback...", err);
                if (!process.env.OPENAI_API_KEY) throw err;
            }
        }

        // Direct OpenAI Fallback
        const response = await this.openai.embeddings.create({
            model: "text-embedding-3-small",
            input: text,
            encoding_format: "float",
        });
        return response.data[0].embedding;
    }
}
