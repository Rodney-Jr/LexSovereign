import { prisma } from '../db';

export interface AIAnalysisResult {
    score: number;
    summary: string;
    clauses: any[];
    confidence: number;
}

export class AIService {
    /**
     * Check if tenant has enough AI credits
     */
    private static async checkCredits(tenantId: string): Promise<boolean> {
        const tenant = await prisma.tenant.findUnique({
            where: { id: tenantId },
            select: { aiCreditLimit: true, isTrial: true }
        });

        if (!tenant || !tenant.isTrial) return true; // Non-trials or missing tenants bypass for now

        const totalUsed = await prisma.aIUsage.aggregate({
            where: { tenantId },
            _sum: { costCredits: true }
        });

        const used = totalUsed._sum.costCredits || 0;
        return used < tenant.aiCreditLimit;
    }

    /**
     * Log AI Usage
     */
    private static async logUsage(tenantId: string, matterId: string | null, credits: number) {
        await prisma.aIUsage.create({
            data: {
                tenantId,
                matterId,
                modelId: 'nomosdesk-gen-1',
                costCredits: credits,
                promptTokens: 0, // Placeholder
                completionTokens: 0, // Placeholder
                totalTokens: 0 // Placeholder
            }
        });
    }

    /**
     * Generic LLM abstraction - In a production environment, this would call 
     * a Sovereign hosted provider or a secure LLM gateway.
     */
    private static async callLLM(prompt: string, context: { tenantId: string, matterId: string | null }): Promise<string> {
        // 1. Credit Check
        const hasCredits = await this.checkCredits(context.tenantId);
        if (!hasCredits) {
            throw new Error("AI Credits Depleted. Please upgrade your enclave subscription to continue using generative features.");
        }

        // 2. Simulate LLM delay and response
        console.log(`[AIService] Processing prompt for Tenant ${context.tenantId}: ${prompt.substring(0, 50)}...`);

        // 3. Log Usage (Fixed cost per request for now: 1.0 credit)
        await this.logUsage(context.tenantId, context.matterId, 1.0);

        return JSON.stringify({
            score: 0.75,
            summary: "Simulated AI insight based on document analysis.",
            clauses: [{ type: "Indemnity", risk: "Medium", suggestion: "Broaden coverage." }],
            confidence: 0.88
        });
    }

    /**
     * Analyze Contract Risk (CLM)
     */
    static async analyzeContractRisk(tenantId: string, matterId: string, content: string): Promise<AIAnalysisResult> {
        const prompt = `Analyze the following contract for liability, indemnity, and termination risks. Return a JSON structure with score (0-1), summary, and key identified clauses. Content: ${content.substring(0, 2000)}`;

        const llmResponse = await this.callLLM(prompt, { tenantId, matterId });
        const result = JSON.parse(llmResponse);

        // Persist as AIRiskAnalysis
        await prisma.aIRiskAnalysis.create({
            data: {
                matterId,
                tenantId,
                riskScore: result.score,
                summary: result.summary,
                identifiedClauses: result.clauses,
                confidenceScore: result.confidence,
                isValidated: false
            }
        });

        return result;
    }

    /**
     * Summarize Legal Case (Litigation)
     */
    static async summarizeCase(tenantId: string, matterId: string, documents: string[]): Promise<string> {
        const prompt = `Summarize the following legal case based on ${documents?.length || 0} documents. Identify the core dispute, key parties, and pending procedural hurdles.`;

        const summary = await this.callLLM(prompt, { tenantId, matterId });
        const parsed = JSON.parse(summary);

        await prisma.activityEntry.create({
            data: {
                matterId,
                tenantId,
                type: 'AI_INSIGHT',
                details: `Auto-summary generated: ${parsed.summary}`
            }
        });

        return parsed.summary;
    }

    /**
     * Predict Deadline Risk
     */
    static async predictDeadlineRisk(tenantId: string, deadlineId: string): Promise<{ riskLevel: string, reason: string }> {
        const deadlineElement = await prisma.deadline.findUnique({
            where: { id: deadlineId },
            include: { matter: true }
        });

        if (!deadlineElement) throw new Error("Deadline not found");

        const prompt = `Predict the risk of missing this deadline: ${deadlineElement.title} on ${deadlineElement.dueDate}. Context: ${deadlineElement.matter.name}.`;

        await this.callLLM(prompt, { tenantId, matterId: deadlineElement.matterId });

        return { riskLevel: 'Low', reason: 'Historical performance is stable.' };
    }
}
