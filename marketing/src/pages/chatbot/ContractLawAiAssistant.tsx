import React, { useEffect } from 'react';
import Layout from '../../layouts/Layout';
import SEO from '../../components/SEO';
import { Section, Button } from '../../components/ui';
import { Link } from '../../utils/ssr-compat';
import { FileText, MessageSquare, CheckCircle } from 'lucide-react';

export default function ContractLawAiAssistant() {
    useEffect(() => {
        // Auto-open chatbot with contract law context after 3 seconds
        const timer = setTimeout(() => {
            window.dispatchEvent(new CustomEvent('nomosdesk-chatbot-context', {
                detail: { context: 'contract-law', greeting: 'Hello! I can help you understand contract law issues, draft simple agreements, or connect you with a contract law specialist. What brings you here today?' }
            }));
        }, 3000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <Layout>
            <SEO
                title="Contract Law AI Assistant | NomosDesk"
                description="Get instant answers to contract law questions from our AI assistant. Understand contract terms, obligations, breach remedies, and when you need a contract attorney."
                schema={[{
                    '@context': 'https://schema.org',
                    '@type': 'Service',
                    name: 'Contract Law AI Assistant',
                    provider: { '@type': 'Organization', name: 'NomosDesk', url: 'https://nomosdesk.com' },
                    description: 'AI-powered contract law guidance and attorney referral for businesses and individuals.',
                    serviceType: 'Legal Services'
                }]}
            />

            <Section className="pt-32 pb-12 bg-slate-950">
                <div className="max-w-3xl mx-auto px-4 text-center">
                    <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 px-4 py-2 rounded-full mb-6">
                        <FileText className="w-4 h-4 text-indigo-400" />
                        <span className="text-xs font-bold text-indigo-300 uppercase tracking-widest">Contract Law</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Contract Law AI Assistant</h1>
                    <p className="text-xl text-slate-300 mb-8 leading-relaxed">
                        Get instant AI guidance on contract questions — from understanding what you've signed to identifying your options when things go wrong. For matters requiring legal advice, we'll connect you with a contract law specialist.
                    </p>
                    <Button onClick={() => window.dispatchEvent(new CustomEvent('nomosdesk-chatbot-open'))}>
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Ask a Contract Law Question
                    </Button>
                </div>
            </Section>

            <Section className="pb-24 bg-slate-950">
                <div className="max-w-3xl mx-auto px-4 space-y-16">

                    <div>
                        <h2 className="text-2xl font-bold text-white mb-4">What Our Contract Law AI Can Help With</h2>
                        <div className="grid sm:grid-cols-2 gap-3">
                            {[
                                'Understanding contract terms and obligations',
                                'Identifying potentially unfair or unenforceable clauses',
                                'Explaining breach of contract and your remedies',
                                'Drafting simple NDA or agreement outlines',
                                'Understanding limitation of liability clauses',
                                'Explaining termination and exit provisions',
                                'Identifying red flags in contracts before signing',
                                'Understanding indemnification obligations',
                            ].map(item => (
                                <div key={item} className="flex items-start gap-2 text-sm text-slate-300 bg-slate-900 border border-slate-800 p-4 rounded-xl">
                                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                                    {item}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold text-white mb-4">Common Contract Law Questions</h2>
                        <div className="space-y-4">
                            {[
                                { q: 'Is my verbal contract enforceable?', a: 'Verbal contracts can be legally binding, but they\'re difficult to enforce because there\'s no written evidence of the terms. For contracts involving real estate, goods over a certain value, or matters lasting more than a year, most jurisdictions require written agreements. An attorney can assess enforceability based on your specific situation and jurisdiction.' },
                                { q: 'What constitutes a breach of contract?', a: 'A breach occurs when one party fails to fulfil their contractual obligations without a legally recognised excuse. Breaches can be material (significant, allowing the other party to terminate and sue for damages) or minor (allowing a claim for damages but not termination). The remedy depends on the type and severity of the breach.' },
                                { q: 'Can I get out of a contract I signed?', a: 'Exiting a contract depends on its terms, whether there are exit clauses, and whether grounds exist to void the contract (fraud, duress, misrepresentation, mutual mistake). Our AI can help you identify potential grounds, but a contract attorney should assess your specific situation before you take action.' },
                                { q: 'What is an indemnification clause?', a: 'An indemnification clause requires one party to compensate the other for specified losses, damages, or legal costs. They\'re common in vendor agreements and service contracts. Some indemnification clauses are extremely broad — requiring you to cover losses even from the other party\'s own negligence — and should be negotiated before signing.' },
                            ].map(f => (
                                <div key={f.q} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                                    <h3 className="font-bold text-white mb-2">{f.q}</h3>
                                    <p className="text-slate-400 text-sm leading-relaxed">{f.a}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold text-white mb-4">When You Need a Contract Lawyer</h2>
                        <p className="text-slate-400 leading-relaxed mb-4">
                            Our AI assistant provides general guidance and educational information — not legal advice. For these situations, you should consult a contract attorney directly:
                        </p>
                        <ul className="space-y-2 text-slate-400 text-sm">
                            {[
                                'Contracts involving significant sums of money or assets',
                                'Employment agreements, especially with non-compete clauses',
                                'Disputes or threatened litigation',
                                'Contracts with unusual or ambiguous terms',
                                'International contracts with cross-border enforceability questions',
                                'M&A transactions and business acquisition agreements',
                            ].map(i => (
                                <li key={i} className="flex items-start gap-2">
                                    <span className="text-indigo-400 mt-0.5">→</span>{i}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="p-8 bg-indigo-600/5 border border-indigo-500/20 rounded-2xl text-center">
                        <h3 className="text-xl font-bold text-white mb-4">Talk to a Contract Law Specialist</h3>
                        <p className="text-slate-300 mb-8">For complex contract matters, speak with a qualified contract attorney via our platform.</p>
                        <Button onClick={() => window.dispatchEvent(new CustomEvent('nomosdesk-open-demo'))}>Request a Consultation</Button>
                    </div>
                </div>
            </Section>
        </Layout>
    );
}
