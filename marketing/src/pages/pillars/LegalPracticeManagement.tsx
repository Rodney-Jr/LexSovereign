import React from 'react';
import Layout from '../../layouts/Layout';
import SEO from '../../components/SEO';
import { Section, Button } from '../../components/ui';
import { Shield, Users, Briefcase, Globe, CheckCircle, ArrowRight, Lock, Zap } from 'lucide-react';
import { Link } from '../../utils/ssr-compat';

export default function LegalPracticeManagement() {
    return (
        <Layout>
            <SEO
                title="Legal Practice Management Software: 2026 Institutional Guide"
                description="The complete guide to legal practice management for law firms and governments. Learn about conflict checking, governance, and secure matter management."
                schema={[
                    {
                        "@context": "https://schema.org",
                        "@type": "SoftwareApplication",
                        "name": "NomosDesk",
                        "applicationCategory": "BusinessApplication",
                        "operatingSystem": "Web-based",
                        "description": "Enterprise legal practice management and governance platform."
                    },
                    {
                        "@context": "https://schema.org",
                        "@type": "FAQPage",
                        "mainEntity": [
                            {
                                "@type": "Question",
                                "name": "What is Legal Practice Management Software?",
                                "acceptedAnswer": {
                                    "@type": "Answer",
                                    "text": "Legal practice management software (LPM) is a centralized platform that helps law firms and legal departments manage their matters, documents, billing, and scheduling in a secure environment."
                                }
                            }
                        ]
                    }
                ]}
            />

            {/* Hero Section */}
            <Section className="pt-32 pb-20 relative overflow-hidden bg-slate-950">
                <div className="absolute inset-0 bg-indigo-500/5 blur-[120px] rounded-full -top-24 -left-24" />
                <div className="max-w-5xl mx-auto relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-medium mb-6">
                        <Lock className="w-4 h-4" /> 2026 Strategic Guide
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 leading-tight tracking-tight">
                        Legal Practice Management: <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-indigo-200">
                            The Institutional Standard
                        </span>
                    </h1>
                    <p className="text-xl text-slate-300 leading-relaxed max-w-3xl mb-12">
                        In an era of increasing professional risk and jurisdictional complexity, traditional billing tools are no longer enough. Modern legal institutions require specialized governance, unalterable audit trails, and automated conflict prevention.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 mb-20">
                        <Button size="lg" onClick={() => window.dispatchEvent(new CustomEvent('nomosdesk-open-demo'))}>
                            Request Private Demo
                        </Button>
                        <Button asLink="/pricing" variant="outline" size="lg">
                            View Pricing Models
                        </Button>
                    </div>
                </div>
            </Section>

            {/* Core Benefits */}
            <Section darker className="py-24">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Why Modern Law Firms Choose NomosDesk</h2>
                        <p className="text-slate-400 max-w-2xl mx-auto">Moving beyond basic LPM functionality to institutional-grade governance.</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="bg-slate-900/50 p-8 rounded-2xl border border-slate-800 hover:border-indigo-500/30 transition-all group">
                            <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400 mb-6 group-hover:scale-110 transition-transform">
                                <Shield className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-4">Conflict Prevention</h3>
                            <p className="text-slate-400 leading-relaxed mb-6">
                                Automated "Mandatory Search" workflows ensure every party and adverse party is checked against your firm's entire history before a matter can be opened.
                            </p>
                            <Link to="/insights/conflict-checking-software-law-firms" className="text-indigo-400 text-sm font-semibold flex items-center gap-2 hover:gap-3 transition-all">
                                Learn about conflict checking <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                        <div className="bg-slate-900/50 p-8 rounded-2xl border border-slate-800 hover:border-indigo-500/30 transition-all group">
                            <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400 mb-6 group-hover:scale-110 transition-transform">
                                <Lock className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-4">Data Sovereignty</h3>
                            <p className="text-slate-400 leading-relaxed mb-6">
                                Physical data segregation and regional residency options allow your institution to meet strict localization requirements in Kenya, Nigeria, and South Africa.
                            </p>
                            <Link to="/insights/sovereign-legal-data-infrastructure" className="text-emerald-400 text-sm font-semibold flex items-center gap-2 hover:gap-3 transition-all">
                                Explore data sovereignty <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                        <div className="bg-slate-900/50 p-8 rounded-2xl border border-slate-800 hover:border-indigo-500/30 transition-all group">
                            <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400 mb-6 group-hover:scale-110 transition-transform">
                                <Users className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-4">Role-Based Governance</h3>
                            <p className="text-slate-400 leading-relaxed mb-6">
                                Enforce clear hierarchies with pre-configured roles for Partners, Associates, and General Counsel. Strictly control visibility and approval thresholds.
                            </p>
                            <Link to="/security-and-compliance" className="text-blue-400 text-sm font-semibold flex items-center gap-2 hover:gap-3 transition-all">
                                View governance model <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            </Section>

            {/* Comparison Table Section */}
            <Section className="py-24 bg-slate-950">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-white mb-4">NomosDesk vs. Traditional LPM Tools</h2>
                        <p className="text-slate-400">Comparing essential features for institutional legal operations.</p>
                    </div>
                    <div className="overflow-x-auto rounded-2xl border border-slate-800">
                        <table className="w-full text-left border-collapse bg-slate-900/40">
                            <thead>
                                <tr className="border-b border-slate-800 bg-slate-900/60">
                                    <th className="p-6 font-bold text-white">Feature</th>
                                    <th className="p-6 font-bold text-indigo-400">NomosDesk</th>
                                    <th className="p-6 font-bold text-slate-400">Standard LPM</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                <tr>
                                    <td className="p-6 text-white font-medium">Conflict Workflow</td>
                                    <td className="p-6 text-indigo-300">Mandatory / Automated</td>
                                    <td className="p-6 text-slate-500">Optional / Manual</td>
                                </tr>
                                <tr>
                                    <td className="p-6 text-white font-medium">Data Residency</td>
                                    <td className="p-6 text-indigo-300">Local (NG, KE, ZA)</td>
                                    <td className="p-6 text-slate-500">Global Cloud (US/EU)</td>
                                </tr>
                                <tr>
                                    <td className="p-6 text-white font-medium">Audit Trails</td>
                                    <td className="p-6 text-indigo-300">Unalterable / Cryptographic</td>
                                    <td className="p-6 text-slate-500">Standard DB Logs</td>
                                </tr>
                                <tr>
                                    <td className="p-6 text-white font-medium">Departmental Firewalls</td>
                                    <td className="p-6 text-indigo-300">Native Support</td>
                                    <td className="p-6 text-slate-500">Add-on / Workaround</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </Section>

            {/* Deep Dive Content sections */}
            <Section className="py-12 bg-slate-950">
                <div className="max-w-4xl mx-auto prose prose-invert">
                    <h2 className="text-white text-3xl font-bold mb-6">What is Legal Practice Management Software?</h2>
                    <p className="text-slate-300 text-lg leading-relaxed mb-8">
                        Legal practice management software, commonly referred to as LPM, is the central nervous system of a modern law firm. It serves as a unified suite of tools designed to manage matter lifecycles, maintain client databases, track billable time, and store sensitive documentation. However, in 2026, the definition of "management" has expanded to include comprehensive governance and risk mitigation.
                    </p>

                    <h3 className="text-white text-2xl font-bold mb-4">The Evolution of the Practice Operating System</h3>
                    <p className="text-slate-300 text-lg leading-relaxed mb-8">
                        The earliest versions of legal software were essentially digital file cabinets combined with simple billing calculators. Today, an Institutional Practice Operating System like NomosDesk acts as a protective layer for the firm's partners. By enforcing mandatory search behaviors and cryptographically securing audit trails, the software ensures that professional responsibility is built into the workflow rather than being an afterthought.
                    </p>

                    <h2 className="text-white text-3xl font-bold mb-6">Critical Features for Enterprise and Government</h2>
                    <p className="text-slate-300 text-lg leading-relaxed mb-8">
                        Large scales bring unique challenges. For government ministries and multinational enterprises, basic case tracking isn't enough. They require:
                    </p>
                    <ul className="grid md:grid-cols-2 gap-4 list-none p-0 mb-12">
                        <li className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex gap-3 items-start">
                            <CheckCircle className="w-5 h-5 text-indigo-500 shrink-0 mt-1" />
                            <span className="text-slate-300 text-sm">Firewalls to prevent cross-departmental data leakage.</span>
                        </li>
                        <li className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex gap-3 items-start">
                            <CheckCircle className="w-5 h-5 text-indigo-500 shrink-0 mt-1" />
                            <span className="text-slate-300 text-sm">Centralized visibility for General Counsel with decentralized execution for legal teams.</span>
                        </li>
                        <li className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex gap-3 items-start">
                            <CheckCircle className="w-5 h-5 text-indigo-500 shrink-0 mt-1" />
                            <span className="text-slate-300 text-sm">Public sector accountability and unalterable judicial records.</span>
                        </li>
                        <li className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex gap-3 items-start">
                            <CheckCircle className="w-5 h-5 text-indigo-500 shrink-0 mt-1" />
                            <span className="text-slate-300 text-sm">ISO 27001 and local DP Act compliance as a default state.</span>
                        </li>
                    </ul>
                </div>
            </Section>

            {/* Internal Linking Cluster */}
            <Section darker className="py-20">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-2xl font-bold text-white mb-8 border-l-4 border-indigo-500 pl-4">Related Insights & Resources</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <Link to="/insights/legal-software-africa-guide" className="p-6 bg-slate-950 rounded-xl border border-slate-800 hover:border-indigo-500/40 transition-all">
                            <h4 className="text-white font-bold text-sm mb-2">Legal Software Africa Guide</h4>
                            <p className="text-slate-500 text-xs leading-relaxed">Jurisdiction-specific guide for firms in Kenya and Nigeria.</p>
                        </Link>
                        <Link to="/ai-for-law-firms" className="p-6 bg-slate-950 rounded-xl border border-slate-800 hover:border-indigo-500/40 transition-all">
                            <h4 className="text-white font-bold text-sm mb-2">AI for Law Firms</h4>
                            <p className="text-slate-500 text-xs leading-relaxed">Understanding ROI and AI implementation lifecycles.</p>
                        </Link>
                        <Link to="/pricing" className="p-6 bg-slate-950 rounded-xl border border-slate-800 hover:border-indigo-500/40 transition-all">
                            <h4 className="text-white font-bold text-sm mb-2">Pricing & ROI</h4>
                            <p className="text-slate-500 text-xs leading-relaxed">Start with professional-grade tools today.</p>
                        </Link>
                        <Link to="/vs/nomosdesk-vs-clio" className="p-6 bg-slate-950 rounded-xl border border-slate-800 hover:border-indigo-500/40 transition-all">
                            <h4 className="text-white font-bold text-sm mb-2">NomosDesk vs Clio</h4>
                            <p className="text-slate-500 text-xs leading-relaxed">A detailed institutional comparison.</p>
                        </Link>
                    </div>
                </div>
            </Section>

            {/* FAQ Summary */}
            <Section className="py-20 bg-slate-950">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-3xl font-bold text-white mb-10 text-center">Frequently Asked Questions</h2>
                    <div className="space-y-6">
                        <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl">
                            <h4 className="text-white font-bold mb-2">How long does implementation take?</h4>
                            <p className="text-slate-400">Our onboarding team typically manages full data migrations within 2-4 weeks, depending on the complexity of your current data silos.</p>
                        </div>
                        <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl">
                            <h4 className="text-white font-bold mb-2">Is the platform ISO 27001 aligned?</h4>
                            <p className="text-slate-400">Yes, NomosDesk is designed from the architecture level to meet and exceed ISO 27001 security standards, including physical data residency options.</p>
                        </div>
                    </div>
                </div>
            </Section>

            {/* Bottom CTA */}
            <Section className="py-24 bg-indigo-950/20 border-y border-indigo-900/30">
                <div className="max-w-4xl mx-auto text-center">
                    <Zap className="w-12 h-12 text-indigo-400 mx-auto mb-6 animate-pulse" />
                    <h2 className="text-4xl font-bold text-white mb-6 tracking-tight">Ready for Institutional Excellence?</h2>
                    <p className="text-xl text-slate-300 mb-10">Join the firms and government departments transforming their operations with NomosDesk.</p>
                    <div className="flex justify-center gap-4">
                        <Button size="lg" onClick={() => window.dispatchEvent(new CustomEvent('nomosdesk-open-demo'))}>
                            Schedule Demo
                        </Button>
                    </div>
                </div>
            </Section>
        </Layout>
    );
}
