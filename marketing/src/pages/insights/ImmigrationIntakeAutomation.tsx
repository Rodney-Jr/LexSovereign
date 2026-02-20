import React from 'react';
import Layout from '../../layouts/Layout';
import SEO from '../../components/SEO';
import { Section, Button } from '../../components/ui';
import { Globe, FileText, ArrowRight, CheckCircle, Clock } from 'lucide-react';
import { Link } from '../../utils/ssr-compat';

export default function ImmigrationIntakeAutomation() {
    return (
        <Layout>
            <SEO
                title="Immigration Law Intake: Reducing KYC Latency with AI"
                description="How immigration law firms use AI intake assistants to automate document collection, genealogical vetting, and visa qualification."
            />
            <Section className="pt-32 pb-20 bg-slate-950">
                <div className="max-w-4xl mx-auto">
                    <Link to="/insights" className="text-indigo-400 text-sm font-medium mb-8 inline-flex items-center gap-2 hover:gap-3 transition-all">
                        <ArrowRight className="w-4 h-4 rotate-180" /> Back to Insights
                    </Link>
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-8">
                        Beyond the Form: Automating Immigration KYC with AI
                    </h1>
                    <div className="flex items-center gap-4 mb-12 text-slate-500 text-sm">
                        <span className="bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-full border border-indigo-500/20">Immigration Law</span>
                        <span>10 min read</span>
                        <span>Feb 20, 2026</span>
                    </div>

                    <div className="prose prose-invert max-w-none">
                        <p className="text-xl text-slate-300 leading-relaxed mb-8">
                            Immigration law is uniquely document-intensive. From birth certificates to visa histories, the "Know Your Customer" (KYC) phase can take weeks of manual back-and-forth. In 2026, AI is collapsing this timeline from weeks to minutes.
                        </p>

                        <h2 className="text-white">The Latency Bottleneck</h2>
                        <p>
                            Most immigration firms lose prospects during the initial data collection phase. Clients find the sheer volume of required information overwhelming. An AI Intake Assistant breaks this down into a conversational experience, collecting data in small, manageable chunks.
                        </p>

                        <div className="bg-slate-900 border border-indigo-500/20 p-8 rounded-2xl my-10 flex flex-col md:flex-row gap-8 items-center">
                            <div className="w-16 h-16 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400 shrink-0">
                                <FileText className="w-8 h-8" />
                            </div>
                            <div>
                                <h4 className="text-white font-bold mb-2">Automated Document Scanning</h4>
                                <p className="text-slate-500 text-xs">
                                    NomosDesk's AI allows clients to upload photos of passports or visas directly in the chat. The AI extracts the relevant data (expiry, visa type, entry dates) and populates the matter file automatically.
                                </p>
                            </div>
                        </div>

                        <h2 className="text-white">Multi-Language Accessibility</h2>
                        <p>
                            Immigration clients often feel more comfortable communicating in their native language. AI assistants can now handle complex legal vetting in 50+ languages simultaneously, translating the results for the attorney in real-time. This increases trust and ensures that no critical details are "lost in translation."
                        </p>
                    </div>

                    <div className="mt-16 p-8 bg-indigo-950/20 border border-indigo-900/30 rounded-3xl text-center">
                        <h3 className="text-2xl font-bold text-white mb-4">Scale Your Global Practice</h3>
                        <p className="text-slate-300 mb-8">See how AI turns complex immigration vetting into a seamless experience.</p>
                        <Button onClick={() => window.dispatchEvent(new CustomEvent('nomosdesk-open-demo'))}>
                            Try the Immigration Assistant
                        </Button>
                    </div>
                </div>
            </Section>
        </Layout>
    );
}
