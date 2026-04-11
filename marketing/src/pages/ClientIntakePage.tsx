import React from 'react';
import Layout from '../layouts/Layout';
import SEO from '../components/SEO';
import { Section, SectionHeader, Button } from '../components/ui';
import { MessageSquare, ClipboardCheck, Clock, ShieldCheck, UserCheck } from 'lucide-react';
import type { SsgOptions } from 'vite-plugin-ssg';

export const ssgOptions: SsgOptions = {
    slug: 'client-intake-assistant',
    routeUrl: '/client-intake-assistant',
    context: async (children) => {
        const { StaticRouter, HelmetProvider } = await import('../utils/ssr-compat');
        return (
            <HelmetProvider>
                <StaticRouter location="/client-intake-assistant">{children}</StaticRouter>
            </HelmetProvider>
        );
    },
};

export default function ClientIntakePage() {
    return (
        <Layout>
            <SEO
                title="Client Intake Assistant & Website Enquiry Tool"
                description="A secure website enquiry assistant for law firms. Capture leads 24/7 and pre-screen clients securely without providing automated legal advice."
                schema={[
                    {
                        "@context": "https://schema.org",
                        "@type": "SoftwareApplication",
                        "name": "NomosDesk Client Intake Assistant",
                        "applicationCategory": "BusinessApplication",
                        "operatingSystem": "Cloud",
                        "offers": {
                            "@type": "Offer",
                            "price": "0",
                            "priceCurrency": "USD"
                        }
                    },
                    {
                        "@context": "https://schema.org",
                        "@type": "BreadcrumbList",
                        "itemListElement": [
                            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://nomosdesk.com" },
                            { "@type": "ListItem", "position": 2, "name": "Client Intake Assistant", "item": "https://nomosdesk.com/client-intake-assistant" }
                        ]
                    }
                ]}
            />

            {/* HERO */}
            <Section className="bg-slate-950 pt-32 pb-20">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-medium mb-6">
                        New Feature
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                        A Digital Front Desk <br /> for Your Law Firm
                    </h1>
                    <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
                        Capture enquiries, pre-screen potential clients, and schedule consultations 24/7.
                        Our secure intake assistant provides structured support without crossing the line into legal advice.
                    </p>
                    <div className="flex justify-center gap-4">
                        <Button onClick={() => window.dispatchEvent(new CustomEvent('nomosdesk-open-demo'))}>Add Intake Assistant</Button>
                    </div>
                </div>
            </Section>

            {/* HOW IT WORKS */}
            <Section>
                <div className="grid md:grid-cols-2 gap-16 items-center">
                    <div>
                        <h2 className="text-3xl font-bold text-white mb-6">Structured Intake, Not Chatbot Chaos</h2>
                        <p className="text-slate-300 text-lg mb-8 leading-relaxed">
                            Unlike generic chatbots, NomosDesk’s assistant follows a strict review framework defined by your firm.
                        </p>
                        <div className="space-y-6">
                            <WorkStep
                                num="01"
                                title="Firm-Defined Questions"
                                desc="You configure the specific questions for each practice area (e.g., Family Law, Corporate, Litigation)."
                            />
                            <WorkStep
                                num="02"
                                title="Structured Collection"
                                desc="The assistant collects factual information from the prospect to help you evaluate the matter."
                            />
                            <WorkStep
                                num="03"
                                title="Secure Handoff"
                                desc="Qualified enquiries are securely forwarded to your intake team or practice head for review."
                            />
                        </div>
                    </div>
                    <div className="relative group">
                        <div className="absolute -inset-10 bg-indigo-500/10 blur-[100px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                        <div className="relative flex justify-center items-center">
                            <img 
                                src="/images/mockups/ai_legal_chatbot_mockup_1775751066007.png" 
                                alt="NomosDesk AI Intake Assistant" 
                                className="w-full max-w-[400px] drop-shadow-[0_50px_100px_rgba(0,0,0,0.6)] transform group-hover:translate-y-[-10px] transition-transform duration-700"
                            />
                            
                            {/* Floating Stats */}
                            <div className="absolute -right-4 top-20 p-5 bg-slate-900/90 backdrop-blur-xl border border-indigo-500/30 rounded-3xl shadow-2xl hidden md:block">
                                <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">Automated Ops</div>
                                <div className="text-2xl font-black text-white">24/7</div>
                                <div className="text-[10px] font-bold text-slate-500 mt-1 uppercase">Response Efficiency</div>
                            </div>
                            
                            <div className="absolute -left-10 bottom-24 p-5 bg-slate-900/90 backdrop-blur-xl border border-emerald-500/30 rounded-3xl shadow-2xl hidden md:block">
                                <div className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-2">Conflict Shield</div>
                                <div className="text-sm font-bold text-white">Pre-Screening <br />Active</div>
                            </div>
                        </div>
                    </div>
                </div>
            </Section>

            {/* COMPLIANCE & ETHICS */}
            <Section darker className="bg-slate-950">
                <SectionHeader
                    title="Professional Responsibility First"
                    subtitle="Designed to support your ethical obligations, not replace your judgment."
                />
                <div className="grid md:grid-cols-3 gap-8">
                    <ComplianceCard
                        icon={<ShieldCheck />}
                        title="No Legal Advice"
                        desc="The assistant is strictly programmed to decline requests for legal advice and direct users to schedule a consultation."
                    />
                    <ComplianceCard
                        icon={<ClipboardCheck />}
                        title="Custom Disclaimers"
                        desc="Display your firm’s specific terms of service and attorney-client privilege disclaimers before any interaction."
                    />
                    <ComplianceCard
                        icon={<UserCheck />}
                        title="Review & Oversight"
                        desc="All transcripts are saved to the matter file. Administrators can review and audit assistant performance at any time."
                    />
                </div>
            </Section>

            {/* BENEFITS */}
            <Section>
                <SectionHeader title="Why Add an Intake Assistant?" />
                <div className="grid md:grid-cols-4 gap-6 text-center">
                    <BenefitItem icon={<Clock />} title="24/7 Availability" desc="Capture leads while your office is closed." />
                    <BenefitItem icon={<MessageSquare />} title="Instant Response" desc="Engage website visitors immediately." />
                    <BenefitItem icon={<UserCheck />} title="Better Qualification" desc="Filter out non-relevant enquiries automatically." />
                    <BenefitItem icon={<ShieldCheck />} title="Privacy First" desc="Data is encrypted and never sold to third parties." />
                </div>
            </Section>

            {/* FAQ */}
            <Section darker>
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-2xl font-bold mb-8">Frequently Asked Questions</h2>
                    <div className="space-y-6">
                        <FAQItem q="Does the assistant provide legal advice?" a="No. It is an administrative support tool designed to collect information. It explicitly states it cannot provide legal opinions." />
                        <FAQItem q="Can we customize the questions?" a="Yes. You have full control over the intake workflows and the specific questions asked for each practice area." />
                        <FAQItem q="Can we control what information is collected?" a="Absolutely. You define the data fields (name, phone, matter type, description) that are required." />
                        <FAQItem q="Is the assistant suitable for regulated legal environments?" a="Yes. It helps maintain compliance by ensuring a consistent, auditable intake process." />
                        <FAQItem q="Can it integrate with internal systems?" a="Yes. Enquiries are automatically created as prospective matters within the NomosDesk platform." />
                    </div>
                </div>
            </Section>

            {/* CALL TO ACTION */}
            <Section className="text-center py-24">
                <h2 className="text-3xl font-bold text-white mb-6">Modernize Your Client Intake</h2>
                <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
                    Improve client satisfaction and reducing administrative overhead with a secure, 24/7 digital assistant.
                </p>
                <Button onClick={() => window.dispatchEvent(new CustomEvent('nomosdesk-open-demo'))} size="lg">Add Intake Assistant</Button>
            </Section>
        </Layout>
    );
}

function WorkStep({ num, title, desc }: any) {
    return (
        <div className="flex gap-4">
            <div className="text-indigo-400 font-bold text-xl">{num}</div>
            <div>
                <h3 className="font-bold text-white mb-1">{title}</h3>
                <p className="text-slate-400 text-sm">{desc}</p>
            </div>
        </div>
    )
}

function ComplianceCard({ icon, title, desc }: any) {
    return (
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
            <div className="w-10 h-10 bg-indigo-500/10 rounded-lg flex items-center justify-center text-indigo-400 mb-4">
                {icon}
            </div>
            <h3 className="font-bold text-white mb-2">{title}</h3>
            <p className="text-slate-400 text-sm">{desc}</p>
        </div>
    )
}

function BenefitItem({ icon, title, desc }: any) {
    return (
        <div className="p-6 bg-slate-900/50 rounded-xl border border-slate-800">
            <div className="w-12 h-12 mx-auto bg-slate-800 rounded-full flex items-center justify-center text-emerald-400 mb-4">
                {icon}
            </div>
            <h3 className="font-semibold text-white mb-2">{title}</h3>
            <p className="text-slate-400 text-sm">{desc}</p>
        </div>
    )
}

function FAQItem({ q, a }: { q: string, a: string }) {
    return (
        <div className="border-b border-slate-800 pb-4">
            <h4 className="font-semibold text-white mb-2">{q}</h4>
            <p className="text-slate-400 text-sm leading-relaxed">{a}</p>
        </div>
    )
}
