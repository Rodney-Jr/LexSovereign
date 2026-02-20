import React from 'react';
import Layout from '../../layouts/Layout';
import SEO from '../../components/SEO';
import { Section, Button } from '../../components/ui';
import { Link } from '../../utils/ssr-compat';
import { ArrowLeft, TrendingUp, Check, X, Minus } from 'lucide-react';

function CompRow({ feature, nomos, clio }: { feature: string; nomos: 'yes' | 'no' | 'partial'; clio: 'yes' | 'no' | 'partial' }) {
    const icon = (v: 'yes' | 'no' | 'partial') => {
        if (v === 'yes') return <Check className="w-4 h-4 text-emerald-400" />;
        if (v === 'no') return <X className="w-4 h-4 text-red-400" />;
        return <Minus className="w-4 h-4 text-amber-400" />;
    };
    return (
        <tr className="border-b border-slate-800">
            <td className="py-3 pr-4 text-slate-300 text-sm">{feature}</td>
            <td className="py-3 pr-4 text-center">{icon(nomos)}</td>
            <td className="py-3 text-center">{icon(clio)}</td>
        </tr>
    );
}

export default function NomosVsClio() {
    return (
        <Layout>
            <SEO
                title="NomosDesk vs Clio: Legal Software Comparison"
                description="In-depth comparison of NomosDesk and Clio for law firms. We compare features, pricing, African market support, and data sovereignty."
                schema={[
                    {
                        '@context': 'https://schema.org',
                        '@type': 'Article',
                        headline: 'NomosDesk vs Clio: Which Legal Software Is Right for You?',
                        author: { '@type': 'Organization', name: 'NomosDesk', url: 'https://nomosdesk.com' },
                        publisher: { '@type': 'Organization', name: 'NomosDesk', url: 'https://nomosdesk.com' },
                        datePublished: '2026-02-20',
                        dateModified: '2026-02-20',
                        url: 'https://nomosdesk.com/insights/nomosdesk-vs-clio',
                    },
                    {
                        '@context': 'https://schema.org',
                        '@type': 'BreadcrumbList',
                        itemListElement: [
                            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://nomosdesk.com' },
                            { '@type': 'ListItem', position: 2, name: 'Insights', item: 'https://nomosdesk.com/insights' },
                            { '@type': 'ListItem', position: 3, name: 'NomosDesk vs Clio', item: 'https://nomosdesk.com/insights/nomosdesk-vs-clio' },
                        ],
                    },
                    {
                        '@context': 'https://schema.org',
                        '@type': 'FAQPage',
                        mainEntity: [
                            {
                                '@type': 'Question',
                                name: 'How does NomosDesk compare to Clio?',
                                acceptedAnswer: { '@type': 'Answer', text: 'NomosDesk is purpose-built for institutional legal governance, government use, and African markets, with mandatory conflict checking, sovereign data hosting, and departmental firewalls. Clio is a strong general law firm platform optimized for billing, client portals, and North American workflows.' },
                            },
                            {
                                '@type': 'Question',
                                name: 'Is Clio available for African law firms?',
                                acceptedAnswer: { '@type': 'Answer', text: 'Clio is globally available but is designed for North American and UK markets. It does not offer Africa-based data residency, local jurisdiction support, or African court system integrations.' },
                            },
                            {
                                '@type': 'Question',
                                name: 'Which is more affordable, NomosDesk or Clio?',
                                acceptedAnswer: { '@type': 'Answer', text: "NomosDesk Starter begins at $99/month flat plus $10/user. Clio Starter typically starts at $49/user/month. For a 10-person firm, NomosDesk is approximately $199/month vs Clio's $490/month — NomosDesk is substantially more cost-effective for institutional teams." },
                            },
                        ],
                    }
                ]}
            />

            <Section className="pt-32 pb-4 bg-slate-950">
                <div className="max-w-3xl mx-auto">
                    <Link to="/insights" className="inline-flex items-center gap-2 text-slate-400 hover:text-indigo-400 text-sm mb-8 transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Back to Insights
                    </Link>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-sm font-medium mb-6">
                        <TrendingUp className="w-4 h-4" /> Comparison
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                        NomosDesk vs Clio: Which Legal Software Is Right for Your Firm?
                    </h1>
                    <p className="text-xl text-slate-300 mb-4 leading-relaxed">
                        Clio is the most recognized name in legal software. NomosDesk is built for a different kind of law firm — one that operates across African jurisdictions, serves government institutions, or needs sovereign data control. This comparison helps you understand the key differences.
                    </p>
                    <p className="text-sm text-slate-500">Updated: February 2026 · 14 min read</p>
                </div>
            </Section>

            <Section className="pb-24 bg-slate-950">
                <div className="max-w-3xl mx-auto space-y-12 text-slate-300 leading-relaxed">

                    {/* Quick Verdict */}
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="p-6 bg-indigo-950/30 border border-indigo-900/40 rounded-2xl">
                            <p className="text-xs font-medium text-indigo-300 uppercase tracking-wider mb-2">Choose NomosDesk if you...</p>
                            <ul className="space-y-2 text-sm text-slate-300">
                                <li>✅ Operate in Africa or the Middle East</li>
                                <li>✅ Need regional data residency</li>
                                <li>✅ Serve government or institutional clients</li>
                                <li>✅ Require mandatory conflict checking</li>
                                <li>✅ Need departmental firewalls between teams</li>
                                <li>✅ Want embedded judicial research</li>
                            </ul>
                        </div>
                        <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-2xl">
                            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Choose Clio if you...</p>
                            <ul className="space-y-2 text-sm text-slate-300">
                                <li>✅ Are a North American or UK firm</li>
                                <li>✅ Need a mature client portal product</li>
                                <li>✅ Want extensive third-party integrations</li>
                                <li>✅ Rely heavily on billing/invoicing workflows</li>
                                <li>✅ Have primarily US/Canada/UK-based clients</li>
                            </ul>
                        </div>
                    </div>

                    <section>
                        <h2 className="text-3xl font-bold text-white mb-6">Feature-by-Feature Comparison</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-700">
                                        <th className="text-left py-3 pr-4 text-slate-300 font-semibold w-1/2">Feature</th>
                                        <th className="text-center py-3 pr-4 text-indigo-300 font-semibold w-1/4">NomosDesk</th>
                                        <th className="text-center py-3 text-slate-300 font-semibold w-1/4">Clio</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <CompRow feature="Matter Management" nomos="yes" clio="yes" />
                                    <CompRow feature="Document Management" nomos="yes" clio="yes" />
                                    <CompRow feature="Conflict of Interest Checking" nomos="yes" clio="partial" />
                                    <CompRow feature="Mandatory Conflict Workflow Gate" nomos="yes" clio="no" />
                                    <CompRow feature="Africa Data Residency" nomos="yes" clio="no" />
                                    <CompRow feature="Government / Public Sector Support" nomos="yes" clio="no" />
                                    <CompRow feature="Departmental Firewall Separation" nomos="yes" clio="no" />
                                    <CompRow feature="Sovereign Enclave Deployment" nomos="yes" clio="no" />
                                    <CompRow feature="Embedded Legal Research (AI)" nomos="yes" clio="partial" />
                                    <CompRow feature="Client Intake Widget" nomos="yes" clio="partial" />
                                    <CompRow feature="Time Tracking & Billing" nomos="partial" clio="yes" />
                                    <CompRow feature="Third-Party App Marketplace" nomos="partial" clio="yes" />
                                    <CompRow feature="Client Portal" nomos="partial" clio="yes" />
                                    <CompRow feature="Full Audit Trail" nomos="yes" clio="partial" />
                                    <CompRow feature="Role-Based Access Control" nomos="yes" clio="partial" />
                                </tbody>
                            </table>
                            <p className="text-xs text-slate-500 mt-2">✅ Full support · 🟡 Partial / limited · ❌ Not available</p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-3xl font-bold text-white mb-6">Pricing Comparison</h2>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-700">
                                        <th className="text-left py-3 pr-4 text-slate-300 font-semibold">Plan</th>
                                        <th className="text-left py-3 pr-4 text-indigo-300 font-semibold">NomosDesk</th>
                                        <th className="text-left py-3 text-slate-300 font-semibold">Clio</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800">
                                    <tr>
                                        <td className="py-3 pr-4 text-white font-medium">Entry</td>
                                        <td className="py-3 pr-4 text-slate-300">$99/mo flat + $10/user</td>
                                        <td className="py-3 text-slate-300">~$49/user/mo (Starter)</td>
                                    </tr>
                                    <tr>
                                        <td className="py-3 pr-4 text-white font-medium">Mid-tier</td>
                                        <td className="py-3 pr-4 text-slate-300">$149/mo + $15/user (50 users)</td>
                                        <td className="py-3 text-slate-300">~$79/user/mo (Boutique)</td>
                                    </tr>
                                    <tr>
                                        <td className="py-3 pr-4 text-white font-medium">Enterprise</td>
                                        <td className="py-3 pr-4 text-slate-300">Custom (Institutional)</td>
                                        <td className="py-3 text-slate-300">Custom (Elite)</td>
                                    </tr>
                                    <tr>
                                        <td className="py-3 pr-4 text-white font-medium">10-user example</td>
                                        <td className="py-3 pr-4 text-emerald-400 font-medium">~$249/mo</td>
                                        <td className="py-3 text-slate-400">~$490–$790/mo</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <p className="text-sm text-slate-400 mt-4">
                            NomosDesk is significantly more cost-efficient for institutional teams, especially as user count grows. Clio's per-seat pricing model scales rapidly for larger organizations.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-3xl font-bold text-white mb-6">African Market Fit</h2>
                        <p>
                            This is where the two platforms diverge most sharply. Clio is an outstanding product — but it was designed for North American and UK markets. It has no special provisions for:
                        </p>
                        <ul className="list-disc list-inside space-y-2 mt-4 text-slate-300">
                            <li>Kenyan, Nigerian, Ghanaian, South African, or other African data protection law compliance</li>
                            <li>Africa-based data center options for data residency</li>
                            <li>African court system integrations or local case law research</li>
                            <li>Local currency billing or African payment gateway support</li>
                        </ul>
                        <p className="mt-4">
                            NomosDesk was built from the ground up for institutional legal practice in Africa and emerging markets. Every feature is designed with African jurisdiction complexity in mind.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-3xl font-bold text-white mb-6">Who Should Choose Each Platform</h2>

                        <h3 className="text-xl font-semibold text-white mb-3">Choose NomosDesk if you are:</h3>
                        <ul className="list-disc list-inside space-y-2 text-slate-300 mb-6">
                            <li>An African law firm (any size) prioritizing governance and data sovereignty</li>
                            <li>A corporate legal department in an African conglomerate</li>
                            <li>A government legal department or prosecution service</li>
                            <li>An institution that needs mandatory conflict checking and departmental data separation</li>
                            <li>A firm requiring on-premise or private cloud deployment</li>
                        </ul>

                        <h3 className="text-xl font-semibold text-white mb-3">Choose Clio if you are:</h3>
                        <ul className="list-disc list-inside space-y-2 text-slate-300">
                            <li>A North American or UK law firm with straightforward practice management needs</li>
                            <li>A firm that relies heavily on third-party integrations (QuickBooks, Outlook, etc.)</li>
                            <li>A firm that needs a mature, full-featured client portal out of the box</li>
                            <li>A solo practitioner or small firm primarily focused on billing workflows</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-3xl font-bold text-white mb-6">Frequently Asked Questions</h2>
                        <div className="space-y-6">
                            {[
                                { q: 'How does NomosDesk compare to Clio?', a: 'NomosDesk is purpose-built for institutional legal governance, government use, and African markets, with mandatory conflict checking, sovereign data hosting, and departmental firewalls. Clio is a strong general law firm platform optimized for billing, client portals, and North American workflows.' },
                                { q: 'Is Clio available for African law firms?', a: 'Clio is globally available but is designed for North American and UK markets. It does not offer Africa-based data residency, local jurisdiction support, or African court system integrations.' },
                                { q: 'Which is more affordable, NomosDesk or Clio?', a: "NomosDesk Starter begins at $99/month flat plus $10/user. Clio Starter typically starts at $49/user/month. For a 10-person firm, NomosDesk is approximately $249/month vs Clio's $490–$790/month — NomosDesk is substantially more cost-effective for institutional teams." },
                            ].map(({ q, a }) => (
                                <div key={q} className="border-b border-slate-800 pb-4">
                                    <h3 className="font-semibold text-white mb-2">{q}</h3>
                                    <p className="text-slate-400 text-sm">{a}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    <div className="bg-indigo-950/30 border border-indigo-900/30 rounded-2xl p-8 text-center">
                        <h2 className="text-2xl font-bold text-white mb-3">Ready to See NomosDesk?</h2>
                        <p className="text-slate-300 mb-6">Book a private demonstration and we'll walk through how NomosDesk compares against your current setup.</p>
                        <div className="flex gap-4 justify-center">
                            <Button onClick={() => window.dispatchEvent(new CustomEvent('nomosdesk-open-demo'))}>Request Private Demo</Button>
                            <Button asLink="/pricing" variant="outline">View Pricing</Button>
                        </div>
                    </div>

                    <p className="text-sm text-slate-500">Related: <Link to="/insights/legal-software-africa-guide" className="text-indigo-400 hover:text-indigo-300">Legal Software for Africa</Link> · <Link to="/for-law-firms" className="text-indigo-400 hover:text-indigo-300">NomosDesk for Law Firms</Link> · <Link to="/pricing" className="text-indigo-400 hover:text-indigo-300">Pricing</Link></p>
                </div>
            </Section>
        </Layout>
    );
}
