import React, { useState, useEffect } from 'react';
import Layout from '../../layouts/Layout';
import SEO from '../../components/SEO';
import { Section, Button } from '../../components/ui';
import { Link } from '../../utils/ssr-compat';
import {
    Bot,
    MessageSquare,
    Zap,
    Users,
    ShieldCheck,
    ArrowRight,
    CheckCircle,
    BarChart3,
    Clock,
    Globe,
    Scale,
    Gavel,
    Briefcase
} from 'lucide-react';

export default function AILegalChatbot() {
    const [leads, setLeads] = useState(100);
    const [savedTime, setSavedTime] = useState(0);

    useEffect(() => {
        // Simple ROI calculation: 15 mins saved per qualified lead
        setSavedTime(Math.round((leads * 15) / 60));
    }, [leads]);

    return (
        <Layout>
            <SEO
                title="AI Legal Chatbot: Automated Intake for Law Firms"
                description="The #1 AI Legal Chatbot for law firms. Automate client intake, qualify leads 24/7, and sync directly with your CRM. Reduce costs and increase conversion rates."
                schema={[
                    {
                        '@context': 'https://schema.org',
                        '@type': 'SoftwareApplication',
                        name: 'NomosDesk AI Legal Chatbot',
                        operatingSystem: 'Web',
                        applicationCategory: 'BusinessApplication',
                        aggregateRating: {
                            '@type': 'AggregateRating',
                            ratingValue: '4.9',
                            ratingCount: '124'
                        },
                        offers: {
                            '@type': 'Offer',
                            price: '99.00',
                            priceCurrency: 'USD'
                        }
                    },
                    {
                        '@context': 'https://schema.org',
                        '@type': 'FAQPage',
                        mainEntity: [
                            {
                                '@type': 'Question',
                                name: 'What is an AI Legal Chatbot?',
                                acceptedAnswer: {
                                    '@type': 'Answer',
                                    text: 'An AI Legal Chatbot is an automated conversational assistant designed to handle initial client inquiries, qualify leads based on practice-specific criteria, and collect essential matter details before a human attorney intervenes.'
                                }
                            },
                            {
                                '@type': 'Question',
                                name: 'How does the chatbot improve law firm conversion?',
                                acceptedAnswer: {
                                    '@type': 'Answer',
                                    text: 'By providing instant 24/7 responses, the chatbot prevents lead leakage to competitors. It qualifies leads in real-time, ensuring lawyers only spend time on high-value potential matters.'
                                }
                            }
                        ]
                    }
                ]}
            />

            {/* Hero Section */}
            <Section className="pt-32 pb-20 bg-slate-950 overflow-hidden relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent opacity-50 pointer-events-none" />
                <div className="max-w-6xl mx-auto px-4 relative z-10">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-medium mb-6">
                                <Bot className="w-4 h-4" /> Next-Gen Legal Intake
                            </div>
                            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
                                Convert Visitors into Clients with <span className="text-indigo-400">AI Intake Automation</span>
                            </h1>
                            <p className="text-xl text-slate-300 mb-8 leading-relaxed">
                                Don't let valuable leads wait for a callback. NomosDesk's AI Legal Chatbot qualifies, routes, and captures matter details 24/7, turning your website into a high-performance growth engine.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Button size="lg" onClick={() => window.dispatchEvent(new CustomEvent('nomosdesk-open-demo'))}>
                                    Watch Live Demo
                                </Button>
                                <Button variant="outline" size="lg" asLink="/pricing">
                                    View ROI Savings
                                </Button>
                            </div>
                            <div className="mt-8 flex items-center gap-6 text-slate-400 text-sm">
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-indigo-500" /> 24/7 Automated Intake
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-indigo-500" /> Instant CRM Sync
                                </div>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-sm">
                                <div className="flex items-center gap-3 mb-6 border-b border-slate-800 pb-4">
                                    <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center">
                                        <Bot className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <div className="text-white font-bold">NomosDesk Assistant</div>
                                        <div className="text-emerald-400 text-xs flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" /> Online | Ready to Assist
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4 mb-6">
                                    <div className="bg-slate-800/50 rounded-lg p-3 text-slate-300 text-sm max-w-[80%]">
                                        Hello! I'm the NomosDesk AI assistant. Are you looking for legal help today?
                                    </div>
                                    <div className="bg-indigo-600 rounded-lg p-3 text-white text-sm max-w-[80%] ml-auto">
                                        Yes, I had a car accident and need to speak with a lawyer.
                                    </div>
                                    <div className="bg-slate-800/50 rounded-lg p-3 text-slate-300 text-sm max-w-[80%]">
                                        I'm sorry to hear that. I can help qualify your case instantly. Was anyone injured in the accident?
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <div className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-slate-500 text-sm">
                                        Type your response...
                                    </div>
                                    <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center text-white cursor-not-allowed">
                                        <ArrowRight className="w-5 h-5" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Section>

            {/* Problem Section */}
            <Section className="py-24 bg-slate-950 border-y border-slate-900">
                <div className="max-w-4xl mx-auto text-center mb-16 px-4">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Why Traditional Legal Intake is Failing You</h2>
                    <p className="text-lg text-slate-400">
                        In 2026, clients expect instant responses. If you take 4 hours to call back, they've already hired a competitor who answered their message in 4 seconds.
                    </p>
                </div>
                <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8 px-4">
                    {[
                        {
                            title: "The 'Black Hole' Form",
                            desc: "Static contact forms feel like sending data into a void. Clients drop off because they don't know when—or if—they'll get a response.",
                            icon: MessageSquare
                        },
                        {
                            title: "Lead Leakage",
                            desc: "Inquiries that arrive after 6:00 PM are often ignored until morning. By then, the client has contacted three other firms.",
                            icon: Clock
                        },
                        {
                            title: "Unqualified Chaos",
                            desc: "Your staff spends hours on the phone with 'tire kickers' who don't fit your firm's ideal client profile.",
                            icon: Users
                        }
                    ].map((item, idx) => (
                        <div key={idx} className="bg-slate-900/40 border border-slate-800 p-8 rounded-2xl hover:border-indigo-500/30 transition-colors group">
                            <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center text-red-400 mb-6 group-hover:scale-110 transition-transform">
                                <item.icon className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-4">{item.title}</h3>
                            <p className="text-slate-400 leading-relaxed">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </Section>

            {/* Solution Section */}
            <Section className="py-24 bg-slate-950">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-4xl font-bold text-white mb-6 leading-tight">
                                Intelligent Intake That <span className="text-indigo-400">Actually Understands</span> Law
                            </h2>
                            <p className="text-lg text-slate-400 mb-8 leading-relaxed">
                                Unlike generic website chatbots that just collect an email address, NomosDesk is built with legal logic. It qualifies users based on jurisdiction, statute of limitations, and case-specific merit.
                            </p>
                            <div className="space-y-6">
                                {[
                                    { title: "Smart Qualification", desc: "Ask the right questions for Personal Injury, Criminal Defense, or Immigration auto-magically." },
                                    { title: "Instant Conflict Checks", desc: "Preliminary screening against your existing client database." },
                                    { title: "Direct CRM Integration", desc: "Leads appear in your dashboard with full transcripts and score." }
                                ].map((feature, idx) => (
                                    <div key={idx} className="flex gap-4">
                                        <div className="w-10 h-10 bg-indigo-500/10 rounded-lg flex items-center justify-center text-indigo-400 shrink-0">
                                            <Zap className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="text-white font-bold mb-1">{feature.title}</h4>
                                            <p className="text-slate-400 text-sm">{feature.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-4">
                                <div className="bg-indigo-600/10 border border-indigo-500/20 p-6 rounded-2xl">
                                    <BarChart3 className="w-8 h-8 text-indigo-400 mb-4" />
                                    <div className="text-2xl font-bold text-white">40%</div>
                                    <div className="text-xs text-slate-400">Average Increase in Conversion</div>
                                </div>
                                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                                    <Clock className="w-8 h-8 text-slate-400 mb-4" />
                                    <div className="text-2xl font-bold text-white">2.5s</div>
                                    <div className="text-xs text-slate-400">Instant Response Rate</div>
                                </div>
                            </div>
                            <div className="space-y-4 pt-8">
                                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                                    <Users className="w-8 h-8 text-slate-400 mb-4" />
                                    <div className="text-2xl font-bold text-white">Zero</div>
                                    <div className="text-xs text-slate-400">Leads Missed After Hours</div>
                                </div>
                                <div className="bg-indigo-600/10 border border-indigo-500/20 p-6 rounded-2xl">
                                    <ShieldCheck className="w-8 h-8 text-indigo-400 mb-4" />
                                    <div className="text-2xl font-bold text-white">100%</div>
                                    <div className="text-xs text-slate-400">GDPR & POPIA Compliant</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Section>

            {/* ROI Calculator Section */}
            <Section darker className="py-24 overflow-hidden relative">
                <div className="max-w-4xl mx-auto px-4 relative z-10">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 text-center">Intake Efficiency Calculator</h2>
                        <p className="text-slate-400 text-center">Calculate how much staff time you recover by automating initial screening.</p>
                    </div>

                    <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-3xl shadow-2xl">
                        <div className="mb-12">
                            <label className="text-white font-medium mb-4 block">Monthly Leads Received: <span className="text-indigo-400 text-xl ml-2">{leads}</span></label>
                            <input
                                type="range"
                                min="10"
                                max="1000"
                                value={leads}
                                onChange={(e) => setLeads(parseInt(e.target.value))}
                                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                            />
                            <div className="flex justify-between text-slate-500 text-xs mt-2">
                                <span>10</span>
                                <span>500</span>
                                <span>1000+</span>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8 items-center border-t border-slate-800 pt-8">
                            <div>
                                <h3 className="text-slate-400 text-sm uppercase tracking-wider mb-2">Potential Time Saved</h3>
                                <div className="text-5xl font-bold text-white">~{savedTime} <span className="text-indigo-400 text-2xl">Hours/mo</span></div>
                                <p className="text-slate-500 text-sm mt-4 italic">
                                    *Based on average 15 minutes spent per initial manual screening call.
                                </p>
                            </div>
                            <div className="bg-indigo-500/10 border border-indigo-500/20 p-6 rounded-2xl">
                                <p className="text-indigo-300 text-sm mb-4">"NomosDesk recovered 30 hours of my associate's time in the first month. It paid for itself in 3 days."</p>
                                <div className="text-white font-bold text-sm">— Senior Partner, Immigration Boutique</div>
                            </div>
                        </div>
                    </div>
                </div>
            </Section>

            {/* Use Cases Section */}
            <Section className="py-24 bg-slate-950">
                <div className="max-w-4xl mx-auto text-center mb-16 px-4">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Designed for Every Practice Area</h2>
                </div>
                <div className="max-w-6xl mx-auto grid md:grid-cols-2 lg:grid-cols-4 gap-6 px-4">
                    {[
                        { title: "Personal Injury", icon: Zap, slug: "personal-injury-lawyers" },
                        { title: "Immigration", icon: Globe, slug: "immigration-lawyers" },
                        { title: "Family Law", icon: Users, slug: "family-lawyers" },
                        { title: "Criminal Defense", icon: Gavel, slug: "criminal-defense-lawyers" }
                    ].map((item, idx) => (
                        <Link
                            key={idx}
                            to={`/ai-chatbot-for-${item.slug}`}
                            className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl hover:border-indigo-500/30 transition-all hover:-translate-y-1 group"
                        >
                            <item.icon className="w-8 h-8 text-indigo-400 mb-4 group-hover:scale-110 transition-transform" />
                            <h3 className="text-white font-bold mb-2">{item.title}</h3>
                            <p className="text-slate-500 text-sm mb-4">Practice-specific flows for {item.title.toLowerCase()} intake.</p>
                            <div className="text-indigo-400 text-xs font-bold flex items-center gap-1">
                                View Solution <ArrowRight className="w-3 h-3" />
                            </div>
                        </Link>
                    ))}
                </div>
            </Section>

            {/* FAQ Section */}
            <Section className="py-24 bg-slate-950 border-t border-slate-900">
                <div className="max-w-3xl mx-auto px-4">
                    <h2 className="text-3xl font-bold text-white mb-12 text-center">Frequently Asked Questions</h2>
                    <div className="space-y-8">
                        {[
                            {
                                q: "How much does the AI chatbot cost?",
                                a: "The AI Intake Chatbot is included in our Professional and Institutional tiers starting at $99/month. There are no per-conversation fees."
                            },
                            {
                                q: "Is the chatbot secure?",
                                a: "Yes. NomosDesk is built for highly regulated sectors. All data is encrypted with AES-256 at rest, and we offer sovereign hosting options for sensitive government matters."
                            },
                            {
                                q: "Do I need technical skills to set it up?",
                                a: "No. You can deploy the chatbot by adding a single line of code (script tag) to your existing website. We also provide templates for common legal scenarios."
                            },
                            {
                                q: "Can it speak multiple languages?",
                                a: "Yes, our LLM-powered engine supports English, French, Portuguese, Arabic, and several regional African languages out of the box."
                            }
                        ].map((faq, idx) => (
                            <div key={idx} className="border-b border-slate-800 pb-8">
                                <h4 className="text-white font-bold mb-3">{faq.q}</h4>
                                <p className="text-slate-400 text-sm leading-relaxed">{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </Section>

            {/* Last CTA */}
            <Section darker className="py-24 text-center">
                <div className="max-w-3xl mx-auto px-4">
                    <h2 className="text-4xl font-bold text-white mb-6">Stop Losing Leads Today</h2>
                    <p className="text-xl text-slate-300 mb-10">
                        Join 200+ law firms using NomosDesk to automate their front office.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button size="lg" onClick={() => window.dispatchEvent(new CustomEvent('nomosdesk-open-demo'))}>
                            Request Private Demo
                        </Button>
                        <Button variant="outline" size="lg" asLink="/pricing">
                            Explore All Features
                        </Button>
                    </div>
                    <p className="mt-8 text-slate-500 text-sm italic">
                        No credit card required · ISO 27001 Certified · POPIA Compliant
                    </p>
                </div>
            </Section>
        </Layout>
    );
}
