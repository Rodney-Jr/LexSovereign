import React from 'react';
import Layout from '../../layouts/Layout';
import SEO from '../../components/SEO';
import { Section, Button } from '../../components/ui';
import { Link } from '../../utils/ssr-compat';
import { FileText, CheckCircle, Zap, ArrowRight, Clock, Shield } from 'lucide-react';

const STEPS = [
    { step: '1', title: 'Template Selection', body: 'Choose from a library of pre-built legal templates (NDAs, service agreements, employment contracts, court filings) or upload your own master document.' },
    { step: '2', title: 'Variable Mapping', body: 'Define the dynamic fields — client name, jurisdiction, effective date, fee amounts — and map them to your matter data or CRM records.' },
    { step: '3', title: 'AI Draft Generation', body: 'The system generates a complete, clause-correct draft in seconds, pulling the correct jurisdiction-specific language based on matter context.' },
    { step: '4', title: 'Attorney Review & E-Sign', body: 'Attorneys review the AI draft, make any adjustments, and send directly for e-signature — all within the same platform.' },
];

export default function LegalDocumentAutomationGuide() {
    return (
        <Layout>
            <SEO
                title="Legal Document Automation Guide 2026 | Reduce Drafting Time by 70%"
                description="The complete guide to legal document automation for law firms and corporate legal teams. Learn how to automate NDAs, contracts, court filings, and more."
                schema={[
                    {
                        '@context': 'https://schema.org',
                        '@type': 'Article',
                        headline: 'Legal Document Automation Guide 2026',
                        description: 'How law firms and corporate legal teams automate document drafting to reduce time, cost, and errors.',
                        author: { '@type': 'Organization', name: 'NomosDesk' },
                        publisher: { '@type': 'Organization', name: 'NomosDesk', url: 'https://nomosdesk.com' },
                        datePublished: '2026-02-21',
                        keywords: 'legal document automation, document automation for lawyers, legal drafting automation, automated legal documents'
                    },
                    {
                        '@context': 'https://schema.org',
                        '@type': 'FAQPage',
                        mainEntity: [
                            { '@type': 'Question', name: 'What is legal document automation?', acceptedAnswer: { '@type': 'Answer', text: 'Legal document automation uses software templates with dynamic fields to generate accurate legal documents — contracts, filings, letters — automatically from structured matter data, replacing manual drafting.' } },
                            { '@type': 'Question', name: 'Which documents can be automated?', acceptedAnswer: { '@type': 'Answer', text: 'Most standard legal documents can be automated: NDAs, engagement letters, service agreements, employment contracts, court pleadings, demand letters, compliance reports, and corporate resolutions.' } },
                            { '@type': 'Question', name: 'How much time does document automation save?', acceptedAnswer: { '@type': 'Answer', text: 'Law firms typically report 60–80% reduction in first-draft creation time. A document that took 2 hours to draft manually can be generated in under 5 minutes with automation.' } },
                            { '@type': 'Question', name: 'Is automated document drafting secure?', acceptedAnswer: { '@type': 'Answer', text: 'Enterprise-grade platforms like NomosDesk process all document generation within a Sovereign Enclave — no client data leaves your controlled infrastructure — satisfying privilege and confidentiality obligations.' } }
                        ]
                    }
                ]}
            />

            <Section className="pt-32 pb-12 bg-slate-950">
                <div className="max-w-3xl mx-auto px-4 text-center">
                    <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-full mb-6">
                        <FileText className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs font-bold text-emerald-300 uppercase tracking-widest">Document Automation</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Legal Document Automation: The Complete 2026 Guide</h1>
                    <p className="text-xl text-slate-300 mb-8 leading-relaxed">
                        <strong className="text-white">Legal document automation</strong> transforms how law firms and corporate legal teams produce standard documents — cutting drafting time by up to 70%, eliminating copy-paste errors, and ensuring every document reflects your current house style and clause standards.
                    </p>
                </div>
            </Section>

            <Section className="pb-24 bg-slate-950">
                <div className="max-w-3xl mx-auto px-4 space-y-16">

                    <div>
                        <h2 className="text-2xl font-bold text-white mb-4">What Is Legal Document Automation?</h2>
                        <p className="text-slate-400 leading-relaxed mb-4">
                            Legal document automation is the process of using software to generate legal documents — contracts, agreements, court filings, compliance letters — automatically from master templates and structured data. Instead of manually drafting each document from scratch (or copy-pasting from previous files), attorneys work from intelligent templates where dynamic fields are populated automatically from matter data.
                        </p>
                        <p className="text-slate-400 leading-relaxed">
                            Modern <strong className="text-white">document automation for lawyers</strong> goes further than simple mail-merge: it incorporates conditional logic (different clauses triggered by jurisdiction, deal type, or risk level), AI-generated clause drafting for non-standard scenarios, and integration with your <Link to="/legal-practice-management-software" className="text-indigo-400 hover:text-indigo-300">legal practice management platform</Link> so documents are always linked to the correct matter.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold text-white mb-4">Which Documents Can Be Automated?</h2>
                        <p className="text-slate-400 leading-relaxed mb-6">
                            Nearly every standard document type in a law firm's production cycle is a candidate for <strong className="text-white">legal drafting automation</strong>. The highest-impact categories are:
                        </p>
                        <div className="grid sm:grid-cols-2 gap-3">
                            {[
                                'Non-Disclosure Agreements (NDAs)',
                                'Engagement & Retainer Letters',
                                'Service & Vendor Agreements',
                                'Employment Contracts',
                                'Court Pleadings & Motions',
                                'Demand & Cease-and-Desist Letters',
                                'Corporate Resolutions & Minutes',
                                'Compliance & Regulatory Reports',
                                'Lease & Real Estate Agreements',
                                'Shareholder & Subscription Agreements',
                            ].map(doc => (
                                <div key={doc} className="flex items-center gap-2 text-sm text-slate-300">
                                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                                    {doc}
                                </div>
                            ))}
                        </div>
                        <div className="mt-8">
                            <h3 className="text-xl font-bold text-white mb-3">What Cannot Be Fully Automated?</h3>
                            <p className="text-slate-400 leading-relaxed">
                                Highly bespoke documents — complex M&A agreements, novel regulatory structures, multi-party international transactions — still require meaningful attorney input. Automation handles the structure and standard clauses; attorney judgment handles the non-standard positions. The goal is never to eliminate attorneys but to free them from repetitive drafting tasks.
                            </p>
                        </div>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold text-white mb-6">How Legal Document Automation Works: Step by Step</h2>
                        <div className="space-y-4">
                            {STEPS.map(s => (
                                <div key={s.step} className="flex gap-5 p-5 bg-slate-900 border border-slate-800 rounded-2xl">
                                    <div className="w-8 h-8 bg-indigo-500/20 border border-indigo-500/30 rounded-xl flex items-center justify-center text-indigo-400 font-bold text-sm shrink-0">{s.step}</div>
                                    <div>
                                        <p className="font-bold text-white text-sm mb-1">{s.title}</p>
                                        <p className="text-slate-400 text-sm leading-relaxed">{s.body}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold text-white mb-4">The Business Case: Time and Cost Savings</h2>
                        <p className="text-slate-400 leading-relaxed mb-6">
                            The ROI on <strong className="text-white">automated legal documents</strong> compounds quickly. Consider a mid-size firm producing 50 standard agreements per month. If each takes an average of 1.5 hours to draft manually, that's 75 attorney-hours monthly. At average associate rates, that's a significant cost centre on work that generates no direct advisory value.
                        </p>
                        <div className="grid sm:grid-cols-3 gap-4">
                            {[
                                { metric: '70%', label: 'Average drafting time saved' },
                                { metric: '95%', label: 'Reduction in formatting errors' },
                                { metric: '3×', label: 'Document throughput increase' },
                            ].map(m => (
                                <div key={m.label} className="text-center p-5 bg-slate-900 border border-slate-800 rounded-2xl">
                                    <p className="text-3xl font-bold text-indigo-400 mb-1">{m.metric}</p>
                                    <p className="text-xs text-slate-500 uppercase tracking-wide">{m.label}</p>
                                </div>
                            ))}
                        </div>
                        <div className="mt-8">
                            <h3 className="text-xl font-bold text-white mb-3">Consistency and Risk Reduction</h3>
                            <p className="text-slate-400 leading-relaxed">
                                Beyond time savings, <strong className="text-white">contract automation software</strong> eliminates the risk of attorneys working from outdated templates or accidentally importing non-approved clauses from previous client files. Every automated document starts from your firm's current, approved clause library — guaranteed. This is especially critical for firms operating under ISO 27001, SOC 2, or government procurement frameworks.
                            </p>
                        </div>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold text-white mb-4">Choosing the Right Platform</h2>
                        <p className="text-slate-400 leading-relaxed mb-4">
                            When evaluating legal document automation platforms, prioritise these capabilities: template library depth and jurisdiction coverage, conditional logic flexibility, AI drafting for non-standard clauses, matter management integration, e-signature workflow, and security model. See how NomosDesk compares to alternatives on our <Link to="/vs/nomosdesk-vs-clio" className="text-indigo-400 hover:text-indigo-300">NomosDesk vs Clio</Link> page.
                        </p>
                        <p className="text-slate-400 leading-relaxed">
                            For government and enterprise teams, the security model is non-negotiable. NomosDesk processes all document generation within a sovereign hardware enclave — no document data touches external AI APIs. See our <Link to="/security-and-compliance" className="text-indigo-400 hover:text-indigo-300">security and compliance</Link> architecture for full technical details.
                        </p>
                    </div>

                    {/* FAQ */}
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-8">Frequently Asked Questions</h2>
                        <div className="space-y-4">
                            {[
                                { q: 'What is legal document automation?', a: 'Legal document automation uses software templates with dynamic fields to generate accurate legal documents — contracts, filings, letters — automatically from structured matter data, replacing manual drafting.' },
                                { q: 'Which documents can be automated?', a: 'Most standard legal documents can be automated: NDAs, engagement letters, service agreements, employment contracts, court pleadings, demand letters, compliance reports, and corporate resolutions.' },
                                { q: 'How much time does document automation save?', a: 'Law firms typically report 60–80% reduction in first-draft creation time. A document that took 2 hours to draft manually can be generated in under 5 minutes with automation.' },
                                { q: 'Is automated document drafting secure?', a: 'Enterprise-grade platforms like NomosDesk process all document generation within a Sovereign Enclave — no client data leaves your controlled infrastructure — satisfying privilege and confidentiality obligations.' },
                            ].map(f => (
                                <div key={f.q} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                                    <h3 className="font-bold text-white mb-2">{f.q}</h3>
                                    <p className="text-slate-400 text-sm leading-relaxed">{f.a}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="p-8 bg-indigo-600/5 border border-indigo-500/20 rounded-2xl text-center">
                        <h3 className="text-xl font-bold text-white mb-4">Automate Your Document Workflows Today</h3>
                        <p className="text-slate-300 mb-8">See NomosDesk's document automation studio live — from template selection to signed agreement in under 5 minutes.</p>
                        <Button onClick={() => window.dispatchEvent(new CustomEvent('nomosdesk-open-demo'))}>
                            Book a Free Demo
                        </Button>
                    </div>
                </div>
            </Section>
        </Layout>
    );
}
