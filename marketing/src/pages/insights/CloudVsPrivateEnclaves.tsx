import React from 'react';
import Layout from '../../layouts/Layout';
import SEO from '../../components/SEO';
import { Section, Button } from '../../components/ui';
import { Shield, Lock, Server, ArrowRight, CheckCircle, Database } from 'lucide-react';
import { Link } from '../../utils/ssr-compat';

export default function CloudVsPrivateEnclaves() {
    return (
        <Layout>
            <SEO
                title="Cloud vs. Private Enclaves: 2026 Case Management Security"
                description="Choosing between standard cloud and private sovereign enclaves for legal data. Learn about isolation, residency, and institutional governance."
            />
            <Section className="pt-32 pb-20 bg-slate-950">
                <div className="max-w-4xl mx-auto">
                    <Link to="/insights" className="text-indigo-400 text-sm font-medium mb-8 inline-flex items-center gap-2 hover:gap-3 transition-all">
                        <ArrowRight className="w-4 h-4 rotate-180" /> Back to Insights
                    </Link>
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-8">
                        Cloud vs. Private Enclaves: The New Security Frontier
                    </h1>
                    <div className="flex items-center gap-4 mb-12 text-slate-500 text-sm">
                        <span className="bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-full border border-indigo-500/20">Data Security</span>
                        <span>9 min read</span>
                        <span>Feb 20, 2026</span>
                    </div>

                    <div className="prose prose-invert max-w-none">
                        <p className="text-xl text-slate-300 leading-relaxed mb-8">
                            As legal data becomes more sensitive and cyber threats more sophisticated, "being in the cloud" is no longer a sufficient security posture. Institutions are now deciding between **Standard Public Cloud** and **Sovereign Private Enclaves**.
                        </p>

                        <h2 className="text-white">What is a Private Enclave?</h2>
                        <p>
                            A private enclave is a cryptographically isolated environment within a cloud infrastructure. Unlike standard cloud hosting, where your data may reside on shared servers with hundreds of other companies, an enclave ensures that your data—and the compute power processing it—is physically and logically separated at the hardware level.
                        </p>

                        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl my-10 not-prose">
                            <h4 className="text-white font-bold mb-4 flex items-center gap-2"><Database className="w-5 h-5 text-indigo-400" /> Key Features of Enclaves</h4>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <div className="flex gap-2 items-start"><CheckCircle className="w-4 h-4 text-emerald-500 mt-1 shrink-0" /><span className="text-slate-400 text-sm">Hardware-level isolation.</span></div>
                                    <div className="flex gap-2 items-start"><CheckCircle className="w-4 h-4 text-emerald-500 mt-1 shrink-0" /><span className="text-slate-400 text-sm">Physical data residency control.</span></div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex gap-2 items-start"><CheckCircle className="w-4 h-4 text-emerald-500 mt-1 shrink-0" /><span className="text-slate-400 text-sm">Private encryption key ownership.</span></div>
                                    <div className="flex gap-2 items-start"><CheckCircle className="w-4 h-4 text-emerald-500 mt-1 shrink-0" /><span className="text-slate-400 text-sm">Jurisdictional legal protection.</span></div>
                                </div>
                            </div>
                        </div>

                        <h2 className="text-white">Why Generalist SaaS Fails the Enclave Test</h2>
                        <p>
                            Most legal SaaS providers are built on "Multi-Tenant" architectures where isolation is only enforced at the software layer. NomosDesk's **Sovereign Infrastructure** allows institutions to deploy their own private enclaves, satisfying the most rigorous security audits from government ministries and global enterprises.
                        </p>
                    </div>

                    <div className="mt-16 p-8 bg-indigo-950/20 border border-indigo-900/30 rounded-3xl text-center">
                        <h3 className="text-2xl font-bold text-white mb-4">Secure Your Institutional Data</h3>
                        <p className="text-slate-300 mb-8">Learn why Sovereign Enclaves are the new gold standard for legal tech.</p>
                        <Button asLink="/security-and-compliance">Security Whitepaper</Button>
                    </div>
                </div>
            </Section>
        </Layout>
    );
}
