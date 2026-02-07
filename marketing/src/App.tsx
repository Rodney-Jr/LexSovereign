import React, { useEffect, useState } from 'react';
import {
    Shield,
    Cpu,
    Globe,
    ArrowRight,
    ChevronRight,
    Zap,
    Box,
    Search,
    Lock,
    Sparkles,
    Database,
    Link as LinkIcon
} from 'lucide-react';

const App = () => {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="min-h-screen hero-gradient">
            {/* Navigation */}
            <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'py-4 bg-slate-950/80 backdrop-blur-md border-b border-white/5' : 'py-8'}`}>
                <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-violet-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <Shield className="text-white" size={24} />
                        </div>
                        <span className="text-2xl font-black tracking-tighter text-white font-outfit uppercase">LEX<span className="text-blue-500">SOVEREIGN</span></span>
                    </div>

                    <div className="hidden md:flex items-center gap-8">
                        <a href="#features" className="text-slate-400 hover:text-white transition-colors">Features</a>
                        <a href="#security" className="text-slate-400 hover:text-white transition-colors">Security</a>
                        <a href="#industries" className="text-slate-400 hover:text-white transition-colors">Industries</a>
                        <a href="http://localhost:5173" className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold transition-all flex items-center gap-2">
                            Launch Platform <LinkIcon size={16} />
                        </a>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-40 md:pt-60 overflow-hidden text-white">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-8">
                        <Sparkles size={16} /> Next-Generation Legal Enclave Technology
                    </div>

                    <h1 className="text-6xl md:text-8xl font-black tracking-tight mb-8 leading-tight">
                        The Future of <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-400 to-emerald-400">Sovereign Legal Ops</span>
                    </h1>

                    <p className="max-w-2xl mx-auto text-xl text-slate-400 mb-12 leading-relaxed">
                        LexSovereign is a high-fidelity Sovereign Legal Operating System designed for private regional enclaves. Hard-pin your data to jurisdictional boundaries with physical Root of Trust.
                    </p>

                    <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                        <a href="http://localhost:5173" className="px-10 py-5 bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-xl font-bold text-xl hover:scale-105 transition-all shadow-xl shadow-blue-500/20 flex items-center gap-2">
                            Access the Protocol <ArrowRight />
                        </a>
                        <a href="#features" className="px-8 py-4 text-slate-300 font-semibold hover:text-white transition-colors flex items-center gap-2">
                            Explore Features <ChevronRight size={20} />
                        </a>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section id="features" className="max-w-7xl mx-auto px-6 py-32 text-white">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        {
                            icon: <Box className="text-blue-500" />,
                            title: "Regional Enclaves",
                            desc: "True physical isolation of data and compute within jurisdictional boundaries."
                        },
                        {
                            icon: <Cpu className="text-emerald-500" />,
                            title: "HSM Hardware Root",
                            desc: "Keys never leave the hardware security module. Pure BYOK implementation."
                        },
                        {
                            icon: <Search className="text-violet-500" />,
                            title: "Adversarial Auditing",
                            desc: "Independent secondary AI agents monitor all outputs for UPL and compliance risks."
                        }
                    ].map((feat, i) => (
                        <div key={i} className="p-10 bg-white/5 border border-white/10 rounded-[2.5rem] hover:border-blue-500/30 transition-all group">
                            <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-blue-500/10 transition-colors">
                                {feat.icon}
                            </div>
                            <h3 className="text-2xl font-bold mb-4">{feat.title}</h3>
                            <p className="text-slate-400 leading-relaxed">{feat.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Security Section */}
            <section id="security" className="bg-slate-900/30 py-32 text-white">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                    <div>
                        <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center mb-6">
                            <Lock className="text-emerald-500" />
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold mb-8 leading-tight">Regulatory Rules Engine (RRE)</h2>
                        <p className="text-lg text-slate-400 mb-8 leading-relaxed">
                            LexSovereign's RRE provides real-time monitoring of AI and human outputs against jurisdictional statutes (GDPR, CCPA, Banking Secrecy Act).
                        </p>
                        <ul className="space-y-4">
                            {[
                                "PII Sanitization Proxy (DAS Engine)",
                                "Forensic Decision Trace-Ledger",
                                "Immutable Audit Trails",
                                "Jurisdictional Statutory Sync"
                            ].map((item, i) => (
                                <li key={i} className="flex items-center gap-3 text-slate-200">
                                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                        <ChevronRight size={14} className="text-emerald-500" />
                                    </div>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="relative">
                        <div className="p-8 bg-white/5 border border-white/10 rounded-3xl relative overflow-hidden group">
                            <div className="space-y-4 relative z-10">
                                <div className="h-2 bg-emerald-500/20 rounded-full w-3/4" />
                                <div className="h-2 bg-white/5 rounded-full w-1/2" />
                                <div className="h-32 bg-white/5 rounded-2xl w-full border border-white/5 flex items-center justify-center">
                                    <Database className="text-emerald-500/50" size={40} />
                                </div>
                                <div className="h-2 bg-white/5 rounded-full w-full" />
                                <div className="h-2 bg-white/5 rounded-full w-2/3" />
                            </div>
                            <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-white/5 py-12 text-white">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <div className="flex items-center justify-center gap-2 mb-6">
                        <Shield className="text-blue-500" size={24} />
                        <span className="font-bold tracking-tight text-white font-outfit uppercase">LEXSOVEREIGN</span>
                    </div>
                    <p className="text-slate-500 text-sm mb-8 italic">"The Absolute Standard in Jurisdictional Legal Ops"</p>
                    <div className="text-slate-600 text-xs">
                        © 2026 LexSovereign Systems. All Rights Reserved. Verified Sovereign Instance.
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default App;
