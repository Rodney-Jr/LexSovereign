
import Anthropic from "@anthropic-ai/sdk";
import { UserRole, PrivilegeStatus, DocumentMetadata, RegulatoryRule, ChatbotConfig, KnowledgeArtifact, ChatMessage } from "../../types";
import { AIProvider, ChatParams, ChatResult } from "./types";
import { PiiService } from "../piiService";
import { AuditorService } from "../auditorService";
import { prisma } from "../../db";
import { LegalQueryService } from "../legalQueryService";

export class AnthropicProvider implements AIProvider {
    id = "anthropic";
    name = "Anthropic Claude 3.5 Sonnet";

    private defaultModel = "claude-3-5-sonnet-latest";

    private getClient() {
        if (!process.env.ANTHROPIC_API_KEY) {
            throw new Error("ANTHROPIC_API_KEY is not set in environment");
        }
        return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    }

    async chat(params: ChatParams): Promise<ChatResult> {
        if (params.killSwitchActive) throw new Error("KILL_SWITCH_ACTIVE");

        const anthropic = this.getClient();
        const { sanitized } = await PiiService.sanitize(params.input, params.jurisdiction);

        const contextDocs = params.matterId
            ? params.documents.filter(d => d.matterId === params.matterId)
            : params.documents;
        const contextStr = contextDocs.map(d => `Doc: ${d.name} (${d.id})`).join('\n');

        // 2. Search Jurisdictional Legal Knowledge Base (Vector RAG)
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

        const systemPrompt = "You are a senior LexSovereign legal assistant. Task: Provide accurate legal information based ONLY on the provided Gazette excerpts. Rules: 1. If the information is not in the excerpts, state that you cannot find the specific statutory basis. 2. Always cite the Source URL for every claim. 3. Use a professional, sovereign tone. 4. Return JSON object with 'text', 'confidence', and 'references' (Source URLs).";

        try {
            const response = await anthropic.messages.create({
                model: this.defaultModel,
                max_tokens: 1024,
                system: systemPrompt,
                messages: [
                    { role: "user", content: `CONTEXT_DOCUMENTS:\n${contextStr}\n\n${legalKnowledge}\n\nUSER_QUERY: ${sanitized}` }
                ]
            });

            // Extract text from response (handle array of ContentBlocks)
            const textBlock = response.content.find(c => c.type === 'text');
            const content = textBlock?.type === 'text' ? textBlock.text : "{}";

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
                provider: `Anthropic (${this.defaultModel})`,
                references: result.references
            };

        } catch (error: any) {
            console.error("Anthropic Error:", error);
            return {
                text: "Claude Service Unavailable. Operating in offline mode.",
                confidence: 1.0,
                provider: "LexSovereign Local (Offline)",
                references: []
            };
        }
    }

    async explainClause(clauseText: string): Promise<string> {
        const anthropic = this.getClient();
        try {
            const response = await anthropic.messages.create({
                model: this.defaultModel,
                max_tokens: 200,
                system: "You are a legal assistant. Explain intent, not legal advice. Keep under 120 words. Plain English.",
                messages: [
                    { role: "user", content: `Explain this clause: "${clauseText}"` }
                ]
            });
            const textBlock = response.content.find(c => c.type === 'text');
            return textBlock?.type === 'text' ? textBlock.text : "Unable to explain.";
        } catch (e: any) {
            throw new Error(`Anthropic Explain Failed: ${e.message}`);
        }
    }

    // Stub implementations for other methods to ensure interface compliance
    async generateAuditLog(context: any): Promise<string> { return `User ${context.userId} performed ${context.action}.`; }
    async validateDocumentExport(documentContent: string): Promise<{ status: 'PASS' | 'FAIL', issues: string[] }> { return { status: 'PASS', issues: [] }; }
    async generatePricingModel(features: string[]): Promise<any> { return { tiers: [], justification: "Not Implemented" }; }
    async generateExecutiveBriefing(matterId: string, documents: DocumentMetadata[]): Promise<string> { return "Executive Briefing Not Implemented"; }
    async getScrubbedContent(rawContent: string, role: UserRole, privilege: PrivilegeStatus): Promise<{ content: string; scrubbedEntities: number }> { return { content: rawContent, scrubbedEntities: 0 }; }
    async evaluateRRE(text: string, rules: RegulatoryRule[]): Promise<{ isBlocked: boolean; triggeredRule?: string }> { return { isBlocked: false }; }
    async publicChat(input: string, config: ChatbotConfig, knowledge: KnowledgeArtifact[], history?: ChatMessage[]): Promise<{ text: string; confidence: number }> { return { text: "Chatbot Not Implemented", confidence: 0 }; }
    async generateBillingDescription(rawNotes: string): Promise<string> { return rawNotes; }
    async hydrateTemplate(template: any, matter: any): Promise<any> { return {}; }
}
