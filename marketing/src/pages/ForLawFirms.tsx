import React from 'react';
import Layout from '../layouts/Layout';
import SEO from '../components/SEO';
import { Section, SectionHeader, Button } from '../components/ui';
import { CheckCircle, Briefcase, Globe, Scale } from 'lucide-react';

export default function ForLawFirms() {
    return (
        <Layout>
            <SEO
                title="Legal Matter Management for Law Firms"
                description="Empower your firm with built-in conflict checking, multi-office management, and partner oversight."
            />

            <Section className="bg-slate-950 pt-32 pb-20">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-medium mb-6">
                        For Regional & Mid-Sized Firms
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                        Governance that Scales <br /> With Your Practice
                    </h1>
                    <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
                        Focus on client advocacy while NomosDesk handles the risk.
                        Automated conflict checks, partner approvals, and secure matter files
                        keep your firm compliant and efficient.
                    </p>
                    <div className="flex justify-center gap-4">
                        <Button asLink="/#demo">Schedule Demo</Button>
                    </div>
                </div>
            </Section>

            <Section>
                <div className="grid md:grid-cols-2 gap-16 items-center">
                    <div>
                        <h2 className="text-3xl font-bold text-white mb-6">Stop Conflicts Before They Start</h2>
                        <p className="text-slate-300 text-lg mb-6 leading-relaxed">
                            Manual conflict checks are prone to error. NomosDesk enforces a conflict search
                            workflow before any matter can be activated.
                        </p>
                        <ul className="space-y-4">
                            <ListItem title="Mandatory Search" desc="Associates must search opposing parties against the firm-wide index." />
                            <ListItem title="Clear Clearance" desc="Conflict reports are attached to the matter file for audit." />
                            <ListItem title="Risk Reduction" desc="Prevent ethical breaches and client disqualifications." />
                        </ul>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
                        {/* Visual Placeholder for Conflict Check UI */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                                <span className="font-semibold text-white">Conflict Search: "Apex Corp"</span>
                                <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded">No Conflicts Found</span>
                            </div>
                            <div className="space-y-2">
                                <div className="h-2 bg-slate-800 rounded w-3/4"></div>
                                <div className="h-2 bg-slate-800 rounded w-1/2"></div>
                            </div>
                            <div className="flex justify-end pt-4">
                                <div className="bg-indigo-600 text-white text-xs px-3 py-2 rounded">Clear & Create Matter</div>
                            </div>
                        </div>
                    </div>
                </div>
            </Section>

            <Section>
                <div className="grid md:grid-cols-2 gap-16 items-center">
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl overflow-hidden relative group">
                        <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/10 blur-[80px] rounded-full group-hover:bg-indigo-500/20 transition-colors"></div>
                        <div className="relative z-10 space-y-6">
                            <div className="flex items-center gap-3 text-indigo-400">
                                <Scale className="w-6 h-6" />
                                <span className="font-mono text-xs font-bold uppercase tracking-widest">Judicial Intelligence Enclave</span>
                            </div>
                            <div className="space-y-4">
                                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
                                    <p className="text-xs text-slate-500 mb-2 font-mono">RESEARCH QUERY</p>
                                    <p className="text-sm text-slate-200">"Relevant precedents for land title disputes in Greater Accra..."</p>
                                </div>
                                <div className="p-4 bg-indigo-500/5 rounded-2xl border border-indigo-500/20">
                                    <p className="text-xs text-indigo-400 mb-2 font-mono">ENCLAVE RESPONSE [CITED]</p>
                                    <p className="text-sm text-indigo-100">"Based on the 1992 Constitution and recent Ghana Law Reports (GLR), the principle of..."</p>
                                    <div className="mt-3 flex gap-2">
                                        <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/30">Constitution §36</span>
                                        <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/30">Statute 102/2021</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-white mb-6">Case Memory & Statutory Intelligence</h2>
                        <p className="text-slate-300 text-lg mb-6 leading-relaxed">
                            Empower your associates with verified jurisdictional data. NomosDesk's deep research enclave is grounded in your regional legal history.
                        </p>
                        <ul className="space-y-4">
                            <ListItem title="Constitutional Grounding" desc="AI responses are strictly anchored in national and regional constitutional frameworks." />
                            <ListItem title="Statutory Precision" desc="Instant access to the latest statutes and official gazette updates." />
                            <ListItem title="Judicial Case Memory" desc="Leverage a library of closed casefiles and precedents to build stronger arguments faster." />
                        </ul>
                    </div>
                </div>
            </Section>

            <Section darker>
                <SectionHeader title="Partner Oversight & Multi-Office Control" />
                <div className="grid md:grid-cols-3 gap-8 text-center">
                    <FeatureBox icon={<Globe />} title="Multi-Office Support" desc="Manage Nairobi, Lagos, and London offices from a single dashboard while keeping data logically separated." />
                    <FeatureBox icon={<Briefcase />} title="Partner Workflows" desc="Set approval thresholds for high-stakes matters. Associates draft, Partners approve." />
                    <FeatureBox icon={<Scale />} title="Ethical Walls" desc="Restrict information access to only the specific legal team assigned to the matter." />
                </div>
            </Section>

            <Section className="text-center bg-indigo-900/20 border-t border-indigo-900/30">
                <h2 className="text-3xl font-bold text-white mb-6">Ready to secure your firm?</h2>
                <Button asLink="/#demo" size="lg">Get Started</Button>
            </Section>
        </Layout>
    );
}

function ListItem({ title, desc }: any) {
    return (
        <li className="flex gap-4">
            <CheckCircle className="w-6 h-6 text-indigo-500 shrink-0" />
            <div>
                <h4 className="font-semibold text-white">{title}</h4>
                <p className="text-slate-400 text-sm">{desc}</p>
            </div>
        </li>
    )
}

function FeatureBox({ icon, title, desc }: any) {
    return (
        <div className="p-6 bg-slate-900 rounded-2xl border border-slate-800">
            <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center mx-auto mb-4 text-indigo-400">
                {icon}
            </div>
            <h3 className="font-bold text-white mb-2">{title}</h3>
            <p className="text-slate-400 text-sm">{desc}</p>
        </div>
    )
}
