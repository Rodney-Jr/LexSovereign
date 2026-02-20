import React from 'react';
import Layout from '../../layouts/Layout';
import SEO from '../../components/SEO';
import { Section, Button } from '../../components/ui';
import { Users, Shield, ArrowRight, Building, CheckCircle, Lock } from 'lucide-react';
import { Link } from '../../utils/ssr-compat';

export default function GovernmentLegalCollaboration() {
    return (
        <Layout>
            <SEO
                title="Inter-Departmental Legal Collaboration in Government Agencies"
                description="How government legal departments can collaborate across Prosecution, Investigation, and Administrative branches while maintaining strict data firewalls."
            />
            <Section className="pt-32 pb-20 bg-slate-950">
                <div className="max-w-4xl mx-auto">
                    <Link to="/insights" className="text-indigo-400 text-sm font-medium mb-8 inline-flex items-center gap-2 hover:gap-3 transition-all">
                        <ArrowRight className="w-4 h-4 rotate-180" /> Back to Insights
                    </Link>
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-8">
                        Firewalls and Collaboration: Building a Unified Government Legal Engine
                    </h1>
                    <div className="flex items-center gap-4 mb-12 text-slate-500 text-sm">
                        <span className="bg-purple-500/10 text-purple-400 px-3 py-1 rounded-full border border-purple-500/20">Public Sector</span>
                        <span>11 min read</span>
                        <span>Feb 20, 2026</span>
                    </div>

                    <div className="prose prose-invert max-w-none">
                        <p className="text-xl text-slate-300 leading-relaxed mb-8">
                            In many governments, the "Legal Department" is actually a collection of autonomous bodies: Prosecution, Judicial Investigation, Legislative Drafting, and General Counsel. The challenge: how do they share a secure system without leaking sensitive investigative data?
                        </p>

                        <h2 className="text-white">The Paradox of Shared Systems</h2>
                        <p>
                            Historically, government agencies used siloed, legacy databases. This prevented "cross-talk" but also made it impossible for the Ministry of Justice to gain a holistic view of national legal trends. Modern modernization requires a system that is **Shared by Design but Isolated by Enforcement**.
                        </p>

                        <div className="bg-slate-900 border-l-4 border-purple-500 p-8 rounded-2xl my-10">
                            <h4 className="text-white font-bold mb-4 flex items-center gap-2"><Lock className="w-5 h-5 text-purple-400" /> Departmental Separation Mode</h4>
                            <p className="text-slate-400 text-sm italic">
                                "NomosDesk allows a single national tenant to be split into distinct departmental firewalls. A prosecutor can never see investigative files from a separate agency unless an explicit, logged, and audited 'collaborative matter' is created."
                            </p>
                        </div>

                        <h2 className="text-white">Governance-Driven Workflows</h2>
                        <p>
                            True collaboration in government requires high-level oversight. With NomosDesk, a Minister can monitor performance metrics (case disposition rates, departmental activity) across the entire platform without having to view the actual sensitive content of the matters themselves. This "Metadata-Only Oversight" is the key to balancing transparency with security.
                        </p>
                    </div>

                    <div className="mt-16 p-8 bg-slate-900 border border-slate-800 rounded-3xl flex flex-col items-center gap-6 text-center">
                        <div className="w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center text-purple-400">
                            <Building className="w-8 h-8" />
                        </div>
                        <h3 className="text-2xl font-bold text-white">Scale Your Ministry with Confidence</h3>
                        <p className="text-slate-400 max-w-xl">Explore our departmental separation models for government legal bodies.</p>
                        <Button asLink="/for-government">Institutional Solutions</Button>
                    </div>
                </div>
            </Section>
        </Layout>
    );
}
