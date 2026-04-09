import React from 'react';
import { ShieldAlert, CreditCard, ExternalLink, Mail } from 'lucide-react';

interface TrialExpirationModalProps {
    expiresAt?: string;
}

const TrialExpirationModal: React.FC<TrialExpirationModalProps> = ({ expiresAt }) => {
    const formatDate = (dateStr?: string) => {
        if (!dateStr) return 'Recently';
        return new Date(dateStr).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/80 backdrop-blur-xl animate-fade-in">
            <div className="max-w-2xl w-full mx-4 bg-slate-900/60 border border-brand-primary/30 rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-brand-primary/20 relative overflow-hidden">
                {/* Background Glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-brand-primary/20 blur-[100px] pointer-events-none" />

                <div className="relative z-10 text-center">
                    <div className="inline-flex p-5 bg-brand-primary/10 rounded-[2rem] mb-8 border border-brand-primary/20 animate-float">
                        <ShieldAlert className="text-brand-primary w-12 h-12" />
                    </div>

                    <h1 className="text-4xl font-bold text-white mb-4 tracking-tight">Sovereign Trial Matured</h1>
                    <p className="text-slate-400 text-lg mb-8 leading-relaxed max-w-lg mx-auto">
                        Your 30-day sovereign legal enclave expired on <span className="text-brand-primary font-bold">{formatDate(expiresAt)}</span>.
                        To maintain secure access to your matters and document vault, please select a subscription plan.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                        <button
                            onClick={() => window.location.href = '/billing'}
                            className="flex items-center justify-between p-6 bg-brand-primary hover:bg-brand-primary/90 text-white rounded-[1.5rem] transition-all group"
                        >
                            <div className="text-left">
                                <span className="block font-bold text-lg leading-tight text-white">Upgrade Now</span>
                                <span className="text-sm text-brand-sidebar/80">Select your active tier</span>
                            </div>
                            <CreditCard className="group-hover:translate-x-1 transition-transform" />
                        </button>

                        <button
                            onClick={() => window.open('mailto:sales@nomosdesk.com')}
                            className="flex items-center justify-between p-6 bg-slate-800/50 hover:bg-slate-800 text-white rounded-[1.5rem] border border-slate-700 transition-all group"
                        >
                            <div className="text-left">
                                <span className="block font-bold text-lg leading-tight">Contact Sales</span>
                                <span className="text-sm text-slate-400">Custom enterprise needs</span>
                            </div>
                            <ExternalLink className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>

                    <div className="flex items-center justify-center gap-2 text-slate-500 text-sm">
                        <Mail size={16} />
                        <span>Questions? Reach out at </span>
                        <a href="mailto:support@nomosdesk.com" className="text-brand-primary hover:underline">support@nomosdesk.com</a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TrialExpirationModal;
