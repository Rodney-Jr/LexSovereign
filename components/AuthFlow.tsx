
import React, { useState, useEffect } from 'react';
import {
   ShieldCheck,
   Fingerprint,
   Key,
   Globe,
   Cpu,
   Lock,
   RefreshCw,
   Building2,
   ChevronRight,
   ShieldAlert,
   ArrowRight,
   MonitorCheck,
   CheckCircle2,
   Rocket,
   ShieldQuestion,
   Monitor
} from 'lucide-react';
import { UserRole } from '../types';

interface AuthFlowProps {
   onAuthenticated: (role: UserRole) => void;
   onStartOnboarding: () => void;
   onSecretTrigger?: () => void;
}

const AuthFlow: React.FC<AuthFlowProps> = ({ onAuthenticated, onStartOnboarding, onSecretTrigger }) => {
   const [step, setStep] = useState(1);
   const [domain, setDomain] = useState('accrapartners.gh');
   const [isProcessing, setIsProcessing] = useState(false);
   const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.TENANT_ADMIN);
   const [mfaStatus, setMfaStatus] = useState<'IDLE' | 'SCANNING' | 'VERIFIED'>('IDLE');
   const [rememberMe, setRememberMe] = useState(false);
   const [logoClicks, setLogoClicks] = useState(0);

   const handleLogoClick = () => {
      const nextClicks = logoClicks + 1;
      setLogoClicks(nextClicks);
      if (nextClicks === 5) {
         setLogoClicks(0);
         onSecretTrigger?.();
      }
   };

   const handleDiscovery = () => {
      setIsProcessing(true);
      setTimeout(() => {
         setIsProcessing(false);
         setStep(2);
      }, 1500);
   };

   const handleMFA = () => {
      setMfaStatus('SCANNING');
      setTimeout(() => {
         setMfaStatus('VERIFIED');
         setTimeout(() => setStep(3), 800);
      }, 2000);
   };

   const finalizeAuth = () => {
      if (rememberMe) {
         localStorage.setItem('lexSovereign_session', JSON.stringify({
            role: selectedRole,
            domain,
            userId: '11111111-1111-1111-1111-111111111111', // Mock User ID for Proto
            tenantId: '22222222-2222-2222-2222-222222222222' // Mock Tenant ID for Proto
         }));
      }
      onAuthenticated(selectedRole);
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
               <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.3em] select-none">Sovereign Identity Gateway</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden backdrop-blur-xl">
               {/* Step 1: OIDC Discovery */}
               {step === 1 && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                     <div className="space-y-2">
                        <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                           <Globe className="text-blue-400" size={24} />
                           Discovery
                        </h3>
                        <p className="text-slate-400 text-sm leading-relaxed">Enter your organization's legal domain or platform root to resolve the identity silo.</p>
                     </div>

                     <div className="space-y-4">
                        <div className="relative group">
                           <Building2 className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-400 transition-colors" size={20} />
                           <input
                              type="text"
                              value={domain}
                              onChange={e => setDomain(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-14 pr-6 py-5 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all font-medium"
                              placeholder="your-firm.gh or platform-root"
                           />
                        </div>
                        <button
                           onClick={handleDiscovery}
                           disabled={!domain || isProcessing}
                           className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all shadow-xl shadow-blue-900/20 group active:scale-95"
                        >
                           {isProcessing ? <RefreshCw className="animate-spin" size={20} /> : <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />}
                           {isProcessing ? "Resolving OIDC..." : "Locate Tenant Enclave"}
                        </button>
                     </div>

                     <div className="pt-8 border-t border-slate-800">
                        <div className="flex items-center justify-between">
                           <div className="space-y-1">
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

                     <div className="flex items-center justify-center gap-6 opacity-40 grayscale pointer-events-none">
                        <div className="flex items-center gap-2 text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                           <Cpu size={12} /> HSM Ready
                        </div>
                        <div className="w-[1px] h-3 bg-slate-800"></div>
                        <div className="flex items-center gap-2 text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                           <Lock size={12} /> FIPS 140-2
                        </div>
                     </div>
                  </div>
               )}

               {/* Step 2: Hardware MFA Handshake */}
               {step === 2 && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 text-center">
                     <div className="space-y-2">
                        <h3 className="text-2xl font-bold text-white">Sovereign MFA Gate</h3>
                        <p className="text-slate-400 text-sm">Security challenge sent to your pinned hardware enclave.</p>
                     </div>

                     <div className="py-10 flex justify-center">
                        <div
                           onClick={mfaStatus === 'IDLE' ? handleMFA : undefined}
                           className={`w-32 h-32 rounded-[2.5rem] flex items-center justify-center border-4 cursor-pointer transition-all duration-700 relative group ${mfaStatus === 'VERIFIED' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-[0_0_50px_rgba(16,185,129,0.3)] scale-110' :
                                 mfaStatus === 'SCANNING' ? 'bg-blue-500/20 border-blue-500 text-blue-400 animate-pulse' :
                                    'bg-slate-800/50 border-slate-700 text-slate-500 hover:border-emerald-500/50'
                              }`}
                        >
                           {mfaStatus === 'SCANNING' && (
                              <div className="absolute inset-0 border-2 border-blue-400 rounded-[2.3rem] animate-ping opacity-20"></div>
                           )}
                           {mfaStatus === 'VERIFIED' ? <ShieldCheck size={56} /> : <Fingerprint size={56} className="group-hover:scale-110 transition-transform" />}
                        </div>
                     </div>

                     <div className="space-y-4">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">
                           {mfaStatus === 'IDLE' ? 'Touch Sensor to Sign ZK-Proof' : mfaStatus === 'SCANNING' ? 'Validating Enclave Session...' : 'Trust Established'}
                        </p>
                        {mfaStatus === 'IDLE' && (
                           <p className="text-xs text-slate-600 italic">No biometric data is ever stored on LexSovereign servers.</p>
                        )}
                     </div>
                  </div>
               )}

               {/* Step 3: Role Selection */}
               {step === 3 && (
                  <div className="space-y-8 animate-in zoom-in-95 duration-500">
                     <div className="space-y-2">
                        <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                           <MonitorCheck className="text-emerald-400" size={24} />
                           Access Profile
                        </h3>
                        <p className="text-slate-400 text-sm">Select your session context authorized by the sovereign handshake.</p>
                     </div>

                     <div className="grid grid-cols-1 gap-3">
                        {/* Tenant Roles Only - Global Admin Scrubbed */}
                        {[UserRole.TENANT_ADMIN, UserRole.INTERNAL_COUNSEL, UserRole.LEGAL_OPS].map(role => (
                           <button
                              key={role}
                              onClick={() => setSelectedRole(role)}
                              className={`p-5 rounded-2xl border text-left transition-all flex items-center justify-between group ${selectedRole === role
                                    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 shadow-lg shadow-emerald-900/20'
                                    : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-emerald-500/50 hover:text-slate-300'
                                 }`}
                           >
                              <div className="space-y-1">
                                 <p className="text-sm font-bold">{role}</p>
                                 <p className="text-[10px] font-medium uppercase tracking-tighter opacity-60">
                                    {role === UserRole.TENANT_ADMIN ? 'Full Enclave Governance' : role === UserRole.INTERNAL_COUNSEL ? 'Privileged Matter Review' : 'Operational Workflows'}
                                 </p>
                              </div>
                              {selectedRole === role && <CheckCircle2 size={18} />}
                           </button>
                        ))}
                     </div>

                     <div className="flex items-center gap-3 px-2">
                        <label className="flex items-center gap-2 cursor-pointer group">
                           <div className={`w-5 h-5 rounded border transition-all flex items-center justify-center ${rememberMe ? 'bg-blue-600 border-blue-600 shadow-lg shadow-blue-900/20' : 'bg-slate-950 border-slate-800 group-hover:border-slate-700'}`}>
                              {rememberMe && <CheckCircle2 size={14} className="text-white" />}
                           </div>
                           <input
                              type="checkbox"
                              className="hidden"
                              checked={rememberMe}
                              onChange={() => setRememberMe(!rememberMe)}
                           />
                           <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest group-hover:text-slate-300 transition-colors">Remember this device</span>
                        </label>
                     </div>

                     <button
                        onClick={finalizeAuth}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-5 rounded-2xl font-bold transition-all shadow-xl shadow-emerald-900/20 active:scale-95"
                     >
                        Enter Sovereign Workspace
                     </button>
                  </div>
               )}
            </div>

            {/* Footer Guarantee */}
            <div className="flex items-start gap-4 px-6 opacity-60 group hover:opacity-100 transition-opacity">
               <ShieldAlert className="text-amber-500 shrink-0" size={18} />
               <p className="text-[10px] text-slate-500 leading-relaxed italic font-medium">
                  LexSovereign utilizes <strong className="text-slate-300">Deterministic Key Derivation</strong>. Your session is cryptographically anchored to your hardware enclave.
               </p>
            </div>
         </div>
      </div>
   );
};

export default AuthFlow;
