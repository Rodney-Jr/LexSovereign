import React from 'react';
import Layout from '../layouts/Layout';
import SEO from '../components/SEO';
import { Section, SectionHeader, Button } from '../components/ui';
import { Sparkles, FileText, Globe, Search, Brain, Shield, ArrowRight } from 'lucide-react';

export default function AILegalIntelligencePage() {
    return (
        <Layout>
            <SEO
                title="AI Legal Intelligence | NomosDesk Technology"
                description="Harness the power of AI-assisted drafting, contract analysis, and jurisdiction-aware intelligence."
            />

            {/* HERO */}
            <section className="relative pt-32 pb-20 bg-slate-950 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-500/10 via-slate-950 to-slate-950 z-0"></div>
                <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[10px] font-black uppercase tracking-[0.2em] mb-8">
                        The Intelligence Layer
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-white mb-6">
                        AI-Powered <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400">Legal Intelligence</span>
                    </h1>
                    <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed mb-10">
                        Beyond basic automation. NomosDesk utilizes sovereign AI enclaves to augment legal research, drafting, and analysis.
                    </p>
                    <div className="flex justify-center gap-4">
                        <Button onClick={() => window.dispatchEvent(new CustomEvent('nomosdesk-open-demo'))} size="lg">Request Private Demo</Button>
                    </div>
                </div>
            </section>

            {/* CORE CAPABILITIES */}
            <Section>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <CapabilityCard 
                        title="AI-Assisted Legal Drafting" 
                        icon={<FileText className="text-indigo-400" />}
                        desc="Generate high-quality first drafts of contracts, filings, and correspondences based on localized templates."
                    />
                    <CapabilityCard 
                        title="Contract Risk Analysis" 
                        icon={<Brain className="text-emerald-400" />}
                        desc="Automatically identify high-risk clauses and missing protections against institutional benchmarks."
                    />
                    <CapabilityCard 
                        title="Jurisdiction Intelligence" 
                        icon={<Globe className="text-blue-400" />}
                        desc="Contextualize legal research with a sovereign registry of statutes and verified casefiles for your specific region."
                    />
                    <CapabilityCard 
                        title="Semantic Knowledge Retrieval" 
                        icon={<Search className="text-purple-400" />}
                        desc="Find exactly what you need across thousands of documents using natural language queries, not just keywords."
                    />
                </div>
            </Section>

            {/* DEEP DIVE SECTIONS */}
            <Section darker>
                <div className="space-y-32">
                    {/* Drafting */}
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <div className="order-2 md:order-1">
                            <div className="p-8 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl relative group overflow-hidden">
                                <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <div className="space-y-4 relative z-10">
                                    <div className="h-4 w-1/2 bg-slate-800 rounded"></div>
                                    <div className="h-4 w-3/4 bg-slate-800 rounded opacity-70"></div>
                                    <div className="h-4 w-2/3 bg-indigo-500/20 rounded"></div>
                                    <div className="h-4 w-full bg-slate-800 rounded"></div>
                                    <div className="h-32 w-full bg-slate-800/50 rounded-xl border border-dashed border-slate-700 flex items-center justify-center">
                                        <Sparkles className="text-indigo-500 w-8 h-8 animate-pulse" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="order-1 md:order-2">
                            <h2 className="text-3xl font-bold text-white mb-6">Surgical Precision in Drafting</h2>
                            <p className="text-slate-400 text-lg leading-relaxed mb-6">
                                Stop drafting from scratch. Our AI interface integrates directly with your firm's historical knowledge base to suggest clauses that align with your institutional standards.
                            </p>
                            <ul className="space-y-4">
                                <li className="flex gap-3 text-slate-300">
                                    <ArrowRight className="text-indigo-500 w-5 h-5 flex-shrink-0" />
                                    <span>Instant document summarization for quick review.</span>
                                </li>
                                <li className="flex gap-3 text-slate-300">
                                    <ArrowRight className="text-indigo-500 w-5 h-5 flex-shrink-0" />
                                    <span>Tone adjustment for professional correspondence.</span>
                                </li>
                                <li className="flex gap-3 text-slate-300">
                                    <ArrowRight className="text-indigo-500 w-5 h-5 flex-shrink-0" />
                                    <span>Multi-format support (PDF, DocX, JSON).</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Security */}
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-3xl font-bold text-white mb-6">The Sovereign Enclave Difference</h2>
                            <p className="text-slate-400 text-lg leading-relaxed mb-6">
                                Your data never trains public models. We deploy AI within your own "Sovereign Enclave," ensuring client confidentiality is physically and logically maintained.
                            </p>
                            <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-2xl">
                                <div className="flex items-center gap-3 mb-2">
                                    <Shield className="text-emerald-400 w-5 h-5" />
                                    <span className="text-emerald-300 font-bold uppercase tracking-widest text-xs">Security Guarantee</span>
                                </div>
                                <p className="text-sm text-slate-300 leading-relaxed italic">
                                    "We provide private inference endpoints where your matter files remain within your jurisdiction, complying with both regional data laws and ethical confidentiality requirements."
                                </p>
                            </div>
                        </div>
                        <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl relative flex items-center justify-center aspect-square">
                            <div className="w-48 h-48 border-2 border-indigo-500/20 rounded-full flex items-center justify-center animate-spin-slow">
                                <div className="w-32 h-32 border-2 border-indigo-500/40 rounded-full flex items-center justify-center animate-reverse-spin">
                                    <Brain className="text-indigo-400 w-12 h-12" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Section>

            {/* CTA */}
            <Section>
                <div className="text-center bg-slate-900 border border-slate-800 rounded-3xl p-12 hover:border-indigo-500/20 transition-all">
                    <h2 className="text-3xl font-bold text-white mb-6">Experience the Intelligence</h2>
                    <p className="text-slate-400 max-w-xl mx-auto mb-10 text-lg">
                        See how AI-powered operations can transform your firm's productivity and risk profile.
                    </p>
                    <Button asLink="/pilot-program" size="lg">Inquire About Pilot Program</Button>
                </div>
            </Section>
        </Layout>
    );
}

function CapabilityCard({ title, icon, desc }: { title: string, icon: any, desc: string }) {
    return (
        <div className="p-8 bg-slate-900/50 border border-slate-800 rounded-2xl hover:border-indigo-500/30 transition-colors">
            <div className="bg-slate-900 w-12 h-12 rounded-xl flex items-center justify-center mb-6 shadow-xl border border-slate-800">
                {icon}
            </div>
            <h3 className="text-lg font-bold text-white mb-3">{title}</h3>
            <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
        </div>
    )
}
