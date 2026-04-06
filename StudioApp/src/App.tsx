import { useState, useEffect } from 'react';
import { LegalEditor } from './components/LegalEditor';
import { 
  Library, 
  Sparkles, 
  History, 
  Share2, 
  ChevronLeft, 
  ChevronRight,
  Search,
  FileText,
  AlertCircle,
  ListTree,
  MessageSquare,
  Plus,
  Zap,
  ArrowLeft,
  Save,
  Printer,
  Maximize,
  Minimize
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn, apiFetch } from './lib/utils';
import { useNomosSync } from './hooks/useNomosSync';
import { Toaster, toast } from 'sonner';

export default function App() {
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [leftTab, setLeftTab] = useState<'library' | 'outline' | 'history'>('library');

  const [docId, setDocId] = useState<string | null>(null);
  const [documentTitle, setDocumentTitle] = useState('Untitled_Draft.docx');
  const [content, setContent] = useState('');
  const [versions, setVersions] = useState<any[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [clauses, setClauses] = useState<any[]>([]);
  const [isLibraryLoading, setIsLibraryLoading] = useState(false);
  const [risks, setRisks] = useState<any[]>([]);

  const { isReady, documentData, commitToNomosDesk, error } = useNomosSync();

  const fetchVersions = async (id: string) => {
    setIsHistoryLoading(true);
    try {
      const data = await apiFetch(`/api/documents/${id}/versions`);
      setVersions(data);
    } catch (error) {
      console.error('Error fetching versions:', error);
    } finally {
      setIsHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (isReady && documentData) {
        if (documentData.docId) setDocId(documentData.docId);
        if (documentData.title) setDocumentTitle(documentData.title);
        if (documentData.content) setContent(documentData.content);
        
        if (documentData.docId) {
            fetchVersions(documentData.docId);
        }
    }
  }, [isReady, documentData]);

  useEffect(() => {
    const fetchClauses = async () => {
        setIsLibraryLoading(true);
        try {
            const data = await apiFetch('/api/clauses');
            setClauses(data);
        } catch (e) {
            console.error('Failed to fetch library:', e);
        } finally {
            setIsLibraryLoading(false);
        }
    };
    if (isReady) fetchClauses();
  }, [isReady]);

  useEffect(() => {
    const timer = setTimeout(async () => {
        if (!content || content.length < 50) return;
        try {
            const result = await apiFetch('/api/ai/risk-analysis', {
                method: 'POST',
                body: JSON.stringify({ content })
            });
            if (Array.isArray(result)) setRisks(result);
        } catch (e) {
            console.warn('AI Risk analysis suppressed.');
        }
    }, 3000);
    return () => clearTimeout(timer);
  }, [content]);

  if (error) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-900 text-red-500 font-serif">
        <p className="text-xl">{error}</p>
      </div>
    );
  }

  if (!isReady) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-900 text-brand-primary">
        <p className="text-sm font-black animate-pulse tracking-widest uppercase">Connecting to Sovereign Vault...</p>
      </div>
    );
  }

  const handleSaveAsNew = () => {
    toast("Save current draft as a new document?", {
      description: "This will create a duplicate of the current content in the Vault.",
      action: {
        label: "Confirm",
        onClick: () => {
          const newId = Math.random().toString(36).substring(7);
          setDocId(newId);
          setDocumentTitle(prev => `Copy_of_${prev}`);
          toast.success('Document branched as a new draft');
          // Note: Selection will be persisted on next Save click
        },
      },
    });
  };

  const handleImport = (importedContent: string) => {
    setContent(importedContent);
    toast.success('Document content imported');
  };

  const handleNewDraft = () => {
    toast("Start a new blank draft?", {
      description: "Any unsaved changes in the current session will be lost.",
      action: {
        label: "Confirm",
        onClick: () => {
          const newId = Math.random().toString(36).substring(7);
          setDocId(newId);
          setContent('');
          setDocumentTitle('Untitled_Draft.docx');
          toast.success('New blank draft created');
        },
      },
    });
  };

  const insertClause = (clause: string) => {
    const event = new CustomEvent('editor:insert', { 
        detail: `<p><strong>[INSERTED CLAUSE]</strong>: ${clause}</p>` 
    });
    window.dispatchEvent(event);
  };

  const handleSave = async (htmlContent: string) => {
    if (!docId) {
        toast.error('No document context found. Artifact cannot be persisted.');
        return;
    }
    
    toast.loading('Persisting back to Sovereign Vault...', { id: 'save-op' });
    try {
        // 1. Persist to DB
        await apiFetch(`/api/documents/${docId}`, {
            method: 'PATCH',
            body: JSON.stringify({ 
                content: htmlContent,
                name: documentTitle,
                changeSummary: 'Sovereign Studio Session Commit'
            })
        });

        // 2. Notify Host & Close
        toast.success('Vault sync complete', { id: 'save-op' });
        commitToNomosDesk(htmlContent);
    } catch (e) {
      console.error('Error saving document:', e);
      toast.error('Vault synchronization failed.', { id: 'save-op' });
    }
  };

  const handleRevert = async (versionId: string) => {
    if (!docId) return;
    try {
      const revertedDoc = await apiFetch(`/api/documents/${docId}/revert/${versionId}`, {
        method: 'POST'
      });
      setContent(revertedDoc.content);
      toast.success('Document reverted successfully', {
        description: `Reverted to version ${revertedDoc.version}.`,
      });
      fetchVersions(docId);
    } catch (error) {
      console.error('Error reverting version:', error);
      toast.error('Failed to revert version');
    }
  };

  const handleAiAction = async (command: string) => {
    toast.loading(`Drafting assistant processing ${command}...`, { id: 'ai-op' });
    try {
        const result = await apiFetch('/api/ai/command', {
            method: 'POST',
            body: JSON.stringify({ command, context: content })
        });
        if (result.suggestion) {
            insertClause(result.suggestion);
            toast.success('AI Draft update inserted', { id: 'ai-op' });
        } else {
            toast.info('AI completed analysis, no direct insertion required.', { id: 'ai-op' });
        }
    } catch (e) {
        toast.error('AI Assistant failed to process command', { id: 'ai-op' });
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        toast.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#F3F4F6] overflow-hidden font-sans">
      <Toaster position="top-right" richColors />
      
      {/* Left Sidebar: Clause Library & Outline */}
      <AnimatePresence mode="wait">
        {leftSidebarOpen && (
          <motion.div 
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="h-full bg-white border-r border-gray-200 flex flex-col"
          >
            <div className="flex border-b border-gray-100">
              <button 
                onClick={() => setLeftTab('library')}
                className={cn(
                  "flex-1 py-3 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-colors",
                  leftTab === 'library' ? "text-brand-primary border-b-2 border-brand-primary bg-brand-primary/5" : "text-gray-400 hover:text-gray-600"
                )}
              >
                <Library className="w-3 h-3" />
                Library
              </button>
              <button 
                onClick={() => setLeftTab('outline')}
                className={cn(
                  "flex-1 py-3 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-colors",
                  leftTab === 'outline' ? "text-brand-primary border-b-2 border-brand-primary bg-brand-primary/5" : "text-gray-400 hover:text-gray-600"
                )}
              >
                <ListTree className="w-3 h-3" />
                Outline
              </button>
              <button 
                onClick={() => {
                  setLeftTab('history');
                  if (docId) fetchVersions(docId);
                }}
                className={cn(
                  "flex-1 py-3 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-colors",
                  leftTab === 'history' ? "text-brand-primary border-b-2 border-brand-primary bg-brand-primary/5" : "text-gray-400 hover:text-gray-600"
                )}
              >
                <History className="w-3 h-3" />
                History
              </button>
              <button onClick={() => setLeftSidebarOpen(false)} className="p-3 hover:bg-gray-100 text-gray-400">
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {leftTab === 'library' && (
                <div className="p-4 space-y-4">
                  <div className="relative mb-6">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                      type="text" 
                      placeholder="Search standard clauses..." 
                      className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                    />
                  </div>
                  
                  <div className="space-y-3">
                    {isLibraryLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="w-4 h-4 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : (
                        clauses.map(clause => (
                            <ClauseItem 
                                key={clause.id}
                                title={clause.title} 
                                category={clause.category}
                                preview={clause.jurisdiction || 'Global'}
                                onInsert={async () => {
                                    try {
                                        const full = await apiFetch(`/api/clauses/${clause.id}`);
                                        insertClause(full.content);
                                        toast.success('Clause inserted');
                                    } catch (e) {
                                        toast.error('Failed to fetch clause content');
                                    }
                                }}
                            />
                        ))
                    )}
                  </div>
                </div>
              )}

              {leftTab === 'outline' && (
                <div className="p-4 space-y-2">
                  <OutlineItem level={1} title="MASTER SERVICES AGREEMENT" />
                  <OutlineItem level={2} title="1. DEFINITIONS" />
                  <OutlineItem level={2} title="2. SCOPE OF WORK" />
                </div>
              )}

              {leftTab === 'history' && (
                <div className="p-4 space-y-4">
                  <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Version History</h3>
                  {!docId ? (
                    <div className="text-center py-8 px-4">
                      <History className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                      <p className="text-[10px] text-gray-400 uppercase tracking-widest leading-relaxed">
                        Save your draft to begin tracking version history.
                      </p>
                    </div>
                  ) : isHistoryLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="w-4 h-4 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {versions.map((v, idx) => (
                        <div key={v.id} className="p-3 bg-white border border-gray-100 rounded-xl hover:border-brand-primary/20 transition-all group">
                          <div className="flex justify-between items-start mb-1">
                            <span className="text-[10px] font-bold text-gray-900">Version {v.version}</span>
                            {idx === 0 && (
                              <span className="text-[8px] px-1.5 py-0.5 bg-green-50 text-green-600 rounded-full font-bold uppercase tracking-widest">Current</span>
                            )}
                          </div>
                          <div className="text-[10px] text-gray-400 mb-3">
                            {new Date(v.createdAt).toLocaleString()}
                          </div>
                          {idx !== 0 && (
                            <button 
                              onClick={() => handleRevert(v.id)}
                              className="w-full py-1.5 bg-brand-primary/10 text-brand-primary text-[9px] font-bold rounded-lg hover:bg-brand-primary/20 transition-colors uppercase tracking-widest"
                            >
                              Revert to this version
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!leftSidebarOpen && (
        <button 
          onClick={() => setLeftSidebarOpen(true)}
          className="h-full w-8 bg-white border-r border-gray-200 flex items-center justify-center hover:bg-gray-50 group"
          title="Expand Sidebar"
        >
          <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-brand-primary" />
        </button>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header Toolbar */}
        <div className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <button onClick={() => window.close()} className="p-2 mr-2 hover:bg-gray-100 rounded-lg text-gray-400">
                <ArrowLeft size={16} />
              </button>
              <div className="p-1.5 bg-brand-primary/10 rounded-lg">
                <FileText className="w-4 h-4 text-brand-primary" />
              </div>
              <span className="font-bold text-sm text-gray-900">{documentTitle}</span>
            </div>
            <button 
              onClick={handleNewDraft}
              className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-brand-primary transition-colors"
              title="New Blank Draft"
            >
              <Plus className="w-4 h-4" />
            </button>
            <div className="h-4 w-[1px] bg-gray-200" />
            <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              LIVE COLLABORATION ACTIVE
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={toggleFullscreen}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-lg transition-all uppercase tracking-wider"
              title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            >
              {isFullscreen ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
              {isFullscreen ? "Window" : "Full View"}
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-lg transition-all uppercase tracking-wider">
              <Printer className="w-3.5 h-3.5" />
              Preview
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-lg transition-all uppercase tracking-wider">
              <Share2 className="w-3.5 h-3.5" />
              Share
            </button>
            <div className="h-4 w-[1px] bg-gray-200 mx-1" />
            <button 
              onClick={() => handleSave(content)}
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold bg-brand-primary text-black hover:bg-brand-secondary rounded-lg transition-all shadow-lg shadow-brand-primary/20 uppercase tracking-widest"
            >
              <Save className="w-3.5 h-3.5" />
              Commit to Vault
            </button>
          </div>
        </div>

        {/* Editor Wrapper */}
        <div className="flex-1 relative overflow-hidden bg-slate-900 flex flex-col items-center overflow-y-auto scrollbar-hide">
            <LegalEditor 
                content={content} 
                onChange={setContent} 
                docId={docId}
                onSave={handleSave}
                onImport={handleImport}
                onSaveAsNew={handleSaveAsNew}
            />

            {/* Sync Progress Indicator */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 px-4 py-2 bg-slate-900 text-white rounded-full shadow-2xl border border-white/10 backdrop-blur-md animate-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-2 pr-3 border-r border-white/10">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[9px] font-black uppercase tracking-widest">Vault Secure</span>
                </div>
                <span className="text-[9px] text-brand-muted font-medium">Last synced: {new Date().toLocaleTimeString()}</span>
            </div>
        </div>
      </div>

      {/* Right Sidebar: AI Insights */}
      <AnimatePresence mode="wait">
        {rightSidebarOpen && (
          <motion.div 
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="h-full bg-white border-l border-gray-200 flex flex-col"
          >
            <div className="p-4 border-b border-gray-100 flex justify-between items-center">
              <div className="flex items-center gap-2 font-bold text-[10px] uppercase tracking-[0.2em] text-gray-400">
                <Sparkles className="w-4 h-4 text-purple-600" />
                AI Drafting Assistant
              </div>
              <button onClick={() => setRightSidebarOpen(false)} className="p-1 hover:bg-gray-100 rounded text-gray-400">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-8">
              {/* AI Actions */}
              <div className="grid grid-cols-2 gap-2">
                <AIActionButton icon={Zap} label="Summarize" color="blue" onClick={() => handleAiAction('Summarize the current document and identify key obligations')} />
                <AIActionButton icon={MessageSquare} label="Simplify" color="purple" onClick={() => handleAiAction('Rewrite this for a non-legal reader while preserving intent')} />
                <AIActionButton icon={FileText} label="Formalize" color="orange" onClick={() => handleAiAction('Convert the current draft into strictly formal legal prose')} />
                <AIActionButton icon={Sparkles} label="Expand" color="green" onClick={() => handleAiAction('Detail the operational requirements of the current section')} />
              </div>

              <div className="space-y-4">
                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Sovereign Risk Enclave</h3>
                {risks.length === 0 ? (
                    <p className="text-[10px] text-gray-400 italic">No critical risks in current selection.</p>
                ) : (
                    risks.map((risk, idx) => (
                        <div key={`risk-${idx}`} className="p-4 bg-orange-50 border border-orange-100 rounded-xl space-y-2">
                            <div className="flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 text-orange-500" />
                                <div className="text-xs font-bold text-orange-900">{risk.type || 'Drafting Risk'}</div>
                            </div>
                            <p className="text-[10px] text-orange-800 leading-relaxed">
                                {risk.description || risk.message}
                            </p>
                        </div>
                    ))
                )}
              </div>

              <div className="space-y-4">
                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Smart Suggestions</h3>
                <div className="p-4 bg-purple-50 border border-purple-100 rounded-xl space-y-3">
                  <div className="text-xs font-bold text-purple-900">Add Data Privacy Addendum</div>
                  <p className="text-[10px] text-purple-800 leading-relaxed italic">
                    "GDPR-compliant Data Processing Addendum is recommended."
                  </p>
                  <button 
                    onClick={() => insertClause("DATA PROCESSING ADDENDUM. The parties agree to comply with the terms of the Data Processing Addendum attached hereto as Exhibit B.")}
                    className="w-full py-2 bg-purple-600 text-white rounded-lg text-[10px] font-bold hover:bg-purple-700 transition-all shadow-lg shadow-purple-500/10 uppercase tracking-widest"
                  >
                    INSERT CLAUSE
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!rightSidebarOpen && (
        <button 
          onClick={() => setRightSidebarOpen(true)}
          className="h-full w-8 bg-white border-l border-gray-200 flex items-center justify-center hover:bg-gray-50 group"
          title="Expand AI Assistant"
        >
          <ChevronLeft className="w-4 h-4 text-gray-400 group-hover:text-purple-600" />
        </button>
      )}
    </div>
  );
}

const ClauseItem = ({ title, category, preview, onInsert }: { title: string, category: string, preview: string, onInsert: () => void }) => (
  <div className="group p-4 bg-white border border-gray-100 rounded-xl hover:border-brand-primary/20 hover:shadow-md transition-all">
    <div className="flex justify-between items-start mb-2">
      <h4 className="text-xs font-bold text-gray-900">{title}</h4>
      <span className="text-[8px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded-full uppercase font-bold tracking-wider">
        {category}
      </span>
    </div>
    <p className="text-[10px] text-gray-500 line-clamp-2 italic mb-3">
      "{preview}"
    </p>
    <button 
      onClick={onInsert}
      className="w-full py-1.5 bg-gray-50 border border-gray-100 rounded-lg text-[9px] font-bold text-gray-400 hover:bg-brand-primary/10 hover:text-brand-primary hover:border-brand-primary/20 transition-all flex items-center justify-center gap-1 uppercase tracking-widest"
    >
      <Plus className="w-3 h-3" />
      INSERT TO DRAFT
    </button>
  </div>
);

const OutlineItem = ({ level, title }: { level: number, title: string }) => (
  <div 
    className={cn(
      "py-1.5 px-2 rounded-lg text-[11px] font-medium text-gray-600 hover:bg-gray-50 cursor-pointer transition-colors",
      level === 1 ? "font-bold text-gray-900" : "ml-4"
    )}
  >
    {title}
  </div>
);

const AIActionButton = ({ icon: Icon, label, color, onClick }: { icon: any, label: string, color: string, onClick?: () => void }) => {
  const colors: any = {
    blue: "bg-blue-50 text-blue-600 hover:bg-blue-100",
    purple: "bg-purple-50 text-purple-600 hover:bg-purple-100",
    orange: "bg-orange-50 text-orange-600 hover:bg-orange-100",
    green: "bg-green-50 text-green-600 hover:bg-green-100",
  };

  return (
    <button onClick={onClick} className={cn("flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl transition-all", colors[color])}>
      <Icon className="w-4 h-4" />
      <span className="text-[9px] font-bold uppercase tracking-widest">{label}</span>
    </button>
  );
};
