import React from 'react';
import Layout from '../../layouts/Layout';
import SEO from '../../components/SEO';
import { Section, Button } from '../../components/ui';
import { Shield, Lock, ArrowRight, CheckCircle, Database } from 'lucide-react';
import { Link } from '../../utils/ssr-compat';

export default function UnalterableAuditTrails() {
    return (
        <Layout>
            <SEO
                title="Designing Unalterable Audit Trails for Judicial Records"
                description="Learn why unalterable, cryptographically locked audit trails are essential for judicial integrity and institutional compliance in 2026."
            />
            <Section className="pt-32 pb-20 bg-slate-950">
                <div className="max-w-4xl mx-auto">
                    <Link to="/insights" className="text-indigo-400 text-sm font-medium mb-8 inline-flex items-center gap-2 hover:gap-3 transition-all">
                        <ArrowRight className="w-4 h-4 rotate-180" /> Back to Insights
                    </Link>
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-8">
                        The Record is Truth: Cryptographic Audit Trails
                    </h1>
                    <div className="flex items-center gap-4 mb-12 text-slate-500 text-sm">
                        <span className="bg-red-500/10 text-red-400 px-3 py-1 rounded-full border border-red-500/20">Judicial Security</span>
                        <span>12 min read</span>
                        <span>Feb 20, 2026</span>
                    </div>

                    <div className="prose prose-invert max-w-none">
                        <p className="text-xl text-slate-300 leading-relaxed mb-8">
                            In high-stakes litigation and government legal work, the integrity of the record is the foundation of trust. If an audit log can be edited or deleted—even by an administrator—the record is not truth. In 2026, **Unalterable Audit Trails** are the only acceptable standard.
                        </p>

                        <h2 className="text-white">Why Software Logs Aren't Enough</h2>
                        <p>
                            Most practice management tools store logs in a standard SQL database. A skilled developer or administrator can modify these rows to hide errors or unethical actions. NomosDesk uses a **Write-Once-Read-Many (WORM)** cryptographic append-only structure for all critical judicial actions.
                        </p>

                        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl my-10 not-prose flex gap-6">
                            <Lock className="w-12 h-12 text-indigo-400 shrink-0" />
                            <div>
                                <h4 className="text-white font-bold mb-2">Cryptographic Locking</h4>
                                <p className="text-slate-400 text-sm">
                                    Each log entry is hashed and linked to the previous entry, creating a verifiable chain of custody. Any attempt to modify a past record will immediately break the chain and alert the Global Admin.
                                </p>
                            </div>
                        </div>

                        <h2 className="text-white">Sovereign Proof of Record</h2>
                        <p>
                            For government ministries, this level of technical integrity isn't just about security—it's about public accountability. Being able to prove that a document was filed at 2:03 PM on a specific date, and that the record has been untouched since then, is a core requirement of modern justice.
                        </p>
                    </div>

                    <div className="mt-16 p-8 bg-indigo-900/20 border border-indigo-900/30 rounded-3xl text-center">
                        <h3 className="text-2xl font-bold text-white mb-4">Uphold Judicial Integrity</h3>
                        <p className="text-slate-300 mb-8">Learn more about our cryptographic record management.</p>
                        <Button asLink="/security-and-compliance">View Security Whitepaper</Button>
                    </div>
                </div>
            </Section>
        </Layout>
    );
}
