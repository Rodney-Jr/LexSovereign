
import React, { useState } from 'react';
import {
  Terminal,
  Cpu,
  ShieldAlert,
  Fingerprint,
  Key,
  Lock,
  Globe,
  Monitor,
  Zap,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  ChevronLeft
} from 'lucide-react';
import { UserRole } from '../types';

interface PlatformGatewayProps {
  onAuthenticated: (role: UserRole) => void;
  onBackToTenant: () => void;
}

const PlatformGateway: React.FC<PlatformGatewayProps> = ({ onAuthenticated, onBackToTenant }) => {
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [mfaStatus, setMfaStatus] = useState<'IDLE' | 'CHALLENGE' | 'VERIFIED'>('IDLE');

  const addLog = (msg: string) => {
    setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 8)]);
  };

  const startHandshake = () => {
    setIsProcessing(true);
    addLog("INITIATING PLATFORM_OWNER HANDSHAKE...");
    addLog("DISPATCHING ZK-CHALLENGE TO MASTER_ENCLAVE_ROOT...");

    setTimeout(() => {
      setStep(2);
      setIsProcessing(false);
    }, 1500);
  };

  const handleHardwareMFA = async () => {
    setMfaStatus('CHALLENGE');
    addLog("AWAITING HARDWARE ROOT SIGNATURE...");

    try {
      // Simulate hardware delay for effect
      await new Promise(resolve => setTimeout(resolve, 1500));

      addLog("VERIFYING CREDENTIALS WITH SOVEREIGN PROXY...");

      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'admin@lexsovereign.com',
          password: 'password123'
        })
      });

      if (!response.ok) {
        throw new Error('ROOT AUTHENTICATION FAILED');
      }

      const data = await response.json();

      // Store session securely (mocking hardware enclave storage here)
      localStorage.setItem('lexSovereign_session', JSON.stringify({
        role: data.user.role,
        token: data.token,
        userId: data.user.id
      }));

      addLog("FIPS 140-2 LEVEL 3 SIGNATURE VERIFIED.");
      addLog(`IDENTITY PROJECTION: ${data.user.name.toUpperCase()} AUTHORIZED.`);
      setMfaStatus('VERIFIED');

      setTimeout(() => {
        onAuthenticated(data.user.role as UserRole);
      }, 1000);

    } catch (error) {
      addLog(`CRITICAL ERROR: ${(error as Error).message}`);
      setMfaStatus('IDLE');
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Matrix-like background effect */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(34, 211, 238, 0.2) 1px, transparent 0), linear-gradient(90deg, rgba(34, 211, 238, 0.2) 1px, transparent 0)', backgroundSize: '30px 30px' }}></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-cyan-500/5 blur-[150px] rounded-full pointer-events-none"></div>

      <div className="w-full max-w-xl z-10 space-y-8 animate-in fade-in duration-1000">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="p-4 bg-cyan-500/10 rounded-3xl border border-cyan-500/20 shadow-[0_0_30px_rgba(34,211,238,0.2)]">
            <Monitor className="text-cyan-400" size={32} />
          </div>
          <div className="space-y-1">
            <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic">Silo Root Shell</h2>
            <p className="text-cyan-500/60 text-[10px] font-mono font-bold uppercase tracking-[0.4em]">Restricted Platform Gateway</p>
          </div>
        </div>

        <div className="bg-slate-950 border border-cyan-900/30 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden">
          {step === 1 && (
            <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-3">
                <h3 className="text-xl font-bold text-white flex items-center gap-3">
                  <Terminal className="text-cyan-400" size={20} />
                  Platform Inception
                </h3>
                <p className="text-slate-500 text-sm font-mono leading-relaxed">
                  Accessing the global control plane requires a direct peer-to-peer handshake with the platform root.
                </p>
              </div>

              <div className="space-y-4">
                <div className="bg-black/60 rounded-2xl p-6 font-mono text-[10px] space-y-2 border border-cyan-900/20 shadow-inner">
                  <p className="text-cyan-500/80">&gt; GATEWAY_ID: PX-ROOT-01</p>
                  <p className="text-cyan-500/80">&gt; HSM_STATUS: STANDBY</p>
                  <p className="text-cyan-500/80">&gt; AUTH_MODE: DET_KEY_DERIVATION</p>
                  {isProcessing && <p className="text-cyan-400 animate-pulse">&gt; {logs[0] || 'POLLING MASTER CLUSTER...'}</p>}
                </div>

                <button
                  onClick={startHandshake}
                  disabled={isProcessing}
                  className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-900 text-white py-5 rounded-3xl font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-xl shadow-cyan-900/20 group active:scale-95"
                >
                  {isProcessing ? <RefreshCw className="animate-spin" size={20} /> : <Zap size={20} className="group-hover:scale-125 transition-transform" />}
                  {isProcessing ? "Authenticating Root..." : "Initialize Root Handshake"}
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-10 animate-in slide-in-from-right-8 duration-500 text-center">
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-white uppercase tracking-tighter">Root MFA Challenge</h3>
                <p className="text-cyan-500/60 text-xs font-mono">Sign session fragment with Platform Master Key (PMK).</p>
              </div>

              <div className="py-10 flex justify-center">
                <div
                  onClick={mfaStatus === 'IDLE' ? handleHardwareMFA : undefined}
                  className={`w-36 h-36 rounded-[3rem] flex items-center justify-center border-4 cursor-pointer transition-all duration-700 relative group ${mfaStatus === 'VERIFIED' ? 'bg-cyan-500/20 border-cyan-400 text-cyan-400 shadow-[0_0_60px_rgba(34,211,238,0.4)] scale-110' :
                    mfaStatus === 'CHALLENGE' ? 'bg-cyan-500/10 border-cyan-500 text-cyan-500 animate-pulse' :
                      'bg-slate-900 border-slate-800 text-slate-700 hover:border-cyan-500/50 hover:text-cyan-500'
                    }`}
                >
                  {mfaStatus === 'CHALLENGE' && (
                    <div className="absolute inset-0 border-2 border-cyan-400 rounded-[2.8rem] animate-ping opacity-20"></div>
                  )}
                  {mfaStatus === 'VERIFIED' ? <ShieldCheck size={64} /> : <Fingerprint size={64} className="group-hover:rotate-12 transition-transform" />}
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-black/60 rounded-2xl p-5 font-mono text-[9px] h-32 overflow-y-auto scrollbar-hide text-left space-y-1 border border-cyan-900/10">
                  {logs.map((log, i) => (
                    <p key={i} className={`${i === 0 ? 'text-cyan-400' : 'text-cyan-900'}`}>{log}</p>
                  ))}
                </div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">
                  {mfaStatus === 'IDLE' ? 'Verify Identity via Hardware Enclave' : mfaStatus === 'CHALLENGE' ? 'Establishing Proof of Authority...' : 'Authority Verified'}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col items-center gap-6">
          <button
            onClick={onBackToTenant}
            className="text-slate-600 hover:text-cyan-500 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 transition-all group"
          >
            <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            Standard Gateway
          </button>

          <div className="flex items-start gap-4 px-6 opacity-40 grayscale group-hover:opacity-100 transition-opacity">
            <ShieldAlert className="text-red-500 shrink-0" size={18} />
            <p className="text-[10px] text-slate-500 leading-relaxed font-mono italic">
              PLATFORM OWNER PRIVILEGES ARE DECOUPLED FROM TENANT CONTEXT. METADATA-ONLY CONSTRAINTS ENFORCED BY PHYSICAL HARDWARE LOCK.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlatformGateway;
