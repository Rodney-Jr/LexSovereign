import React from 'react';
import Layout from '../../layouts/Layout';
import SEO from '../../components/SEO';
import { Section, Button } from '../../components/ui';
import { Link } from '../../utils/ssr-compat';
import { BarChart3, TrendingUp, Zap, Clock, CheckCircle } from 'lucide-react';

export default function ChatbotROI() {
    return (
        <Layout>
            <SEO
                title="AI Chatbot ROI for Law Firms: Measuring Success in 2026"
                description="How to calculate the return on investment for legal AI chatbots. Track conversion, time savings, and lead acquisition costs."
                schema={[{ '@context': 'https://schema.org', '@type': 'Article', headline: 'The ROI Framework for Legal Intake Automation' }]}
            />
            <Section className="pt-32 pb-12 bg-slate-950">
                <div className="max-w-3xl mx-auto px-4 text-center">
                    <h1 className="text-4xl font-bold text-white mb-6">AI Chatbot ROI for Law Firms</h1>
                    <p className="text-xl text-slate-300 mb-8 leading-relaxed">
                        Investing in AI should be a data-driven decision. To understand the true <strong className="text-white">ROI of an AI Chatbot</strong>, you must look beyond just 'number of chats' and focus on conversion and time recovery.
                    </p>
                </div>
            </Section>
            <Section className="pb-24 bg-slate-950">
                <div className="max-w-3xl mx-auto px-4 prose prose-invert">
                    <h2 className="text-2xl font-bold text-white mb-4">Key Metrics to Track</h2>
                    <ul className="space-y-6 mb-12">
                        <li>
                            <h4 className="text-white font-bold">1. Conversion Uplift</h4>
                            <p className="text-sm text-slate-400">Measure the difference in lead volume between your static form and the <Link to="/ai-legal-chatbot" className="text-indigo-400">AI Intake Chatbot</Link>.</p>
                        </li>
                        <li>
                            <h4 className="text-white font-bold">2. Time Recovery</h4>
                            <p className="text-sm text-slate-400">Calculate hours saved by automating initial qualification calls. Typically 10-20 hours per month for small firms.</p>
                        </li>
                    </ul>
                    <div className="bg-indigo-600/5 border border-indigo-500/20 p-8 rounded-2xl">
                        <h3 className="text-white font-bold mb-4">Case Study Snapshot</h3>
                        <p className="text-slate-300 text-sm">
                            A mid-sized PI firm saw a <strong className="text-white">12x ROI</strong> in their first quarter by capturing $250k in case value from after-hours leads that would have otherwise been lost.
                        </p>
                    </div>
                </div>
                <div className="max-w-3xl mx-auto text-center mt-12">
                    <Button variant="outline" asLink="/pricing">
                        Check Out ROI Plans
                    </Button>
                </div>
            </Section>
        </Layout>
    );
}
