import React from 'react';
import Layout from '../../layouts/Layout';
import SEO from '../../components/SEO';
import { Section, Button } from '../../components/ui';
import { Shield, Search, ArrowRight, CheckCircle, AlertTriangle } from 'lucide-react';
import { Link } from '../../utils/ssr-compat';

export default function AutomatingConflictChecks() {
    return (
        <Layout>
            <SEO
                title="Automating Conflict of Interest Checks in 2026"
                description="Learn how automated conflict checking software prevents ethical violations and streamlines matter intake for high-volume law firms."
            />
            <Section className="pt-32 pb-20 bg-slate-950">
                <div className="max-w-4xl mx-auto">
                    <Link to="/insights" className="text-indigo-400 text-sm font-medium mb-8 inline-flex items-center gap-2 hover:gap-3 transition-all">
                        <ArrowRight className="w-4 h-4 rotate-180" /> Back to Insights
                    </Link>
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-8">
                        Automating Conflict of Interest Checks: A Governance Mandate
                    </h1>
                    <div className="flex items-center gap-4 mb-12 text-slate-500 text-sm">
                        <span className="bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/20">Governance</span>
                        <span>10 min read</span>
                        <span>Feb 20, 2026</span>
                    </div>

                    <div className="prose prose-invert max-w-none">
                        <p className="text-xl text-slate-300 leading-relaxed mb-8">
                            Conflict of interest is the single most common cause of ethical disqualification in large-scale litigation. In 2026, manual checks are no longer just inefficient—they are a liability risk that institutional partners can no longer ignore.
                        </p>

                        <h2 className="text-white">The Cost of Manual Latency</h2>
                        <p>
                            When a partner has to wait 24 to 48 hours for a conflict department to clear a new matter, the firm loses momentum. Furthermore, manual searches often miss phonetic variations or complex entity relationships that a "Direct Match" search simply cannot find.
                        </p>

                        <div className="bg-red-500/5 border border-red-500/10 p-8 rounded-2xl my-10">
                            <h4 className="text-red-400 font-bold mb-4 flex items-center gap-2"><AlertTriangle className="w-5 h-5" /> The Risk of "Silent Conflicts"</h4>
                            <p className="text-slate-400 text-sm">
                                A silent conflict occurs when an adverse party is an affiliate of a former client that hasn't been correctly linked in the firm's database. AI-powered conflict checking identifies these hidden relationships automatically.
                            </p>
                        </div>

                        <h2 className="text-white">Workflow-Enforced Prevention</h2>
                        <p>
                            At NomosDesk, we believe conflict checking shouldn't be a search you *perform*—it should be a barrier you *pass*. Our system enforces a mandatory conflict scan at the intake stage, preventing a matter from even being drafted until the partners have reviewed and cleared the system-generated flags.
                        </p>
                    </div>

                    <div className="mt-16 p-8 bg-slate-900 border border-slate-800 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-8">
                        <div>
                            <h3 className="text-2xl font-bold text-white mb-2">Secure Your Firm's Intake</h3>
                            <p className="text-slate-400">See how NomosDesk enforces zero-latency conflict checks.</p>
                        </div>
                        <Button asLink="/pricing">Explore Governance Tools</Button>
                    </div>
                </div>
            </Section>
        </Layout>
    );
}
