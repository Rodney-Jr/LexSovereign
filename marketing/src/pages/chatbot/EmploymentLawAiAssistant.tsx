import React, { useEffect } from 'react';
import Layout from '../../layouts/Layout';
import SEO from '../../components/SEO';
import { Section, Button } from '../../components/ui';
import { Link } from '../../utils/ssr-compat';
import { Scale, MessageSquare, CheckCircle } from 'lucide-react';

export default function EmploymentLawAiAssistant() {
    useEffect(() => {
        const timer = setTimeout(() => {
            window.dispatchEvent(new CustomEvent('nomosdesk-chatbot-context', {
                detail: { context: 'employment-law', greeting: 'Hello! I can help with employment law questions — whether you\'re an employer or employee. What\'s your situation?' }
            }));
        }, 3000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <Layout>
            <SEO
                title="Employment Law AI Assistant | NomosDesk"
                description="Get instant AI guidance on employment law — unfair dismissal, workplace discrimination, redundancy, employment contracts, and more. Connect with an employment lawyer when needed."
                schema={[{
                    '@context': 'https://schema.org',
                    '@type': 'Service',
                    name: 'Employment Law AI Assistant',
                    provider: { '@type': 'Organization', name: 'NomosDesk', url: 'https://nomosdesk.com' },
                    description: 'AI-powered employment law guidance for employers and employees.',
                    serviceType: 'Legal Services'
                }]}
            />

            <Section className="pt-32 pb-12 bg-slate-950">
                <div className="max-w-3xl mx-auto px-4 text-center">
                    <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 px-4 py-2 rounded-full mb-6">
                        <Scale className="w-4 h-4 text-amber-400" />
                        <span className="text-xs font-bold text-amber-300 uppercase tracking-widest">Employment Law</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Employment Law AI Assistant</h1>
                    <p className="text-xl text-slate-300 mb-8 leading-relaxed">
                        Instant AI guidance on employment law questions for employers and employees — from understanding your rights to identifying when you need specialist legal advice.
                    </p>
                    <Button onClick={() => window.dispatchEvent(new CustomEvent('nomosdesk-chatbot-open'))}>
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Ask an Employment Law Question
                    </Button>
                </div>
            </Section>

            <Section className="pb-24 bg-slate-950">
                <div className="max-w-3xl mx-auto px-4 space-y-16">

                    <div>
                        <h2 className="text-2xl font-bold text-white mb-4">What Our Employment Law AI Can Help With</h2>
                        <div className="grid sm:grid-cols-2 gap-3">
                            {[
                                'Understanding employment contract terms',
                                'Unfair or constructive dismissal guidance',
                                'Workplace discrimination and harassment',
                                'Redundancy process and entitlements',
                                'Non-compete and confidentiality clauses',
                                'Wage and hour disputes',
                                'Maternity, paternity, and parental leave',
                                'Employer disciplinary procedures',
                            ].map(item => (
                                <div key={item} className="flex items-start gap-2 text-sm text-slate-300 bg-slate-900 border border-slate-800 p-4 rounded-xl">
                                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                                    {item}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold text-white mb-4">Common Employment Law Questions</h2>
                        <div className="space-y-4">
                            {[
                                { q: 'What is unfair dismissal?', a: 'Unfair dismissal occurs when an employer terminates an employee without a fair reason or without following a fair procedure. The specific definition and remedies vary by jurisdiction, but generally, an employee who has worked for a certain qualifying period can claim unfair dismissal if the reason was not one of the legally recognised fair reasons (capability, conduct, redundancy, etc.).' },
                                { q: 'Can my employer enforce a non-compete clause?', a: 'Non-compete enforceability varies significantly by jurisdiction. In many places, they must be reasonable in scope (geographic area, duration, and protected activities) to be enforceable. Some jurisdictions (including parts of the US) have greatly restricted non-compete enforcement. An employment attorney can advise on enforceability in your specific jurisdiction.' },
                                { q: 'What counts as workplace discrimination?', a: 'Workplace discrimination occurs when an employee is treated less favourably because of a protected characteristic — typically race, gender, age, disability, religion, sexual orientation, pregnancy, or national origin. Discrimination can be direct (less favourable treatment) or indirect (a neutral policy that disproportionately disadvantages a protected group).' },
                                { q: 'What are my rights during redundancy?', a: 'Redundancy rights vary by jurisdiction but typically include: prior notice or payment in lieu, a redundancy payment based on service length, the right to a fair selection process, and in some jurisdictions the right to be offered alternative employment. Consult our chatbot or an employment lawyer for jurisdiction-specific entitlements.' },
                            ].map(f => (
                                <div key={f.q} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                                    <h3 className="font-bold text-white mb-2">{f.q}</h3>
                                    <p className="text-slate-400 text-sm leading-relaxed">{f.a}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="p-8 bg-indigo-600/5 border border-indigo-500/20 rounded-2xl text-center">
                        <h3 className="text-xl font-bold text-white mb-4">Speak With an Employment Lawyer</h3>
                        <p className="text-slate-300 mb-8">For complex employment disputes, connect with a qualified employment law specialist through our platform.</p>
                        <Button onClick={() => window.dispatchEvent(new CustomEvent('nomosdesk-open-demo'))}>Request a Consultation</Button>
                    </div>
                </div>
            </Section>
        </Layout>
    );
}
