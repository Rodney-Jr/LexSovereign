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
    Link as LinkIcon,
    Sparkles,
    Database
} from 'lucide-react';
import MarketingChatbot from './MarketingChatbot';

const PLATFORM_URL = import.meta.env.VITE_PLATFORM_URL || 'http://localhost:3000';

const App = () => {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="min-h-screen hero-gradient font-inter selection:bg-blue-500/30">
            {/* Navigation */}
            <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'py-4 bg-slate-950/90 backdrop-blur-xl border-b border-white/5' : 'py-8'}`}>
                <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <Shield className="text-white" size={24} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xl font-black tracking-tighter text-white font-outfit uppercase leading-none">LEX<span className="text-blue-500">SOVEREIGN</span></span>
                            <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-1">By Nexus Technologies Limited</span>
                        </div>
                    </div>

                    <div className="hidden md:flex items-center gap-8">
                        <a href="#enclaves" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Regional Enclaves</a>
                        <a href="#compliance" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Compliance (NDPR/POPIA)</a>
                        <a href={PLATFORM_URL} className="px-5 py-2.5 bg-white text-slate-950 hover:bg-slate-200 rounded-lg font-bold text-sm transition-all flex items-center gap-2">
                            Access Protocol <LinkIcon size={14} />
                        </a>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-48 md:pt-64 pb-32 overflow-hidden text-white">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest mb-10 animate-fade-in">
                        <Sparkles size={14} /> Powering West, East, and Southern African Legal Enclaves
                    </div>

                    <h1 className="text-6xl md:text-[7rem] font-black tracking-tighter mb-10 leading-[0.9] font-outfit">
                        Sovereign <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-emerald-400 to-white">Legal Ops Frontier.</span>
                    </h1>

                    <p className="max-w-3xl mx-auto text-lg md:text-xl text-slate-400 mb-14 leading-relaxed font-medium">
                        LexSovereign is the high-fidelity Legal Operating System designed for elite firms in <span className="text-white">Ghana, Nigeria, Kenya, and South Africa</span>. Physical data residency, jurisdictional pinning, and hardware root of trust.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                        <a href={PLATFORM_URL} className="w-full sm:w-auto px-12 py-5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-2xl font-bold text-xl hover:shadow-[0_0_40px_rgba(59,130,246,0.4)] transition-all flex items-center justify-center gap-3 active:scale-95">
                            Launch Enclave <ArrowRight size={24} />
                        </a>
                        <div className="text-slate-500 text-sm font-mono flex items-center gap-2">
                            <Cpu size={16} /> SYSTEM STATUS: OPERATIONAL
                        </div>
                    </div>
                </div>
            </section>

            {/* Regional Network Showcase */}
            <section id="enclaves" className="max-w-7xl mx-auto px-6 py-24">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div className="space-y-8">
                        <h2 className="text-4xl md:text-5xl font-black text-white leading-tight font-outfit">The African <br />Sovereign Network</h2>
                        <p className="text-lg text-slate-400 leading-relaxed">
                            Unlike traditional SaaS, LexSovereign enclaves are physically resident within your jurisdiction. We operate high-security nodes in the continent's major legal hubs.
                        </p>
                        <div className="grid grid-cols-2 gap-6">
                            {[
                                { city: "Accra", country: "Ghana", status: "Active" },
                                { city: "Lagos", country: "Nigeria", status: "Active" },
                                { city: "Nairobi", country: "Kenya", status: "Active" },
                                { city: "Johannesburg", country: "South Africa", status: "Active" }
                            ].map((node, i) => (
                                <div key={i} className="p-6 bg-slate-900/50 border border-white/5 rounded-2xl group hover:border-blue-500/30 transition-all">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">{node.status}</span>
                                    </div>
                                    <h4 className="text-lg font-bold text-white">{node.city}</h4>
                                    <p className="text-xs text-slate-500">{node.country}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="relative">
                        <div className="absolute inset-0 bg-blue-500/20 blur-[100px] rounded-full" />
                        <div className="relative bg-slate-900 border border-white/10 rounded-[3rem] p-10 shadow-2xl overflow-hidden">
                            <div className="space-y-6">
                                <div className="flex items-center gap-4 text-white/50 text-sm font-mono">
                                    <Globe size={20} className="text-blue-500" /> JURISDICTIONAL_SYNC_V4.0
                                </div>
                                <div className="h-40 bg-slate-950 rounded-2xl border border-white/5 flex items-center justify-center p-8">
                                    <div className="text-center">
                                        <div className="text-blue-500 font-bold mb-2">BYOK_VAULT_ENCRYPTED</div>
                                        <div className="text-[10px] text-slate-700 font-mono break-all">f7e8a9d0c1b2a3f4e5d6c7b8a9f0e1d2c3b4a5f6e7d8c9b0</div>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="h-1 bg-blue-500/30 rounded-full w-full" />
                                    <div className="h-1 bg-blue-500/30 rounded-full w-2/3" />
                                    <div className="h-1 bg-blue-500/30 rounded-full w-1/2" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Compliance Matrix */}
            <section id="compliance" className="bg-slate-900/30 py-32 border-y border-white/5">
                <div className="max-w-7xl mx-auto px-6 text-center mb-16">
                    <h2 className="text-4xl font-bold text-white mb-6 font-outfit">Hard-Pinnned Compliance</h2>
                    <p className="text-slate-400 max-w-2xl mx-auto">LexSovereign's Regulatory Rules Engine is pre-configured for African data protection frameworks.</p>
                </div>
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {[
                        { title: "Nigeria NDPR", desc: "Automated sanitization for Nigerian data subjects.", law: "Reg 1.1 - 4.1" },
                        { title: "S.A. POPIA", desc: "Full adherence to South African processing restrictions.", law: "Sections 1-115" },
                        { title: "Kenya DPA", desc: "Cross-border transfer safeguards for Nairobi firms.", law: "Act No. 24" },
                        { title: "Ghana DPA", desc: "Compliant storage for Ghanaian legal practitioners.", law: "Act 843" }
                    ].map((item, i) => (
                        <div key={i} className="p-8 bg-slate-900 border border-white/5 rounded-3xl hover:bg-slate-800/50 transition-all">
                            <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center mb-6">
                                <Lock size={20} className="text-emerald-500" />
                            </div>
                            <h3 className="text-lg font-bold text-white mb-3">{item.title}</h3>
                            <p className="text-sm text-slate-400 mb-6 leading-relaxed">{item.desc}</p>
                            <div className="text-[10px] font-mono text-slate-600 bg-slate-950 px-3 py-1.5 rounded-md inline-block">
                                REF: {item.law}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Governance Section */}
            <section className="max-w-7xl mx-auto px-6 py-24">
                <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/10 border border-white/10 rounded-[3rem] p-12 md:p-20 relative overflow-hidden">
                    <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div className="space-y-6">
                            <h2 className="text-4xl font-bold text-white font-outfit">System Governance</h2>
                            <p className="text-slate-300 text-lg leading-relaxed">
                                LexSovereign is a proprietary platform developed and operated by <strong className="text-white">Nexus Technologies Limited</strong>. We provide the infrastructure and security oversight that powers the next generation of African legal intelligence.
                            </p>
                            <div className="flex items-center gap-6">
                                <div className="text-center">
                                    <div className="text-3xl font-black text-white">99.9%</div>
                                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Enclave Uptime</div>
                                </div>
                                <div className="w-[1px] h-10 bg-white/10" />
                                <div className="text-center">
                                    <div className="text-3xl font-black text-white">AES-256</div>
                                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">In-Transit Encryption</div>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-center">
                            <div className="w-64 h-64 bg-white/5 rounded-full border border-white/10 flex items-center justify-center p-12 relative animate-pulse">
                                <Shield className="text-blue-500/50" size={120} />
                                <div className="absolute inset-0 bg-blue-500/5 blur-[40px] rounded-full" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-white/5 py-20 text-white">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-16">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Shield className="text-blue-500" size={24} />
                                <span className="text-xl font-bold tracking-tight text-white font-outfit uppercase">LEXSOVEREIGN</span>
                            </div>
                            <p className="text-slate-500 text-sm max-w-xs leading-relaxed">
                                The high-fidelity choice for sovereign legal operations in Africa. Owned and operated by Nexus Technologies Limited.
                            </p>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-12">
                            <div>
                                <h5 className="font-bold text-xs uppercase tracking-[0.2em] text-slate-400 mb-6">Hubs</h5>
                                <ul className="space-y-3 text-sm text-slate-500 font-medium">
                                    <li>Lagos (NG)</li>
                                    <li>Nairobi (KE)</li>
                                    <li>Accra (GH)</li>
                                    <li>Jo'burg (ZA)</li>
                                </ul>
                            </div>
                            <div>
                                <h5 className="font-bold text-xs uppercase tracking-[0.2em] text-slate-400 mb-6">Security</h5>
                                <ul className="space-y-3 text-sm text-slate-500 font-medium">
                                    <li>ByoK Vault</li>
                                    <li>RRE Audit</li>
                                    <li>Enclave Isolation</li>
                                </ul>
                            </div>
                            <div>
                                <h5 className="font-bold text-xs uppercase tracking-[0.2em] text-slate-400 mb-6">Platform</h5>
                                <ul className="space-y-3 text-sm text-slate-500 font-medium">
                                    <li><a href={PLATFORM_URL} className="hover:text-blue-500 transition-colors">Access Portal</a></li>
                                    <li>Documentation</li>
                                    <li>Support</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="text-slate-600 text-[10px] font-bold uppercase tracking-[0.2em]">
                            © 2026 Nexus Technologies Limited. All Rights Reserved. LEXSOVEREIGN®
                        </div>
                        <div className="flex items-center gap-8 text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                            <span>Privacy Protocol</span>
                            <span>Jurisdictional Terms</span>
                        </div>
                    </div>
                </div>
            </footer>

            <MarketingChatbot />
        </div>
    );
};

export default App;

