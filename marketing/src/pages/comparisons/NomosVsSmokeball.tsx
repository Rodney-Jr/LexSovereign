import React from 'react';
import Layout from '../../layouts/Layout';
import SEO from '../../components/SEO';
import { Section, Button } from '../../components/ui';
import { Link } from '../../utils/ssr-compat';

const COMPARISON = [
    { category: 'Matter Management', nomos: 'AI-powered sovereign vault', smokeball: 'Document-centric, AU/UK/US' },
    { category: 'AI Capabilities', nomos: 'Native sovereign AI engine', smokeball: 'Limited AI, productivity focus' },
    { category: 'Data Sovereignty', nomos: 'Sovereign Enclave — any jurisdiction', smokeball: 'Regional cloud (AU/UK/US only)' },
    { category: 'Client Intake', nomos: 'AI chatbot + CRM unified', smokeball: 'Basic client intake forms' },
    { category: 'Email Integration', nomos: 'Full email-to-matter filing', smokeball: 'Strong Outlook integration' },
    { category: 'Government Support', nomos: 'Full sovereign deployment', smokeball: 'Not designed for government' },
    { category: 'International Markets', nomos: 'Global, multi-jurisdiction', smokeball: 'AU, UK, US only' },
    { category: 'Billing', nomos: 'Integrated AI time capture + invoicing', smokeball: 'Built-in billing, time tracking' },
];

export default function NomosVsSmokeball() {
    return (
        <Layout>
            <SEO
                title="NomosDesk vs Smokeball 2026 | Best Smokeball Alternative"
                description="NomosDesk vs Smokeball comparison for 2026. See how NomosDesk's sovereign AI and global deployment compares to Smokeball's document-centric legal software."
                schema={[{
                    '@context': 'https://schema.org',
                    '@type': 'Article',
                    headline: 'NomosDesk vs Smokeball 2026 — Side-by-Side Comparison',
                    author: { '@type': 'Organization', name: 'NomosDesk' },
                    publisher: { '@type': 'Organization', name: 'NomosDesk', url: 'https://nomosdesk.com' },
                    datePublished: '2026-02-21',
                    keywords: 'smokeball alternative, nomosdesk vs smokeball, smokeball competitor, smokeball replacement'
                }]}
            />

            <Section className="pt-32 pb-12 bg-slate-950">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <p className="text-sm text-slate-500 uppercase tracking-widest mb-4">Feature Comparison</p>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">NomosDesk vs Smokeball</h1>
                    <p className="text-xl text-slate-300 mb-8 leading-relaxed">
                        Evaluating <strong className="text-white">Smokeball alternatives</strong>? Here's a complete breakdown of how NomosDesk compares on AI, data sovereignty, global support, and integrated client intake.
                    </p>
                </div>
            </Section>

            <Section className="pb-24 bg-slate-950">
                <div className="max-w-4xl mx-auto px-4 space-y-16">

                    <div>
                        <h2 className="text-2xl font-bold text-white mb-6">Head-to-Head Comparison</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-slate-800">
                                        <th className="text-left py-3 px-4 text-slate-400 text-xs font-bold uppercase tracking-widest">Feature</th>
                                        <th className="text-left py-3 px-4 text-indigo-400 text-xs font-bold uppercase tracking-widest">NomosDesk</th>
                                        <th className="text-left py-3 px-4 text-slate-500 text-xs font-bold uppercase tracking-widest">Smokeball</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/50">
                                    {COMPARISON.map(row => (
                                        <tr key={row.category}>
                                            <td className="py-4 px-4 text-slate-400 text-sm font-medium">{row.category}</td>
                                            <td className="py-4 px-4 text-white text-sm">{row.nomos}</td>
                                            <td className="py-4 px-4 text-slate-500 text-sm">{row.smokeball}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold text-white mb-4">About Smokeball</h2>
                        <p className="text-slate-400 leading-relaxed mb-4">
                            Smokeball is a legal practice management platform popular with small-to-mid-size law firms in Australia, the UK, and the US. Its standout feature is automatic time capture — recording all time spent in documents, emails, and applications without manual entry. It's particularly strong for high-volume, document-intensive practices like conveyancing and residential real estate law.
                        </p>
                        <p className="text-slate-400 leading-relaxed">
                            Smokeball operates on regional cloud infrastructure (with data residency available in AU, UK, and US). It offers solid billing, document management, and workflow automation for its target markets — but lacks native AI capabilities, sovereign deployment options, and support for markets outside its three core geographies.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold text-white mb-4">Why Firms Look Beyond Smokeball</h2>
                        <div className="space-y-4">
                            {[
                                { title: 'AI Capability Gap', body: 'Smokeball\'s AI features are limited and not natively integrated. NomosDesk includes a sovereign AI engine for contract review, document drafting, client intake, and matter intelligence — running entirely within your infrastructure.' },
                                { title: 'Geographic Limitations', body: 'Smokeball serves AU, UK, and US markets. Firms operating in Africa, the Middle East, Asia, or other jurisdictions find the platform\'s templates, billing formats, and workflow logic don\'t align with local legal practice.' },
                                { title: 'Client Intake & CRM', body: 'Smokeball\'s intake capabilities are basic compared to NomosDesk\'s AI-powered chatbot intake and integrated CRM, which qualify leads before they reach an attorney\'s desk.' },
                                { title: 'Enterprise & Government Scale', body: 'Smokeball is designed for small-to-mid law firms. NomosDesk handles enterprise legal departments and government agencies with multi-department access control, executive dashboards, and sovereign deployment.' },
                            ].map(r => (
                                <div key={r.title} className="p-5 bg-slate-900 border border-slate-800 rounded-2xl">
                                    <h3 className="font-bold text-white text-sm mb-2">{r.title}</h3>
                                    <p className="text-slate-400 text-sm leading-relaxed">{r.body}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold text-white mb-4">When Smokeball Is a Good Fit</h2>
                        <p className="text-slate-400 leading-relaxed">
                            Smokeball excels for conveyancing practices, residential property firms, and high-document-volume small law firms in Australia, UK, or US. If your firm operates in these markets, focuses on high-volume document-intensive work, and values automatic time capture above AI or international capability — Smokeball is worth evaluating. For everything else, compare <Link to="/legal-practice-management-software" className="text-indigo-400 hover:text-indigo-300">NomosDesk's full platform capabilities</Link> or review our <Link to="/vs/nomosdesk-vs-clio" className="text-indigo-400 hover:text-indigo-300">other comparisons</Link>.
                        </p>
                    </div>

                    <div className="p-8 bg-indigo-600/5 border border-indigo-500/20 rounded-2xl text-center">
                        <h3 className="text-xl font-bold text-white mb-4">Ready to Evaluate Your Options?</h3>
                        <p className="text-slate-300 mb-8">See NomosDesk side by side with Smokeball in a live demo tailored to your firm's workflow.</p>
                        <Button onClick={() => window.dispatchEvent(new CustomEvent('nomosdesk-open-demo'))}>Book a Free Demo</Button>
                    </div>
                </div>
            </Section>
        </Layout>
    );
}
