import React, { useState, useEffect } from 'react';
import { Loader2, Settings, Check, Shield, Lock, Users, Sparkles, Building2, Globe, TrendingUp } from 'lucide-react';
import { apiFetch } from '../utils/api';
import Layout from '../layouts/Layout';
import SEO from '../components/SEO';
import { Section, SectionHeader, Button } from '../components/ui';
import type { SsgOptions } from 'vite-plugin-ssg';

export const ssgOptions: SsgOptions = {
    slug: 'pricing',
    routeUrl: '/pricing',
    context: async (children) => {
        const { StaticRouter, HelmetProvider } = await import('../utils/ssr-compat');
        return (
            <HelmetProvider>
                <StaticRouter location="/pricing">{children}</StaticRouter>
            </HelmetProvider>
        );
    },
};

interface PricingConfig {
    id: string; // Plan Name
    basePrice: number;
    pricePerUser: number;
    creditsIncluded: number;
    features: string[];
}

const DEFAULT_PRICING: PricingConfig[] = [
    {
        id: 'Starter',
        basePrice: 0,
        pricePerUser: 0,
        creditsIncluded: 0,
        features: ['Matter management', 'Document storage', 'Conflict checks', 'Basic reporting']
    },
    {
        id: 'Professional',
        basePrice: 0,
        pricePerUser: 0,
        creditsIncluded: 0,
        features: ['Advanced workflows', 'AI document tools', 'Compliance tracking', 'Team collaboration']
    },
    {
        id: 'Enterprise',
        basePrice: 0,
        pricePerUser: 0,
        creditsIncluded: 0,
        features: ['Custom integrations', 'Governance controls', 'Advanced analytics', 'Dedicated infrastructure support']
    }
];

export default function PricingPage() {
    const [configs, setConfigs] = useState<PricingConfig[]>(DEFAULT_PRICING);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPricing = async () => {
            try {
                const response = await apiFetch('/api/pricing');
                if (!response.ok) throw new Error('Failed to fetch');
                const data = await response.json();
                if (Array.isArray(data) && data.length > 0) {
                    setConfigs(data);
                }
            } catch (err: any) {
                console.warn('Using default pricing due to API error:', err);
                // Keep default configs, do not set error state to avoid blocking UI
            } finally {
                setLoading(false);
            }
        };

        fetchPricing();
    }, []);

    return (
        <Layout>
            <SEO
                title="Transparent Pricing for Every Firm"
                description="Simple, usage-based pricing built for emerging markets. Solo from $19/mo, Professional from $79/mo. Enterprise-grade institutional plans from $299/mo."
                schema={[
                    {
                        '@context': 'https://schema.org',
                        '@type': 'SoftwareApplication',
                        name: 'NomosDesk',
                        applicationCategory: 'BusinessApplication',
                        operatingSystem: 'Cloud',
                        offers: [
                            {
                                '@type': 'Offer',
                                name: 'Solo',
                                price: '19',
                                priceCurrency: 'USD',
                                description: 'For solo practitioners and small chambers. Up to 3 users, pay-as-you-go AI.',
                            },
                            {
                                '@type': 'Offer',
                                name: 'Professional',
                                price: '79',
                                priceCurrency: 'USD',
                                description: 'For growing firms. 10 users, 5,000 AI credits, branding and advanced reporting included.',
                            },
                            {
                                '@type': 'Offer',
                                name: 'Institutional',
                                price: '299',
                                priceCurrency: 'USD',
                                description: 'Enterprise-grade for large firms and government bodies. Unlimited users, dedicated sovereign region.',
                            },
                        ],
                    },
                    {
                        '@context': 'https://schema.org',
                        '@type': 'BreadcrumbList',
                        itemListElement: [
                            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://nomosdesk.com' },
                            { '@type': 'ListItem', position: 2, name: 'Pricing', item: 'https://nomosdesk.com/pricing' },
                        ],
                    },
                ]}
            />

            <Section className="pt-32">
                <div className="text-center max-w-3xl mx-auto mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
                        Transparent Pricing for Modern Legal Infrastructure
                    </h1>
                    <p className="text-xl text-slate-300">
                        NomosDesk offers flexible pricing based on the size and operational needs of your firm.
                    </p>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-4">
                        <Loader2 className="animate-spin w-12 h-12 text-indigo-500" />
                        <p className="font-mono animate-pulse">Synchronizing with Sovereign Billing Enclave...</p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {configs.map((config) => (
                            <PricingCard
                                key={config.id}
                                title={config.id}
                                price={config.id === 'Enterprise' ? 'Custom' : 'Tiered'}
                                pricePerUser={config.pricePerUser}
                                userMonth={false}
                                featured={config.id === 'Professional'}
                                description={
                                    config.id === 'Starter' ? "For small law firms establishing digital foundations." :
                                        config.id === 'Professional' ? "For growing firms requiring AI-powered oversight." :
                                            "For large firms and institutional legal departments."
                                }
                                features={config.features}
                            />
                        ))}
                    </div>
                )}

                {/* Founding Firms Program */}
                <div className="mt-32 max-w-6xl mx-auto">
                    <div className="bg-gradient-to-br from-indigo-900/40 to-slate-900/60 border border-indigo-500/30 rounded-[3rem] p-12 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-12 text-indigo-500/5 group-hover:text-indigo-500/10 transition-colors">
                            <Sparkles size={240} />
                        </div>
                        <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
                            <div>
                                <h2 className="text-3xl font-bold text-white mb-6">Founding Firms Program</h2>
                                <p className="text-slate-300 text-lg leading-relaxed mb-8">
                                    NomosDesk is onboarding a limited number of early adopter firms who will collaborate with our development team and receive preferential lifetime pricing.
                                </p>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex items-center gap-3 text-sm text-slate-300">
                                        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 text-indigo-400 font-bold">1</div>
                                        Lifetime preferential pricing
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-slate-300">
                                        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 text-indigo-400 font-bold">2</div>
                                        Priority feature influence
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-slate-300">
                                        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 text-indigo-400 font-bold">3</div>
                                        Direct access to product team
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-slate-300">
                                        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 text-indigo-400 font-bold">4</div>
                                        Founding firm recognition
                                    </div>
                                </div>
                            </div>
                            <div className="bg-slate-950/50 border border-slate-800 p-8 rounded-3xl flex flex-col items-center text-center">
                                <h3 className="text-xl font-bold text-white mb-4">Limited Availability</h3>
                                <p className="text-slate-400 text-sm mb-8">We are accepting only 10 firms for the Q2 Founding Cohort.</p>
                                <Button onClick={() => window.dispatchEvent(new CustomEvent('nomosdesk-open-sales'))} className="w-full">Apply for Founding Firm Status</Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Trust & Infrastructure Layers */}
                <div className="mt-20 grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    <TrustBlock 
                        icon={<Shield className="text-emerald-400" />}
                        title="Security First"
                        description="Enterprise-grade encryption and access controls protect confidential legal data."
                    />
                    <TrustBlock 
                        icon={<Lock className="text-indigo-400" />}
                        title="Governance by Design"
                        description="Built-in conflict checks, audit trails, and structured workflows support regulatory compliance."
                    />
                    <TrustBlock 
                        icon={<Building2 className="text-blue-400" />}
                        title="Built for Legal Institutions"
                        description="Designed specifically for law firms and legal departments managing complex matters."
                    />
                </div>

                <div className="mt-20 grid md:grid-cols-2 gap-8 max-w-6xl mx-auto items-center">
                    <div className="p-8 bg-slate-900/40 border border-slate-800 rounded-[2.5rem] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 text-emerald-500/10 group-hover:text-emerald-500/20 transition-colors">
                            <Settings size={120} />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                            <Settings className="text-emerald-400" /> Legal Infrastructure
                        </h3>
                        <p className="text-slate-300 mb-6 leading-relaxed relative z-10">
                            NomosDesk replaces fragmented systems with a secure, unified platform for managing legal operations, governance, and firm workflows.
                        </p>
                        <div className="flex flex-wrap gap-3 mb-6">
                            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-mono rounded-full border border-emerald-500/20">Unified Platform</span>
                            <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 text-xs font-mono rounded-full border border-indigo-500/20">Governance Layer</span>
                            <span className="px-3 py-1 bg-slate-800 text-slate-300 text-xs font-mono rounded-full">Secure Infrastructure</span>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-indigo-900/20 to-slate-900/40 border border-indigo-900/50 rounded-[2.5rem] p-8 text-center md:text-left">
                        <h3 className="text-xl font-bold text-white mb-2">Early Adopter Pilot Program</h3>
                        <p className="text-slate-300 mb-6">
                            We are currently onboarding a small number of firms through a structured pilot program designed to help shape the future of legal operations technology.
                        </p>
                        <Button onClick={() => window.dispatchEvent(new CustomEvent('nomosdesk-open-sales'))} variant="outline">Apply for Pilot Access</Button>
                    </div>
                </div>
            </Section>

            <Section darker>
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-2xl font-bold mb-8">Pricing FAQ</h2>
                    <div className="space-y-6">
                        <FAQItem q="Is there a minimum contract?" a="Solo and Professional plans are billed monthly with no long-term commitment. Institutional plans typically include an annual agreement with a dedicated SLA." />
                        <FAQItem q="Does the price include onboarding?" a="Institutional plans include dedicated onboarding, data migration and staff training services at no extra cost." />
                        <FAQItem q="Can I add users anytime?" a="Yes, you can scale your seat count up instantly. Additional seats are billed at the per-user rate for your plan." />
                        <FAQItem q="Are AI Credits a recurring charge?" a="Included credits reset monthly with your plan. You can top-up on-demand at $10 per 1,000 credits — a cost that can be passed to clients as a transparent Digital Disbursement." />
                    </div>
                </div>
            </Section>
        </Layout>
    );
}

function PricingCard({ title, price, userMonth, pricePerUser, description, features, featured }: any) {
    return (
        <div className={`p-8 rounded-3xl border flex flex-col relative ${featured ? 'bg-slate-900 border-indigo-500 shadow-xl shadow-indigo-900/10' : 'bg-slate-950/50 border-slate-800'}`}>
            {featured && (
                <div className="absolute top-0 transform -translate-y-1/2 left-0 right-0 text-center">
                    <span className="bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-full">MOST POPULAR</span>
                </div>
            )}
            <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
            <div className="flex items-baseline gap-1 mb-2">
                <span className="text-4xl font-bold text-white">{price}</span>
                {userMonth && <span className="text-slate-500">/user/mo (${pricePerUser})</span>}
            </div>
            <p className="text-slate-400 text-sm mb-8 min-h-[40px]">{description}</p>

            <div className="space-y-4 flex-1 mb-8">
                {features.map((f: string, i: number) => (
                    <div key={i} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-emerald-500 shrink-0" />
                        <span className="text-sm text-slate-300">{f}</span>
                    </div>
                ))}
            </div>

            <Button
                variant={featured ? 'primary' : 'outline'}
                onClick={() => window.dispatchEvent(new CustomEvent('nomosdesk-open-sales'))}
                className="w-full"
            >
                {title === 'Enterprise' ? 'Contact Sales' : 'Request Demo'}
            </Button>
        </div>
    );
}

function TrustBlock({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
    return (
        <div className="p-8 bg-slate-900/40 border border-slate-800 rounded-3xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-xl shadow-inner">
                {icon}
            </div>
            <h4 className="text-lg font-bold text-white">{title}</h4>
            <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
        </div>
    );
}

function FAQItem({ q, a }: { q: string, a: string }) {
    return (
        <div className="border-b border-slate-800 pb-4">
            <h4 className="font-semibold text-white mb-2">{q}</h4>
            <p className="text-slate-400 text-sm">{a}</p>
        </div>
    )
}
