
import { UserRole, PrivilegeStatus, DocumentMetadata, RegulatoryRule, TimeEntry, ChatbotConfig, KnowledgeArtifact } from "../types";

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

    const response = await fetch(`${this.baseUrl}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input, matterId, documents, usePrivateModel, killSwitchActive, useGlobalSearch })
    });

    if (!response.ok) throw new Error(`Backend Error: ${response.statusText}`);
    return response.json();
  }

  async generateExecutiveBriefing(matterId: string, documents: DocumentMetadata[]): Promise<string> {
    const response = await fetch(`${this.baseUrl}/briefing`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ matterId, documents })
    });
    const data = await response.json();
    return data.briefing;
  }

  async getScrubbedContent(
    rawContent: string,
    role: UserRole,
    privilege: PrivilegeStatus
  ): Promise<{ content: string; scrubbedEntities: number }> {
    const response = await fetch(`${this.baseUrl}/scrub`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: rawContent, role, privilege })
    });
    return response.json();
  }

  // Stubs for other methods to keep type safety
  async publicChat(input: string, config: ChatbotConfig, knowledge: KnowledgeArtifact[]) {
    const response = await fetch(`${this.baseUrl}/public-chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input, config, knowledge })
    });
    return response.json();
  }

  async generateBillingDescription(rawNotes: string) {
    const response = await fetch(`${this.baseUrl}/billing-description`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rawNotes })
    });
    const data = await response.json();
    return data.description;
  }

  async validateTimeEntry(entry: Partial<TimeEntry>) { return { isSafe: true, feedback: "Backend pending." }; }

  async evaluateRRE(text: string, rules: RegulatoryRule[]): Promise<{ isBlocked: boolean; triggeredRule?: string }> {
    const response = await fetch(`${this.baseUrl}/evaluate-rre`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, rules })
    });
    return response.json();
  }

  async verifyOutput(input: string, output: string) { return { isSafe: true }; }
  async sanitizeForMobile(text: string) { return { sanitized: text, entitiesRemoved: 0 }; }
  async generateComplianceReport(logs: any[]) { return "Report backend pending."; }
  async suggestMetadata(fileName: string) { return {}; }
}
