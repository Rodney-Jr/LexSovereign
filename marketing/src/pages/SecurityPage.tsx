import React from 'react';
import Layout from '../layouts/Layout';
import SEO from '../components/SEO';
import { Section, SectionHeader, Button } from '../components/ui';
import { ShieldCheck, Lock, Eye, Server, Zap } from 'lucide-react';
import type { SsgOptions } from 'vite-plugin-ssg';

export const ssgOptions: SsgOptions = {
    slug: 'security-and-compliance',
    routeUrl: '/security-and-compliance',
    context: async (children) => {
        const { StaticRouter, HelmetProvider } = await import('../utils/ssr-compat');
        return (
            <HelmetProvider>
                <StaticRouter location="/security-and-compliance">{children}</StaticRouter>
            </HelmetProvider>
        );
    },
};

export default function SecurityPage() {
    return (
        <Layout>
            <SEO
                title="Sovereign Legal Security & Compliance"
                description="Our commitment to professional responsibility. End-to-end encryption, ISO 27001 alignment, and strict data residency for legal institutions."
                schema={[
                    {
                        "@context": "https://schema.org",
                        "@type": "FAQPage",
                        "mainEntity": [
                            {
                                "@type": "Question",
                                "name": "Where is data stored?",
                                "acceptedAnswer": { "@type": "Answer", "text": "We offer regional data residency options, including specialized zones for Africa and Europe." }
                            },
                            {
                                "@type": "Question",
                                "name": "Who can access information?",
                                "acceptedAnswer": { "@type": "Answer", "text": "Access is strictly role-based. We use a Zero Trust architecture where explicit permission is required." }
                            }
                        ]
                    },
                    {
                        "@context": "https://schema.org",
                        "@type": "BreadcrumbList",
                        "itemListElement": [
                            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://nomosdesk.com" },
                            { "@type": "ListItem", "position": 2, "name": "Security & Compliance", "item": "https://nomosdesk.com/security-and-compliance" }
                        ]
                    }
                ]}
            />

            <Section className="bg-slate-950 pt-32 pb-20">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                        Security is Our Foundation
                    </h1>
                    <p className="text-xl text-slate-300 max-w-2xl mx-auto">
                        We understand that legal data is among the most sensitive in the world.
                        NomosDesk is built to protect privilege, confidentiality, and integrity.
                    </p>
                </div>
            </Section>

            <Section>
                <div className="grid md:grid-cols-2 gap-8">
                    <SecurityCard
                        icon={<Lock />}
                        title="Encryption Everywhere"
                        desc="Data is encrypted at rest using AES-256 and in transit using TLS 1.3. Your documents are unreadable to unauthorized parties."
                    />
                    <SecurityCard
                        icon={<ShieldCheck />}
                        title="Role-Based Access Control (RBAC)"
                        desc="Granular permissions ensure users only access the specific matters and documents required for their work."
                    />
                    <SecurityCard
                        icon={<Eye />}
                        title="Comprehensive Audit Logging"
                        desc="Every interaction with the system is logged. Security administrators can review who accessed what and when."
                    />
                    <SecurityCard
                        icon={<Server />}
                        title="Data Residency"
                        desc="Choose where your data lives. We support local deployment for institutions with strict sovereignty requirements."
                    />
                </div>
            </Section>

            <Section className="bg-slate-900 border-y border-slate-800 py-24">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-white mb-6">Compliance Architecture & Alignment</h2>
                        <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                            Our infrastructure and operational protocols are designed in strict alignment with major global security and privacy frameworks, ensuring verifiable trust for legal professionals without falsely claiming formal certifications.
                        </p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="p-8 bg-slate-950 rounded-[2rem] border border-slate-800 hover:border-indigo-500/30 transition-colors">
                            <h3 className="font-bold text-white text-xl mb-3">SOC 2 Type II Alignment</h3>
                            <p className="text-sm text-slate-400 leading-relaxed">
                                Our systems reflect the Trust Services Criteria for Security, Availability, and Confidentiality through strict access controls, encryption, and immutable audit trails.
                            </p>
                        </div>
                        <div className="p-8 bg-slate-950 rounded-[2rem] border border-slate-800 hover:border-indigo-500/30 transition-colors">
                            <h3 className="font-bold text-white text-xl mb-3">ISO/IEC 27001 Preparedness</h3>
                            <p className="text-sm text-slate-400 leading-relaxed">
                                Fundamental information security management principles are baked into our development lifecycle, vendor vetting, and daily operational protocols.
                            </p>
                        </div>
                        <div className="p-8 bg-slate-950 rounded-[2rem] border border-slate-800 hover:border-indigo-500/30 transition-colors">
                            <h3 className="font-bold text-white text-xl mb-3">GDPR & Data Protection</h3>
                            <p className="text-sm text-slate-400 leading-relaxed">
                                Built to explicitly support the rapid execution of Data Processing Agreements (DPAs) with strict adherence to data minimization and purpose limitation principles.
                            </p>
                        </div>
                    </div>
                </div>
            </Section>

            <Section darker>
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-3xl font-bold text-white mb-8">Frequently Asked Questions</h2>
                    <div className="space-y-6">
                        <FAQItem q="Where is data stored?" a="We utilize secure, enterprise-grade data centers with options for regional residency to comply with local data protection laws (e.g., GDPR, local acts)." />
                        <FAQItem q="Who can access information?" a="Only authorized users within your tenant. NomosDesk support staff have no standing access to your encrypted documents." />
                        <FAQItem q="How are conflicts detected?" a="Our system indexes entities across all matters. A fuzzy-matching algorithm runs against this index during the intake process." />
                        <FAQItem q="Is the system suitable for public institutions?" a="Yes. We have specialized modules for government that handle higher classification levels and separation of duties." />
                        <SecurityCard
                            icon={<Zap />}
                            title="Sovereign Chatbot Data"
                            desc="Every interaction with our AI Chatbot is processed in your private enclave. We never use your data to train public models."
                        />
                    </div>
                </div>
            </Section>

            <Section className="text-center py-24">
                <h2 className="text-2xl font-bold text-white mb-6">Review Our Full Security Whitepaper</h2>
                <Button onClick={() => window.dispatchEvent(new CustomEvent('nomosdesk-open-security-packet'))}>Request Security Packet</Button>
            </Section>
        </Layout>
    );
}

function SecurityCard({ icon, title, desc }: any) {
    return (
        <div className="flex gap-4 p-6 bg-slate-900 rounded-2xl border border-slate-800">
            <div className="shrink-0 w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400">
                {icon}
            </div>
            <div>
                <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
                <p className="text-slate-400">{desc}</p>
            </div>
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
