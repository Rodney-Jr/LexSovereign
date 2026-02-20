import React from 'react';
import Layout from '../../layouts/Layout';
import SEO from '../../components/SEO';
import { Section, Button } from '../../components/ui';
import { Briefcase, Building, ArrowRight, Shield, Zap, FileText } from 'lucide-react';
import { Link } from '../../utils/ssr-compat';

export default function ModernizingMinistriesOfJustice() {
    return (
        <Layout>
            <SEO
                title="Modernizing Ministries of Justice: A 2026 Roadmap"
                description="A guide for government legal departments on digital transformation, judicial records management, and departmental accountability."
            />
            <Section className="pt-32 pb-20 bg-slate-950">
                <div className="max-w-4xl mx-auto">
                    <Link to="/insights" className="text-indigo-400 text-sm font-medium mb-8 inline-flex items-center gap-2 hover:gap-3 transition-all">
                        <ArrowRight className="w-4 h-4 rotate-180" /> Back to Insights
                    </Link>
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-8">
                        Modernizing Ministries of Justice: A Digital Transformation Roadmap
                    </h1>
                    <div className="flex items-center gap-4 mb-12 text-slate-500 text-sm">
                        <span className="bg-purple-500/10 text-purple-400 px-3 py-1 rounded-full border border-purple-500/20">Government Tech</span>
                        <span>12 min read</span>
                        <span>Feb 20, 2026</span>
                    </div>

                    <div className="prose prose-invert max-w-none">
                        <p className="text-xl text-slate-300 leading-relaxed mb-8">
                            Public sector legal departments face a unique set of challenges: extreme scale, absolute audit requirements, and the need for rigorous departmental firewalls. In 2026, the transition from paper-heavy processes to a digital **Judicial Operating System** is no longer optional.
                        </p>

                        <h2 className="text-white">The Three Pillars of Government Legal Tech</h2>
                        <ol>
                            <li><strong>Unbroken Audit Trails:</strong> Every action, from matter creation to document seal, must be cryptographically recorded to ensure judicial integrity.</li>
                            <li><strong>Departmental Isolation:</strong> Prosecution, Investigation, and Administrative branches must share a secure platform while remaining completely isolated from each other's data enclaves.</li>
                            <li><strong>Institutional Analytics:</strong> Ministers and Permanent Secretaries require high-level dashboards to monitor case volumes, disposition rates, and departmental efficiency.</li>
                        </ol>

                        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl my-10 not-prose">
                            <h4 className="text-white font-bold mb-4 flex items-center gap-2 text-center"><Shield className="w-5 h-5 text-indigo-400" /> Administrative Oversight</h4>
                            <p className="text-slate-400 text-sm text-center">
                                NomosDesk's "Global Control Plane" allows a central ministry to manage sub-tenants for various departments, ensuring unified security standards with local operational autonomy.
                            </p>
                        </div>

                        <h2 className="text-white">Overcoming Resistance to Change</h2>
                        <p>
                            The biggest hurdle in government modernization is not the tech—it's the training. Successful deployments prioritize **Intuitive Governance**. By building complex rules into simple, automated workflows, we ensure that compliance happens by default, not by effort.
                        </p>
                    </div>

                    <div className="mt-16 p-8 bg-slate-900 border border-slate-800 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
                        <div>
                            <h3 className="text-2xl font-bold text-white mb-2">Government Solutions</h3>
                            <p className="text-slate-400">View our specialized offerings for ministries and public bodies.</p>
                        </div>
                        <Button asLink="/for-government">Institutional Overview</Button>
                    </div>
                </div>
            </Section>
        </Layout>
    );
}
