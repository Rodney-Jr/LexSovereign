import React from 'react';
import Layout from '../../layouts/Layout';
import SEO from '../../components/SEO';
import { Section, Button } from '../../components/ui';
import { Link } from '../../utils/ssr-compat';
import { BookOpen, ArrowRight, TrendingUp, Users, Globe, Shield, Bot, Lock, Briefcase, MousePointer2, Database, Cpu, Zap, XCircle, Target, Archive, Cloud, ShieldCheck, History } from 'lucide-react';

const articles = [
    {
        slug: '/insights/legal-software-africa-guide',
        title: 'Legal Software for Africa: 2026 Guide',
        excerpt: 'An in-depth guide to choosing the right legal practice management software for African law firms, covering jurisdiction-specific requirements and data sovereignty.',
        category: 'Market Guide',
        readTime: '12 min read',
        icon: Globe,
    },
    {
        slug: '/insights/government-legal-case-management',
        title: 'Government Legal Case Management Systems Explained',
        excerpt: 'How modern governments manage legal matters, audit trails, and departmental accountability with purpose-built case management systems.',
        category: 'Government',
        readTime: '10 min read',
        icon: Shield,
    },
    {
        slug: '/insights/conflict-checking-software-law-firms',
        title: 'Conflict Checking Software for Law Firms',
        excerpt: 'Why manual conflict checks fail, and how automated conflict checking software protects law firms from ethical violations and client disqualifications.',
        category: 'Practice Management',
        readTime: '9 min read',
        icon: Users,
    },
    {
        slug: '/insights/sovereign-legal-data-infrastructure',
        title: 'Sovereign Legal Data Infrastructure',
        excerpt: 'What data sovereignty means for legal institutions and why it matters for institutions operating in Africa, the Middle East, and government sectors.',
        category: 'Data & Security',
        readTime: '11 min read',
        icon: Shield,
    },
    {
        slug: '/insights/nomosdesk-vs-clio',
        title: 'NomosDesk vs Clio: Which Is Right for Your Firm?',
        excerpt: 'A detailed comparison of NomosDesk and Clio — covering pricing, features, African market fit, government support, and data governance.',
        category: 'Comparison',
        readTime: '14 min read',
        icon: TrendingUp,
    },
    {
        slug: '/insights/future-of-legal-ai-chatbots',
        title: 'The Future of AI Chatbots in Legal Intake',
        excerpt: 'How AI-powered chatbots are transforming legal client intake by providing instant qualification and 24/7 engagement.',
        category: 'AI & Automation',
        readTime: '8 min read',
        icon: Bot,
    },
    {
        slug: '/insights/automating-conflict-checks',
        title: 'Automating Conflict of Interest Checks',
        excerpt: 'Learn how automated conflict checking software prevents ethical violations and streamlines matter intake.',
        category: 'Governance',
        readTime: '10 min read',
        icon: Shield,
    },
    {
        slug: '/insights/sovereign-legal-tech-trends-2026',
        title: 'The Rise of Sovereign Legal Tech: 2026 Trends',
        excerpt: 'Explore why data sovereignty and regional legal tech enclaves are becoming the standard for law firms and governments.',
        category: 'Market Trends',
        readTime: '9 min read',
        icon: Globe,
    },
    {
        slug: '/insights/modernizing-ministries-of-justice',
        title: 'Modernizing Ministries of Justice',
        excerpt: 'A guide for government legal departments on digital transformation and judicial records management.',
        category: 'Government Tech',
        readTime: '12 min read',
        icon: Briefcase,
    },
    {
        slug: '/insights/data-sovereignty-compliance-africa',
        title: 'Data Sovereignty: POPIA and NDPR Guide',
        excerpt: 'A compliance guide for law firms in Africa. Learn how to manage legal data sovereignty under POPIA and NDPR.',
        category: 'Compliance',
        readTime: '11 min read',
        icon: Lock,
    },
    {
        slug: '/insights/static-forms-vs-ai-intake',
        title: 'Static Forms vs. AI Intake: The 2026 Conversion Gap',
        excerpt: 'Why traditional law firm contact forms are failing and how AI-powered conversational intake increases conversion rates.',
        category: 'Client Intake',
        readTime: '7 min read',
        icon: MousePointer2,
    },
    {
        slug: '/insights/cloud-vs-private-enclaves-security',
        title: 'Cloud vs. Private Enclaves: 2026 Security',
        excerpt: 'Choosing between standard cloud and private sovereign enclaves for legal data isolation and residency.',
        category: 'Data Security',
        readTime: '9 min read',
        icon: Database,
    },
    {
        slug: '/insights/inter-departmental-government-legal-collaboration',
        title: 'Government Legal Collaboration',
        excerpt: 'How government legal departments can collaborate across branches while maintaining strict data firewalls.',
        category: 'Public Sector',
        readTime: '11 min read',
        icon: Users,
    },
    {
        slug: '/insights/hardware-level-sovereign-db-security',
        title: 'Hardware-Level Sovereign Security',
        excerpt: 'Protecting legal institutions with Trusted Execution Environments and hardware-level data isolation.',
        category: 'Technical Security',
        readTime: '10 min read',
        icon: Cpu,
    },
    {
        slug: '/insights/personal-injury-intake-automation',
        title: 'Personal Injury Intake Automation',
        excerpt: 'How personal injury firms are using AI intake to recover hours and increase conversion rates.',
        category: 'Practice Specific',
        readTime: '8 min read',
        icon: Zap,
    },
    {
        slug: '/insights/immigration-intake-automation',
        title: 'Immigration Law Intake: AI Efficiency',
        excerpt: 'How immigration law firms use AI intake assistants to automate document collection and qualification.',
        category: 'Practice Specific',
        readTime: '10 min read',
        icon: Globe,
    },
    {
        slug: '/insights/why-generic-crms-fail-law-firms',
        title: 'Why Generic CRMs Fail Law Firms',
        excerpt: 'Generic CRMs lack the specific governance and conflict checking needs of a law firm. Learn what to use.',
        category: 'Legal Technology',
        readTime: '9 min read',
        icon: XCircle,
    },
    {
        slug: '/insights/lead-lifecycle-management-for-legal-teams',
        title: 'Lead Lifecycle Management',
        excerpt: 'How enterprise law firms optimize the journey from inquiry to retained matter using lead scoring.',
        category: 'CRM Strategy',
        readTime: '11 min read',
        icon: Target,
    },
    {
        slug: '/insights/unalterable-audit-trails-judicial-records',
        title: 'Unalterable Audit Trails',
        excerpt: 'Learn why cryptographically locked audit trails are essential for judicial integrity and compliance.',
        category: 'Judicial Security',
        readTime: '12 min read',
        icon: Lock,
    },
    {
        slug: '/insights/automating-matter-close-out-compliance',
        title: 'Automating Matter Close-out',
        excerpt: 'Learn how to automate the final phase of the legal lifecycle: closure, retention, and archiving.',
        category: 'Compliance',
        readTime: '8 min read',
        icon: Archive,
    },
    {
        slug: '/insights/digital-transformation-guide-2026',
        title: 'Partner Guide to Digital Transformation',
        excerpt: 'A strategic roadmap for law firm partners to lead digital transformation, focusing on governance and AI ROI.',
        category: 'Digital Strategy',
        readTime: '13 min read',
        icon: TrendingUp,
    },
    {
        slug: '/insights/legacy-legal-data-migration-sovereign-cloud',
        title: 'The Great Legacy Data Migration',
        excerpt: 'A guide for law firms on migrating legacy matter data from on-premise servers to secure, sovereign cloud enclaves.',
        category: 'Data Migration',
        readTime: '11 min read',
        icon: Cloud,
    },
    {
        slug: '/insights/iso-27001-readiness-law-firms',
        title: 'ISO 27001 Readiness Checklist',
        excerpt: 'Prepare your law firm for ISO 27001 certification. Learn about essential security controls and software impact.',
        category: 'Compliance',
        readTime: '10 min read',
        icon: ShieldCheck,
    },
    {
        slug: '/insights/audit-ready-automated-legal-records',
        title: 'Audit-Ready: Automated Records',
        excerpt: 'Discover why unalterable legal records are the primary defense against professional liability and institutional risk.',
        category: 'Governance',
        readTime: '9 min read',
        icon: History,
    },
    {
        slug: '/insights/legal-crm-conversion-optimization',
        title: 'CRM Conversion Optimization',
        excerpt: 'A guide for law firm marketing on optimizing lead conversion through AI-driven scoring and data analytics.',
        category: 'Client Acquisition',
        readTime: '9 min read',
        icon: BarChart3,
    },
];

export default function InsightsIndexPage() {
    return (
        <Layout>
            <SEO
                title="Legal Technology Insights & Guides"
                description="Expert guides on legal practice management, conflict checking, data sovereignty, government legal systems, and legal software for Africa."
                schema={[
                    {
                        '@context': 'https://schema.org',
                        '@type': 'Blog',
                        name: 'NomosDesk Insights',
                        url: 'https://nomosdesk.com/insights',
                        description: 'Expert legal technology guides and governance insights.',
                        publisher: {
                            '@type': 'Organization',
                            name: 'NomosDesk',
                            url: 'https://nomosdesk.com',
                        },
                    },
                    {
                        '@context': 'https://schema.org',
                        '@type': 'BreadcrumbList',
                        itemListElement: [
                            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://nomosdesk.com' },
                            { '@type': 'ListItem', position: 2, name: 'Insights', item: 'https://nomosdesk.com/insights' },
                        ],
                    },
                ]}
            />

            {/* Hero */}
            <Section className="pt-32 pb-12 bg-slate-950">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-medium mb-6">
                        <BookOpen className="w-4 h-4" /> Legal Technology Insights
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                        Guides for Legal Institutions
                    </h1>
                    <p className="text-xl text-slate-300 max-w-2xl mx-auto">
                        Expert analysis on legal practice management, data sovereignty, conflict checking, and governance for law firms, enterprises, and governments.
                    </p>
                </div>
            </Section>

            {/* Articles Grid */}
            <Section className="pb-24 bg-slate-950">
                <div className="max-w-6xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {articles.map((article) => {
                        const Icon = article.icon;
                        return (
                            <Link
                                key={article.slug}
                                to={article.slug}
                                className="group bg-slate-900/50 border border-slate-800 hover:border-indigo-500/30 rounded-2xl p-6 flex flex-col transition-colors"
                            >
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 bg-indigo-500/10 rounded-lg flex items-center justify-center text-indigo-400 shrink-0">
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <span className="text-xs font-medium text-indigo-400 uppercase tracking-wider">{article.category}</span>
                                </div>
                                <h2 className="text-lg font-bold text-white mb-3 group-hover:text-indigo-300 transition-colors leading-snug">
                                    {article.title}
                                </h2>
                                <p className="text-slate-400 text-sm leading-relaxed flex-1 mb-4">
                                    {article.excerpt}
                                </p>
                                <div className="flex items-center justify-between text-xs text-slate-500">
                                    <span>{article.readTime}</span>
                                    <ArrowRight className="w-4 h-4 text-indigo-500 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </Section>

            {/* CTA */}
            <Section darker className="text-center">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-3xl font-bold text-white mb-4">Ready to Transform Your Legal Operations?</h2>
                    <p className="text-slate-300 mb-8">See how NomosDesk can bring institutional-grade governance to your organization.</p>
                    <div className="flex gap-4 justify-center">
                        <Button onClick={() => window.dispatchEvent(new CustomEvent('nomosdesk-open-demo'))}>
                            Request Private Demo
                        </Button>
                        <Button asLink="/pricing" variant="outline">View Pricing</Button>
                    </div>
                </div>
            </Section>
        </Layout>
    );
}
