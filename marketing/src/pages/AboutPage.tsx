import React from 'react';
import Layout from '../layouts/Layout';
import SEO from '../components/SEO';
import { Section, SectionHeader, Button } from '../components/ui';
import { Shield, Rocket, Globe, Users, Heart, Building2 } from 'lucide-react';

export default function AboutPage() {
    return (
        <Layout>
            <SEO
                title="About NomosDesk | Mission & Leadership"
                description="Our mission is to make enterprise-grade legal technology accessible to modern law firms and institutions."
            />

            {/* HERO */}
            <section className="relative pt-32 pb-20 bg-slate-950 overflow-hidden text-center">
                <div className="max-w-4xl mx-auto px-6">
                    <h1 className="text-4xl md:text-6xl font-black text-white mb-6">
                        Building the Future of <br />
                        <span className="text-indigo-400">Legal Infrastructure</span>
                    </h1>
                    <p className="text-xl text-slate-300 leading-relaxed max-w-2xl mx-auto">
                        NomosDesk is developed by Nexus Technologies Limited to provide structured digital infrastructure for modern law firms and institutional legal departments.
                    </p>
                </div>
            </section>

            {/* MISSION */}
            <Section>
                <div className="grid md:grid-cols-2 gap-16 items-center">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[10px] font-black uppercase tracking-[0.2em] mb-6">
                            Our Mission
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-6">Empowering Legal Institutions</h2>
                        <p className="text-slate-300 text-lg leading-relaxed mb-6">
                            Our mission is to make enterprise-grade legal technology accessible to professional services firms and institutions, particularly in emerging markets where data sovereignty and localized context are paramount.
                        </p>
                        <p className="text-slate-400 leading-relaxed mb-8">
                            We believe that legal professionals should be empowered by technology that understands their specific jurisdiction, enforces their ethical obligations, and protects their client's most sensitive data.
                        </p>
                        <ul className="grid grid-cols-2 gap-4">
                            <li className="flex items-center gap-2 text-sm text-slate-300">
                                <Shield className="w-4 h-4 text-indigo-400" /> Security First
                            </li>
                            <li className="flex items-center gap-2 text-sm text-slate-300">
                                <Globe className="w-4 h-4 text-emerald-400" /> Data Sovereignty
                            </li>
                            <li className="flex items-center gap-2 text-sm text-slate-300">
                                <Users className="w-4 h-4 text-blue-400" /> Institutional Scale
                            </li>
                            <li className="flex items-center gap-2 text-sm text-slate-300">
                                <Heart className="w-4 h-4 text-rose-400" /> Founder Commitment
                            </li>
                        </ul>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-10 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                            <Building2 size={150} />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-6">Nexus Technologies Limited</h3>
                        <p className="text-slate-400 leading-relaxed mb-6">
                            Nexus Technologies Limited is an engineering-first company focused on building high-assurance digital infrastructure. NomosDesk is the culmination of years of experience in secure systems and legal automation.
                        </p>
                        <div className="pt-6 border-t border-slate-800">
                            <div className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-500 mb-2">Registered Entity</div>
                            <div className="text-white text-sm">Nexus Technologies Limited (Reg: CS339712014)</div>
                            <div className="text-slate-500 text-xs">Accra, Ghana</div>
                        </div>
                    </div>
                </div>
            </Section>

            {/* VALUES */}
            <Section darker>
                <SectionHeader 
                    title="The Core Enclave Values"
                    subtitle="Our development philosophy is guided by three non-negotiable pillars."
                />
                <div className="grid md:grid-cols-3 gap-8">
                    {[
                        { title: "Sovereignty", desc: "We believe your data should stay where you are. We build for regional compliance from day one.", icon: <Globe className="text-indigo-400" /> },
                        { title: "Precision", desc: "Legal work requires zero errors. Our platform is built for surgical professional accountability.", icon: <Shield className="text-emerald-400" /> },
                        { title: "Accessibility", desc: "Enterprise-grade technology should be priced fairly and perform natively on global infrastructure.", icon: <Rocket className="text-blue-400" /> },
                    ].map((item, idx) => (
                        <div key={idx} className="bg-slate-950 border border-slate-900 p-8 rounded-2xl text-center flex flex-col items-center">
                            <div className="mb-6 p-4 bg-slate-900 rounded-2xl shadow-xl">{item.icon}</div>
                            <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                            <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </Section>

            {/* FINAL CTA */}
            <Section>
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl font-bold text-white mb-6">Interested in Our Mission?</h2>
                    <p className="text-lg text-slate-300 mb-10 leading-relaxed">
                        We are actively seeking pilot partners and institutional collaborators to refine the future of legal technology.
                    </p>
                    <div className="flex justify-center gap-4">
                        <Button asLink="/pilot-program" size="lg">Join the Pilot</Button>
                        <Button asLink="/legal-operations" variant="outline" size="lg">Our Approach to Ops</Button>
                    </div>
                </div>
            </Section>
        </Layout>
    );
}
