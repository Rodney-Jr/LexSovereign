
import { GoogleGenAI, Type } from "@google/genai";
import { UserRole, PrivilegeStatus, ReviewArtifact, DocumentMetadata, RegulatoryRule, TimeEntry, ChatbotConfig, KnowledgeArtifact } from "../types";

export class LexGeminiService {
  private getAI() {
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async chat(
    input: string,
    matterId: string | null,
    documents: DocumentMetadata[],
    usePrivateModel: boolean,
    killSwitchActive: boolean,
    useGlobalSearch: boolean = false
  ): Promise<{ text: string; confidence: number; provider: string; references?: string[]; groundingSources?: {title: string, uri: string}[] }> {
    if (killSwitchActive) {
      throw new Error("KILL_SWITCH_ACTIVE");
    }

    const ai = this.getAI();
    const model = usePrivateModel ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview';
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
      // When using tools, JSON mode might be restricted depending on model version, 
      // so we use a text fallback if needed, but for productivity we want search sources.
    }

    const response = await ai.models.generateContent({
      model: model,
      contents: `CONTEXT_DOCUMENTS:\n${contextStr}\n\nUSER_QUERY: ${input}`,
      config: config
    });

    // Extract search grounding metadata if available
    const groundingSources: {title: string, uri: string}[] = [];
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
      // Fallback if model didn't return valid JSON during tool use
      result = { text: response.text, confidence: 0.9, references: [] };
    }

    return {
      text: result.text || "I am analyzing the sovereign research stream...",
      confidence: result.confidence || 0.85,
      provider: usePrivateModel ? "Private Enclave (Gemini 3 Pro)" : "Gemini 3 Flash",
      references: result.references,
      groundingSources: groundingSources.length > 0 ? groundingSources : undefined
    };
  }

  async generateExecutiveBriefing(matterId: string, documents: DocumentMetadata[]): Promise<string> {
    const ai = this.getAI();
    const docs = documents.filter(d => d.matterId === matterId);
    const context = docs.map(d => `${d.name} (${d.jurisdiction})`).join(', ');

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Generate a high-velocity executive briefing for Matter ${matterId} based on these artifacts: ${context}. Focus on: 1. Risk Heatmap 2. Key Deadlines 3. Critical Clause Anomalies.`,
      config: {
        systemInstruction: "You are the Chief Legal Ops AI. Summarize the status of a legal matter for a Managing Partner. Use bullet points and a professional, sovereign tone. Max 300 words.",
        thinkingConfig: { thinkingBudget: 4000 } // High complexity reasoning
      }
    });

    return response.text || "Matter synthesis failed at the enclave layer.";
  }

  async publicChat(
    input: string,
    config: ChatbotConfig,
    knowledge: KnowledgeArtifact[]
  ): Promise<{ text: string; confidence: number }> {
    const ai = this.getAI();
    
    const context = knowledge
      .filter(k => config.knowledgeBaseIds.includes(k.id))
      .map(k => `Knowledge Artifact [${k.title}]: ${k.content}`)
      .join('\n\n');

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `
        ACTIVE KNOWLEDGE BASE:
        ${context}

        USER MESSAGE:
        ${input}
      `,
      config: {
        systemInstruction: `
          ${config.systemInstruction}
          You are named ${config.botName}. 
          MANDATORY GUARDRAILS:
          1. NEVER provide specific legal advice. Use phrases like "Our firm specializes in..." or "This usually involves...".
          2. ALWAYS encourage the user to onboard as a client for a formal consultation.
          Return a JSON object with 'text' and 'confidence' (0-1).
        `,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            text: { type: Type.STRING },
            confidence: { type: Type.NUMBER }
          },
          required: ["text", "confidence"]
        }
      }
    });

    return JSON.parse(response.text || '{"text": "I am experiencing a secure tunnel error.", "confidence": 0}');
  }

  async generateBillingDescription(rawNotes: string): Promise<string> {
    const ai = this.getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Transform these raw legal notes into a professional billing entry for a law firm. Use standard legal terminology. Notes: "${rawNotes}"`,
      config: {
        systemInstruction: "You are an expert legal billing auditor. Your task is to rewrite messy, informal notes into professional LEDES-standard descriptions. Redact all PII.",
        temperature: 0.2
      }
    });
    return response.text?.trim() || "Professional description could not be generated.";
  }

  async validateTimeEntry(entry: Partial<TimeEntry>): Promise<{ isSafe: boolean; feedback: string }> {
    const ai = this.getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyze this time entry for compliance with Outside Counsel Guidelines (OCG). Entry: ${JSON.stringify(entry)}`,
      config: {
        systemInstruction: "Check if the activity description is too vague or violates billing rules. Return JSON with 'isSafe' (boolean) and 'feedback' (string).",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isSafe: { type: Type.BOOLEAN },
            feedback: { type: Type.STRING }
          },
          required: ["isSafe", "feedback"]
        }
      }
    });
    return JSON.parse(response.text || '{"isSafe": true, "feedback": "Entry verified."}');
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

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { temperature: 0 }
    });

    const scrubbed = response.text || "[CONTENT REDACTED BY SOVEREIGN PROXY]";
    const entitiesRemoved = (scrubbed.match(/\[.*?\]/g) || []).length;

    return { content: scrubbed, scrubbedEntities: entitiesRemoved };
  }

  async evaluateRRE(text: string, rules: RegulatoryRule[]): Promise<{ isBlocked: boolean; triggeredRule?: string }> {
    const ai = this.getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Response to evaluate: "${text}"\n\nRegulatory Rules: ${JSON.stringify(rules)}`,
      config: {
        systemInstruction: "Determine if the response violates any jurisdictional legal advice rules. Return JSON with 'isBlocked' (boolean) and 'triggeredRule' (string).",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isBlocked: { type: Type.BOOLEAN },
            triggeredRule: { type: Type.STRING }
          },
          required: ["isBlocked"]
        }
      }
    });

    return JSON.parse(response.text || '{"isBlocked": false}');
  }

  async verifyOutput(input: string, output: string): Promise<{ isSafe: boolean }> {
    const ai = this.getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Input: ${input}\nOutput: ${output}`,
      config: {
        systemInstruction: "Verify if output contains unauthorized legal advice. Return JSON with 'isSafe' (boolean).",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isSafe: { type: Type.BOOLEAN }
          },
          required: ["isSafe"]
        }
      }
    });
    return JSON.parse(response.text || '{"isSafe": true}');
  }

  async sanitizeForMobile(text: string): Promise<{ sanitized: string; entitiesRemoved: number }> {
    const ai = this.getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Sanitize this text for mobile egress: "${text}"`,
      config: {
        systemInstruction: "Redact all PII. Return JSON with 'sanitized' (string) and 'entitiesRemoved' (number).",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            sanitized: { type: Type.STRING },
            entitiesRemoved: { type: Type.NUMBER }
          },
          required: ["sanitized", "entitiesRemoved"]
        }
      }
    });
    return JSON.parse(response.text || `{"sanitized": "${text}", "entitiesRemoved": 0}`);
  }

  async generateComplianceReport(logs: any[]): Promise<string> {
    const ai = this.getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Audit Logs: ${JSON.stringify(logs)}`,
      config: {
        systemInstruction: "Generate a formal compliance audit report summarizing the provided logs."
      }
    });
    return response.text || "Failed to generate report.";
  }

  async suggestMetadata(fileName: string): Promise<Partial<DocumentMetadata>> {
    const ai = this.getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Suggest metadata for file: ${fileName}`,
      config: {
        systemInstruction: "Predict legal metadata based on file name. Return JSON.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            matterId: { type: Type.STRING },
            jurisdiction: { type: Type.STRING },
            region: { type: Type.STRING },
            privilege: { type: Type.STRING }
          },
          required: ["matterId", "jurisdiction", "region", "privilege"]
        }
      }
    });
    return JSON.parse(response.text || '{}');
  }
}
