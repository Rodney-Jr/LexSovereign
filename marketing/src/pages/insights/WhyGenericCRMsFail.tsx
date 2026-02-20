import React from 'react';
import Layout from '../../layouts/Layout';
import SEO from '../../components/SEO';
import { Section, Button } from '../../components/ui';
import { Users, XCircle, ArrowRight, CheckCircle, Shield } from 'lucide-react';
import { Link } from '../../utils/ssr-compat';

export default function WhyGenericCRMsFail() {
    return (
        <Layout>
            <SEO
                title="Why Generic CRMs Fail Law Firms: The 2026 Reality"
                description="Generic CRMs like Salesforce or HubSpot often lack the specific governance and conflict checking needs of a law firm. Learn what to use instead."
            />
            <Section className="pt-32 pb-20 bg-slate-950">
                <div className="max-w-4xl mx-auto">
                    <Link to="/insights" className="text-indigo-400 text-sm font-medium mb-8 inline-flex items-center gap-2 hover:gap-3 transition-all">
                        <ArrowRight className="w-4 h-4 rotate-180" /> Back to Insights
                    </Link>
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-8">
                        The Law Firm CRM Gap: Why Generic Fails
                    </h1>
                    <div className="flex items-center gap-4 mb-12 text-slate-500 text-sm">
                        <span className="bg-red-500/10 text-red-400 px-3 py-1 rounded-full border border-red-500/20">Legal Technology</span>
                        <span>9 min read</span>
                        <span>Feb 20, 2026</span>
                    </div>

                    <div className="prose prose-invert max-w-none">
                        <p className="text-xl text-slate-300 leading-relaxed mb-8">
                            A CRM should be more than a contact list. For law firms, a lead is not just a "customer"—it is a potential matter, an ethical responsibility, and a source of potential conflict. Generic CRMs are not built for this reality.
                        </p>

                        <h2 className="text-white">1. The Conflict checking Blind Spot</h2>
                        <p>
                            Generic CRMs (HubSpot, Salesforce) treat every lead as an independent entity. They have no concept of "Adverse Parties" or "Entity Relationship Maps." If you use a generic CRM, you are likely missing conflicts at the intake stage—only to discover them after you've already billed hours.
                        </p>

                        <h2 className="text-white">2. Lack of Matter Context</h2>
                        <p>
                            In a legal CRM, the "sale" is the opening of a matter. A legal-specific CRM like NomosDesk understands the transition from prospect to case file, ensuring that all data collected during intake is cryptographically signed and moved into the practice management environment without manual re-entry.
                        </p>

                        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl my-10 not-prose">
                            <h4 className="text-white font-bold mb-6">CRM Capability Comparison</h4>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-slate-950 rounded-xl">
                                    <span className="text-slate-300">Native Conflict Checking</span>
                                    <span className="text-indigo-400 font-bold">NomosDesk Only</span>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-slate-950 rounded-xl">
                                    <span className="text-slate-300">Jurisdictional Data Residency</span>
                                    <span className="text-indigo-400 font-bold">NomosDesk Only</span>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-slate-950 rounded-xl">
                                    <span className="text-slate-300">Matter-Centric Pipeline</span>
                                    <span className="text-indigo-400 font-bold">NomosDesk Only</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-16 p-8 bg-indigo-900/20 border border-indigo-900/30 rounded-3xl text-center">
                        <h3 className="text-2xl font-bold text-white mb-4">Stop Compromising on Governance</h3>
                        <p className="text-slate-300 mb-8">Move to the CRM built specifically for high-stakes legal operations.</p>
                        <Button asLink="/law-firm-crm-software">Explore Legal CRM</Button>
                    </div>
                </div>
            </Section>
        </Layout>
    );
}
