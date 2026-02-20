import React from 'react';
import Layout from '../../layouts/Layout';
import SEO from '../../components/SEO';
import { Section, Button } from '../../components/ui';
import { Link } from '../../utils/ssr-compat';
import { ShieldCheck, Lock, Globe, EyeOff, Server, CheckCircle } from 'lucide-react';

export default function ChatbotDataPrivacy() {
    return (
        <Layout>
            <SEO
                title="Data Privacy in AI Legal Chatbots: 2026 Security Guide"
                description="Understand the critical data privacy requirements for AI chatbots in law firms. Learn about POPIA, GDPR, and sovereign cloud enclaves for legal data."
                schema={[{ '@context': 'https://schema.org', '@type': 'Article', headline: 'Protecting Privileged Data: Privacy in Legal AI' }]}
            />
            <Section className="pt-32 pb-12 bg-slate-950">
                <div className="max-w-3xl mx-auto px-4">
                    <h1 className="text-4xl font-bold text-white mb-6">Data Privacy in AI Legal Chatbots</h1>
                    <p className="text-xl text-slate-300 mb-8 leading-relaxed">
                        In the legal world, a chatbot isn't just a marketing tool—it's a portal for <strong className="text-white">privileged client data</strong>. Using generic AI chatbots without legal-grade privacy is a professional liability.
                    </p>
                </div>
            </Section>
            <Section className="pb-24 bg-slate-950">
                <div className="max-w-3xl mx-auto px-4 prose prose-invert">
                    <h2 className="text-2xl font-bold text-white mb-4">The Danger of Public LLMs</h2>
                    <p className="text-slate-400 mb-6">
                        Most chatbots use public APIs that utilize your data to train their models. For law firms, this is an ethical violation. NomosDesk uses <Link to="/vs/nomosdesk-ai-vs-generic-website-chatbots" className="text-indigo-400">Private LLM instances</Link> where your data is never shared.
                    </p>
                    <h2 className="text-2xl font-bold text-white mb-4">Sovereignty and Residency (POPIA/GDPR)</h2>
                    <p className="text-slate-400 mb-6">
                        Laws like POPIA (South Africa) and GDPR (EU) require data to stay within specific jurisdictions. Our <Link to="/security-and-compliance" className="text-indigo-400">Sovereign Cloud</Link> ensures that your chatbot data resides locally in your country's enclaves.
                    </p>
                    <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl mb-12">
                        <h4 className="text-indigo-400 font-bold mb-4 uppercase text-xs tracking-widest">Security Checklist</h4>
                        <ul className="space-y-3 text-sm text-slate-400">
                            <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500" /> AES-256 Encryption at Rest</li>
                            <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500" /> TLS 1.3 Encryption in Transit</li>
                            <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500" /> Automated PII Redaction</li>
                            <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500" /> Local Data Sovereignty Compliance</li>
                        </ul>
                    </div>
                </div>
                <div className="max-w-3xl mx-auto text-center mt-12">
                    <Button variant="outline" asLink="/ai-legal-chatbot">
                        View Chatbot Security Features
                    </Button>
                </div>
            </Section>
        </Layout>
    );
}
