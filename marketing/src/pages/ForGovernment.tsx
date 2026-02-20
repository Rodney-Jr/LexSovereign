import React from 'react';
import Layout from '../layouts/Layout';
import SEO from '../components/SEO';
import { Section, SectionHeader, Button } from '../components/ui';
import { Landmark, Fingerprint, History, Database, CheckCircle } from 'lucide-react';
import RelatedInsights from '../components/RelatedInsights';
import type { SsgOptions } from 'vite-plugin-ssg';

export const ssgOptions: SsgOptions = {
    slug: 'for-government',
    routeUrl: '/for-government',
    context: async (children) => {
        const { StaticRouter, HelmetProvider } = await import('../utils/ssr-compat');
        return (
            <HelmetProvider>
                <StaticRouter location="/for-government">{children}</StaticRouter>
            </HelmetProvider>
        );
    },
};

export default function ForGovernment() {
    return (
        <Layout>
            <SEO
                title="Public Sector Legal Governance"
                description="Secure legal case management for government institutions, ministries, and prosecution services. Enforcing public accountability, data sovereignty, departmental firewalls, and audit transparency."
                schema={[
                    {
                        '@context': 'https://schema.org',
                        '@type': 'SoftwareApplication',
                        name: 'NomosDesk for Government',
                        applicationCategory: 'BusinessApplication',
                        operatingSystem: 'Cloud',
                        description: 'Secure legal governance platform for government ministries, prosecution services, and public sector legal departments.',
                        url: 'https://nomosdesk.com/for-government',
                    },
                    {
                        '@context': 'https://schema.org',
                        '@type': 'BreadcrumbList',
                        itemListElement: [
                            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://nomosdesk.com' },
                            { '@type': 'ListItem', position: 2, name: 'For Government', item: 'https://nomosdesk.com/for-government' },
                        ],
                    },
                ]}
            />

            <Section className="bg-slate-950 pt-32 pb-20">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-sm font-medium mb-6">
                        For Public Institutions & Ministries
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                        Institutional Integrity. <br /> Public Trust.
                    </h1>
                    <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
                        A secure governance platform for managing public legal affairs.
                        Ensure strict separation of duties, comprehensive audit trails,
                        and total data sovereignty.
                    </p>
                    <div className="flex justify-center gap-4">
                        <Button onClick={() => window.dispatchEvent(new CustomEvent('nomosdesk-open-demo'))}>Inquire About Deployment</Button>
                    </div>
                </div>
            </Section>

            <Section darker>
                <div className="grid md:grid-cols-2 gap-16 items-center">
                    <div className="order-2 md:order-1">
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                            <div className="flex items-center gap-4 mb-4 border-b border-slate-800 pb-4">
                                <div className="w-10 h-10 bg-blue-900/30 rounded-full flex items-center justify-center text-blue-400">
                                    <History size={20} />
                                </div>
                                <div>
                                    <div className="font-mono text-xs text-slate-500">AUDIT LOG ID: 8829-AFX</div>
                                    <div className="font-bold text-white">Access Granted: Case #2044</div>
                                </div>
                            </div>
                            <div className="space-y-3 font-mono text-xs text-slate-400">
                                <div className="flex justify-between">
                                    <span>User:</span> <span className="text-white">Senior Prosecutor</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Time:</span> <span className="text-white">14:02 UTC</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Action:</span> <span className="text-white">View Evidence File</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Authorization:</span> <span className="text-emerald-400">Dual-Key Verified</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="order-1 md:order-2">
                        <h2 className="text-3xl font-bold text-white mb-6">Unalterable Audit Trails</h2>
                        <p className="text-slate-300 text-lg mb-6">
                            Public accountability starts with transparency. Every action—document view,
                            edit, login, and permission change—is immutably logged for oversight review.
                        </p>
                        <div className="flex gap-3">
                            <CheckBadge text="Forensic-Ready Logs" />
                            <CheckBadge text="Non-Repudiation" />
                        </div>
                    </div>
                </div>
            </Section>

            <Section>
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div>
                        <h2 className="text-3xl font-bold text-white mb-6">Deep Research & Judicial Memory</h2>
                        <p className="text-slate-300 text-lg mb-6 leading-relaxed">
                            Maintain institutional memory across administrations. Our Sovereign Enclave provides a secure, permanent repository for judicial archives.
                        </p>
                        <ul className="space-y-4 mb-8">
                            <li className="flex gap-3">
                                <CheckCircle className="w-5 h-5 text-blue-500 shrink-0" />
                                <span className="text-slate-300">Secure archiving of constitutional interpretations</span>
                            </li>
                            <li className="flex gap-3">
                                <CheckCircle className="w-5 h-5 text-blue-500 shrink-0" />
                                <span className="text-slate-300">Statutory history tracking at the regional level</span>
                            </li>
                            <li className="flex gap-3">
                                <CheckCircle className="w-5 h-5 text-blue-500 shrink-0" />
                                <span className="text-slate-300">Closed casefile indexing for precedent retrieval</span>
                            </li>
                        </ul>
                        <Button asLink="/#demo" variant="outline">Learn About Judicial Enclaves</Button>
                    </div>
                    <div className="relative">
                        <div className="absolute inset-0 bg-blue-500/10 blur-[100px] rounded-full"></div>
                        <div className="relative bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
                            <div className="space-y-6">
                                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                                    <div className="flex items-center gap-3">
                                        <Landmark className="text-blue-400" />
                                        <span className="font-bold text-white">Sovereign Knowledge Base</span>
                                    </div>
                                    <span className="text-[10px] font-mono text-slate-500">ENCRYPTED SILO: GH-01</span>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-center">
                                        <div className="text-2xl font-bold text-white">100%</div>
                                        <div className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Constitutional Alignment</div>
                                    </div>
                                    <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-center">
                                        <div className="text-2xl font-bold text-white">Verified</div>
                                        <div className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Judicial Precedents</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Section>

            <Section>
                <SectionHeader title="Sovereign Capabilities" />
                <div className="grid md:grid-cols-3 gap-6">
                    <CapabilityCard icon={<Landmark />} title="Departmental Separation" desc="Ensure strict firewalls between investigation, prosecution, and administrative teams." />
                    <CapabilityCard icon={<Database />} title="Data Sovereignty" desc="Data is stored strictly within national borders on government-approved infrastructure." />
                    <CapabilityCard icon={<Fingerprint />} title="Identity Control" desc="Integrate with national ID systems or government SSO for secure authentication." />
                </div>
            </Section>
            <RelatedInsights
                heading="Guides for Government Legal Teams"
                articles={[
                    { slug: '/insights/government-legal-case-management', title: 'Government Legal Case Management Systems Explained', excerpt: 'How modern governments manage legal matters, audit trails, and departmental accountability.', readTime: '10 min read' },
                    { slug: '/insights/sovereign-legal-data-infrastructure', title: 'Sovereign Legal Data Infrastructure', excerpt: 'What data sovereignty means for legal institutions and why it matters for government sectors.', readTime: '11 min read' },
                    { slug: '/insights/legal-software-africa-guide', title: 'Legal Software for Africa: 2026 Guide', excerpt: 'Jurisdiction-specific requirements, data sovereignty, and top platforms for African institutions.', readTime: '12 min read' },
                ]}
            />
        </Layout>
    );
}

function CheckBadge({ text }: { text: string }) {
    return (
        <span className="bg-slate-800 text-slate-300 px-3 py-1 rounded-full text-sm font-medium border border-slate-700">
            {text}
        </span>
    )
}

function CapabilityCard({ icon, title, desc }: any) {
    return (
        <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-xl text-center">
            <div className="text-blue-400 flex justify-center mb-4 child:w-8 child:h-8">{icon}</div>
            <h3 className="font-bold text-white mb-2">{title}</h3>
            <p className="text-slate-400 text-sm">{desc}</p>
        </div>
    )
}
