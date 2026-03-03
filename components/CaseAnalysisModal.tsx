
import React, { useState } from 'react';
import {
    BrainCircuit,
    Upload,
    FileText,
    Scale,
    Sparkles,
    ChevronRight,
    ShieldCheck,
    Download,
    Share2,
    RefreshCw,
    X,
    CheckCircle2
} from 'lucide-react';
import { LexGeminiService } from '../services/geminiService';

const gemini = new LexGeminiService();

interface CaseAnalysisModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const CaseAnalysisModal: React.FC<CaseAnalysisModalProps> = ({ isOpen, onClose }) => {
    const [file, setFile] = useState<File | null>(null);
    const [analysisType, setAnalysisType] = useState<'CONTRACT' | 'CASE'>('CONTRACT');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [report, setReport] = useState<string | null>(null);
    const [step, setStep] = useState<'UPLOAD' | 'ANALYSIS'>('UPLOAD');

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const runAnalysis = async () => {
        if (!file) return;
        setIsAnalyzing(true);
        setStep('ANALYSIS');

        try {
            // Read file content
            const content = await file.text();
            // In a real environment, we'd handle PDF/DocX. For this prototype, we assume text-based or .md.
            const result = await gemini.analyzeDocument(content, analysisType);
            setReport(result);
        } catch (error) {
            console.error('Analysis failed:', error);
            setReport('Sovereign Analysis Enclave: Failed to process document. Please ensure the file is valid UTF-8 text.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const reset = () => {
        setFile(null);
        setReport(null);
        setStep('UPLOAD');
        setIsAnalyzing(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-y-0 right-0 w-[600px] bg-brand-sidebar border-l border-brand-border shadow-2xl z-[60] animate-in slide-in-from-right duration-500 flex flex-col">
            {/* Header */}
            <div className="p-8 border-b border-brand-border flex items-center justify-between bg-brand-bg/50 backdrop-blur-md">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-brand-secondary/10 rounded-2xl border border-brand-secondary/20">
                        <BrainCircuit className="text-brand-secondary" size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white tracking-tight">Legal Analysis Hub</h2>
                        <p className="text-xs text-brand-muted">AI-Powered Strategic Document Review</p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    title="Close"
                    className="p-2 hover:bg-brand-border rounded-xl text-brand-muted transition-colors"
                >
                    <X size={20} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
                {step === 'UPLOAD' ? (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Type Selection */}
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => setAnalysisType('CONTRACT')}
                                className={`p-6 rounded-3xl border transition-all text-left flex flex-col gap-3 group ${analysisType === 'CONTRACT'
                                    ? 'bg-brand-secondary/10 border-brand-secondary/50 shadow-lg shadow-brand-secondary/5'
                                    : 'bg-brand-sidebar border-brand-border hover:border-brand-secondary/30'
                                    }`}
                            >
                                <FileText className={analysisType === 'CONTRACT' ? 'text-brand-secondary' : 'text-brand-muted'} size={24} />
                                <div>
                                    <p className="text-sm font-bold text-white">Contractual Review</p>
                                    <p className="text-[10px] text-brand-muted">Obligations, Risks, Gaps</p>
                                </div>
                            </button>
                            <button
                                onClick={() => setAnalysisType('CASE')}
                                className={`p-6 rounded-3xl border transition-all text-left flex flex-col gap-3 group ${analysisType === 'CASE'
                                    ? 'bg-brand-primary/10 border-brand-primary/50 shadow-lg shadow-brand-primary/5'
                                    : 'bg-brand-sidebar border-brand-border hover:border-brand-primary/30'
                                    }`}
                            >
                                <Scale className={analysisType === 'CASE' ? 'text-brand-primary' : 'text-brand-muted'} size={24} />
                                <div>
                                    <p className="text-sm font-bold text-white">Case Analysis</p>
                                    <p className="text-[10px] text-brand-muted">Summary, Issues, Procedural</p>
                                </div>
                            </button>
                        </div>

                        {/* Upload Zone */}
                        <div
                            className={`border-2 border-dashed rounded-[2.5rem] p-12 flex flex-col items-center gap-6 transition-all ${file ? 'border-brand-secondary/50 bg-brand-secondary/5' : 'border-brand-border hover:border-brand-secondary/30 bg-brand-bg/30'
                                }`}
                        >
                            <div className={`p-5 rounded-3xl ${file ? 'bg-brand-secondary/20 text-brand-secondary' : 'bg-brand-sidebar text-brand-muted'}`}>
                                {file ? <CheckCircle2 size={32} /> : <Upload size={32} />}
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-bold text-white mb-2">
                                    {file ? file.name : 'Drop your document here'}
                                </p>
                                <p className="text-[11px] text-brand-muted">
                                    {file ? `${(file.size / 1024).toFixed(1)} KB · Ready for analysis` : 'Supports PDF, Word, or Markdown'}
                                </p>
                            </div>
                            <input
                                type="file"
                                id="analysis-upload"
                                className="hidden"
                                onChange={handleUpload}
                                accept=".txt,.md,.pdf,.docx"
                            />
                            {!file ? (
                                <label
                                    htmlFor="analysis-upload"
                                    className="px-8 py-3 bg-brand-sidebar border border-brand-border rounded-2xl text-xs font-bold text-white hover:border-brand-secondary/50 cursor-pointer transition-all active:scale-95"
                                >
                                    Select File
                                </label>
                            ) : (
                                <button
                                    onClick={() => setFile(null)}
                                    className="text-[10px] text-brand-muted hover:text-red-400 font-bold uppercase tracking-widest transition-all"
                                >
                                    Remove File
                                </button>
                            )}
                        </div>

                        {/* Sovereign Protection Info */}
                        <div className="p-6 bg-brand-bg/50 border border-brand-border rounded-3xl flex items-start gap-4">
                            <ShieldCheck className="text-emerald-400 shrink-0" size={18} />
                            <div>
                                <p className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest mb-1">Enclave Shield Active</p>
                                <p className="text-[10px] text-brand-muted leading-relaxed">
                                    Documents are processed within the Sovereign Enclave. PII is scrubbed before analysis, and no data is used for model training.
                                </p>
                            </div>
                        </div>

                        {/* Action */}
                        <button
                            disabled={!file}
                            onClick={runAnalysis}
                            className="w-full py-4 bg-brand-secondary rounded-2xl font-bold text-brand-bg shadow-xl shadow-brand-secondary/20 hover:opacity-90 disabled:opacity-40 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                        >
                            <Sparkles size={18} />
                            Execute Sovereign Analysis
                        </button>
                    </div>
                ) : (
                    <div className="space-y-8 animate-in fade-in duration-700">
                        {isAnalyzing ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-6">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-brand-secondary/20 blur-2xl rounded-full animate-pulse" />
                                    <RefreshCw className="text-brand-secondary animate-spin relative" size={48} />
                                </div>
                                <div className="text-center space-y-2">
                                    <p className="text-sm font-bold text-white uppercase tracking-widest">Vectorizing & Analyzing</p>
                                    <p className="text-[11px] text-brand-muted">Negotiating jurisdictional contexts with {analysisType === 'CONTRACT' ? 'Corporate' : 'Litigation'} AI...</p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-500">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-brand-secondary animate-pulse" />
                                        <span className="text-[10px] font-bold text-brand-muted uppercase tracking-widest">Sovereign Analysis Report</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <button title="Download" className="p-2 bg-brand-bg border border-brand-border rounded-lg text-brand-muted hover:text-white transition-colors">
                                            <Download size={14} />
                                        </button>
                                        <button title="Share" className="p-2 bg-brand-bg border border-brand-border rounded-lg text-brand-muted hover:text-white transition-colors">
                                            <Share2 size={14} />
                                        </button>
                                    </div>
                                </div>

                                <div className="bg-brand-sidebar border border-brand-border rounded-[2rem] p-8 shadow-inner overflow-hidden relative">
                                    <div className="absolute top-0 right-0 p-8 opacity-5">
                                        <BrainCircuit size={120} />
                                    </div>
                                    <div className="prose prose-invert max-w-none text-sm leading-relaxed text-brand-text/90 whitespace-pre-wrap">
                                        {report}
                                    </div>
                                </div>

                                <button
                                    onClick={reset}
                                    className="w-full py-4 border border-brand-border hover:border-brand-secondary/30 rounded-2xl font-bold text-[11px] text-brand-muted uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                                >
                                    Analyze Another Document <ChevronRight size={14} />
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="p-6 bg-brand-bg/50 border-t border-brand-border flex items-center justify-center gap-4">
                <span className="text-[9px] font-mono text-brand-muted tracking-widest uppercase">Sovereign Intelligence v1.0.4</span>
                <div className="w-1 h-1 rounded-full bg-brand-border" />
                <span className="text-[9px] font-mono text-brand-muted tracking-widest uppercase">Ghana Enclave Cluster GH-ACC-1</span>
            </div>
        </div>
    );
};

export default CaseAnalysisModal;
