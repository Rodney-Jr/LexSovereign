import React from 'react';
import Layout from '../../layouts/Layout';
import SEO from '../../components/SEO';
import { Section, Button } from '../../components/ui';
import { Link } from '../../utils/ssr-compat';
import { CheckCircle, XCircle } from 'lucide-react';

const COMPARISON = [
    { category: 'Matter Management', nomos: 'AI-powered, sovereign vault', filevine: 'Structured, US-hosted' },
    { category: 'Legal AI Integration', nomos: 'Native sovereign AI engine', filevine: 'Third-party AI add-ons' },
    { category: 'Data Sovereignty', nomos: 'Sovereign Enclave — on-prem/private', filevine: 'US shared cloud only' },
    { category: 'Client Intake / CRM', nomos: 'AI chatbot + CRM unified', filevine: 'Basic intake forms' },
    { category: 'International Support', nomos: 'Multi-jurisdiction, multi-currency', filevine: 'Primarily US-focused' },
    { category: 'Government Deployment', nomos: 'Built for government data sovereignty', filevine: 'Not designed for government' },
    { category: 'Pricing Model', nomos: 'Transparent, usage-based tiers', filevine: 'Complex per-module pricing' },
    { category: 'Document Automation', nomos: 'Built-in AI drafting studio', filevine: 'Template-based only' },
];

export default function NomosVsFilevine() {
    return (
        <Layout>
            <SEO
                title="NomosDesk vs Filevine 2026 | Best Filevine Alternative"
                description="Comparing NomosDesk vs Filevine for law firms in 2026. See why firms choose NomosDesk for sovereign AI, international support, and a unified intake-to-matter platform."
                schema={[{
                    '@context': 'https://schema.org',
                    '@type': 'Article',
                    headline: 'NomosDesk vs Filevine 2026 — Which Is Better for Your Law Firm?',
                    author: { '@type': 'Organization', name: 'NomosDesk' },
                    publisher: { '@type': 'Organization', name: 'NomosDesk', url: 'https://nomosdesk.com' },
                    datePublished: '2026-02-21',
                    keywords: 'filevine alternative, nomosdesk vs filevine, filevine competitor, filevine replacement'
                }]}
            />

            <Section className="pt-32 pb-12 bg-slate-950">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <p className="text-sm text-slate-500 uppercase tracking-widest mb-4">Feature Comparison</p>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">NomosDesk vs Filevine</h1>
                    <p className="text-xl text-slate-300 mb-8 leading-relaxed">
                        Looking for a <strong className="text-white">Filevine alternative</strong>? Here's how NomosDesk compares across the dimensions that matter most to modern law firms: AI capability, data sovereignty, international support, and unified matter management.
                    </p>
                </div>
            </Section>

            <Section className="pb-24 bg-slate-950">
                <div className="max-w-4xl mx-auto px-4 space-y-16">

                    {/* Comparison Table */}
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-6">Head-to-Head Comparison</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-slate-800">
                                        <th className="text-left py-3 px-4 text-slate-400 text-xs font-bold uppercase tracking-widest">Feature</th>
                                        <th className="text-left py-3 px-4 text-indigo-400 text-xs font-bold uppercase tracking-widest">NomosDesk</th>
                                        <th className="text-left py-3 px-4 text-slate-500 text-xs font-bold uppercase tracking-widest">Filevine</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/50">
                                    {COMPARISON.map(row => (
                                        <tr key={row.category}>
                                            <td className="py-4 px-4 text-slate-400 text-sm font-medium">{row.category}</td>
                                            <td className="py-4 px-4 text-white text-sm">{row.nomos}</td>
                                            <td className="py-4 px-4 text-slate-500 text-sm">{row.filevine}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold text-white mb-4">Why Firms Switch From Filevine</h2>
                        <p className="text-slate-400 leading-relaxed mb-4">
                            Filevine is a strong US legal practice management platform — particularly for plaintiff-side personal injury firms. But as law firms internationalise, adopt AI, and face stricter data sovereignty requirements, Filevine's US-only cloud model and limited AI capabilities become significant constraints.
                        </p>
                        <div className="space-y-4">
                            {[
                                { title: 'Data Sovereignty Limitations', body: 'Filevine operates exclusively on US-based shared cloud infrastructure. For international law firms, government legal departments, or firms handling cross-border matters, this creates data residency compliance risks that cannot be resolved within the Filevine architecture.' },
                                { title: 'AI as an Add-On vs. Native AI', body: 'Filevine offers AI features through third-party integrations. NomosDesk\'s AI engine is native and sovereign — running entirely within your firm\'s controlled infrastructure, with no client data sent to external AI APIs.' },
                                { title: 'International Practice Support', body: 'Filevine is optimised for US law practice: US court calendaring, US billing formats, US-centric practise area workflows. Multi-jurisdictional firms find the platform limiting — NomosDesk is built from the ground up for international legal practice.' },
                                { title: 'Unified CRM and Intake', body: 'Filevine\'s client intake capabilities are basic. NomosDesk unifies an AI-powered chatbot intake, full CRM, and matter management in one platform — no stitching together separate tools.' },
                            ].map(r => (
                                <div key={r.title} className="p-5 bg-slate-900 border border-slate-800 rounded-2xl">
                                    <h3 className="font-bold text-white text-sm mb-2">{r.title}</h3>
                                    <p className="text-slate-400 text-sm leading-relaxed">{r.body}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold text-white mb-4">When Filevine Might Be Right</h2>
                        <p className="text-slate-400 leading-relaxed">
                            Filevine is a solid choice for US-based plaintiff-side law firms, particularly personal injury and mass tort practices, that operate exclusively in the US, are comfortable with shared cloud infrastructure, and need strong litigation workflow management. If those requirements match your firm, Filevine is worth evaluating. If you need sovereign data control, international support, or native AI — NomosDesk is the stronger fit. Compare also our <Link to="/vs/nomosdesk-vs-clio" className="text-indigo-400 hover:text-indigo-300">NomosDesk vs Clio</Link> and <Link to="/vs/nomosdesk-vs-mycase" className="text-indigo-400 hover:text-indigo-300">NomosDesk vs MyCase</Link> comparisons.
                        </p>
                    </div>

                    <div className="p-8 bg-indigo-600/5 border border-indigo-500/20 rounded-2xl text-center">
                        <h3 className="text-xl font-bold text-white mb-4">See Why Firms Choose NomosDesk Over Filevine</h3>
                        <p className="text-slate-300 mb-8">Book a live demo and compare the platforms side by side with your actual matter types and workflows.</p>
                        <Button onClick={() => window.dispatchEvent(new CustomEvent('nomosdesk-open-demo'))}>Book a Free Demo</Button>
                    </div>
                </div>
            </Section>
        </Layout>
    );
}
