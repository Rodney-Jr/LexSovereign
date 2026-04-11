
import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Smartphone, 
  Copy, 
  CheckCircle2, 
  AlertCircle, 
  Download,
  ArrowRight,
  X,
  RefreshCw,
  Key
} from 'lucide-react';
import { authorizedFetch } from '../utils/api';

interface MfaSetupModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const MfaSetupModal: React.FC<MfaSetupModalProps> = ({ onClose, onSuccess }) => {
  const [step, setStep] = useState(1); // 1: QR Scan, 2: Verification, 3: Success/Backup
  const [setupData, setSetupData] = useState<{ secret: string, qrCode: string } | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const initSetup = async () => {
      try {
        const data = await authorizedFetch('/api/auth/mfa/setup');
        setSetupData(data);
      } catch (err: any) {
        setError('Failed to initialize MFA setup.');
      }
    };
    initSetup();
  }, []);

  const handleVerify = async () => {
    if (!setupData || verificationCode.length !== 6) return;
    setIsProcessing(true);
    setError(null);

    try {
      const response = await authorizedFetch('/api/auth/mfa/enable', {
        method: 'POST',
        body: JSON.stringify({
          secret: setupData.secret,
          code: verificationCode
        })
      });

      if (response.success) {
        setBackupCodes(response.backupCodes);
        setStep(3);
      }
    } catch (err: any) {
      setError(err.message || 'Verification failed. Please check the code.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopySecret = () => {
    if (setupData?.secret) {
      navigator.clipboard.writeText(setupData.secret);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const downloadBackupCodes = () => {
    const content = `LexSovereign Backup Codes\nGenerated: ${new Date().toLocaleString()}\n\n${backupCodes.join('\n')}\n\nKeep these codes safe! Each can only be used once.`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'lexsovereign-backup-codes.txt';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-md bg-slate-950/60 transition-all">
      <div className="bg-slate-900 border border-slate-800 rounded-[3rem] w-full max-w-xl shadow-[0_0_100px_rgba(0,0,0,0.8)] relative overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="p-8 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/20 rounded-2xl">
              <ShieldCheck className="text-blue-400" size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight">Security Hardening</h3>
              <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Multi-Factor Authentication</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-500 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-8">
          {step === 1 && setupData && (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="bg-white p-4 rounded-[2rem] shadow-2xl">
                  <img src={setupData.qrCode} alt="MFA QR Code" className="w-40 h-40" />
                </div>
                <div className="flex-1 space-y-4 text-center md:text-left">
                  <div className="space-y-2">
                    <h4 className="text-lg font-bold text-white">Scan with Authenticator</h4>
                    <p className="text-sm text-slate-400 leading-relaxed">
                      Use Google Authenticator, Microsoft Authenticator, or Authy to scan this encrypted vault key.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Can't scan?</p>
                    <div className="flex items-center justify-between gap-3">
                      <code className="text-xs font-mono text-blue-400 break-all">{setupData.secret}</code>
                      <button 
                        onClick={handleCopySecret}
                        className="text-slate-500 hover:text-blue-400 transition-colors"
                        title="Copy Secret"
                      >
                        {copied ? <CheckCircle2 size={16} className="text-emerald-400" /> : <Copy size={16} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button 
                  onClick={() => setStep(2)}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white py-5 rounded-3xl font-bold flex items-center justify-center gap-3 transition-all shadow-xl shadow-blue-900/20 group"
                >
                  I've Scanned the Code
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
              <div className="space-y-4 text-center">
                <div className="mx-auto p-4 bg-blue-500/10 rounded-full w-fit">
                   <Smartphone className="text-blue-400" size={32} />
                </div>
                <div className="space-y-2">
                  <h4 className="text-xl font-bold text-white">Verify Your Device</h4>
                  <p className="text-sm text-slate-400">
                    Enter the 6-digit verification code currently displayed in your app.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <input 
                  type="text"
                  maxLength={6}
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="w-full bg-slate-950 border border-slate-800 rounded-3xl py-6 text-center text-4xl font-bold text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all tracking-[0.5em] placeholder:opacity-20"
                />

                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-center gap-3 text-red-400 animate-shake">
                    <AlertCircle size={20} />
                    <p className="text-sm font-bold">{error}</p>
                  </div>
                )}

                <div className="flex gap-4 pt-4">
                  <button 
                    disabled={isProcessing}
                    onClick={() => setStep(1)}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-5 rounded-3xl font-bold transition-all"
                  >
                    Back
                  </button>
                  <button 
                    disabled={verificationCode.length !== 6 || isProcessing}
                    onClick={handleVerify}
                    className="flex-[2] bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white py-5 rounded-3xl font-bold flex items-center justify-center gap-3 transition-all shadow-xl shadow-emerald-900/20"
                  >
                    {isProcessing ? <RefreshCw className="animate-spin" size={20} /> : <ShieldCheck size={20} />}
                    Complete Activation
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8 animate-in zoom-in-95 duration-500">
              <div className="space-y-4 text-center">
                <div className="mx-auto p-4 bg-emerald-500/10 rounded-full w-fit">
                   <CheckCircle2 className="text-emerald-400" size={32} />
                </div>
                <div className="space-y-2">
                  <h4 className="text-xl font-bold text-white">Security Vault Active</h4>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    MFA has been successfully established for your legal practitioner profile.
                  </p>
                </div>
              </div>

              <div className="space-y-4 bg-slate-950 border border-slate-800 rounded-3xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Emergency Recovery Codes</h5>
                  <button 
                    onClick={downloadBackupCodes}
                    className="text-[10px] font-bold text-emerald-400 hover:underline flex items-center gap-1 uppercase tracking-widest"
                  >
                    <Download size={12} /> Save Codes
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {backupCodes.map((code, idx) => (
                    <div key={idx} className="bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl text-center font-mono text-xs text-slate-400">
                      {code}
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-slate-600 italic mt-4 text-center">
                  ⚠️ Store these securely. These are the ONLY way to recover your account if you lose your device.
                </p>
              </div>

              <div className="pt-4">
                <button 
                  onClick={() => { onSuccess(); onClose(); }}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-5 rounded-3xl font-bold flex items-center justify-center gap-3 transition-all shadow-xl shadow-emerald-900/20"
                >
                  Return to Identity Hub
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MfaSetupModal;
