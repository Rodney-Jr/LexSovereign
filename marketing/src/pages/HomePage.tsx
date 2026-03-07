import React from 'react';
import Layout from '../layouts/Layout';
import SEO from '../components/SEO';
import { Button, Section, SectionHeader } from '../components/ui';
import { Shield, FileText, CheckCircle, Smartphone, Lock, Users, Globe, Gavel, FileCheck, Sparkles, BarChart3, Receipt } from 'lucide-react';
import { Link, StaticRouter, HelmetProvider } from '../utils/ssr-compat';
import RelatedInsights from '../components/RelatedInsights';
import type { SsgOptions } from 'vite-plugin-ssg';

export const ssgOptions: SsgOptions = {
    slug: 'index',
    routeUrl: '/',
    context: async (children) => {
        return (
            <HelmetProvider>
                <StaticRouter location="/">{children}</StaticRouter>
            </HelmetProvider>
        );
    },
};

export default function HomePage() {
    return (
        <Layout>
            <SEO
                title="Secure Legal Matter Management & Governance Platform"
                description="NomosDesk is a secure legal operating system for law firms and institutions, featuring built-in conflict checking and role-based governance."
                schema={[
                    {
                        "@context": "https://schema.org",
                        "@type": "SoftwareApplication",
                        "name": "NomosDesk",
                        "applicationCategory": "BusinessApplication",
                        "operatingSystem": "Cloud",
                        "offers": {
                            "@type": "Offer",
                            "price": "0",
                            "priceCurrency": "USD"
                        }
                    },
                    {
                        "@context": "https://schema.org",
                        "@type": "BreadcrumbList",
                        "itemListElement": [
                            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://nomosdesk.com" }
                        ]
                    }
                ]}
            />

            {/* HERO */}
            <section id="demo" className="relative min-h-[90vh] flex items-center justify-center pt-24 pb-20 overflow-hidden">
                {/* Background Effects */}
                <div className="absolute inset-0 bg-slate-950 z-0">
                    <div className="absolute top-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-950 to-slate-950"></div>
                    <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-20"></div>
                </div>

                <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
                    <div className="flex flex-col items-center">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-medium mb-6 animate-fade-in">
                            <Shield className="w-4 h-4" /> Professional Responsibility & Governance
                        </div>

                        <h1 className="text-5xl md:text-6xl font-bold leading-tight tracking-tight mb-6 text-white drop-shadow-sm">
                            Secure Legal Management. <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-indigo-100">
                                Built for Institutions.
                            </span>
                        </h1>

                        <p className="text-xl text-slate-300 mb-10 leading-relaxed max-w-2xl mx-auto">
                            NomosDesk is a secure platform designed for professional accountability.
                            Manage matters, enforce conflict checks, and protect client confidentiality
                            within a structured governance system.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 mb-12 justify-center">
                            <Button onClick={() => window.dispatchEvent(new CustomEvent('nomosdesk-open-demo'))} size="lg">Request Private Demo</Button>
                            {String(import.meta.env.VITE_SHOW_PRICING).toLowerCase() === 'true' && <Button asLink="/for-law-firms" variant="outline" size="lg">Explore Solutions</Button>}
                        </div>

                        <p className="text-sm text-slate-500 flex items-center gap-6 justify-center">
                            <span className="flex items-center gap-1.5"><Shield className="w-4 h-4" /> ISO 27001 Aligned</span>
                            <span className="flex items-center gap-1.5"><Lock className="w-4 h-4" /> End-to-End Encryption</span>
                        </p>
                    </div>
                </div>
            </section>

            {/* VALUE PROPS */}
            <Section darker>
                <SectionHeader
                    title="Designed for Institutional Governance"
                    subtitle="NomosDesk replaces fragmented tools with a single, secure source of truth for your legal operations."
                />

                <div className="grid md:grid-cols-4 gap-8">
                    <FeatureCard
                        icon={<Shield className="w-8 h-8 text-indigo-400" />}
                        title="Conflict Prevention"
                        description="Mandatory conflict checking workflows before matter creation protects your firm from professional risk."
                    />
                    <FeatureCard
                        icon={<FileText className="w-8 h-8 text-emerald-400" />}
                        title="Document Security"
                        description="Documents are physically segregated by matter. Granular access controls ensure only authorized counsel can view sensitive files."
                    />
                    <FeatureCard
                        icon={<Users className="w-8 h-8 text-blue-400" />}
                        title="Role Governance"
                        description="Pre-configured roles (Partner, Associate, General Counsel) strictly enforce hierarchy and permission boundaries."
                    />
                    <FeatureCard
                        icon={<Globe className="w-8 h-8 text-purple-400" />}
                        title="Judicial Intelligence"
                        description="Ground your research in a Sovereign Registry of constitutional law, statutes, and verified casefiles."
                    />
                </div>
            </Section>

            {/* EMERGING MARKETS SECTION */}
            <Section>
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-medium mb-6">
                            BUILT FOR EMERGING MARKETS
                        </div>
                        <h2 className="text-3xl font-bold mb-6 text-white">From Solo Practitioners to Sovereign Institutions</h2>
                        <p className="text-slate-300 text-lg mb-6 leading-relaxed">
                            Enterprise-grade legal technology shouldn't be locked behind Silicon Valley pricing. NomosDesk is engineered specifically for emerging markets.
                        </p>
                        <ul className="space-y-4 mb-8">
                            <li className="flex gap-3">
                                <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                                <span className="text-slate-300"><strong>Accessible Pricing:</strong> Starting at just $19/mo for solo practitioners, scaling seamlessly to multi-national banking institutions.</span>
                            </li>
                            <li className="flex gap-3">
                                <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                                <span className="text-slate-300"><strong>Native Sovereign Intelligence:</strong> Pre-trained on a growing library of 19,000+ local statutes, constitutions, and gazettes for precedent that actually matters in your jurisdiction.</span>
                            </li>
                            <li className="flex gap-3">
                                <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                                <span className="text-slate-300"><strong>Strict Client Isolation:</strong> Collaborate securely. Firewalled client portals ensure opposing counsel or clients only see finalized invoices and approved documents.</span>
                            </li>
                        </ul>
                        {String(import.meta.env.VITE_SHOW_PRICING).toLowerCase() === 'true' && <Button asLink="/pricing">View Regional Pricing Tiers</Button>}
                    </div>
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5">
                            <Globe size={150} />
                        </div>
                        <div className="relative z-10 space-y-6">
                            {/* Visual representation of local data */}
                            <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700/50">
                                <div className="text-sm font-semibold text-white mb-3 flex justify-between items-center">
                                    <span>Knowledge Base Sync</span>
                                    <span className="text-emerald-400 text-xs px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">Active</span>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-slate-400 flex items-center gap-2"><FileText className="w-3 h-3" /> Ghana Constitution</span>
                                        <span className="text-slate-300">Synced</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-slate-400 flex items-center gap-2"><Globe className="w-3 h-3" /> Regional statutory Gazettes</span>
                                        <span className="text-emerald-400 font-mono">19,637 indexed</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-slate-400 flex items-center gap-2"><Lock className="w-3 h-3" /> Nigeria NDPR Directives</span>
                                        <span className="text-slate-300">Evaluating</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700/50">
                                <div className="text-sm font-semibold text-white mb-2">Platform Access Profile</div>
                                <div className="flex justify-between items-center mt-4">
                                    <div className="flex -space-x-2">
                                        <div className="w-8 h-8 rounded-full bg-indigo-600 border-2 border-slate-800 flex items-center justify-center text-[9px] font-bold text-white shadow-lg z-30">SOLO</div>
                                        <div className="w-8 h-8 rounded-full bg-emerald-600 border-2 border-slate-800 flex items-center justify-center text-[9px] font-bold text-white shadow-lg z-20">PRO</div>
                                        <div className="w-8 h-8 rounded-full bg-slate-700 border-2 border-slate-800 flex items-center justify-center text-[9px] font-bold text-white shadow-lg z-10">INST</div>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-0.5">Starting at</span>
                                        <span className="text-indigo-400 font-mono text-xl">$19<span className="text-xs text-slate-500">/mo</span></span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Section>

            {/* CLIENT INTAKE SECTION */}
            <Section>
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium mb-6">
                            NEW FEATURE
                        </div>
                        <h2 className="text-3xl font-bold mb-6 text-white">Improve Client Service and Lead Intake</h2>
                        <p className="text-slate-300 text-lg mb-6 leading-relaxed">
                            NomosDesk now includes a customizable website enquiry assistant that law firms can embed directly into their own website.
                        </p>
                        <ul className="space-y-4 mb-8">
                            <li className="flex gap-3">
                                <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                                <span className="text-slate-300">Respond to common enquiries instantly</span>
                            </li>
                            <li className="flex gap-3">
                                <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                                <span className="text-slate-300">Collect structured client intake information</span>
                            </li>
                            <li className="flex gap-3">
                                <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                                <span className="text-slate-300">Direct enquiries to appropriate practice areas</span>
                            </li>
                        </ul>
                        <Button asLink="/ai-legal-chatbot">Learn About AI Legal Chatbot</Button>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-xl">
                        <div className="flex flex-col gap-4">
                            <div className="bg-slate-800 self-start rounded-2xl p-4 max-w-[80%] text-sm text-slate-300">
                                Hello. I can help direct your enquiry to the right legal team. What type of assistance do you need?
                            </div>
                            <div className="bg-indigo-600 self-end rounded-2xl p-4 max-w-[80%] text-sm text-white">
                                I need to schedule a consultation regarding a property dispute.
                            </div>
                            <div className="bg-slate-800 self-start rounded-2xl p-4 max-w-[80%] text-sm text-slate-300">
                                I can help with that. To ensure no conflicts of interest, may I ask the name of the opposing party?
                            </div>
                        </div>
                    </div>
                </div>
            </Section>

            {/* JURISDICTION ENGINE SECTION */}
            <Section darker>
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div className="order-2 md:order-1 bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                            <Globe size={120} />
                        </div>
                        <div className="flex flex-col gap-6 relative z-10">
                            {/* Mock UI: Ghana Silo */}
                            <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700/50">
                                <div className="flex items-center justify-between mb-3 border-b border-slate-700/50 pb-3">
                                    <div className="flex items-center gap-2">
                                        <Shield className="w-4 h-4 text-emerald-400" />
                                        <span className="text-sm font-semibold text-white">Ghana Sovereign Sentinel</span>
                                    </div>
                                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-700 text-slate-300 font-mono">GHS / Act 689</span>
                                </div>
                                <div className="text-xs text-slate-400 space-y-2">
                                    <div className="flex justify-between"><span>Revenue Protected</span><span className="text-white font-mono">GHS 56,250</span></div>
                                    <div className="flex justify-between"><span>Registry Sync</span><span className="text-emerald-400">Nominal</span></div>
                                </div>
                            </div>

                            {/* Mock UI: UK Silo */}
                            <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700/50 opacity-90">
                                <div className="flex items-center justify-between mb-3 border-b border-slate-700/50 pb-3">
                                    <div className="flex items-center gap-2">
                                        <Shield className="w-4 h-4 text-indigo-400" />
                                        <span className="text-sm font-semibold text-white">UK Compliance Auditor</span>
                                    </div>
                                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-700 text-slate-300 font-mono">GBP / GDPR</span>
                                </div>
                                <div className="text-xs text-slate-400 space-y-2">
                                    <div className="flex justify-between"><span>Revenue Protected</span><span className="text-white font-mono">£ 4,500</span></div>
                                    <div className="flex justify-between"><span>ICO Framework</span><span className="text-emerald-400">Aligned</span></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="order-1 md:order-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-medium mb-6">
                            JURISDICTION ENGINE
                        </div>
                        <h2 className="text-3xl font-bold mb-6 text-white">Global Reach, Local Intelligence</h2>
                        <p className="text-slate-300 text-lg mb-6 leading-relaxed">
                            A borderless legal practice requires borderless intelligence. NomosDesk dynamically adapts its entire compliance structure based on your matter's jurisdiction.
                        </p>
                        <ul className="space-y-4 mb-8">
                            <li className="flex gap-3">
                                <CheckCircle className="w-5 h-5 text-indigo-500 shrink-0" />
                                <span className="text-slate-300"><strong>Localized Heuristics:</strong> Real-time statutory checks customized for Ghana, Nigeria, Kenya, the UK, and beyond.</span>
                            </li>
                            <li className="flex gap-3">
                                <CheckCircle className="w-5 h-5 text-indigo-500 shrink-0" />
                                <span className="text-slate-300"><strong>Dynamic Financials:</strong> Automated stamp duty and fee recovery assessments calculated against live treasury rates.</span>
                            </li>
                            <li className="flex gap-3">
                                <CheckCircle className="w-5 h-5 text-indigo-500 shrink-0" />
                                <span className="text-slate-300"><strong>Unified Control:</strong> Manage international portfolios securely from a single, centralized Sovereign Silo.</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </Section>

            {/* NEW: PLATFORM PILLARS */}
            <Section>
                <SectionHeader
                    title="Pillars of Modern Legal Operations"
                    subtitle="NomosDesk has evolved into a comprehensive infrastructure for firms that demand precision and control."
                />

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <FeatureCard
                        icon={<FileCheck className="w-8 h-8 text-sky-400" />}
                        title="Multi-Format Analysis"
                        description="Drag and drop any contract format (PDF, DocX, JSON) natively. Our proprietary AI instantly extracts risk clauses and audits compliance."
                    />
                    <FeatureCard
                        icon={<Gavel className="w-8 h-8 text-amber-400" />}
                        title="Court & Case Tracking"
                        description="Never miss a court date. Organize cases, evidence, and deadlines with complete surgical precision."
                    />
                    <FeatureCard
                        icon={<Sparkles className="w-8 h-8 text-purple-400" />}
                        title="AI Drafting & Intelligence"
                        description="Automatically score contract risks, draft tailored documents, and summarize case briefs in seconds."
                    />
                    <FeatureCard
                        icon={<Receipt className="w-8 h-8 text-emerald-400" />}
                        title="Digital Disbursements"
                        description="Turn AI from a cost center into a billable asset. AI usage is automatically mapped to draft invoices for 100% cost recovery."
                    />
                </div>
            </Section>

            {/* AUDIENCES */}
            <Section>
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div>
                        <h2 className="text-3xl font-bold mb-6">Structured for Your Organization</h2>
                        <div className="space-y-6">
                            <AudienceItem
                                title="For Law Firms"
                                description="Manage client matters, conflict checks, and associate workflows across multiple offices."
                                link="/for-law-firms"
                            />
                            <AudienceItem
                                title="For Enterprise Legal"
                                description="Centralize corporate governance, contracts, and outside counsel management."
                                link="/for-enterprise-legal"
                            />
                            <AudienceItem
                                title="For Government"
                                description="Maintain public trust with transparent oversight, audit trails, and data sovereignty."
                                link="/for-government"
                            />
                        </div>
                    </div>
                    <div className="bg-slate-800/50 p-8 rounded-3xl border border-slate-700/50">
                        {/* Abstract visual representation of governance */}
                        <div className="relative aspect-square">
                            <div className="absolute inset-4 border border-slate-700 rounded-xl bg-slate-900/80 p-6 flex flex-col gap-4">
                                <div className="h-4 w-1/3 bg-slate-800 rounded mb-4"></div>
                                <div className="flex-1 space-y-3">
                                    <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
                                        <div className="w-8 h-8 bg-indigo-500/20 rounded-full flex items-center justify-center text-indigo-400">P</div>
                                        <div className="text-sm text-slate-300">Partner Approval Required</div>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                                        <CheckCircle className="w-5 h-5 text-emerald-500" />
                                        <div className="text-sm text-emerald-300">Conflict Check Cleared</div>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700/50 opacity-50">
                                        <Lock className="w-5 h-5 text-slate-500" />
                                        <div className="text-sm text-slate-500">Matter Activation Pending</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Section>

            {/* TRUST & SECURITY */}
            <Section darker className="bg-slate-950">
                <SectionHeader
                    title="Uncompromising Security"
                    subtitle="Your data is protected by enterprise-grade encryption and strict access protocols."
                />
                <div className="grid md:grid-cols-4 gap-6 text-center">
                    <TrustItem label="Data Sovereignty" value="100%" sub="Local Residency Options" />
                    <TrustItem label="Uptime SLA" value="99.9%" sub="Enterprise Guarantee" />
                    <TrustItem label="Aligned" value="GDPR" sub="& Local Data Laws" />
                    <TrustItem label="Encryption" value="AES-256" sub="At Rest & In Transit" />
                </div>
                <div className="mt-12 text-center">
                    <Button asLink="/security-and-compliance" variant="outline">Review Security Architecture</Button>
                </div>
            </Section>

            {/* TESTIMONIALS */}
            <Section>
                <SectionHeader title="Trusted by Legal Leaders" />
                <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                    <TestimonialCard
                        quote="NomosDesk provided the governance structure we needed to scale our firm across three regions without losing control of risk management."
                        author="Senior Partner"
                        role="Regional Law Firm, Nairobi"
                    />
                    <TestimonialCard
                        quote="The conflict checking workflow is rigorous. It forces our team to be compliant before a matter can even open. That peace of mind is invaluable."
                        author="General Counsel"
                        role="Financial Services Enterprise"
                    />
                </div>
            </Section>

            {/* FAQ for SEO */}
            <Section darker>
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-2xl font-bold mb-8">Frequently Asked Questions</h2>
                    <div className="space-y-6">
                        <FAQItem question="Where is my data stored?" answer="We offer regional data residency options to ensure compliance with local data sovereignty laws. Your data remains effective within your chosen jurisdiction." />
                        <FAQItem question="Can I customize user roles?" answer="Yes. While we provide standard templates (Partner, Associate, Paralegal), all permissions can be granularly customized to fit your governance structure." />
                        <FAQItem question="How does the conflict check work?" answer="Our system indexes all parties and adverse parties. Before opening a new matter, the system forces a search against this index, flagging potential conflicts for manual review." />
                        <FAQItem question="Is this suitable for government use?" answer="Absolutely. We offer specific government deployments that emphasize audit trails, separation of duties, and public accountability." />
                    </div>
                </div>
            </Section>

            {/* FINAL CTA */}
            <section className="py-24 px-6 bg-indigo-950/30 border-y border-indigo-900/30">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-4xl font-bold mb-6 text-white">Ready to Professionalize Your Operations?</h2>
                    <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
                        Schedule a confidential demonstration with our institutional team to discuss your specific governance needs.
                    </p>
                    <div className="flex justify-center gap-4">
                        <Button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} size="lg">Request Access</Button>
                        {String(import.meta.env.VITE_SHOW_PRICING).toLowerCase() === 'true' && <Button asLink="/pricing" variant="outline" size="lg">View Pricing</Button>}
                    </div>
                </div>
            </section>
            <RelatedInsights
                heading="From Our Insights Library"
                articles={[
                    { slug: '/insights/legal-software-africa-guide', title: 'Legal Software for Africa: 2026 Guide', excerpt: 'A complete guide to choosing data-sovereign legal software for African law firms and institutions.', readTime: '12 min read' },
                    { slug: '/insights/conflict-checking-software-law-firms', title: 'Conflict Checking Software for Law Firms', excerpt: 'Why manual conflict checks fail and how automated conflict software protects your firm.', readTime: '9 min read' },
                    ...(String(import.meta.env.VITE_SHOW_PRICING).toLowerCase() === 'true' ? [{ slug: '/insights/nomosdesk-vs-clio', title: 'NomosDesk vs Clio: Which Is Right for Your Firm?', excerpt: 'An honest comparison of features, pricing, African market support, and data governance.', readTime: '14 min read' }] : []),
                ]}
            />
        </Layout >
    );
}

function FeatureCard({ icon, title, description }: any) {
    return (
        <div className="bg-slate-900/50 p-8 rounded-2xl border border-slate-800 hover:border-indigo-500/30 transition-colors">
            <div className="mb-4">{icon}</div>
            <h3 className="text-xl font-semibold mb-3 text-white">{title}</h3>
            <p className="text-slate-400 leading-relaxed">{description}</p>
        </div>
    );
}

function AudienceItem({ title, description, link }: any) {
    return (
        <div className="group">
            <h3 className="text-xl font-semibold text-white mb-2 flex items-center gap-2">
                {title}
                <ChevronRight className="w-5 h-5 text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity transform -translate-x-2 group-hover:translate-x-0" />
            </h3>
            <p className="text-slate-400 mb-2">{description}</p>
            <Link to={link} className="text-sm font-medium text-indigo-400 hover:text-indigo-300">Learn more &rarr;</Link>
        </div>
    );
}

function TrustItem({ label, value, sub }: any) {
    return (
        <div className="p-6 bg-slate-900/30 rounded-xl border border-slate-800">
            <div className="text-4xl font-bold text-white mb-1">{value}</div>
            <div className="text-lg font-semibold text-indigo-400 mb-1">{label}</div>
            <div className="text-xs text-slate-500 uppercase tracking-wider">{sub}</div>
        </div>
    );
}

function TestimonialCard({ quote, author, role }: any) {
    return (
        <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 relative">
            <div className="text-indigo-500 text-4xl font-serif absolute top-4 left-6 opacity-30">"</div>
            <p className="text-slate-300 italic mb-6 relative z-10">{quote}</p>
            <div>
                <div className="font-semibold text-white">{author}</div>
                <div className="text-sm text-slate-500">{role}</div>
            </div>
        </div>
    );
}

function FAQItem({ question, answer }: any) {
    return (
        <div className="border-b border-slate-800 pb-4">
            <h4 className="text-lg font-medium text-white mb-2">{question}</h4>
            <p className="text-slate-400">{answer}</p>
        </div>
    );
}

function ChevronRight(props: any) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        >
            <path d="m9 18 6-6-6-6" />
        </svg>
    );
}
