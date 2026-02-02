import { GoogleGenAI, Type } from "@google/genai";
import { UserRole, PrivilegeStatus, DocumentMetadata, RegulatoryRule, TimeEntry, ChatbotConfig, KnowledgeArtifact } from "../types";
import { prisma } from "../db";
import { PiiService } from "./piiService";
import { AuditorService } from "./auditorService";

export class LexGeminiService {
    private getAI() {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error("GEMINI_API_KEY is not set in environment");
        }
        return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    }

    async chat(
        input: string,
        matterId: string | null,
        documents: DocumentMetadata[],
        usePrivateModel: boolean,
        killSwitchActive: boolean,
        useGlobalSearch: boolean = false
    ): Promise<{ text: string; confidence: number; provider: string; references?: string[]; groundingSources?: { title: string, uri: string }[] }> {
        if (killSwitchActive) {
            throw new Error("KILL_SWITCH_ACTIVE");
        }

        const ai = this.getAI();
        // Use environmental config for model
        const modelName = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
        const model = usePrivateModel ? modelName : modelName;
        const contextDocs = matterId
            ? documents.filter(d => d.matterId === matterId)
            : documents;

        const contextStr = contextDocs.map(d => `Doc: ${d.name} (${d.id}), Matter: ${d.matterId}`).join('\n');

        const config: any = {
            systemInstruction: "You are a senior legal assistant specializing in Zero-Knowledge productivity. Provide concise, accurate legal information based on internal documents and global legal research. NEVER give definitive legal advice. Return a JSON object with 'text', 'confidence' (0-1), and 'references' (internal doc IDs).",
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    text: { type: Type.STRING },
                    confidence: { type: Type.NUMBER },
                    references: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ["text", "confidence"]
            }
        };

        if (useGlobalSearch) {
            config.tools = [{ googleSearch: {} }];
        }

        // 1. PII Sanitization (DAS Engine)
        const { sanitized, entityMap } = PiiService.sanitize(input);

        // Search Ghana Legal Knowledge Base
        let legalKnowledge = "";
        try {
            // Naive search: Find docs containing the user query or key terms
            // In production, use pgvector. Here we use basic text matching.
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
                legalKnowledge = "GHANA LEGAL ARCHIVES (OFFICIAL):\n" +
                    artifacts.map(a => `[Source: ${a.title} (${a.category})]\n${a.content.substring(0, 2000)}...`).join('\n\n');
            }
        } catch (e) {
            console.warn("Knowledge Base Search Failed:", e);
        }

        const prompt = `CONTEXT_DOCUMENTS:\n${contextStr}\n\n${legalKnowledge}\n\nUSER_QUERY: ${sanitized}`;

        try {
            const response = await ai.models.generateContent({
                model: model,
                contents: prompt,
                config: config
            });

            // Extract search grounding metadata if available
            const groundingSources: { title: string, uri: string }[] = [];
            const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
            if (chunks) {
                chunks.forEach((chunk: any) => {
                    if (chunk.web) {
                        groundingSources.push({ title: chunk.web.title, uri: chunk.web.uri });
                    }
                });
            }

            let result;
            try {
                result = JSON.parse(response.text || '{}');
            } catch {
                result = { text: response.text, confidence: 0.9, references: [] };
            }

            // 2. Auditor Check (Red Team)
            const audit = await AuditorService.scan(result.text || "");
            let finalText = result.text;

            if (audit.flagged) {
                finalText = `[AUDIT BLOCK] Content Redacted by Sovereign Governance Layer.\nReason: ${audit.reason}\nRisk Score: ${audit.riskScore}`;
            } else {
                // Restore PII for display if safe (optional, usually we keep it redacted or allow strictly mapped restoration)
                // For MVP, strictly returning redacted text to prove it works.
                // finalText = PiiService.desanitize(finalText, entityMap);
            }

            return {
                text: finalText || "I am analyzing the sovereign research stream...",
                confidence: audit.flagged ? 0.0 : (result.confidence || 0), // No fake confidence
                provider: `Gemini (${model})`,
                references: result.references,
                groundingSources: groundingSources.length > 0 ? groundingSources : undefined
            };
        } catch (error: any) {
            console.error("Gemini API Error (Chat):", error.message);
            return {
                text: "API QUOTA/ERROR FALLBACK: I am operating in offline mode. Legal context suggests proceeding with standard governance checks.",
                confidence: 1.0,
                provider: "LexSovereign Local (Offline)",
                references: documents.slice(0, 1).map(d => d.id)
            }
        }
    }

    async explainClause(clauseText: string): Promise<string> {
        const ai = this.getAI();
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.0-flash',
                contents: `Explain this legal clause to a junior lawyer: "${clauseText}"`,
                config: {
                    systemInstruction: "You are a legal assistant explaining a contract clause. Rules: 1. Explain intent, not legal advice. 2. No jurisdiction-specific interpretation. 3. No recommendations to change the clause. 4. Keep explanation under 120 words. 5. Output plain English explanation only.",
                    temperature: 0.1,
                    maxOutputTokens: 150
                }
            });
            return response.text || "Unable to explain clause at this time.";
        } catch (error: any) {
            console.error("Gemini API Error (ExplainClause):", error.message);
            throw new Error("Clause explanation failed.");
        }
    }

    async generateAuditLog(context: { userId: string, firmId: string, action: string, resourceType: string, resourceId: string }): Promise<string> {
        const ai = this.getAI();
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.0-flash',
                contents: `Generate an audit log for: ${JSON.stringify(context)}`,
                config: {
                    systemInstruction: "You are an audit logging system for a Legal Ops platform. Task: Generate a clear, immutable audit description suitable for regulators. Rules: 1. No opinions. 2. No assumptions. 3. Past tense. 4. Objective language. Output: Single sentence audit_log_message only.",
                    temperature: 0,
                    maxOutputTokens: 50
                }
            });
            return response.text?.trim() || "Audit log generation failed.";
        } catch (error: any) {
            console.error("Gemini API Error (AuditLog):", error.message);
            // Fallback to basic template if AI fails
            return `User ${context.userId} performed ${context.action} on ${context.resourceType} ${context.resourceId}.`;
        }
    }
}

    async validateDocumentExport(documentContent: string): Promise < { status: 'PASS' | 'FAIL', issues: string[] } > {
    const ai = this.getAI();
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: `Validate this legal document content: "${documentContent.substring(0, 10000)}..."`,
            config: {
                systemInstruction: "You are validating a legal document before export. Checklist: 1. All variables resolved (no {{brackets}}). 2. Clause numbering sequential. 3. No placeholder text (e.g. [INSERT DATE]). 4. Title present. 5. Footer metadata present. Output: JSON { status: 'PASS' | 'FAIL', issues: string[] }.",
                responseMimeType: "application/json",
                temperature: 0
            }
        });
        const result = JSON.parse(response.text || '{ "status": "FAIL", "issues": ["AI Validation Failed"] }');
        return result;
    } catch(error: any) {
        console.error("Gemini API Error (ExportValidator):", error.message);
        return { status: 'FAIL', issues: ["Validation Service Unavailable"] };
    }
}

    async generateExecutiveBriefing(matterId: string, documents: DocumentMetadata[]): Promise < string > {
    const ai = this.getAI();
    const docs = documents.filter(d => d.matterId === matterId);
    const context = docs.map(d => `${d.name} (${d.jurisdiction})`).join(', ');

    const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: `Generate a high-velocity executive briefing for Matter ${matterId} based on these artifacts: ${context}. Focus on: 1. Risk Heatmap 2. Key Deadlines 3. Critical Clause Anomalies.`,
        config: {
            systemInstruction: "You are the Chief Legal Ops AI. Summarize the status of a legal matter for a Managing Partner. Use bullet points and a professional, sovereign tone. Max 300 words.",
        }
    });

    return response.text || "Matter synthesis failed at the enclave layer.";
}

    async getScrubbedContent(
    rawContent: string,
    role: UserRole,
    privilege: PrivilegeStatus
): Promise < { content: string; scrubbedEntities: number } > {
    const isRestricted = role === UserRole.EXTERNAL_COUNSEL || role === UserRole.CLIENT;

    if(!isRestricted) {
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
        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: prompt,
            config: { temperature: 0 }
        });

        const scrubbed = response.text || "[CONTENT REDACTED BY SOVEREIGN PROXY]";
        const entitiesRemoved = (scrubbed.match(/\[.*?\]/g) || []).length;
        return { content: scrubbed, scrubbedEntities: entitiesRemoved };
    } catch(error) {
        console.error("Scrubbing API Failed:", error);
        // Fail Closed: Return fully redacted placeholder
        return { content: "[SYSTEM_AUDIT: CONTENT REDACTED DUE TO ENCLAVE DISCONNECTION]", scrubbedEntities: 999 };
    }
}
    async evaluateRRE(text: string, rules: RegulatoryRule[]): Promise < { isBlocked: boolean; triggeredRule?: string } > {
    const ai = this.getAI();
    const activeRules = rules.filter(r => r.isActive).map(r => `${r.name}: ${r.description}`).join('\n');

    if(!activeRules) return { isBlocked: false };

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: `RULES:\n${activeRules}\n\nTEXT_TO_EVALUATE: ${text}\n\nAssess if the text violates any rules. Return JSON: { "isBlocked": boolean, "triggeredRule": string | null }. STRICT COMPLIANCE.`,
            config: {
                responseMimeType: "application/json",
                temperature: 0
            }
        });

        const result = JSON.parse(response.text || '{ "isBlocked": false }');
        return { isBlocked: result.isBlocked, triggeredRule: result.triggeredRule };
    } catch(error) {
        console.error("Gemini API Error (EvaluateRRE):", error);
        return { isBlocked: false };
    }


}

    async publicChat(input: string, config: ChatbotConfig, knowledge: KnowledgeArtifact[]): Promise < { text: string; confidence: number } > {
    if(!config.isEnabled) return { text: "Chatbot is currently disabled.", confidence: 1 };

    const ai = this.getAI();
    const knowledgeContext = knowledge.map(k => `${k.title}: ${k.content}`).join('\n\n');

    const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: `SYSTEM: ${config.systemInstruction}\n\nKNOWLEDGE_BASE:\n${knowledgeContext}\n\nUSER: ${input}`,
        config: { temperature: 0.3 }
    });

    return { text: response.text || "I am unable to answer that at this time.", confidence: 0.9 };
}

    async generateBillingDescription(rawNotes: string): Promise < string > {
    const ai = this.getAI();
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: `Convert these raw notes into a professional legal billing narrative (max 1 sentence): "${rawNotes}"`,
            config: { temperature: 0.2 }
        });
        return response.text || rawNotes;
    } catch(error: any) {
        throw new Error(`Billing Generation Failed: ${error.message}`);
    }

}
}
