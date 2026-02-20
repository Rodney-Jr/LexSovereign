import React from 'react';
import Layout from '../../layouts/Layout';
import SEO from '../../components/SEO';
import { Section, Button } from '../../components/ui';
import { ShieldCheck, Lock, ArrowRight, CheckCircle, FileCheck } from 'lucide-react';
import { Link } from '../../utils/ssr-compat';

export default function ISO27001Readiness() {
    return (
        <Layout>
            <SEO
                title="ISO 27001 Readiness for Law Firms: A 2026 Checklist"
                description="Prepare your law firm for ISO 27001 certification. Learn about essential security controls and how your software choice impacts compliance."
            />
            <Section className="pt-32 pb-20 bg-slate-950">
                <div className="max-w-4xl mx-auto">
                    <Link to="/insights" className="text-indigo-400 text-sm font-medium mb-8 inline-flex items-center gap-2 hover:gap-3 transition-all">
                        <ArrowRight className="w-4 h-4 rotate-180" /> Back to Insights
                    </Link>
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-8">
                        The Gold Standard: ISO 27001 Readiness for Law Firms
                    </h1>
                    <div className="flex items-center gap-4 mb-12 text-slate-500 text-sm">
                        <span className="bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/20">Compliance & Security</span>
                        <span>10 min read</span>
                        <span>Feb 20, 2026</span>
                    </div>

                    <div className="prose prose-invert max-w-none">
                        <p className="text-xl text-slate-300 leading-relaxed mb-8">
                            For firms competing for institutional and government contracts, ISO 27001 certification is increasingly becoming a mandatory prerequisite. This international standard for information security management systems (ISMS) provides a rigorous framework for protecting client data.
                        </p>

                        <h2 className="text-white">How Your Software Impacts Certification</h2>
                        <p>
                            ISO 27001 is about processes, but your practice management software is the primary mechanism for enforcing those processes. If your software lacks unalterable logs, granular access controls, or physical data residency, achieving certification will be an uphill battle.
                        </p>

                        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl my-10 not-prose">
                            <h4 className="text-white font-bold mb-6 flex items-center gap-2"><FileCheck className="w-5 h-5 text-emerald-400" /> ISO 27001 Control Mapping</h4>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                                    <div className="text-indigo-400 text-xs font-bold mb-1">A.9 Access Control</div>
                                    <p className="text-slate-500 text-xs">Role-based access controls and mandatory 2FA enforcement.</p>
                                </div>
                                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                                    <div className="text-indigo-400 text-xs font-bold mb-1">A.12.4 Logging & Monitoring</div>
                                    <p className="text-slate-500 text-xs">Unalterable, cryptographically signed audit trails for all events.</p>
                                </div>
                                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                                    <div className="text-indigo-400 text-xs font-bold mb-1">A.18 Compliance</div>
                                    <p className="text-slate-500 text-xs">Physical data residency satisfying regional jurisdiction laws.</p>
                                </div>
                                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                                    <div className="text-indigo-400 text-xs font-bold mb-1">A.10 Cryptography</div>
                                    <p className="text-slate-500 text-xs">End-to-end encryption with private enclave key management.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-16 p-8 bg-slate-900 border border-slate-800 rounded-3xl text-center">
                        <h3 className="text-2xl font-bold text-white mb-4">Prepare for Your Audit</h3>
                        <p className="text-slate-300 mb-8">Discuss how NomosDesk facilitates ISO 27001 compliance for scaling law firms.</p>
                        <Button variant="outline" asLink="/security-and-compliance">Certification Support</Button>
                    </div>
                </div>
            </Section>
        </Layout>
    );
}
