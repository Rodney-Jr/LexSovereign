import React from 'react';
import Layout from '../../layouts/Layout';
import SEO from '../../components/SEO';
import { Section, Button } from '../../components/ui';
import { Database, ArrowRight, CheckCircle, AlertTriangle, Cloud } from 'lucide-react';
import { Link } from '../../utils/ssr-compat';

export default function LegacyDataMigration() {
    return (
        <Layout>
            <SEO
                title="Legacy Legal Data Migration: Moving to Sovereign Cloud"
                description="A guide for law firms on migrating legacy matter data from on-premise servers to secure, sovereign cloud enclaves."
            />
            <Section className="pt-32 pb-20 bg-slate-950">
                <div className="max-w-4xl mx-auto">
                    <Link to="/insights" className="text-indigo-400 text-sm font-medium mb-8 inline-flex items-center gap-2 hover:gap-3 transition-all">
                        <ArrowRight className="w-4 h-4 rotate-180" /> Back to Insights
                    </Link>
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-8">
                        The Great Migration: Moving Legacy Legal Data
                    </h1>
                    <div className="flex items-center gap-4 mb-12 text-slate-500 text-sm">
                        <span className="bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full border border-blue-500/20">Data Migration</span>
                        <span>11 min read</span>
                        <span>Feb 20, 2026</span>
                    </div>

                    <div className="prose prose-invert max-w-none">
                        <p className="text-xl text-slate-300 leading-relaxed mb-8">
                            The biggest blocker to modernizing a law firm is the "Data Graveyard"—decades of records locked in on-premise servers or outdated legacy software. Moving this data to a sovereign cloud is a technical hurdle that requires strategic planning.
                        </p>

                        <h2 className="text-white">The Risks of Data Stagnation</h2>
                        <p>
                            Legacy systems are often vulnerable to cyberattacks and lack modern audit capabilities. Furthermore, data locked in these silos cannot be utilized by New AI models, preventing the firm from gaining insights from its own historical records.
                        </p>

                        <div className="bg-red-500/5 border border-red-500/10 p-8 rounded-2xl my-10 not-prose">
                            <h4 className="text-red-400 font-bold mb-4 flex items-center gap-2"><AlertTriangle className="w-5 h-5" /> Migration Pitfalls</h4>
                            <ul className="text-slate-400 text-sm space-y-2">
                                <li className="flex gap-2"><CheckCircle className="w-4 h-4 text-red-500/50" /> Loss of metadata (creation dates, author IDs).</li>
                                <li className="flex gap-2"><CheckCircle className="w-4 h-4 text-red-500/50" /> Broken links between matters and documents.</li>
                                <li className="flex gap-2"><CheckCircle className="w-4 h-4 text-red-500/50" /> Corrupted historical conflict records.</li>
                            </ul>
                        </div>

                        <h2 className="text-white">Our Zero-Loss Migration Strategy</h2>
                        <p>
                            At NomosDesk, we manage the entire migration process. Our engineers utilize specialized ETL (Extract, Transform, Load) pipelines to move data from systems like PC Law, TimeMatters, or locally hosted SQL databases into your new sovereign enclave, ensuring 100% integrity and mapping of your firm's historical record.
                        </p>
                    </div>

                    <div className="mt-16 p-8 bg-slate-900 border border-slate-800 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-8">
                        <div>
                            <h3 className="text-2xl font-bold text-white mb-2">Unhappy with Your Legacy System?</h3>
                            <p className="text-slate-400">Request a free data audit and migration feasibility study.</p>
                        </div>
                        <Button variant="outline" onClick={() => window.dispatchEvent(new CustomEvent('nomosdesk-open-demo'))}>
                            Request Data Audit
                        </Button>
                    </div>
                </div>
            </Section>
        </Layout>
    );
}
