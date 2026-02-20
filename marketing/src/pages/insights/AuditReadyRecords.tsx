import React from 'react';
import Layout from '../../layouts/Layout';
import SEO from '../../components/SEO';
import { Section, Button } from '../../components/ui';
import { Shield, CheckCircle, ArrowRight, History, Zap } from 'lucide-react';
import { Link } from '../../utils/ssr-compat';

export default function AuditReadyRecords() {
    return (
        <Layout>
            <SEO
                title="Audit-Ready: How Automated Records Protect Your Firm's Equity"
                description="Discover why automated, unalterable legal records are the primary defense against professional liability and institutional risk in 2026."
            />
            <Section className="pt-32 pb-20 bg-slate-950">
                <div className="max-w-4xl mx-auto">
                    <Link to="/insights" className="text-indigo-400 text-sm font-medium mb-8 inline-flex items-center gap-2 hover:gap-3 transition-all">
                        <ArrowRight className="w-4 h-4 rotate-180" /> Back to Insights
                    </Link>
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-8">
                        Audit-Ready: The Shield of Automated Legal Records
                    </h1>
                    <div className="flex items-center gap-4 mb-12 text-slate-500 text-sm">
                        <span className="bg-red-500/10 text-red-400 px-3 py-1 rounded-full border border-red-500/20">Governance</span>
                        <span>9 min read</span>
                        <span>Feb 20, 2026</span>
                    </div>

                    <div className="prose prose-invert max-w-none">
                        <p className="text-xl text-slate-300 leading-relaxed mb-8">
                            In the legal profession, an audit is not a matter of "if," but "when." Whether it's a regulatory inquiry, a partner dispute, or a professional liability claim, your primary defense is the integrity of your matter records.
                        </p>

                        <h2 className="text-white">The Cost of Manual Archiving</h2>
                        <p>
                            Firms that rely on manual record-keeping—printing to PDF, naming files manually, or relying on associate memories—are at extreme risk during an audit. These records are often incomplete, inconsistent, and lack the cryptographic proof required to verify their authenticity.
                        </p>

                        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl my-10 not-prose flex gap-6">
                            <History className="w-12 h-12 text-indigo-400 shrink-0" />
                            <div>
                                <h4 className="text-white font-bold mb-2">Automated Record Generation</h4>
                                <p className="text-slate-400 text-sm">
                                    NomosDesk automatically indexes every communication, document version, and time entry as it happens. When a matter is closed, the system generates a "Master Judicial Record" that is sealed and unalterable.
                                </p>
                            </div>
                        </div>

                        <h2 className="text-white">Protecting Your Firm's Equity</h2>
                        <p>
                            A firm's equity is its reputation for professional excellence and compliance. By automating your records, you ensure that your firm is always "Audit-Ready" by default, reducing insurance premiums and providing peace of mind to partners and clients alike.
                        </p>
                    </div>

                    <div className="mt-16 p-8 bg-indigo-900/20 border border-indigo-900/30 rounded-3xl text-center">
                        <h3 className="text-2xl font-bold text-white mb-4">Total Recording, Absolute Integrity</h3>
                        <p className="text-slate-300 mb-8">See how institutional firms manage their legacy records with NomosDesk.</p>
                        <Button size="lg" onClick={() => window.dispatchEvent(new CustomEvent('nomosdesk-open-demo'))}>
                            Request Governance Demo
                        </Button>
                    </div>
                </div>
            </Section>
        </Layout>
    );
}
