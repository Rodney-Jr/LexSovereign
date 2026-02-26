
import React, { useState, useEffect } from 'react';
import { ShieldCheck, Smartphone, Copy, Check, RefreshCw, ArrowRight, AlertCircle, ShieldAlert } from 'lucide-react';

interface MfaSetupProps {
    onComplete: () => void;
    onCancel: () => void;
    token: string;
}

const MfaSetup: React.FC<MfaSetupProps> = ({ onComplete, onCancel, token }) => {
    const [step, setStep] = useState<'intro' | 'qr' | 'backup'>('intro');
    const [secret, setSecret] = useState('');
    const [qrCode, setQrCode] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [backupCodes, setBackupCodes] = useState<string[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const startSetup = async () => {
        setIsProcessing(true);
        setError(null);
        try {
            const response = await fetch('/api/auth/mfa/setup', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Failed to initialize MFA');

            setSecret(data.secret);
            setQrCode(data.qrCode);
            setStep('qr');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsProcessing(false);
        }
    };

    const verifyAndEnable = async () => {
        if (verificationCode.length !== 6) return;
        setIsProcessing(true);
        setError(null);
        try {
            const response = await fetch('/api/auth/mfa/enable', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ secret, token: verificationCode })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Verification failed');

            setBackupCodes(data.backupCodes);
            setStep('backup');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsProcessing(false);
        }
    };

    const copyBackupCodes = () => {
        navigator.clipboard.writeText(backupCodes.join('\n'));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-10 max-w-2xl w-full mx-auto shadow-2xl animate-in fade-in zoom-in-95 duration-500">
            {step === 'intro' && (
                <div className="space-y-8 text-center">
                    <div className="w-20 h-20 bg-emerald-500/10 rounded-3xl flex items-center justify-center mx-auto border border-emerald-500/20">
                        <Smartphone className="text-emerald-400" size={40} />
                    </div>
                    <div className="space-y-4">
                        <h3 className="text-3xl font-bold text-white">Sovereign 2FA</h3>
                        <p className="text-slate-400 leading-relaxed">
                            Protect your enclave with hardware-bound Multi-Factor Authentication.
                            Uses standard TOTP protocols (Google Authenticator, Authy, etc).
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                        <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-800">
                            <ShieldCheck className="text-emerald-400 mb-2" size={20} />
                            <h4 className="text-sm font-bold text-slate-200">Hardware Bound</h4>
                            <p className="text-[10px] text-slate-500 mt-1">Secrets stay on your device.</p>
                        </div>
                        <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-800">
                            <RefreshCw className="text-blue-400 mb-2" size={20} />
                            <h4 className="text-sm font-bold text-slate-200">Sovereign Sync</h4>
                            <p className="text-[10px] text-slate-500 mt-1">Cross-regional revocation logic.</p>
                        </div>
                    </div>
                    <div className="pt-6 flex gap-4">
                        <button onClick={onCancel} className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl font-bold transition-all">
                            Cancel
                        </button>
                        <button
                            onClick={startSetup}
                            disabled={isProcessing}
                            className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold shadow-lg shadow-emerald-900/40 transition-all flex items-center justify-center gap-2"
                        >
                            {isProcessing ? <RefreshCw className="animate-spin" size={20} /> : <ArrowRight size={20} />}
                            Begin Setup
                        </button>
                    </div>
                </div>
            )}

            {step === 'qr' && (
                <div className="space-y-8">
                    <div className="text-center">
                        <h3 className="text-2xl font-bold text-white">Scan QR Code</h3>
                        <p className="text-slate-400 text-sm mt-2">Use your authenticator app to scan the code below.</p>
                    </div>

                    <div className="bg-white p-6 rounded-3xl w-fit mx-auto shadow-inner">
                        <img src={qrCode} alt="MFA QR Code" className="w-48 h-48" />
                    </div>

                    <div className="space-y-4">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-2">Verification Code</label>
                        <input
                            type="text"
                            maxLength={6}
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                            placeholder="000000"
                            className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-5 text-2xl font-mono text-center tracking-[0.5em] text-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all"
                        />
                        {error && (
                            <div className="flex items-center gap-2 text-red-500 text-xs pl-2">
                                <AlertCircle size={14} /> <span>{error}</span>
                            </div>
                        )}
                    </div>

                    <div className="pt-2">
                        <button
                            onClick={verifyAndEnable}
                            disabled={isProcessing || verificationCode.length !== 6}
                            className="w-full py-5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white rounded-2xl font-bold shadow-xl shadow-emerald-900/20 transition-all active:scale-95"
                        >
                            {isProcessing ? <RefreshCw className="animate-spin mx-auto" size={24} /> : "Enable Sovereign MFA"}
                        </button>
                    </div>
                </div>
            )}

            {step === 'backup' && (
                <div className="space-y-8">
                    <div className="text-center space-y-4">
                        <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto">
                            <ShieldCheck className="text-emerald-400" size={32} />
                        </div>
                        <h3 className="text-2xl font-bold text-white">MFA Enabled</h3>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            Save these recovery codes in a secure location. If you lose your device, these codes are the ONLY way to regain access to your enclave.
                        </p>
                    </div>

                    <div className="bg-slate-950 border border-slate-800 rounded-[2rem] p-8 relative group">
                        <button
                            onClick={copyBackupCodes}
                            className="absolute top-4 right-4 p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-xl transition-all"
                        >
                            {copied ? <Check size={18} className="text-emerald-400" /> : <Copy size={18} />}
                        </button>
                        <div className="grid grid-cols-2 gap-y-3 gap-x-8 font-mono text-xs text-slate-300">
                            {backupCodes.map((code, idx) => (
                                <div key={idx} className="flex gap-3">
                                    <span className="text-slate-600 w-4">{idx + 1}.</span>
                                    <span className="tracking-widest">{code}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-amber-500/5 border border-amber-500/20 p-4 rounded-2xl flex items-start gap-4">
                        <ShieldAlert className="text-amber-500 shrink-0" size={20} />
                        <p className="text-[10px] text-amber-500/70 leading-relaxed italic">
                            Sovereign Guarantee: Recovery codes are hashed and salted. NomosDesk cannot use them to impersonate you.
                        </p>
                    </div>

                    <button
                        onClick={onComplete}
                        className="w-full py-5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold shadow-xl transition-all"
                    >
                        Return to Enclave
                    </button>
                </div>
            )}
        </div>
    );
};

export default MfaSetup;
