import { prisma } from '../db';
import { LegalRiskEngine } from '../engines/risk/riskEngine';
import { AIServiceFactory } from './ai/AIServiceFactory';
import { ChatParams } from './ai/types';

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
     * Generic LLM abstraction - Now operationalized via AIServiceFactory
     */
    private static async callLLM(prompt: string, context: { tenantId: string, matterId: string | null }): Promise<string> {
        // 1. Credit Check
        const hasCredits = await this.checkCredits(context.tenantId);
        if (!hasCredits) {
            throw new Error("AI Credits Depleted. Please upgrade your enclave subscription to continue using generative features.");
        }

        // 2. Resolve Provider
        const tenant = await prisma.tenant.findUnique({ where: { id: context.tenantId } });
        const provider = AIServiceFactory.getProvider(tenant);

        console.log(`[AIService] Routing to ${provider.name} for Tenant ${context.tenantId}...`);

        // 3. Execute Chat (Operational)
        const chatParams: ChatParams = {
            input: prompt,
            matterId: context.matterId,
            documents: [], // Context documents could be passed here if available
            usePrivateModel: true,
            killSwitchActive: false,
            useGlobalSearch: true,
            jurisdiction: tenant?.primaryRegion || "GH"
        };

        const result = await provider.chat(chatParams);

        // 4. Log Usage (Real usage tracking)
        const cost = (result.usage?.totalTokens || 1000) / 1000; // Example: 1 credit per 1k tokens
        await this.logUsage(context.tenantId, context.matterId, cost);

        return result.text;
    }

    /**
     * Analyze Contract Risk (CLM) - Operationalized
     */
    static async analyzeContractRisk(tenantId: string, matterId: string, content: string): Promise<AIAnalysisResult> {
        const prompt = `Analyze the following contract for liability, indemnity, and termination risks. Return a JSON structure ONLY with score (0-1), summary, and key identified clauses (array of {type, risk, suggestion}). Content: ${content.substring(0, 4000)}`;

        const llmResponse = await this.callLLM(prompt, { tenantId, matterId });
        
        let result: AIAnalysisResult;
        try {
            result = JSON.parse(llmResponse);
        } catch (e) {
            console.error("[AIService] Failed to parse LLM response as JSON:", llmResponse);
            result = {
                score: 0.5,
                summary: llmResponse,
                clauses: [],
                confidence: 0.5
            };
        }

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
     * Summarize Legal Case (Litigation) - Operationalized
     */
    static async summarizeCase(tenantId: string, matterId: string, documents: string[]): Promise<string> {
        const prompt = `Summarize the following legal case based on the provided document content. Identify the core dispute, key parties, and pending procedural hurdles. Keep it concise and professional. Content: ${documents.join('\n').substring(0, 8000)}`;

        const summary = await this.callLLM(prompt, { tenantId, matterId });

        await prisma.activityEntry.create({
            data: {
                matterId,
                tenantId,
                type: 'AI_INSIGHT',
                details: `Auto-summary generated: ${summary.substring(0, 500)}...`
            }
        });

        return summary;
    }

    /**
     * Predict Deadline Risk - Operationalized
     */
    static async predictDeadlineRisk(tenantId: string, deadlineId: string): Promise<{ riskLevel: string, reason: string }> {
        const deadlineElement = await prisma.deadline.findUnique({
            where: { id: deadlineId },
            include: { matter: true }
        });

        if (!deadlineElement) throw new Error("Deadline not found");

        const prompt = `Assess the risk of missing this legal deadline. Return a JSON object with 'riskLevel' (High/Medium/Low) and 'reason'. 
        Deadline: ${deadlineElement.title} on ${deadlineElement.dueDate}. 
        Matter Context: ${deadlineElement.matter.name} (${deadlineElement.matter.status}).`;

        const response = await this.callLLM(prompt, { tenantId, matterId: deadlineElement.matterId });
        
        try {
            return JSON.parse(response);
        } catch {
            return { riskLevel: 'Medium', reason: response };
        }
    }

    /**
     * AI Copilot: Identify Drafting Context
     */
    static async identifyDraftingContext(tenantId: string, content: any) {
        if (!content || typeof content !== 'string') {
            console.warn("[AIService] identifyDraftingContext received non-string content.");
            return {
                sectionName: "General Provisions",
                documentType: "Legal Instrument",
                jurisdiction: "Ghana",
                confidenceLevel: "LOW"
            };
        }

        const contentLower = content.toLowerCase();
        
        let sectionName = "General Provisions";
        let documentType = "Legal Instrument";
        let confidenceLevel = "MEDIUM";

        if (contentLower.includes("termination")) sectionName = "Termination Clause";
        else if (contentLower.includes("indemnity")) sectionName = "Indemnification";
        else if (contentLower.includes("confidentiality")) sectionName = "Confidentiality";
        else if (contentLower.includes("governing law")) sectionName = "Governing Law";

        if (contentLower.includes("agreement") || contentLower.includes("contract")) documentType = "Commercial Agreement";
        if (contentLower.includes("deed")) documentType = "Deed of Conveyance";
        if (contentLower.includes("employment")) documentType = "Employment Contract";

        if (content.length > 500) confidenceLevel = "HIGH";

        return {
            sectionName,
            documentType,
            jurisdiction: "Ghana",
            confidenceLevel
        };
    }

    /**
     * AI Copilot: Suggest Clauses based on document context
     */
    static async suggestClauses(tenantId: string, content: any, jurisdiction: string = 'Ghana') {
        const text = typeof content === 'string' ? content : "";
        const contentLower = text.toLowerCase();
        const detectedKeywords = ['indemnity', 'termination', 'confidentiality', 'disclosure', 'liability', 'governing law', 'force majeure', 'lease', 'employment'];
        const matchedKeywords = detectedKeywords.filter(k => contentLower.includes(k));

        const relevantClauses = await (prisma as any).clause.findMany({
            where: {
                OR: [
                    { category: { in: matchedKeywords.map(k => k.toUpperCase()) } },
                    { jurisdiction: jurisdiction },
                    { isGlobal: true }
                ]
            },
            take: 5,
            orderBy: { usageCount: 'desc' }
        });

        return relevantClauses.map((clause: any) => ({
            title: clause.title,
            previewText: (clause.content as any)?.content?.[0]?.content?.[0]?.text || "Preview of clause content...",
            reason: `Highly relevant to the ${clause.category} patterns detected in your draft.`,
            clause
        }));
    }

    /**
     * AI Copilot: Detect Drafting Risks (Deterministic Rule-Based)
     */
    static async detectDraftingRisks(tenantId: string, content: any) {
        const text = typeof content === 'string' ? content : "";
        // High fidelity, jurisdiction-aware risk detection
        const risks = await LegalRiskEngine.evaluate(text);
        
        return risks.map(risk => ({
            id: risk.id,
            severity: risk.severity.toUpperCase(), // Match frontend component names
            title: risk.title,
            description: risk.description,
            actionLabel: risk.recommendation, // Use recommendation for label
            actionType: risk.action
        }));
    }

    /**
     * AI Copilot: Process Natural Language Command
     */
    /**
     * AI Copilot: Process Natural Language Command
     */
    static async processCopilotCommand(tenantId: string, command: string, context: string) {
        const cmd = command.toLowerCase();
        
        // 1. Termination Intent
        if (cmd.includes("termination")) {
            const clause = await (prisma as any).clause.findFirst({ where: { category: "TERMINATION" } });
            return { 
                action: "INSERT", 
                content: clause?.content || "This agreement may be terminated by either party upon thirty (30) days' written notice.", 
                title: "Termination Clause" 
            };
        }

        // 2. Indemnity Intent
        if (cmd.includes("indemnity") || cmd.includes("indemnify")) {
             const clause = await (prisma as any).clause.findFirst({ where: { category: "INDEMNITY" } });
             return { 
                 action: "INSERT", 
                 content: clause?.content || "Each party shall indemnify and hold harmless the other from and against any third-party claims...", 
                 title: "Indemnity Clause" 
             };
        }

        // 3. Governing Law Intent (Ghana-specific)
        if (cmd.includes("governing law") || cmd.includes("laws of ghana")) {
             return {
                 action: "INSERT",
                 content: "This Agreement shall be governed by and construed in accordance with the laws of the Republic of Ghana.",
                 title: "Governing Law"
             };
        }

        // 4. Dispute Resolution / Arbitration (Ghana-specific)
        if (cmd.includes("dispute") || cmd.includes("arbitration")) {
             return {
                 action: "INSERT",
                 content: "Any dispute arising out of or in connection with this contract shall be referred to and finally resolved by arbitration under the rules of the Ghana Arbitration Centre.",
                 title: "Arbitration Clause"
             };
        }

        // 5. Execution Block
        if (cmd.includes("execution") || cmd.includes("signature") || cmd.includes("sign")) {
             return {
                action: "INSERT",
                content: "\n\nIN WITNESS WHEREOF, the parties hereto have executed this Agreement as of the date first written above.\n\n__________________________\nParty A\n\n__________________________\nParty B\n",
                title: "Execution Block"
             };
        }

        // 6. Generic Generative Fallback - Operationalized
        const response = await this.callLLM(command, { tenantId, matterId: null });
        return { 
            action: "CHAT", 
            message: response 
        };
    }

    /**
     * Smart Fill: Hydrate template placeholders with matter context
     */
    static async hydrateTemplate(tenantId: string, matterId: string, content: string): Promise<string> {
        // 1. Fetch Matter context with high-fidelity relations
        const matter = await prisma.matter.findUnique({
            where: { id: matterId },
            include: {
                clientRef: true,
                tenant: true
            }
        });

        if (!matter || matter.tenantId !== tenantId) {
            console.warn(`[SmartFill] Matter ${matterId} not found or tenant mismatch.`);
            return content;
        }

        // 2. Build the expansion map
        const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
        const expansionMap: Record<string, string> = {
            'company_name': matter.clientRef?.name || '________________',
            'client_name': matter.clientRef?.name || '________________',
            'matter_name': matter.name,
            'matter_id': matter.id,
            'agreement_date': today,
            'effective_date': today,
            'start_date': today,
            'current_date': today,
            'jurisdiction': matter.tenant?.primaryRegion || 'Ghana',
            'governing_law': `the laws of ${matter.tenant?.primaryRegion || 'the Republic of Ghana'}`
        };

        // 3. Batch Replacement Logic (Regex Case-Insensitive)
        let hydratedContent = content;
        for (const [key, value] of Object.entries(expansionMap)) {
            const regex = new RegExp(`{{${key}}}`, 'gi');
            hydratedContent = hydratedContent.replace(regex, value);
        }

        // 4. Log AI use for hydration
        await this.logUsage(tenantId, matterId, 0.5);

        return hydratedContent;
    }
}
