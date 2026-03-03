
import { UserRole, PrivilegeStatus, DocumentMetadata, RegulatoryRule, ChatbotConfig, KnowledgeArtifact, ChatMessage } from "../types";
import { AIServiceFactory } from "./ai/AIServiceFactory";
import { ChatParams, ChatResult } from "./ai/types";

export class LexAIService {
    // This class is now a facade that delegates to the active AIProvider.
    // It maintains the original method signatures for backward compatibility.

    private getProviders() {
        return AIServiceFactory.getProvidersByPriority();
    }

    private async executeWithFailover<T>(operation: (provider: any) => Promise<T>): Promise<T> {
        const providers = this.getProviders();
        let lastError: any;

        for (const provider of providers) {
            try {
                return await operation(provider);
            } catch (error: any) {
                console.warn(`[AIService] Provider ${provider.id} failed: ${error.message}${error.stack ? '\n' + error.stack : ''}. Trying next fallback...`);
                lastError = error;
            }
        }

        console.error("[AIService] All AI providers failed.");
        throw lastError || new Error("AI Service Unavailable");
    }

    async chat(
        input: string,
        matterId: string | null,
        documents: DocumentMetadata[],
        usePrivateModel: boolean,
        killSwitchActive: boolean,
        useGlobalSearch: boolean = false,
        jurisdiction: string = 'GH'
    ): Promise<ChatResult> {
        const params: ChatParams = {
            input,
            matterId,
            documents,
            usePrivateModel,
            killSwitchActive,
            useGlobalSearch,
            jurisdiction
        };
        return this.executeWithFailover(p => p.chat(params));
    }

    async explainClause(clauseText: string): Promise<string> {
        return this.executeWithFailover(p => p.explainClause(clauseText));
    }

    async generateAuditLog(context: { userId: string, firmId: string, action: string, resourceType: string, resourceId: string }): Promise<string> {
        return this.executeWithFailover(p => p.generateAuditLog(context));
    }

    async validateDocumentExport(documentContent: string): Promise<{ status: 'PASS' | 'FAIL', issues: string[] }> {
        return this.executeWithFailover(p => p.validateDocumentExport(documentContent));
    }

    async generatePricingModel(features: string[]): Promise<any> {
        return this.executeWithFailover(p => p.generatePricingModel(features));
    }

    async generateExecutiveBriefing(matterId: string, documents: DocumentMetadata[]): Promise<string> {
        return this.executeWithFailover(p => p.generateExecutiveBriefing(matterId, documents));
    }

    async getScrubbedContent(
        rawContent: string,
        role: UserRole,
        privilege: PrivilegeStatus
    ): Promise<{ content: string; scrubbedEntities: number }> {
        return this.executeWithFailover(p => p.getScrubbedContent(rawContent, role, privilege));
    }

    async evaluateRRE(text: string, rules: RegulatoryRule[]): Promise<{ isBlocked: boolean; triggeredRule?: string }> {
        return this.executeWithFailover(p => p.evaluateRRE(text, rules));
    }

    async publicChat(input: string, config: ChatbotConfig, knowledge: KnowledgeArtifact[], history?: ChatMessage[]): Promise<{ text: string; confidence: number; provider: string }> {
        return this.executeWithFailover(p => p.publicChat(input, config, knowledge, history));
    }

    async generateBillingDescription(rawNotes: string): Promise<string> {
        return this.executeWithFailover(p => p.generateBillingDescription(rawNotes));
    }

    async hydrateTemplate(template: any, matter: any): Promise<any> {
        return this.executeWithFailover(p => p.hydrateTemplate(template, matter));
    }

    async analyzeDocument(content: string, type: 'CASE' | 'CONTRACT'): Promise<string> {
        return this.executeWithFailover(p => p.analyzeDocument(content, type));
    }
}
