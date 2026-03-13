import React from 'react';
import Layout from '../layouts/Layout';
import SEO from '../components/SEO';
import { Section, SectionHeader, Button } from '../components/ui';
import { BookOpen, TrendingUp, ShieldCheck, Cpu, ChevronRight, FileSearch } from 'lucide-react';

export default function LegalOperationsPage() {
    return (
        <Layout>
            <SEO
                title="What is Legal Operations? | NomosDesk Education"
                description="Learn how legal operations transform law firms through efficiency, technology, and strategic governance."
            />

            {/* HERO */}
            <section className="relative pt-32 pb-20 bg-slate-950">
                <div className="max-w-5xl mx-auto px-6 text-center">
                    <h1 className="text-4xl md:text-6xl font-black text-white mb-6">
                        The Science of <br />
                        <span className="text-emerald-400">Legal Operations</span>
                    </h1>
                    <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
                        Beyond the law. Modernizing how legal work is delivered through technology, process, and data.
                    </p>
                </div>
            </section>

            {/* DEFINITION */}
            <Section>
                <div className="grid md:grid-cols-2 gap-16 items-center">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase tracking-[0.2em] mb-6">
                            Education Layer
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-6">What Is Legal Operations?</h2>
                        <p className="text-slate-300 text-lg leading-relaxed mb-6">
                            Legal Operations (or "Legal Ops") is the set of business processes, activities, and professionals that enable a legal firm or department to deliver legal services effectively by focusing on administrative and operational excellence.
                        </p>
                        <p className="text-slate-400 leading-relaxed mb-8">
                            While lawyers focus on substantive law, Legal Ops focuses on <strong>how</strong> that work gets done—ensuring efficiency, cost-control, and risk management through modern digital infrastructure.
                        </p>
                        <Button asLink="/pilot-program">Join the Pilot Program</Button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-4 pt-8">
                            <StatCard title="Efficiency" icon={<TrendingUp className="text-emerald-400" />} />
                            <StatCard title="Compliance" icon={<ShieldCheck className="text-blue-400" />} />
                        </div>
                        <div className="space-y-4">
                            <StatCard title="Technology" icon={<Cpu className="text-indigo-400" />} />
                            <StatCard title="Knowledge" icon={<BookOpen className="text-purple-400" />} />
                        </div>
                    </div>
                </div>
            </Section>

            {/* WHY IT MATTERS */}
            <Section darker>
                <SectionHeader 
                    title="Why Legal Operations Matter"
                    subtitle="Strategic advantages for law firms that demand precision and scalability."
                />
                <div className="grid md:grid-cols-3 gap-8">
                    {[
                        { title: "Operational Efficiency", desc: "Automate repetitive tasks like conflict checking and document formatting to free up associate time.", icon: <Zap className="w-6 h-6 text-emerald-400" /> },
                        { title: "Strict Governance", desc: "Enforce audit trails and role-based access across every matter to maintain professional integrity.", icon: <Shield className="w-6 h-6 text-indigo-400" /> },
                        { title: "Cost Management", desc: "Track every expense and billable minute with surgical precision to ensure 100% cost recovery.", icon: <Receipt className="w-6 h-6 text-amber-400" /> },
                    ].map((item, idx) => (
                        <div key={idx} className="bg-slate-900 border border-slate-800 p-8 rounded-3xl hover:border-indigo-500/30 transition-colors">
                            <div className="mb-4">{item.icon}</div>
                            <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                            <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </Section>

            {/* CHALLENGES */}
            <Section>
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-3xl font-bold text-white mb-12 text-center">Common Operational Challenges</h2>
                    <div className="space-y-4">
                        {[
                            { q: "Fragmented Document Systems", a: "Storing files across email, personal drives, and physical folders leads to data loss and unauthorized access." },
                            { q: "Manual Conflict Checking", a: "Reliance on memory or manual searching increases the risk of professional liability and ethical breaches." },
                            { q: "Missed Deadlines & Hearing Dates", a: "Lack of centralized matter tracking leads to missed filing deadlines and court appearances." },
                            { q: "Zero Operational Visibility", a: "Managing partners often lack real-time data on matter profitability, associate utilization, and firm-wide risk." }
                        ].map((item, idx) => (
                            <div key={idx} className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl flex items-start gap-4">
                                <div className="p-2 bg-red-500/10 rounded-lg shrink-0">
                                    <ShieldAlert className="w-4 h-4 text-red-400" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-white mb-1">{item.q}</h4>
                                    <p className="text-sm text-slate-400">{item.a}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </Section>

            {/* NOMOSDESK SOLUTION */}
            <Section darker className="bg-indigo-950/20">
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-white mb-6">How NomosDesk Solves These Challenges</h2>
                    <p className="text-slate-300 max-w-2xl mx-auto mb-10 text-lg">
                        We provide the unified digital infrastructure that turns fragmented law firms into high-performing institutional enclaves.
                    </p>
                    <div className="flex justify-center gap-4">
                        <Button href="/ai-legal-intelligence" variant="outline" size="lg">Explore AI Intelligence</Button>
                        <Button onClick={() => window.dispatchEvent(new CustomEvent('nomosdesk-open-demo'))} size="lg">Request Private Demo</Button>
                    </div>
                </div>
            </Section>
        </Layout>
    );
}

function StatCard({ title, icon }: any) {
    return (
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col items-center text-center shadow-lg">
            <div className="p-3 bg-slate-800 rounded-xl mb-4">{icon}</div>
            <span className="text-sm font-bold text-white uppercase tracking-widest">{title}</span>
        </div>
    );
}

// Fixed missing icons from local context
function Zap(props: any) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14.71 11.23 4h.77l-1 9h7l-7.23 10h-.77l1-9h-7Z"/></svg> }
function Shield(props: any) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/></svg> }
function Receipt(props: any) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1Z"/><path d="M16 8H8"/><path d="M16 12H10"/><path d="M16 16H8"/></svg> }
function ShieldAlert(props: any) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg> }
