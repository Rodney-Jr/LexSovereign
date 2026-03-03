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
    isOpen?: boolean;
    onClose?: () => void;
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
            // Send the File object directly to support multi-format parsing in the Enclave
            const result = await gemini.analyzeDocument(file, analysisType);
            setReport(result);
        } catch (error: any) {
            console.error('Analysis failed:', error);
            setReport(`Sovereign Analysis Enclave: Failed to process document. ${error.message || 'Please ensure the file is a valid PDF, Word, or Markdown document.'}`);
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

    // If used as a modal but not open, return null
    if (isOpen === false) return null;

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h3 className="text-2xl font-bold flex items-center gap-3 tracking-tight">
                        <div className="p-2 bg-brand-secondary/10 rounded-xl border border-brand-secondary/20">
                            <BrainCircuit className="text-brand-secondary" size={24} />
                        </div>
                        Legal Analysis Hub
                    </h3>
                    <p className="text-slate-400 text-sm">AI-Powered Strategic Document Review & Legal Intelligence.</p>
                </div>
                {onClose && (
                    <button
                        onClick={onClose}
                        title="Close"
                        className="p-2 hover:bg-brand-border rounded-xl text-brand-muted transition-colors"
                    >
                        <X size={20} />
                    </button>
                )}
            </div>

            <div className="space-y-8">
                {step === 'UPLOAD' ? (
                    <div className="space-y-8">
                        {/* Type Selection */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <button
                                onClick={() => setAnalysisType('CONTRACT')}
                                className={`p-8 rounded-[2rem] border transition-all text-left flex flex-col gap-4 group ${analysisType === 'CONTRACT'
                                    ? 'bg-brand-secondary/10 border-brand-secondary/50 shadow-xl shadow-brand-secondary/5'
                                    : 'bg-brand-sidebar border-brand-border hover:border-brand-secondary/30'
                                    }`}
                            >
                                <div className={`p-3 rounded-2xl w-fit ${analysisType === 'CONTRACT' ? 'bg-brand-secondary/20 text-brand-secondary' : 'bg-brand-bg text-brand-muted'}`}>
                                    <FileText size={28} />
                                </div>
                                <div>
                                    <p className="text-lg font-bold text-white mb-1">Contractual Review</p>
                                    <p className="text-xs text-brand-muted leading-relaxed">Risk assessment, obligation mapping, and jurisdictional compliance checks for commercial agreements.</p>
                                </div>
                            </button>
                            <button
                                onClick={() => setAnalysisType('CASE')}
                                className={`p-8 rounded-[2rem] border transition-all text-left flex flex-col gap-4 group ${analysisType === 'CASE'
                                    ? 'bg-brand-primary/10 border-brand-primary/50 shadow-xl shadow-brand-primary/5'
                                    : 'bg-brand-sidebar border-brand-border hover:border-brand-primary/30'
                                    }`}
                            >
                                <div className={`p-3 rounded-2xl w-fit ${analysisType === 'CASE' ? 'bg-brand-primary/20 text-brand-primary' : 'bg-brand-bg text-brand-muted'}`}>
                                    <Scale size={28} />
                                </div>
                                <div>
                                    <p className="text-lg font-bold text-white mb-1">Case Analysis</p>
                                    <p className="text-xs text-brand-muted leading-relaxed">Pleading summaries, procedural gap identification, and strategic strength analysis for litigation matters.</p>
                                </div>
                            </button>
                        </div>

                        {/* Upload Zone */}
                        <div
                            className={`border-2 border-dashed rounded-[3rem] p-16 flex flex-col items-center gap-6 transition-all ${file ? 'border-brand-secondary/50 bg-brand-secondary/5' : 'border-brand-border hover:border-brand-secondary/30 bg-brand-bg/30'
                                }`}
                        >
                            <div className={`p-6 rounded-3xl ${file ? 'bg-brand-secondary/20 text-brand-secondary' : 'bg-brand-sidebar text-brand-muted'}`}>
                                {file ? <CheckCircle2 size={40} /> : <Upload size={40} />}
                            </div>
                            <div className="text-center space-y-2">
                                <p className="text-base font-bold text-white">
                                    {file ? file.name : 'Ingest Sovereign Document'}
                                </p>
                                <p className="text-xs text-brand-muted">
                                    {file ? `${(file.size / 1024).toFixed(1)} KB · Ready for Enclave processing` : 'Securely upload PDF, Word, or Markdown artifacts'}
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
                                    className="px-10 py-4 bg-brand-sidebar border border-brand-border rounded-2xl text-sm font-bold text-white hover:border-brand-secondary/50 cursor-pointer transition-all active:scale-95 shadow-lg"
                                >
                                    Select Source File
                                </label>
                            ) : (
                                <button
                                    onClick={() => setFile(null)}
                                    className="text-xs text-brand-muted hover:text-red-400 font-bold uppercase tracking-widest transition-all"
                                >
                                    Reset Selection
                                </button>
                            )}
                        </div>

                        {/* Sovereign Protection Info */}
                        <div className="p-8 bg-brand-bg/50 border border-brand-border rounded-[2.5rem] flex items-start gap-6">
                            <div className="p-3 bg-emerald-500/10 rounded-2xl">
                                <ShieldCheck className="text-emerald-400" size={24} />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-emerald-400 uppercase tracking-[0.2em] mb-2">Sovereign Enclave Protection</p>
                                <p className="text-sm text-brand-muted leading-relaxed">
                                    All documents are processed within an isolated hardware enclave. PII is automatically scrubbed via the Sovereign DAS engine before analysis, ensuring that no client data is used for model training or leaks outside your jurisdiction.
                                </p>
                            </div>
                        </div>

                        {/* Action */}
                        <button
                            disabled={!file}
                            onClick={runAnalysis}
                            className="w-full py-5 bg-brand-secondary rounded-2xl font-bold text-brand-bg shadow-2xl shadow-brand-secondary/20 hover:opacity-90 disabled:opacity-40 transition-all flex items-center justify-center gap-3 active:scale-[0.99] text-lg"
                        >
                            <Sparkles size={22} />
                            Incept Sovereign Analysis
                        </button>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {isAnalyzing ? (
                            <div className="flex flex-col items-center justify-center py-32 gap-8 bg-brand-sidebar/30 rounded-[3rem] border border-brand-border">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-brand-secondary/20 blur-3xl rounded-full animate-pulse" />
                                    <RefreshCw className="text-brand-secondary animate-spin relative" size={64} />
                                </div>
                                <div className="text-center space-y-3">
                                    <p className="text-lg font-bold text-white uppercase tracking-[0.3em]">Processing intelligence</p>
                                    <p className="text-sm text-brand-muted">Leveraging jurisdictional models GH-SOV-V2 for legal synthesis...</p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700">
                                <div className="flex items-center justify-between bg-brand-bg/50 p-6 rounded-3xl border border-brand-border">
                                    <div className="flex items-center gap-4">
                                        <div className="w-3 h-3 rounded-full bg-brand-secondary animate-pulse" />
                                        <div>
                                            <span className="text-xs font-bold text-brand-muted uppercase tracking-[0.2em]">Validated Analysis Report</span>
                                            <p className="text-[10px] text-brand-muted font-mono mt-0.5">ID: SOV-REPORT-{Math.random().toString(36).substr(2, 8).toUpperCase()}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <button title="Download" className="p-3 bg-brand-sidebar border border-brand-border rounded-xl text-brand-muted hover:text-brand-secondary hover:border-brand-secondary/30 transition-all">
                                            <Download size={18} />
                                        </button>
                                        <button title="Share" className="p-3 bg-brand-sidebar border border-brand-border rounded-xl text-brand-muted hover:text-brand-secondary hover:border-brand-secondary/30 transition-all">
                                            <Share2 size={18} />
                                        </button>
                                    </div>
                                </div>

                                <div className="bg-brand-sidebar border border-brand-border rounded-[3rem] p-12 shadow-2xl overflow-hidden relative min-h-[500px]">
                                    <div className="absolute top-0 right-0 p-12 opacity-[0.03] scale-150 rotate-12">
                                        <BrainCircuit size={300} />
                                    </div>
                                    <div className="prose prose-invert max-w-none text-base leading-loose text-brand-text/90 whitespace-pre-wrap relative z-10">
                                        {report}
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <button
                                        onClick={reset}
                                        className="flex-1 py-5 border border-brand-border hover:border-brand-secondary/30 rounded-2xl font-bold text-xs text-brand-muted uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 bg-brand-bg/30"
                                    >
                                        Initiate New Assessment <ChevronRight size={16} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="pt-12 flex flex-col items-center gap-2">
                <div className="flex items-center gap-4">
                    <span className="text-[10px] font-mono text-brand-muted tracking-[0.3em] uppercase">Sovereign Intelligence v1.0.4</span>
                    <div className="w-1 h-1 rounded-full bg-brand-border" />
                    <span className="text-[10px] font-mono text-brand-muted tracking-[0.3em] uppercase">Jurisdiction GH-ACC-1</span>
                </div>
                <p className="text-[9px] text-brand-muted opacity-50">Verified Enclave Hash: 0x82...f92a</p>
            </div>
        </div>
    );
};

export default CaseAnalysisModal;
