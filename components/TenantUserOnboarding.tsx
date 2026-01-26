
import React, { useState } from 'react';
import {
   Fingerprint,
   ShieldCheck,
   Link as LinkIcon,
   FileSignature,
   CheckCircle2,
   ChevronRight,
   ShieldAlert,
   Cpu,
   Scale,
   Briefcase,
   Globe,
   Building2,
   Lock,
   ArrowRight
} from 'lucide-react';
import { AppMode, UserRole } from '../types';

interface TenantUserOnboardingProps {
   mode: AppMode;
   userId: string;
   tenantId: string;
   onComplete: (role: UserRole, token?: string) => void;
}

const TenantUserOnboarding: React.FC<TenantUserOnboardingProps> = ({ mode, userId, tenantId, onComplete }) => {
   const [step, setStep] = useState(1);
   const [inviteToken, setInviteToken] = useState('');
   const [isProcessing, setIsProcessing] = useState(false);
   const [mfaEnrolled, setMfaEnrolled] = useState(false);
   const [affidavitSigned, setAffidavitSigned] = useState(false);

   const [inviteContext, setInviteContext] = useState<{ email: string, roleName: string, tenantName: string, tenantMode: string } | null>(null);
   const [name, setName] = useState('');
   const [password, setPassword] = useState('');

   const isFirm = mode === AppMode.LAW_FIRM;
   const targetRole = isFirm ? UserRole.EXTERNAL_COUNSEL : UserRole.LEGAL_OPS;

   const handleResolveLink = async () => {
      setIsProcessing(true);
      try {
         const res = await fetch('/api/auth/resolve-invite', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: inviteToken })
         });
         if (!res.ok) throw new Error('Invitation not found');
         const data = await res.json();
         setInviteContext(data);
         setStep(1.5); // New Identity Claim step
      } catch (e: any) {
         alert(e.message);
      } finally {
         setIsProcessing(false);
      }
   };

   const handleEnrollHardware = () => {
      setIsProcessing(true);
      setTimeout(() => {
         setIsProcessing(false);
         setMfaEnrolled(true);
         setTimeout(() => setStep(3), 800);
      }, 2000);
   };

   return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
         {/* Dynamic Background */}
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none"></div>

         <div className="w-full max-w-xl z-10 space-y-8 animate-in fade-in duration-700">
            <div className="text-center space-y-4">
               <div className="inline-flex items-center gap-3 bg-slate-900 border border-slate-800 px-5 py-2.5 rounded-2xl shadow-2xl">
                  <div className="p-2 bg-emerald-500/20 rounded-xl">
                     <ShieldCheck className="text-emerald-400" size={24} />
                  </div>
                  <span className="font-bold text-2xl tracking-tight text-white">Practitioner Onboarding</span>
               </div>
               <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.3em]">Sovereign Silo Enrollment: GH-ACC-1</p>
            </div>

            <div className="bg-slate-900/50 border border-slate-800 rounded-[3.5rem] p-10 shadow-[0_0_80px_rgba(0,0,0,0.5)] backdrop-blur-xl relative overflow-hidden">
               {/* Step 1: Sovereign Link Resolution */}
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
                           onClick={handleResolveLink}
                           disabled={!inviteToken || isProcessing}
                           className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white py-5 rounded-3xl font-bold flex items-center justify-center gap-3 transition-all shadow-xl shadow-blue-900/20 group"
                        >
                           {isProcessing ? <RefreshCwIcon className="animate-spin" /> : <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />}
                           Resolve Silo Identity
                        </button>
                     </div>
                  </div>
               )}

               {/* Step 1.5: Claim Identity */}
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
                              <span className="text-[9px] bg-slate-800 px-2 py-0.5 rounded-lg text-slate-400 font-bold uppercase">{inviteContext.roleName}</span>
                           </div>
                        </div>
                     </div>

                     <div className="space-y-4">
                        <div className="space-y-2">
                           <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Legal Practitioner Name</label>
                           <input
                              value={name}
                              onChange={e => setName(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500 transistion-all"
                              placeholder="e.g. John Doe, Esq."
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Secure Password</label>
                           <input
                              type="password"
                              value={password}
                              onChange={e => setPassword(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500 transistion-all"
                              placeholder="••••••••"
                           />
                        </div>
                        <button
                           onClick={() => setStep(2)}
                           disabled={!name || password.length < 6}
                           className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-5 rounded-3xl font-bold flex items-center justify-center gap-3 transition-all shadow-xl shadow-emerald-900/20"
                        >
                           Confirm Identity & Bind <ChevronRight size={20} />
                        </button>
                     </div>
               )}

                     {/* Step 2: ZK-Proof Hardware Enrollment */}
                     {step === 2 && (
                        <div className="space-y-8 animate-in slide-in-from-right-8 duration-500 text-center">
                           <div className="space-y-2">
                              <h3 className="text-2xl font-bold text-white">Hardware Key Binding</h3>
                              <p className="text-slate-400 text-sm">Binding your local device enclave to the Sovereign Silo HSM.</p>
                           </div>

                           <div className="py-10 flex justify-center">
                              <div
                                 onClick={!isProcessing ? handleEnrollHardware : undefined}
                                 className={`w-32 h-32 rounded-[2.5rem] flex items-center justify-center border-4 cursor-pointer transition-all duration-700 relative group ${mfaEnrolled ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-[0_0_50px_rgba(16,185,129,0.3)]' :
                                    isProcessing ? 'bg-blue-500/20 border-blue-500 text-blue-400 animate-pulse' :
                                       'bg-slate-800/50 border-slate-700 text-slate-500 hover:border-emerald-500/50'
                                    }`}
                              >
                                 {isProcessing && (
                                    <div className="absolute inset-0 border-2 border-blue-400 rounded-[2.3rem] animate-ping opacity-20"></div>
                                 )}
                                 {mfaEnrolled ? <ShieldCheck size={56} /> : <Fingerprint size={56} className="group-hover:scale-110 transition-transform" />}
                              </div>
                           </div>

                           <div className="space-y-4">
                              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">
                                 {mfaEnrolled ? 'Identity Fragment Generated' : isProcessing ? 'Generating Zero-Knowledge Proof...' : 'Touch Sensor to Enroll Hardware'}
                              </p>
                              <div className="flex items-center justify-center gap-6 opacity-40">
                                 <div className="flex items-center gap-2 text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                                    <Cpu size={12} /> TEE Active
                                 </div>
                                 <div className="w-[1px] h-3 bg-slate-800"></div>
                                 <div className="flex items-center gap-2 text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                                    <Globe size={12} /> Regional Lock
                                 </div>
                              </div>
                           </div>
                        </div>
                     )}

                     {/* Step 3: Role-Specific Affidavit */}
                     {step === 3 && (
                        <div className="space-y-8 animate-in zoom-in-95 duration-500">
                           <div className="space-y-2">
                              <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                                 <FileSignature className="text-emerald-400" size={24} />
                                 Practitioner Oath
                              </h3>
                              <p className="text-slate-400 text-sm">Finalize your enrollment with a jurisdictional ethical oath.</p>
                           </div>

                           <div className="bg-slate-950 border border-slate-800 rounded-3xl p-8 space-y-6 shadow-inner">
                              <div className="space-y-4">
                                 <div className="flex items-center justify-between">
                                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                                       {isFirm ? 'GBA Ethical Use Affidavit' : 'Corporate Compliance Briefing'}
                                    </h4>
                                    <span className="text-[10px] font-mono text-emerald-500">VERSION 2.4</span>
                                 </div>
                                 <div className="max-h-40 overflow-y-auto pr-4 scrollbar-hide text-xs text-slate-400 leading-relaxed font-serif italic border-l-2 border-slate-800 pl-6">
                                    {isFirm
                                       ? "I, the undersigned legal practitioner, hereby acknowledge that my access to LexSovereign is governed by the Ghana Bar Association (GBA) Code of Ethics. I verify that I will not use AI-generated outputs as definitive legal advice without independent verification. I understand that the 'Blind-fold' DAS proxy is active for all my sessions to ensure PII containment..."
                                       : "I acknowledge that I am entering a sovereign data enclave managed by the Legal Department. I agree to adhere to the Bank of Ghana (BoG) AML/KYC guidelines and maintain regional data pinning for all sensitive artifacts. I confirm that all AI-assisted drafting will be reviewed for compliance with Outside Counsel Guidelines (OCG)..."}
                                 </div>
                              </div>

                              <label className="flex items-center gap-4 cursor-pointer group p-4 bg-slate-900 border border-slate-800 rounded-2xl transition-all hover:border-emerald-500/30">
                                 <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${affidavitSigned ? 'bg-emerald-500 border-emerald-500 shadow-lg shadow-emerald-500/20' : 'bg-slate-950 border-slate-700 group-hover:border-emerald-500'}`}>
                                    {affidavitSigned && <CheckCircle2 size={16} className="text-slate-950" />}
                                 </div>
                                 <input
                                    type="checkbox"
                                    className="hidden"
                                    checked={affidavitSigned}
                                    onChange={() => setAffidavitSigned(!affidavitSigned)}
                                 />
                                 <span className="text-xs font-bold text-slate-300">I electronically sign this {isFirm ? 'Affidavit' : 'Briefing'}.</span>
                              </label>
                           </div>

                           <button
                              onClick={async () => {
                                 setIsProcessing(true);
                                 try {
                                    const res = await fetch('/api/auth/join-silo', {
                                       method: 'POST',
                                       headers: { 'Content-Type': 'application/json' },
                                       body: JSON.stringify({ token: inviteToken, name, password })
                                    });
                                    if (!res.ok) throw new Error('Join failed');
                                    const data = await res.json();
                                    // Store session
                                    localStorage.setItem('lexSovereign_session', JSON.stringify({
                                       role: data.user.role,
                                       token: data.token,
                                       userId: data.user.id,
                                       tenantId: data.user.tenantId,
                                       permissions: data.user.permissions || []
                                    }));
                                    onComplete(data.user.role, data.token);
                                 } catch (e: any) {
                                    alert(e.message);
                                 } finally {
                                    setIsProcessing(false);
                                 }
                              }}
                              disabled={!affidavitSigned || isProcessing}
                              className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white py-5 rounded-3xl font-bold transition-all shadow-xl shadow-emerald-900/20 flex items-center justify-center gap-3"
                           >
                              {isProcessing ? <RefreshCwIcon className="animate-spin" /> : <ArrowRight size={20} />}
                              Join Sovereign Silo
                           </button>
                        </div>
                     )}
                  </div>

            {/* Security Notice */}
               <div className="flex items-start gap-4 px-6 opacity-60 group hover:opacity-100 transition-opacity">
                  <ShieldCheck className="text-blue-500 shrink-0" size={18} />
                  <p className="text-[10px] text-slate-500 leading-relaxed italic font-medium">
                     Identity fragment generated in local enclave. Your hardware fingerprint is hashed and salted with the <strong className="text-slate-300">Silo Master Key</strong>. Enrollment trace: SOV-{Math.random().toString(16).slice(2, 10).toUpperCase()}
                  </p>
               </div>
            </div>
         </div>
         );
};

         const RefreshCwIcon = ({className}: any) => (
         <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20" height="20" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round"
            className={className}
         >
            <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
            <path d="M21 3v5h-5" />
         </svg>
         );

         export default TenantUserOnboarding;
