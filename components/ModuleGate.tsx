
import React from 'react';
import { Lock, Zap, ArrowRight, ShieldCheck } from 'lucide-react';
import { usePermissions } from '../hooks/usePermissions';

interface ModuleGateProps {
    module: string;
    children: React.ReactNode;
    featureName?: string;
    description?: string;
    variant?: 'tab' | 'card' | 'full';
}

const ModuleGate: React.FC<ModuleGateProps> = ({
    module,
    children,
    featureName = "Premium Module",
    description = "Unlock this advanced module to expand your firm's operational capabilities.",
    variant = 'full'
}) => {
    const { hasModule } = usePermissions();
    const isLocked = !hasModule(module);

    if (!isLocked) {
        return <>{children}</>;
    }

    if (variant === 'tab') {
        return (
            <div className="flex flex-col items-center justify-center p-20 text-center animate-in fade-in zoom-in-95 duration-500">
                <div className="w-20 h-20 bg-amber-500/10 border border-amber-500/20 rounded-3xl flex items-center justify-center mb-6 relative">
                    <Lock className="text-amber-500" size={32} />
                    <div className="absolute -top-2 -right-2 bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter">Enterprise</div>
                </div>
                <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tighter italic">Enterprise Expansion Required</h3>
                <p className="text-sm text-slate-500 max-w-sm mb-8">{description}</p>
                <button className="flex items-center gap-3 px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-blue-900/40 active:scale-95 group">
                    Start 14-Day Free Trial <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <p className="mt-4 text-[10px] text-slate-600 font-bold uppercase tracking-widest">Pricing starts at $19/mo per firm</p>
            </div>
        );
    }

    if (variant === 'card') {
        return (
            <div className="relative group overflow-hidden rounded-[2rem] border border-slate-800 bg-slate-900/50 p-6 opacity-60 grayscale hover:grayscale-0 transition-all cursor-not-allowed">
                <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px] z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-amber-500 text-slate-950 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                        <Zap size={12} fill="currentColor" /> Upgrade to Unlock
                    </div>
                </div>
                <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-slate-800 rounded-2xl text-slate-500">
                        <Lock size={20} />
                    </div>
                    <div>
                        <h4 className="font-bold text-white text-sm">{featureName}</h4>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest">Enterprise Feature</p>
                    </div>
                </div>
                {children}
            </div>
        );
    }

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-10 text-center relative overflow-hidden group">
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-600/5 blur-[100px] rounded-full group-hover:bg-blue-600/10 transition-colors" />
            <div className="relative z-10 flex flex-col items-center">
                <div className="mb-6 p-5 bg-slate-950 border border-slate-800 rounded-[2rem] text-amber-500 shadow-inner">
                    <ShieldCheck size={40} />
                </div>
                <h2 className="text-3xl font-black text-white italic tracking-tighter mb-4 uppercase">Upgrade Your Sovereignty</h2>
                <p className="text-slate-400 text-sm max-w-lg mb-10 leading-relaxed">
                    The <strong>{featureName}</strong> is part of the LexSovereign Enterprise suite.
                    {description}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-md">
                    <button className="flex items-center justify-center gap-3 px-6 py-4 bg-white text-slate-950 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-200 transition-all shadow-2xl">
                        Contact Sales
                    </button>
                    <button className="flex items-center justify-center gap-3 px-6 py-4 bg-slate-800 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-700 transition-all border border-slate-700">
                        View Pricing
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ModuleGate;
