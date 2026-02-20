import React from 'react';
import Layout from '../../layouts/Layout';
import SEO from '../../components/SEO';
import { Section, Button } from '../../components/ui';
import { Link } from '../../utils/ssr-compat';
import { DollarSign, Zap, Users, ArrowRight, BarChart3 } from 'lucide-react';

export default function ReducingIntakeCosts() {
    return (
        <Layout>
            <SEO
                title="Reducing Intake Costs with AI: Operational Efficiency for Law Firms"
                description="Learn how to lower your law firm's cost-per-lead and cost-per-retainer using AI automation. Optimize your front office with NomosDesk."
                schema={[{ '@context': 'https://schema.org', '@type': 'Article', headline: 'Financial Optimization: Cutting Legal Intake Overhead with AI' }]}
            />
            <Section className="pt-32 pb-12 bg-slate-950">
                <div className="max-w-3xl mx-auto px-4">
                    <h1 className="text-4xl font-bold text-white mb-6">Reducing Intake Costs with AI</h1>
                    <p className="text-xl text-slate-300 mb-8 leading-relaxed">
                        Intake is often the most expensive non-billable function in a law firm. Between salaries for intake specialists and the cost of missed leads, the overhead is staggering. <strong className="text-white">AI automation</strong> provides a path to 24/7 coverage at a fraction of the cost.
                    </p>
                </div>
            </Section>
            <Section className="pb-24 bg-slate-950">
                <div className="max-w-3xl mx-auto px-4 prose prose-invert">
                    <h2 className="text-2xl font-bold text-white mb-4">The True Cost of Manual Intake</h2>
                    <p className="text-slate-400 mb-6">
                        Answering services and dedicated staff can cost thousands of dollars per month. Plus, they often miss the nuance of quality cases. An <Link to="/ai-legal-chatbot" className="text-indigo-400">AI Legal Chatbot</Link> never gets tired, never misses a call, and qualfies cases better than a script.
                    </p>
                    <h2 className="text-2xl font-bold text-white mb-4">Optimizing Your Front Office</h2>
                    <p className="text-slate-400 mb-6">
                        By deploying <Link to="/ai-chatbot-for-personal-injury-lawyers" className="text-indigo-400">automated screening</Link>, you allow your team to focus exclusively on signed retainers and high-value legal work.
                    </p>
                    <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl mb-12">
                        <h4 className="text-white font-bold mb-4">Cost vs. Value</h4>
                        <ul className="space-y-4 text-sm text-slate-400">
                            <li className="flex items-center gap-2"><DollarSign className="w-4 h-4 text-emerald-500" /> Lower Cost-Per-Lead (CPL)</li>
                            <li className="flex items-center gap-2"><DollarSign className="w-4 h-4 text-emerald-500" /> Eliminated Answering Service Fees</li>
                            <li className="flex items-center gap-2"><DollarSign className="w-4 h-4 text-emerald-500" /> Higher Associate Productivity</li>
                        </ul>
                    </div>
                </div>
                <div className="max-w-3xl mx-auto text-center mt-12">
                    <Button onClick={() => window.dispatchEvent(new CustomEvent('nomosdesk-open-demo'))}>
                        Calculate Your Savings
                    </Button>
                </div>
            </Section>
        </Layout>
    );
}
