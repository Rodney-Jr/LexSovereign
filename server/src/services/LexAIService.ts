
import { UserRole, PrivilegeStatus, DocumentMetadata, RegulatoryRule, ChatbotConfig, KnowledgeArtifact, ChatMessage } from "../types";
import { AIServiceFactory } from "./ai/AIServiceFactory";
import { ChatParams, ChatResult } from "./ai/types";

export class LexAIService {
    // This class is now a facade that delegates to the active AIProvider.
    // It maintains the original method signatures for backward compatibility.

    private getProvider() {
        return AIServiceFactory.getProvider();
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
        return this.getProvider().chat(params);
    }

    async explainClause(clauseText: string): Promise<string> {
        return this.getProvider().explainClause(clauseText);
    }

    async generateAuditLog(context: { userId: string, firmId: string, action: string, resourceType: string, resourceId: string }): Promise<string> {
        return this.getProvider().generateAuditLog(context);
    }

    async validateDocumentExport(documentContent: string): Promise<{ status: 'PASS' | 'FAIL', issues: string[] }> {
        return this.getProvider().validateDocumentExport(documentContent);
    }

    async generatePricingModel(features: string[]): Promise<any> {
        return this.getProvider().generatePricingModel(features);
    }

    async generateExecutiveBriefing(matterId: string, documents: DocumentMetadata[]): Promise<string> {
        return this.getProvider().generateExecutiveBriefing(matterId, documents);
    }

    async getScrubbedContent(
        rawContent: string,
        role: UserRole,
        privilege: PrivilegeStatus
    ): Promise<{ content: string; scrubbedEntities: number }> {
        return this.getProvider().getScrubbedContent(rawContent, role, privilege);
    }

    async evaluateRRE(text: string, rules: RegulatoryRule[]): Promise<{ isBlocked: boolean; triggeredRule?: string }> {
        return this.getProvider().evaluateRRE(text, rules);
    }

    async publicChat(input: string, config: ChatbotConfig, knowledge: KnowledgeArtifact[], history?: ChatMessage[]): Promise<{ text: string; confidence: number }> {
        return this.getProvider().publicChat(input, config, knowledge, history);
    }

    async generateBillingDescription(rawNotes: string): Promise<string> {
        return this.getProvider().generateBillingDescription(rawNotes);
    }

    async hydrateTemplate(template: any, matter: any): Promise<any> {
        return this.getProvider().hydrateTemplate(template, matter);
    }
}
