import React from 'react';
import Layout from '../../layouts/Layout';
import SEO from '../../components/SEO';
import { Section, Button } from '../../components/ui';
import { Shield, Lock, Zap, CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import { Link } from '../../utils/ssr-compat';

export default function NomosVsClioComparison() {
    const comparisonData = [
        { f: "Data Residency (Kenya, Nigeria, SA)", n: true, c: false },
        { f: "Mandatory Conflict Workflow", n: true, c: false },
        { f: "Departmental Firewalls", n: true, c: false },
        { f: "In-Chat AI Intake Assistant", n: true, c: "Add-on required" },
        { f: "Sovereign Audit Trails", n: true, c: false },
        { f: "Enterprise Matter Portals", n: true, c: true },
        { f: "Cloud Accessibility", n: true, c: true }
    ];

    return (
        <Layout>
            <SEO
                title="NomosDesk vs Clio: The 2026 Institutional Comparison"
                description="Choosing between NomosDesk and Clio? Compare data sovereignty, governance, AI intake, and security for law firms and governments."
                schema={[
                    {
                        "@context": "https://schema.org",
                        "@type": "SoftwareApplication",
                        "name": "NomosDesk",
                        "applicationCategory": "BusinessApplication",
                        "operatingSystem": "Web-based",
                        "description": "Enterprise legal practice management and governance platform."
                    }
                ]}
            />

            {/* Hero Section */}
            <Section className="pt-32 pb-20 relative overflow-hidden bg-slate-950">
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 blur-[100px] rounded-full -mr-48 -mt-48" />
                <div className="max-w-5xl mx-auto relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-500/10 border border-slate-500/20 text-slate-300 text-sm font-medium mb-6">
                        NomosDesk vs. Clio
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 leading-tight tracking-tight">
                        Built for Governance, <br />
                        <span className="text-indigo-400">Not Just Billing.</span>
                    </h1>
                    <p className="text-xl text-slate-300 leading-relaxed max-w-3xl mb-12">
                        Clio is a pioneer in cloud LPM. But for institutions requiring physical data sovereignty, mandatory conflict enforcement, and departmental firewalls, a different architecture is required.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 mb-20">
                        <Button size="lg" onClick={() => window.dispatchEvent(new CustomEvent('nomosdesk-open-demo'))}>
                            Request Comparison Guide
                        </Button>
                        <Button asLink="/pricing" variant="outline" size="lg">
                            Compare Pricing
                        </Button>
                    </div>
                </div>
            </Section>

            {/* Feature Comparison Table */}
            <Section darker className="py-24">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Functional Head-to-Head</h2>
                        <p className="text-slate-400">Comparing essential features for institutional legal operations.</p>
                    </div>
                    <div className="overflow-x-auto rounded-3xl border border-slate-800 bg-slate-900/40">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-800 bg-slate-900/60">
                                    <th className="p-8 font-bold text-white">Capability</th>
                                    <th className="p-8 font-bold text-indigo-400">NomosDesk</th>
                                    <th className="p-8 font-bold text-slate-400">Clio</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {comparisonData.map((row, i) => (
                                    <tr key={i} className="hover:bg-slate-800/30 transition-colors">
                                        <td className="p-8 text-white font-medium">{row.f}</td>
                                        <td className="p-8">
                                            {typeof row.n === 'boolean' ? (
                                                row.n ? <CheckCircle className="w-6 h-6 text-emerald-500" /> : <XCircle className="w-6 h-6 text-red-500/50" />
                                            ) : <span className="text-indigo-300 text-sm font-bold">{row.n}</span>}
                                        </td>
                                        <td className="p-8">
                                            {typeof row.c === 'boolean' ? (
                                                row.c ? <CheckCircle className="w-6 h-6 text-emerald-500" /> : <XCircle className="w-6 h-6 text-red-500/50" />
                                            ) : <span className="text-slate-500 text-sm">{row.c}</span>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </Section>

            {/* Comparison Content */}
            <Section className="py-24 bg-slate-950">
                <div className="max-w-4xl mx-auto prose prose-invert">
                    <h2 className="text-white text-3xl font-bold mb-6">Why Institutions Move from Clio to NomosDesk</h2>
                    <p className="text-slate-300 text-lg leading-relaxed mb-8">
                        Clio has built an incredible platform for solo and small practices. However, as firms scale into regional powerhouses or support government ministries, the requirements change. NomosDesk was built from the ground up for **Professional Governance**.
                    </p>

                    <h3 className="text-white text-2xl font-bold mb-4">1. Data Sovereignty & Localization</h3>
                    <p className="text-slate-300 text-lg leading-relaxed mb-8">
                        For firms in Kenya, Nigeria, or South Africa, data residency is no longer "nice to have"—it is often a legal requirement. Unlike Clio, which primarily hosts data in North American and European cloud zones, NomosDesk offers local residency options, ensuring your data never leaves your jurisdiction.
                    </p>

                    <h3 className="text-white text-2xl font-bold mb-4">2. Enforced Conflict Prevention</h3>
                    <p className="text-slate-300 text-lg leading-relaxed mb-8">
                        In Clio, conflict checking is often a manual, optional step. In NomosDesk, it is a **Mandatory Barrier**. An associate cannot activate a matter without the system performing an AI-powered search against the firm's global entity index and adverse party records.
                    </p>

                    <h3 className="text-white text-2xl font-bold mb-4">3. AI-Powered Intake Integration</h3>
                    <p className="text-slate-300 text-lg leading-relaxed mb-8">
                        While Clio offers third-party integrations for intake, NomosDesk includes a native **AI Intake Assistant**. This chatbot lives on your website, qualifies leads 24/7, performs preliminary conflict checks, and pushes data directly into your CRM—all within the same secure environment.
                    </p>
                </div>
            </Section>

            {/* Bottom CTA */}
            <Section className="py-24 bg-indigo-950/20 border-y border-indigo-900/40 text-center">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-4xl font-bold text-white mb-6">Ready to Upgrade from Clio?</h2>
                    <p className="text-xl text-slate-300 mb-10">We manage 100% of the data migration for Clio users. Move your practice to a platform built for institutional governance.</p>
                    <div className="flex justify-center gap-4">
                        <Button size="lg" onClick={() => window.dispatchEvent(new CustomEvent('nomosdesk-open-demo'))}>
                            Request Migration Audit
                        </Button>
                    </div>
                </div>
            </Section>
        </Layout>
    );
}
