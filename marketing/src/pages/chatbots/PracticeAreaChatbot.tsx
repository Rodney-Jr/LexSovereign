import React from 'react';
import Layout from '../../layouts/Layout';
import SEO from '../../components/SEO';
import { Section, Button } from '../../components/ui';
import { Link } from '../../utils/ssr-compat';
import {
    ArrowLeft,
    CheckCircle,
    Bot,
    Zap,
    ArrowRight,
    Users,
    Gavel,
    Globe,
    Briefcase,
    Scale,
    Shield
} from 'lucide-react';

type PracticeArea = 'personal-injury' | 'immigration' | 'family' | 'criminal-defense' | 'corporate' | 'government';

interface AreaConfig {
    title: string;
    keyword: string;
    painPoint: string;
    benefit: string;
    icon: any;
    faq: { q: string; a: string }[];
}

const CONFIGS: Record<PracticeArea, AreaConfig> = {
    'personal-injury': {
        title: 'AI Chatbot for Personal Injury Lawyers',
        keyword: 'Personal Injury Intake Automation',
        painPoint: 'Accident victims are often in distress and shop for representation instantly. If you don\'t answer immediately, you lose the case.',
        benefit: 'Auto-qualify medical treatment status, insurance details, and statute of limitations instantly.',
        icon: Zap,
        faq: [
            { q: "Can the chatbot screen for specific injury types?", a: "Yes, the chatbot can be configured to ask about medical treatment, liability, and insurance status automatically." },
            { q: "Is it HIPAA compliant?", a: "Yes, NomosDesk utilizes hardware-level encryption for all sensitive health data collected during intake." }
        ]
    },
    'immigration': {
        title: 'AI Chatbot for Immigration Lawyers',
        keyword: 'Immigration Intake Software',
        painPoint: 'Immigration clients often have complex visa histories and require 24/7 engagement across different time zones.',
        benefit: 'Collect visa types, priority dates, and family details without manual document review.',
        icon: Globe,
        faq: [
            { q: "Does it support multiple languages?", a: "Yes, our AI supports over 50 languages including Spanish, French, Arabic, and Mandarin out of the box." },
            { q: "Can it verify visa eligibility?", a: "It can perform preliminary screening based on your firm's specific eligibility criteria." }
        ]
    },
    'family': {
        title: 'AI Chatbot for Family Law Firms',
        keyword: 'Family Law Intake Automation',
        painPoint: 'Family law matters are highly emotional and require sensitive, immediate empathetic responses.',
        benefit: 'Screen for child custody, asset division, and jurisdiction while maintaining a professional, empathetic tone.',
        icon: Users,
        faq: [
            { q: "Is the interaction empathetic?", a: "Our LLM engine is tuned for sensitivity, ensuring prospective clients feel heard while provideing necessary data." },
            { q: "Can it screen for urgent domestic matters?", a: "Yes, it can prioritize files based on urgency keywords like 'restraining order' or 'emergency'." }
        ]
    },
    'criminal-defense': {
        title: 'AI Chatbot for Criminal Defense Lawyers',
        keyword: 'Criminal Defense Leads Automation',
        painPoint: 'Criminal defense leads are extremely time-sensitive. A lead that waits 10 minutes is a lead that goes to another firm.',
        benefit: 'Identify charge types, court dates, and arrest status instantly to prioritize high-value matters.',
        icon: Gavel,
        faq: [
            { q: "Is the data privileged?", a: "All conversational data is treated as privileged work product and stored in encrypted, sovereign enclaves." },
            { q: "Can it notify my cell phone immediately?", a: "Yes, urgent criminal leads can be routed via SMS or push notification to your on-call attorney." }
        ]
    },
    'corporate': {
        title: 'AI Chatbot for Corporate Law Firms',
        keyword: 'Corporate Legal Intake Automation',
        painPoint: 'Corporate clients expect institutional-grade professionalism and instant conflict screening.',
        benefit: 'Identify entity names, deal types, and urgency for M&A, VC, or Litigation matters.',
        icon: Briefcase,
        faq: [
            { q: "Can it handle conflict checks?", a: "The chatbot can collect adverse party names and flag potential conflicts against your CRM database in real-time." },
            { q: "Does it support enterprise SSO?", a: "Yes, all NomosDesk institutional features integrate with enterprise access controls." }
        ]
    },
    'government': {
        title: 'AI Chatbot for Government Legal Departments',
        keyword: 'Public Sector Intake Automation',
        painPoint: 'Public sector departments struggle with enormous volume and the need for strict auditability.',
        benefit: 'Route inquiries between departments (Prosecution vs Civil) while maintaining unalterable audit trails.',
        icon: Shield,
        faq: [
            { q: "Does it meet government security standards?", a: "NomosDesk supports local sovereign hosting (on-premise) for government departments requiring Level 3 data sovereignty." },
            { q: "Can it route between multiple ministries?", a: "Our intelligent routing engine can direct inquiries to specific departmental firewalls based on content." }
        ]
    }
};

export default function PracticeAreaChatbot({ area }: { area: PracticeArea }) {
    const config = CONFIGS[area];
    const Icon = config.icon;

    return (
        <Layout>
            <SEO
                title={`${config.title}: 2026 Intake Solution`}
                description={`Scale your ${area} practice with specialized AI intake. ${config.benefit} Target ${config.keyword} and grow your firm with NomosDesk.`}
                schema={[
                    {
                        '@context': 'https://schema.org',
                        '@type': 'WebPage',
                        name: config.title,
                        description: config.benefit
                    }
                ]}
            />

            <Section className="pt-32 pb-20 bg-slate-950">
                <div className="max-w-4xl mx-auto px-4">
                    <Link to="/ai-legal-chatbot" className="inline-flex items-center gap-2 text-slate-400 hover:text-indigo-400 text-sm mb-8 transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Back to AI Chatbot Pillar
                    </Link>
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400">
                            <Icon className="w-6 h-6" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                            {config.title}
                        </h1>
                    </div>
                    <p className="text-xl text-slate-300 mb-8 leading-relaxed">
                        {config.painPoint} NomosDesk provides the industry's first <strong className="text-white">Legal-Specific AI Intake Assistant</strong> designed specifically for {area} practitioners.
                    </p>
                    <div className="flex gap-4">
                        <Button size="lg" onClick={() => window.dispatchEvent(new CustomEvent('nomosdesk-open-demo'))}>
                            Schedule Practice Demo
                        </Button>
                        <Button variant="outline" size="lg" asLink="/pricing">View Pricing</Button>
                    </div>
                </div>
            </Section>

            <Section className="py-24 bg-slate-950 border-y border-slate-900">
                <div className="max-w-6xl mx-auto px-4 grid lg:grid-cols-2 gap-16 items-center">
                    <div>
                        <h2 className="text-3xl font-bold text-white mb-6">Targeted Intake for {config.title.split('for ')[1]}</h2>
                        <p className="text-slate-300 mb-8 leading-relaxed">
                            {config.benefit} Our AI doesn't just ask for a name; it evaluates the case based on variables that matter to your practice area.
                        </p>
                        <div className="grid sm:grid-cols-2 gap-6">
                            {[
                                { title: "24/7 Availability", desc: "Never miss a late-night inquiry again." },
                                { title: "Practice-Specific Logic", desc: `Intelligent screening for ${area} cases.` },
                                { title: "Lead Scoring", desc: "Prioritize leads that meet your case value criteria." },
                                { title: "Instant Notification", desc: "Get alerted via SMS or email the moment a case is qualified." }
                            ].map((feature, idx) => (
                                <div key={idx} className="flex gap-3">
                                    <CheckCircle className="w-5 h-5 text-indigo-500 shrink-0" />
                                    <div>
                                        <h4 className="text-white font-bold text-sm mb-1">{feature.title}</h4>
                                        <p className="text-slate-500 text-xs">{feature.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-3xl relative">
                        <div className="absolute -top-4 -right-4 bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                            AI PREVIEW
                        </div>
                        <div className="space-y-4">
                            <div className="bg-slate-800/50 rounded-lg p-3 text-slate-300 text-sm max-w-[85%]">
                                "Hi! I'm your {area} intake assistant. I can help determine if we're a good fit for your case in under 2 minutes. Ready to start?"
                            </div>
                            <div className="flex justify-center py-4">
                                <div className="text-xs text-slate-500 bg-slate-800/20 px-4 py-1 rounded-full border border-slate-800">
                                    [Conversation specialized for {area}]
                                </div>
                            </div>
                            <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-xl p-4 text-center">
                                <p className="text-indigo-300 text-xs font-medium">Customized Flow Active</p>
                            </div>
                        </div>
                    </div>
                </div>
            </Section>

            {/* Programmatic FAQ */}
            <Section className="py-24 bg-slate-950">
                <div className="max-w-3xl mx-auto px-4">
                    <h2 className="text-2xl font-bold text-white mb-10">{area.charAt(0).toUpperCase() + area.slice(1)} Intake: Frequently Asked Questions</h2>
                    <div className="space-y-8">
                        {config.faq.map((faq, idx) => (
                            <div key={idx} className="border-b border-slate-800 pb-8 last:border-0">
                                <h4 className="text-white font-bold mb-3">{faq.q}</h4>
                                <p className="text-slate-400 text-sm leading-relaxed">{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </Section>

            {/* Industry Specific CTA */}
            <Section darker className="py-24 text-center">
                <div className="max-w-3xl mx-auto px-4">
                    <h2 className="text-3xl font-bold text-white mb-6">Scale Your {area.replace('-', ' ')} Practice</h2>
                    <p className="text-slate-300 mb-10">
                        Automate your intake today and let your legal team focus on what they do best: winning cases.
                    </p>
                    <div className="flex gap-4 justify-center">
                        <Button size="lg" onClick={() => window.dispatchEvent(new CustomEvent('nomosdesk-open-demo'))}>
                            Launch My Chatbot
                        </Button>
                        <Button variant="outline" size="lg" asLink="/ai-legal-chatbot">
                            View All Features
                        </Button>
                    </div>
                </div>
            </Section>
        </Layout>
    );
}
