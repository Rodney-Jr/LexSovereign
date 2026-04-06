import React from 'react';
import Layout from '../layouts/Layout';
import SEO from '../components/SEO';
import { Section, SectionHeader, Button } from '../components/ui';
import { Rocket, Target, Users, Zap, CheckCircle, Shield } from 'lucide-react';
import EarlyAccessForm from '../components/EarlyAccessForm';

export default function PilotProgramPage() {
    return (
        <Layout>
            <SEO
                title="Early Adopter Pilot Program | NomosDesk"
                description="Join the NomosDesk pilot program to shape the future of legal operations technology."
            />

            {/* HERO */}
            <section className="relative pt-32 pb-20 overflow-hidden bg-slate-950">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-900/10 via-transparent to-transparent opacity-50"></div>
                <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-bold uppercase tracking-widest mb-8">
                        Exclusive Partnership
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
                        NomosDesk Early Adopter <br />
                        <span className="text-indigo-400">Pilot Program</span>
                    </h1>
                    <p className="text-xl text-slate-300 mb-10 leading-relaxed max-w-2xl mx-auto">
                        Partner with Nexus Technologies Limited to shape the future of institutional legal operations technology.
                    </p>
                </div>
            </section>

            {/* WHY JOIN */}
            <Section>
                <div className="grid md:grid-cols-2 gap-16 items-center">
                    <div>
                        <h2 className="text-3xl font-bold text-white mb-8">Why Join the Pilot?</h2>
                        <div className="space-y-8">
                            {[
                                { title: "Early Platform Access", desc: "Gain immediate access to our secure legal enclave infrastructure before general availability.", icon: <Rocket className="text-indigo-400" /> },
                                { title: "Direct Feature Influence", desc: "Work closely with our engineers to prioritize the workflows that matter most to your firm.", icon: <Target className="text-emerald-400" /> },
                                { title: "Partner-Level Support", desc: "Founder-level onboarding and priority technical support throughout the pilot duration.", icon: <Users className="text-blue-400" /> },
                                { title: "Lifetime Preferential Pricing", desc: "Secure early adopter rates that stay with your firm for the life of your subscription.", icon: <Zap className="text-amber-400" /> },
                            ].map((item, idx) => (
                                <div key={idx} className="flex gap-4">
                                    <div className="flex-shrink-0 w-12 h-12 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center font-bold">
                                        {item.icon}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white mb-1">{item.title}</h3>
                                        <p className="text-slate-400 leading-relaxed">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 md:p-12 shadow-2xl relative">
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                            <Shield size={120} />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-6">Apply for Pilot Access</h3>
                        <EarlyAccessForm />
                    </div>
                </div>
            </Section>

            {/* WHAT FIRMS RECEIVE */}
            <Section darker>
                <SectionHeader 
                    title="What Pilot Firms Receive"
                    subtitle="A comprehensive infrastructure suite designed for rigorous professional evaluation."
                />
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        "Full Private Platform Access",
                        "Custom Workflow Configuration",
                        "Priority Feature Consideration",
                        "On-site Deployment Assistance",
                        "Dedicated Training Sessions",
                        "Compliance & Audit Readiness",
                        "White-Glove Data Migration",
                        "Early Access to AI Models"
                    ].map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3 bg-slate-900/50 border border-slate-800 p-5 rounded-2xl">
                            <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                            <span className="text-slate-300 font-medium">{item}</span>
                        </div>
                    ))}
                </div>
            </Section>

            {/* WHO SHOULD APPLY */}
            <Section>
                <div className="max-w-4xl mx-auto bg-gradient-to-br from-indigo-900/20 to-slate-950 border border-indigo-500/20 rounded-3xl p-10 md:p-16 text-center">
                    <h2 className="text-3xl font-bold text-white mb-6">Who Should Apply</h2>
                    <p className="text-lg text-slate-300 mb-10 leading-relaxed">
                        We are looking for forward-thinking law firms and corporate legal departments that manage complex workflows and are committed to operational excellence.
                    </p>
                    <div className="grid md:grid-cols-3 gap-6 text-left">
                        {[
                            "Growth-focused law firms seeking structured legal operations.",
                            "Legal teams managing high volumes of complex case files.",
                            "Organizations committed to data sovereignty and compliance."
                        ].map((item, idx) => (
                            <div key={idx} className="bg-slate-950/50 p-6 rounded-2xl border border-slate-800">
                                <p className="text-slate-400 text-sm italic">"{item}"</p>
                            </div>
                        ))}
                    </div>
                    <div className="mt-12">
                        <Button asLink="#apply" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} size="lg">Ready to Apply?</Button>
                    </div>
                </div>
            </Section>
        </Layout>
    );
}
