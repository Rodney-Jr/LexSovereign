import React from 'react';
import Layout from '../../layouts/Layout';
import SEO from '../../components/SEO';
import { Section, Button } from '../../components/ui';
import { Target, TrendingUp, ArrowRight, CheckCircle, BarChart3 } from 'lucide-react';
import { Link } from '../../utils/ssr-compat';

export default function LeadLifecycleManagement() {
    return (
        <Layout>
            <SEO
                title="Lead Lifecycle Management for Enterprise Legal Teams"
                description="How enterprise law firms optimize the journey from inquiry to retained matter using lead scoring and conversion analytics."
            />
            <Section className="pt-32 pb-20 bg-slate-950">
                <div className="max-w-4xl mx-auto">
                    <Link to="/insights" className="text-indigo-400 text-sm font-medium mb-8 inline-flex items-center gap-2 hover:gap-3 transition-all">
                        <ArrowRight className="w-4 h-4 rotate-180" /> Back to Insights
                    </Link>
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-8">
                        The Master Pipeline: Lead Lifecycle Management for Law Firms
                    </h1>
                    <div className="flex items-center gap-4 mb-12 text-slate-500 text-sm">
                        <span className="bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-full border border-indigo-500/20">CRM Strategy</span>
                        <span>11 min read</span>
                        <span>Feb 20, 2026</span>
                    </div>

                    <div className="prose prose-invert max-w-none">
                        <p className="text-xl text-slate-300 leading-relaxed mb-8">
                            In a high-growth law firm, the goal isn't just "more leads"—it's a high-quality matter conversion engine. Managing the lifecycle from the first click to the signed engagement letter requires institutional oversight and data-driven insights.
                        </p>

                        <h2 className="text-white">Stage 1: The Intelligent Capture</h2>
                        <p>
                            Modern lifecycle management starts with **Lead Scoring**. Not every inquiry is equal. AI intake allows you to score leads based on case value, urgency, and conflict status before a human ever touches the record.
                        </p>

                        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl my-10 not-prose">
                            <h4 className="text-white font-bold mb-6 flex items-center gap-2"><BarChart3 className="w-5 h-5 text-indigo-400" /> Key Lifecycle Metrics</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-white mb-1">CPL</div>
                                    <div className="text-slate-500 text-[10px] uppercase tracking-tighter">Cost Per Lead</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-white mb-1">MCR</div>
                                    <div className="text-slate-500 text-[10px] uppercase tracking-tighter">Matter Conversion</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-white mb-1">LVR</div>
                                    <div className="text-slate-500 text-[10px] uppercase tracking-tighter">Lead Value Ratio</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-white mb-1">TTO</div>
                                    <div className="text-slate-500 text-[10px] uppercase tracking-tighter">Time to Open</div>
                                </div>
                            </div>
                        </div>

                        <h2 className="text-white">Closing the Information Gap</h2>
                        <p>
                            The biggest leak in the legal pipeline is the "follow-up lag." If a qualified lead isn't contacted within 5 minutes, the chance of conversion drops by 400%. NomosDesk automates the initial follow-up, scheduling consultations directly from the chat based on your firm's availability.
                        </p>
                    </div>

                    <div className="mt-16 p-8 bg-slate-900 border border-slate-800 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="text-center md:text-left">
                            <h3 className="text-2xl font-bold text-white mb-2">Optimize Your Funnel</h3>
                            <p className="text-slate-400">See how NomosDesk transforms leads into institutional assets.</p>
                        </div>
                        <Button asLink="/law-firm-crm-software">View CRM Solutions</Button>
                    </div>
                </div>
            </Section>
        </Layout>
    );
}
