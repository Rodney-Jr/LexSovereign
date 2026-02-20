import React from 'react';
import Layout from '../../layouts/Layout';
import SEO from '../../components/SEO';
import { Section, Button } from '../../components/ui';
import { Bot, MessageSquare, ArrowRight, CheckCircle, Zap } from 'lucide-react';
import { Link } from '../../utils/ssr-compat';

export default function FutureOfLegalChatbots() {
    return (
        <Layout>
            <SEO
                title="The Future of AI Chatbots in Legal Client Intake"
                description="Explore how AI-powered chatbots are transforming legal client intake by providing instant qualification and 24/7 engagement."
            />
            <Section className="pt-32 pb-20 bg-slate-950">
                <div className="max-w-4xl mx-auto">
                    <Link to="/insights" className="text-indigo-400 text-sm font-medium mb-8 inline-flex items-center gap-2 hover:gap-3 transition-all">
                        <ArrowRight className="w-4 h-4 rotate-180" /> Back to Insights
                    </Link>
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-8">
                        The Future of AI Chatbots in Legal Client Intake
                    </h1>
                    <div className="flex items-center gap-4 mb-12 text-slate-500 text-sm">
                        <span className="bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-full border border-indigo-500/20">AI & Automation</span>
                        <span>8 min read</span>
                        <span>Feb 20, 2026</span>
                    </div>

                    <div className="prose prose-invert max-w-none">
                        <p className="text-xl text-slate-300 leading-relaxed mb-8">
                            In 2026, the first point of contact between a potential client and a law firm is no longer a phone call or a web form—it's an AI Intake Assistant. These intelligent agents are moving beyond simple "IF/THEN" logic to provide a nuanced, empathetic, and highly efficient intake experience.
                        </p>

                        <h2 className="text-white">Why Static Web Forms are Failing</h2>
                        <p>
                            Traditional web forms are conversion killers. They are passive, demanding that the user do all the work while providing zero immediate value. In contrast, an AI chatbot provides "Instant Gratification," answering basic questions and qualifying the lead in real-time.
                        </p>

                        <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 my-10">
                            <h4 className="text-indigo-400 font-bold mb-4">Key Benefits of AI Intake:</h4>
                            <ul className="space-y-4">
                                <li className="flex gap-3"><CheckCircle className="w-5 h-5 text-emerald-500" /> 24/7 Availability without staff overhead.</li>
                                <li className="flex gap-3"><CheckCircle className="w-5 h-5 text-emerald-500" /> Instant conflict checking during the conversation.</li>
                                <li className="flex gap-3"><CheckCircle className="w-5 h-5 text-emerald-500" /> High-intent lead prioritization.</li>
                            </ul>
                        </div>

                        <h2 className="text-white">The ROI of Conversational Intake</h2>
                        <p>
                            Firms using NomosDesk's native AI assistant report up to an 85% reduction in manual intake labor. By the time a lawyer views the lead, the AI has already collected KYC data, performed a preliminary conflict search, and categorized the matter.
                        </p>
                    </div>

                    <div className="mt-16 p-8 bg-indigo-900/20 border border-indigo-900/30 rounded-3xl text-center">
                        <h3 className="text-2xl font-bold text-white mb-4">Ready to Automate Your Intake?</h3>
                        <p className="text-slate-300 mb-8">See how our AI Assistant can scale your firm's conversion rate.</p>
                        <Button onClick={() => window.dispatchEvent(new CustomEvent('nomosdesk-open-demo'))}>
                            Try the Demo Assistant
                        </Button>
                    </div>
                </div>
            </Section>
        </Layout>
    );
}
