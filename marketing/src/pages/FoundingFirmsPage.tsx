import React from 'react';
import Layout from '../layouts/Layout';
import SEO from '../components/SEO';
import { Button, Section, SectionHeader } from '../components/ui';
import { Award, ShieldCheck, Users, Zap, CheckCircle2, ArrowRight, Building2, Scale, Rocket, MessageSquare, Lock } from 'lucide-react';
import { Link, StaticRouter, HelmetProvider } from '../utils/ssr-compat';
import PilotApplicationForm from '../components/PilotApplicationForm';
import type { SsgOptions } from 'vite-plugin-ssg';

export const ssgOptions: SsgOptions = {
    slug: 'founding-firms',
    routeUrl: '/founding-firms',
    context: async (children) => {
        return (
            <HelmetProvider>
                <StaticRouter location="/founding-firms">{children}</StaticRouter>
            </HelmetProvider>
        );
    },
};

export default function FoundingFirmsPage() {
    return (
        <Layout>
            <SEO
                title="Become a Founding Firm | NomosDesk"
                description="Join an exclusive cohort of 10 law firms shaping the future of legal operations. Lifetime benefits and direct product influence."
            />

            {/* HERO */}
            <section className="relative pt-32 pb-20 overflow-hidden bg-slate-950">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-500/10 via-slate-950 to-slate-950"></div>
                <div className="max-w-6xl mx-auto px-6 relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-widest mb-8">
                        <Award size={14} /> Founding Firms Cohort Q2 2026
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tight">
                        Shape the Future of <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-indigo-200 italic">
                            Legal Infrastructure.
                        </span>
                    </h1>
                    <p className="text-xl text-slate-300 max-w-3xl mx-auto mb-10 leading-relaxed">
                        We are seeking 10 pioneering law firms to join our Founding Firms program. Collaborate directly with our engineers to build the OS for modern legal practice.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <Button onClick={() => document.getElementById('apply')?.scrollIntoView({ behavior: 'smooth' })} size="lg" className="px-10">
                            Apply for Founding Status
                        </Button>
                        <div className="text-slate-500 text-sm font-mono flex items-center gap-2">
                            <Users size={16} /> 6 of 10 Spots Remaining
                        </div>
                    </div>
                </div>
            </section>

            {/* BENEFITS GRID */}
            <Section darker>
                <SectionHeader 
                    title="Exclusive Founding Benefits" 
                    subtitle="Founding firms receive non-public advantages in exchange for operational feedback and early adoption."
                />
                
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    <BenefitCard 
                        icon={<TrendingUp className="text-emerald-400" />}
                        title="Lifetime Price Lock"
                        desc="Securing founding status guarantees preferential rates for the lifetime of your firm's subscription."
                    />
                    <BenefitCard 
                        icon={<MessageSquare className="text-indigo-400" />}
                        title="Product Roadmap Influence"
                        desc="Direct weekly access to our product team to request features and shape system logic."
                    />
                    <BenefitCard 
                        icon={<Rocket className="text-amber-400" />}
                        title="Priority Implementation"
                        desc="White-glove migration and custom workflow engineering tailored to your firm's specific needs."
                    />
                    <BenefitCard 
                        icon={<ShieldCheck className="text-blue-400" />}
                        title="Sovereign Early Access"
                        desc="Be the first to deploy advanced AI governance and conflict-check modules before general availability."
                    />
                    <BenefitCard 
                        icon={<Award className="text-purple-400" />}
                        title="Institutional Recognition"
                        desc="Recognition as a NomosDesk Founding Firm on our website and in industry press releases."
                    />
                    <BenefitCard 
                        icon={<Building2 className="text-slate-400" />}
                        title="Partner-Level Support"
                        desc="Direct line to our executive team and priority 24/7 technical infrastructure support."
                    />
                </div>
            </Section>

            {/* APPLICATION SECTION */}
            <Section id="apply">
                <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-16 items-start">
                    <div className="space-y-8">
                        <div className="space-y-1">
                            <h2 className="text-3xl font-black text-white uppercase tracking-tight">Pilot Application</h2>
                            <p className="text-slate-400 text-lg leading-relaxed font-medium capitalize">Qualify your firm for the NomosDesk Founding Cohort.</p>
                        </div>
                        
                        <div className="space-y-6">
                            <div className="flex gap-4 p-6 bg-slate-900 border border-slate-800 rounded-2xl">
                                <div className="shrink-0 w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold">1</div>
                                <div>
                                    <h4 className="font-bold text-white mb-1">Qualifying Review</h4>
                                    <p className="text-sm text-slate-400 leading-relaxed">Our team reviews your firm's operational structure and practice areas.</p>
                                </div>
                            </div>
                            <div className="flex gap-4 p-6 bg-slate-900 border border-slate-800 rounded-2xl">
                                <div className="shrink-0 w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold">2</div>
                                <div>
                                    <h4 className="font-bold text-white mb-1">Institutional Briefing</h4>
                                    <p className="text-sm text-slate-400 leading-relaxed">A specialized demo focused on your specific matter management requirements.</p>
                                </div>
                            </div>
                            <div className="flex gap-4 p-6 bg-slate-900 border border-slate-800 rounded-2xl">
                                <div className="shrink-0 w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold">3</div>
                                <div>
                                    <h4 className="font-bold text-white mb-1">Silo Provisioning</h4>
                                    <p className="text-sm text-slate-400 leading-relaxed">Direct collaboration mapping out your migration and workspace logic.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-900/50 border border-slate-800 p-10 rounded-[3rem] shadow-2xl relative">
                        <PilotApplicationForm />
                    </div>
                </div>
            </Section>

            {/* TRUST FOOTER */}
            <Section darker className="text-center">
                <div className="max-w-3xl mx-auto space-y-8">
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">A Partnership in Legal Infrastructure</p>
                    <div className="flex flex-wrap justify-center gap-12 grayscale opacity-40">
                        <div className="flex items-center gap-2 text-xl font-bold text-white tracking-widest"><ShieldCheck /> SECURE</div>
                        <div className="flex items-center gap-2 text-xl font-bold text-white tracking-widest"><Scale /> LAWFUL</div>
                        <div className="flex items-center gap-2 text-xl font-bold text-white tracking-widest"><Lock /> SOVEREIGN</div>
                    </div>
                </div>
            </Section>
        </Layout>
    );
}

function BenefitCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
    return (
        <div className="p-8 bg-slate-900/40 border border-slate-800 rounded-[2.5rem] group hover:border-indigo-500/30 transition-all duration-500">
            <div className="w-14 h-14 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-2xl mb-6 shadow-inner group-hover:scale-110 transition-transform duration-500">
                {icon}
            </div>
            <h3 className="text-xl font-bold text-white mb-4 tracking-tight">{title}</h3>
            <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
        </div>
    );
}

function TrendingUp(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
            <polyline points="17 6 23 6 23 12" />
        </svg>
    )
}
