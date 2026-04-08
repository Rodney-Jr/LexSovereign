import React, { useState, useEffect } from 'react';
import Layout from '../layouts/Layout';
import SEO from '../components/SEO';
import { Button, Section, SectionHeader } from '../components/ui';
import { 
    Shield, FileText, CheckCircle, Smartphone, Lock, Users, Globe, Gavel, 
    FileCheck, Sparkles, BarChart3, Receipt, TrendingUp, Package, 
    BookOpenCheck, Rocket, Briefcase, ShieldAlert, Calendar, Scale, 
    Award, Building2, Play, Eye, BrainCircuit, AlertTriangle, Library, 
    Zap, Fingerprint, Search, ChevronRight 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, StaticRouter, HelmetProvider } from '../utils/ssr-compat';
import RelatedInsights from '../components/RelatedInsights';
import EarlyAccessForm from '../components/EarlyAccessForm';
import { ROICalculator } from '../components/ROICalculator';
import VideoModal from '../components/VideoModal';
import type { SsgOptions } from 'vite-plugin-ssg';

export const ssgOptions: SsgOptions = {
    slug: 'index',
    routeUrl: '/',
    context: async (children) => {
        return (
            <HelmetProvider>
                <StaticRouter location="/">{children}</StaticRouter>
            </HelmetProvider>
        );
    },
};

export default function HomePage() {
    const [isVideoOpen, setIsVideoOpen] = useState(false);
    
    const insightArticles = [
        {
            slug: "/insights/risk-detection-in-banking",
            title: "Automated Risk Detection in Banking Documentation",
            excerpt: "How institutional grade AI detects missing liability caps and governing law gaps in multi-party agreements.",
            readTime: "6 min read"
        },
        {
            slug: "/insights/sovereign-data-residency",
            title: "The Case for Sovereign Data Residency in Legal Tech",
            excerpt: "Why legal professionals must prioritize local data control in an era of global cloud consolidated infrastructure.",
            readTime: "4 min read"
        },
        {
            slug: "/insights/digital-evidence-act-compliance",
            title: "Navigating the Digital Evidence Act with Immutable Trails",
            excerpt: "Ensuring your digital records meet the strict standards of the latest statutory evidence requirements.",
            readTime: "8 min read"
        }
    ];

    return (
        <Layout>
            <SEO
                title="Legal Intelligence & Compliance Platform"
                description="Draft, detect risk, and ensure compliance. NomosDesk combines AI-powered drafting with bank-grade compliance checks for regulated institutions."
                keywords="legal drafting software, legal compliance platform, contract risk analysis, AI legal drafting Ghana, legal document automation"
                schema={[
                    {
                        "@context": "https://schema.org",
                        "@type": "SoftwareApplication",
                        "name": "NomosDesk",
                        "applicationCategory": "BusinessApplication",
                        "operatingSystem": "Cloud",
                        "offers": {
                            "@type": "Offer",
                            "price": "0",
                            "priceCurrency": "USD"
                        }
                    }
                ]}
            />

            {/* HERO SECTION - INSTITUTIONAL COMMAND */}
            <section className="relative min-h-[90vh] flex items-center justify-center pt-32 pb-20 overflow-hidden bg-slate-950">
                {/* Background Effects */}
                <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-0 inset-x-0 h-[600px] bg-gradient-to-b from-indigo-500/15 via-indigo-500/5 to-transparent blur-3xl opacity-60"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-indigo-500/5 rounded-full blur-[140px]"></div>
                    <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:radial-gradient(ellipse_at_center,white,transparent)] opacity-20"></div>
                </div>

                <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
                    <div className="grid lg:grid-cols-12 gap-16 items-center">
                        <div className="lg:col-span-12 text-center space-y-10 max-w-4xl mx-auto">
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-black tracking-widest uppercase shadow-xl"
                            >
                                <Fingerprint className="w-4 h-4" /> Sovereign Intelligence Infrastructure
                            </motion.div>

                            <motion.h1 
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.7, ease: "easeOut" }}
                                className="text-6xl md:text-9xl font-black leading-[0.95] tracking-tight text-white mb-6"
                            >
                                Draft. Detect. <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-indigo-200 to-white">Govern.</span>
                            </motion.h1>

                            <motion.p 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.7, delay: 0.2 }}
                                className="text-xl md:text-2xl text-slate-400 leading-relaxed max-w-3xl mx-auto font-medium"
                            >
                                The first integrated platform for professionals who demand zero document risk. 
                                <span className="text-white"> NomosDesk</span> automates compliance validation and risk alerting in your private legal enclave.
                            </motion.p>

                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.7, delay: 0.3 }}
                                className="flex flex-col sm:flex-row gap-6 justify-center"
                            >
                                <Button asLink="/onboarding" size="lg" className="px-12 h-16 text-lg rounded-2xl shadow-2xl shadow-indigo-500/30">Start 30-Day Free Trial</Button>
                                <Button 
                                    variant="outline" 
                                    size="lg" 
                                    className="px-12 h-16 text-lg rounded-2xl border-slate-800 hover:border-indigo-500 hover:bg-indigo-500/5 group"
                                    onClick={() => setIsVideoOpen(true)}
                                >
                                    <Play className="w-5 h-5 mr-3 text-indigo-400 group-hover:scale-125 transition-transform" />
                                    Watch Intro
                                </Button>
                            </motion.div>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.4em]">No Credit Card Required • Instant Enclave Provisioning</p>
                        </div>
                    </div>

                    {/* HERO PREVIEW UI */}
                    <motion.div 
                        initial={{ opacity: 0, y: 100 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                        className="mt-24 relative max-w-6xl mx-auto group"
                    >
                        <div className="absolute -inset-4 bg-indigo-500/20 blur-[100px] opacity-0 group-hover:opacity-40 transition duration-1000"></div>
                        <div className="relative bg-[#020617] border border-slate-800 rounded-[3rem] overflow-hidden shadow-[0_60px_120px_-24px_rgba(0,0,0,1)] p-3">
                            <div className="bg-[#0B0E14] rounded-[2.5rem] overflow-hidden border border-slate-800/50 relative">
                                <img 
                                    src="/images/demos/matter_drafting_filled.png" 
                                    alt="NomosDesk Studio" 
                                    className="w-full grayscale-[0.3] group-hover:grayscale-0 transition-all duration-700"
                                />
                                
                                {/* Floating Intelligence Cards */}
                                <div className="absolute top-1/4 right-8 w-72 space-y-4 pointer-events-none hidden md:block group-hover:translate-x-[-10px] transition-all duration-700">
                                    <div className="p-5 bg-slate-900/90 backdrop-blur-2xl border border-rose-500/30 rounded-[2rem] shadow-3xl animate-fade-in">
                                        <div className="flex gap-2 items-center text-[10px] font-black text-rose-400 uppercase tracking-widest mb-3">
                                            <AlertTriangle size={14} /> Critical Risk Detect
                                        </div>
                                        <p className="text-xs text-slate-300 font-bold leading-relaxed">Missing 'Limitation of Liability' cap detected in Section 14.2.</p>
                                    </div>
                                    <div className="p-5 bg-slate-900/90 backdrop-blur-2xl border border-emerald-500/30 rounded-[2rem] shadow-3xl delay-100">
                                        <div className="flex gap-2 items-center text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-3">
                                            <CheckCircle size={14} /> Compliance OK
                                        </div>
                                        <p className="text-xs text-slate-300 font-bold leading-relaxed">Document aligns with Central Bank Outsourcing Directives.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* TRUST TICKER */}
            <div className="py-12 bg-slate-950 border-y border-slate-900 relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-wrap justify-center gap-10 md:gap-24 opacity-30 hover:opacity-100 transition-opacity duration-700">
                        {['Central Bank Standards', 'ISO 27001 Certified', 'Digital Evidence Act Compliant', 'Bank-Grade Infrastructure', 'Institutional Privacy'].map((text, i) => (
                            <span key={i} className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] font-sans">{text}</span>
                        ))}
                    </div>
                </div>
            </div>

            {/* CORE SOLUTIONS - THE PILLARS */}
            <Section darker className="border-b border-slate-900" id="solutions">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid lg:grid-cols-2 gap-20 items-end mb-32">
                        <div>
                            <div className="text-indigo-400 font-black uppercase tracking-[0.3em] mb-6 text-sm">Institutional Capability</div>
                            <h2 className="text-5xl md:text-7xl font-black text-white leading-[1] tracking-tight">The Future of <br />Legal Governance.</h2>
                        </div>
                        <p className="text-xl text-slate-400 leading-relaxed max-w-xl pb-4 font-medium">
                            NomosDesk is the analytical layer for your firm's most critical assets. 
                            We unify drafting, risk alerting, and audit readiness into a single sovereign workflow.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            { 
                                title: "Drafting Studio", 
                                tag: "Command Center",
                                description: "A high-fidelity structured editor that governs every provision you write.",
                                icon: <Zap className="w-8 h-8 text-indigo-400" /> 
                            },
                            { 
                                title: "Risk Engine", 
                                tag: "Deterministic",
                                description: "Automated analysis of missing provisions and contradictory terms in real-time.",
                                icon: <ShieldAlert className="w-8 h-8 text-rose-400" /> 
                            },
                            { 
                                title: "Compliance Core", 
                                tag: "Bank-Grade",
                                description: "Validate every document against BoG and statutory standards instantly.",
                                icon: <Scale className="w-8 h-8 text-emerald-400" /> 
                            },
                            { 
                                title: "Clause Library", 
                                tag: "Global Access",
                                description: "Centralized, version-controlled library of your firm's standards with regional scoping.",
                                icon: <Library className="w-8 h-8 text-sky-400" /> 
                            },
                        ].map((pillar, idx) => (
                            <motion.div 
                                key={idx} 
                                whileHover={{ y: -12 }}
                                className="bg-[#0B0E14] border border-slate-800/60 p-12 rounded-[2.5rem] hover:border-indigo-500/50 transition-all duration-500 group relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-10 transition-opacity">
                                    {pillar.icon}
                                </div>
                                <div className="text-[10px] font-black uppercase text-indigo-400/60 tracking-[0.2em] mb-8">{pillar.tag}</div>
                                <div className="p-5 bg-indigo-500/5 border border-indigo-500/10 rounded-3xl w-fit mb-10 group-hover:bg-indigo-500/10 transition-all">
                                    {pillar.icon}
                                </div>
                                <h3 className="text-2xl font-black text-white mb-4 leading-tight">{pillar.title}</h3>
                                <p className="text-slate-500 group-hover:text-slate-400 transition-colors leading-relaxed font-medium">{pillar.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </Section>

            {/* INTELLIGENCE PANEL - THE SHOWCASE */}
            <Section className="relative bg-slate-950 overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-slate-800 to-transparent"></div>
                
                <div className="grid lg:grid-cols-2 gap-32 items-center mb-32">
                    <div className="space-y-12 order-2 lg:order-1">
                        <div className="space-y-6">
                            <div className="text-indigo-400 font-black uppercase tracking-[0.2em] text-sm">Intelligence Showcase</div>
                            <h2 className="text-4xl md:text-6xl font-black text-white leading-[1.1]">Your Co-Pilot for <br />High-Stakes Work.</h2>
                            <p className="text-lg text-slate-400 leading-relaxed font-medium max-w-lg">
                                NomosDesk doesn't just suggest text; it analyzes your document against the 
                                <span className="text-white italic"> specific legal logic</span> of your jurisdiction.
                            </p>
                        </div>

                        <div className="grid gap-6">
                            {[
                                { title: "Context-Aware Logic", text: "Understands your specific matter type and mission intent.", icon: <BrainCircuit className="w-5 h-5" /> },
                                { title: "Legacy Ingestion", text: "Import .docx files with automated pagination and structural parsing.", icon: <FileText className="w-5 h-5" /> },
                                { title: "Audit Trail Generation", text: "Every AI suggestion provides the rationale and source.", icon: <Fingerprint className="w-5 h-5" /> }
                            ].map((item, i) => (
                                <motion.div key={i} whileHover={{ x: 15 }} className="flex gap-6 items-center p-6 bg-slate-900/40 border border-slate-800/60 rounded-3xl group cursor-default">
                                    <div className="p-3 bg-indigo-500/10 rounded-2xl group-hover:bg-indigo-400 group-hover:text-slate-950 transition-all text-indigo-400">
                                        {item.icon}
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-black text-white mb-1 tracking-tight">{item.title}</h4>
                                        <p className="text-sm text-slate-400 font-medium">{item.text}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    <div className="relative order-1 lg:order-2">
                        {/* High-Fidelity Intelligence Mock */}
                        <div className="relative p-10 bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-[3rem] shadow-3xl">
                            <div className="flex justify-between items-center mb-10 pb-6 border-b border-slate-800">
                                <div className="flex gap-3 items-center">
                                    <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                                    <span className="text-xs font-black text-white uppercase tracking-widest">Active Analysis</span>
                                </div>
                                <div className="text-[10px] font-bold text-slate-500 uppercase">Matter ID: LL-2026-003</div>
                            </div>
                            
                            <div className="space-y-8">
                                <div className="p-6 bg-rose-500/5 border border-rose-500/30 rounded-3xl space-y-3">
                                    <div className="flex justify-between items-center text-[10px] uppercase font-black text-rose-400 tracking-widest">
                                        <span>Risk Alert</span>
                                        <span>High Priority</span>
                                    </div>
                                    <p className="text-sm text-slate-200 font-bold leading-relaxed">"Missing 'Force Majeure' provision for pandemic-related disruptions found in Section 12."</p>
                                    <Button variant="outline" size="sm" className="w-full mt-4 text-[10px] h-10 border-rose-500/30 text-rose-400 hover:bg-rose-500/10 hover:border-rose-500">Fix Provision</Button>
                                </div>

                                <div className="p-6 bg-[#0B0E14] border border-slate-800 rounded-3xl space-y-4">
                                    <div className="flex justify-between items-center text-[10px] uppercase font-black text-indigo-400 tracking-widest">
                                        <span>Library Suggestion</span>
                                        <span>89% Match</span>
                                    </div>
                                    <p className="text-sm text-slate-400 font-medium">Matching 'Indemnity Cap' found in your Firm Library.</p>
                                    <div className="h-1 bg-slate-800 rounded-full w-full"><div className="h-full w-[89%] bg-indigo-500"></div></div>
                                </div>
                            </div>

                            <div className="absolute -bottom-10 -left-10 w-48 p-6 bg-slate-900 border border-slate-800 rounded-[2rem] shadow-2xl hidden md:block">
                                <div className="text-[10px] font-black text-slate-600 uppercase mb-4">Compliance</div>
                                <div className="text-3xl font-black text-emerald-400 tracking-tight">85%</div>
                                <div className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest">Optimal Secure</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* INSTITUTIONAL PROOF POINTS */}
                <div className="max-w-7xl mx-auto px-6 border-t border-slate-900 pt-32 pb-16">
                    <div className="grid md:grid-cols-4 gap-12 text-center items-start">
                        {[
                            { value: "70%", label: "Faster Drafting", sub: "Verified efficiency vs Word" },
                            { value: "Zero", label: "Missed Risks", sub: "Since institutional deployment" },
                            { value: "100%", label: "Secure Isolation", sub: "Private enclave architecture" },
                            { value: "Sovereign", label: "Data Residency", sub: "Total local control" }
                        ].map((stat, i) => (
                            <motion.div key={i} whileHover={{ y: -5 }}>
                                <div className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-4">{stat.value}</div>
                                <div className="text-base font-black text-indigo-400 uppercase tracking-widest mb-1">{stat.label}</div>
                                <div className="text-xs text-slate-500 font-bold uppercase tracking-widest">{stat.sub}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </Section>

            {/* THE DIFFERENTIATION GRID */}
            <Section darker className="border-y border-slate-900">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-24">
                        <h2 className="text-4xl md:text-6xl font-black text-white leading-tight mb-8">Uncompromising <br />By Design.</h2>
                        <p className="text-lg text-slate-400 font-medium max-w-2xl mx-auto">
                            Generic AI tools solve for transcription. We solve for Governance. 
                            See how NomosDesk compares to legacy professional workflows.
                        </p>
                    </div>

                    <div className="grid border border-slate-800 rounded-[3rem] overflow-hidden">
                        {[
                            { title: "Primary Output", legacy: "Generic Legal Text", nomos: "Governed Institutional Wisdom" },
                            { title: "Risk Safeguards", legacy: "Manual Peer Review", nomos: "Deterministic Risk Engine" },
                            { title: "Compliance", legacy: "Reactive / After Audit", nomos: "Proactive / Live Enforcement" },
                            { title: "Architecture", legacy: "Open / Cloud Shared", nomos: "Sovereign Isolated Enclaves" }
                        ].map((row, i) => (
                            <div key={i} className="grid grid-cols-12 border-b last:border-0 border-slate-800">
                                <div className="col-span-12 md:col-span-4 p-8 bg-slate-900/50 border-r border-slate-800 font-black text-sm uppercase tracking-widest text-slate-500 flex items-center">{row.title}</div>
                                <div className="col-span-6 md:col-span-4 p-8 border-r border-slate-800 text-slate-500 font-medium flex items-center opacity-60">{row.legacy}</div>
                                <div className="col-span-6 md:col-span-4 p-8 bg-indigo-500/5 text-white font-black flex items-center gap-4">
                                    <CheckCircle className="w-5 h-5 text-indigo-400" />
                                    {row.nomos}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </Section>

            {/* ROI CALCULATOR CALLOUT */}
            <Section>
                <div className="max-w-7xl mx-auto px-6">
                    <div className="bg-gradient-to-br from-[#0B0E14] to-slate-950 border border-slate-800 rounded-[3rem] p-16 md:p-24 relative overflow-hidden text-center">
                        <div className="max-w-3xl mx-auto space-y-10 relative z-10">
                            <h2 className="text-4xl md:text-6xl font-black text-white leading-tight uppercase tracking-tight">Quantity Your Institutional Advantage.</h2>
                            <p className="text-xl text-slate-400 font-medium">
                                Drafting efficiency is just the start. Calculate the financial impact of removing document-level risk from your organization.
                            </p>
                            <div className="flex justify-center gap-6">
                                <Button asLink="/onboarding" size="lg" className="px-12 h-16 rounded-2xl">Start 30-Day Free Trial</Button>
                                <Button variant="outline" size="lg" className="px-12 h-16 rounded-2xl border-slate-700">Request Custom ROI Case Study</Button>
                            </div>
                        </div>
                    </div>
                </div>
            </Section>

            {/* RECENT ANALYTICS / INSIGHTS */}
            <Section darker className="border-t border-slate-900">
                <div className="max-w-7xl mx-auto">
                    <div className="flex justify-between items-end mb-16">
                        <div>
                            <div className="text-indigo-400 font-black uppercase tracking-[0.2em] text-sm mb-4">Sovereign Knowledge</div>
                            <h2 className="text-3xl font-black text-white">Institutional Insights</h2>
                        </div>
                        <Link to="/legal-operations" className="text-sm font-bold text-slate-500 hover:text-white transition-colors flex items-center gap-2">View Hub <ChevronRight size={16} /></Link>
                    </div>
                    <RelatedInsights articles={insightArticles} />
                </div>
            </Section>

            {/* FINAL CTA - START DRAFTING */}
            <section className="py-32 px-6 bg-slate-950 relative overflow-hidden">
                <div className="absolute inset-x-0 bottom-0 h-96 bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none"></div>
                
                <div className="max-w-4xl mx-auto text-center space-y-12 relative z-10">
                    <h2 className="text-5xl md:text-8xl font-black text-white tracking-tighter leading-none">Draft with <br />Unshakable Confidence.</h2>
                    <p className="text-xl text-slate-400 font-medium max-w-2xl mx-auto">
                        Join the next generation of institutional drafting. Provision your enclave today and experience Zero-Gap legal intelligence.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-6 justify-center">
                        <Button asLink="/onboarding" size="lg" className="px-16 h-20 text-xl font-black rounded-3xl shadow-2xl shadow-indigo-500/40">Launch My Enclave</Button>
                        <Button 
                            variant="outline" 
                            size="lg" 
                            className="px-16 h-20 text-xl font-bold rounded-3xl border-slate-700 hover:border-slate-500"
                        >
                            Request 1:1 Demo
                        </Button>
                    </div>
                    <div className="text-slate-600 text-[10px] font-black uppercase tracking-[0.5em] pt-12">Institutional Grade • ISO 27001 • Sovereign by Default</div>
                </div>
            </section>

            <VideoModal 
                isOpen={isVideoOpen} 
                onClose={() => setIsVideoOpen(false)} 
                videoSrc="/C:/Users/LENOVO/.gemini/antigravity/brain/3bd73e09-c06d-4f5a-ba12-40938ec6ccfe/fix_verification_demo_1774164393892.webp" 
            />
        </Layout>
    );
}

function AudienceItem({ title, description, link }: { title: string; description: string; link: string }) {
    return (
        <Link to={link} className="block p-6 bg-slate-900/50 border border-slate-800 rounded-3xl hover:bg-slate-800 transition-colors group">
            <div className="flex justify-between items-start mb-2">
                <h4 className="text-xl font-bold text-white tracking-tight">{title}</h4>
                <div className="p-1 bg-indigo-500/10 rounded group-hover:bg-indigo-500 group-hover:text-slate-950 transition-all text-indigo-400">
                    <ChevronRight size={18} />
                </div>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
        </Link>
    );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
    return (
        <div className="p-10 bg-slate-900/30 border border-slate-800/80 rounded-[2.5rem] hover:border-slate-700 transition-colors group">
            <div className="mb-8 p-4 bg-slate-900 border border-slate-800 rounded-2xl w-fit group-hover:scale-110 transition-transform">{icon}</div>
            <h4 className="text-xl font-black text-white mb-4 tracking-tight">{title}</h4>
            <p className="text-slate-500 group-hover:text-slate-400 transition-colors leading-relaxed font-medium">{description}</p>
        </div>
    );
}

function FoundingFirmLogo({ name }: { name: string }) {
    return (
        <div className="aspect-video bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center p-6 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all">
            <div className="text-xs font-black text-slate-500 tracking-tighter uppercase">{name}</div>
        </div>
    );
}
