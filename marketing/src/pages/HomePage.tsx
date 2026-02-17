import React from 'react';
import Layout from '../layouts/Layout';
import SEO from '../components/SEO';
import { Button, Section, SectionHeader } from '../components/ui';
import DemoRequestForm from '../components/DemoRequestForm';
import { Shield, FileText, CheckCircle, Smartphone, Lock, Users, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function HomePage() {
    return (
        <Layout>
            <SEO
                title="Secure Legal Matter Management & Governance Platform"
                description="NomosDesk is a secure legal operating system for law firms, enterprise legal departments, and government institutions. Built for conflict checking, document security, and role-based governance."
                schema={{
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
                }}
            />

            {/* HERO */}
            <section id="demo" className="relative min-h-[90vh] flex items-center justify-center pt-24 pb-20 overflow-hidden">
                {/* Background Effects */}
                <div className="absolute inset-0 bg-slate-950 z-0">
                    <div className="absolute top-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-950 to-slate-950"></div>
                    <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-20"></div>
                </div>

                <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center relative z-10">
                    <div className="text-left">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-medium mb-6 animate-fade-in">
                            <Shield className="w-4 h-4" /> Professional Responsibility & Governance
                        </div>

                        <h1 className="text-5xl md:text-6xl font-bold leading-tight tracking-tight mb-6 text-white drop-shadow-sm">
                            Secure Legal Management. <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-indigo-100">
                                Built for Institutions.
                            </span>
                        </h1>

                        <p className="text-xl text-slate-300 mb-8 leading-relaxed max-w-xl">
                            NomosDesk is a secure platform designed for professional accountability.
                            Manage matters, enforce conflict checks, and protect client confidentiality
                            within a structured governance system.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 mb-10">
                            <Button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} size="lg">Request Private Demo</Button>
                            <Button asLink="/for-law-firms" variant="outline" size="lg">Explore Solutions</Button>
                        </div>

                        <p className="text-sm text-slate-500 flex items-center gap-4">
                            <span className="flex items-center gap-1.5"><Shield className="w-4 h-4" /> ISO 27001 Aligned</span>
                            <span className="flex items-center gap-1.5"><Lock className="w-4 h-4" /> End-to-End Encryption</span>
                        </p>
                    </div>

                    <div className="relative">
                        <DemoRequestForm />
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
                        <Button asLink="/client-intake-assistant">Learn About Client Intake Assistant</Button>
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
                    <TrustItem label="Compliance" value="GDPR" sub="& Local Data Laws" />
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
                        <Button asLink="/pricing" variant="outline" size="lg">View Pricing</Button>
                    </div>
                </div>
            </section>
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
