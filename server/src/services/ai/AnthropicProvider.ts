
import Anthropic from "@anthropic-ai/sdk";
import { UserRole, PrivilegeStatus, DocumentMetadata, RegulatoryRule, ChatbotConfig, KnowledgeArtifact } from "../../types";
import { AIProvider, ChatParams, ChatResult } from "./types";
import { PiiService } from "../piiService";
import { AuditorService } from "../auditorService";
import { prisma } from "../../db";

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
        const { sanitized } = PiiService.sanitize(params.input);

        const contextDocs = params.matterId
            ? params.documents.filter(d => d.matterId === params.matterId)
            : params.documents;
        const contextStr = contextDocs.map(d => `Doc: ${d.name} (${d.id})`).join('\n');

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
    async publicChat(input: string, config: ChatbotConfig, knowledge: KnowledgeArtifact[]): Promise<{ text: string; confidence: number }> { return { text: "Chatbot Not Implemented", confidence: 0 }; }
    async generateBillingDescription(rawNotes: string): Promise<string> { return rawNotes; }
    async hydrateTemplate(template: any, matter: any): Promise<any> { return {}; }
}
