import React from 'react';
import Layout from '../../layouts/Layout';
import SEO from '../../components/SEO';
import { Section, Button } from '../../components/ui';
import { Bot, Zap, TrendingUp, Shield, Lock, Calculator, ArrowRight, MessageSquare, Cpu } from 'lucide-react';
import { Link } from '../../utils/ssr-compat';

export default function AILegalSoftware() {
    return (
        <Layout>
            <SEO
                title="AI for Law Firms: 2026 Strategic Implementation & ROI Guide"
                description="Maximize law firm ROI with AI. Learn about automated intake, conflict checking, and workflow intelligence without compromising legal governance."
                schema={[
                    {
                        "@context": "https://schema.org",
                        "@type": "SoftwareApplication",
                        "name": "NomosDesk AI Enclaves",
                        "applicationCategory": "BusinessApplication",
                        "operatingSystem": "Web-based",
                        "description": "Secure AI infrastructure for legal professionals."
                    }
                ]}
            />

            {/* Hero Section */}
            <Section className="pt-32 pb-20 relative overflow-hidden bg-slate-950">
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 blur-[100px] rounded-full -mr-48 -mt-48" />
                <div className="max-w-5xl mx-auto relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-medium mb-6">
                        <Bot className="w-4 h-4" /> AI & Judicial Intelligence
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 leading-tight tracking-tight">
                        AI for Law Firms: <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-emerald-300">
                            Predictable ROI. <br className="hidden md:block" /> Absolute Governance.
                        </span>
                    </h1>
                    <p className="text-xl text-slate-300 leading-relaxed max-w-3xl mb-12">
                        Moving past the hype of general-purpose AI. Explore how specialized Judicial Enclaves and automated intake assistants are delivering measurable efficiency for modern law firms.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 mb-20">
                        <Button size="lg" onClick={() => window.dispatchEvent(new CustomEvent('nomosdesk-open-demo'))}>
                            Request Private Demo
                        </Button>
                        <Button asLink="/client-intake-assistant" variant="outline" size="lg">
                            Explore Intake AI
                        </Button>
                    </div>
                </div>
            </Section>

            {/* ROI Calculator Preview */}
            <Section darker className="py-24">
                <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Measuring the Impact of AI</h2>
                        <p className="text-slate-300 text-lg mb-8">
                            Most law firms fail to see ROI from AI because they deploy fragmented tools. Institutional AI must be integrated into your core matter management workflow.
                        </p>
                        <div className="space-y-6">
                            <div className="flex gap-4">
                                <div className="w-10 h-10 bg-indigo-500/10 rounded-lg flex items-center justify-center text-indigo-400 shrink-0">
                                    <TrendingUp className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-white mb-1">Time Recovery</h4>
                                    <p className="text-slate-400 text-sm">Automating initial client discovery and intake recovers 12+ hours per associate, weekly.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-400 shrink-0">
                                    <Zap className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-white mb-1">Conflict Speed</h4>
                                    <p className="text-slate-400 text-sm">Reduce conflict search latency from hours to seconds with indexed matter memory.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl">
                        <div className="flex items-center gap-3 mb-8">
                            <Calculator className="w-6 h-6 text-indigo-400" />
                            <span className="text-white font-bold">Projected Efficiency Gain</span>
                        </div>
                        <div className="space-y-8">
                            <div>
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-slate-400">Manual Intake Reduction</span>
                                    <span className="text-indigo-400 font-bold">85%</span>
                                </div>
                                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-indigo-500 w-[85%]" />
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-slate-400">Research Accuracy Improvement</span>
                                    <span className="text-emerald-400 font-bold">40%</span>
                                </div>
                                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500 w-[40%]" />
                                </div>
                            </div>
                            <div className="pt-6 border-t border-slate-800">
                                <div className="text-sm text-slate-500 mb-2 uppercase tracking-wider font-bold">ESTIMATED FIRM-WIDE ROI</div>
                                <div className="text-4xl font-bold text-white">$142,000<span className="text-lg text-slate-500 font-normal"> / year per 10 associates</span></div>
                            </div>
                        </div>
                    </div>
                </div>
            </Section>

            {/* AI Use Cases */}
            <Section className="py-24">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-white mb-4">Strategic Use Cases for 2026</h2>
                        <p className="text-slate-400">How institutions are deploying AI to gain a competitive advantage.</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="p-8 bg-slate-900/40 border border-slate-800 rounded-2xl">
                            <MessageSquare className="w-10 h-10 text-blue-400 mb-6" />
                            <h3 className="text-xl font-bold text-white mb-4">AI Intake Assistants</h3>
                            <p className="text-slate-400 text-sm leading-relaxed mb-6">
                                24/7 client qualifying that directs high-intent leads to the correct practice head while automating the collection of essential KYC data.
                            </p>
                            <Link to="/client-intake-assistant" className="text-indigo-400 text-sm font-semibold flex items-center gap-2">
                                Explore Intake AI <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                        <div className="p-8 bg-slate-950 border border-indigo-500/20 rounded-2xl ring-1 ring-indigo-500/20">
                            <Shield className="w-10 h-10 text-indigo-400 mb-6" />
                            <h3 className="text-xl font-bold text-white mb-4">Conflict Intelligence</h3>
                            <p className="text-slate-400 text-sm leading-relaxed mb-6">
                                Moving beyond keyword matches. Our AI understands entity relationships, flagging potential conflicts that traditional Boolean searches miss.
                            </p>
                            <Link to="/insights/conflict-checking-software-law-firms" className="text-indigo-400 text-sm font-semibold flex items-center gap-2">
                                Learn about conflict AI <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                        <div className="p-8 bg-slate-900/40 border border-slate-800 rounded-2xl">
                            <Cpu className="w-10 h-10 text-emerald-400 mb-6" />
                            <h3 className="text-xl font-bold text-white mb-4">Judicial Enclaves</h3>
                            <p className="text-slate-400 text-sm leading-relaxed mb-6">
                                Research models grounded specifically in your jurisdiction's laws, preventing "hallucinations" and ensuring statutory precision.
                            </p>
                            <Link to="/for-government" className="text-indigo-400 text-sm font-semibold flex items-center gap-2">
                                Government AI <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            </Section>

            {/* Deep Content */}
            <Section className="py-24 bg-slate-950 font-inter">
                <div className="max-w-4xl mx-auto prose prose-invert">
                    <h2 className="text-white text-3xl font-bold mb-6">The Governance of AI: Preventing Data Leakage</h2>
                    <p className="text-slate-300 text-lg leading-relaxed mb-8">
                        The greatest risk of AI in the legal sector is not "incorrect answers," but data privacy violations. When firms use generic AI models, they risk leaking client privilege into the public training data. NomosDesk solves this by utilizing **Sovereign AI Enclaves**.
                    </p>
                    <div className="bg-slate-900 p-8 rounded-2xl border-l-4 border-indigo-500 mb-12">
                        <h4 className="text-white font-bold mb-4 flex items-center gap-2"><Lock className="w-4 h-4 text-indigo-400" /> Private Training Isolation</h4>
                        <p className="text-slate-300 text-sm italic">
                            "None of your firm's data is used to train global AI models. Every interaction occurs within a cryptographically isolated environment, ensuring your client's confidentiality remains absolute."
                        </p>
                    </div>

                    <h2 className="text-white text-3xl font-bold mb-6">Automating the Conflict Lifecycle</h2>
                    <p className="text-slate-300 text-lg leading-relaxed mb-8">
                        Traditional conflict checks are a manual bottleneck. AI allows for "Dynamic Conflict Monitoring," where the system continuously scans new filings and adverse parties against your current matter list in real-time, providing an early warning system for your partners.
                    </p>
                </div>
            </Section>

            {/* Internal Links */}
            <Section darker className="py-20">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-2xl font-bold text-white mb-8">Related Strategy Guides</h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        <Link to="/legal-practice-management-software" className="p-8 bg-slate-950 rounded-2xl border border-slate-800 hover:border-indigo-500/30 transition-all flex flex-col justify-between">
                            <div>
                                <Briefcase className="w-8 h-8 text-indigo-400 mb-4" />
                                <h4 className="text-white font-bold mb-2">Practice Management</h4>
                                <p className="text-slate-500 text-xs">The complete guide to institutional LPM in 2026.</p>
                            </div>
                            <ArrowRight className="w-4 h-4 text-slate-700 mt-6" />
                        </Link>
                        <Link to="/law-firm-crm-software" className="p-8 bg-slate-950 rounded-2xl border border-slate-800 hover:border-indigo-500/30 transition-all flex flex-col justify-between">
                            <div>
                                <Users className="w-8 h-8 text-indigo-400 mb-4" />
                                <h4 className="text-white font-bold mb-2">Legal CRM Guide</h4>
                                <p className="text-slate-500 text-xs">Managing the client lifecycle with automated intelligence.</p>
                            </div>
                            <ArrowRight className="w-4 h-4 text-slate-700 mt-6" />
                        </Link>
                        <Link to="/vs/nomosdesk-vs-clio" className="p-8 bg-slate-950 rounded-2xl border border-slate-800 hover:border-indigo-500/30 transition-all flex flex-col justify-between">
                            <div>
                                <Zap className="w-8 h-8 text-indigo-400 mb-4" />
                                <h4 className="text-white font-bold mb-2">Comparison: Clio</h4>
                                <p className="text-slate-500 text-xs">How NomosDesk AI compares to industry incumbents.</p>
                            </div>
                            <ArrowRight className="w-4 h-4 text-slate-700 mt-6" />
                        </Link>
                    </div>
                </div>
            </Section>

            {/* Bottom CTA */}
            <Section className="py-24 bg-slate-950 text-center">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-4xl font-bold text-white mb-6">Deploy Judicial Intelligence Today</h2>
                    <p className="text-xl text-slate-300 mb-10">Stop guessing about AI. Start implementing a secure, high-ROI strategy with NomosDesk.</p>
                    <Button size="lg" onClick={() => window.dispatchEvent(new CustomEvent('nomosdesk-open-demo'))}>
                        Request Private AI Audit
                    </Button>
                </div>
            </Section>
        </Layout>
    );
}
