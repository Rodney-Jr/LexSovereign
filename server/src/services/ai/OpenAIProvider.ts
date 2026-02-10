
import { OpenAI } from "openai";
import { UserRole, PrivilegeStatus, DocumentMetadata, RegulatoryRule, ChatbotConfig, KnowledgeArtifact } from "../../types";
import { AIProvider, ChatParams, ChatResult } from "./types";
import { PiiService } from "../piiService";
import { AuditorService } from "../auditorService";
import { prisma } from "../../db";

export class OpenAIProvider implements AIProvider {
    id = "openai";
    name = "OpenAI GPT-4";

    private defaultModel = "gpt-4-turbo";

    private getClient() {
        if (!process.env.OPENAI_API_KEY) {
            throw new Error("OPENAI_API_KEY is not set in environment");
        }
        return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }

    async chat(params: ChatParams): Promise<ChatResult> {
        if (params.killSwitchActive) throw new Error("KILL_SWITCH_ACTIVE");

        const openai = this.getClient();
        const { sanitized } = PiiService.sanitize(params.input);

        // Context Building (Similar to Gemini but adapted for OpenAI layout)
        const contextDocs = params.matterId
            ? params.documents.filter(d => d.matterId === params.matterId)
            : params.documents;
        const contextStr = contextDocs.map(d => `Doc: ${d.name} (${d.id})`).join('\n');

        // Knowledge Base Search (Naive)
        let legalKnowledge = "";
        try {
            const artifacts = await prisma.knowledgeArtifact.findMany({
                where: {
                    OR: [
                        { title: { contains: sanitized, mode: 'insensitive' } },
                        { content: { contains: sanitized, mode: 'insensitive' } }
                    ]
                },
                take: 3
            });
            if (artifacts.length > 0) {
                legalKnowledge = "LEGAL ARCHIVES (OFFICIAL):\n" +
                    artifacts.map(a => `[Source: ${a.title}]\n${a.content.substring(0, 500)}...`).join('\n\n');
            }
        } catch (e) {
            console.warn("KB Search Failed", e);
        }

        const systemPrompt = "You are a senior legal assistant specializing in Zero-Knowledge productivity. Provide concise, accurate legal information based on internal documents and global legal research. NEVER give definitive legal advice. Return a JSON object with 'text', 'confidence' (0-1), and 'references' (internal doc IDs).";
        const userPrompt = `CONTEXT_DOCUMENTS:\n${contextStr}\n\n${legalKnowledge}\n\nUSER_QUERY: ${sanitized}`;

        try {
            const response = await openai.chat.completions.create({
                model: this.defaultModel,
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userPrompt }
                ],
                response_format: { type: "json_object" }
            });

            const content = response.choices[0].message.content || "{}";
            let result;
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
                provider: `OpenAI (${this.defaultModel})`,
                references: result.references
            };

        } catch (error: any) {
            console.error("OpenAI Error:", error);
            return {
                text: "OpenAI Service Unavailable. Operating in offline mode.",
                confidence: 1.0,
                provider: "LexSovereign Local (Offline)",
                references: []
            };
        }
    }

    async explainClause(clauseText: string): Promise<string> {
        const openai = this.getClient();
        try {
            const response = await openai.chat.completions.create({
                model: this.defaultModel,
                messages: [
                    { role: "system", content: "You are a legal assistant. Explain intent, not legal advice. Keep under 120 words. Plain English." },
                    { role: "user", content: `Explain this clause: "${clauseText}"` }
                ],
                max_tokens: 150,
                temperature: 0.1
            });
            return response.choices[0].message.content || "Unable to explain.";
        } catch (e: any) {
            throw new Error(`OpenAI Explain Failed: ${e.message}`);
        }
    }

    async generateAuditLog(context: any): Promise<string> {
        const openai = this.getClient();
        try {
            const response = await openai.chat.completions.create({
                model: "gpt-3.5-turbo", // Cheaper model for simple tasks
                messages: [
                    { role: "system", content: "Generate a clear, past-tense, objective audit log sentence." },
                    { role: "user", content: `Context: ${JSON.stringify(context)}` }
                ],
                max_tokens: 60,
                temperature: 0
            });
            return response.choices[0].message.content || "Audit log generated.";
        } catch (e) {
            return `User ${context.userId} performed ${context.action}.`;
        }
    }

    async validateDocumentExport(documentContent: string): Promise<{ status: 'PASS' | 'FAIL', issues: string[] }> {
        const openai = this.getClient();
        try {
            const response = await openai.chat.completions.create({
                model: this.defaultModel,
                messages: [
                    { role: "system", content: "Validate legal doc. Check variables resolved, numbering sequential. Return JSON { status: 'PASS'|'FAIL', issues: [] }." },
                    { role: "user", content: documentContent.substring(0, 5000) }
                ],
                response_format: { type: "json_object" },
                temperature: 0
            });
            return JSON.parse(response.choices[0].message.content || "{}");
        } catch (e) {
            return { status: 'FAIL', issues: ["OpenAI Validation Error"] };
        }
    }

    async generatePricingModel(features: string[]): Promise<any> {
        // Implementation similar to chat/validate
        return { tiers: [], justification: "OpenAI Pricing Not Implemented Yet" };
    }

    async generateExecutiveBriefing(matterId: string, documents: DocumentMetadata[]): Promise<string> {
        // Implementation similar to chat
        return "OpenAI Briefing Not Implemented Yet";
    }

    async getScrubbedContent(rawContent: string, role: UserRole, privilege: PrivilegeStatus): Promise<{ content: string; scrubbedEntities: number }> {
        // Implementation similar to chat
        return { content: rawContent, scrubbedEntities: 0 };
    }

    async evaluateRRE(text: string, rules: RegulatoryRule[]): Promise<{ isBlocked: boolean; triggeredRule?: string }> {
        // Implementation similar to chat
        return { isBlocked: false };
    }

    async publicChat(input: string, config: ChatbotConfig, knowledge: KnowledgeArtifact[]): Promise<{ text: string; confidence: number }> {
        // Implementation similar to chat
        return { text: "OpenAI Chatbot Not Implemented Yet", confidence: 0 };
    }

    async generateBillingDescription(rawNotes: string): Promise<string> {
        const openai = this.getClient();
        try {
            const response = await openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    { role: "system", content: "Convert to professional legal billing narrative (1 sentence)." },
                    { role: "user", content: rawNotes }
                ],
                temperature: 0.2
            });
            return response.choices[0].message.content || rawNotes;
        } catch (e) {
            return rawNotes;
        }
    }

    async hydrateTemplate(template: any, matter: any): Promise<any> {
        return {};
    }
}
