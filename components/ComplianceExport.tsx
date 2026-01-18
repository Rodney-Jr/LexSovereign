
import React, { useState } from 'react';
import { LexGeminiService } from '../services/geminiService';
import { ShieldCheck, Download, FileText, Share2, RefreshCw, CheckCircle } from 'lucide-react';

const ComplianceExport: React.FC<{ logs: any[] }> = ({ logs }) => {
  const [report, setReport] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const gemini = new LexGeminiService();

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const result = await gemini.generateComplianceReport(logs);
      setReport(result);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500">
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2rem] shadow-2xl space-y-8 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
              <ShieldCheck className="text-emerald-400" size={32} />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white tracking-tight">Sovereign Audit Export</h3>
              <p className="text-slate-400 text-sm">Formal compliance artifact for legal regulatory oversight.</p>
            </div>
          </div>
          {!report && (
            <button 
              onClick={handleGenerate}
              disabled={isGenerating}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-white font-bold rounded-2xl transition-all flex items-center gap-3 shadow-lg shadow-emerald-900/30"
            >
              {isGenerating ? <RefreshCw className="animate-spin" size={20} /> : <FileText size={20} />}
              {isGenerating ? "Analyzing Traces..." : "Generate Audit Package"}
            </button>
          )}
        </div>

        {report ? (
          <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <div className="p-8 bg-slate-950/80 border border-slate-800 rounded-2xl shadow-inner font-serif leading-relaxed text-slate-300">
               <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-800">
                  <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-emerald-500">Sovereign Compliance Certification</div>
                  <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-slate-500">TS: {new Date().toISOString()}</div>
               </div>
               <div className="whitespace-pre-wrap text-sm">{report}</div>
            </div>
            
            <div className="flex gap-4">
               <button className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 rounded-2xl font-bold text-sm flex items-center justify-center gap-3 transition-all border border-slate-700">
                  <Download size={18} /> Download Signed PDF
               </button>
               <button className="flex-1 py-4 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 rounded-2xl font-bold text-sm flex items-center justify-center gap-3 transition-all">
                  <Share2 size={18} /> Share with Auditor
               </button>
            </div>
          </div>
        ) : (
          <div className="py-20 flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-3xl bg-slate-900/30">
             <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-6 text-slate-600">
                <FileText size={32} />
             </div>
             <p className="text-slate-500 font-medium text-center max-w-xs">
                Click "Generate" to synthesize the latest {logs.length} audit events into a formal compliance summary.
             </p>
          </div>
        )}

        <div className="pt-8 border-t border-slate-800">
           <div className="flex items-center gap-2 mb-4">
              <CheckCircle size={14} className="text-emerald-400" />
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Verified Evidence Chains</h4>
           </div>
           <div className="flex flex-wrap gap-2">
              {logs.map((l, i) => (
                <div key={i} className="px-2 py-1 bg-slate-800 rounded text-[9px] font-mono text-slate-400 border border-slate-700">
                  {l.approvalToken}
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};

export default ComplianceExport;
