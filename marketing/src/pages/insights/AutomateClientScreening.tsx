import React from 'react';
import Layout from '../../layouts/Layout';
import SEO from '../../components/SEO';
import { Section, Button } from '../../components/ui';
import { Link } from '../../utils/ssr-compat';
import { Target, CheckCircle, Zap, Shield, HelpCircle } from 'lucide-react';

export default function AutomateClientScreening() {
    return (
        <Layout>
            <SEO
                title="How to Automate Client Screening for Law Firms | 2026 Guide"
                description="Learn the best practices for automating initial client screening. Improve lead quality and reduce staff overhead using AI-powered legal chatbots."
                schema={[{ '@context': 'https://schema.org', '@type': 'Article', headline: 'Optimizing the Top of Funnel: Automated Legal Screening' }]}
            />
            <Section className="pt-32 pb-12 bg-slate-950">
                <div className="max-w-3xl mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">How to Automate Client Screening</h1>
                    <p className="text-xl text-slate-300 mb-8 leading-relaxed">
                        Manually screening every incoming lead is the single biggest productivity killer in a modern law firm. Here's how to build an <strong className="text-white">automated high-performance screening engine</strong>.
                    </p>
                </div>
            </Section>
            <Section className="pb-24 bg-slate-950">
                <div className="max-w-3xl mx-auto px-4 prose prose-invert">
                    <h2 className="text-2xl font-bold text-white mb-4">Step 1: Define Your Ideal Client Profile (ICP)</h2>
                    <p className="text-slate-400 mb-6">
                        Before you automate, you must define what a "good" lead looks like. This includes geographic location, case type, and specific severity markers (e.g., "Was a police report filed?").
                    </p>
                    <h2 className="text-2xl font-bold text-white mb-4">Step 2: Deploy Conversational Logic</h2>
                    <p className="text-slate-400 mb-6">
                        Instead of a 20-field form, use an <Link to="/ai-legal-chatbot" className="text-indigo-400">AI Chatbot</Link> to ask these questions in a natural, empathetic flow. This increases completion rates by up to 300% compared to static forms.
                    </p>
                    <h2 className="text-2xl font-bold text-white mb-4">Step 3: Automated Scoring and Routing</h2>
                    <p className="text-slate-400 mb-8">
                        Once data is collected, NomosDesk scores the lead based on your criteria. High-score leads are immediately routed to a senior associate's cell phone, while low-score leads are sent an automated "thank you, but we cannot help at this time" email.
                    </p>
                    <div className="p-8 bg-indigo-600/5 border border-indigo-500/20 rounded-2xl mb-12">
                        <h3 className="text-indigo-400 font-bold mb-4 flex items-center gap-2 underline decoration-indigo-500/30">
                            <Zap className="w-5 h-5" /> ROI Insight
                        </h3>
                        <p className="text-slate-300 text-sm">
                            Firms using automated screening report a <strong className="text-white">50% reduction</strong> in time spent on non-billable intake calls within the first 60 days.
                        </p>
                    </div>
                </div>
                <div className="max-w-3xl mx-auto text-center mt-12">
                    <Button variant="outline" asLink="/ai-chatbot-vs-traditional-intake-forms">
                        Compare Forms vs. Chatbots
                    </Button>
                </div>
            </Section>
        </Layout>
    );
}
