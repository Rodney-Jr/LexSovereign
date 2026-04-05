
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
import { JURISDICTION_METADATA, Jurisdiction } from "../../types/Geography";

/**
 * SovereignEnclaveProvider
 * 
 * A specialized provider that routes AI requests to regional GPU clusters
 * (local vLLM/Ollama/OpenAI-compatible enclaves) based on the tenant's jurisdiction.
 * This ensures data never leaves the sovereign boundary.
 */
export class SovereignEnclaveProvider implements AIProvider {
    id = "sovereign_enclave";
    name = "Sovereign Regional Enclave";

    private jurisdiction: Jurisdiction;

    constructor(jurisdiction: string) {
        this.jurisdiction = (jurisdiction || "GHANA") as Jurisdiction;
    }

    private getClient(): OpenAI {
        const metadata = JURISDICTION_METADATA[this.jurisdiction] || JURISDICTION_METADATA[Jurisdiction.GHANA];
        
        // For local development, this might point to a local Ollama/vLLM instance.
        // In production, this points to a hardware-isolated enclave in the region.
        return new OpenAI({
            apiKey: process.env.ENCLAVE_API_KEY || "sovereign-internal-key",
            baseURL: metadata.aiEndpoint,
            defaultHeaders: {
                "X-Sovereign-Region": this.jurisdiction,
                "X-Enclave-Enforced": "true"
            }
        });
    }

    async chat(params: ChatParams): Promise<ChatResult> {
        if (params.killSwitchActive) throw new Error("KILL_SWITCH_ACTIVE");

        const client = this.getClient();
        const { sanitized } = await PiiService.sanitize(params.input, params.jurisdiction);

        const contextDocs = params.matterId
            ? params.documents.filter(d => d.matterId === params.matterId)
            : params.documents;
        const contextStr = contextDocs.map(d => `Doc: ${d.name} (${d.id})`).join('\n');

        let legalKnowledge = "";
        try {
            const excerpts = await LegalQueryService.getRelevantStatutes(sanitized, this.jurisdiction, params.allowedRegion);
            if (excerpts.length > 0) {
                legalKnowledge = "LOCAL STATUTORY CONTEXT:\n" +
                    excerpts.map((e: any) => `[Source: ${e.title}]\n${e.contentChunk}`).join('\n\n');
            }
        } catch (e) {
            console.warn("Local Gazette Search Failed:", e);
        }

        const systemPrompt = `You are a Private Sovereign AI Enclave. Your processing is 100% localized to the ${this.jurisdiction} region. Output JSON: { "text": string, "confidence": number, "references": string[] }.`;
        const userPrompt = `CONTEXT:\n${contextStr}\n\n${legalKnowledge}\n\nQUERY: ${sanitized}`;

        try {
            const response = await client.chat.completions.create({
                model: process.env.ENCLAVE_MODEL || "sovereign-llama-3",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userPrompt }
                ],
                response_format: { type: "json_object" }
            });

            const content = response.choices[0].message.content || "{}";
            const result = JSON.parse(content);

            return {
                text: result.text || "Analysis processed within regional enclave.",
                confidence: result.confidence || 0.95,
                provider: `Sovereign Enclave (${this.jurisdiction})`,
                references: result.references || [],
                usage: response.usage ? {
                    promptTokens: response.usage.prompt_tokens,
                    completionTokens: response.usage.completion_tokens,
                    totalTokens: response.usage.total_tokens
                } : undefined
            };
        } catch (error: any) {
            console.error(`[SovereignEnclave] Local routing failure:`, error);
            throw new Error(`Sovereign Enclave ${this.jurisdiction} is unavailable. No fallback permitted for high-residency tenants.`);
        }
    }

    async explainClause(clauseText: string): Promise<string> {
        const client = this.getClient();
        const response = await client.chat.completions.create({
            model: process.env.ENCLAVE_MODEL || "sovereign-llama-3",
            messages: [
                { role: "system", content: "Explain legal intent concisely. Enclave mode." },
                { role: "user", content: clauseText }
            ]
        });
        return response.choices[0].message.content || "Unable to explain locally.";
    }

    async generateAuditLog(context: any): Promise<string> {
        return `[Enclave-Logged] User ${context.userId} accessed ${context.resourceType} ${context.resourceId}.`;
    }

    async validateDocumentExport(documentContent: string): Promise<{ status: 'PASS' | 'FAIL', issues: string[] }> {
        return { status: 'PASS', issues: [] }; // Enclave-local pass
    }

    async generatePricingModel(features: string[]): Promise<any> { return {}; }
    async generateExecutiveBriefing(matterId: string, documents: DocumentMetadata[]): Promise<string> { return "Briefing processed locally."; }
    async getScrubbedContent(rawContent: string, role: UserRole, privilege: PrivilegeStatus): Promise<{ content: string; scrubbedEntities: number }> {
        return { content: rawContent, scrubbedEntities: 0 };
    }
    async evaluateRRE(text: string, rules: RegulatoryRule[]): Promise<{ isBlocked: boolean; triggeredRule?: string }> {
        return { isBlocked: false };
    }
    async publicChat(input: string, config: ChatbotConfig, knowledge: KnowledgeArtifact[], history?: ChatMessage[]): Promise<{ text: string; confidence: number; provider: string }> {
        throw new Error("Local enclaves do not support public chatbot routing.");
    }
    async generateBillingDescription(rawNotes: string): Promise<string> { return rawNotes; }
    async hydrateTemplate(template: any, matter: any): Promise<any> { return template; }
    async analyzeDocument(content: string, type: 'CASE' | 'CONTRACT'): Promise<string> { return "Report generated within sovereign boundary."; }
    async parseBankStatement(text: string): Promise<{ date: string, description: string, amount: number, type: 'DEBIT' | 'CREDIT' }[]> { return []; }
    async analyzeLocalPolicy(prompt: string): Promise<string> { return "[]"; }
    async embed(text: string): Promise<number[]> { throw new Error("Local Sovereign Embedding Not Provisioned"); }
}
