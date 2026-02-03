
import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  ShieldAlert,
  Eye,
  EyeOff,
  Scale,
  ArrowRight,
  Filter,
  ShieldCheck,
  Lock,
  ChevronRight,
  UserCheck,
  Zap,
  Briefcase
} from 'lucide-react';
import { ReviewArtifact, ReviewStatus, UserRole, PrivilegeStatus } from '../types';
import { LexGeminiService } from '../services/geminiService';

const INITIAL_REVIEWS: ReviewArtifact[] = [
  {
    id: 'REV-PR-001', matterId: 'MAT-GEN-01', docId: 'doc_101', title: 'Standard Service Level Addendum',
    status: ReviewStatus.AI_DRAFTED, urgency: 'Urgent', aiConfidence: 0.94, piiCount: 3, jurisdiction: 'United Kingdom', assignedTo: UserRole.INTERNAL_COUNSEL
  },
  {
    id: 'REV-PR-002', matterId: 'MAT-GEN-02', docId: 'doc_102', title: 'Confidentiality & IP Assignment',
    status: ReviewStatus.SAFETY_VERIFIED, urgency: 'Routine', aiConfidence: 0.96, piiCount: 0, jurisdiction: 'USA', assignedTo: UserRole.INTERNAL_COUNSEL
  },
  {
    id: 'REV-PR-003', matterId: 'MAT-GEN-01', docId: 'doc_103', title: 'Lease Agreement - Clause 4.2',
    status: ReviewStatus.COUNSEL_REVIEW, urgency: 'Critical', aiConfidence: 0.89, piiCount: 5, jurisdiction: 'Germany', assignedTo: UserRole.EXTERNAL_COUNSEL
  }
];

const ReviewHub: React.FC<{ userRole: UserRole }> = ({ userRole }) => {
  const [reviews, setReviews] = useState<ReviewArtifact[]>(INITIAL_REVIEWS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scrubbedView, setScrubbedView] = useState<{ content: string; count: number } | null>(null);

  const gemini = new LexGeminiService();
  const selectedArtifact = reviews.find(r => r.id === selectedId);

  const handleOpenReview = async (artifact: ReviewArtifact) => {
    setSelectedId(artifact.id);
    setIsProcessing(true);

    // Simulate fetching content and applying DAS proxy with generic text
    const rawContent = `DRAFT ARTIFACT [${artifact.id}]: Regarding '${artifact.title}'. This document contains sensitive jurisdictional clauses for ${artifact.jurisdiction}. It has been processed through the Sovereign Data Anonymization Service to ensure compliance with organization-wide RBAC policies. Full counsel work product is maintained within the secure enclave.`;
    const result = await gemini.getScrubbedContent(rawContent, userRole, PrivilegeStatus.PRIVILEGED);

    setScrubbedView({ content: result.content, count: result.scrubbedEntities });
    setIsProcessing(false);
  };

  const handleApprove = (id: string) => {
    setReviews(prev => prev.map(r => r.id === id ? { ...r, status: ReviewStatus.APPROVED } : r));
    setSelectedId(null);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-2xl font-bold flex items-center gap-3 tracking-tight">
            <div className="p-2 bg-blue-500/10 rounded-xl border border-blue-500/20">
              <Scale className="text-blue-400" size={24} />
            </div>
            Sovereign Review Hub
          </h3>
          <p className="text-slate-400 text-sm">Validating AI intelligence through jurisdictional RBAC filters.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            Acting as: <span className="text-emerald-400">{userRole}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Review Queue */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between px-2 mb-2">
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Clock size={14} /> Pending Validation ({reviews.filter(r => r.status !== ReviewStatus.APPROVED).length})
            </h4>
            <Filter size={14} className="text-slate-600 cursor-pointer hover:text-white" />
          </div>

          <div className="space-y-3">
            {reviews.map(artifact => (
              <div
                key={artifact.id}
                onClick={() => handleOpenReview(artifact)}
                className={`p-5 rounded-3xl border transition-all cursor-pointer group ${selectedId === artifact.id
                  ? 'bg-blue-500/5 border-blue-500/40 shadow-xl shadow-blue-500/5'
                  : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
                  }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase ${artifact.urgency === 'Critical' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                    artifact.urgency === 'Urgent' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                      'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    }`}>
                    {artifact.urgency}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${artifact.status === ReviewStatus.APPROVED ? 'bg-emerald-500' : 'bg-blue-500 animate-pulse'
                      }`}></div>
                    <span className="text-[9px] font-mono text-slate-500 uppercase tracking-tighter">{artifact.status}</span>
                  </div>
                </div>
                <h5 className={`font-bold text-sm mb-1 ${selectedId === artifact.id ? 'text-white' : 'text-slate-300'}`}>{artifact.title}</h5>
                <div className="flex items-center justify-between">
                  <p className="text-[10px] text-slate-500 font-mono tracking-tighter uppercase">{artifact.matterId} • {artifact.jurisdiction}</p>
                  <ChevronRight size={14} className={`transition-all ${selectedId === artifact.id ? 'translate-x-1 text-blue-400' : 'text-slate-600'}`} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Validation Workspace */}
        <div className="lg:col-span-7 space-y-6 sticky top-24">
          {selectedArtifact ? (
            <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 space-y-8 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300">
              {/* Metadata Header */}
              <div className="flex items-center justify-between pb-6 border-b border-slate-800/50">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20">
                    <Scale className="text-blue-400" size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg text-white">{selectedArtifact.title}</h4>
                    <p className="text-[10px] text-slate-500 uppercase font-mono tracking-widest">Sovereign SILO: {selectedArtifact.jurisdiction}-REG-1</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-emerald-400">{Math.round(selectedArtifact.aiConfidence * 100)}% Confidence</p>
                  <p className="text-[9px] text-slate-500 font-medium uppercase">AI reasoning path verified</p>
                </div>
              </div>

              {/* DAS Scrubbed Workspace */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    {userRole === UserRole.EXTERNAL_COUNSEL ? <EyeOff size={14} className="text-amber-500" /> : <Eye size={14} className="text-emerald-500" />}
                    {userRole === UserRole.EXTERNAL_COUNSEL ? 'Proxy-Scrubbed Workspace' : 'Full Counsel Workspace'}
                  </h5>
                  {scrubbedView && scrubbedView.count > 0 && (
                    <span className="text-[9px] bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded border border-amber-500/20 font-bold uppercase">
                      {scrubbedView.count} PII Elements Redacted
                    </span>
                  )}
                </div>

                <div className="bg-slate-950/80 border border-slate-800 rounded-3xl p-6 min-h-[200px] relative">
                  {isProcessing ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                      <Zap className="text-blue-400 animate-pulse" size={32} />
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Proxy applying RBAC filters...</p>
                    </div>
                  ) : (
                    <p className="text-sm leading-relaxed text-slate-300 font-serif italic">
                      {scrubbedView?.content}
                    </p>
                  )}
                </div>
              </div>

              {/* Integrity Checkers */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-2xl space-y-3">
                  <p className="text-[10px] font-bold text-slate-500 uppercase">Decision Trace</p>
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={14} className="text-emerald-500" />
                    <span className="text-[10px] font-mono text-slate-300">VALIDATED-TOKEN-{selectedArtifact.id}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Lock size={14} className="text-blue-500" />
                    <span className="text-[10px] font-mono text-slate-300">BYOK: Secure Enclave</span>
                  </div>
                </div>
                <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-2xl space-y-3">
                  <p className="text-[10px] font-bold text-slate-500 uppercase">Governance Status</p>
                  <div className="flex items-center gap-2">
                    <UserCheck size={14} className="text-emerald-500" />
                    <span className="text-[10px] font-mono text-emerald-400 tracking-tighter font-bold">COMPLIANCE: VERIFIED</span>
                  </div>
                  <div className="flex items-center gap-2 opacity-50">
                    <Briefcase size={14} className="text-slate-500" />
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-tighter">Access: {userRole}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-6 border-t border-slate-800/50 flex gap-4">
                <button
                  disabled={selectedArtifact.status === ReviewStatus.APPROVED}
                  onClick={() => handleApprove(selectedArtifact.id)}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-3 transition-all shadow-xl shadow-emerald-900/20 active:scale-95"
                >
                  {selectedArtifact.status === ReviewStatus.APPROVED ? <CheckCircle2 size={20} /> : <ShieldCheck size={20} />}
                  {selectedArtifact.status === ReviewStatus.APPROVED ? 'Approved & Sealed' : 'Approve & Sign Artifact'}
                </button>
                <button
                  onClick={() => {
                    console.warn("Artifact flagged for integrity review:", selectedArtifact.id);
                    alert("Artifact flagged for Sovereign Integrity Review Cache.");
                  }}
                  className="px-6 bg-slate-800 hover:bg-red-500/10 text-slate-400 hover:text-red-400 border border-slate-700 rounded-2xl transition-all active:scale-95"
                  title="Flag for Integrity Review"
                >
                  <ShieldAlert size={20} />
                </button>
              </div>
            </div>
          ) : (
            <div className="h-[500px] border-2 border-dashed border-slate-800 rounded-[2.5rem] flex flex-col items-center justify-center text-slate-600 gap-4">
              <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center opacity-50">
                <Scale size={32} />
              </div>
              <p className="text-sm font-medium">Select an artifact from the queue to initiate Sovereign Review.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewHub;
