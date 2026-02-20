import React from 'react';
import Layout from '../../layouts/Layout';
import SEO from '../../components/SEO';
import { Section, Button } from '../../components/ui';
import { Link } from '../../utils/ssr-compat';
import { Clock, Moon, Sun, ArrowRight, Zap } from 'lucide-react';

export default function TwentyFourSevenAutomation() {
    return (
        <Layout>
            <SEO
                title="24/7 Legal Intake Automation: Never Miss a Lead Again"
                description="Why 24/7 availability is critical for law firms in 2026. Automate your intake at night and on weekends with NomosDesk AI."
                schema={[{ '@context': 'https://schema.org', '@type': 'Article', headline: 'The Always-On Law Firm: 24/7 Intake with AI' }]}
            />
            <Section className="pt-32 pb-12 bg-slate-950">
                <div className="max-w-3xl mx-auto px-4">
                    <h1 className="text-4xl font-bold text-white mb-6">24/7 Legal Intake Automation</h1>
                    <p className="text-xl text-slate-300 mb-8 leading-relaxed">
                        The legal industry doesn't stop at 5:00 PM. In fact, some of your highest-value leads arrive late at night or on weekends when family and legal crises peak. Without <strong className="text-white">24/7 automation</strong>, you are leaving money on the table.
                    </p>
                </div>
            </Section>
            <Section className="pb-24 bg-slate-950">
                <div className="max-w-3xl mx-auto px-4 prose prose-invert">
                    <h2 className="text-2xl font-bold text-white mb-4">Capturing the 'After-Hours' Market</h2>
                    <p className="text-slate-400 mb-6">
                        An <Link to="/ai-legal-chatbot" className="text-indigo-400">AI Legal Chatbot</Link> provides the same high-quality intake experience at 2:00 AM as it does at 2:00 PM. This ensures that you are the first firm to engage with the prospect, drastically increasing your chance of retention.
                    </p>
                    <div className="grid sm:grid-cols-2 gap-8 my-12">
                        <div className="p-6 bg-slate-900 rounded-xl border border-slate-800">
                            <Moon className="w-6 h-6 text-indigo-400 mb-3" />
                            <h4 className="text-white font-bold mb-2">Passive Growth</h4>
                            <p className="text-xs text-slate-500">Wake up to qualified leads ready for follow-up.</p>
                        </div>
                        <div className="p-6 bg-slate-900 rounded-xl border border-slate-800">
                            <Sun className="w-6 h-6 text-indigo-400 mb-3" />
                            <h4 className="text-white font-bold mb-2">Constant Ready</h4>
                            <p className="text-xs text-slate-500">Zero downtime during holidays or weekends.</p>
                        </div>
                    </div>
                </div>
                <div className="max-w-3xl mx-auto text-center mt-12">
                    <Button onClick={() => window.dispatchEvent(new CustomEvent('nomosdesk-open-demo'))}>
                        Activate 24/7 Intake
                    </Button>
                </div>
            </Section>
        </Layout>
    );
}
