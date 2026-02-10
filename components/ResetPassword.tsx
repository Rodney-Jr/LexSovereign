
import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, RefreshCw, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
import { authorizedFetch } from '../utils/api';

interface ResetPasswordProps {
    token: string;
    onComplete: () => void;
    onBack: () => void;
}

const ResetPassword: React.FC<ResetPasswordProps> = ({ token, onComplete, onBack }) => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isVerifying, setIsVerifying] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [email, setEmail] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const verifyToken = async () => {
            try {
                const data = await authorizedFetch('/api/auth/verify-reset-token', {
                    method: 'POST',
                    body: JSON.stringify({ token })
                });
                if (data.error) throw new Error(data.error);
                setEmail(data.email);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setIsVerifying(false);
            }
        };
        verifyToken();
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        if (password.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const data = await authorizedFetch('/api/auth/reset-password', {
                method: 'POST',
                body: JSON.stringify({ token, password })
            });
            if (data.error) throw new Error(data.error);
            setSuccess(true);
            setTimeout(onComplete, 2000);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isVerifying) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white">
                <RefreshCw className="animate-spin text-emerald-400 mb-4" size={32} />
                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Verifying Reset Authority...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none"></div>

            <div className="w-full max-w-lg z-10 space-y-8 animate-in fade-in duration-700">
                <div className="text-center space-y-3">
                    <div className="inline-flex items-center gap-3 bg-slate-900 border border-slate-800 px-5 py-2.5 rounded-2xl shadow-2xl">
                        <div className="p-1.5 bg-emerald-500/20 rounded-lg">
                            <ShieldCheck className="text-emerald-400" size={24} />
                        </div>
                        <span className="font-bold text-2xl tracking-tight text-white">LexSovereign</span>
                    </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden backdrop-blur-xl">
                    {success ? (
                        <div className="text-center space-y-6 py-4">
                            <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30">
                                <CheckCircle2 className="text-emerald-400" size={40} />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-2xl font-bold text-white">Password Secured</h3>
                                <p className="text-slate-400 text-sm">Your new password has been applied. Redirecting to login...</p>
                            </div>
                        </div>
                    ) : error && !email ? (
                        <div className="text-center space-y-6 py-4">
                            <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto border border-red-500/30">
                                <AlertCircle className="text-red-400" size={40} />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-2xl font-bold text-white">Invalid Token</h3>
                                <p className="text-slate-400 text-sm">{error}</p>
                            </div>
                            <button
                                onClick={onBack}
                                className="w-full bg-slate-800 hover:bg-slate-700 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all"
                            >
                                <ArrowLeft size={18} /> Return to Login
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <h3 className="text-2xl font-bold text-white">Set New Password</h3>
                                <p className="text-slate-400 text-sm">Resetting access for <span className="text-emerald-400 font-bold">{email}</span></p>
                            </div>

                            {error && (
                                <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-center gap-3 text-red-400 text-sm animate-in shake duration-300">
                                    <AlertCircle size={18} />
                                    <p>{error}</p>
                                </div>
                            )}

                            <div className="space-y-4">
                                <div className="relative group">
                                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-emerald-400 transition-colors" size={20} />
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-14 pr-6 py-5 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all font-medium"
                                        placeholder="New Secure Password"
                                    />
                                </div>

                                <div className="relative group">
                                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-emerald-400 transition-colors" size={20} />
                                    <input
                                        type="password"
                                        required
                                        value={confirmPassword}
                                        onChange={e => setConfirmPassword(e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-14 pr-6 py-5 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all font-medium"
                                        placeholder="Confirm Password"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all shadow-xl shadow-emerald-900/20 group active:scale-95"
                            >
                                {isSubmitting ? <RefreshCw className="animate-spin" size={20} /> : <Lock size={20} />}
                                {isSubmitting ? "Updating..." : "Secure New Password"}
                            </button>

                            <button
                                type="button"
                                onClick={onBack}
                                className="w-full text-xs text-slate-500 hover:text-white font-bold uppercase tracking-widest transition-colors pt-2"
                            >
                                Cancel and return to login
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
