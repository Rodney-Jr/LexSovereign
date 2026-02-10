import React, { useState } from 'react';
import { X, Send, CheckCircle2, Shield, Lock } from 'lucide-react';

interface BookDemoModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const BookDemoModal: React.FC<BookDemoModalProps> = ({ isOpen, onClose }) => {
    const [step, setStep] = useState<'form' | 'success'>('form');
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        company: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const PLATFORM_URL = (import.meta.env.VITE_PLATFORM_URL || 'http://localhost:3000').replace(/\/+$/, '');
            const res = await fetch(`${PLATFORM_URL}/api/leads`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                setStep('success');
            } else {
                alert("Failed to submit. Please try again.");
            }
        } catch (error) {
            console.error(error);
            alert("Connection error.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-md bg-[#0f172a] border border-white/10 rounded-3xl shadow-2xl p-8 overflow-hidden animate-in fade-in zoom-in duration-300">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    title="Close Modal"
                    className="absolute top-4 right-4 p-2 text-slate-500 hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>

                {step === 'form' ? (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="text-center space-y-2">
                            <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
                                <Shield className="text-emerald-400" size={24} />
                            </div>
                            <h3 className="text-2xl font-bold text-white font-outfit">Secure Your Enclave</h3>
                            <p className="text-sm text-slate-400">Request a private demonstration of the LexSovereign operating system.</p>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Full Name</label>
                                <input
                                    required
                                    type="text"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-all placeholder:text-slate-700"
                                    placeholder="e.g. Ama Okafor"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Corporate Email</label>
                                <input
                                    required
                                    type="email"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-all placeholder:text-slate-700"
                                    placeholder="e.g. ama@lawfirm.com"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Firm / Company</label>
                                <input
                                    required
                                    type="text"
                                    value={formData.company}
                                    onChange={e => setFormData({ ...formData, company: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-all placeholder:text-slate-700"
                                    placeholder="e.g. Okafor & Associates"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-sm uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? 'Encrypted Transmission...' : <>Request Access <Send size={16} /></>}
                        </button>

                        <div className="flex items-center justify-center gap-2 text-[10px] text-slate-600 font-bold uppercase tracking-widest">
                            <Lock size={10} /> Zero-Knowledge Transmission
                        </div>
                    </form>
                ) : (
                    <div className="text-center space-y-6 py-8">
                        <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20">
                            <CheckCircle2 className="text-emerald-400" size={32} />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-bold text-white font-outfit">Request Received</h3>
                            <p className="text-sm text-slate-400">Our Sovereign Concierge will encrypt a secure invite and send it to <strong>{formData.email}</strong> shortly.</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="px-8 py-3 bg-slate-800 text-slate-300 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-700 transition-all"
                        >
                            Return to Site
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BookDemoModal;
