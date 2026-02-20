import React from 'react';
import Layout from '../../layouts/Layout';
import SEO from '../../components/SEO';
import { Section, Button } from '../../components/ui';
import { Shield, Lock, Zap, ArrowRight, CheckCircle, XCircle, Users, LayoutDashboard, Database } from 'lucide-react';
import { Link } from '../../utils/ssr-compat';

export default function NomosVsPracticePanther() {
    return (
        <Layout>
            <SEO
                title="NomosDesk vs PracticePanther: Advanced Legal Governance 2026"
                description="Compare NomosDesk and PracticePanther for departmental firewalls, sovereign audit trails, and complex institutional matter management."
            />

            {/* Hero Section */}
            <Section className="pt-32 pb-20 relative overflow-hidden bg-slate-950">
                <div className="absolute inset-0 bg-blue-500/5 blur-[120px] rounded-full top-0 left-0" />
                <div className="max-w-5xl mx-auto relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-500/10 border border-slate-500/20 text-slate-300 text-sm font-medium mb-6">
                        NomosDesk vs. PracticePanther
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 leading-tight tracking-tight">
                        Complex Governance. <br />
                        <span className="text-blue-400">Simplified Execution.</span>
                    </h1>
                    <p className="text-xl text-slate-300 leading-relaxed max-w-3xl mb-12">
                        PracticePanther offers ease of use for general practitioners. NomosDesk offers specialized controls for institutions where data segregation and unalterable audit records are non-negotiable.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 mb-20">
                        <Button size="lg" onClick={() => window.dispatchEvent(new CustomEvent('nomosdesk-open-demo'))}>
                            Request Governance Audit
                        </Button>
                        <Button asLink="/pricing" variant="outline" size="lg">
                            View Pricing
                        </Button>
                    </div>
                </div>
            </Section>

            {/* Feature Comparison Table */}
            <Section darker className="py-24">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-3xl font-bold text-white mb-12 text-center">Institutional Feature Comparison</h2>
                    <div className="overflow-x-auto rounded-3xl border border-slate-800 bg-slate-900/40">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-800 bg-slate-900/60">
                                    <th className="p-8 font-bold text-white">Institutional Requirement</th>
                                    <th className="p-8 font-bold text-indigo-400">NomosDesk</th>
                                    <th className="p-8 font-bold text-slate-400">PracticePanther</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {[
                                    { f: "Departmental Data Separation", n: true, c: false },
                                    { f: "Mandatory Workflow Conflict Checks", n: true, c: false },
                                    { f: "Cryptographic Audit Trails", n: true, c: false },
                                    { f: "Regional Hosting (Africa/ME)", n: true, c: false },
                                    { f: "Native AI Intake Engine", n: true, c: "Basic Zapier automation" },
                                    { f: "Unalterable Record Locking", n: true, c: false }
                                ].map((row, i) => (
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

            {/* Deep Content Section */}
            <Section className="py-24 bg-slate-950">
                <div className="max-w-4xl mx-auto prose prose-invert">
                    <h2 className="text-white text-3xl font-bold mb-6">Why PracticePanther Users Upgrade to NomosDesk</h2>
                    <p className="text-slate-300 text-lg leading-relaxed mb-8">
                        PracticePanther is popular for its intuitive design and all-in-one approach for small firms. However, larger organizations and government departments often find that the lack of rigorous data separation and regional compliance becomes a blocker. NomosDesk provides the **Governance Layer** that scaling institutions need.
                    </p>

                    <h3 className="text-white text-2xl font-bold mb-4">Departmental Firewalls</h3>
                    <p className="text-slate-300 text-lg leading-relaxed mb-8">
                        For institutional law firms, managing separate offices or departments (Investigation, Prosecution, Corporate) within one system is a major security challenge. NomosDesk's native **Silo Architecture** allows you to enforce total data segregation between departments while maintaining global administrative oversight—a feature absent in the flat permission models of PracticePanther.
                    </p>

                    <h3 className="text-white text-2xl font-bold mb-4">Unalterable Judicial Recrods</h3>
                    <p className="text-slate-300 text-lg leading-relaxed mb-8">
                        In government legal departments, the integrity of the record is paramount. NomosDesk ensures that once a matter record or audit entry is final, it is cryptographically locked. This prevents the "silent deletions" or unintended edits that can occur in standard database-driven legal tools like PracticePanther.
                    </p>
                </div>
            </Section>

            {/* Value Highlights */}
            <Section darker className="py-24">
                <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 text-left">
                    <div className="p-8 bg-slate-900 border border-slate-800 rounded-2xl">
                        <LayoutDashboard className="w-10 h-10 text-indigo-400 mb-6" />
                        <h3 className="text-xl font-bold text-white mb-4">Institutional Dashboards</h3>
                        <p className="text-slate-400 text-sm leading-relaxed mb-6">Get a bird's-eye view of your entire organization's health, from intake volume to matter outcomes, across all departments and geographical offices.</p>
                        <Link to="/for-enterprise-legal" className="text-indigo-400 font-bold text-sm flex items-center gap-2">
                            Enterprise Features <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                    <div className="p-8 bg-slate-900 border border-slate-800 rounded-2xl">
                        <Database className="w-10 h-10 text-blue-400 mb-6" />
                        <h3 className="text-xl font-bold text-white mb-4">Data Residency Edge</h3>
                        <p className="text-slate-400 text-sm leading-relaxed mb-6">Host your institutional data in your own sovereign enclaves in Nigeria, Kenya, or South Africa to meet 2026 data compliance regulations.</p>
                        <Link to="/security-and-compliance" className="text-blue-400 font-bold text-sm flex items-center gap-2">
                            Security Comparison <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </Section>

            {/* Internal Links Cluster */}
            <Section className="py-20 bg-slate-950">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-2xl font-bold text-white mb-8">Explore the Roadmap</h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        <Link to="/vs/nomosdesk-vs-clio" className="p-8 bg-slate-900 border border-slate-800 rounded-2xl hover:border-indigo-500/30 transition-all flex flex-col justify-between group">
                            <div>
                                <h4 className="text-white font-bold mb-2">vs. Clio</h4>
                                <p className="text-slate-500 text-xs">Clio institutional comparison.</p>
                            </div>
                            <ArrowRight className="w-4 h-4 text-slate-700 mt-6 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link to="/vs/nomosdesk-vs-mycase" className="p-8 bg-slate-900 border border-slate-800 rounded-2xl hover:border-indigo-500/30 transition-all flex flex-col justify-between group">
                            <div>
                                <h4 className="text-white font-bold mb-2">vs. MyCase</h4>
                                <p className="text-slate-500 text-xs">Enterprise security focus.</p>
                            </div>
                            <ArrowRight className="w-4 h-4 text-slate-700 mt-6 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link to="/legal-practice-management-software" className="p-8 bg-slate-900 border border-slate-800 rounded-2xl hover:border-indigo-500/30 transition-all flex flex-col justify-between group">
                            <div>
                                <h4 className="text-white font-bold mb-2">LPM Pillar</h4>
                                <p className="text-slate-500 text-xs">Complete 2026 guide.</p>
                            </div>
                            <ArrowRight className="w-4 h-4 text-slate-700 mt-6 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </div>
            </Section>

            {/* Bottom CTA */}
            <Section className="py-24 bg-slate-950 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-indigo-500/5 blur-[120px] rounded-full" />
                <div className="max-w-3xl mx-auto relative z-10">
                    <h2 className="text-4xl font-bold text-white mb-6">Upgrade to Institutional Governance</h2>
                    <p className="text-xl text-slate-300 mb-10">We manage the entire transition from PracticePanther. Secure your institution with NomosDesk today.</p>
                    <div className="flex justify-center gap-4">
                        <Button size="lg" onClick={() => window.dispatchEvent(new CustomEvent('nomosdesk-open-demo'))}>
                            Schedule Practice Audit
                        </Button>
                    </div>
                </div>
            </Section>
        </Layout>
    );
}
