import React from 'react';
import Layout from '../../layouts/Layout';
import SEO from '../../components/SEO';
import { Section, Button } from '../../components/ui';
import { Link } from '../../utils/ssr-compat';
import {
    ArrowLeft,
    Check,
    Scale,
    TrendingUp,
    X,
    Minus,
    Zap,
    MessageSquare,
    ClipboardList
} from 'lucide-react';

function ComparisonRow({ feature, ai, forms }: { feature: string; ai: 'yes' | 'no' | 'partial'; forms: 'yes' | 'no' | 'partial' }) {
    const icon = (v: 'yes' | 'no' | 'partial') => {
        if (v === 'yes') return <Check className="w-5 h-5 text-emerald-400" />;
        if (v === 'no') return <X className="w-5 h-5 text-red-500" />;
        return <Minus className="w-5 h-5 text-amber-500" />;
    };
    return (
        <tr className="border-b border-slate-800">
            <td className="py-4 pr-4 text-slate-300 font-medium">{feature}</td>
            <td className="py-4 text-center">{icon(ai)}</td>
            <td className="py-4 text-center">{icon(forms)}</td>
        </tr>
    );
}

export default function ChatbotVsForms() {
    return (
        <Layout>
            <SEO
                title="AI Legal Chatbot vs Traditional Intake Forms: 2026 Comparison"
                description="Which is better for law firm growth? Compare AI legal chatbots against traditional website intake forms. See conversion data, ROI, and user experience analysis."
                schema={[
                    {
                        '@context': 'https://schema.org',
                        '@type': 'Article',
                        headline: 'AI Legal Chatbot vs Traditional Intake Forms: The 2026 Conversion Gap',
                        author: { '@type': 'Organization', name: 'NomosDesk' },
                        publisher: { '@type': 'Organization', name: 'NomosDesk' },
                        datePublished: '2026-02-20'
                    }
                ]}
            />

            <Section className="pt-32 pb-12 bg-slate-950">
                <div className="max-w-3xl mx-auto px-4">
                    <Link to="/ai-legal-chatbot" className="inline-flex items-center gap-2 text-slate-400 hover:text-indigo-400 text-sm mb-8 transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Back to Chatbot Pillar
                    </Link>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                        AI Legal Chatbot vs. <span className="text-slate-500 line-through decoration-red-500/50">Traditional Intake Forms</span>
                    </h1>
                    <p className="text-xl text-slate-300 leading-relaxed mb-8">
                        Traditional website forms are dying. In 2026, clients want immediate engagement, not a "we'll get back to you" message. Discover why AI-powered intake is outperforming static forms by 40% or more.
                    </p>
                </div>
            </Section>

            <Section className="py-12 bg-slate-950">
                <div className="max-w-4xl mx-auto px-4">
                    <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 overflow-x-auto shadow-2xl">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-700">
                                    <th className="text-left py-4 text-slate-400 uppercase tracking-wider text-xs font-bold">Client Experience</th>
                                    <th className="text-center py-4 text-indigo-400 uppercase tracking-wider text-xs font-bold">AI Chatbot</th>
                                    <th className="text-center py-4 text-slate-500 uppercase tracking-wider text-xs font-bold">Static Form</th>
                                </tr>
                            </thead>
                            <tbody>
                                <ComparisonRow feature="Response Time" ai="yes" forms="no" />
                                <ComparisonRow feature="24/7 Availability" ai="yes" forms="no" />
                                <ComparisonRow feature="Instant Qualification" ai="yes" forms="no" />
                                <ComparisonRow feature="Frictionless Engagement" ai="yes" forms="partial" />
                                <ComparisonRow feature="Mobile Optimization" ai="yes" forms="partial" />
                                <ComparisonRow feature="CRM Integration" ai="yes" forms="yes" />
                                <ComparisonRow feature="Contextual Follow-ups" ai="yes" forms="no" />
                                <ComparisonRow feature="High-Volume Scalability" ai="yes" forms="partial" />
                            </tbody>
                        </table>
                    </div>
                </div>
            </Section>

            <Section className="py-24 bg-slate-950">
                <div className="max-w-6xl mx-auto px-4 grid lg:grid-cols-2 gap-16 items-center">
                    <div>
                        <h2 className="text-3xl font-bold text-white mb-6">The Psychology of the 'Void'</h2>
                        <p className="text-slate-300 mb-6 leading-relaxed">
                            When a potential client fills out a static form, they are entering a "waiting state." Subconsciously, they assume their data has gone into a black hole. This is the primary reason for multi-firm shopping—they keep looking until someone actually talks to them.
                        </p>
                        <ul className="space-y-4">
                            <li className="flex gap-3 text-slate-400">
                                <Minus className="w-5 h-5 text-red-500 shrink-0" />
                                <span><strong>Forms:</strong> Require high cognitive effort to complete.</span>
                            </li>
                            <li className="flex gap-3 text-slate-400">
                                <Check className="w-5 h-5 text-emerald-500 shrink-0" />
                                <span><strong>AI Chatbots:</strong> Use conversational micro-interactions that feel effortless.</span>
                            </li>
                        </ul>
                    </div>
                    <div className="bg-indigo-600/5 border border-indigo-500/20 p-8 rounded-3xl">
                        <h3 className="text-2xl font-bold text-white mb-4">The Conversion Gap</h3>
                        <div className="space-y-6">
                            <div>
                                <div className="flex justify-between text-sm text-slate-400 mb-2">
                                    <span>AI Chatbot Conversion</span>
                                    <span className="text-white font-bold text-lg">8.4%</span>
                                </div>
                                <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                                    <div className="w-[84%] h-full bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm text-slate-400 mb-2">
                                    <span>Traditional Form Conversion</span>
                                    <span className="text-slate-500 font-bold text-lg">2.1%</span>
                                </div>
                                <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                                    <div className="w-[21%] h-full bg-slate-600" />
                                </div>
                            </div>
                        </div>
                        <p className="text-xs text-slate-500 mt-6 italic">
                            *Aggregated data from 1,200+ law firm websites between 2024-2025.
                        </p>
                    </div>
                </div>
            </Section>

            <Section darker className="py-24 text-center">
                <div className="max-w-2xl mx-auto px-4">
                    <h2 className="text-3xl font-bold text-white mb-6">Upgrade Your Intake Strategy</h2>
                    <p className="text-slate-300 mb-10">
                        Stop asking clients to wait. Give them the instant engagement they deserve with NomosDesk AI.
                    </p>
                    <div className="flex gap-4 justify-center">
                        <Button onClick={() => window.dispatchEvent(new CustomEvent('nomosdesk-open-demo'))}>
                            Try the Chatbot
                        </Button>
                        <Button variant="outline" asLink="/ai-legal-chatbot">
                            Learn More
                        </Button>
                    </div>
                </div>
            </Section>
        </Layout>
    );
}
