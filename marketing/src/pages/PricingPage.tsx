import React from 'react';
import Layout from '../layouts/Layout';
import SEO from '../components/SEO';
import { Section, SectionHeader, Button } from '../components/ui';
import { Check } from 'lucide-react';

export default function PricingPage() {
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

                <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {/* Starter */}
                    <PricingCard
                        title="Starter"
                        price="$29"
                        userMonth
                        description="For small firms establishing governance."
                        features={[
                            "Up to 5 Users",
                            "Basic Conflict Checking",
                            "Standard Document Management",
                            "Email Support",
                            "99.9% Uptime"
                        ]}
                    />

                    {/* Professional */}
                    <PricingCard
                        title="Professional"
                        price="$59"
                        userMonth
                        featured
                        description="For growing firms requiring oversight."
                        features={[
                            "Up to 50 Users",
                            "Advanced Conflict Workflows",
                            "Partner Approval Gates",
                            "Audit Logs (30 Days)",
                            "Priority Support",
                            "Client Portal Access"
                        ]}
                    />

                    {/* Institutional */}
                    <PricingCard
                        title="Institutional"
                        price="Custom"
                        description="For enterprise and government."
                        features={[
                            "Unlimited Users",
                            "Multi-Entity Support",
                            "Full Audit Trail (Unlimited)",
                            "Sovereign Data Residency",
                            "Dedicated Success Manager",
                            "SSO & Custom Security",
                            "On-Premise Deployment Option"
                        ]}
                    />
                </div>

                <div className="mt-16 bg-indigo-900/20 border border-indigo-900/50 rounded-2xl p-8 max-w-4xl mx-auto text-center">
                    <h3 className="text-xl font-bold text-white mb-2">Emerging Market Program</h3>
                    <p className="text-slate-300 mb-6">
                        We advocate for rule of law worldwide. Special pricing is available for qualifying institutions in emerging markets.
                    </p>
                    <Button asLink="/#demo" variant="outline">Contact for Eligibility</Button>
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

function PricingCard({ title, price, userMonth, description, features, featured }: any) {
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
                {userMonth && <span className="text-slate-500">/user/mo</span>}
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

            <Button variant={featured ? 'primary' : 'outline'} asLink={price === 'Custom' ? '/#demo' : `http://localhost:3000/?plan=${title}`} className="w-full">
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
