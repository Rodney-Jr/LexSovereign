
import React, { useState } from 'react';
import {
  ShieldCheck,
  Search,
  Filter,
  FileText,
  Cpu,
  UserCheck,
  Lock,
  AlertCircle,
  Activity,
  Clock,
  Hash,
  ChevronRight,
  ShieldAlert,
  Terminal,
  ArrowRightLeft,
  Scale
} from 'lucide-react';
import { AuditLogEntry } from '../types';

const SAMPLE_LOGS: AuditLogEntry[] = [
  {
    timestamp: '2024-05-20T10:45:12Z',
    actor: 'Gemini 3 Pro',
    action: 'Contract Summary',
    model: 'gemini-3-pro-preview',
    promptVersion: 'p-legal-v4.2',
    approvalToken: 'APP-992-LEGAL-SR',
    confidenceScore: 0.94,
    status: 'PROCEEDED'
  },
  {
    timestamp: '2024-05-20T11:02:44Z',
    actor: 'Gemini 3 Flash',
    action: 'KYC Verification',
    model: 'gemini-3-flash-preview',
    promptVersion: 'p-kyc-v1.1',
    approvalToken: 'PENDING',
    confidenceScore: 0.72,
    status: 'KILL_SWITCH'
  },
  {
    timestamp: '2024-05-20T11:15:30Z',
    actor: 'Gemini 3 Pro',
    action: 'Advice Generation',
    model: 'gemini-3-pro-preview',
    promptVersion: 'p-legal-v4.2',
    approvalToken: 'BLOCKED',
    confidenceScore: 0.91,
    status: 'INTERCEPTED'
  },
  {
    timestamp: '2024-05-20T12:05:00Z',
    actor: 'Llama-3 (Local)',
    action: 'Privileged Redline',
    model: 'llama-3-70b-enclave',
    promptVersion: 'p-priv-v2.0',
    approvalToken: 'APP-995-COUNSEL',
    confidenceScore: 0.98,
    status: 'PROCEEDED'
  }
];

const DecisionTraceLedger: React.FC = () => {
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);
  const [isSimplifiedView, setIsSimplifiedView] = useState(true);

  // Mapping for simplified view
  const getSimplifiedData = (log: AuditLogEntry) => {
    let localLaw = "General Regulatory Framework";
    if (log.action.includes("Contract") || log.action.includes("Drafted")) localLaw = "Nigeria NDPA 2023 Applied";
    if (log.action.includes("KYC")) localLaw = "Kenya DPA 2019 Applied";
    if (log.action.includes("Privileged")) localLaw = "Ghana Data Protection Act Applied";

    const securityStatus = log.status === 'PROCEEDED' ? "🔒 Secure in Lagos Silo" :
      log.status === 'KILL_SWITCH' ? "🛑 Intercepted for Safety" :
        "🛡️ Restricted Access";

    return { localLaw, securityStatus };
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-24">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h3 className="text-2xl font-bold flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
              <Activity className="text-emerald-500" size={24} />
            </div>
            Immutable Decision Trace Ledger
          </h3>
          <p className="text-brand-muted text-sm">Decision hashes pinned to the FIPS 140-2 Sovereign Ledger.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-brand-sidebar border border-brand-border p-1 rounded-xl flex gap-1">
            <button
              onClick={() => setIsSimplifiedView(true)}
              className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${isSimplifiedView ? 'bg-brand-primary text-brand-bg shadow-lg' : 'text-brand-muted hover:text-brand-text'}`}
            >
              Peace of Mind View
            </button>
            <button
              onClick={() => setIsSimplifiedView(false)}
              className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${!isSimplifiedView ? 'bg-brand-primary text-brand-bg shadow-lg' : 'text-brand-muted hover:text-brand-text'}`}
            >
              Technical Trace
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" size={16} />
            <input
              type="text"
              placeholder="Filter by Token or ID..."
              className="bg-brand-bg border border-brand-border rounded-xl pl-10 pr-4 py-2 text-xs text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-primary transition-all"
            />
          </div>
          <button title="Filter Logs" className="p-2.5 bg-brand-bg border border-brand-border rounded-xl text-brand-muted hover:text-brand-text transition-all">
            <Filter size={18} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Ledger Table */}
        <div className="lg:col-span-8 bg-brand-sidebar border border-brand-border rounded-[2.5rem] overflow-hidden shadow-2xl backdrop-blur-sm">
          <table className="w-full text-left">
            <thead className="bg-brand-bg/30 border-b border-brand-border text-[10px] font-bold uppercase tracking-widest text-brand-muted">
              {isSimplifiedView ? (
                <tr>
                  <th className="px-8 py-5">Action Taken</th>
                  <th className="px-8 py-5">Local Law Applied</th>
                  <th className="px-8 py-5">Security Status</th>
                  <th className="px-8 py-5 text-right">Verification</th>
                </tr>
              ) : (
                <tr>
                  <th className="px-8 py-5">Event / Timestamp</th>
                  <th className="px-8 py-5">System Architecture</th>
                  <th className="px-8 py-5">Status / Confidence</th>
                  <th className="px-8 py-5 text-right">Trace</th>
                </tr>
              )}
            </thead>
            <tbody className="divide-y divide-brand-border/50">
              {SAMPLE_LOGS.map((log, idx) => {
                const { localLaw, securityStatus } = getSimplifiedData(log);
                return (
                  <tr
                    key={idx}
                    onClick={() => setSelectedLog(log)}
                    className={`group cursor-pointer transition-all ${selectedLog === log ? 'bg-brand-primary/10' : 'hover:bg-brand-bg/20'}`}
                  >
                    {isSimplifiedView ? (
                      <>
                        <td className="px-8 py-5">
                          <p className="text-sm font-bold text-brand-text">{log.action}</p>
                          <p className="text-[10px] text-brand-muted italic mt-0.5">{new Date(log.timestamp).toLocaleDateString()}</p>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-2">
                            <Scale size={14} className="text-brand-primary/50" />
                            <span className="text-xs text-brand-text/80">{localLaw}</span>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <span className={`text-[10px] font-bold px-3 py-1 rounded-full border ${log.status === 'PROCEEDED' ? 'bg-brand-primary/10 text-brand-primary border-brand-primary/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
                            }`}>
                            {securityStatus}
                          </span>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-4">
                            <div className={`p-2 rounded-xl border ${log.status === 'PROCEEDED' ? 'bg-brand-primary/10 border-brand-primary/20 text-brand-primary' :
                              log.status === 'KILL_SWITCH' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                                'bg-amber-500/10 border-amber-500/20 text-amber-400'
                              }`}>
                              {log.status === 'PROCEEDED' ? <ShieldCheck size={18} /> : log.status === 'KILL_SWITCH' ? <ShieldAlert size={18} /> : <Lock size={18} />}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-brand-text">{log.action}</p>
                              <p className="text-[10px] text-brand-muted font-mono tracking-tighter">
                                {new Date(log.timestamp).toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <div className="space-y-1">
                            <p className="text-[11px] font-bold text-brand-text">{log.model}</p>
                            <div className="flex items-center gap-2">
                              <Hash size={10} className="text-brand-muted" />
                              <span className="text-[9px] font-mono text-brand-muted uppercase">{log.promptVersion}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <div className="space-y-2">
                            <div className={`text-[9px] font-bold px-2 py-0.5 rounded border inline-block ${log.status === 'PROCEEDED' ? 'bg-brand-primary/10 text-brand-primary border-brand-primary/20' :
                              log.status === 'KILL_SWITCH' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                'bg-amber-500/10 text-amber-400 border-amber-500/20'
                              }`}>
                              {log.status.replace('_', ' ')}
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="h-1 w-12 bg-brand-bg rounded-full overflow-hidden">
                                <div
                                  className={`h-full dynamic-width ${log.confidenceScore >= 0.85 ? 'bg-brand-primary' : 'bg-red-500'}`}
                                  style={{ '--width': `${log.confidenceScore * 100}%` } as any}
                                ></div>
                              </div>
                              <span className="text-[10px] font-mono text-brand-muted">{Math.round(log.confidenceScore * 100)}%</span>
                            </div>
                          </div>
                        </td>
                      </>
                    )}
                    <td className="px-8 py-5 text-right">
                      <ChevronRight size={18} className={`text-brand-muted group-hover:text-brand-primary group-hover:translate-x-1 transition-all ${selectedLog === log ? 'text-brand-primary translate-x-1' : ''}`} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Trace Inspector Sidebar */}
        <div className="lg:col-span-4 space-y-6 sticky top-24">
          {selectedLog ? (
            <div className="bg-brand-sidebar border border-brand-border p-8 rounded-[2.5rem] space-y-8 shadow-2xl animate-in zoom-in-95 duration-300 backdrop-blur-sm">
              <div className="space-y-1">
                <h4 className="text-[10px] font-bold text-brand-muted uppercase tracking-widest flex items-center gap-2">
                  <Terminal size={14} className="text-brand-primary" /> Trace Inspector
                </h4>
                <p className="text-lg font-bold text-brand-text tracking-tight">{selectedLog.action}</p>
              </div>

              <div className="space-y-6">
                <div className="p-5 bg-brand-bg/80 border border-brand-border rounded-2xl space-y-4 shadow-inner">
                  <div className="space-y-1">
                    <p className="text-[9px] font-bold text-brand-muted uppercase">Decision Hash</p>
                    <p className="text-[10px] font-mono text-brand-secondary break-all">sha256:7f92e3a1...882c</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-[9px] font-bold text-brand-muted uppercase">Human Approval Token</p>
                    <p className="text-[10px] font-mono text-brand-primary font-bold">{selectedLog.approvalToken}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h5 className="text-[10px] font-bold uppercase tracking-widest text-brand-muted flex items-center gap-2">
                    <ArrowRightLeft size={14} className="text-purple-400" /> Protocol Status
                  </h5>
                  <div className="space-y-3">
                    <StatusLine label="DAS Scrubbing" status="Verified" active={true} />
                    <StatusLine label="RRE Validation" status={selectedLog.status === 'INTERCEPTED' ? 'Blocked' : 'Passed'} active={true} />
                    <StatusLine
                      label="Kill-Switch"
                      status={selectedLog.confidenceScore < 0.85 ? 'Triggered' : 'Inactive'}
                      active={selectedLog.confidenceScore < 0.85}
                      color={selectedLog.confidenceScore < 0.85 ? 'red' : 'slate'}
                    />
                    <StatusLine label="BYOK Handshake" status="Exclusive" active={true} />
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-brand-border/50">
                <div className="bg-brand-primary/5 border border-brand-primary/10 p-4 rounded-xl flex items-start gap-3">
                  <ShieldCheck className="text-brand-primary shrink-0" size={18} />
                  <p className="text-[10px] leading-relaxed text-brand-muted">
                    This trace is cryptographically sealed in the <strong>Jurisdictional Silo</strong>. It cannot be altered without un-pinning the primary HSM master key.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-[400px] border-2 border-dashed border-brand-border rounded-[2.5rem] flex flex-col items-center justify-center text-brand-muted gap-4 text-center p-8">
              <div className="w-16 h-16 bg-brand-sidebar rounded-full flex items-center justify-center opacity-50 shadow-inner">
                <Activity size={32} />
              </div>
              <div>
                <p className="text-sm font-bold text-brand-muted">Ledger Awaiting Inspector</p>
                <p className="text-[10px] text-brand-muted/60 mt-2 uppercase tracking-widest font-mono">Select a sovereign event to view full cryptographic proof.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const StatusLine = ({ label, status, active, color = 'emerald' }: any) => (
  <div className="flex items-center justify-between text-[10px] font-mono">
    <span className="text-slate-500">{label}</span>
    <span className={`font-bold uppercase ${color === 'red' ? 'text-red-400' :
      active ? 'text-emerald-400' : 'text-slate-600'
      }`}>{status}</span>
  </div>
);

export default DecisionTraceLedger;
