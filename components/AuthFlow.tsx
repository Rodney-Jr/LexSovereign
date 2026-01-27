
import React, { useState } from 'react';
import {
   ShieldCheck,
   Mail,
   Lock,
   ArrowRight,
   RefreshCw,
   Rocket,
   User,
   Eye,
   EyeOff,
   AlertCircle
} from 'lucide-react';
import { UserRole } from '../types';

interface AuthFlowProps {
   onAuthenticated: (role: string, permissions: string[], userId: string, tenantId: string) => void;
   onStartOnboarding: () => void;
   onSecretTrigger?: () => void;
}

const AuthFlow: React.FC<AuthFlowProps> = ({ onAuthenticated, onStartOnboarding, onSecretTrigger }) => {
   const [isLogin, setIsLogin] = useState(true);
   const [email, setEmail] = useState('');
   const [password, setPassword] = useState('');
   const [name, setName] = useState('');
   const [showPassword, setShowPassword] = useState(false);
   const [isProcessing, setIsProcessing] = useState(false);
   const [error, setError] = useState<string | null>(null);
   const [logoClicks, setLogoClicks] = useState(0);

   const handleLogoClick = () => {
      const nextClicks = logoClicks + 1;
      setLogoClicks(nextClicks);
      if (nextClicks === 5) {
         setLogoClicks(0);
         onSecretTrigger?.();
      }
   };

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsProcessing(true);
      setError(null);

      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const payload = isLogin
         ? { email, password }
         : { email, password, name, roleName: UserRole.TENANT_ADMIN };

      try {
         const response = await fetch(`${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
         });

         const data = await response.json();

         if (!response.ok) {
            throw new Error(data.error || 'Authentication failed');
         }

         // Store session
         const sessionData = JSON.stringify({
            role: data.user.role,
            token: data.token,
            userId: data.user.id,
            tenantId: data.user.tenantId,
            permissions: data.user.permissions || []
         });

         localStorage.setItem('lexSovereign_session', sessionData);
         onAuthenticated(data.user.role, data.user.permissions || [], data.user.id, data.user.tenantId);
      } catch (err: unknown) {
         setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
         setIsProcessing(false);
      }
   };

   return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
         {/* Background Ambience */}
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none"></div>
         <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 blur-[100px] rounded-full pointer-events-none"></div>

         <div className="w-full max-w-lg z-10 space-y-8 animate-in fade-in duration-700">
            <div className="text-center space-y-3">
               <div
                  onClick={handleLogoClick}
                  className="inline-flex items-center gap-3 bg-slate-900 border border-slate-800 px-5 py-2.5 rounded-2xl shadow-2xl cursor-pointer active:scale-95 transition-transform"
               >
                  <div className="p-1.5 bg-emerald-500/20 rounded-lg">
                     <ShieldCheck className="text-emerald-400" size={24} />
                  </div>
                  <span className="font-bold text-2xl tracking-tight text-white select-none">LexSovereign</span>
               </div>
               <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.3em] select-none">Secure Legal Intelligence</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden backdrop-blur-xl">
               <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                     <h3 className="text-2xl font-bold text-white">
                        {isLogin ? 'Welcome Back' : 'Create Account'}
                     </h3>
                     <p className="text-slate-400 text-sm leading-relaxed">
                        {isLogin ? 'Access your sovereign workspace.' : 'Join the frontier of sovereign legal technology.'}
                     </p>
                  </div>

                  {error && (
                     <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-center gap-3 text-red-400 text-sm animate-in shake duration-300">
                        <AlertCircle size={18} />
                        <p>{error}</p>
                     </div>
                  )}

                  <div className="space-y-4">
                     {!isLogin && (
                        <div className="relative group">
                           <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-emerald-400 transition-colors" size={20} />
                           <input
                              type="text"
                              required
                              value={name}
                              onChange={e => setName(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-14 pr-6 py-5 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all font-medium"
                              placeholder="Full Name"
                           />
                        </div>
                     )}

                     <div className="relative group">
                        <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-emerald-400 transition-colors" size={20} />
                        <input
                           type="email"
                           required
                           value={email}
                           onChange={e => setEmail(e.target.value)}
                           className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-14 pr-6 py-5 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all font-medium"
                           placeholder="Legal Email Address"
                        />
                     </div>

                     <div className="relative group">
                        <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-emerald-400 transition-colors" size={20} />
                        <input
                           type={showPassword ? 'text' : 'password'}
                           required
                           value={password}
                           onChange={e => setPassword(e.target.value)}
                           className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-14 pr-14 py-5 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all font-medium"
                           placeholder="Secure Password"
                        />
                        <button
                           type="button"
                           onClick={() => setShowPassword(!showPassword)}
                           className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400 transition-colors"
                        >
                           {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                     </div>
                  </div>

                  <button
                     type="submit"
                     disabled={isProcessing}
                     className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all shadow-xl shadow-emerald-900/20 group active:scale-95"
                  >
                     {isProcessing ? <RefreshCw className="animate-spin" size={20} /> : <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />}
                     {isProcessing ? "Authenticating..." : isLogin ? "Sign In" : "Register Silo"}
                  </button>
               </form>

               <div className="mt-8 pt-8 border-t border-slate-800 flex flex-col gap-4">
                  <button
                     onClick={() => setIsLogin(!isLogin)}
                     className="text-xs text-slate-500 hover:text-emerald-400 font-bold uppercase tracking-widest text-center transition-colors"
                  >
                     {isLogin ? "Need a new enclave? Create account" : "Already have access? Sign in instead"}
                  </button>

                  <div className="flex items-center justify-between">
                     <div className="space-y-1 text-left">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">New Organization?</p>
                        <p className="text-[10px] text-slate-600">Start the Sovereign Inception Protocol.</p>
                     </div>
                     <button
                        onClick={onStartOnboarding}
                        className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-xl text-[10px] font-bold uppercase transition-all flex items-center gap-2"
                     >
                        <Rocket size={14} /> Provision New Silo
                     </button>
                  </div>
               </div>
            </div>

            {/* Footer Guarantee */}
            <div className="flex items-start gap-4 px-6 opacity-60 group hover:opacity-100 transition-opacity">
               <ShieldCheck className="text-emerald-500 shrink-0" size={18} />
               <p className="text-[10px] text-slate-500 leading-relaxed italic font-medium">
                  LexSovereign uses <strong className="text-slate-300">Industry Standard Encryption</strong>. Your data remains your own, protected by standard secure protocols.
               </p>
            </div>
         </div>
      </div>
   );
};

export default AuthFlow;
