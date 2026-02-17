import React, { useState, useEffect } from 'react';
import { Loader2, Settings, Check } from 'lucide-react';
import { apiFetch } from '../utils/api';
import Layout from '../layouts/Layout';
import SEO from '../components/SEO';
import { Section, SectionHeader, Button } from '../components/ui';

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
        basePrice: 99,
        pricePerUser: 10,
        creditsIncluded: 0,
        features: ['5 Users Max', 'Basic Conflict Checking', 'Standard Document Management', 'No Chatbot Widget']
    },
    {
        id: 'Professional',
        basePrice: 149,
        pricePerUser: 15,
        creditsIncluded: 50,
        features: ['50 Users Max', 'Advanced Conflict Workflows', 'AI Chatbot Widget (Included)', 'Judicial Research & Case Memory', 'Priority Support']
    },
    {
        id: 'Institutional',
        basePrice: 0,
        pricePerUser: 25,
        creditsIncluded: 0,
        features: ['Unlimited Users', 'Deep Judicial Research Enclave', 'Multi-Entity Support', 'Full Audit Trail', 'White-Label Chatbot', 'SSO & Custom Security']
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
                title="Transparent Pricing"
                description="Simple, scalable pricing for law firms and institutions. Choose the plan that fits your governance needs."
            />

            <Section className="pt-32">
                <SectionHeader
                    title="Simple, Transparent Pricing"
                    subtitle="Choose the governance level that fits your organization. No hidden fees."
                />

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
                                price={config.basePrice === 0 ? 'Custom' : `$${config.basePrice}`}
                                pricePerUser={config.pricePerUser}
                                userMonth={config.pricePerUser > 0}
                                featured={config.id === 'Institutional' || config.id === 'Professional'}
                                description={
                                    config.id === 'Standard' || config.id === 'Starter' ? "For small firms establishing governance." :
                                        config.id === 'Institutional' || config.id === 'Professional' ? "For growing firms requiring oversight." :
                                            "For enterprise and government institutional scale."
                                }
                                features={config.features}
                            />
                        ))}
                    </div>
                )}

                <div className="mt-20 grid md:grid-cols-2 gap-8 max-w-6xl mx-auto items-center">
                    <div className="p-8 bg-slate-900/40 border border-slate-800 rounded-[2.5rem] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 text-emerald-500/10 group-hover:text-emerald-500/20 transition-colors">
                            <Settings size={120} />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                            <Settings className="text-emerald-400" /> Hybrid Pricing Governance
                        </h3>
                        <p className="text-slate-300 mb-6 leading-relaxed relative z-10">
                            NomosDesk isn't just a platform; it's a governance layer. Institutional clients can manage their own tiered rates,
                            user allocations, and internal feature sets directly through the <strong>Sovereign Control Plane</strong>.
                        </p>
                        <div className="flex flex-wrap gap-3 mb-6">
                            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-mono rounded-full border border-emerald-500/20">Dynamic Calibration</span>
                            <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 text-xs font-mono rounded-full border border-indigo-500/20">Enclave Billing</span>
                            <span className="px-3 py-1 bg-slate-800 text-slate-300 text-xs font-mono rounded-full">RBAC Enforcement</span>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-indigo-900/20 to-slate-900/40 border border-indigo-900/50 rounded-[2.5rem] p-8 text-center md:text-left">
                        <h3 className="text-xl font-bold text-white mb-2">Emerging Market Program</h3>
                        <p className="text-slate-300 mb-6">
                            We advocate for rule of law worldwide. Special pricing is available for qualifying institutions in emerging markets.
                        </p>
                        <Button asLink="/#demo" variant="outline">Contact for Eligibility</Button>
                    </div>
                </div>
            </Section>

            <Section darker>
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-2xl font-bold mb-8">Pricing FAQ</h2>
                    <div className="space-y-6">
                        <FAQItem q="Is there a minimum contract?" a="Starter and Professional plans are monthly. Institutional plans typically require an annual agreement." />
                        <FAQItem q=" Does the price include onboarding?" a="Institutional plans include dedicated onboarding and data migration services." />
                        <FAQItem q="Can I add users anytime?" a="Yes, you can scale your license count up instantly." />
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

            <Button variant={featured ? 'primary' : 'outline'} asLink={price === 'Custom' ? '/#demo' : `${import.meta.env.VITE_PLATFORM_URL || 'http://localhost:3000'}/?plan=${title}`} className="w-full">
                {price === 'Custom' ? 'Contact Sales' : 'Start Trial'}
            </Button>
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
