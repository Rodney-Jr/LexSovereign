
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
   AlertCircle,
   Link
} from 'lucide-react';
import { UserRole, SessionData } from '../types';
import { startAuthentication, startRegistration } from '@simplewebauthn/browser';

interface AuthFlowProps {
   onAuthenticated: (session: SessionData) => Promise<void> | void;
   onStartOnboarding: () => void;
   onStartInvitation: () => void;
   onSecretTrigger?: () => void;
}

const AuthFlow: React.FC<AuthFlowProps> = ({ onAuthenticated, onStartOnboarding, onStartInvitation, onSecretTrigger }) => {
   const [isLogin, setIsLogin] = useState(true);
   const [email, setEmail] = useState('');
   const [password, setPassword] = useState('');
   const [name, setName] = useState('');
   const [showPassword, setShowPassword] = useState(false);
   const [isProcessing, setIsProcessing] = useState(false);
   const [error, setError] = useState<string | null>(null);
   const [logoClicks, setLogoClicks] = useState(0);
   const [isForgotPassword, setIsForgotPassword] = useState(false);
   const [forgotPasswordSent, setForgotPasswordSent] = useState(false);
   
   // MFA State
   const [isMfaStep, setIsMfaStep] = useState(false);
   const [mfaToken, setMfaToken] = useState<string | null>(null);
   const [mfaCode, setMfaCode] = useState('');

   const handleLogoClick = () => {
      const nextClicks = logoClicks + 1;
      setLogoClicks(nextClicks);
      if (nextClicks === 5) {
         setLogoClicks(0);
         onSecretTrigger?.();
      }
   };

   const handleForgotPassword = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsProcessing(true);
      setError(null);

      try {
         // Call our native backend instead of the legacy provider
         const response = await fetch('/api/auth/forgot-password', {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({ email })
         });
         
         if (!response.ok) throw new Error('Reset request failed');
         
         setForgotPasswordSent(true);
      } catch (err: any) {
         setError(err.message || 'Failed to send reset email');
      } finally {
         setIsProcessing(false);
      }
   };

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsProcessing(true);
      setError(null);

      try {
         if (isLogin) {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                throw new Error(data.error || 'Authentication failed');
            }

            const data = await response.json();
            
            // Handle MFA Challenge
            if (data.mfaRequired) {
                setMfaToken(data.mfaToken);
                setIsMfaStep(true);
                setIsProcessing(false);
                return;
            }

            // Rehydrate the UI by calling onAuthenticated with the returned session
            if (data.user && data.token) {
                // Synthesize the session object expected by sync
                await onAuthenticated({
                    role: data.user.role,
                    userId: data.user.id,
                    userName: data.user.name,
                    tenantId: data.user.tenantId,
                    permissions: data.user.permissions,
                    token: data.token,
                    mode: data.user.mode
                });
            }
         } else {
             setError('Direct registration is currently disabled. Please use an invitation or Provision New Silo.');
         }
      } catch (err: any) {
         console.error('[AuthFlow] Authorization Error:', err.message);
         setError(err.message || 'Authentication failed');
      } finally {
         setIsProcessing(false);
      }
   };

   const handleMfaSubmit = async (e: React.FormEvent) => {
       e.preventDefault();
       if (!mfaToken || mfaCode.length !== 6) return;
       
       setIsProcessing(true);
       setError(null);
       
       try {
           const response = await fetch('/api/auth/mfa/verify', {
               method: 'POST',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify({ mfaToken, code: mfaCode })
           });
           
           if (!response.ok) {
               const data = await response.json().catch(() => ({}));
               throw new Error(data.error || 'MFA verification failed');
           }
           
           const data = await response.json();
           if (data.user && data.token) {
               await onAuthenticated({
                   role: data.user.role,
                   userId: data.user.id,
                   userName: data.user.name,
                   tenantId: data.user.tenantId,
                   permissions: data.user.permissions,
                   token: data.token,
                   mode: data.user.mode
               });
           }
       } catch (err: any) {
           setError(err.message || 'Verification failed');
       } finally {
           setIsProcessing(false);
       }
   };

   const handleMicrosoftSSO = () => {
      window.location.href = '/api/auth/msal/init';
   };

   const handlePasskeyLogin = async () => {
       if (!email) {
           setError("Please enter your email to use Passkey authentication.");
           return;
       }
       
       setIsProcessing(true);
       setError(null);
       
       try {
           // 1. Get options from server
           const resp = await fetch(`/api/auth/webauthn/login/generate?email=${encodeURIComponent(email)}`);
           if (!resp.ok) {
               const errData = await resp.json().catch(() => ({}));
               throw new Error(errData.error || 'Failed to start Passkey login. Are you registered?');
           }
           
           const options = await resp.json();
           
           // 2. Pass options to browser authenticator via WebAuthn API
           const authResp = await startAuthentication(options);
           
           // 3. Send authenticator response to server
           const verifyResp = await fetch('/api/auth/webauthn/login/verify', {
               method: 'POST',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify({ email, body: authResp })
           });
           
           if (!verifyResp.ok) {
               const errData = await verifyResp.json().catch(() => ({}));
               throw new Error(errData.error || 'Passkey verification failed');
           }
           
           const data = await verifyResp.json();
           
           if (data.user && data.token) {
                await onAuthenticated({
                    role: data.user.role,
                    userId: data.user.id,
                    userName: data.user.name,
                    tenantId: data.user.tenantId,
                    permissions: data.user.permissions,
                    token: data.token,
                    mode: data.user.mode
                });
            }
           
       } catch (err: any) {
           console.error('[WebAuthn] Login Error:', err);
           setError(err.message || 'Passkey authentication failed.');
       } finally {
           setIsProcessing(false);
       }
   };

   return (
      <div className="min-h-screen bg-brand-bg text-brand-text flex flex-col items-center justify-center p-6 relative overflow-hidden theme-midnight">
         {/* Background Ambience */}
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none"></div>
         <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 blur-[100px] rounded-full pointer-events-none"></div>

         <div className="w-full max-w-lg z-10 space-y-8 animate-in fade-in duration-700">
            <div className="text-center space-y-3">
               <div className="inline-flex items-center gap-3 bg-slate-900 border border-slate-800 px-5 py-2.5 rounded-2xl shadow-2xl transition-transform">
                  <div
                     onClick={handleLogoClick}
                     className="p-1.5 bg-emerald-500/20 rounded-lg cursor-pointer active:scale-95"
                  >
                     <ShieldCheck className="text-emerald-400" size={24} />
                  </div>
                  <a href={import.meta.env.VITE_MARKETING_URL || 'https://nomosdesk.com'} className="font-bold text-2xl tracking-tight text-white select-none hover:text-emerald-400 transition-colors">
                     NomosDesk
                  </a>
               </div>
               <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.3em] select-none">Secure Legal Intelligence</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden backdrop-blur-xl">
               {isMfaStep ? (
                  <form onSubmit={handleMfaSubmit} className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                     <div className="space-y-2 text-center">
                        <div className="mx-auto p-3 bg-blue-500/20 rounded-2xl w-fit mb-4">
                           <Smartphone className="text-blue-400" size={28} />
                        </div>
                        <h3 className="text-2xl font-bold text-white tracking-tight">Access Verification</h3>
                        <p className="text-slate-500 text-sm leading-relaxed">
                           Enter the 6-digit security code from your Authenticator app or a backup code.
                        </p>
                     </div>

                     <div className="space-y-6">
                        <div className="relative group">
                           <input
                              type="text"
                              maxLength={6}
                              value={mfaCode}
                              onChange={e => setMfaCode(e.target.value.replace(/\D/g, ''))}
                              className="w-full bg-slate-950 border border-slate-800 rounded-3xl py-6 text-center text-4xl font-bold text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all tracking-[0.5em] placeholder:opacity-10"
                              placeholder="000000"
                              autoFocus
                           />
                        </div>

                        {error && (
                           <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 p-4 rounded-2xl text-red-400 animate-shake">
                              <AlertCircle size={20} className="shrink-0" />
                              <p className="text-xs font-bold leading-none">{error}</p>
                           </div>
                        )}

                        <button
                           disabled={mfaCode.length !== 6 || isProcessing}
                           className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white py-5 rounded-3xl font-bold flex items-center justify-center gap-3 transition-all shadow-xl shadow-blue-900/20 group h-16"
                        >
                           {isProcessing ? <RefreshCw className="animate-spin" size={20} /> : <ShieldCheck size={20} />}
                           Secure Sign-in
                        </button>

                        <button
                           type="button"
                           onClick={() => { setIsMfaStep(false); setMfaToken(null); setError(null); }}
                           className="w-full text-center text-xs font-bold text-slate-500 uppercase tracking-widest hover:text-white transition-colors"
                        >
                           ← Back to Login
                        </button>
                     </div>
                  </form>
               ) : isForgotPassword ? (
                  <form onSubmit={handleForgotPassword} className="space-y-6">
                     <div className="space-y-2">
                        <h3 className="text-2xl font-bold text-white">Reset Access</h3>
                        <p className="text-slate-400 text-sm leading-relaxed">
                           Enter your email to receive a secure recovery link.
                        </p>
                     </div>

                     {error && (
                        <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-center gap-3 text-red-400 text-sm animate-in shake duration-300">
                           <AlertCircle size={18} />
                           <p>{error}</p>
                        </div>
                     )}

                     {forgotPasswordSent ? (
                        <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-2xl space-y-4 text-center">
                           <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto">
                              <ShieldCheck className="text-emerald-400" size={24} />
                           </div>
                           <p className="text-emerald-400 text-sm font-medium">Link Injected Into System Logs.</p>
                           <p className="text-slate-500 text-xs italic leading-relaxed">"If an account exists, a reset authority token has been generated."</p>
                           <button
                              type="button"
                              onClick={() => {
                                 setIsForgotPassword(false);
                                 setForgotPasswordSent(false);
                              }}
                              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all"
                           >
                              Return to Login
                           </button>
                        </div>
                     ) : (
                        <>
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

                           <button
                              type="submit"
                              disabled={isProcessing}
                              className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all shadow-xl shadow-emerald-900/20 group active:scale-95"
                           >
                              {isProcessing ? <RefreshCw className="animate-spin" size={20} /> : <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />}
                              {isProcessing ? "Processing..." : "Request Reset Authority"}
                           </button>

                           <button
                              type="button"
                              onClick={() => setIsForgotPassword(false)}
                              className="w-full text-xs text-slate-500 hover:text-white font-bold uppercase tracking-widest text-center transition-colors"
                           >
                              Back to sign in
                           </button>
                        </>
                     )}
                  </form>
               ) : (
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

                     {isLogin && (
                        <div className="flex justify-end">
                           <button
                              type="button"
                              onClick={() => setIsForgotPassword(true)}
                              className="text-[10px] font-bold text-slate-500 hover:text-emerald-400 uppercase tracking-widest transition-colors"
                           >
                              Forgot Password?
                           </button>
                        </div>
                     )}

                     <button
                        type="submit"
                        disabled={isProcessing}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all shadow-xl shadow-emerald-900/20 group active:scale-95"
                     >
                        {isProcessing ? <RefreshCw className="animate-spin" size={20} /> : <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />}
                        {isProcessing ? "Authenticating..." : isLogin ? "Sign In" : "Register Silo"}
                     </button>


                     {isLogin && (
                        <div className="space-y-4">
                           <div className="flex items-center gap-4 py-2">
                              <div className="h-[1px] bg-slate-800 flex-1"></div>
                              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Or Continue With</span>
                              <div className="h-[1px] bg-slate-800 flex-1"></div>
                           </div>

                           <div className="flex flex-col gap-3">
                               <button
                                  type="button"
                                  onClick={handlePasskeyLogin}
                                  className="w-full bg-slate-800 hover:bg-slate-700 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all border border-slate-700 active:scale-95 shadow-inner"
                               >
                                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                                  Passkey (Windows Hello / biometric)
                               </button>

                               {import.meta.env.VITE_ENABLE_MICROSOFT_AUTH === 'true' && (
                                  <button
                                     type="button"
                                     onClick={handleMicrosoftSSO}
                                     className="w-full bg-slate-800 hover:bg-slate-700 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all border border-slate-700 active:scale-95"
                                  >
                                     <svg className="w-5 h-5" viewBox="0 0 21 21">
                                        <rect x="1" y="1" width="9" height="9" fill="#f25022"/>
                                        <rect x="11" y="1" width="9" height="9" fill="#7fba00"/>
                                        <rect x="1" y="11" width="9" height="9" fill="#00a4ef"/>
                                        <rect x="11" y="11" width="9" height="9" fill="#ffb900"/>
                                     </svg>
                                     Microsoft Work / School
                                  </button>
                               )}
                           </div>
                        </div>
                     )}
                  </form>
               )}

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
                        type="button"
                        onClick={onStartOnboarding}
                        className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-xl text-[10px] font-bold uppercase transition-all flex items-center gap-2"
                     >
                        <Rocket size={14} /> Provision New Silo
                     </button>
                  </div>

                  <div className="flex items-center justify-between">
                     <div className="space-y-1 text-left">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Invited Internally?</p>
                        <p className="text-[10px] text-slate-600">Join an existing Sovereign Silo.</p>
                     </div>
                     <button
                        type="button"
                        onClick={onStartInvitation}
                        className="px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 rounded-xl text-[10px] font-bold uppercase transition-all flex items-center gap-2"
                     >
                        <Link size={14} /> Join with Invite
                     </button>
                  </div>
               </div>
            </div>

            {/* Footer Guarantee */}
            <div className="flex items-start gap-4 px-6 opacity-60 group hover:opacity-100 transition-opacity">
               <ShieldCheck className="text-emerald-500 shrink-0" size={18} />
               <p className="text-[10px] text-slate-500 leading-relaxed italic font-medium">
                  NomosDesk uses <strong className="text-slate-300">Industry Standard Encryption</strong>. Your data remains your own, protected by standard secure protocols.
               </p>
            </div>
         </div>
      </div>
   );
};

export default AuthFlow;
