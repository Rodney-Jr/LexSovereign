
import React, { useState } from 'react';
import {
  Terminal,
  ShieldCheck,
  Mail,
  Lock,
  ArrowRight,
  RefreshCw,
  ChevronLeft,
  Eye,
  EyeOff,
  AlertCircle
} from 'lucide-react';
import { UserRole } from '../types';
import { authorizedFetch } from '../utils/api';

interface PlatformGatewayProps {
  onAuthenticated: (session: import('../types').SessionData) => void;
  onBackToTenant: () => void;
}

const PlatformGateway: React.FC<PlatformGatewayProps> = ({ onAuthenticated, onBackToTenant }) => {
  const [email, setEmail] = useState('admin@nomosdesk.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>(["SYSTEM READY", "AWAITING AUTHENTICATION"]);

  const addLog = (msg: string) => {
    setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 5)]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setError(null);
    addLog("INITIATING ROOT AUTHENTICATION...");

    try {
      const data = await authorizedFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });

      if (data.user.role !== 'GLOBAL_ADMIN') {
        throw new Error('UNAUTHORIZED: Insufficient privilege level for Root Shell');
      }

      // Store session securely
      localStorage.setItem('lexSovereign_session', JSON.stringify({
        role: data.user.role,
        token: data.token,
        userId: data.user.id,
        userName: data.user.name,
        permissions: data.user.permissions || []
      }));

      addLog("AUTHORITY VERIFIED. PROJECTING IDENTITY...");

      setTimeout(() => {
        onAuthenticated({
          role: data.user.role,
          token: data.token,
          userId: data.user.id || 'PLATFORM_OWNER',
          userName: data.user.name || 'Platform Owner',
          tenantId: data.user.tenantId || 'GLOBAL',
          permissions: data.user.permissions || []
        });
      }, 1000);

    } catch (err: any) {
      setError(err.message);
      addLog(`CRITICAL ERROR: ${err.message.toUpperCase()}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col items-center justify-center p-6 relative overflow-hidden transition-colors duration-500">
      {/* Matrix-like background effect */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'linear-gradient(var(--brand-secondary) 1px, transparent 0), linear-gradient(90deg, var(--brand-secondary) 1px, transparent 0)', backgroundSize: '30px 30px' }}></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-brand-secondary/5 blur-[150px] rounded-full pointer-events-none"></div>

      <div className="w-full max-w-xl z-10 space-y-8 animate-in fade-in duration-1000">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="p-4 bg-brand-secondary/10 rounded-3xl border border-brand-secondary/20 shadow-[0_0_30px_rgba(var(--brand-secondary),0.2)]">
            <Terminal className="text-brand-secondary" size={32} />
          </div>
          <div className="space-y-1">
            <h2 className="text-3xl font-black text-brand-text tracking-tighter uppercase italic">Silo Root Shell</h2>
            <p className="text-brand-secondary/60 text-[10px] font-mono font-bold uppercase tracking-[0.4em]">Restricted Platform Gateway</p>
          </div>
        </div>

        <div className="bg-brand-sidebar border border-brand-border rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden backdrop-blur-xl">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-3">
              <h3 className="text-xl font-bold text-brand-text flex items-center gap-3">
                <ShieldCheck className="text-brand-secondary" size={20} />
                Root Authority
              </h3>
              <p className="text-brand-muted text-sm font-mono leading-relaxed">
                Access to the global control plane requires validated Root credentials.
              </p>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-center gap-3 text-red-500 text-xs font-mono animate-in shake duration-300">
                <AlertCircle size={18} />
                <p>{error.toUpperCase()}</p>
              </div>
            )}

            <div className="space-y-4">
              <div className="relative group">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-brand-muted group-focus-within:text-brand-secondary transition-colors" size={20} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-brand-bg border border-brand-border rounded-2xl pl-14 pr-6 py-5 text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-secondary/30 transition-all font-mono text-sm"
                  placeholder="ROOT_IDENTITY"
                />
              </div>

              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-brand-muted group-focus-within:text-brand-secondary transition-colors" size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-brand-bg border border-brand-border rounded-2xl pl-14 pr-14 py-5 text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-secondary/30 transition-all font-mono text-sm"
                  placeholder="ROOT_PASSCODE"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-brand-muted hover:text-brand-secondary transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-brand-bg/60 rounded-2xl p-6 font-mono text-[10px] space-y-1 border border-brand-border shadow-inner max-h-32 overflow-y-auto scrollbar-hide">
                {logs.map((log, i) => (
                  <p key={i} className={`${i === 0 ? 'text-brand-secondary' : 'text-brand-muted'}`}>{log}</p>
                ))}
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full bg-brand-secondary/10 hover:bg-brand-secondary/20 border border-brand-secondary/30 text-brand-secondary py-5 rounded-3xl font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all group active:scale-95 disabled:opacity-50"
              >
                {isProcessing ? <RefreshCw className="animate-spin" size={20} /> : <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />}
                {isProcessing ? "Authenticating..." : "Initialize Root Shell"}
              </button>
            </div>
          </form>
        </div>

        <div className="flex flex-col items-center gap-6">
          <button
            onClick={onBackToTenant}
            className="text-brand-muted hover:text-brand-secondary text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 transition-all group"
          >
            <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            Standard Gateway
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlatformGateway;
