import React from 'react';
import Layout from '../../layouts/Layout';
import SEO from '../../components/SEO';
import { Section, Button } from '../../components/ui';
import { Zap, Briefcase, ArrowRight, CheckCircle, TrendingUp } from 'lucide-react';
import { Link } from '../../utils/ssr-compat';

export default function PersonalInjuryIntakeAutomation() {
    return (
        <Layout>
            <SEO
                title="Personal Injury Intake Automation: A 2026 Strategy Guide"
                description="How personal injury firms are using AI intake to recover 15+ hours per week and increase lead conversion rates by 85%."
            />
            <Section className="pt-32 pb-20 bg-slate-950">
                <div className="max-w-4xl mx-auto">
                    <Link to="/insights" className="text-indigo-400 text-sm font-medium mb-8 inline-flex items-center gap-2 hover:gap-3 transition-all">
                        <ArrowRight className="w-4 h-4 rotate-180" /> Back to Insights
                    </Link>
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-8">
                        The Speed Advantage: Automating Personal Injury Intake
                    </h1>
                    <div className="flex items-center gap-4 mb-12 text-slate-500 text-sm">
                        <span className="bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full border border-blue-500/20">Practice Specific</span>
                        <span>8 min read</span>
                        <span>Feb 20, 2026</span>
                    </div>

                    <div className="prose prose-invert max-w-none">
                        <p className="text-xl text-slate-300 leading-relaxed mb-8">
                            In Personal Injury (PI) law, the window of opportunity is minuscule. A potential client who has just been in an accident will often contact 3-5 firms in the first hour. If you aren't the first to respond with a qualified answer, you've already lost the case.
                        </p>

                        <h2 className="text-white">Qualifying at the Speed of Light</h2>
                        <p>
                            NomosDesk's AI Intake Assistant doesn't just "take messages"—it performs initial case valuation. By asking critical questions about liability facts, injury severity, and insurance coverage, the system determines the lead's "Case Potential" instantly.
                        </p>

                        <div className="bg-indigo-950/20 border border-indigo-500/20 p-8 rounded-2xl my-10">
                            <h4 className="text-white font-bold mb-4 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-indigo-400" /> PI Conversion Statistics (2025)</h4>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="text-sm">
                                    <span className="text-indigo-400 font-bold">85%</span> <span className="text-slate-500">Increase in Lead completion rates via AI Chat.</span>
                                </div>
                                <div className="text-sm">
                                    <span className="text-indigo-400 font-bold">12hrs</span> <span className="text-slate-500">Saved per week in manual receptionist vetting.</span>
                                </div>
                            </div>
                        </div>

                        <h2 className="text-white">Moving Beyond Keyword Vetting</h2>
                        <p>
                            Generic intake forms often miss the nuance of PI law. Our specialized models recognize urgency and severity markers, escalating "Medical Emergencies" or "Highly Valuable Liability" facts to a partner via instant SMS/Email alerts while the lead is still in the chat.
                        </p>
                    </div>

                    <div className="mt-16 p-8 bg-slate-900 border border-slate-800 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-8">
                        <div>
                            <h3 className="text-2xl font-bold text-white mb-2">Scale Your PI Practice</h3>
                            <p className="text-slate-400">See how AI turns visitors into high-value claimants.</p>
                        </div>
                        <Button onClick={() => window.dispatchEvent(new CustomEvent('nomosdesk-open-demo'))}>
                            Try the PI Assistant
                        </Button>
                    </div>
                </div>
            </Section>
        </Layout>
    );
}
