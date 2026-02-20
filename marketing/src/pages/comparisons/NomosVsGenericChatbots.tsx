import React from 'react';
import Layout from '../../layouts/Layout';
import SEO from '../../components/SEO';
import { Section, Button } from '../../components/ui';
import { Link } from '../../utils/ssr-compat';
import {
    ArrowLeft,
    ShieldCheck,
    Lock,
    Cpu,
    Gavel,
    CheckCircle,
    XCircle,
    Server,
    Zap
} from 'lucide-react';

export default function NomosVsGenericChatbots() {
    return (
        <Layout>
            <SEO
                title="NomosDesk AI vs Generic Chatbots: Why Legal-Specific AI Wins"
                description="Compare NomosDesk's specialized legal AI against generic website chatbots like Intercom or Zendesk. Discover why security and legal logic matter."
                schema={[
                    {
                        '@context': 'https://schema.org',
                        '@type': 'Article',
                        headline: 'Why Generic Chatbots Fail Law Firms: The NomosDesk Difference',
                        author: { '@type': 'Organization', name: 'NomosDesk' },
                        publisher: { '@type': 'Organization', name: 'NomosDesk' },
                        datePublished: '2026-02-20'
                    }
                ]}
            />

            <Section className="pt-32 pb-12 bg-slate-950 text-center">
                <div className="max-w-4xl mx-auto px-4">
                    <Link to="/ai-legal-chatbot" className="inline-flex items-center gap-2 text-slate-400 hover:text-indigo-400 text-sm mb-8 transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Back to Chatbot Pillar
                    </Link>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                        Specialized Legal AI vs. <span className="text-slate-500">Generic Chatbots</span>
                    </h1>
                    <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
                        Generic chatbots are built for e-commerce and support tickets. NomosDesk is built for privileged communications, institutional governance, and complex legal logic.
                    </p>
                </div>
            </Section>

            {/* Core Differentiators */}
            <Section className="py-24 bg-slate-950">
                <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-8">
                    <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <XCircle className="w-32 h-32 text-red-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-400 mb-6 uppercase tracking-widest text-sm">Generic Chatbots</h2>
                        <ul className="space-y-6">
                            {[
                                "No concept of legal privilege or data sovereignty.",
                                "Built on shared, multi-tenant public cloud data centers.",
                                "Lack matter-specific qualification flows.",
                                "Zero integration with court systems or legal research.",
                                "Data often utilized to train future third-party LLMs."
                            ].map((item, idx) => (
                                <li key={idx} className="flex gap-3 text-slate-500">
                                    <XCircle className="w-5 h-5 text-red-900 shrink-0 mt-0.5" />
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="bg-indigo-900/10 border border-indigo-500/30 p-8 rounded-3xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <ShieldCheck className="w-32 h-32 text-indigo-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-indigo-400 mb-6 uppercase tracking-widest text-sm">NomosDesk AI</h2>
                        <ul className="space-y-6">
                            {[
                                "Institutional-grade sovereignty (POPIA, NDPR, GDPR).",
                                "Sovereign Enclave deployment options (On-Premise).",
                                "Out-of-the-box flows for PI, Immigration, and Criminal Law.",
                                "Embedded judicial research & API-level legal intelligence.",
                                "Private LLM architecture—your data never leaves your environment."
                            ].map((item, idx) => (
                                <li key={idx} className="flex gap-3 text-indigo-100">
                                    <CheckCircle className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </Section>

            {/* Technical Security Section */}
            <Section darker className="py-24">
                <div className="max-w-6xl mx-auto px-4 grid lg:grid-cols-2 gap-16 items-center">
                    <div className="order-2 lg:order-1">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
                                <Lock className="w-8 h-8 text-indigo-400 mb-4" />
                                <h4 className="text-white font-bold mb-2">Privileged Data</h4>
                                <p className="text-xs text-slate-500">Encrypted in-transit and at-rest with institutionally controlled keys.</p>
                            </div>
                            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
                                <Server className="w-8 h-8 text-indigo-400 mb-4" />
                                <h4 className="text-white font-bold mb-2">Residency</h4>
                                <p className="text-xs text-slate-500">Guaranteed in-country hosting for regulated markets.</p>
                            </div>
                            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
                                <Cpu className="w-8 h-8 text-indigo-400 mb-4" />
                                <h4 className="text-white font-bold mb-2">Private LLM</h4>
                                <p className="text-xs text-slate-500">Matter data never trains public models or leaves the enclave.</p>
                            </div>
                            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
                                <Gavel className="w-8 h-8 text-indigo-400 mb-4" />
                                <h4 className="text-white font-bold mb-2">Ethics Ready</h4>
                                <p className="text-xs text-slate-500">Automated conflict checks integrated into conversational flow.</p>
                            </div>
                        </div>
                    </div>
                    <div className="order-1 lg:order-2">
                        <h2 className="text-3xl font-bold text-white mb-6">Security is Not an Afterthought</h2>
                        <p className="text-slate-300 mb-6 leading-relaxed">
                            Generic chatbots are frequently breached because they prioritize user experience over data integrity. For a law firm, a breach of 'client chat logs' is a catastrophic malpractice event.
                        </p>
                        <p className="text-slate-300 leading-relaxed mb-8">
                            NomosDesk treats every conversational interaction as a potential judicial record. Our architecture ensures that confidentiality is maintained at the hardware level.
                        </p>
                        <Button variant="outline" asLink="/security-and-compliance">
                            Review Security Whitepaper
                        </Button>
                    </div>
                </div>
            </Section>

            {/* CTA */}
            <Section className="py-24 text-center bg-slate-950">
                <div className="max-w-3xl mx-auto px-4">
                    <h2 className="text-3xl font-bold text-white mb-4">Don't Sacrifice Security for Conversion</h2>
                    <p className="text-slate-300 mb-8">With NomosDesk, you get the highest conversion rates in the industry without compromising your ethical obligations.</p>
                    <div className="flex gap-4 justify-center">
                        <Button onClick={() => window.dispatchEvent(new CustomEvent('nomosdesk-open-demo'))}>
                            Request Private Demo
                        </Button>
                        <Button variant="outline" asLink="/pricing">Compare Plans</Button>
                    </div>
                </div>
            </Section>
        </Layout>
    );
}
