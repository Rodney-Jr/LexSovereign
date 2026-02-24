import React from 'react';
import Layout from '../layouts/Layout';
import SEO from '../components/SEO';
import { Section, SectionHeader, Button } from '../components/ui';
import { Layers, Activity, Users, FileLock } from 'lucide-react';
import RelatedInsights from '../components/RelatedInsights';
import type { SsgOptions } from 'vite-plugin-ssg';

export const ssgOptions: SsgOptions = {
    slug: 'for-enterprise-legal',
    routeUrl: '/for-enterprise-legal',
    context: async (children) => {
        const { StaticRouter, HelmetProvider } = await import('../utils/ssr-compat');
        return (
            <HelmetProvider>
                <StaticRouter location="/for-enterprise-legal">{children}</StaticRouter>
            </HelmetProvider>
        );
    },
};

export default function ForEnterprise() {
    return (
        <Layout>
            <SEO
                title="Legal Governance for Enterprise"
                description="Centralize your corporate legal department with structured oversight, role-based access control, and secure outside counsel management."
                schema={[
                    {
                        '@context': 'https://schema.org',
                        '@type': 'SoftwareApplication',
                        name: 'NomosDesk for Enterprise Legal',
                        applicationCategory: 'BusinessApplication',
                        operatingSystem: 'Cloud',
                        description: 'Enterprise legal governance and matter management for corporate legal departments.',
                        url: 'https://nomosdesk.com/for-enterprise-legal',
                    },
                    {
                        '@context': 'https://schema.org',
                        '@type': 'BreadcrumbList',
                        itemListElement: [
                            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://nomosdesk.com' },
                            { '@type': 'ListItem', position: 2, name: 'For Enterprise Legal', item: 'https://nomosdesk.com/for-enterprise-legal' },
                        ],
                    },
                ]}
            />

            <Section className="bg-slate-950 pt-32 pb-20">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm font-medium mb-6">
                        For Legal Departments & GCs
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                        Centralized Visibility. <br /> Decentralized Execution.
                    </h1>
                    <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
                        Bring your in-house team and outside counsel into one secure ecosystem.
                        Maintain governance over contracts, litigation, and corporate records.
                    </p>
                    <div className="flex justify-center gap-4">
                        <Button onClick={() => window.dispatchEvent(new CustomEvent('nomosdesk-open-demo'))}>Request Consultation</Button>
                    </div>
                </div>
            </Section>

            <Section>
                <div className="grid md:grid-cols-2 gap-12">
                    <BenefitBlock
                        icon={<Layers />}
                        title="Unified Matter Management"
                        text="Move away from spreadsheets. Track every litigation case, IP filing, and corporate transaction in a structured database."
                    />
                    <BenefitBlock
                        icon={<Activity />}
                        title="Spend & Activity Audit"
                        text="See exactly who is working on what. Detailed audit logs provide transparency into user activity and document access."
                    />
                    <BenefitBlock
                        icon={<FileLock />}
                        title="Sovereign Document Control"
                        text="Keep sensitive corporate data encrypted and segregated. Ensure that only the assigned legal team sees sensitive artifacts."
                    />
                    <BenefitBlock
                        icon={<Users />}
                        title="Outside Counsel Collaboration"
                        text="Grant limited, secure access to external law firms without exposing your entire internal file system."
                    />
                </div>
            </Section>

            <Section darker className="text-center">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-3xl font-bold text-white mb-6">Designed for the General Counsel</h2>
                    <p className="text-slate-300 mb-8">
                        "NomosDesk gives me the dashboard I need to report to the Board, while giving my team the tools they need to execute."
                    </p>
                    <Button onClick={() => window.dispatchEvent(new CustomEvent('nomosdesk-open-demo'))} size="lg">See the Dashboard</Button>
                </div>
            </Section>
            <RelatedInsights
                heading="Resources for Enterprise Legal Teams"
                articles={[
                    { slug: '/insights/sovereign-legal-data-infrastructure', title: 'Sovereign Legal Data Infrastructure', excerpt: 'What data sovereignty means for legal institutions and why institutional-grade hosting matters.', readTime: '11 min read' },
                    { slug: '/insights/conflict-checking-software-law-firms', title: 'Conflict Checking Software for Law Firms', excerpt: 'How automated conflict checking prevents ethical violations and malpractice exposure.', readTime: '9 min read' },
                    { slug: '/insights/legal-software-africa-guide', title: 'Legal Software for Africa: 2026 Guide', excerpt: 'Choosing data-sovereign legal software for African markets and corporate legal departments.', readTime: '12 min read' },
                ]}
            />
        </Layout>
    );
}

function BenefitBlock({ icon, title, text }: any) {
    return (
        <div className="flex gap-5">
            <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center shrink-0 text-emerald-400 border border-slate-800">
                {icon}
            </div>
            <div>
                <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
                <p className="text-slate-400 leading-relaxed">{text}</p>
            </div>
        </div>
    )
}
