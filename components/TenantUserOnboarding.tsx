
import React, { useState } from 'react';
import {
   Fingerprint,
   ShieldCheck,
   Link as LinkIcon,
   FileSignature,
   CheckCircle2,
   ChevronRight,
   ShieldAlert,
   Building2,
   Lock,
   ArrowRight,
   RefreshCw,
   User
} from 'lucide-react';
import { AppMode, UserRole } from '../types';
import { authorizedFetch } from '../utils/api';

interface TenantUserOnboardingProps {
   mode: AppMode;
   userId: string;
   tenantId: string;
   initialToken?: string;
   onBack?: () => void;
   onComplete: () => void;
}

const TenantUserOnboarding: React.FC<TenantUserOnboardingProps> = ({ mode, userId, tenantId, initialToken, onBack, onComplete }) => {
   const [step, setStep] = useState(1); // 1, 1.5, 3
   const [inviteToken, setInviteToken] = useState(initialToken || '');
   const [isProcessing, setIsProcessing] = useState(false);
   const [affidavitSigned, setAffidavitSigned] = useState(false);

   const [inviteContext, setInviteContext] = useState<{ email: string, roleName: string, tenantName: string, tenantMode: string } | null>(null);
   const [name, setName] = useState('');
   const [password, setPassword] = useState('');
   const [passwordErrors, setPasswordErrors] = useState<string[]>([]);

   const isFirm = mode === AppMode.LAW_FIRM;

   // Password validation
   const validatePassword = (pwd: string): string[] => {
      const errors: string[] = [];
      if (pwd.length < 8) errors.push('Minimum 8 characters');
      if (!/[A-Z]/.test(pwd)) errors.push('At least one uppercase letter');
      if (!/[a-z]/.test(pwd)) errors.push('At least one lowercase letter');
      if (!/[0-9]/.test(pwd)) errors.push('At least one number');
      return errors;
   };

   const handlePasswordChange = (pwd: string) => {
      setPassword(pwd);
      setPasswordErrors(validatePassword(pwd));
   };

   const handleResolveLink = async (tokenOverride?: string) => {
      setIsProcessing(true);
      const tokenToResolve = tokenOverride || inviteToken;
      try {
         const data = await authorizedFetch('/api/auth/resolve-invite', {
            method: 'POST',
            body: JSON.stringify({ token: tokenToResolve })
         });
         setInviteContext(data);
         setStep(1.5);
      } catch (e: any) {
         // Improved error handling with specific messages
         if (e.message.includes('expired')) {
            alert('⏰ This invitation has expired.\n\nPlease contact your administrator for a new invite link.');
         } else if (e.message.includes('Invalid')) {
            alert('❌ Invalid invitation token.\n\nPlease check the token and try again, or contact your administrator.');
         } else {
            alert(e.message);
         }
      } finally {
         setIsProcessing(false);
      }
   };

   // Auto-populate token from URL and auto-resolve
   React.useEffect(() => {
      if (initialToken) {
         setInviteToken(initialToken);
         // If we have an initial token, automatically try to resolve it
         handleResolveLink(initialToken);
      }
   }, [initialToken]);


   const handleFinalJoin = async () => {
      setIsProcessing(true);
      console.log('[Client] Attempting to join silo with token:', inviteToken);
      console.log('[Client] Name:', name, 'Password length:', password?.length);

      try {
         const data = await authorizedFetch('/api/auth/join-silo', {
            method: 'POST',
            body: JSON.stringify({ token: inviteToken, name, password })
         });

         console.log('[Client] Join successful! User ID:', data.user.id);

         localStorage.setItem('lexSovereign_session', JSON.stringify({
            role: data.user.role,
            token: data.token,
            userId: data.user.id,
            userName: data.user.name,
            tenantId: data.user.tenantId,
            permissions: data.user.permissions || []
         }));
         onComplete();
      } catch (e: any) {
         console.error('[Client] Join error:', e);
         alert(e.message);
      } finally {
         setIsProcessing(false);
      }
   };

   return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none"></div>

         <div className="w-full max-w-xl z-10 space-y-8 animate-in fade-in duration-700">
            <div className="text-center space-y-4">
               {/* Dynamic Header Based on Role */}
               <div className="inline-flex items-center gap-3 bg-slate-900 border border-slate-800 px-5 py-2.5 rounded-2xl shadow-2xl">
                  <div className="p-2 bg-emerald-500/20 rounded-xl">
                     <ShieldCheck className="text-emerald-400" size={24} />
                  </div>
                  <span className="font-bold text-2xl tracking-tight text-white">
                     {inviteContext?.roleName === 'CLIENT' ? 'Client Portal Access' : 'Practitioner Onboarding'}
                  </span>
               </div>
               <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.3em]">Sovereign Silo Enrollment: PRIMARY-SILO-01</p>
               {onBack && step === 1 && (
                  <button
                     onClick={onBack}
                     className="text-[10px] font-bold text-blue-400 uppercase tracking-widest hover:underline mt-2"
                  >
                     ← Back to Login
                  </button>
               )}
            </div>

            <div className="bg-slate-900/50 border border-slate-800 rounded-[3.5rem] p-10 shadow-[0_0_80px_rgba(0,0,0,0.5)] backdrop-blur-xl relative overflow-hidden">
               {step === 1 && (
                  <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                     <div className="space-y-2 text-center">
                        <h3 className="text-2xl font-bold text-white flex items-center justify-center gap-3">
                           <LinkIcon className="text-blue-400" size={24} />
                           Sovereign Link
                        </h3>
                        <p className="text-slate-400 text-sm leading-relaxed">
                           Paste your cryptographically-signed invitation link or token provided by your Chambers Administrator.
                        </p>
                        <p className="text-slate-500 text-xs italic">
                           💡 You can paste the full URL or just the token (e.g., SOV-INV-XXXX-XXXX)
                        </p>
                     </div>

                     <div className="space-y-4">
                        <div className="relative group">
                           <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-400 transition-colors" size={20} />
                           <input
                              type="text"
                              value={inviteToken}
                              onChange={e => setInviteToken(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-800 rounded-3xl pl-14 pr-6 py-5 text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all font-mono text-sm"
                              placeholder="SOV-INV-XXX-XXXX"
                           />
                        </div>
                        <button
                           onClick={() => handleResolveLink()}
                           disabled={!inviteToken || isProcessing}
                           className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white py-5 rounded-3xl font-bold flex items-center justify-center gap-3 transition-all shadow-xl shadow-blue-900/20 group"
                        >
                           {isProcessing ? <RefreshCw className="animate-spin" size={20} /> : <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />}
                           Resolve Silo Identity
                        </button>
                     </div>
                  </div>
               )}

               {step === 1.5 && inviteContext && (
                  <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                     <div className="space-y-3 p-6 bg-blue-500/5 border border-blue-500/10 rounded-3xl">
                        <div className="flex items-center gap-4">
                           <div className="p-2 bg-blue-500/20 rounded-xl">
                              <Building2 className="text-blue-400" size={20} />
                           </div>
                           <div>
                              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Target Silo</p>
                              <h4 className="text-lg font-bold text-white tracking-tight">{inviteContext.tenantName}</h4>
                           </div>
                        </div>
                        <div className="flex items-center gap-4 border-t border-slate-800/50 pt-3 mt-3">
                           <div className="flex-1">
                              <p className="text-[9px] font-bold text-slate-600 uppercase">Enrollment Email</p>
                              <p className="text-xs font-mono text-blue-400">{inviteContext.email}</p>
                           </div>
                           <div className="text-right">
                              <p className="text-[9px] font-bold text-slate-600 uppercase">Role</p>
                              <span className="text-[9px] bg-slate-800 px-2 py-0.5 rounded-lg text-slate-400 font-bold uppercase">{inviteContext.roleName.replace('_', ' ')}</span>
                           </div>
                        </div>
                        <button
                           onClick={() => { setStep(1); setInviteContext(null); }}
                           className="text-xs text-slate-500 hover:text-blue-400 font-bold uppercase tracking-widest transition-colors mt-2"
                        >
                           ← Use Different Token
                        </button>
                     </div>

                     <div className="space-y-4">
                        <div className="space-y-2">
                           <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">
                              {inviteContext.roleName === 'CLIENT' ? 'Full Name' : 'Legal Practitioner Name'}
                           </label>
                           <input
                              value={name}
                              onChange={e => setName(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all font-medium"
                              placeholder={inviteContext.roleName === 'CLIENT' ? "e.g. John Doe" : "e.g. Practitioner Name, Esq."}
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Secure Password</label>
                           <input
                              type="password"
                              value={password}
                              onChange={e => handlePasswordChange(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all font-medium"
                              placeholder="••••••••"
                           />
                           {password.length > 0 && passwordErrors.length > 0 && (
                              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 space-y-1">
                                 <p className="text-xs font-bold text-red-400">Password Requirements:</p>
                                 {passwordErrors.map((error, idx) => (
                                    <p key={idx} className="text-xs text-red-300">• {error}</p>
                                 ))}
                              </div>
                           )}
                           {password.length > 0 && passwordErrors.length === 0 && (
                              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-2">
                                 <p className="text-xs font-bold text-emerald-400">✓ Password meets all requirements</p>
                              </div>
                           )}
                        </div>
                        <button
                           onClick={() => setStep(3)}
                           disabled={!name || passwordErrors.length > 0 || password.length === 0}
                           className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed text-white py-5 rounded-3xl font-bold flex items-center justify-center gap-3 transition-all shadow-xl shadow-emerald-900/20"
                        >
                           Confirm Identity & Proceed <ChevronRight size={20} />
                        </button>
                     </div>
                  </div>
               )}


               {step === 3 && (
                  <div className="space-y-8 animate-in zoom-in-95 duration-500">
                     <div className="space-y-2 text-center">
                        <h3 className="text-2xl font-bold text-white flex items-center justify-center gap-3">
                           <ShieldCheck className="text-emerald-400" size={28} />
                           {inviteContext?.roleName === 'CLIENT' ? 'Access Agreement' : 'Professional Standards'}
                        </h3>
                        <p className="text-slate-400 text-sm">
                           {inviteContext?.roleName === 'CLIENT'
                              ? "Review and acknowledge your access rights to the Sovereign Client Portal."
                              : "Review and acknowledge the jurisdictional ethical standards for this silo."
                           }
                        </p>
                     </div>
                     <div className="bg-slate-950 border border-slate-800 rounded-3xl p-8 space-y-6 shadow-inner">
                        <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
                           <p className="text-xs text-slate-300 leading-relaxed italic text-center">
                              {inviteContext?.roleName === 'CLIENT'
                                 ? '"I hereby agree to access this portal solely for the purpose of viewing my legal matters and agree to keep my credentials secure."'
                                 : '"I hereby acknowledge and agree to abide by the jurisdictional professional standards and ethical obligations required for access to this Sovereign Silo."'
                              }
                           </p>
                        </div>

                        <label className="flex items-center gap-4 cursor-pointer group p-4 bg-slate-900 border border-slate-800 rounded-2xl transition-all hover:border-emerald-500/30">
                           <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${affidavitSigned ? 'bg-emerald-500 border-emerald-500 shadow-lg shadow-emerald-500/20' : 'bg-slate-950 border-slate-700 group-hover:border-emerald-500'}`}>
                              {affidavitSigned && <CheckCircle2 size={16} className="text-slate-950" />}
                           </div>
                           <input type="checkbox" className="hidden" checked={affidavitSigned} onChange={() => setAffidavitSigned(!affidavitSigned)} />
                           <div className="flex-1">
                              <p className="text-xs font-bold text-slate-300">
                                 I Agree to the {inviteContext?.roleName === 'CLIENT' ? 'Client Access Terms' : (isFirm ? 'Ethical Use Affidavit' : 'Compliance Standards')}
                              </p>
                              <p className="text-[10px] text-slate-500">Electronically signing version 2.4.1</p>
                           </div>
                        </label>
                     </div>
                     <button
                        onClick={handleFinalJoin}
                        disabled={!affidavitSigned || isProcessing}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white py-5 rounded-3xl font-bold transition-all shadow-xl shadow-emerald-900/20 flex items-center justify-center gap-3"
                     >
                        {isProcessing ? <RefreshCw className="animate-spin" size={20} /> : <ArrowRight size={20} />}
                        Join Sovereign Silo
                     </button>
                  </div>
               )}
            </div>

            <div className="flex items-start gap-4 px-6 opacity-60 group hover:opacity-100 transition-opacity">
               <ShieldCheck className="text-blue-500 shrink-0" size={18} />
               <p className="text-[10px] text-slate-500 leading-relaxed italic font-medium">
                  Identity fragment generated in local enclave.trace: SOV-{Math.random().toString(16).slice(2, 10).toUpperCase()}
               </p>
            </div>
         </div>
      </div>
   );
};

export default TenantUserOnboarding;
