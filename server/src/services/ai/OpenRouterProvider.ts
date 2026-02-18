
import { OpenAI } from "openai";
import {
    UserRole,
    PrivilegeStatus,
    DocumentMetadata,
    RegulatoryRule,
    ChatbotConfig,
    KnowledgeArtifact,
    ChatMessage
} from "../../types";
import { AIProvider, ChatParams, ChatResult } from "./types";
import { PiiService } from "../piiService";
import { AuditorService } from "../auditorService";
import { LegalQueryService } from "../legalQueryService";

/**
 * OpenRouterProvider
 *
 * Uses the OpenAI-compatible OpenRouter API to access 100+ models
 * (GPT-4o, Claude 3.5 Sonnet, Gemini Pro, Llama 3, Mistral, DeepSeek, etc.)
 * through a single API key.
 *
 * Required env vars:
 *   OPENROUTER_API_KEY   - Your OpenRouter API key (https://openrouter.ai/keys)
 *   OPENROUTER_MODEL     - Primary model (default: "google/gemini-pro-1.5")
 *   OPENROUTER_FAST_MODEL - Cheaper model for simple tasks (default: "mistralai/mistral-7b-instruct")
 *
 * Optional:
 *   OPENROUTER_SITE_URL  - Your site URL for OpenRouter rankings (e.g. https://app.nomosdesk.com)
 *   OPENROUTER_SITE_NAME - Your app name for OpenRouter rankings (e.g. NomosDesk)
 */
export class OpenRouterProvider implements AIProvider {
    id = "openrouter";
    name = "OpenRouter";

    // Primary model for complex legal reasoning
    private get primaryModel(): string {
        return process.env.OPENROUTER_MODEL || "google/gemini-pro-1.5";
    }

    // Cheaper/faster model for simple tasks (audit logs, billing descriptions)
    private get fastModel(): string {
        return process.env.OPENROUTER_FAST_MODEL || "mistralai/mistral-7b-instruct";
    }

    private getClient(): OpenAI {
        const apiKey = process.env.OPENROUTER_API_KEY;
        if (!apiKey) {
            throw new Error("OPENROUTER_API_KEY is not set in environment");
        }

        return new OpenAI({
            apiKey,
            baseURL: "https://openrouter.ai/api/v1",
            defaultHeaders: {
                "HTTP-Referer": process.env.OPENROUTER_SITE_URL || "https://app.nomosdesk.com",
                "X-Title": process.env.OPENROUTER_SITE_NAME || "NomosDesk",
            },
        });
    }

    async chat(params: ChatParams): Promise<ChatResult> {
        if (params.killSwitchActive) throw new Error("KILL_SWITCH_ACTIVE");

        const client = this.getClient();
        const { sanitized } = await PiiService.sanitize(params.input, params.jurisdiction);

        // Build document context
        const contextDocs = params.matterId
            ? params.documents.filter(d => d.matterId === params.matterId)
            : params.documents;
        const contextStr = contextDocs.map(d => `Doc: ${d.name} (${d.id})`).join('\n');

        // Vector RAG: pull relevant statutes from the knowledge base
        let legalKnowledge = "";
        try {
            const region = params.jurisdiction || "GH";
            const excerpts = await LegalQueryService.getRelevantStatutes(sanitized, region);
            if (excerpts.length > 0) {
                legalKnowledge = "REGION-SPECIFIC STATUTORY CONTEXT (OFFICIAL GAZETTE):\n" +
                    excerpts.map((e: any) => `[Source: ${e.title} | URL: ${e.sourceUrl}]\n${e.contentChunk}`).join('\n\n');
            }
        } catch (e) {
            console.warn("Gazette RAG Search Failed:", e);
        }

        const systemPrompt = `You are a senior NomosDesk legal assistant. Task: Provide accurate legal information based ONLY on the provided Gazette excerpts. Rules: 1. If the information is not in the excerpts, state that you cannot find the specific statutory basis. 2. Always cite the Source URL for every claim. 3. Use a professional, sovereign tone. 4. Return a JSON object with 'text', 'confidence' (0-1), and 'references' (array of Source URLs).`;
        const userPrompt = `CONTEXT_DOCUMENTS:\n${contextStr}\n\n${legalKnowledge}\n\nUSER_QUERY: ${sanitized}`;

        try {
            const response = await client.chat.completions.create({
                model: this.primaryModel,
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userPrompt }
                ],
                response_format: { type: "json_object" }
            });

            const content = response.choices[0].message.content || "{}";
            let result: any;
            try {
                result = JSON.parse(content);
            } catch {
                result = { text: content, confidence: 0.8, references: [] };
            }

            const audit = await AuditorService.scan(result.text || "");
            let finalText = result.text;
            if (audit.flagged) {
                finalText = `[AUDIT BLOCK] Content Redacted by Sovereign Governance Layer.\nReason: ${audit.reason}`;
            }

            return {
                text: finalText || "Analysis complete.",
                confidence: audit.flagged ? 0.0 : (result.confidence || 0.8),
                provider: `OpenRouter (${this.primaryModel})`,
                references: result.references
            };

        } catch (error: any) {
            console.error("OpenRouter Chat Error:", error);
            return {
                text: "OpenRouter Service Unavailable. Operating in offline mode.",
                confidence: 1.0,
                provider: "NomosDesk Local (Offline)",
                references: []
            };
        }
    }

    async explainClause(clauseText: string): Promise<string> {
        const client = this.getClient();
        try {
            const response = await client.chat.completions.create({
                model: this.primaryModel,
                messages: [
                    { role: "system", content: "You are a legal assistant. Explain the intent of the clause in plain English. Keep under 120 words. Do not give legal advice." },
                    { role: "user", content: `Explain this clause: "${clauseText}"` }
                ],
                max_tokens: 150,
                temperature: 0.1
            });
            return response.choices[0].message.content || "Unable to explain.";
        } catch (e: any) {
            throw new Error(`OpenRouter Explain Failed: ${e.message}`);
        }
    }

    async generateAuditLog(context: {
        userId: string;
        firmId: string;
        action: string;
        resourceType: string;
        resourceId: string;
    }): Promise<string> {
        const client = this.getClient();
        try {
            const response = await client.chat.completions.create({
                model: this.fastModel, // Use cheaper model for simple tasks
                messages: [
                    { role: "system", content: "Generate a clear, past-tense, objective audit log sentence in one line." },
                    { role: "user", content: `Context: ${JSON.stringify(context)}` }
                ],
                max_tokens: 60,
                temperature: 0
            });
            return response.choices[0].message.content || `User ${context.userId} performed ${context.action}.`;
        } catch (e) {
            return `User ${context.userId} performed ${context.action} on ${context.resourceType} ${context.resourceId}.`;
        }
    }

    async validateDocumentExport(documentContent: string): Promise<{ status: 'PASS' | 'FAIL'; issues: string[] }> {
        const client = this.getClient();
        try {
            const response = await client.chat.completions.create({
                model: this.primaryModel,
                messages: [
                    { role: "system", content: "Validate a legal document. Check: all template variables are resolved (no {{placeholders}}), clause numbering is sequential, no obvious formatting errors. Return JSON: { status: 'PASS' | 'FAIL', issues: string[] }." },
                    { role: "user", content: documentContent.substring(0, 5000) }
                ],
                response_format: { type: "json_object" },
                temperature: 0
            });
            return JSON.parse(response.choices[0].message.content || "{}");
        } catch (e) {
            return { status: 'FAIL', issues: ["OpenRouter Validation Error"] };
        }
    }

    async generatePricingModel(features: string[]): Promise<any> {
        const client = this.getClient();
        try {
            const response = await client.chat.completions.create({
                model: this.primaryModel,
                messages: [
                    { role: "system", content: "You are a SaaS pricing strategist. Generate a tiered pricing model in JSON format with 'tiers' array and 'justification' string." },
                    { role: "user", content: `Features: ${features.join(', ')}` }
                ],
                response_format: { type: "json_object" }
            });
            return JSON.parse(response.choices[0].message.content || "{}");
        } catch (e) {
            return { tiers: [], justification: "OpenRouter Pricing Generation Failed" };
        }
    }

    async generateExecutiveBriefing(matterId: string, documents: DocumentMetadata[]): Promise<string> {
        const client = this.getClient();
        try {
            const docSummary = documents.slice(0, 10).map(d => `- ${d.name} (${d.classification})`).join('\n');
            const response = await client.chat.completions.create({
                model: this.primaryModel,
                messages: [
                    { role: "system", content: "Generate a concise executive briefing for a senior partner. Professional tone, 3-5 bullet points, highlight risks and key actions." },
                    { role: "user", content: `Matter ID: ${matterId}\nDocuments:\n${docSummary}` }
                ],
                max_tokens: 400,
                temperature: 0.2
            });
            return response.choices[0].message.content || "Unable to generate briefing.";
        } catch (e) {
            return "Executive briefing unavailable.";
        }
    }

    async getScrubbedContent(
        rawContent: string,
        role: UserRole,
        privilege: PrivilegeStatus
    ): Promise<{ content: string; scrubbedEntities: number }> {
        const client = this.getClient();
        try {
            const response = await client.chat.completions.create({
                model: this.fastModel,
                messages: [
                    {
                        role: "system",
                        content: `You are a data privacy officer. Scrub PII from the content based on user role (${role}) and privilege level (${privilege}). Return JSON: { content: string, scrubbedEntities: number }.`
                    },
                    { role: "user", content: rawContent.substring(0, 4000) }
                ],
                response_format: { type: "json_object" },
                temperature: 0
            });
            return JSON.parse(response.choices[0].message.content || "{}");
        } catch (e) {
            return { content: rawContent, scrubbedEntities: 0 };
        }
    }

    async evaluateRRE(
        text: string,
        rules: RegulatoryRule[]
    ): Promise<{ isBlocked: boolean; triggeredRule?: string }> {
        const client = this.getClient();
        try {
            const rulesStr = rules.map(r => `- ${r.id}: ${r.description}`).join('\n');
            const response = await client.chat.completions.create({
                model: this.fastModel,
                messages: [
                    {
                        role: "system",
                        content: `You are a regulatory compliance engine. Check if the text violates any of the provided rules. Return JSON: { isBlocked: boolean, triggeredRule?: string }.`
                    },
                    { role: "user", content: `Rules:\n${rulesStr}\n\nText: ${text}` }
                ],
                response_format: { type: "json_object" },
                temperature: 0
            });
            return JSON.parse(response.choices[0].message.content || "{}");
        } catch (e) {
            return { isBlocked: false };
        }
    }

    async publicChat(
        input: string,
        config: ChatbotConfig,
        knowledge: KnowledgeArtifact[],
        history?: ChatMessage[]
    ): Promise<{ text: string; confidence: number }> {
        const client = this.getClient();
        try {
            const knowledgeStr = knowledge.slice(0, 5).map(k => `Q: ${k.title}\nA: ${k.content}`).join('\n\n');
            const historyMessages = (history || []).slice(-6).map(m => ({
                role: m.role as "user" | "assistant",
                content: m.content
            }));

            const response = await client.chat.completions.create({
                model: this.fastModel,
                messages: [
                    {
                        role: "system",
                        content: `${config.systemInstruction || "You are a helpful legal assistant."}\n\nKnowledge Base:\n${knowledgeStr}`
                    },
                    ...historyMessages,
                    { role: "user", content: input }
                ],
                max_tokens: 300,
                temperature: 0.3
            });

            const text = response.choices[0].message.content || "I'm unable to assist right now.";
            return { text, confidence: 0.85 };
        } catch (e) {
            return { text: "Service temporarily unavailable.", confidence: 0 };
        }
    }

    async generateBillingDescription(rawNotes: string): Promise<string> {
        const client = this.getClient();
        try {
            const response = await client.chat.completions.create({
                model: this.fastModel, // Cheap model for simple task
                messages: [
                    { role: "system", content: "Convert raw time-tracking notes into a professional legal billing narrative. One concise sentence. Billable hours language." },
                    { role: "user", content: rawNotes }
                ],
                max_tokens: 80,
                temperature: 0.2
            });
            return response.choices[0].message.content || rawNotes;
        } catch (e) {
            return rawNotes;
        }
    }

    async hydrateTemplate(template: any, matter: any): Promise<any> {
        const client = this.getClient();
        try {
            const response = await client.chat.completions.create({
                model: this.primaryModel,
                messages: [
                    {
                        role: "system",
                        content: "You are a legal document specialist. Fill in the template placeholders using the matter data provided. Return the completed template as JSON."
                    },
                    {
                        role: "user",
                        content: `Template: ${JSON.stringify(template)}\n\nMatter Data: ${JSON.stringify(matter)}`
                    }
                ],
                response_format: { type: "json_object" }
            });
            return JSON.parse(response.choices[0].message.content || "{}");
        } catch (e) {
            return template;
        }
    }
}
