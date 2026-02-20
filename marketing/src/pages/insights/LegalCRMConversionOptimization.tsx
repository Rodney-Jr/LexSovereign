import React from 'react';
import Layout from '../../layouts/Layout';
import SEO from '../../components/SEO';
import { Section, Button } from '../../components/ui';
import { Target, BarChart3, ArrowRight, CheckCircle, MousePointer2 } from 'lucide-react';
import { Link } from '../../utils/ssr-compat';

export default function LegalCRMConversionOptimization() {
    return (
        <Layout>
            <SEO
                title="Legal CRM Conversion Optimization: Mastering the Lead Flow"
                description="A guide for law firm marketing departments on optimizing lead conversion through AI-driven scoring, automated follow-up, and real-time analytics."
            />
            <Section className="pt-32 pb-20 bg-slate-950">
                <div className="max-w-4xl mx-auto">
                    <Link to="/insights" className="text-indigo-400 text-sm font-medium mb-8 inline-flex items-center gap-2 hover:gap-3 transition-all">
                        <ArrowRight className="w-4 h-4 rotate-180" /> Back to Insights
                    </Link>
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-8">
                        Mastering the Lead Flow: CRM Conversion Optimization
                    </h1>
                    <div className="flex items-center gap-4 mb-12 text-slate-500 text-sm">
                        <span className="bg-orange-500/10 text-orange-400 px-3 py-1 rounded-full border border-orange-500/20">Client Acquisition</span>
                        <span>9 min read</span>
                        <span>Feb 20, 2026</span>
                    </div>

                    <div className="prose prose-invert max-w-none">
                        <p className="text-xl text-slate-300 leading-relaxed mb-8">
                            Capturing a lead is only the beginning. The real challenge is converting that inquiry into a retained client. In 2026, conversion is a game of speed, personalization, and automated persistence.
                        </p>

                        <h2 className="text-white">The "Speed to Lead" Advantage</h2>
                        <p>
                            Studies show that contacting a lead within 5 minutes results in a 900% increase in lead contact rates. NomosDesk's native CRM integrates directly with the AI intake assistant, pushing qualified leads into a priority queue for instant human follow-up.
                        </p>

                        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl my-10 not-prose">
                            <h4 className="text-white font-bold mb-6 flex items-center gap-2 font-bold uppercase tracking-widest text-xs text-indigo-400">Optimization Checklist</h4>
                            <div className="space-y-4">
                                <div className="flex gap-4">
                                    <Target className="w-5 h-5 text-emerald-400 shrink-0" />
                                    <div>
                                        <h5 className="text-white font-bold text-sm mb-1">Lead Scoring</h5>
                                        <p className="text-slate-500 text-xs">Prioritize leads based on case value and urgency markers identified by AI.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <BarChart3 className="w-5 h-5 text-emerald-400 shrink-0" />
                                    <div>
                                        <h5 className="text-white font-bold text-sm mb-1">Attribution Tracking</h5>
                                        <p className="text-slate-500 text-xs">Know exactly which marketing channels (SEO, PPC, Referral) are driving your most profitable matters.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <h2 className="text-white">Continuous Nurturing</h2>
                        <p>
                            Not every lead is ready to sign today. Automated nurturing sequences—SMS, Email, and WhatsApp—keep your firm top-of-mind. By providing educational content related to their specific matter type (e.g., "What to do after a car accident"), you build authority and trust before the first consultation.
                        </p>
                    </div>

                    <div className="mt-16 p-8 bg-slate-900 border border-slate-800 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-8">
                        <div>
                            <h3 className="text-2xl font-bold text-white mb-2">Turn Leads into Clients</h3>
                            <p className="text-slate-400">Master your conversion funnel with NomosDesk CRM.</p>
                        </div>
                        <Button asLink="/law-firm-crm-software">Explore CRM Mastery</Button>
                    </div>
                </div>
            </Section>
        </Layout>
    );
}
