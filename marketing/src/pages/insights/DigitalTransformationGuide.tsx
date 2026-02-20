import React from 'react';
import Layout from '../../layouts/Layout';
import SEO from '../../components/SEO';
import { Section, Button } from '../../components/ui';
import { TrendingUp, Users, ArrowRight, CheckCircle, Zap } from 'lucide-react';
import { Link } from '../../utils/ssr-compat';

export default function DigitalTransformationGuide() {
    return (
        <Layout>
            <SEO
                title="The Partner's Guide to Digital Transformation in 2026"
                description="A strategic roadmap for law firm partners to lead digital transformation, focusing on governance, AI ROI, and institutional scale."
            />
            <Section className="pt-32 pb-20 bg-slate-950">
                <div className="max-w-4xl mx-auto">
                    <Link to="/insights" className="text-indigo-400 text-sm font-medium mb-8 inline-flex items-center gap-2 hover:gap-3 transition-all">
                        <ArrowRight className="w-4 h-4 rotate-180" /> Back to Insights
                    </Link>
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-8">
                        The Partner's Guide to Digital Transformation (2026)
                    </h1>
                    <div className="flex items-center gap-4 mb-12 text-slate-500 text-sm">
                        <span className="bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-full border border-indigo-500/20">Digital Strategy</span>
                        <span>13 min read</span>
                        <span>Feb 20, 2026</span>
                    </div>

                    <div className="prose prose-invert max-w-none">
                        <p className="text-xl text-slate-300 leading-relaxed mb-8">
                            Digital transformation in a law firm is not about buying software—it's about changing the firm's operating model. For partners, the goal is to shift from "Managing People" to "Managing Systems of Record."
                        </p>

                        <h2 className="text-white">The ROI of Institutional Systems</h2>
                        <p>
                            In 2026, the value of a law firm is increasingly tied to its digital infrastructure. A firm with automated intake, unalterable audit trails, and sovereign data residency is more efficient, more compliant, and more valuable than a traditional practice relying on legacy tools.
                        </p>

                        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl my-10 not-prose">
                            <h4 className="text-white font-bold mb-6">Transformation Milestones</h4>
                            <div className="space-y-4">
                                <div className="flex gap-4 p-4 bg-slate-950 rounded-xl">
                                    <div className="w-10 h-10 bg-indigo-500/10 rounded-full flex items-center justify-center text-indigo-400 shrink-0">1</div>
                                    <p className="text-slate-400 text-sm"><span className="text-white font-bold">Consolidate Data:</span> Move from fragmented spreadsheets and legacy databases to a single, sovereign source of truth.</p>
                                </div>
                                <div className="flex gap-4 p-4 bg-slate-950 rounded-xl">
                                    <div className="w-10 h-10 bg-indigo-500/10 rounded-full flex items-center justify-center text-indigo-400 shrink-0">2</div>
                                    <p className="text-slate-400 text-sm"><span className="text-white font-bold">Automate Governance:</span> Implement mandatory conflict checks and workflow-enforced matter opening protocols.</p>
                                </div>
                                <div className="flex gap-4 p-4 bg-slate-950 rounded-xl">
                                    <div className="w-10 h-10 bg-indigo-500/10 rounded-full flex items-center justify-center text-indigo-400 shrink-0">3</div>
                                    <p className="text-slate-400 text-sm"><span className="text-white font-bold">Scale with AI:</span> Deploy judicial intelligence enclaves and AI intake to increase matter volume without staff expansion.</p>
                                </div>
                            </div>
                        </div>

                        <h2 className="text-white">Leading from the Top</h2>
                        <p>
                            Transformation fails when it's seen as an "IT project." Partners must champion the transition to institutional systems, emphasizing that these tools are not just for efficiency—they are the primary mechanism for protecting the firm's equity and client trust.
                        </p>
                    </div>

                    <div className="mt-16 p-8 bg-indigo-950/20 border border-indigo-900/30 rounded-3xl text-center">
                        <h3 className="text-2xl font-bold text-white mb-4">Lead Your Firm's Future</h3>
                        <p className="text-slate-300 mb-8">Discuss your transformation roadmap with our institutional consultants.</p>
                        <Button size="lg" onClick={() => window.dispatchEvent(new CustomEvent('nomosdesk-open-demo'))}>
                            Schedule Partner Briefing
                        </Button>
                    </div>
                </div>
            </Section>
        </Layout>
    );
}
