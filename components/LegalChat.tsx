
import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  User,
  Bot,
  ShieldCheck,
  Info,
  Lock,
  Server,
  Cloud,
  ShieldAlert,
  Briefcase,
  FileText,
  ExternalLink,
  ChevronDown,
  Search,
  Layers,
  X,
  Calendar,
  Shield,
  MapPin,
  ChevronLeft,
  Globe,
  ChevronRight,
  Zap,
  Globe2,
  RefreshCw
} from 'lucide-react';
import { ChatMessage, RegulatoryRule, DocumentMetadata, Matter, PrivilegeStatus } from '../types';
import { LexGeminiService } from '../services/geminiService';
import { usePermissions } from '../hooks/usePermissions';

interface LegalChatProps {
  killSwitchActive: boolean;
  rules: RegulatoryRule[];
  documents: DocumentMetadata[];
  matters: Matter[];
}

const LegalChat: React.FC<LegalChatProps> = ({ killSwitchActive, rules, documents, matters }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: 'Hello, I am LexSovereign AI. I have access to your Sovereign Vault and real-time Global Research. Select a Matter context below to begin.',
      verifiedBy: 'Safety-Model-v1'
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [usePrivateModel, setUsePrivateModel] = useState(false);
  const [useGlobalSearch, setUseGlobalSearch] = useState(false); // New Research Enabler
  const [selectedMatterId, setSelectedMatterId] = useState<string | null>(null);
  const [matterSearchTerm, setMatterSearchTerm] = useState('');
  const [showMatterList, setShowMatterList] = useState(false);
  const [showContextInspector, setShowContextInspector] = useState(false);
  const [highlightedDocId, setHighlightedDocId] = useState<string | null>(null);
  const [inspectingDocId, setInspectingDocId] = useState<string | null>(null);
  const [groundingSources, setGroundingSources] = useState<{ title: string, uri: string }[]>([]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const gemini = new LexGeminiService();
  const { hasPermission } = usePermissions();

  // Enforce Access Control
  // 1. Must have basic chat access
  // 2. If 'public' user, restricted mode
  const canChat = hasPermission('ai_chat_execute'); // Basic permission to use AI
  const isPublic = !hasPermission('view_confidential');

  useEffect(() => {
    if (!canChat) {
      setMessages([{
        role: 'assistant',
        content: 'ACCESS DENIED: Your role does not have permission to access the Legal Intelligence System.',
        verifiedBy: 'RBAC-Gatekeeper'
      }]);
    }
  }, [canChat]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const filteredMatters = matters.filter(m =>
    m.name.toLowerCase().includes(matterSearchTerm.toLowerCase()) ||
    m.id.toLowerCase().includes(matterSearchTerm.toLowerCase())
  );

  const selectedMatter = matters.find(m => m.id === selectedMatterId);
  const contextDocs = selectedMatterId
    ? documents.filter(d => d.matterId === selectedMatterId)
    : documents;

  const handleReferenceClick = (docId: string) => {
    setShowContextInspector(true);
    setHighlightedDocId(docId);
    setInspectingDocId(docId);

    setTimeout(() => {
      const element = document.getElementById(`sidebar-doc-${docId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 150);

    setTimeout(() => {
      setHighlightedDocId(null);
    }, 3000);
  };

  const handleSend = async () => {
    if (!input.trim() || killSwitchActive) return;

    const userMessage: ChatMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);
    setGroundingSources([]);

    try {
      // If Global Search is enabled, we use a different path
      const aiResult = await gemini.chat(
        input,
        selectedMatterId,
        documents,
        usePrivateModel,
        killSwitchActive,
        useGlobalSearch
      );

      if (aiResult.groundingSources) {
        setGroundingSources(aiResult.groundingSources);
      }

      if (aiResult.confidence < 0.7) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: "SOVEREIGN ENCLAVE INTERCEPT: Confidence threshold below legal grounding limit. Routing to senior human counsel for verification.",
          isUPLTriggered: true,
          verifiedBy: 'Kill-Switch-Engine'
        }]);
        setIsTyping(false);
        return;
      }

      const rreResult = await gemini.evaluateRRE(aiResult.text, rules);
      if (rreResult.isBlocked) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `INTERCEPTED: AI response triggered ${rreResult.triggeredRule}. Productivity Block: Unauthorized Legal Advice detected.`,
          isUPLTriggered: true,
          verifiedBy: 'Regulatory-Rules-Engine'
        }]);
        setIsTyping(false);
        return;
      }

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: aiResult.text,
        verifiedBy: `${aiResult.provider} + Safety-Model-v1`,
        references: aiResult.references
      }]);

    } catch (e: any) {
      const errorMsg = e.message === "KILL_SWITCH_ACTIVE"
        ? "SYSTEM ENCLAVE LOCK: Deterministic safety protocols engaged."
        : "Communication error across secure tunnel.";

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: errorMsg,
        isUPLTriggered: true,
        verifiedBy: 'System'
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto animate-in zoom-in-95 duration-300 relative">

      {/* Searchable Context Bar */}
      <div className="bg-brand-sidebar border border-brand-border rounded-t-[2.5rem] p-5 flex items-center justify-between gap-6 relative z-30 transition-all duration-500">
        <div className="flex items-center gap-4 flex-1">
          <div className="p-2.5 bg-brand-secondary/10 rounded-2xl border border-brand-secondary/20 text-brand-secondary">
            <Briefcase size={20} />
          </div>

          <div className="flex-1 relative">
            <div
              onClick={() => setShowMatterList(!showMatterList)}
              className="bg-brand-bg border border-brand-border rounded-2xl px-5 py-2.5 flex items-center justify-between cursor-pointer hover:border-brand-secondary/30 transition-all transition-all duration-500"
            >
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-brand-muted uppercase tracking-widest">Active Matter Context</span>
                <span className="text-sm font-bold text-brand-text">
                  {selectedMatter ? `${selectedMatter.name} (${selectedMatter.id})` : 'Global Sovereign Enclave'}
                </span>
              </div>
              <ChevronDown size={16} className={`text-brand-muted transition-transform ${showMatterList ? 'rotate-180' : ''}`} />
            </div>

            {showMatterList && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-brand-sidebar border border-brand-border rounded-3xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 z-50 transition-all duration-500">
                <div className="p-3 border-b border-brand-border bg-brand-bg flex items-center gap-3">
                  <Search size={14} className="text-brand-muted" />
                  <input
                    type="text"
                    autoFocus
                    placeholder="Search matters by ID or Name..."
                    className="bg-transparent text-xs w-full focus:outline-none text-brand-text placeholder:text-brand-muted/40"
                    value={matterSearchTerm}
                    onChange={(e) => setMatterSearchTerm(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
                <div className="max-h-60 overflow-y-auto scrollbar-hide">
                  <button
                    onClick={() => { setSelectedMatterId(null); setShowMatterList(false); }}
                    className={`w-full text-left px-5 py-3 text-xs hover:bg-brand-primary/10 transition-all border-b border-brand-border last:border-0 ${!selectedMatterId ? 'text-brand-secondary font-bold bg-brand-secondary/5' : 'text-brand-muted'}`}
                  >
                    All Global Artifacts
                  </button>
                  {filteredMatters.map(m => (
                    <button
                      key={m.id}
                      onClick={() => { setSelectedMatterId(m.id); setShowMatterList(false); }}
                      className={`w-full text-left px-5 py-3 text-xs hover:bg-brand-primary/10 transition-all flex flex-col gap-0.5 border-b border-brand-border last:border-0 ${selectedMatterId === m.id ? 'bg-brand-secondary/5' : ''}`}
                    >
                      <span className={`font-bold ${selectedMatterId === m.id ? 'text-brand-secondary' : 'text-brand-text'}`}>{m.name}</span>
                      <span className="text-[10px] text-brand-muted font-mono">{m.id} • {m.client}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setUseGlobalSearch(!useGlobalSearch)}
            className={`p-2.5 rounded-2xl transition-all flex items-center gap-2 border transition-all duration-500 ${useGlobalSearch
              ? 'bg-brand-secondary/20 border-brand-secondary text-brand-secondary shadow-[0_0_15px_rgba(59,130,246,0.3)]'
              : 'bg-brand-bg border-brand-border text-brand-muted hover:text-brand-text'
              }`}
            title="Toggle Global Legal Research"
          >
            <Globe2 size={18} className={useGlobalSearch ? 'animate-pulse' : ''} />
            <span className="text-[10px] font-bold uppercase tracking-widest hidden lg:block">Research</span>
          </button>

          <button
            onClick={() => setShowContextInspector(!showContextInspector)}
            className={`p-2.5 rounded-2xl transition-all flex items-center gap-2 border transition-all duration-500 ${showContextInspector
              ? 'bg-brand-primary/20 border-brand-primary text-brand-primary shadow-[0_0_15px_rgba(16,185,129,0.3)]'
              : 'bg-brand-bg border-brand-border text-brand-muted hover:text-brand-text'
              }`}
          >
            <Layers size={18} />
            <span className="text-[10px] font-bold uppercase tracking-widest hidden lg:block">Context ({contextDocs.length})</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div
            ref={scrollRef}
            className={`flex-1 overflow-y-auto p-8 space-y-10 bg-brand-sidebar border-x border-brand-border transition-all duration-500 ${killSwitchActive ? 'opacity-60 grayscale' : ''}`}
          >
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex gap-5 max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`mt-1 flex-shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center shadow-2xl transition-transform hover:rotate-6 ${m.role === 'user' ? 'bg-brand-secondary' : m.isUPLTriggered ? 'bg-red-600' : 'bg-brand-primary'}`}>
                    {m.role === 'user' ? <User size={20} /> : <Bot size={20} />}
                  </div>
                  <div className="space-y-3">
                    <div className={`p-6 rounded-3xl text-[14px] leading-relaxed shadow-2xl border ${m.role === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-none border-blue-500 shadow-blue-500/10'
                      : m.isUPLTriggered
                        ? 'bg-red-500/10 border-red-500/30 text-red-200 rounded-tl-none'
                        : 'bg-slate-800 text-slate-100 border-slate-700 rounded-tl-none shadow-black/40'
                      }`}>
                      {m.content}

                      {m.references && m.references.length > 0 && (
                        <div className="mt-6 pt-6 border-t border-slate-700/50 flex flex-wrap gap-2">
                          <p className="w-full text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1">
                            <ShieldCheck size={12} className="text-emerald-500" /> Sovereign Citations
                          </p>
                          {m.references.map(refId => {
                            const doc = documents.find(d => d.id === refId);
                            return (
                              <button
                                key={refId}
                                onClick={() => handleReferenceClick(refId)}
                                className="flex items-center gap-2 bg-slate-900/80 border border-slate-700 px-3 py-1.5 rounded-xl group transition-all hover:bg-slate-900 hover:border-blue-500/50 hover:-translate-y-0.5 active:translate-y-0"
                              >
                                <FileText size={12} className="text-blue-400" />
                                <span className="text-[11px] font-medium text-slate-300">{doc?.name || refId}</span>
                                <ExternalLink size={10} className="text-slate-600 group-hover:text-blue-400" />
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    {m.verifiedBy && (
                      <div className={`flex items-center gap-2 text-[9px] px-2 font-mono uppercase tracking-widest opacity-80 ${m.isUPLTriggered ? 'text-red-400' : 'text-emerald-500'}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${m.isUPLTriggered ? 'bg-red-500' : 'bg-emerald-500'}`}></div>
                        Verified Trace: {m.verifiedBy}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {groundingSources.length > 0 && (
              <div className="flex justify-start animate-in slide-in-from-bottom-2">
                <div className="bg-blue-500/5 border border-blue-500/20 p-6 rounded-3xl ml-15 max-w-lg space-y-4">
                  <div className="flex items-center gap-2">
                    <Globe2 size={14} className="text-blue-400" />
                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.2em]">Global Research Sources</span>
                  </div>
                  <div className="space-y-2">
                    {groundingSources.map((source, idx) => (
                      <a
                        key={idx}
                        href={source.uri}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between p-3 bg-slate-950 border border-slate-800 rounded-xl hover:border-blue-500/50 transition-all group"
                      >
                        <span className="text-[11px] text-slate-300 truncate font-medium">{source.title}</span>
                        <ExternalLink size={12} className="text-slate-600 group-hover:text-blue-400 shrink-0" />
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-slate-800 p-5 rounded-3xl rounded-tl-none flex gap-2 items-center border border-slate-700 shadow-2xl">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-6 bg-slate-900/40 border border-t-0 border-slate-800 rounded-b-[2.5rem] relative">
            <div className="flex gap-4">
              <input
                type="text"
                value={input}
                disabled={killSwitchActive}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={!canChat ? "Access Restricted" : useGlobalSearch ? "Ask a legal research question..." : selectedMatter ? `Analyze ${selectedMatter.name} context...` : "Query the Global Sovereign Vault..."}
                className="flex-1 bg-slate-800 border border-slate-700 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all text-slate-100 placeholder:text-slate-600 disabled:opacity-50"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isTyping || killSwitchActive || !canChat}
                aria-label="Send message"
                className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white p-4 rounded-2xl transition-all shadow-2xl shadow-blue-900/50 active:scale-95 flex items-center justify-center"
              >
                <Send size={24} />
              </button>
            </div>
            <div className="mt-4 flex items-center justify-between px-2">
              <div className="flex items-center gap-3">
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full border transition-all ${useGlobalSearch ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>
                  <Globe2 size={12} />
                  <p className="text-[9px] font-bold uppercase tracking-widest">Research: {useGlobalSearch ? 'Enabled' : 'Off'}</p>
                </div>
                {selectedMatterId && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/10 rounded-full border border-blue-500/20">
                    <Briefcase size={10} className="text-blue-400" />
                    <span className="text-[9px] font-bold text-blue-400 uppercase">Anchored to {selectedMatterId}</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Zap size={12} className="text-emerald-500" />
                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">Efficiency Multiplier: 4.2x</span>
              </div>
            </div>
          </div>
        </div>

        {/* Context Inspector Sidebar */}
        {showContextInspector && (
          <div className="w-80 border-l border-slate-800 bg-slate-900/50 flex flex-col animate-in slide-in-from-right-4 duration-300 z-20 overflow-hidden">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
              <div className="flex items-center gap-2">
                <Layers size={18} className="text-emerald-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-widest">Knowledge Context</h4>
              </div>
              <button
                onClick={() => { setShowContextInspector(false); setInspectingDocId(null); }}
                className="p-1 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-white transition-all"
                aria-label="Close context inspector"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
              <div className="space-y-4">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Local Artifacts ({contextDocs.length})</p>
                <div className="space-y-2">
                  {contextDocs.map(doc => (
                    <div
                      key={doc.id}
                      id={`sidebar-doc-${doc.id}`}
                      onClick={() => setInspectingDocId(doc.id)}
                      className={`p-4 rounded-2xl space-y-2 border transition-all duration-500 cursor-pointer group ${highlightedDocId === doc.id
                        ? 'bg-emerald-500/20 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)] ring-2 ring-emerald-500/50'
                        : 'bg-slate-950 border-slate-800 hover:border-emerald-500/30'
                        }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <FileText size={16} className={`shrink-0 mt-0.5 ${highlightedDocId === doc.id ? 'text-emerald-400' : 'text-blue-400 group-hover:text-emerald-400'}`} />
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-bold truncate ${highlightedDocId === doc.id ? 'text-white' : 'text-slate-200 group-hover:text-white'}`}>{doc.name}</p>
                          <p className="text-[10px] text-slate-500 font-mono mt-0.5">{doc.matterId}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-5 bg-blue-500/5 border border-blue-500/10 rounded-3xl space-y-3">
                <div className="flex items-center gap-2">
                  <Zap size={14} className="text-blue-400" />
                  <h5 className="text-[10px] font-bold text-blue-300 uppercase tracking-widest">Sovereign Productivity</h5>
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed italic">
                  "AI-assisted legal research reduces manual verification time by 82%. PII-Scrubbing proxy remains active for all Global Search sessions."
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LegalChat;
