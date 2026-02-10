
import { DocumentMetadata, RegulatoryRule, KnowledgeArtifact, ChatbotConfig, UserRole, PrivilegeStatus } from "../../types";

export interface ChatParams {
    input: string;
    matterId: string | null;
    documents: DocumentMetadata[];
    usePrivateModel: boolean;
    killSwitchActive: boolean;
    useGlobalSearch: boolean;
}

export interface ChatResult {
    text: string;
    confidence: number;
    provider: string;
    references?: string[];
    groundingSources?: { title: string, uri: string }[];
}

export interface AIProvider {
    id: string; // 'gemini', 'openai', 'anthropic'
    name: string; // Display name

    chat(params: ChatParams): Promise<ChatResult>;

    explainClause(clauseText: string): Promise<string>;

    generateAuditLog(context: { userId: string, firmId: string, action: string, resourceType: string, resourceId: string }): Promise<string>;

    validateDocumentExport(documentContent: string): Promise<{ status: 'PASS' | 'FAIL', issues: string[] }>;

    generatePricingModel(features: string[]): Promise<any>;

    generateExecutiveBriefing(matterId: string, documents: DocumentMetadata[]): Promise<string>;

    getScrubbedContent(rawContent: string, role: UserRole, privilege: PrivilegeStatus): Promise<{ content: string; scrubbedEntities: number }>;

    evaluateRRE(text: string, rules: RegulatoryRule[]): Promise<{ isBlocked: boolean; triggeredRule?: string }>;

    publicChat(input: string, config: ChatbotConfig, knowledge: KnowledgeArtifact[]): Promise<{ text: string; confidence: number }>;

    generateBillingDescription(rawNotes: string): Promise<string>;

    hydrateTemplate(template: any, matter: any): Promise<any>;
}
