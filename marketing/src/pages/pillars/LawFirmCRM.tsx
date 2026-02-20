import React from 'react';
import Layout from '../../layouts/Layout';
import SEO from '../../components/SEO';
import { Section, Button } from '../../components/ui';
import { Users, Filter, BarChart3, MessageSquare, ArrowRight, CheckCircle, Zap, Shield, Briefcase } from 'lucide-react';
import { Link } from '../../utils/ssr-compat';

export default function LawFirmCRM() {
    return (
        <Layout>
            <SEO
                title="Law Firm CRM Software: The Definitive 2026 Lead Lifecycle Guide"
                description="Optimize your law firm's growth with a specialized legal CRM. Learn how to manage leads, automate intake, and increase conversion rates with NomosDesk."
                schema={[
                    {
                        "@context": "https://schema.org",
                        "@type": "SoftwareApplication",
                        "name": "NomosDesk CRM",
                        "applicationCategory": "BusinessApplication",
                        "operatingSystem": "Web-based",
                        "description": "Specialized CRM for law firms and legal departments."
                    }
                ]}
            />

            {/* Hero Section */}
            <Section className="pt-32 pb-20 relative overflow-hidden bg-slate-950">
                <div className="absolute inset-0 bg-blue-500/5 blur-[120px] rounded-full bottom-0 right-0" />
                <div className="max-w-5xl mx-auto relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-sm font-medium mb-6">
                        <Users className="w-4 h-4" /> Growth & Retention
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 leading-tight tracking-tight">
                        Law Firm CRM: <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">
                            Master the Lead Lifecycle.
                        </span>
                    </h1>
                    <p className="text-xl text-slate-300 leading-relaxed max-w-3xl mb-12">
                        Stop losing potential clients to slow response times and manual follow-ups. A specialized legal CRM transforms your firm from a collection of spreadsheets into a high-conversion growth engine.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 mb-20">
                        <Button size="lg" onClick={() => window.dispatchEvent(new CustomEvent('nomosdesk-open-demo'))}>
                            Request Private Demo
                        </Button>
                        <Button asLink="/pricing" variant="outline" size="lg">
                            View Growth Plans
                        </Button>
                    </div>
                </div>
            </Section>

            {/* Lead Lifecycle Visualization */}
            <Section darker className="py-24">
                <div className="max-w-7xl mx-auto text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">The Automated Lead Journey</h2>
                    <p className="text-slate-400 max-w-2xl mx-auto">From an anonymous visitor to a retained client. NomosDesk manages every touchpoint.</p>
                </div>
                <div className="max-w-5xl mx-auto relative">
                    <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-slate-800 -translate-y-1/2 z-0" />
                    <div className="grid md:grid-cols-4 gap-8 relative z-10">
                        {[
                            { step: "1. Capture", title: "AI Intake Assistant", desc: "Qualify leads 24/7", icon: MessageSquare },
                            { step: "2. Nurture", title: "Automated Follow-up", desc: "Keep prospects engaged", icon: Zap },
                            { step: "3. Convert", title: "Digital Engagement", desc: "Seamless consultation booking", icon: Filter },
                            { step: "4. Retain", title: "Matter Integration", desc: "One-click lead-to-matter", icon: Briefcase }
                        ].map((item, i) => (
                            <div key={i} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                                <span className="text-xs font-bold text-indigo-400 tracking-widest uppercase mb-4 block">{item.step}</span>
                                <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400 mb-4 mx-auto">
                                    <item.icon className="w-6 h-6" />
                                </div>
                                <h4 className="text-white font-bold mb-2">{item.title}</h4>
                                <p className="text-slate-500 text-xs leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </Section>

            {/* CRM Feature Table */}
            <Section className="py-24 bg-slate-950">
                <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-16 items-center">
                    <div>
                        <h2 className="text-3xl font-bold text-white mb-6">Built Specifically for Legal Ethics</h2>
                        <p className="text-slate-300 text-lg mb-8">
                            Most CRMs are built for sales. NomosDesk is built for law. Managing leads requires strict adherence to confidentiality and conflict prevention before they reach the matter stage.
                        </p>
                        <div className="space-y-4">
                            {[
                                "Native conflict checking during lead capture.",
                                "Secure document storage for initial intake forms.",
                                "Audit trails for every lead interaction.",
                                "Regional data hosting to meet compliance standards."
                            ].map((text, i) => (
                                <div key={i} className="flex gap-3 items-center">
                                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                                    <span className="text-slate-300">{text}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="relative">
                        <div className="absolute -inset-4 bg-indigo-500/10 blur-2xl rounded-full" />
                        <div className="relative bg-slate-900 border border-slate-800 p-8 rounded-3xl">
                            <BarChart3 className="w-8 h-8 text-indigo-400 mb-6" />
                            <h3 className="text-xl font-bold text-white mb-4">Conversion Analytics</h3>
                            <div className="space-y-6">
                                <div>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-slate-500">Response Time</span>
                                        <span className="text-indigo-400">-92% improvement</span>
                                    </div>
                                    <div className="h-1.5 bg-slate-800 rounded-full"><div className="w-[10%] h-full bg-indigo-500" /></div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-slate-500">Lead Conversion Rate</span>
                                        <span className="text-emerald-400">+34% growh</span>
                                    </div>
                                    <div className="h-1.5 bg-slate-800 rounded-full"><div className="w-[75%] h-full bg-emerald-500" /></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Section>

            {/* Deep Content */}
            <Section className="py-24 bg-slate-950">
                <div className="max-w-4xl mx-auto prose prose-invert">
                    <h2 className="text-white text-3xl font-bold mb-6">Why Your Law Firm Needs a Specialized CRM</h2>
                    <p className="text-slate-300 text-lg leading-relaxed mb-8">
                        The "Lead-to-Matter Gap" is the single greatest cause of lost revenue for modern firms. Many practices use professional tools for their litigation matters but still rely on sticky notes or general email inboxes for their inquiries. A Legal CRM bridge this gap by ensuring that every inquiry is logged, tracked, and automatically advanced.
                    </p>

                    <h3 className="text-white text-2xl font-bold mb-4">Automating Intake with AI</h3>
                    <p className="text-slate-300 text-lg leading-relaxed mb-8">
                        The first five minutes of an inquiry are critical. By integration an AI-powered intake assistant directly into your CRM, your firm can qualify prospects instantly, perform a preliminary conflict search, and schedule a consultation while your competition is still checking their voicemail.
                    </p>

                    <h3 className="text-white text-2xl font-bold mb-4">Institutional Oversight</h3>
                    <p className="text-slate-300 text-lg leading-relaxed mb-8">
                        For institutional leaders, a CRM provides the dashboard needed to see which practice areas are growing and where bottlenecks exist. You can monitor the efficiency of your intake team and the quality of leads flowing from your marketing efforts.
                    </p>
                </div>
            </Section>

            {/* Cluster Links */}
            <Section darker className="py-20">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-2xl font-bold text-white mb-8">Growth Resources</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <Link to="/automated-legal-intake" className="p-6 bg-slate-950 rounded-xl border border-slate-800 hover:border-indigo-500/30 transition-all">
                            <h4 className="text-white font-bold text-sm mb-2">Legal Intake Automation</h4>
                            <p className="text-slate-500 text-xs">A deep dive into AI-driven intake workflows.</p>
                        </Link>
                        <Link to="/ai-for-law-firms" className="p-6 bg-slate-950 rounded-xl border border-slate-800 hover:border-indigo-500/30 transition-all">
                            <h4 className="text-white font-bold text-sm mb-2">AI for Law Firms</h4>
                            <p className="text-slate-500 text-xs">Transforming operations with judicial intelligence.</p>
                        </Link>
                        <Link to="/legal-practice-management-software" className="p-6 bg-slate-950 rounded-xl border border-slate-800 hover:border-indigo-500/30 transition-all">
                            <h4 className="text-white font-bold text-sm mb-2">Practice Management</h4>
                            <p className="text-slate-500 text-xs">Complete guide to institutional matters.</p>
                        </Link>
                        <Link to="/pricing" className="p-6 bg-slate-950 rounded-xl border border-slate-800 hover:border-indigo-500/30 transition-all">
                            <h4 className="text-white font-bold text-sm mb-2">Pricing Guide</h4>
                            <p className="text-slate-500 text-xs">Find the right growth plan for your firm.</p>
                        </Link>
                    </div>
                </div>
            </Section>

            {/* Bottom CTA */}
            <Section className="py-24 bg-slate-950 text-center relative">
                <div className="absolute inset-0 bg-indigo-500/5 blur-[100px] rounded-full" />
                <div className="max-w-3xl mx-auto relative z-10">
                    <h2 className="text-4xl font-bold text-white mb-6">Scale Your Practice with NomosDesk CRM</h2>
                    <p className="text-xl text-slate-300 mb-10">Stop guessing about your growth. Start managing your leads with institutional precision.</p>
                    <div className="flex justify-center gap-4">
                        <Button size="lg" onClick={() => window.dispatchEvent(new CustomEvent('nomosdesk-open-demo'))}>
                            Request Private Demo
                        </Button>
                    </div>
                </div>
            </Section>
        </Layout>
    );
}
