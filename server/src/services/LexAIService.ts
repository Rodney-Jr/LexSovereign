
import { UserRole, PrivilegeStatus, DocumentMetadata, RegulatoryRule, ChatbotConfig, KnowledgeArtifact, ChatMessage } from "../types";
import { AIServiceFactory } from "./ai/AIServiceFactory";
import { ChatParams, ChatResult } from "./ai/types";

export class LexAIService {
    // This class is now a facade that delegates to the active AIProvider.
    // It maintains the original method signatures for backward compatibility.

    private getProviders() {
        return AIServiceFactory.getProvidersByPriority();
    }

    private async executeWithFailover<T>(operation: (provider: any) => Promise<T>, options?: { enforceSovereign?: boolean }): Promise<T> {
        const providers = this.getProviders();
        const enforced = options?.enforceSovereign || process.env.ENFORCE_SOVEREIGN_AI === 'true';
        let lastError: any;

        for (const provider of providers) {
            try {
                return await operation(provider);
            } catch (error: any) {
                const message = error.message.toLowerCase();
                const isTerminal = message.includes("402") || message.includes("payment required") ||
                    message.includes("429") || message.includes("quota exceeded") ||
                    message.includes("insufficient_quota");

                console.warn(`[AIService] Provider ${provider.id} failed: ${error.message}${error.stack ? '\n' + error.stack : ''}.`);

                if (isTerminal) {
                    console.error(`[AIService] Terminal error reached on ${provider.id}. Halting failover to preserve enclave integrity.`);
                    throw error;
                }

                if (enforced && provider.id === providers[0].id) {
                    console.error(`[AIService] SOVEREIGN_ENFORCEMENT ACTIVE. Fallback bypassed after primary (${provider.id}) failure.`);
                    throw error;
                }

                console.warn(`[AIService] Trying next fallback...`);
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
        jurisdiction: string = 'GH',
        allowedRegion?: string,
        tenantId?: string
    ): Promise<ChatResult> {
        const params: ChatParams = {
            input,
            matterId,
            documents,
            usePrivateModel,
            killSwitchActive,
            useGlobalSearch,
            jurisdiction,
            allowedRegion
        };
        const result = (await this.executeWithFailover(p => p.chat(params))) as ChatResult;

        // Log AI Usage for Metered Billing
        if (result.usage && tenantId) {
            try {
                const { prisma } = await import('../db');
                // Calculate weighted credits: 1 credit per 10k input or 2k output tokens
                const inputWeight = result.usage.promptTokens / 10000;
                const outputWeight = result.usage.completionTokens / 2000;
                const costCredits = Number((inputWeight + outputWeight).toFixed(4));

                await (prisma as any).aIUsage.create({
                    data: {
                        tenantId: tenantId,
                        matterId: matterId,
                        modelId: result.provider || 'default',
                        promptTokens: result.usage.promptTokens,
                        completionTokens: result.usage.completionTokens,
                        totalTokens: result.usage.totalTokens,
                        costCredits: costCredits
                    }
                });

                (result as any).calculatedCredits = costCredits;
            } catch (e) {
                console.error("[LexAIService] Usage logging failed:", e);
            }
        }

        return result;
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
        return this.executeWithFailover(p => p.analyzeDocument(content, type), { enforceSovereign: true });
    }

    async parseBankStatement(text: string): Promise<{ date: string, description: string, amount: number, type: 'DEBIT' | 'CREDIT' }[]> {
        return this.executeWithFailover(p => p.parseBankStatement(text), { enforceSovereign: true });
    }

    async analyzeLocalPolicy(prompt: string): Promise<string> {
        return this.executeWithFailover(p => p.analyzeLocalPolicy(prompt));
    }
}
