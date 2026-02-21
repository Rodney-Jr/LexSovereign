
import { UserRole, PrivilegeStatus, DocumentMetadata, RegulatoryRule, TimeEntry, ChatbotConfig, KnowledgeArtifact } from "../types";
import { authorizedFetch, getSavedSession } from "../utils/api";

export class LexGeminiService {
  private baseUrl = '/api';

  async chat(
    input: string,
    matterId: string | null,
    documents: DocumentMetadata[],
    usePrivateModel: boolean,
    killSwitchActive: boolean,
    useGlobalSearch: boolean = false
  ): Promise<{ text: string; confidence: number; provider: string; references?: string[]; groundingSources?: { title: string, uri: string }[] }> {
    if (killSwitchActive) throw new Error("KILL_SWITCH_ACTIVE");

    const session = getSavedSession();
    return authorizedFetch(`${this.baseUrl}/chat`, {
      method: 'POST',
      token: session?.token,
      body: JSON.stringify({ input, matterId, documents, usePrivateModel, killSwitchActive, useGlobalSearch })
    });
  }

  async explainClause(clauseText: string): Promise<string> {
    const session = getSavedSession();
    const data = await authorizedFetch(`${this.baseUrl}/explain-clause`, {
      method: 'POST',
      token: session?.token,
      body: JSON.stringify({ clauseText })
    });
    return data.explanation;
  }

  async generateAuditLog(context: { userId: string, firmId: string, action: string, resourceType: string, resourceId: string }): Promise<string> {
    const session = getSavedSession();
    const data = await authorizedFetch(`${this.baseUrl}/audit/generate`, {
      method: 'POST',
      token: session?.token,
      body: JSON.stringify(context)
    });
    return data.message;
  }

  async validateDocumentExport(content: string): Promise<{ status: 'PASS' | 'FAIL', issues: string[] }> {
    const session = getSavedSession();
    return authorizedFetch(`${this.baseUrl}/documents/validate-export`, {
      method: 'POST',
      token: session?.token,
      body: JSON.stringify({ content })
    });
  }

  async generatePricingModel(features: string[]): Promise<any> {
    const session = getSavedSession();
    return authorizedFetch(`${this.baseUrl}/pricing/generate`, {
      method: 'POST',
      token: session?.token,
      body: JSON.stringify({ features })
    });
  }

  async generateExecutiveBriefing(matterId: string, documents: DocumentMetadata[]): Promise<string> {
    const session = getSavedSession();
    const data = await authorizedFetch(`${this.baseUrl}/briefing`, {
      method: 'POST',
      token: session?.token,
      body: JSON.stringify({ matterId, documents })
    });
    return data.briefing;
  }

  async getScrubbedContent(
    rawContent: string,
    role: UserRole,
    privilege: PrivilegeStatus
  ): Promise<{ content: string; scrubbedEntities: number }> {
    const session = getSavedSession();
    return authorizedFetch(`${this.baseUrl}/scrub`, {
      method: 'POST',
      token: session?.token,
      body: JSON.stringify({ content: rawContent, role, privilege })
    });
  }

  // Chatbot Management Methods
  async getChatbotConfig(): Promise<ChatbotConfig> {
    const session = getSavedSession();
    return authorizedFetch(`${this.baseUrl}/chatbot/config`, {
      token: session?.token
    });
  }

  async saveChatbotConfig(config: ChatbotConfig): Promise<ChatbotConfig> {
    const session = getSavedSession();
    return authorizedFetch(`${this.baseUrl}/chatbot/config`, {
      method: 'POST',
      token: session?.token,
      body: JSON.stringify(config)
    });
  }

  async deployChatbot(config: ChatbotConfig): Promise<any> {
    const session = getSavedSession();
    return authorizedFetch(`${this.baseUrl}/chatbot/deploy`, {
      method: 'POST',
      token: session?.token,
      body: JSON.stringify(config)
    });
  }

  async publicChat(input: string, config: ChatbotConfig, knowledge: KnowledgeArtifact[]) {
    const session = getSavedSession();
    // Public chat might not need token but authorizedFetch handles both cases gracefully
    return authorizedFetch(`${this.baseUrl}/chatbot/chat`, {
      method: 'POST',
      token: session?.token,
      body: JSON.stringify({ message: input, config })
    });
  }

  async generateBillingDescription(rawNotes: string) {
    const session = getSavedSession();
    const data = await authorizedFetch(`${this.baseUrl}/billing-description`, {
      method: 'POST',
      token: session?.token,
      body: JSON.stringify({ rawNotes })
    });
    return data.description;
  }

  async validateTimeEntry(entry: Partial<TimeEntry>) { return { isSafe: true, feedback: "Backend pending." }; }

  async evaluateRRE(text: string, rules: RegulatoryRule[]): Promise<{ isBlocked: boolean; triggeredRule?: string }> {
    const session = getSavedSession();
    return authorizedFetch(`${this.baseUrl}/evaluate-rre`, {
      method: 'POST',
      token: session?.token,
      body: JSON.stringify({ text, rules })
    });
  }

  async verifyOutput(input: string, output: string) { return { isSafe: true }; }
  async sanitizeForMobile(text: string) { return { sanitized: text, entitiesRemoved: 0 }; }
  async generateComplianceReport(logs: any[]) { return "Report backend pending."; }
  async suggestMetadata(fileName: string) { return {}; }

  async getMatterIntelligence(id: string): Promise<{ matter: any, metrics: { docCycleTime: number, totalHours: number }, team: any[] }> {
    const session = getSavedSession();
    return authorizedFetch(`${this.baseUrl}/matters/${id}/intelligence`, {
      token: session?.token
    });
  }

  async getMatterNotes(id: string): Promise<any[]> {
    const session = getSavedSession();
    return authorizedFetch(`${this.baseUrl}/matters/${id}/notes`, {
      token: session?.token
    });
  }

  async addMatterNote(id: string, text: string): Promise<any> {
    const session = getSavedSession();
    return authorizedFetch(`${this.baseUrl}/matters/${id}/notes`, {
      method: 'POST',
      token: session?.token,
      body: JSON.stringify({ text })
    });
  }

  async addTimeEntry(id: string, entry: Partial<TimeEntry>): Promise<any> {
    const session = getSavedSession();
    return authorizedFetch(`${this.baseUrl}/matters/${id}/time-entries`, {
      method: 'POST',
      token: session?.token,
      body: JSON.stringify(entry)
    });
  }
}
