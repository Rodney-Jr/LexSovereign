import { DocumentMetadata } from "../types";

export class LocalAiService {
    private baseUrl: string;
    private model: string;

    constructor() {
        this.baseUrl = process.env.LOCAL_AI_URL || 'http://localhost:11434';
        this.model = process.env.LOCAL_AI_MODEL || 'llama3';
    }

    async generateResponse(prompt: string, systemInstruction: string): Promise<{ text: string; confidence: number }> {
        try {
            console.log(`[LocalAI] Attempting fallback to ${this.model} at ${this.baseUrl}...`);

            const response = await fetch(`${this.baseUrl}/api/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: this.model,
                    prompt: prompt,
                    system: systemInstruction,
                    stream: false,
                    options: {
                        temperature: 0.1
                    }
                })
            });

            if (!response.ok) {
                throw new Error(`Local AI returned status ${response.status}`);
            }

            const data = await response.json();

            // Local models usually don't return a schema-validated confidence, so we assign a baseline
            return {
                text: data.response || "No response derived from local inference.",
                confidence: 0.82
            };
        } catch (error: any) {
            console.error("[LocalAI] Connection Failed:", error.message);
            // Fail gracefully but truthfully - do not return fake data
            throw new Error(`Local AI Service Unavailable: ${error.message}`);
        }
    }
}
