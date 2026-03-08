
import { GoogleGenerativeAI } from "@google/generative-ai";
import { UserRole, PrivilegeStatus, DocumentMetadata, RegulatoryRule, TimeEntry, ChatbotConfig, KnowledgeArtifact, ChatMessage } from "../../types";
import { prisma } from "../../db";
import { PiiService } from "../piiService";
import { AuditorService } from "../auditorService";
import { AIProvider, ChatParams, ChatResult } from "./types";
import { LegalQueryService } from "../legalQueryService";

export class GeminiProvider implements AIProvider {
    id = "gemini";
    name = "Google Gemini";

    // Default model to use if not overridden
    private defaultModel = "gemini-1.5-flash";

    private getAI() {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error("GEMINI_API_KEY is not set in environment");
        }
        return new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    }

    async chat(params: ChatParams): Promise<ChatResult> {
        if (params.killSwitchActive) {
            throw new Error("KILL_SWITCH_ACTIVE");
        }

        const ai = this.getAI();
        const modelName = process.env.GEMINI_MODEL || this.defaultModel;

        const contextDocs = params.matterId
            ? params.documents.filter(d => d.matterId === params.matterId)
            : params.documents;

        const contextStr = contextDocs.map(d => `Doc: ${d.name} (${d.id}), Matter: ${d.matterId}`).join('\n');

        // 1. PII Sanitization (DAS Engine)
        const { sanitized, entityMap } = await PiiService.sanitize(params.input, params.jurisdiction);

        // 2. Search Jurisdictional Legal Knowledge Base (Vector RAG)
        let legalKnowledge = "";
        try {
            const region = params.jurisdiction || "GH"; // Default to GH if not specified
            const excerpts = await LegalQueryService.getRelevantStatutes(sanitized, region, params.allowedRegion);

            if (excerpts.length > 0) {
                legalKnowledge = "REGION-SPECIFIC STATUTORY CONTEXT (OFFICIAL GAZETTE):\n" +
                    excerpts.map(e => `[Source: ${e.title} | URL: ${e.sourceUrl}]\n${e.contentChunk}`).join('\n\n');
            }
        } catch (e) {
            console.warn("Gazette RAG Search Failed:", e);
        }

        const genModel = ai.getGenerativeModel({
            model: modelName,
            systemInstruction: "You are a senior NomosDesk legal assistant. Task: Provide accurate legal information based ONLY on the provided Gazette excerpts. Rules: 1. If the information is not in the excerpts, state that you cannot find the specific statutory basis. 2. Always cite the Source URL for every claim. 3. Use a professional, sovereign tone. 4. Return JSON object with 'text', 'confidence', and 'references' (Source URLs).",
            generationConfig: {
                responseMimeType: "application/json"
            }
        });

        const prompt = `CONTEXT_DOCUMENTS:\n${contextStr}\n\n${legalKnowledge}\n\nUSER_QUERY: ${sanitized}`;

        const genResult = await genModel.generateContent(prompt);
        const responseText = genResult.response.text();

        // Extract search grounding metadata if available
        const groundingSources: { title: string, uri: string }[] = [];
        const chunks = genResult.response.candidates?.[0]?.groundingMetadata?.groundingChunks;
        if (chunks) {
            chunks.forEach((chunk: any) => {
                if (chunk.web) {
                    groundingSources.push({ title: chunk.web.title, uri: chunk.web.uri });
                }
            });
        }

        let data;
        try {
            data = JSON.parse(responseText || '{}');
        } catch {
            data = { text: responseText, confidence: 0.9, references: [] };
        }

        // 2. Auditor Check (Red Team)
        const audit = await AuditorService.scan(data.text || "");
        let finalText = data.text;

        if (audit.flagged) {
            finalText = `[AUDIT BLOCK] Content Redacted by Sovereign Governance Layer.\nReason: ${audit.reason}\nRisk Score: ${audit.riskScore}`;
        }

        return {
            text: finalText || "I am analyzing the sovereign research stream...",
            confidence: audit.flagged ? 0.0 : (data.confidence || 0),
            provider: `Gemini (${modelName})`,
            references: data.references,
            groundingSources: groundingSources.length > 0 ? groundingSources : undefined,
            usage: genResult.response.usageMetadata ? {
                promptTokens: genResult.response.usageMetadata.promptTokenCount || 0,
                completionTokens: genResult.response.usageMetadata.candidatesTokenCount || 0,
                totalTokens: genResult.response.usageMetadata.totalTokenCount || 0
            } : undefined
        };
    }

    async explainClause(clauseText: string): Promise<string> {
        const ai = this.getAI();
        try {
            const model = ai.getGenerativeModel({
                model: this.defaultModel,
                systemInstruction: "You are a legal assistant explaining a contract clause. Rules: 1. Explain intent, not legal advice. 2. No jurisdiction-specific interpretation. 3. No recommendations to change the clause. 4. Keep explanation under 120 words. 5. Output plain English explanation only.",
            });
            const result = await model.generateContent(`Explain this legal clause to a junior lawyer: "${clauseText}"`);
            return result.response.text() || "Unable to explain clause at this time.";
        } catch (error: any) {
            console.error("Gemini API Error (ExplainClause):", error);
            throw new Error(`Clause explanation failed: ${error.message}`);
        }
    }

    async generateAuditLog(context: { userId: string, firmId: string, action: string, resourceType: string, resourceId: string }): Promise<string> {
        const ai = this.getAI();
        try {
            const model = ai.getGenerativeModel({
                model: this.defaultModel,
                systemInstruction: "You are an audit logging system for a Legal Ops platform. Task: Generate a clear, immutable audit description suitable for regulators. Rules: 1. No opinions. 2. No assumptions. 3. Past tense. 4. Objective language. Output: Single sentence audit_log_message only.",
            });
            const result = await model.generateContent(`Generate an audit log for: ${JSON.stringify(context)}`);
            return result.response.text()?.trim() || "Audit log generation failed.";
        } catch (error: any) {
            console.error("Gemini API Error (AuditLog):", error.message);
            return `User ${context.userId} performed ${context.action} on ${context.resourceType} ${context.resourceId}.`;
        }
    }

    async validateDocumentExport(documentContent: string): Promise<{ status: 'PASS' | 'FAIL', issues: string[] }> {
        const ai = this.getAI();
        const model = ai.getGenerativeModel({
            model: this.defaultModel,
            systemInstruction: "You are validating a legal document before export. Checklist: 1. All variables resolved (no {{brackets}}). 2. Clause numbering sequential. 3. No placeholder text (e.g. [INSERT DATE]). 4. Title present. 5. Footer metadata present. Output: JSON { status: 'PASS' | 'FAIL', issues: string[] }.",
            generationConfig: {
                responseMimeType: "application/json",
            }
        });
        const resultFull = await model.generateContent(`Validate this legal document content: "${documentContent.substring(0, 10000)}..."`);
        const result = JSON.parse(resultFull.response.text() || '{ "status": "FAIL", "issues": ["AI Validation Failed"] }');
        return result;
    }

    async generatePricingModel(features: string[]): Promise<any> {
        const ai = this.getAI();
        try {
            const model = ai.getGenerativeModel({
                model: this.defaultModel,
                systemInstruction: "You are designing pricing tiers for a Legal Ops SaaS. Target: small law firms, in-house teams. Task: 1. Propose Free, Pro, and Enterprise tiers. 2. Assign features logically. 3. Avoid feature cannibalization. 4. Ensure Free tier demonstrates value but enforces limits. Output: JSON structure with 'tiers' (array of {name, price, features, limits}) and 'justification' (string).",
                generationConfig: {
                    responseMimeType: "application/json",
                }
            });
            const resultFull = await model.generateContent(`Create pricing tiers for these features: ${JSON.stringify(features)}`);
            const result = JSON.parse(resultFull.response.text() || '{ "tiers": [], "justification": "Generation Failed" }');
            return result;
        } catch (error: any) {
            console.error("Gemini API Error (PricingMapper):", error.message);
            return { tiers: [], justification: "Service Unavailable" };
        }
    }

    async generateExecutiveBriefing(matterId: string, documents: DocumentMetadata[]): Promise<string> {
        const ai = this.getAI();
        const docs = documents.filter(d => d.matterId === matterId);
        const context = docs.map(d => `${d.name} (${d.jurisdiction})`).join(', ');

        const model = ai.getGenerativeModel({
            model: this.defaultModel,
            systemInstruction: "You are the Chief Legal Ops AI. Summarize the status of a legal matter for a Managing Partner. Use bullet points and a professional, sovereign tone. Max 300 words.",
        });

        const result = await model.generateContent(`Generate a high-velocity executive briefing for Matter ${matterId} based on these artifacts: ${context}. Focus on: 1. Risk Heatmap 2. Key Deadlines 3. Critical Clause Anomalies.`);

        return result.response.text() || "Matter synthesis failed at the enclave layer.";
    }

    async getScrubbedContent(
        rawContent: string,
        role: UserRole,
        privilege: PrivilegeStatus
    ): Promise<{ content: string; scrubbedEntities: number }> {
        const isRestricted = role === UserRole.EXTERNAL_COUNSEL || role === UserRole.CLIENT;

        if (!isRestricted) {
            return { content: rawContent, scrubbedEntities: 0 };
        }

        const ai = this.getAI();
        const prompt = `
      ROLE: ${role}
      PRIVILEGE_LEVEL: ${privilege}
      TASK: Redact PII and privileged legal reasoning from the following text.
      RULES:
      1. Replace names with [NAME], dates with [DATE], amounts with [VALUE].
      
      TEXT: ${rawContent}
    `;

        try {
            const model = ai.getGenerativeModel({
                model: this.defaultModel,
                generationConfig: { temperature: 0 }
            });
            const result = await model.generateContent(prompt);
            const scrubbed = result.response.text() || "[CONTENT REDACTED BY SOVEREIGN PROXY]";
            const entitiesRemoved = (scrubbed.match(/\[.*?\]/g) || []).length;
            return { content: scrubbed, scrubbedEntities: entitiesRemoved };
        } catch (error) {
            console.error("Scrubbing API Failed:", error);
            return { content: "[SYSTEM_AUDIT: CONTENT REDACTED DUE TO ENCLAVE DISCONNECTION]", scrubbedEntities: 999 };
        }
    }

    async evaluateRRE(text: string, rules: RegulatoryRule[]): Promise<{ isBlocked: boolean; triggeredRule?: string }> {
        const ai = this.getAI();
        const activeRules = rules.filter(r => r.isActive).map(r => `${r.name}: ${r.description}`).join('\n');

        if (!activeRules) return { isBlocked: false };

        try {
            const model = ai.getGenerativeModel({
                model: this.defaultModel,
                generationConfig: {
                    responseMimeType: "application/json",
                }
            });
            const resultFull = await model.generateContent(`RULES:\n${activeRules}\n\nTEXT_TO_EVALUATE: ${text}\n\nAssess if the text violates any rules. Return JSON: { "isBlocked": boolean, "triggeredRule": string | null }. STRICT COMPLIANCE.`);

            const result = JSON.parse(resultFull.response.text() || '{ "isBlocked": false }');
            return { isBlocked: result.isBlocked, triggeredRule: result.triggeredRule };
        } catch (error) {
            console.error("Gemini API Error (EvaluateRRE):", error);
            return { isBlocked: false };
        }
    }

    async publicChat(input: string, config: ChatbotConfig, knowledge: KnowledgeArtifact[], history?: ChatMessage[]): Promise<{ text: string; confidence: number; provider: string }> {
        if (!config.isEnabled) throw new Error("CHATBOT_DISABLED_GEMINI");

        const ai = this.getAI();
        const knowledgeContext = knowledge.map(k => `${k.title}: ${k.content}`).join('\n\n');

        // Prepare conversation history for Gemini
        const historyContents = (history || []).map(msg => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }]
        }));

        const model = ai.getGenerativeModel({
            model: this.defaultModel,
            systemInstruction: config.systemInstruction
        });

        const result = await model.generateContent({
            contents: [
                ...historyContents,
                {
                    role: 'user',
                    parts: [{ text: `KNOWLEDGE_BASE:\n${knowledgeContext}\n\nUSER: ${input}` }]
                }
            ]
        });

        return { text: result.response.text() || "I am unable to answer that at this time.", confidence: 0.9, provider: this.id };
    }

    async generateBillingDescription(rawNotes: string): Promise<string> {
        const ai = this.getAI();
        try {
            const model = ai.getGenerativeModel({
                model: this.defaultModel,
            });
            const result = await model.generateContent(`Convert these raw notes into a professional legal billing narrative (max 1 sentence): "${rawNotes}"`);
            return result.response.text() || rawNotes;
        } catch (error: any) {
            throw new Error(`Billing Generation Failed: ${error.message}`);
        }
    }

    async hydrateTemplate(template: any, matter: any): Promise<any> {
        const ai = this.getAI();
        try {
            const context = JSON.stringify({
                matter: {
                    name: matter.name,
                    client: matter.client,
                    type: matter.type,
                    description: matter.description
                },
                documents: matter.documents.map((d: any) => ({ name: d.name, content: d.content?.substring(0, 2000) }))
            });

            const prompt = `
            TASK: Fill in the variable fields for a document template based on the provided matter context.
            TEMPLATE_NAME: ${template.name}
            FIELDS_TO_FILL: ${JSON.stringify(template.structure.fields || template.structure)}
            
            MATTER_CONTEXT: ${context}
            
            RULE: Return a JSON object mapping each field key to the extracted value. If information is missing, use an empty string. Be accurate.
            OUTPUT: JSON map of field keys to values.
            `;

            const model = ai.getGenerativeModel({
                model: this.defaultModel,
                generationConfig: {
                    responseMimeType: "application/json",
                }
            });

            const result = await model.generateContent(prompt);

            return JSON.parse(result.response.text() || '{}');
        } catch (error: any) {
            console.error("Gemini API Error (HydrateTemplate):", error.message);
            return {};
        }
    }

    async analyzeDocument(content: string, type: 'CASE' | 'CONTRACT'): Promise<string> {
        const ai = this.getAI();
        const systemInstruction = type === 'CONTRACT'
            ? "You are a senior Corporate Counsel. Task: Analyze the provided contract. Output a structured report with: 1. Executive Summary 2. Key Obligations 3. High-Risk Clauses 4. Missing Protections 5. Negotiation Recommendations. Use professional, sovereign tone. Max 800 words."
            : "You are a senior Litigator. Task: Analyze the provided case document/pleading. Output a structured report with: 1. Case Summary 2. Core Legal Issues 3. Strength of Arguments 4. Procedural Gaps 5. Recommended Next Steps. Use professional, sovereign tone. Max 800 words.";

        try {
            const model = ai.getGenerativeModel({
                model: this.defaultModel,
                systemInstruction,
            });
            const result = await model.generateContent(`DOCUMENT_CONTENT:\n${content.substring(0, 30000)}`);
            return result.response.text() || "Analysis engine failed to generate a report.";
        } catch (error: any) {
            console.error(`Gemini API Error (AnalyzeDocument - ${type}):`, error.message);
            throw new Error(`Document analysis failed: ${error.message}`);
        }
    }

    async parseBankStatement(text: string): Promise<{ date: string, description: string, amount: number, type: 'DEBIT' | 'CREDIT' }[]> {
        // Fallback to Anthropic implementation behavior if called, or implement full Gemini parsing
        return [];
    }

    async analyzeLocalPolicy(prompt: string): Promise<string> {
        const ai = this.getAI();
        const model = ai.getGenerativeModel({
            model: this.defaultModel,
            systemInstruction: "You are an AI assistant analyzing system activity to suggest timesheet entries."
        });
        const result = await model.generateContent(prompt);
        return result.response.text() || "[]";
    }
}
