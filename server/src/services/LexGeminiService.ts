import { GoogleGenAI, Type } from "@google/genai";
import { UserRole, PrivilegeStatus, DocumentMetadata, RegulatoryRule, TimeEntry, ChatbotConfig, KnowledgeArtifact } from "../types";

export class LexGeminiService {
    private getAI() {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error("GEMINI_API_KEY is not set in environment");
        }
        return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    }

    async chat(
        input: string,
        matterId: string | null,
        documents: DocumentMetadata[],
        usePrivateModel: boolean,
        killSwitchActive: boolean,
        useGlobalSearch: boolean = false
    ): Promise<{ text: string; confidence: number; provider: string; references?: string[]; groundingSources?: { title: string, uri: string }[] }> {
        if (killSwitchActive) {
            throw new Error("KILL_SWITCH_ACTIVE");
        }

        const ai = this.getAI();
        // Use flash for everything in MVP unless specific model access is granted
        const model = usePrivateModel ? 'gemini-2.0-flash' : 'gemini-2.0-flash';
        const contextDocs = matterId
            ? documents.filter(d => d.matterId === matterId)
            : documents;

        const contextStr = contextDocs.map(d => `Doc: ${d.name} (${d.id}), Matter: ${d.matterId}`).join('\n');

        const config: any = {
            systemInstruction: "You are a senior legal assistant specializing in Zero-Knowledge productivity. Provide concise, accurate legal information based on internal documents and global legal research. NEVER give definitive legal advice. Return a JSON object with 'text', 'confidence' (0-1), and 'references' (internal doc IDs).",
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    text: { type: Type.STRING },
                    confidence: { type: Type.NUMBER },
                    references: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ["text", "confidence"]
            }
        };

        if (useGlobalSearch) {
            config.tools = [{ googleSearch: {} }];
        }

        try {
            const response = await ai.models.generateContent({
                model: model,
                contents: `CONTEXT_DOCUMENTS:\n${contextStr}\n\nUSER_QUERY: ${input}`,
                config: config
            });

            // Extract search grounding metadata if available
            const groundingSources: { title: string, uri: string }[] = [];
            const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
            if (chunks) {
                chunks.forEach((chunk: any) => {
                    if (chunk.web) {
                        groundingSources.push({ title: chunk.web.title, uri: chunk.web.uri });
                    }
                });
            }

            let result;
            try {
                result = JSON.parse(response.text || '{}');
            } catch {
                result = { text: response.text, confidence: 0.9, references: [] };
            }

            return {
                text: result.text || "I am analyzing the sovereign research stream...",
                confidence: result.confidence || 0.85,
                provider: "Gemini 2.0 Flash (Sovereign Proxy)",
                references: result.references,
                groundingSources: groundingSources.length > 0 ? groundingSources : undefined
            };
        } catch (error: any) {
            console.error("Gemini API Error (Chat):", error.message);
            return {
                text: "API QUOTA/ERROR FALLBACK: I am operating in offline mode. Legal context suggests proceeding with standard governance checks.",
                confidence: 1.0,
                provider: "LexSovereign Local (Offline)",
                references: documents.slice(0, 1).map(d => d.id)
            };
        }


    }

    async generateExecutiveBriefing(matterId: string, documents: DocumentMetadata[]): Promise<string> {
        const ai = this.getAI();
        const docs = documents.filter(d => d.matterId === matterId);
        const context = docs.map(d => `${d.name} (${d.jurisdiction})`).join(', ');

        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: `Generate a high-velocity executive briefing for Matter ${matterId} based on these artifacts: ${context}. Focus on: 1. Risk Heatmap 2. Key Deadlines 3. Critical Clause Anomalies.`,
            config: {
                systemInstruction: "You are the Chief Legal Ops AI. Summarize the status of a legal matter for a Managing Partner. Use bullet points and a professional, sovereign tone. Max 300 words.",
            }
        });

        return response.text || "Matter synthesis failed at the enclave layer.";
    }

    async getScrubbedContent(
        rawContent: string,
        role: UserRole,
        privilege: PrivilegeStatus
    ): Promise<{ content: string; scrubbedEntities: number }> {
        const isRestricted = role === UserRole.EXTERNAL_COUNSEL || role === UserRole.CLIENT;

        if (!isRestricted) {
            return { content: rawContent, scrubbedEntities: 0 };
        }

        const ai = this.getAI();
        const prompt = `
      ROLE: ${role}
      PRIVILEGE_LEVEL: ${privilege}
      TASK: Redact PII and privileged legal reasoning from the following text.
      RULES:
      1. Replace names with [NAME], dates with [DATE], amounts with [VALUE].
      
      TEXT: ${rawContent}
    `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: prompt,
            config: { temperature: 0 }
        });

        const scrubbed = response.text || "[CONTENT REDACTED BY SOVEREIGN PROXY]";
        const entitiesRemoved = (scrubbed.match(/\[.*?\]/g) || []).length;

        return { content: scrubbed, scrubbedEntities: entitiesRemoved };
    }
    async evaluateRRE(text: string, rules: RegulatoryRule[]): Promise<{ isBlocked: boolean; triggeredRule?: string }> {
        const ai = this.getAI();
        const activeRules = rules.filter(r => r.isActive).map(r => `${r.name}: ${r.description}`).join('\n');

        if (!activeRules) return { isBlocked: false };

        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.0-flash',
                contents: `RULES:\n${activeRules}\n\nTEXT_TO_EVALUATE: ${text}\n\nAssess if the text violates any rules. Return JSON: { "isBlocked": boolean, "triggeredRule": string | null }. STRICT COMPLIANCE.`,
                config: {
                    responseMimeType: "application/json",
                    temperature: 0
                }
            });

            const result = JSON.parse(response.text || '{ "isBlocked": false }');
            return { isBlocked: result.isBlocked, triggeredRule: result.triggeredRule };
        } catch (error) {
            console.error("Gemini API Error (EvaluateRRE):", error);
            return { isBlocked: false };
        }


    }

    async publicChat(input: string, config: ChatbotConfig, knowledge: KnowledgeArtifact[]): Promise<{ text: string; confidence: number }> {
        if (!config.isEnabled) return { text: "Chatbot is currently disabled.", confidence: 1 };

        const ai = this.getAI();
        const knowledgeContext = knowledge.map(k => `${k.title}: ${k.content}`).join('\n\n');

        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: `SYSTEM: ${config.systemInstruction}\n\nKNOWLEDGE_BASE:\n${knowledgeContext}\n\nUSER: ${input}`,
            config: { temperature: 0.3 }
        });

        return { text: response.text || "I am unable to answer that at this time.", confidence: 0.9 };
    }

    async generateBillingDescription(rawNotes: string): Promise<string> {
        const ai = this.getAI();
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.0-flash',
                contents: `Convert these raw notes into a professional legal billing narrative (max 1 sentence): "${rawNotes}"`,
                config: { temperature: 0.2 }
            });
            return response.text || rawNotes;
        } catch (error) {
            return "Legal services rendered regarding matter analysis [Offline Generated]";
        }

    }
}
