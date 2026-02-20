import React from 'react';
import Layout from '../../layouts/Layout';
import SEO from '../../components/SEO';
import { Section, Button } from '../../components/ui';
import { Archive, CheckCircle, ArrowRight, ShieldCheck, Clock } from 'lucide-react';
import { Link } from '../../utils/ssr-compat';

export default function AutomatingMatterCloseout() {
    return (
        <Layout>
            <SEO
                title="Automating Matter Close-out for Regulatory Compliance"
                description="Learn how to automate the final phase of the legal lifecycle: matter closure, record retention, and secure data archiving."
            />
            <Section className="pt-32 pb-20 bg-slate-950">
                <div className="max-w-4xl mx-auto">
                    <Link to="/insights" className="text-indigo-400 text-sm font-medium mb-8 inline-flex items-center gap-2 hover:gap-3 transition-all">
                        <ArrowRight className="w-4 h-4 rotate-180" /> Back to Insights
                    </Link>
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-8">
                        The Clean Exit: Automating Matter Close-out
                    </h1>
                    <div className="flex items-center gap-4 mb-12 text-slate-500 text-sm">
                        <span className="bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/20">Compliance</span>
                        <span>8 min read</span>
                        <span>Feb 20, 2026</span>
                    </div>

                    <div className="prose prose-invert max-w-none">
                        <p className="text-xl text-slate-300 leading-relaxed mb-8">
                            Most law firms are excellent at starting matters, but poor at finishing them. Open "zombie" matters that haven't been correctly closed out present a significant data breach risk and can lead to accidental conflict flags in the future.
                        </p>

                        <h2 className="text-white">Why Close-out Automation Matters</h2>
                        <p>
                            A formal close-out workflow ensures that all final bills are sent, all KYC data that is no longer required is pruned (satisfying POPIA/GDPR "right to be forgotten" rules), and the permanent judicial record is archived in a read-only state.
                        </p>

                        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl my-10 not-prose">
                            <h4 className="text-white font-bold mb-6">Matter Close-out Checklist</h4>
                            <div className="space-y-3">
                                <div className="flex gap-3"><CheckCircle className="w-4 h-4 text-emerald-500" /> Final Trust Account reconciliation.</div>
                                <div className="flex gap-3"><CheckCircle className="w-4 h-4 text-emerald-500" /> Retention period scheduling (5, 7, or 10 years).</div>
                                <div className="flex gap-3"><CheckCircle className="w-4 h-4 text-emerald-500" /> Client data pruning for privacy compliance.</div>
                                <div className="flex gap-3"><CheckCircle className="w-4 h-4 text-emerald-500" /> Permanent archival of the pleading index.</div>
                            </div>
                        </div>

                        <h2 className="text-white">Governance by Default</h2>
                        <p>
                            NomosDesk allows partners to set mandatory closure rules. For example, a matter cannot be moved to "Inactive" until the associated trust account balance is zero and a "Disposition Summary" has been uploaded. This ensures that the firm's books and records are always audit-ready.
                        </p>
                    </div>

                    <div className="mt-16 p-8 bg-slate-900 border border-slate-800 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
                        <div>
                            <h3 className="text-2xl font-bold text-white mb-2">Build a compliant Legacy</h3>
                            <p className="text-slate-400">Master the final mile of the legal matter lifecycle.</p>
                        </div>
                        <Button asLink="/pricing">Pricing & Plans</Button>
                    </div>
                </div>
            </Section>
        </Layout>
    );
}
