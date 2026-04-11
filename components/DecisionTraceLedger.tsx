import React, { useState } from 'react';
import AuditRegistry from './AuditRegistry';
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
  const [isSimplifiedView, setIsSimplifiedView] = useState(false);

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-24">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h3 className="text-3xl font-bold flex items-center gap-4 text-white tracking-tight">
            <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 shadow-lg shadow-emerald-500/5">
              <Activity className="text-emerald-500" size={28} />
            </div>
            Sovereign Decision Trace Ledger
          </h3>
          <p className="text-slate-500 text-sm font-medium">
            Forensic decision hashes anchored to the <span className="text-emerald-400 font-bold">FIPS 140-2</span> Immutable Vault.
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="bg-slate-900 border border-slate-800 p-1.5 rounded-2xl flex gap-1 shadow-inner">
            <button
              onClick={() => setIsSimplifiedView(true)}
              className={`px-6 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${isSimplifiedView ? 'bg-blue-600 text-white shadow-xl shadow-blue-900/40' : 'text-slate-500 hover:text-white'}`}
            >
              Business View
            </button>
            <button
              onClick={() => setIsSimplifiedView(false)}
              className={`px-6 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${!isSimplifiedView ? 'bg-blue-600 text-white shadow-xl shadow-blue-900/40' : 'text-slate-500 hover:text-white'}`}
            >
              Technical Proof
            </button>
          </div>
        </div>
      </div>

      {isSimplifiedView ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-slate-900/50 border border-slate-800 rounded-[3rem] p-12 text-center space-y-6 backdrop-blur-xl">
             <div className="mx-auto w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20">
                <ShieldCheck className="text-emerald-500" size={40} />
             </div>
             <div className="space-y-2">
                <h4 className="text-2xl font-bold text-white">Your Vault is Secure</h4>
                <p className="text-slate-400 max-w-md mx-auto leading-relaxed">
                  All legal operations in this silo are cryptographically sealed. No unauthorized access or tampering has been detected in the last 24 hours.
                </p>
             </div>
             <div className="pt-4">
                <button 
                  onClick={() => setIsSimplifiedView(false)}
                  className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl transition-all border border-slate-700 hover:border-blue-500/50"
                >
                  View Forensic Technical Trace
                </button>
             </div>
          </div>
          
          <div className="space-y-6">
             <div className="bg-slate-900/50 border border-slate-800 rounded-[2.5rem] p-8 space-y-4 backdrop-blur-xl">
                <h5 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Sovereign Pulse</h5>
                <div className="flex items-center justify-between">
                   <span className="text-sm text-white font-medium">Blockchain Anchor</span>
                   <span className="text-xs font-mono text-emerald-400 font-bold">ACTIVE</span>
                </div>
                <div className="flex items-center justify-between">
                   <span className="text-sm text-white font-medium">Tamper Discovery</span>
                   <span className="text-xs font-mono text-emerald-400 font-bold">READY</span>
                </div>
             </div>
             
             <div className="bg-blue-600 rounded-[2.5rem] p-8 text-white space-y-4 shadow-2xl shadow-blue-900/20 relative overflow-hidden group">
                <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
                    <Scale size={120} />
                </div>
                <h5 className="text-xs font-bold uppercase tracking-widest opacity-70">Legal Assurance</h5>
                <p className="text-lg font-bold leading-tight">100% Data Sovereignty Verified</p>
                <div className="pt-2">
                   <div className="bg-white/20 h-1.5 w-full rounded-full overflow-hidden">
                      <div className="bg-white h-full w-[99%] rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]"></div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      ) : (
        <AuditRegistry />
      )}
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
