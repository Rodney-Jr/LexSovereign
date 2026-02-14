
import React, { useState } from 'react';
import { X, Upload, Shield, MapPin, CheckCircle, RefreshCw, Info, Lock } from 'lucide-react';
import { LexGeminiService } from '../services/geminiService';
import { DocumentMetadata, Region, PrivilegeStatus, Matter } from '../types';
import { authorizedFetch, getSavedSession } from '../utils/api';

interface DocumentIngestModalProps {
  onClose: () => void;
  onIngest: (doc: DocumentMetadata) => void;
}

const DocumentIngestModal: React.FC<DocumentIngestModalProps> = ({ onClose, onIngest }) => {
  const [fileName, setFileName] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [suggestions, setSuggestions] = useState<Partial<DocumentMetadata> | null>(null);
  const [matters, setMatters] = useState<Matter[]>([]);
  const [isLoadingMatters, setIsLoadingMatters] = useState(false);
  const [encryption, setEncryption] = useState<'BYOK' | 'SYSTEM'>('SYSTEM');

  const gemini = new LexGeminiService();

  const fetchMatters = async () => {
    setIsLoadingMatters(true);
    try {
      const session = getSavedSession();
      if (!session?.token) return;
      const data = await authorizedFetch('/api/matters', { token: session.token });
      setMatters(data);
      if (data.length > 0 && suggestions && !suggestions.matterId) {
        setSuggestions(prev => ({ ...prev, matterId: data[0].id } as DocumentMetadata));
      }
    } catch (e) {
      console.error("[Ingest] Matter fetch failed:", e);
    } finally {
      setIsLoadingMatters(false);
    }
  };

  React.useEffect(() => {
    fetchMatters();
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      analyzeFile(file.name);
    }
  };

  const analyzeFile = async (name: string) => {
    setIsAnalyzing(true);
    try {
      const metadata = await gemini.suggestMetadata(name);
      setSuggestions({
        ...metadata,
        name: name,
        id: `doc_${Date.now()}`,
        lastReviewed: new Date().toISOString().split('T')[0]
      } as DocumentMetadata);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = () => {
    if (suggestions) {
      onIngest({
        ...suggestions,
        encryption
      } as DocumentMetadata);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-brand-primary/10 rounded-xl border border-brand-primary/20">
              <Upload className="text-brand-primary" size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">Sovereign Ingestion</h3>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full text-slate-500 transition-colors" aria-label="Close modal" title="Close">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
          {!fileName ? (
            <label className="group block border-2 border-dashed border-slate-800 rounded-[2rem] p-12 text-center hover:border-emerald-500/30 transition-all cursor-pointer hover:bg-emerald-500/5">
              <input type="file" className="hidden" onChange={handleFileSelect} />
              <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Upload className="text-slate-500 group-hover:text-emerald-400" size={32} />
              </div>
              <p className="text-sm font-bold text-slate-300">Drop legal artifact or click to browse</p>
            </label>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-800 rounded-lg"><RefreshCw size={16} className={isAnalyzing ? 'animate-spin text-blue-400' : 'text-emerald-400'} /></div>
                  <span className="text-sm font-bold truncate max-w-xs">{fileName}</span>
                </div>
                <button onClick={() => setFileName('')} className="text-[10px] font-bold text-red-400 uppercase tracking-widest hover:underline">Clear</button>
              </div>

              {isAnalyzing ? (
                <div className="py-12 text-center space-y-4">
                  <div className="flex justify-center gap-1">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  </div>
                  <p className="text-xs text-slate-500 uppercase tracking-[0.2em] font-bold">AI Metadata Profiling in progress...</p>
                </div>
              ) : suggestions && (
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2 col-span-1">
                    <label htmlFor="matter-select" className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Matter ID</label>
                    <select
                      id="matter-select"
                      title="Matter ID"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      value={suggestions.matterId}
                      onChange={e => setSuggestions({ ...suggestions, matterId: e.target.value })}
                    >
                      {isLoadingMatters ? (
                        <option>Loading matters...</option>
                      ) : matters.length === 0 ? (
                        <option>No matters available</option>
                      ) : (
                        matters.map(m => <option key={m.id} value={m.id}>{m.name} ({m.client})</option>)
                      )}
                    </select>
                  </div>

                  <MetadataInput label="Jurisdiction" value={suggestions.jurisdiction!} onChange={v => setSuggestions({ ...suggestions, jurisdiction: v })} />

                  <div className="space-y-2 col-span-1">
                    <label htmlFor="classification-select" className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Classification</label>
                    <select
                      id="classification-select"
                      title="Classification"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      value={suggestions.classification}
                      onChange={e => setSuggestions({ ...suggestions, classification: e.target.value as any })}
                    >
                      <option value="Highly Sensitive">Highly Sensitive</option>
                      <option value="Confidential">Confidential</option>
                      <option value="Internal">Internal</option>
                      <option value="Public">Public</option>
                    </select>
                  </div>

                  <div className="space-y-2 col-span-1">
                    <label htmlFor="region-select" className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Regional Pinning</label>
                    <select
                      id="region-select"
                      title="Regional Pinning"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      value={suggestions.region}
                      onChange={e => setSuggestions({ ...suggestions, region: e.target.value as Region })}
                    >
                      {Object.values(Region).map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>

                  <div className="space-y-2 col-span-2">
                    <label htmlFor="privilege-select" className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Privilege Status</label>
                    <select
                      id="privilege-select"
                      title="Privilege Status"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      value={suggestions.privilege}
                      onChange={e => setSuggestions({ ...suggestions, privilege: e.target.value as PrivilegeStatus })}
                    >
                      {Object.values(PrivilegeStatus).map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>

                  <div className="col-span-2 space-y-4 pt-4 border-t border-slate-800">
                    <h5 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                      <Shield size={14} className="text-blue-400" /> Sovereignty Protocol
                    </h5>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => setEncryption('BYOK')}
                        className={`p-4 rounded-2xl border transition-all text-left group ${encryption === 'BYOK' ? 'bg-emerald-500/10 border-emerald-500' : 'bg-slate-950 border-slate-800'}`}
                      >
                        <p className={`text-xs font-bold mb-1 ${encryption === 'BYOK' ? 'text-emerald-400' : 'text-slate-400'}`}>BYOK Encryption</p>
                        <p className="text-[9px] text-slate-600 leading-tight">Use client-managed HSM keys for maximum sovereignty.</p>
                      </button>
                      <button
                        onClick={() => setEncryption('SYSTEM')}
                        className={`p-4 rounded-2xl border transition-all text-left group ${encryption === 'SYSTEM' ? 'bg-blue-500/10 border-blue-500' : 'bg-slate-950 border-slate-800'}`}
                      >
                        <p className={`text-xs font-bold mb-1 ${encryption === 'SYSTEM' ? 'text-blue-400' : 'text-slate-400'}`}>System Managed</p>
                        <p className="text-[9px] text-slate-600 leading-tight">AES-256 with regional rotation policies.</p>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-6 bg-slate-950/50 border-t border-slate-800 flex items-center justify-end">
          <div className="flex gap-3">
            <button onClick={onClose} className="px-6 py-2.5 text-slate-400 font-bold text-sm hover:text-white transition-colors">Cancel</button>
            <button
              disabled={!suggestions || isAnalyzing}
              onClick={handleSubmit}
              className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white px-8 py-2.5 rounded-xl font-bold text-sm shadow-xl shadow-emerald-900/20 transition-all flex items-center gap-2"
            >
              <CheckCircle size={18} /> Ingest into Vault
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface MetadataInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

const MetadataInput: React.FC<MetadataInputProps> = ({ label, value, onChange }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">{label}</label>
    <input
      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 placeholder:text-slate-700"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={`Enter ${label}...`}
    />
  </div>
);

export default DocumentIngestModal;
