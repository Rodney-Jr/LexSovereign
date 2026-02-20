import React from 'react';
import Layout from '../../layouts/Layout';
import SEO from '../../components/SEO';
import { Section, Button } from '../../components/ui';
import { Link } from '../../utils/ssr-compat';
import { Briefcase, ShieldCheck, Zap, Globe, Layers } from 'lucide-react';

export default function EnterpriseIntake() {
    return (
        <Layout>
            <SEO
                title="Enterprise AI Intake for Corporate Legal Departments | 2026 Report"
                description="Discover how enterprise legal departments are using AI to manage high-volume intake and multi-departmental routing. Optimize ROI and governance."
                schema={[{ '@context': 'https://schema.org', '@type': 'Article', headline: 'The Evolution of Corporate Legal Intake: AI at Scale' }]}
            />
            <Section className="pt-32 pb-12 bg-slate-950">
                <div className="max-w-3xl mx-auto px-4">
                    <h1 className="text-4xl font-bold text-white mb-6">Enterprise AI Intake for Corporate Legal</h1>
                    <p className="text-xl text-slate-300 mb-8 leading-relaxed">
                        Corporate legal departments and large-scale firms handle thousands of inquiries across multiple practice areas. Managing this volume manually is not just inefficient—it's a risk to <strong className="text-white">institutional governance</strong>.
                    </p>
                </div>
            </Section>
            <Section className="pb-24 bg-slate-950">
                <div className="max-w-3xl mx-auto px-4 prose prose-invert">
                    <h2 className="text-2xl font-bold text-white mb-4">Centralized Intake & Automated Routing</h2>
                    <p className="text-slate-400 mb-6">
                        NomosDesk allows enterprises to deploy a single <Link to="/ai-legal-chatbot" className="text-indigo-400">intelligent entry point</Link> that routes inquiries based on complex logic: Corporate, Employment, IP, or Litigation.
                    </p>
                    <h2 className="text-2xl font-bold text-white mb-4">Institutional Governance & Compliance</h2>
                    <p className="text-slate-400 mb-6">
                        For enterprise departments, data cannot reside in public clouds. Our <Link to="/security-and-compliance" className="text-indigo-400">Sovereign Cloud options</Link> ensure that every interaction remains within your firewall, meeting the strictest institutional security standards.
                    </p>
                    <div className="grid sm:grid-cols-2 gap-6 my-12">
                        <div className="p-6 bg-slate-900 rounded-xl border border-slate-800">
                            <Layers className="w-6 h-6 text-indigo-400 mb-3" />
                            <h4 className="text-white font-bold mb-2">High Volume Stability</h4>
                            <p className="text-xs text-slate-500">Handle 100,000+ interactions monthly with sub-second response times.</p>
                        </div>
                        <div className="p-6 bg-slate-900 rounded-xl border border-slate-800">
                            <ShieldCheck className="w-6 h-6 text-indigo-400 mb-3" />
                            <h4 className="text-white font-bold mb-2">Audit-Ready Records</h4>
                            <p className="text-xs text-slate-500">Unalterable logs of every intake conversational event for compliance audits.</p>
                        </div>
                    </div>
                    <p className="text-slate-400 mb-8 text-center italic">
                        "NomosDesk allowed our 50-person legal department to reduce intake triage time by 75% while improving data accuracy."
                    </p>
                </div>
                <div className="max-w-3xl mx-auto text-center mt-12">
                    <Button onClick={() => window.dispatchEvent(new CustomEvent('nomosdesk-open-demo'))}>
                        Contact Enterprise Sales
                    </Button>
                </div>
            </Section>
        </Layout>
    );
}
