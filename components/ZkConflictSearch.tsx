
import React, { useState } from 'react';
import {
  Search,
  Hash,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Fingerprint,
  Lock,
  ArrowRight,
  Database,
  Shield
} from 'lucide-react';

const ZkConflictSearch: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState<'IDLE' | 'CLEAN' | 'COLLISION' | 'SCANNING'>('IDLE');
  const [scanProgress, setScanProgress] = useState(0);

  const performZkSearch = () => {
    setIsSearching(true);
    setResult('SCANNING');
    setScanProgress(0);

    // Simulate ZK-Proof Hashing & Search
    const interval = setInterval(() => {
      setScanProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          setIsSearching(false);
          setResult(searchTerm.toLowerCase().includes('accra') ? 'COLLISION' : 'CLEAN');
          return 100;
        }
        return p + 5;
      });
    }, 100);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in duration-700 pb-24">
      <div className="space-y-1">
        <h3 className="text-3xl font-bold flex items-center gap-4 text-white tracking-tight">
          <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20 relative">
            <Search className="text-blue-400" size={28} />
            <div className="absolute -top-1 -right-1 bg-blue-500 rounded-full p-1 border-2 border-slate-950">
              <Shield size={10} className="text-white" />
            </div>
          </div>
          Zero-Knowledge Conflict Search
        </h3>
        <p className="text-slate-400 text-sm">Verify party conflicts across the Sovereign Vault using cryptographic hashing (Local-First).</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Hash size={120} />
        </div>

        <div className="space-y-8 relative z-10">
          <div className="space-y-4">
            <div className="relative group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400" size={20} />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && performZkSearch()}
                className="w-full bg-slate-950 border border-slate-800 rounded-3xl pl-16 pr-6 py-6 text-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all placeholder:text-slate-800"
                placeholder="Enter party name for collision check..."
              />
            </div>

            <div className="flex items-center justify-between px-4">
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                <Fingerprint size={12} className="text-blue-500" />
                Input is hashed locally via SHA-256
              </div>
              <button
                onClick={performZkSearch}
                disabled={!searchTerm || isSearching}
                className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white px-8 py-3 rounded-2xl font-bold text-sm transition-all shadow-xl shadow-blue-900/20 active:scale-95"
              >
                {isSearching ? <RefreshCw className="animate-spin" size={18} /> : "Initiate ZK-Scan"}
              </button>
            </div>
          </div>

          {result === 'SCANNING' && (
            <div className="space-y-4 animate-in fade-in duration-500">
              <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                <span>Scanning Encrypted Index...</span>
                <span className="text-blue-400 font-mono">{scanProgress}%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${scanProgress}%` }}></div>
              </div>
            </div>
          )}

          {result === 'CLEAN' && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 p-8 rounded-[2rem] flex items-center gap-6 animate-in zoom-in-95">
              <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <CheckCircle2 size={32} className="text-slate-950" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xl font-bold text-white">Negative Conflict Result</h4>
                <p className="text-xs text-emerald-400 font-medium">No collisions found in the GH-ACC-1 or Global Silo Indices.</p>
                <p className="text-[10px] text-slate-500 font-mono uppercase mt-2">HASH_SIG: {Math.random().toString(16).slice(2, 20)}</p>
              </div>
            </div>
          )}

          {result === 'COLLISION' && (
            <div className="bg-red-500/10 border border-red-500/20 p-8 rounded-[2rem] flex items-center gap-6 animate-in zoom-in-95">
              <div className="w-16 h-16 bg-red-500 rounded-2xl flex items-center justify-center shadow-lg shadow-red-500/20 animate-pulse">
                <AlertTriangle size={32} className="text-slate-950" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xl font-bold text-white">Potential Conflict Identified</h4>
                <p className="text-xs text-red-400 font-medium">A collision was detected in Matter MT-772 (Ghana Partners). Escalate to GC immediately.</p>
                <button
                  onClick={() => {
                    console.log("Partner clearance requested for conflict.");
                    // In a real app, this would create an audit log and notify a partner
                    alert("Clearance request transmitted to Partner Enclave.");
                  }}
                  className="mt-4 px-4 py-2 bg-red-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-red-500 transition-all active:scale-95"
                >
                  Request Partner Clearance
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-4">
          <div className="flex items-center gap-3">
            <Lock className="text-purple-400" size={20} />
            <h5 className="font-bold text-sm text-white">Blind Discovery</h5>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed italic">
            "The search string never hits the database. Only the local hash is compared against the pre-calculated vault index, mathematically preventing internal leakage."
          </p>
        </div>
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-4">
          <div className="flex items-center gap-3">
            <Database className="text-blue-400" size={20} />
            <h5 className="font-bold text-sm text-white">Federated Index</h5>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed italic">
            "Conflict checks aggregate results from both Law Firm and Enterprise Department silos if cross-tenancy tunnels are active."
          </p>
        </div>
      </div>
    </div>
  );
};

export default ZkConflictSearch;
