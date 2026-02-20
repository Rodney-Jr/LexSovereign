import React from 'react';
import Layout from '../../layouts/Layout';
import SEO from '../../components/SEO';
import { Section, Button } from '../../components/ui';
import { MessageSquare, Zap, Clock, Shield, ArrowRight, CheckCircle, Lock, Globe, Users } from 'lucide-react';
import { Link } from '../../utils/ssr-compat';

export default function LegalIntakeAutomation() {
    return (
        <Layout>
            <SEO
                title="Automated Legal Intake Software: 2026 Practice Area Guide"
                description="Scale your law firm with AI-driven intake automation. Learn how to qualify leads and collect data for Personal Injury, Immigration, and Family Law."
                schema={[
                    {
                        "@context": "https://schema.org",
                        "@type": "SoftwareApplication",
                        "name": "NomosDesk Intake Assistant",
                        "applicationCategory": "BusinessApplication",
                        "operatingSystem": "Web-based",
                        "description": "AI-powered client intake and qualification software for law firms."
                    }
                ]}
            />

            {/* Hero Section */}
            <Section className="pt-32 pb-20 relative overflow-hidden bg-slate-950">
                <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-500/5 blur-[100px] rounded-full -ml-48 -mt-48" />
                <div className="max-w-5xl mx-auto relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm font-medium mb-6">
                        <Zap className="w-4 h-4" /> Response Speed Optimization
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 leading-tight tracking-tight">
                        Automated Legal Intake: <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
                            Scale Without the Staff.
                        </span>
                    </h1>
                    <p className="text-xl text-slate-300 leading-relaxed max-w-3xl mb-12">
                        Stop acting as a receptionist. Use AI to qualify, categorize, and collect data from prospects 24/7. Transform your intake from a manual bottleneck into an automated revenue funnel.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 mb-20">
                        <Button size="lg" onClick={() => window.dispatchEvent(new CustomEvent('nomosdesk-open-demo'))}>
                            Request Private Demo
                        </Button>
                        <Button asLink="/client-intake-assistant" variant="outline" size="lg">
                            See AI in Action
                        </Button>
                    </div>
                </div>
            </Section>

            {/* Practice Area Specialization */}
            <Section darker className="py-24">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Automated Intake for Every Practice</h2>
                        <p className="text-slate-400 max-w-2xl mx-auto">Generic forms don't work. NomosDesk provides practice-specific logic for high-volume areas.</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="bg-slate-900/50 p-8 rounded-2xl border border-slate-800 hover:border-emerald-500/30 transition-all group">
                            <h3 className="text-xl font-bold text-white mb-4">Personal Injury</h3>
                            <p className="text-slate-400 text-sm leading-relaxed mb-6">
                                Instant qualification based on statute of limitations, liability facts, and insurance availability. Recover hours of vetting time.
                            </p>
                            <ul className="space-y-2 mb-8">
                                <li className="flex items-center gap-2 text-xs text-slate-500"><CheckCircle className="w-3 h-3 text-emerald-500" /> Police Report Collection</li>
                                <li className="flex items-center gap-2 text-xs text-slate-500"><CheckCircle className="w-3 h-3 text-emerald-500" /> Injury Categorization</li>
                            </ul>
                        </div>
                        <div className="bg-slate-900/50 p-8 rounded-2xl border border-slate-800 hover:border-emerald-500/30 transition-all group">
                            <h3 className="text-xl font-bold text-white mb-4">Immigration Law</h3>
                            <p className="text-slate-400 text-sm leading-relaxed mb-6">
                                Collect genealogical data, visa history, and document scans through a secure, multi-language AI interface.
                            </p>
                            <ul className="space-y-2 mb-8">
                                <li className="flex items-center gap-2 text-xs text-slate-500"><CheckCircle className="w-3 h-3 text-emerald-500" /> Passport/Visa Scanning</li>
                                <li className="flex items-center gap-2 text-xs text-slate-500"><CheckCircle className="w-3 h-3 text-emerald-500" /> Multi-Language Support</li>
                            </ul>
                        </div>
                        <div className="bg-slate-900/50 p-8 rounded-2xl border border-slate-800 hover:border-emerald-500/30 transition-all group">
                            <h3 className="text-xl font-bold text-white mb-4">Family Law</h3>
                            <p className="text-slate-400 text-sm leading-relaxed mb-6">
                                Sensitive, empathetic data collection for divorce and custody matters. Categorize assets and child-related facts automatically.
                            </p>
                            <ul className="space-y-2 mb-8">
                                <li className="flex items-center gap-2 text-xs text-slate-500"><CheckCircle className="w-3 h-3 text-emerald-500" /> Asset Disclosure Forms</li>
                                <li className="flex items-center gap-2 text-xs text-slate-500"><CheckCircle className="w-3 h-3 text-emerald-500" /> Empathetic AI Tone</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </Section>

            {/* AI vs Static Forms */}
            <Section className="py-24 bg-slate-950">
                <div className="max-w-5xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <div className="relative">
                            <div className="absolute inset-0 bg-emerald-500/10 blur-[80px] rounded-full" />
                            <div className="relative bg-slate-900 border border-slate-800 p-8 rounded-3xl">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
                                        <MessageSquare className="w-5 h-5 text-emerald-400" />
                                        <span className="text-sm text-slate-300">"Was anyone else in the vehicle?"</span>
                                    </div>
                                    <div className="flex items-center gap-3 bg-emerald-600/10 p-3 rounded-xl border border-emerald-500/20 self-end">
                                        <span className="text-sm text-white">"Yes, my son was in the back seat."</span>
                                    </div>
                                    <div className="flex items-center gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
                                        <Zap className="w-5 h-5 text-indigo-400" />
                                        <span className="text-xs text-indigo-400 font-bold uppercase">Dynamic Trigger: Add Child Injury Form</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold text-white mb-6">Conversational vs. Static</h2>
                            <p className="text-slate-300 text-lg mb-8 leading-relaxed">
                                Static web forms suffer from high abandonment rates. NomosDesk's AI Intake Assistant uses "Selective Branching" logic — only asking relevant follow-up questions based on the prospect's answers.
                            </p>
                            <div className="space-y-4">
                                <div className="flex gap-4">
                                    <Clock className="w-6 h-6 text-emerald-400 shrink-0" />
                                    <div>
                                        <h4 className="font-bold text-white mb-1">Instant Qualification</h4>
                                        <p className="text-slate-500 text-sm">Know if you can take the case within seconds of the first interaction.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <Shield className="w-6 h-6 text-emerald-400 shrink-0" />
                                    <div>
                                        <h4 className="font-bold text-white mb-1">Secure Conflict Check</h4>
                                        <p className="text-slate-500 text-sm">Background conflict checks happen as the lead provided party names.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Section>

            {/* Content Deep Dive */}
            <Section className="py-24 bg-slate-950">
                <div className="max-w-4xl mx-auto prose prose-invert">
                    <h2 className="text-white text-3xl font-bold mb-6">The ROI of 24/7 Intake</h2>
                    <p className="text-slate-300 text-lg leading-relaxed mb-8">
                        Legal inquiries don't wait for business hours. In fact, over 60% of personal legal inquiries happen between 6 PM and 6 AM. Firms without automated intake simply lose these leads to faster-responding competitors. NomosDesk ensures you are the first to respond, every time.
                    </p>

                    <h3 className="text-white text-2xl font-bold mb-4">Eliminating the "KYC Bottleneck"</h3>
                    <p className="text-slate-300 text-lg leading-relaxed mb-8">
                        The collection of Know Your Customer (KYC) documentation and initial matter facts is the most tedious part of the legal lifecycle. By automating this through a secure AI enclaves, your associates receive a "Ready-to-File" brief rather than a messy collection of emails and scans.
                    </p>

                    <h2 className="text-white text-3xl font-bold mb-6">Institutional Standards for Intake</h2>
                    <p className="text-slate-300 text-lg leading-relaxed mb-8">
                        For institutional law firms, intake is a risk management function. Who are we talking to? What is the adverse party? By enforcing a mandatory intake workflow that includes automated conflict checks, you protect the firm's equity from the very first hello.
                    </p>
                </div>
            </Section>

            {/* Related Resources */}
            <Section darker className="py-20">
                <div className="max-w-5xl mx-auto text-center mb-12">
                    <h2 className="text-3xl font-bold text-white mb-4">Master Your Entire Lifecycle</h2>
                </div>
                <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6">
                    <Link to="/law-firm-crm-software" className="p-8 bg-slate-950 rounded-2xl border border-slate-800 hover:border-emerald-500/30 transition-all flex flex-col justify-between group">
                        <div>
                            <Users className="w-8 h-8 text-indigo-400 mb-4" />
                            <h4 className="text-white font-bold mb-2">Legal CRM</h4>
                            <p className="text-slate-500 text-xs">Managing leads and conversion analytics.</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-700 mt-6 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <Link to="/ai-for-law-firms" className="p-8 bg-slate-950 rounded-2xl border border-slate-800 hover:border-emerald-500/30 transition-all flex flex-col justify-between group">
                        <div>
                            <Globe className="w-8 h-8 text-indigo-400 mb-4" />
                            <h4 className="text-white font-bold mb-2">AI Strategy</h4>
                            <p className="text-slate-500 text-xs">Implementing judicial intelligence enclaves.</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-700 mt-6 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <Link to="/legal-practice-management-software" className="p-8 bg-slate-950 rounded-2xl border border-slate-800 hover:border-emerald-500/30 transition-all flex flex-col justify-between group">
                        <div>
                            <Lock className="w-8 h-8 text-indigo-400 mb-4" />
                            <h4 className="text-white font-bold mb-2">Governance</h4>
                            <p className="text-slate-500 text-xs">Institutional matter management and security.</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-700 mt-6 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </Section>

            {/* Bottom CTA */}
            <Section className="py-24 bg-slate-950 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-emerald-500/5 blur-[120px] rounded-full" />
                <div className="max-w-3xl mx-auto relative z-10">
                    <h2 className="text-4xl font-bold text-white mb-6">Stop Chasing Leads. Start Qualifying.</h2>
                    <p className="text-xl text-slate-300 mb-10">Implement institutional-grade intake automation and grow your firm with confidence.</p>
                    <div className="flex justify-center gap-4">
                        <Button size="lg" onClick={() => window.dispatchEvent(new CustomEvent('nomosdesk-open-demo'))}>
                            Schedule Demo
                        </Button>
                    </div>
                </div>
            </Section>
        </Layout>
    );
}
