import React from 'react';
import Layout from '../../layouts/Layout';
import SEO from '../../components/SEO';
import { Section, Button } from '../../components/ui';
import { Link } from '../../utils/ssr-compat';
import { MessageSquare, Bot, Zap, Globe, MousePointer2 } from 'lucide-react';

export default function ConversationalAILegal() {
    return (
        <Layout>
            <SEO
                title="Conversational AI for Legal Websites: The Future of UX"
                description="Learn why conversational interfaces are replacing static legal websites. Enhance user experience and lead qualification with NomosDesk."
                schema={[{ '@context': 'https://schema.org', '@type': 'Article', headline: 'Converational UX: The New Standard for Legal Websites' }]}
            />
            <Section className="pt-32 pb-12 bg-slate-950 text-center">
                <div className="max-w-4xl mx-auto px-4">
                    <h1 className="text-4xl font-bold text-white mb-6">Conversational AI for Legal Websites</h1>
                    <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
                        The era of the 'static' law firm website is over. In 2026, clients want to interact, not just read. <strong className="text-white">Conversational AI</strong> is turning websites into dynamic assets.
                    </p>
                </div>
            </Section>
            <Section className="pb-24 bg-slate-950">
                <div className="max-w-3xl mx-auto px-4 prose prose-invert">
                    <h2 className="text-2xl font-bold text-white mb-4">From Reading to Interacting</h2>
                    <p className="text-slate-400 mb-6">
                        A typical <Link to="/ai-legal-chatbot" className="text-indigo-400">Legal Intake Chatbot</Link> guide visitors through complex legal concepts, helping them identify their needs while simultaneously qualfying them for the firm.
                    </p>
                    <div className="p-8 bg-slate-900 border border-slate-800 rounded-3xl mb-12">
                        <h4 className="text-white font-bold mb-4">UX Statistics</h4>
                        <ul className="space-y-4 text-slate-500 text-sm">
                            <li className="flex items-center gap-2"><MousePointer2 className="w-4 h-4 text-indigo-400" /> 60% higher time-on-site</li>
                            <li className="flex items-center gap-2"><Bot className="w-4 h-4 text-indigo-400" /> 4.5x more leads generated</li>
                            <li className="flex items-center gap-2"><Zap className="w-4 h-4 text-indigo-400" /> Instant gratification for users</li>
                        </ul>
                    </div>
                </div>
                <div className="max-w-3xl mx-auto text-center mt-12">
                    <Button variant="outline" asLink="/ai-chatbot-vs-traditional-intake-forms">
                        See Success Stories
                    </Button>
                </div>
            </Section>
        </Layout>
    );
}
