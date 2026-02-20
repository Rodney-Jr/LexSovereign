import React from 'react';
import Layout from '../../layouts/Layout';
import SEO from '../../components/SEO';
import { Section, Button } from '../../components/ui';
import { Cpu, ShieldAlert, ArrowRight, CheckCircle, Lock } from 'lucide-react';
import { Link } from '../../utils/ssr-compat';

export default function HardwareSovereignSecurity() {
    return (
        <Layout>
            <SEO
                title="Hardware-Level Security for Sovereign Legal Databases"
                description="Protecting legal institutions with Trusted Execution Environments (TEE) and hardware-level data isolation for absolute sovereignty."
            />
            <Section className="pt-32 pb-20 bg-slate-950">
                <div className="max-w-4xl mx-auto">
                    <Link to="/insights" className="text-indigo-400 text-sm font-medium mb-8 inline-flex items-center gap-2 hover:gap-3 transition-all">
                        <ArrowRight className="w-4 h-4 rotate-180" /> Back to Insights
                    </Link>
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-8">
                        The Core of Sovereignty: Hardware-Level Legal Security
                    </h1>
                    <div className="flex items-center gap-4 mb-12 text-slate-500 text-sm">
                        <span className="bg-red-500/10 text-red-400 px-3 py-1 rounded-full border border-red-500/20">Technical Security</span>
                        <span>10 min read</span>
                        <span>Feb 20, 2026</span>
                    </div>

                    <div className="prose prose-invert max-w-none">
                        <p className="text-xl text-slate-300 leading-relaxed mb-8">
                            In 2026, software-defined security is no longer the final word in data protection. For institutions handling high-stakes judicial records, the ultimate defense is found at the hardware layer. This is the world of **Trusted Execution Environments (TEE)**.
                        </p>

                        <h2 className="text-white">Beyond the OS: Isolation by Hardware</h2>
                        <p>
                            Traditional legal software relies on the operating system and the hypervisor to protect data. However, if these layers are compromised, the data is vulnerable. NomosDesk utilizes hardware-based enclaves (like Intel SGX or AWS Nitro) to ensure that even a system administrator with root access cannot view the contents of the database while it is being processed.
                        </p>

                        <div className="bg-slate-900 p-8 rounded-2xl border border-red-500/20 my-10 flex flex-col md:flex-row gap-8 items-center">
                            <div className="w-16 h-16 bg-red-500/10 rounded-xl flex items-center justify-center text-red-400 shrink-0">
                                <Cpu className="w-8 h-8" />
                            </div>
                            <div>
                                <h4 className="text-white font-bold mb-2">Zero-Trust Memory Isolation</h4>
                                <p className="text-slate-500 text-xs">
                                    Matter data is decrypted only within the hardware-protected enclave. It is NEVER in plain text in the main system memory, making "memory scraping" attacks impossible.
                                </p>
                            </div>
                        </div>

                        <h2 className="text-white">Why Sovereignty Requires Physicality</h2>
                        <p>
                            True sovereignty means control over the physical medium. By utilizing hardware isolation and localized datacenters, NomosDesk ensures that your firm's data isn't just "private"—it is physically unreachable by anyone outside your jurisdictional authority.
                        </p>
                    </div>

                    <div className="mt-16 p-8 bg-slate-900 border border-slate-800 rounded-3xl text-center">
                        <h3 className="text-2xl font-bold text-white mb-4">Deep Technical Integrity</h3>
                        <p className="text-slate-400 mb-8">Download our technical whitepaper on sovereign infrastructure security.</p>
                        <Button variant="outline" asLink="/security-and-compliance">Technical Specs</Button>
                    </div>
                </div>
            </Section>
        </Layout>
    );
}
