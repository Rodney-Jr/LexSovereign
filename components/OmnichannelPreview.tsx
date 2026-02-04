
import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  MessageSquare,
  ShieldCheck,
  Key,
  Lock,
  CheckCheck,
  RefreshCw,
  Terminal,
  Link as LinkIcon,
  ShieldAlert,
  Cpu,
  Code,
  Eye,
  EyeOff,
  Filter,
  Zap,
  ArrowRightLeft,
  Server
} from 'lucide-react';
import { LexGeminiService } from '../services/geminiService';

const OmnichannelPreview: React.FC = () => {
  const [authStep, setAuthStep] = useState(0);
  const [isSimulating, setIsSimulating] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'simulator' | 'inspector' | 'sandbox'>('simulator');

  const rawResponse = "The property transfer for Senior Counsel regarding the plot in North Ridge (NR-042) has been approved for $45,000. Expected completion is October 15th.";
  const [sanitizedResponse, setSanitizedResponse] = useState("");
  const [entitiesRemoved, setEntitiesRemoved] = useState(0);

  const gemini = new LexGeminiService();

  const addLog = (msg: string) => {
    setLogs(prev => [...prev.slice(-8), `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const runDiscovery = async () => {
    setIsSimulating(true);
    setAuthStep(0);
    setLogs([]);

    setTimeout(() => {
      addLog("Inbound webhook: WhatsApp -> GH-EGRESS-GATEWAY");
      setAuthStep(1);
    }, 600);

    setTimeout(() => {
      addLog("OIDC Federated Lookup: Resolving Identity Provider");
      addLog("Trust Chain Verified: SOV-ROOT-CA-01 certificate pinned.");
    }, 1400);

    setTimeout(() => {
      addLog("Identity Validated: Partner-ID verified via OIDC Handshake.");
      setAuthStep(2);
    }, 2400);

    try {
      addLog("Sanitization Engine: Initiating PII Redaction scan (Phase 3 Proxy)...");
      const result = await gemini.sanitizeForMobile(rawResponse);
      setSanitizedResponse(result.sanitized);
      setEntitiesRemoved(result.entitiesRemoved);
    } catch (e) {
      addLog("Proxy Warning: Fallingback to strict redaction template.");
      setSanitizedResponse("Matter [ID] update for [NAME] processed.");
    }

    setTimeout(() => {
      addLog("HSM Signing: JWT (RS256) generated in PRIMARY-HSM enclave.");
      addLog("Tunnel Established: End-to-end encrypted session live.");
      setAuthStep(3);
      setIsSimulating(false);
    }, 3800);
  };

  return (
    <div className="space-y-12 animate-in slide-in-from-bottom-8 duration-700 pb-24">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-8">
        <div className="space-y-1">
          <h3 className="text-2xl font-bold flex items-center gap-3 tracking-tight">
            <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
              <MessageSquare className="text-emerald-500" size={24} />
            </div>
            Phase 3: Omnichannel Security Hub
          </h3>
          <p className="text-slate-400 text-sm">Managing the Zero-Knowledge Auth Bridge & Sanitization Proxy for mobile egress.</p>
        </div>
        <div className="flex gap-2">
          <TabBtn label="Simulator" active={viewMode === 'simulator'} icon={<Smartphone size={14} />} onClick={() => setViewMode('simulator')} />
          <TabBtn label="Inspector" active={viewMode === 'inspector'} icon={<Zap size={14} />} onClick={() => setViewMode('inspector')} />
          <TabBtn label="Sandbox" active={viewMode === 'sandbox'} icon={<Filter size={14} />} onClick={() => setViewMode('sandbox')} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Interaction Area */}
        <div className="lg:col-span-4 flex justify-center">
          {viewMode === 'simulator' ? (
            <div className="w-full max-w-[300px] h-[580px] bg-slate-900 rounded-[3rem] border-8 border-slate-800 shadow-2xl relative overflow-hidden flex flex-col scale-100">
              {/* Phone UI Header */}
              <div className="bg-[#075e54] p-4 pt-10 text-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-200/20 flex items-center justify-center border border-white/10">
                    <Smartphone size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-xs">LexSovereign Bot</p>
                    <p className="text-[9px] text-green-200 flex items-center gap-1 opacity-80">
                      <ShieldCheck size={10} /> Verified Node: PRIMARY-SILO-01
                    </p>
                  </div>
                </div>
              </div>

              {/* Chat Bubbles */}
              <div className="flex-1 bg-[#e5ddd5] p-3 space-y-4 overflow-y-auto pattern-dots">
                <div className="bg-white p-3 rounded-2xl text-[11px] max-w-[85%] shadow-sm leading-relaxed text-slate-800">
                  I need a quick update on my property transfer in North Ridge.
                  <span className="block text-right text-[8px] text-slate-400 mt-1 uppercase font-bold tracking-widest">10:45 AM</span>
                </div>

                {authStep < 3 ? (
                  <div className="bg-[#dcf8c6] p-3 rounded-2xl text-[11px] max-w-[85%] self-end ml-auto shadow-sm animate-pulse">
                    {authStep >= 2 ? (
                      <div className="space-y-3">
                        <p className="font-medium">OIDC Verified. Accessing Sovereign Vault...</p>
                        <div className="bg-white/40 p-2.5 rounded-xl border border-green-200/50 flex items-center gap-2 cursor-pointer hover:bg-white/60 transition-all">
                          <LinkIcon size={14} className="text-blue-600" />
                          <span className="text-blue-600 font-bold">Secure Magic Link</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <RefreshCw size={12} className="animate-spin" />
                        Identity Check in progress...
                      </div>
                    )}
                    <span className="block text-right text-[8px] text-slate-400 mt-1 flex items-center gap-1 justify-end">
                      10:46 AM <CheckCheck size={10} className="text-blue-500" />
                    </span>
                  </div>
                ) : (
                  <div className="bg-[#dcf8c6] p-3 rounded-2xl text-[11px] max-w-[85%] self-end ml-auto shadow-sm animate-in fade-in slide-in-from-bottom-4">
                    <span className="font-bold block mb-1.5 text-emerald-800 border-b border-emerald-800/10 pb-1 flex items-center gap-2">
                      <ShieldCheck size={12} /> Sovereign Status Update:
                    </span>
                    {sanitizedResponse || "Status: Matter review complete. Please login on desktop for full details."}
                    <span className="block text-right text-[8px] text-slate-400 mt-1 flex items-center gap-1 justify-end">
                      10:48 AM <CheckCheck size={10} className="text-blue-500" />
                    </span>
                  </div>
                )}
              </div>

              <div className="bg-white p-3 flex gap-2 border-t border-slate-200">
                <div className="flex-1 bg-slate-100 rounded-full px-4 py-2 text-[10px] text-slate-400">Type secure command...</div>
                <div className="w-9 h-9 rounded-full bg-[#128c7e] flex items-center justify-center text-white shadow-lg">
                  <Key size={16} />
                </div>
              </div>
            </div>
          ) : viewMode === 'inspector' ? (
            <div className="w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 h-[580px] space-y-8">
              <div className="text-center space-y-2">
                <h4 className="font-bold text-sm text-white">Trust Chain Verification</h4>
                <p className="text-[10px] text-slate-500 font-mono">ENCLAVE: PRIMARY-HSM-A1</p>
              </div>

              <div className="space-y-12 py-4">
                <HandshakeNode icon={<Server size={18} />} label="Corp IdP" sub="Azure AD Federated" active={authStep >= 1} />
                <div className="flex justify-center -my-8"><div className={`h-8 w-[2px] ${authStep >= 2 ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-800'}`}></div></div>
                <HandshakeNode icon={<Cpu size={18} />} label="LexSovereign" sub="HSM Token Enclave" active={authStep >= 2} />
                <div className="flex justify-center -my-8"><div className={`h-8 w-[2px] ${authStep >= 3 ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-800'}`}></div></div>
                <HandshakeNode icon={<Smartphone size={18} />} label="Mobile Egress" sub="WhatsApp Sanitized" active={authStep >= 3} />
              </div>
            </div>
          ) : (
            <div className="w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 h-[580px] space-y-6">
              <h4 className="font-bold text-xs text-amber-400 uppercase tracking-widest flex items-center gap-2">
                <Filter size={14} /> Sanitization Sandbox
              </h4>
              <p className="text-[10px] text-slate-500 leading-relaxed">
                Paste privileged text here to see how the Phase 3 Proxy 'blind-folds' the mobile network.
              </p>
              <textarea
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-[10px] font-mono text-slate-300 h-32 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
                placeholder="Raw document snippet..."
                defaultValue={rawResponse}
              />
              <div className="flex justify-center">
                <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center">
                  <ArrowRightLeft size={12} className="text-slate-500 rotate-90" />
                </div>
              </div>
              <div className="bg-emerald-500/5 border border-emerald-500/20 p-4 rounded-xl space-y-2">
                <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-tighter">Sanitized Output (Egress-Ready)</p>
                <div className="text-[11px] text-emerald-400/80 italic leading-relaxed">
                  {sanitizedResponse || "Click 'Security Handshake' to process..."}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Technical Logs & Config */}
        <div className="lg:col-span-8 space-y-6">
          {/* Bridge Management Panel */}
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-2xl space-y-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <ShieldCheck size={120} />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Terminal className="text-emerald-400" size={20} />
                <h4 className="font-bold text-sm">Bridge Management Console</h4>
              </div>
              <button
                onClick={runDiscovery}
                disabled={isSimulating}
                className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white px-6 py-2.5 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-xl shadow-emerald-900/20 hover:-translate-y-0.5"
              >
                {isSimulating ? <RefreshCw className="animate-spin" size={18} /> : <Zap size={18} />}
                {isSimulating ? "Initiating Bridge..." : "Run Security Handshake"}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h5 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Live Handshake Trace</h5>
                <div className="bg-slate-950/80 rounded-2xl p-5 font-mono text-[10px] h-48 overflow-y-auto border border-slate-800 scrollbar-hide space-y-2">
                  {logs.length === 0 && <p className="italic text-slate-700">Awaiting trigger signal...</p>}
                  {logs.map((log, i) => (
                    <div key={i} className="flex gap-3 animate-in fade-in slide-in-from-left-2">
                      <span className="text-emerald-500/40 shrink-0">{i + 1}</span>
                      <span className="text-slate-300">{log}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h5 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">JWT Payload (Enclave-Signed)</h5>
                <div className={`bg-slate-950 border transition-all rounded-2xl p-5 font-mono text-[9px] h-48 overflow-y-auto scrollbar-hide ${authStep >= 3 ? 'border-emerald-500/30 text-emerald-400' : 'border-slate-800 text-slate-600'}`}>
                  <pre>
                    {`{
  "header": {
    "alg": "RS256",
    "typ": "JWT",
    "kid": "sov-primary-hsm"
  },
  "payload": {
    "sub": "+2335550000",
    "org": "Strategic Partners Group",
    "matters": ["MAT-ORG-001"],
    "role": "Senior Counsel",
    "access": "RO_META_STATUS",
    "iat": ${Math.floor(Date.now() / 1000)},
    "exp": ${Math.floor(Date.now() / 1000) + 900},
    "jti": "550e8400-e29b-41d4-a716-446655440000"
  },
  "signature": "Sovereign_HSM_Enclave_Signed"
}`}
                  </pre>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <p className="text-xl font-bold text-white tracking-tighter">15m</p>
                  <p className="text-[8px] text-slate-500 uppercase font-bold tracking-widest">Mobile TTL</p>
                </div>
                <div className="w-[1px] h-6 bg-slate-800"></div>
                <div className="text-center">
                  <p className="text-xl font-bold text-emerald-500 tracking-tighter">HSM</p>
                  <p className="text-[8px] text-slate-500 uppercase font-bold tracking-widest">Signing Mode</p>
                </div>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 rounded-full border border-blue-500/20">
                <Lock size={12} className="text-blue-400" />
                <span className="text-[9px] font-bold text-blue-400 uppercase tracking-widest">FIPS 140-2 Level 3 Active</span>
              </div>
            </div>
          </div>

          {/* Policy Guardrails */}
          <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl flex items-start gap-5">
            <div className="p-3 bg-amber-500/10 rounded-2xl border border-amber-500/20 shrink-0">
              <ShieldAlert className="text-amber-500" size={24} />
            </div>
            <div className="space-y-1">
              <h5 className="font-bold text-xs text-amber-400 uppercase tracking-widest">Phase 3 Egress Policy Enforcement</h5>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                The Omnichannel Bot is restricted to <strong className="text-slate-200">Metadata-only</strong> interactions.
                Requesting a full document via WhatsApp will trigger an automated <strong className="text-emerald-500 underline decoration-dotted">OIDC Verification Link</strong> that must be opened on a company-managed device for biometric authentication.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const TabBtn = ({ label, active, icon, onClick }: any) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 border ${active ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'bg-slate-800/50 border-slate-700 text-slate-500 hover:text-slate-300'
      }`}
  >
    {icon}
    {label}
  </button>
);

const HandshakeNode = ({ icon, label, sub, active }: any) => (
  <div className={`flex flex-col items-center transition-all duration-500 ${active ? 'scale-110' : 'opacity-40 grayscale'}`}>
    <div className={`w-14 h-14 rounded-[1.25rem] flex items-center justify-center border-2 transition-all ${active ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.4)]' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>
      {icon}
    </div>
    <div className="text-center mt-3">
      <p className={`text-xs font-bold ${active ? 'text-white' : 'text-slate-600'}`}>{label}</p>
      <p className="text-[9px] text-slate-500 font-mono">{sub}</p>
    </div>
  </div>
);

export default OmnichannelPreview;
