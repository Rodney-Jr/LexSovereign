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
    Database,
    CheckCircle
} from 'lucide-react';
import MarketingChatbot from './MarketingChatbot';

const PLATFORM_URL = import.meta.env.VITE_PLATFORM_URL || 'http://localhost:3000';

const App = () => {
    const [scrolled, setScrolled] = useState(false);
    const [activeModal, setActiveModal] = useState<string | null>(null);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const modalContent: Record<string, { title: string, content: React.ReactNode }> = {
        'logical-enclave': {
            title: 'Logical Enclave Deep-Dive',
            content: (
                <div className="space-y-6 text-slate-300">
                    <p>Unlike traditional cloud storage where data from multiple users sits in a shared database table, a <strong>Logical Enclave</strong> uses software-defined isolation to ensure your data is cryptographically siloed.</p>
                    <div className="bg-slate-900 p-6 rounded-2xl border border-white/5 font-mono text-xs space-y-2">
                        <div className="text-emerald-400">// ENCLAVE_SEC_PROTOCOL_V4</div>
                        <div>SET_ISOLATION_LEVEL: ABSOLUTE</div>
                        <div>MOUNT_POINT: /silo/tenant_id</div>
                        <div>ENCRYPTION: AES-256-GCM / BYOK</div>
                    </div>
                    <ul className="space-y-3">
                        <li className="flex items-start gap-3">
                            <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                            <span><strong>Zero-Knowledge:</strong> LexSovereign administrators cannot access your enclave files without your explicit key-pinning handshake.</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                            <span><strong>Regional Pinning:</strong> Your enclave logic is hard-coded to ignore any request originating from outside authorized regional gateways.</span>
                        </li>
                    </ul>
                </div>
            )
        },
        'jurisdictional-logic': {
            title: 'Jurisdictional Logic Deep-Dive',
            content: (
                <div className="space-y-6 text-slate-300">
                    <p>We solve the "Hallucination Problem" for African lawyers by pinning our AI models to jurisdictional truth rather than global probability.</p>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-slate-900 rounded-xl border border-white/5">
                            <div className="text-blue-400 font-bold text-xs mb-1 uppercase tracking-widest">Authority Pinning</div>
                            <p className="text-[10px] text-slate-500">Only statutes from authorized regional gazettes are used for drafting.</p>
                        </div>
                        <div className="p-4 bg-slate-900 rounded-xl border border-white/5">
                            <div className="text-emerald-400 font-bold text-xs mb-1 uppercase tracking-widest">Logic Filtering</div>
                            <p className="text-[10px] text-slate-500">AI output is scrubbed against regional GDPR equivalents (NDPR/POPIA) before rendering.</p>
                        </div>
                    </div>
                    <p className="text-sm italic text-slate-500 leading-relaxed">
                        "If you are drafting a contract in Lagos, your AI should not be suggesting clauses based on Delaware corporate law. LexSovereign ensures the logic remains local."
                    </p>
                </div>
            )
        }
    };

    const Modal = ({ id }: { id: string }) => {
        const item = modalContent[id];
        if (!item) return null;

        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
                <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => setActiveModal(null)} />
                <div className="relative w-full max-w-2xl bg-slate-900 border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                    <div className="p-8 border-b border-white/5 flex items-center justify-between">
                        <h3 className="text-2xl font-bold text-white font-outfit">{item.title}</h3>
                        <button
                            onClick={() => setActiveModal(null)}
                            title="Close Modal"
                            className="p-2 hover:bg-white/5 rounded-full text-slate-500 hover:text-white transition-colors"
                        >
                            <Shield className="rotate-45" size={20} />
                        </button>
                    </div>
                    <div className="p-8 max-h-[70vh] overflow-y-auto">
                        {item.content}
                    </div>
                    <div className="p-8 bg-slate-950/50 border-t border-white/5 flex justify-end">
                        <button
                            onClick={() => setActiveModal(null)}
                            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm transition-all"
                        >
                            Understood
                        </button>
                    </div>
                </div>
            </div>
        );
    };

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
                        The Sovereign Enclave <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-emerald-400 to-white">for African Legal Excellence.</span>
                    </h1>

                    <p className="max-w-3xl mx-auto text-lg md:text-xl text-slate-400 mb-14 leading-relaxed font-medium">
                        Stop sacrificing data integrity for AI speed. LexSovereign is the high-fidelity operating system for elite firms in <span className="text-white">Ghana, Nigeria, Kenya, and South Africa</span>. Built for logical enclaves, jurisdictional pinning, and cryptographic data sanctity.
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
                        <h2 className="text-4xl md:text-5xl font-black text-white leading-tight font-outfit">The African <br />Compliance Network</h2>
                        <p className="text-lg text-slate-400 leading-relaxed">
                            Unlike traditional SaaS, LexSovereign enclaves are logically isolated. We provide jurisdictional protection across the continent's major legal hubs through advanced encryption and software pinning.
                        </p>
                        <div className="grid grid-cols-2 gap-6">
                            {[
                                { title: "Accra", country: "Ghana", status: "Verified" },
                                { title: "Lagos", country: "Nigeria", status: "Verified" },
                                { title: "Nairobi", country: "Kenya", status: "Verified" },
                                { title: "Johannesburg", country: "South Africa", status: "Verified" }
                            ].map((node, i) => (
                                <div
                                    key={i}
                                    onClick={() => setActiveModal('logical-enclave')}
                                    className="p-6 bg-slate-900/50 border border-white/5 rounded-2xl group hover:border-blue-500/30 transition-all cursor-pointer text-left"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                                        <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Protocol {node.status}</span>
                                    </div>
                                    <h4 className="text-lg font-bold text-white">{node.title}</h4>
                                    <p className="text-xs text-slate-500">{node.country} Jurisdiction</p>
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

            {/* Value Pillars Section */}
            <section className="max-w-7xl mx-auto px-6 py-24 border-y border-white/5 bg-slate-900/10">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold text-white mb-4 font-outfit italic tracking-tight">The LexSovereign Pillars</h2>
                    <p className="text-slate-500 font-medium">Elite legal technology, hard-pinned to your borders.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {[
                        { title: "Sovereignty", desc: "Your data is cryptographically isolated and controlled by your keys (BYOK).", icon: <Shield size={24} />, modal: 'logical-enclave' },
                        { title: "Velocity", desc: "Drafts that took 3 hours now take 3 minutes with AI Auto-Hydrate.", icon: <Zap size={24} /> },
                        { title: "Certainty", desc: "Rule-based AI that refuses to quote foreign laws or hallucinate advice.", icon: <CheckCircle size={24} /> },
                        { title: "Sanctity", desc: "Client privacy protected by zero-knowledge architecture and key-level security.", icon: <Lock size={24} />, modal: 'logical-enclave' }
                    ].map((pillar, i) => (
                        <div
                            key={i}
                            onClick={() => pillar.modal && setActiveModal(pillar.modal)}
                            className={`text-center p-8 rounded-3xl bg-slate-950/50 border border-white/5 hover:border-blue-500/20 transition-all group ${pillar.modal ? 'cursor-pointer' : ''}`}
                        >
                            <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-blue-400 group-hover:scale-110 transition-transform">
                                {pillar.icon}
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3 font-outfit uppercase tracking-wider">{pillar.title}</h3>
                            <p className="text-sm text-slate-500 leading-relaxed font-medium">{pillar.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Targeted Solutions */}
            <section className="max-w-7xl mx-auto px-6 py-32">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <div className="p-12 rounded-[3rem] bg-gradient-to-br from-blue-900/20 to-blue-950/10 border border-blue-500/10">
                        <h3 className="text-3xl font-bold text-white mb-6 font-outfit">Private Law Firms</h3>
                        <p className="text-slate-300 mb-8 leading-relaxed">Optimize your Senior expertise and Junior speed. Move from "Blank Page" to "Review Ready" in 90 seconds while fulfilling your ethical duties.</p>
                        <ul className="space-y-4 mb-8">
                            {[
                                "90-Second First Drafts",
                                "Zero-Knowledge Conflict Checks",
                                "Institutional Knowledge Vault"
                            ].map((item, i) => (
                                <li key={i} className="flex items-center gap-3 text-slate-400 text-sm font-bold uppercase tracking-widest">
                                    <Sparkles size={16} className="text-blue-500" /> {item}
                                </li>
                            ))}
                        </ul>
                        <a href={PLATFORM_URL} className="text-blue-400 font-bold flex items-center gap-2 hover:gap-4 transition-all">Enable Your Practice <ArrowRight size={16} /></a>
                    </div>
                    <div className="p-12 rounded-[3rem] bg-gradient-to-br from-emerald-900/20 to-emerald-950/10 border border-emerald-500/10">
                        <h3 className="text-3xl font-bold text-white mb-6 font-outfit">Corporate Legal</h3>
                        <p className="text-slate-300 mb-8 leading-relaxed">The guardian of your company’s risk. LexSovereign acts as your 24/7 compliance officer, hard-pinned to regional data protection laws.</p>
                        <ul className="space-y-4 mb-8">
                            {[
                                "Live Compliance Scrutiny",
                                "POPIA / NDPR / DPA Sentinel",
                                "External Counsel Oversight"
                            ].map((item, i) => (
                                <li key={i} className="flex items-center gap-3 text-slate-400 text-sm font-bold uppercase tracking-widest">
                                    <Lock size={16} className="text-emerald-500" /> {item}
                                </li>
                            ))}
                        </ul>
                        <a href={PLATFORM_URL} className="text-emerald-400 font-bold flex items-center gap-2 hover:gap-4 transition-all">Secure Your Department <ArrowRight size={16} /></a>
                    </div>
                </div>
            </section>

            {/* Compliance Matrix */}
            <section id="compliance" className="bg-slate-900/30 py-32 border-y border-white/5">
                <div className="max-w-7xl mx-auto px-6 text-center mb-16">
                    <h2 className="text-4xl font-bold text-white mb-6 font-outfit">Hard-Pinnned Compliance</h2>
                    <p className="text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed">
                        LexSovereign's Regulatory Rules Engine is pre-configured for African data protection frameworks. We don't just follow policies—we build them into the logic of your software enclave.
                    </p>
                </div>
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {[
                        { title: "Nigeria NDPR", desc: "Automated sanitization for Nigerian data subjects.", law: "Reg 1.1 - 4.1" },
                        { title: "S.A. POPIA", desc: "Full adherence to South African processing restrictions.", law: "Sections 1-115" },
                        { title: "Kenya DPA", desc: "Cross-border transfer safeguards for Nairobi firms.", law: "Act No. 24" },
                        { title: "Ghana DPA", desc: "Compliant storage for Ghanaian legal practitioners.", law: "Act 843" }
                    ].map((item, i) => (
                        <div
                            key={i}
                            onClick={() => setActiveModal('jurisdictional-logic')}
                            className="p-8 bg-slate-900 border border-white/5 rounded-3xl hover:bg-slate-800/50 transition-all cursor-pointer group text-left"
                        >
                            <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center mb-6 group-hover:bg-emerald-500/20 transition-colors">
                                <Lock size={20} className="text-emerald-500" />
                            </div>
                            <h3 className="text-lg font-bold text-white mb-3 font-outfit">{item.title}</h3>
                            <p className="text-sm text-slate-400 mb-6 leading-relaxed font-medium">{item.desc}</p>
                            <div className="text-[10px] font-mono text-slate-600 bg-slate-950 px-3 py-1.5 rounded-md inline-block font-bold">
                                JURISDICTIONAL REF: {item.law}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Sovereign Intelligence Layer */}
            <section className="py-32 bg-slate-950 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-20">
                        <h2 className="text-5xl font-black text-white mb-6 font-outfit uppercase tracking-tighter">The Intelligence Tier</h2>
                        <p className="text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed">
                            LexSovereign doesn't just store documents. It transforms your collective experience into an active, searchable brain.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {[
                            {
                                title: "Sovereign Vault",
                                subtitle: "Internal Institutional Intelligence",
                                desc: "Every case, trial, and contract your firm has ever handled—indexed and ready. Use Zero-Knowledge search to find previous solutions without sensitive data ever leaving your enclave.",
                                icon: <Database size={32} className="text-blue-500" />,
                                benefit: "ジュニア speed with Senior expertise."
                            },
                            {
                                title: "Jurisdictional Archives",
                                subtitle: "Official Legal Knowledge Base",
                                desc: "A cryptographically locked repository of local statutes, gazettes, and case law. Hard-pinned to your region (Ghana, Nigeria, SA) so your AI never quotes foreign law.",
                                icon: <Box size={32} className="text-emerald-500" />,
                                benefit: "Always grounded in local law."
                            },
                            {
                                title: "Global Research Stream",
                                subtitle: "Privacy-Scrubbed Discovery",
                                desc: "Need to verify a cross-border precedent? Toggle Global Search to query legal markets via a privacy proxy. High-fidelity results with full Sovereign Citations.",
                                icon: <Globe size={32} className="text-purple-500" />,
                                benefit: "82% reduction in manual verification."
                            }
                        ].map((layer, i) => (
                            <div key={i} className="group relative">
                                <div className="absolute inset-0 bg-white/5 blur-xl group-hover:bg-blue-500/5 transition-all rounded-[3rem]" />
                                <div className="relative p-10 bg-slate-900/40 border border-white/5 rounded-[3rem] h-full flex flex-col hover:border-blue-500/30 transition-all">
                                    <div className="mb-8">{layer.icon}</div>
                                    <h3 className="text-2xl font-bold text-white mb-2 font-outfit">{layer.title}</h3>
                                    <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mb-6">{layer.subtitle}</p>
                                    <p className="text-slate-400 text-sm leading-relaxed mb-10 flex-1">{layer.desc}</p>
                                    <div className="pt-6 border-t border-white/5">
                                        <div className="text-xs font-bold text-slate-200 flex items-center gap-2 italic">
                                            <Zap size={14} className="text-emerald-500" /> ROI: {layer.benefit}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-20 text-center">
                        <div className="inline-block p-1 rounded-2xl bg-gradient-to-r from-blue-600 to-emerald-500">
                            <a href={PLATFORM_URL} className="px-12 py-5 bg-slate-950 rounded-[14px] text-white font-black text-xl hover:bg-transparent transition-all flex items-center gap-4 group">
                                BOOK A SOVEREIGN DEMO <ChevronRight className="group-hover:translate-x-1 transition-transform" />
                            </a>
                        </div>
                        <p className="mt-6 text-[10px] font-bold text-slate-600 uppercase tracking-widest">Limited Enclave Openings Available for Q1 2026</p>
                    </div>
                </div>
            </section>

            {/* Operational Workflow Mastery */}
            <section className="bg-slate-900/50 py-32 border-y border-white/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 blur-[120px] -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/5 blur-[120px] translate-y-1/2 -translate-x-1/2" />

                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="text-center mb-24">
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 font-outfit">Sovereign Operational Mastery</h2>
                        <p className="text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed font-medium">
                            LexSovereign isn't just a research tool—it's the internal OS for elite legal operations in Africa. Automate your daily friction points within a protected logical enclave.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
                        {[
                            {
                                title: "Conflict & Intake",
                                desc: "Zero-conflict onboarding. Cross-reference matters and adverse parties in real-time within your enclave.",
                                icon: <Search className="text-blue-500" size={32} />
                            },
                            {
                                title: "Document Vault",
                                desc: "90-second drafting studio. Auto-hydrate precedents with matter-specific data using high-fidelity AI.",
                                icon: <Sparkles className="text-emerald-500" size={32} />
                            },
                            {
                                title: "Compliance Sentinel",
                                desc: "Hard-pinned auditing. Every draft is automatically scrubbed and verified against regional statutes (GH/NG/SA).",
                                icon: <Lock className="text-purple-500" size={32} />
                            },
                            {
                                title: "Billing Governance",
                                desc: "Transparent time-ledgers. Track billable intensity and resource utilization with tenant-wide fiscal oversight.",
                                icon: <Database className="text-amber-500" size={32} />
                            },
                            {
                                title: "Sovereign Portal",
                                desc: "Secure client collaboration. Share work-product and executed deeds within a cryptographically isolated BYOK environment.",
                                icon: <Shield className="text-white" size={32} />
                            }
                        ].map((workflow, i) => (
                            <div key={i} className="p-8 bg-slate-900/40 border border-white/5 rounded-[2rem] hover:border-blue-500/30 transition-all group">
                                <div className="mb-6 group-hover:scale-110 transition-transform">{workflow.icon}</div>
                                <h4 className="text-lg font-bold text-white mb-3 font-outfit">{workflow.title}</h4>
                                <p className="text-slate-400 text-sm leading-relaxed">{workflow.desc}</p>
                            </div>
                        ))}
                    </div>
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
            {activeModal && <Modal id={activeModal} />}
        </div>
    );
};

export default App;

