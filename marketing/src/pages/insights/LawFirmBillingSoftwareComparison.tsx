import React from 'react';
import Layout from '../../layouts/Layout';
import SEO from '../../components/SEO';
import { Section, Button } from '../../components/ui';
import { Link } from '../../utils/ssr-compat';
import { DollarSign, CheckCircle, Clock, Star } from 'lucide-react';

const PLATFORMS = [
    { name: 'NomosDesk', billing: '✓ Integrated', timekeeping: '✓ AI-assisted', invoicing: '✓ Multi-currency', security: '✓ Sovereign Enclave', verdict: 'Best Overall', color: 'indigo' },
    { name: 'Clio', billing: '✓ Integrated', timekeeping: '✓ Standard', invoicing: '✓ Standard', security: '✗ Shared Cloud', verdict: 'Good for Solo', color: 'slate' },
    { name: 'MyCase', billing: '✓ Integrated', timekeeping: '✓ Standard', invoicing: '✓ Standard', security: '✗ Shared Cloud', verdict: 'Mid-Market', color: 'slate' },
    { name: 'TimeSolv', billing: '✓ Dedicated', timekeeping: '✓ Detailed', invoicing: '✓ Flexible', security: '✗ Shared Cloud', verdict: 'Time-Focused', color: 'slate' },
];

export default function LawFirmBillingSoftwareComparison() {
    return (
        <Layout>
            <SEO
                title="Law Firm Billing Software Comparison 2026 | Top 5 Platforms Reviewed"
                description="Compare the best law firm billing software of 2026 — features, pricing, security, and integrations. Find the right legal billing platform for your firm size."
                schema={[
                    {
                        '@context': 'https://schema.org',
                        '@type': 'Article',
                        headline: 'Law Firm Billing Software Comparison 2026',
                        author: { '@type': 'Organization', name: 'NomosDesk' },
                        publisher: { '@type': 'Organization', name: 'NomosDesk', url: 'https://nomosdesk.com' },
                        datePublished: '2026-02-21',
                        keywords: 'law firm billing software, legal billing software, attorney billing software, law firm invoicing, legal time tracking'
                    },
                    {
                        '@context': 'https://schema.org',
                        '@type': 'FAQPage',
                        mainEntity: [
                            { '@type': 'Question', name: 'What is the best billing software for law firms?', acceptedAnswer: { '@type': 'Answer', text: 'The best law firm billing software depends on your firm size and needs. NomosDesk leads for enterprise and government legal teams due to its integrated matter management, AI-assisted time capture, and sovereign security model.' } },
                            { '@type': 'Question', name: 'How much does legal billing software cost?', acceptedAnswer: { '@type': 'Answer', text: 'Legal billing software typically costs between $49–$149 per user per month for cloud platforms. Enterprise platforms with sovereign deployment are priced on request based on seat count and deployment model.' } },
                            { '@type': 'Question', name: 'Does law firm billing software handle trust accounting?', acceptedAnswer: { '@type': 'Answer', text: 'Most leading platforms include IOLTA-compliant trust accounting. NomosDesk includes trust ledger management with full audit trails and automated reconciliation.' } },
                            { '@type': 'Question', name: 'Can billing software integrate with timekeeping?', acceptedAnswer: { '@type': 'Answer', text: 'Yes — the best platforms include integrated timekeeping that automatically creates billable time entries from calendar events, emails, and document activity. NomosDesk also offers AI-assisted time narration to improve time entry quality.' } }
                        ]
                    }
                ]}
            />

            <Section className="pt-32 pb-12 bg-slate-950">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 px-4 py-2 rounded-full mb-6">
                        <DollarSign className="w-4 h-4 text-amber-400" />
                        <span className="text-xs font-bold text-amber-300 uppercase tracking-widest">Billing Software</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Law Firm Billing Software: 2026 Comparison</h1>
                    <p className="text-xl text-slate-300 mb-8 leading-relaxed">
                        The right <strong className="text-white">law firm billing software</strong> captures more billable time, accelerates invoice cycles, and eliminates write-offs caused by manual time entry errors. Here's how the top platforms compare in 2026.
                    </p>
                </div>
            </Section>

            <Section className="pb-24 bg-slate-950">
                <div className="max-w-4xl mx-auto px-4 space-y-16">

                    <div>
                        <h2 className="text-2xl font-bold text-white mb-4">Why Your Billing Software Matters More Than You Think</h2>
                        <p className="text-slate-400 leading-relaxed mb-4">
                            Law firms lose an average of 15–20% of billable time due to poor time capture hygiene. Attorneys forget to log calls, underestimate time spent on research, and write off entries they're not confident defending. <strong className="text-white">Legal billing software</strong> with integrated timekeeping, AI-assisted entry, and automatic activity capture closes most of this gap automatically.
                        </p>
                        <p className="text-slate-400 leading-relaxed">
                            Beyond time capture, the right platform accelerates your invoice cycle. Firms that invoice within 7 days of matter activity collect twice as fast as those invoicing monthly. Billing software with automated invoice generation, online payment portals, and payment reminders dramatically improves realisation rates. See how billing integrates with our broader <Link to="/legal-practice-management-software" className="text-indigo-400 hover:text-indigo-300">legal practice management software</Link>.
                        </p>
                    </div>

                    {/* Comparison Table */}
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-6">Platform Comparison: 2026</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-slate-800">
                                        <th className="text-left py-3 px-4 text-slate-400 font-bold text-xs uppercase tracking-widest">Platform</th>
                                        <th className="text-left py-3 px-4 text-slate-400 font-bold text-xs uppercase tracking-widest">Billing</th>
                                        <th className="text-left py-3 px-4 text-slate-400 font-bold text-xs uppercase tracking-widest">Timekeeping</th>
                                        <th className="text-left py-3 px-4 text-slate-400 font-bold text-xs uppercase tracking-widest">Invoicing</th>
                                        <th className="text-left py-3 px-4 text-slate-400 font-bold text-xs uppercase tracking-widest">Security</th>
                                        <th className="text-left py-3 px-4 text-slate-400 font-bold text-xs uppercase tracking-widest">Best For</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/50">
                                    {PLATFORMS.map(p => (
                                        <tr key={p.name} className={`${p.color === 'indigo' ? 'bg-indigo-500/5' : ''}`}>
                                            <td className="py-4 px-4 font-bold text-white">{p.name}</td>
                                            <td className="py-4 px-4 text-slate-300">{p.billing}</td>
                                            <td className="py-4 px-4 text-slate-300">{p.timekeeping}</td>
                                            <td className="py-4 px-4 text-slate-300">{p.invoicing}</td>
                                            <td className="py-4 px-4 text-slate-300">{p.security}</td>
                                            <td className="py-4 px-4"><span className={`text-xs font-bold px-2 py-1 rounded-full ${p.color === 'indigo' ? 'bg-indigo-500/20 text-indigo-300' : 'bg-slate-800 text-slate-400'}`}>{p.verdict}</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold text-white mb-4">Key Features to Evaluate</h2>
                        <p className="text-slate-400 leading-relaxed mb-6">
                            When shortlisting <strong className="text-white">attorney billing software</strong>, evaluate these dimensions beyond just price per seat:
                        </p>
                        <div className="space-y-3">
                            {[
                                { title: 'Automatic Time Capture', desc: 'Does the platform capture time from email threads, document activity, and calendar entries automatically — or does it rely entirely on manual entry?' },
                                { title: 'AI Time Narration', desc: 'Can the AI generate professional, bill-ready time entry descriptions from raw activity logs, saving attorneys from writing narrative descriptions?' },
                                { title: 'LEDES Export', desc: 'Enterprise legal teams and corporate clients often require LEDES billing format. Confirm the platform supports LEDES 98B or LEDES 2000.' },
                                { title: 'Trust Accounting (IOLTA)', desc: 'Does the platform handle trust ledger management and 3-way reconciliation in compliance with your bar association rules?' },
                                { title: 'Multi-Currency Invoicing', desc: 'For international firms, multi-currency invoicing with automatic FX rate application is essential.' },
                                { title: 'Contingency Fee Tracking', desc: 'Personal injury and plaintiff-side firms need contingency case tracking alongside hourly billing.' },
                            ].map(f => (
                                <div key={f.title} className="flex gap-4 p-4 bg-slate-900 border border-slate-800 rounded-xl">
                                    <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                                    <div>
                                        <span className="font-bold text-white text-sm">{f.title}: </span>
                                        <span className="text-slate-400 text-sm">{f.desc}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold text-white mb-4">NomosDesk: Integrated Billing + Matter Management</h2>
                        <p className="text-slate-400 leading-relaxed mb-4">
                            NomosDesk's <strong className="text-white">legal billing software</strong> is not a standalone billing tool — it's fully integrated within the Sovereign Vault matter workspace. Every time entry, invoice, and payment is linked to the specific matter and client record. This eliminates the reconciliation overhead that standalone billing tools impose on your accounts team.
                        </p>
                        <p className="text-slate-400 leading-relaxed">
                            The AI narration feature automatically converts raw time logs (e.g., "reviewed docs, called client") into professional, detailed billing descriptions that stand up to client scrutiny — improving write-off rates and reducing invoice disputes. Combined with our <Link to="/law-firm-crm-software" className="text-indigo-400 hover:text-indigo-300">law firm CRM</Link>, billing history is always visible in the client relationship context.
                        </p>
                    </div>

                    {/* FAQ */}
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-8">Frequently Asked Questions</h2>
                        <div className="space-y-4">
                            {[
                                { q: 'What is the best billing software for law firms?', a: 'The best law firm billing software depends on your firm size and needs. NomosDesk leads for enterprise and government legal teams due to its integrated matter management, AI-assisted time capture, and sovereign security model.' },
                                { q: 'How much does legal billing software cost?', a: 'Legal billing software typically costs between $49–$149 per user per month for cloud platforms. Enterprise platforms with sovereign deployment are priced on request based on seat count and deployment model.' },
                                { q: 'Does law firm billing software handle trust accounting?', a: 'Most leading platforms include IOLTA-compliant trust accounting. NomosDesk includes trust ledger management with full audit trails and automated reconciliation.' },
                                { q: 'Can billing software integrate with timekeeping?', a: 'Yes — the best platforms include integrated timekeeping that automatically creates billable time entries from calendar events, emails, and document activity. NomosDesk also offers AI-assisted time narration to improve time entry quality.' },
                            ].map(f => (
                                <div key={f.q} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                                    <h3 className="font-bold text-white mb-2">{f.q}</h3>
                                    <p className="text-slate-400 text-sm leading-relaxed">{f.a}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="p-8 bg-indigo-600/5 border border-indigo-500/20 rounded-2xl text-center">
                        <h3 className="text-xl font-bold text-white mb-4">See NomosDesk Billing in Action</h3>
                        <p className="text-slate-300 mb-8">Live demo: from time capture to paid invoice in under 10 minutes. See how AI narration transforms your billing workflow.</p>
                        <Button onClick={() => window.dispatchEvent(new CustomEvent('nomosdesk-open-demo'))}>
                            Book a Free Demo
                        </Button>
                    </div>
                </div>
            </Section>
        </Layout>
    );
}
