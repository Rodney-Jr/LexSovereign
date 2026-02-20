import React from 'react';
import Layout from '../../layouts/Layout';
import SEO from '../../components/SEO';
import { Section, Button } from '../../components/ui';
import { Link } from '../../utils/ssr-compat';
import { Zap, Users, Home, ArrowRight, Shield, CheckCircle } from 'lucide-react';

export default function SmallFirmIntake() {
    return (
        <Layout>
            <SEO
                title="Legal Intake Automation for Small Law Firms | 2026 Strategy"
                description="How small law firms can use AI chatbots to compete with larger competitors. Learn about cost-effective intake automation and 24/7 lead qualification."
                schema={[{ '@context': 'https://schema.org', '@type': 'Article', headline: 'Leveling the Playing Field: AI Intake for Small Law Firms' }]}
            />
            <Section className="pt-32 pb-12 bg-slate-950">
                <div className="max-w-3xl mx-auto px-4 text-center">
                    <h1 className="text-4xl font-bold text-white mb-6">Legal Intake Automation for Small Law Firms</h1>
                    <p className="text-xl text-slate-300 mb-8 leading-relaxed">
                        Small law firms often lose leads because they lack 24/7 intake staff. In 2026, <strong className="text-white">AI Intake Automation</strong> is the 'great equalizer,' allowing solo practitioners and boutiques to compete with the biggest firms in the country.
                    </p>
                </div>
            </Section>
            <Section className="pb-24 bg-slate-950">
                <div className="max-w-3xl mx-auto px-4 prose prose-invert">
                    <h2 className="text-2xl font-bold text-white mb-4">The Challenge: Limited Manpower</h2>
                    <p className="text-slate-400 mb-6">
                        In a small firm, every minute spent on the phone with an unqualified lead is a minute taken away from billable work. Unlike big firms with dedicated intake departments, small firms need solutions that <Link to="/ai-legal-chatbot" className="text-indigo-400">automate the top-of-funnel</Link> entirely.
                    </p>
                    <h2 className="text-2xl font-bold text-white mb-4">Why AI Chatbots are the Solution</h2>
                    <p className="text-slate-400 mb-6">
                        An <Link to="/vs/ai-chatbot-vs-traditional-intake-forms" className="text-indigo-400">AI Legal Chatbot</Link> acts as a virtual intake specialist that never sleeps, never takes a holiday, and qualified leads more accurately than a generic answering service.
                    </p>
                    <ul className="space-y-4 mb-8">
                        <li className="flex gap-2 text-slate-300">
                            <CheckCircle className="w-5 h-5 text-indigo-500 shrink-0" />
                            <span><strong>Zero Wait Time:</strong> Clients get an immediate response, preventing them from calling the next firm on Google.</span>
                        </li>
                        <li className="flex gap-2 text-slate-300">
                            <CheckCircle className="w-5 h-5 text-indigo-500 shrink-0" />
                            <span><strong>Budget Friendly:</strong> NomosDesk costs less than a single monthly answering service bill.</span>
                        </li>
                    </ul>
                    <div className="bg-indigo-600/10 border border-indigo-500/20 p-8 rounded-2xl">
                        <h3 className="text-white font-bold mb-4">Competitive Edge</h3>
                        <p className="text-slate-300 text-sm">
                            With NomosDesk, a solo practitioner can provide a <strong className="text-white">superior digital experience</strong> than a Big Law firm still relying on slow, manual intake processes.
                        </p>
                    </div>
                </div>
                <div className="max-w-3xl mx-auto text-center mt-12">
                    <Button variant="outline" asLink="/pricing">
                        Check Our Small Firm Plans
                    </Button>
                </div>
            </Section>
        </Layout>
    );
}
