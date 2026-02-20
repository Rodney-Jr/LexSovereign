import React from 'react';
import Layout from '../../layouts/Layout';
import SEO from '../../components/SEO';
import { Section, Button } from '../../components/ui';
import { Link } from '../../utils/ssr-compat';
import { Gavel, Shield, Scale, ArrowRight, Zap } from 'lucide-react';

export default function GovernmentChatbots() {
    return (
        <Layout>
            <SEO
                title="How Government Agencies Use AI Chatbots | 2026 Use Cases"
                description="Explore the role of AI in public sector legal intake. Learn how government agencies automate citizen inquiries while maintaining strict data sovereignty."
                schema={[{ '@context': 'https://schema.org', '@type': 'Article', headline: 'AI-Powered Citizen Legal Services: Government Use Cases' }]}
            />
            <Section className="pt-32 pb-12 bg-slate-950">
                <div className="max-w-3xl mx-auto px-4 text-center">
                    <h1 className="text-4xl font-bold text-white mb-6">How Government Agencies Use AI Chatbots</h1>
                    <p className="text-xl text-slate-300 mb-8 leading-relaxed">
                        Public sector legal departments are under pressure to handle high volumes of citizen inquiries with limited budgets. <strong className="text-white">AI Chatbots</strong> provide a secure, efficient pathway to automate public intake.
                    </p>
                </div>
            </Section>
            <Section className="pb-24 bg-slate-950">
                <div className="max-w-3xl mx-auto px-4 prose prose-invert">
                    <h2 className="text-2xl font-bold text-white mb-4">Departmental Triage at Scale</h2>
                    <p className="text-slate-400 mb-6">
                        NomosDesk allows governments to triage citizen requests—routing them to the Public Defender, Prosecutor's Office, or Civil Rights departments automatically based on the conversational context.
                    </p>
                    <h2 className="text-2xl font-bold text-white mb-4">Uncompromising Data Sovereignty</h2>
                    <p className="text-slate-400 mb-6">
                        Governments require Level 3 or 4 data sovereignty. NomosDesk is the only <Link to="/ai-legal-chatbot" className="text-indigo-400">AI Legal Chatbot</Link> that can be deployed on <Link to="/ai-chatbot-for-government-legal-departments" className="text-indigo-400">private infrastructure</Link>, ensuring sensitive citizen data never leaves government-controlled servers.
                    </p>
                    <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl mb-12">
                        <h4 className="text-white font-bold mb-4">Key Benefits for Public Sector</h4>
                        <ul className="space-y-4 text-slate-400 font-medium text-sm">
                            <li className="flex items-center gap-3"><Scale className="w-5 h-5 text-indigo-400" /> Increased Access to Justice (A2J)</li>
                            <li className="flex items-center gap-3"><Shield className="w-5 h-5 text-indigo-400" /> Strict Data Residency Compliance</li>
                            <li className="flex items-center gap-3"><Zap className="w-5 h-5 text-indigo-400" /> 80% Reduction in Routine Inquiry Response Time</li>
                        </ul>
                    </div>
                </div>
                <div className="max-w-3xl mx-auto text-center mt-12">
                    <Button onClick={() => window.dispatchEvent(new CustomEvent('nomosdesk-open-demo'))}>
                        View Government Case Studies
                    </Button>
                </div>
            </Section>
        </Layout>
    );
}
