import React from 'react';
import Layout from '../../layouts/Layout';
import SEO from '../../components/SEO';
import { Section, Button } from '../../components/ui';
import { Shield, Lock, Globe, Server, CheckCircle, XCircle, ArrowRight, Zap, Target } from 'lucide-react';
import { Link } from '../../utils/ssr-compat';

export default function NomosVsMyCase() {
    return (
        <Layout>
            <SEO
                title="NomosDesk vs MyCase: Enterprise Security & Governance 2026"
                description="Compare NomosDesk and MyCase on enterprise security, data sovereignty, and departmental controls for high-volume law firms and institutions."
            />

            {/* Hero Section */}
            <Section className="pt-32 pb-20 relative overflow-hidden bg-slate-950">
                <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 blur-[100px] rounded-full -mr-48 -mt-48" />
                <div className="max-w-5xl mx-auto relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-500/10 border border-slate-500/20 text-slate-300 text-sm font-medium mb-6">
                        NomosDesk vs. MyCase
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 leading-tight tracking-tight">
                        Enterprise Security. <br />
                        <span className="text-emerald-400">Institutional Governance.</span>
                    </h1>
                    <p className="text-xl text-slate-300 leading-relaxed max-w-3xl mb-12">
                        MyCase is an excellent choice for general practice small firms. But when your data footprint spans multiple jurisdictions or requires high-security enclaves, the architecture matters.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 mb-20">
                        <Button size="lg" onClick={() => window.dispatchEvent(new CustomEvent('nomosdesk-open-demo'))}>
                            Request Enterprise Review
                        </Button>
                        <Button asLink="/security-and-compliance" variant="outline" size="lg">
                            View Security Specs
                        </Button>
                    </div>
                </div>
            </Section>

            {/* Core Comparison Items */}
            <Section darker className="py-24">
                <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
                    <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl hover:border-indigo-500/30 transition-all">
                        <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400 mb-6">
                            <Server className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-4">Regional Residency</h3>
                        <p className="text-slate-400 text-sm leading-relaxed mb-6">
                            NomosDesk offers physical data residency in Nigeria, Kenya, and South Africa. MyCase primarily hosts on US-based cloud servers.
                        </p>
                        <span className="text-indigo-400 text-xs font-bold uppercase tracking-widest">Compliance Edge</span>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl hover:border-emerald-500/30 transition-all">
                        <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400 mb-6">
                            <Shield className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-4">Departmental Controls</h3>
                        <p className="text-slate-400 text-sm leading-relaxed mb-6">
                            Enforce strict firewalls between departments (e.g., Investigation vs. Prosecution) within a single tenant.
                        </p>
                        <span className="text-emerald-400 text-xs font-bold uppercase tracking-widest">Security Edge</span>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl hover:border-blue-500/30 transition-all">
                        <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400 mb-6">
                            <Lock className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-4">Mandatory Conflicts</h3>
                        <p className="text-slate-400 text-sm leading-relaxed mb-6">
                            Workflow-enforced conflict checking. Prevent unethical matter openings before they occur.
                        </p>
                        <span className="text-blue-400 text-xs font-bold uppercase tracking-widest">Governance Edge</span>
                    </div>
                </div>
            </Section>

            {/* Deep Comparison Section */}
            <Section className="py-24 bg-slate-950">
                <div className="max-w-4xl mx-auto prose prose-invert">
                    <h2 className="text-white text-3xl font-bold mb-6">Why High-Volume Firms Choose NomosDesk Over MyCase</h2>
                    <p className="text-slate-300 text-lg leading-relaxed mb-8">
                        MyCase provides a streamlined experience for simple billing and scheduling. However, institutions managing complex, high-stakes litigation require a more robust governance model.
                    </p>

                    <h3 className="text-white text-2xl font-bold mb-4">Sovereign Data Infrastructure</h3>
                    <p className="text-slate-300 text-lg leading-relaxed mb-8">
                        For government legal departments and enterprises operating in emerging markets, "Cloud" isn't enough. They need to know exactly where the bits are stored. NomosDesk's **Sovereign Enclaves** provide physical data localization that MyCase, as a US-centric SaaS, cannot match.
                    </p>

                    <h3 className="text-white text-2xl font-bold mb-4">Departmental Firewalls</h3>
                    <p className="text-slate-300 text-lg leading-relaxed mb-8">
                        In many institutional settings, different teams must share a platform while remaining completely isolated from each other's data (e.g., for ethical walls or security clearance levels). NomosDesk supports native **Departmental Separation Modes** that go far beyond the simple user-permission levels found in MyCase.
                    </p>
                </div>
            </Section>

            {/* Call to Action Comparison */}
            <Section darker className="py-24">
                <div className="max-w-5xl mx-auto rounded-3xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 p-12 text-center overflow-hidden relative">
                    <div className="absolute inset-0 bg-indigo-500/5 blur-3xl rounded-full" />
                    <div className="relative z-10">
                        <h2 className="text-3xl font-bold text-white mb-6">Which is Right for Your Firm?</h2>
                        <div className="grid md:grid-cols-2 gap-8 text-left mb-10">
                            <div className="p-6 bg-slate-950/50 rounded-2xl border border-slate-800">
                                <h4 className="text-indigo-400 font-bold mb-2">MyCase is better for:</h4>
                                <p className="text-slate-500 text-sm">Small practices (1-5 users) focused primarily on basic billing and simple scheduling without complex governance needs.</p>
                            </div>
                            <div className="p-6 bg-indigo-600/10 rounded-2xl border border-indigo-500/20">
                                <h4 className="text-white font-bold mb-2">NomosDesk is better for:</h4>
                                <p className="text-slate-300 text-sm">Institutions, government bodies, and growing firms requiring physical data residency, advanced conflict checking, and departmental scale.</p>
                            </div>
                        </div>
                        <Button size="lg" onClick={() => window.dispatchEvent(new CustomEvent('nomosdesk-open-demo'))}>
                            Schedule an Institutional Review
                        </Button>
                    </div>
                </div>
            </Section>

            {/* Related content links */}
            <Section className="py-20 bg-slate-950">
                <div className="max-w-5xl mx-auto">
                    <div className="grid md:grid-cols-3 gap-6">
                        <Link to="/vs/nomosdesk-vs-clio" className="p-6 bg-slate-900 border border-slate-800 rounded-2xl hover:border-indigo-500/30 transition-all flex flex-col justify-between">
                            <h4 className="text-white font-bold text-sm mb-2">vs. Clio</h4>
                            <p className="text-slate-500 text-xs">Clio institutional comparison.</p>
                            <ArrowRight className="w-4 h-4 text-slate-700 mt-4 self-end" />
                        </Link>
                        <Link to="/vs/nomosdesk-vs-practicepanther" className="p-6 bg-slate-900 border border-slate-800 rounded-2xl hover:border-indigo-500/30 transition-all flex flex-col justify-between">
                            <h4 className="text-white font-bold text-sm mb-2">vs. PracticePanther</h4>
                            <p className="text-slate-500 text-xs">Governance and control focus.</p>
                            <ArrowRight className="w-4 h-4 text-slate-700 mt-4 self-end" />
                        </Link>
                        <Link to="/security-and-compliance" className="p-6 bg-slate-900 border border-slate-800 rounded-2xl hover:border-indigo-500/30 transition-all flex flex-col justify-between">
                            <h4 className="text-white font-bold text-sm mb-2">Security Specs</h4>
                            <p className="text-slate-500 text-xs">View our compliance standards.</p>
                            <ArrowRight className="w-4 h-4 text-slate-700 mt-4 self-end" />
                        </Link>
                    </div>
                </div>
            </Section>
        </Layout>
    );
}
