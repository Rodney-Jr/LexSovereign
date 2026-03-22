import React, { useState, useEffect, useCallback } from 'react';
import { ChevronDown, ChevronUp, Bot, BrainCircuit, Sparkles } from 'lucide-react';
import { ContextInsight } from './ContextInsight';
import { RiskAlerts } from './RiskAlerts';
import { AISuggestions } from './AISuggestions';
import { ClauseMatches } from './ClauseMatches';
import { CopilotInput } from './CopilotInput';
import { aiApi, AIContext, AIRisk, AISuggestion } from '../../../utils/aiApi';
import { clauseApi } from '../../../utils/clauseApi';
import { checkCompliance, ComplianceResponse, ComplianceIssue } from '../../../utils/complianceApi';
import { Editor } from '@tiptap/react';
import { ComplianceStatus } from './ComplianceStatus';
import { useStudioStore } from '../hooks/useStudioStore';
import { ShieldCheck, PieChart } from 'lucide-react';
import { ROIStrategyPanel } from './ROIStrategyPanel';

interface IntelligencePanelProps {
  editor: Editor | null;
  rawContent: string;
  onSmartFill?: () => Promise<void>;
}

export const IntelligencePanel: React.FC<IntelligencePanelProps> = ({ 
  editor, 
  rawContent,
  onSmartFill
}) => {
  const [isSmartFilling, setIsSmartFilling] = useState(false);
  const [context, setContext] = useState<AIContext | null>(null);
  const [risks, setRisks] = useState<AIRisk[]>([]);
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [isCopilotLoading, setIsCopilotLoading] = useState(false);
  const [complianceData, setComplianceData] = useState<ComplianceResponse | null>(null);
  const [isComplianceLoading, setIsComplianceLoading] = useState(false);
  
  const [expandedSections, setExpandedSections] = useState({
    context: true,
    roi: false, // Start collapsed as it's a specific 'Power Tool'
    risks: true,
    compliance: true,
    suggestions: true,
    matches: true
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const fetchAIInsights = useCallback(async () => {
    // 🛡️ Guard: We need actual text content for analysis
    const text = editor?.getText() || "";
    if (text.length < 10) return;

    try {
      setIsComplianceLoading(true);
      // 1. First get context as it might be needed for others
      const ctx = await aiApi.identifyContext(text);
      setContext(ctx);

      // 2. Fetch others in parallel
      const [riskList, suggList, clauseList, complianceResult] = await Promise.all([
        aiApi.detectRisks(text),
        aiApi.suggestClauses(text, ctx?.jurisdiction || 'Ghana'),
        clauseApi.list(),
        checkCompliance('current-matter', text) // TODO: Real matterId
      ]);

      setRisks(riskList);
      setSuggestions(suggList);
      setComplianceData(complianceResult);
      
      if (ctx?.sectionName) {
        const category = ctx.sectionName.toUpperCase().split(' ')[0];
        setMatches(clauseList.filter((c: any) => c.category && c.category.includes(category)).slice(0, 5));
      } else {
        setMatches(clauseList.slice(0, 3));
      }
    } catch (error) {
      console.error("[Intelligence] Failed to sync insights:", error);
    } finally {
      setIsComplianceLoading(false);
    }
  }, [editor, rawContent]);

  useEffect(() => {
    const timer = setTimeout(fetchAIInsights, 1000); // 1s debounce
    return () => clearTimeout(timer);
  }, [fetchAIInsights]);

  const handleCommand = async (command: string) => {
    if (!editor) return;
    setIsCopilotLoading(true);
    try {
      const result = await aiApi.processCommand(command, rawContent);
      if (result.action === 'INSERT' && result.content) {
        editor.chain().focus().insertContent(result.content).run();
      }
      // Re-fetch insights after action
      fetchAIInsights();
    } catch (error) {
      console.error("[Copilot] Command failed:", error);
    } finally {
      setIsCopilotLoading(false);
    }
  };

  const handleInsert = (content: any) => {
    if (!editor) return;
    editor.chain().focus().insertContent(content).run();
  };

  return (
    <div className="flex flex-col h-full bg-[#0D1117] border-l border-slate-800 overflow-y-auto scrollbar-hide">
      {/* Header */}
      <div className="p-6 border-b border-slate-800 bg-gradient-to-br from-[#0D1117] to-[#161B22]">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/20 rounded-xl">
             <Bot className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              Intelligence
              <span className="px-1.5 py-0.5 bg-indigo-500/10 text-indigo-400 text-[10px] rounded uppercase font-black border border-indigo-500/20">Active</span>
            </h2>
            <p className="text-xs text-slate-500">NomosDesk Copilot Enclave</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-8 pb-32">
        {/* Context Section */}
        <section className="space-y-4">
          <button 
            onClick={() => toggleSection('context')}
            className="flex items-center justify-between w-full text-slate-400 hover:text-slate-200"
          >
            <span className="text-[10px] font-black uppercase tracking-widest">Drafting Context</span>
            {expandedSections.context ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
          {expandedSections.context && context && (
             <div className="space-y-4">
               <ContextInsight {...context} />
               {onSmartFill && (
                 <button
                    onClick={async () => {
                      setIsSmartFilling(true);
                      await onSmartFill();
                      setIsSmartFilling(false);
                    }}
                    disabled={isSmartFilling}
                    className="w-full py-2 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 group"
                 >
                   {isSmartFilling ? (
                     <div className="w-3 h-3 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                   ) : (
                     <Sparkles className="w-3 h-3 group-hover:scale-125 transition-transform" />
                   )}
                   {isSmartFilling ? 'Hydrating Enclave...' : '✨ Smart Fill Placeholder'}
                 </button>
               )}
             </div>
          )}
        </section>

        {/* ROI Strategy Section (NEW) */}
        <section className="space-y-4">
          <button 
            onClick={() => toggleSection('roi')}
            className="flex items-center justify-between w-full text-slate-400 hover:text-slate-200 group"
          >
            <div className="flex items-center gap-2">
               <PieChart className="w-3.5 h-3.5 text-indigo-400 group-hover:scale-110 transition-transform" />
               <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">ROI Strategy Generator</span>
            </div>
            {expandedSections.roi ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
          {expandedSections.roi && (
            <ROIStrategyPanel editor={editor} />
          )}
        </section>

        {/* Risks Section */}
        <section className="space-y-4">
          <button 
            onClick={() => toggleSection('risks')}
            className="flex items-center justify-between w-full text-slate-400 hover:text-slate-200"
          >
            <span className="text-[10px] font-black uppercase tracking-widest text-[#5C6BC0]">Risk Analysis</span>
            {expandedSections.risks ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
          {expandedSections.risks && (
            <RiskAlerts 
              alerts={risks} 
              onAction={(alert) => handleCommand(`Fix ${alert.title}`)} 
            />
          )}
        </section>

        {/* Compliance Section (NEW) */}
        <section className="space-y-4">
          <button 
            onClick={() => toggleSection('compliance')}
            className="flex items-center justify-between w-full text-slate-400 hover:text-slate-200"
          >
            <div className="flex items-center gap-2">
               <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
               <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Compliance Status</span>
            </div>
            {expandedSections.compliance ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
          {expandedSections.compliance && (
            <ComplianceStatus 
               data={complianceData} 
               isLoading={isComplianceLoading}
               onFix={(issue) => handleCommand(`Remediate compliance issue: ${issue.title}`)}
               onReview={(issue) => console.log("Flagging for review", issue)}
               onEscalate={(issue) => console.log("Escalating issue", issue)}
            />
          )}
        </section>

        {/* Suggestions Section */}
        <section className="space-y-4">
          <button 
            onClick={() => toggleSection('suggestions')}
            className="flex items-center justify-between w-full text-slate-400 hover:text-slate-200"
          >
            <span className="text-[10px] font-black uppercase tracking-widest">AI Suggestions</span>
            {expandedSections.suggestions ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
          {expandedSections.suggestions && (
            <AISuggestions 
              suggestions={suggestions} 
              onInsert={(s) => handleInsert(s.clause.content)}
              onPreview={(s) => console.log("Preview", s)}
            />
          )}
        </section>

        {/* Matches Section */}
        <section className="space-y-4">
          <button 
            onClick={() => toggleSection('matches')}
            className="flex items-center justify-between w-full text-slate-400 hover:text-slate-200"
          >
            <span className="text-[10px] font-black uppercase tracking-widest">Library Matches</span>
            {expandedSections.matches ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
          {expandedSections.matches && (
            <ClauseMatches 
              matches={matches} 
              onSelect={(m) => handleInsert(m.content)}
              onPreview={(m) => console.log("Preview", m)}
            />
          )}
        </section>

        {/* Sticky Copilot Input at bottom or inline */}
        <section className="pt-4 border-t border-slate-800">
           <CopilotInput onCommand={handleCommand} isLoading={isCopilotLoading} />
        </section>

        {/* Minimal Footer */}
        <div className="flex items-center justify-center gap-2 pt-8 opacity-30">
          <BrainCircuit className="w-3 h-3" />
          <span className="text-[9px] font-bold uppercase tracking-widest">Sovereign Reasoning Engine v5.1</span>
        </div>
      </div>
    </div>
  );
};
