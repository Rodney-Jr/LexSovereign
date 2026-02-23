import React, { useEffect } from 'react';
import Layout from '../../layouts/Layout';
import SEO from '../../components/SEO';
import { Section, Button } from '../../components/ui';
import { Link } from '../../utils/ssr-compat';
import { Home, MessageSquare, CheckCircle } from 'lucide-react';

export default function PropertyLawAiAssistant() {
    useEffect(() => {
        const timer = setTimeout(() => {
            window.dispatchEvent(new CustomEvent('nomosdesk-chatbot-context', {
                detail: { context: 'property-law', greeting: 'Hello! I can help with property and real estate law questions — buying, selling, leasing, or disputes. What do you need help with?' }
            }));
        }, 3000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <Layout>
            <SEO
                title="Property Law AI Assistant | NomosDesk"
                description="Get instant AI guidance on property and real estate law — buying, selling, leasing, landlord-tenant disputes, conveyancing, and more. Connect with a property lawyer when needed."
                schema={[{
                    '@context': 'https://schema.org',
                    '@type': 'Service',
                    name: 'Property Law AI Assistant',
                    provider: { '@type': 'Organization', name: 'NomosDesk', url: 'https://nomosdesk.com' },
                    description: 'AI-powered property and real estate law guidance for buyers, sellers, landlords, and tenants.',
                    serviceType: 'Legal Services'
                }]}
            />

            <Section className="pt-32 pb-12 bg-slate-950">
                <div className="max-w-3xl mx-auto px-4 text-center">
                    <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-full mb-6">
                        <Home className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs font-bold text-emerald-300 uppercase tracking-widest">Property Law</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Property Law AI Assistant</h1>
                    <p className="text-xl text-slate-300 mb-8 leading-relaxed">
                        Instant AI guidance on property and real estate law questions — whether you're buying, selling, renting, or dealing with a property dispute.
                    </p>
                    <Button onClick={() => window.dispatchEvent(new CustomEvent('nomosdesk-chatbot-open'))}>
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Ask a Property Law Question
                    </Button>
                </div>
            </Section>

            <Section className="pb-24 bg-slate-950">
                <div className="max-w-3xl mx-auto px-4 space-y-16">

                    <div>
                        <h2 className="text-2xl font-bold text-white mb-4">What Our Property Law AI Can Help With</h2>
                        <div className="grid sm:grid-cols-2 gap-3">
                            {[
                                'Understanding purchase agreements and conditions',
                                'Explaining conveyancing and title transfer',
                                'Landlord and tenant rights and obligations',
                                'Lease agreement review and red flags',
                                'Property dispute resolution options',
                                'Easements, covenants, and encumbrances',
                                'Deposit and completion disputes',
                                'Commercial property lease terms',
                            ].map(item => (
                                <div key={item} className="flex items-start gap-2 text-sm text-slate-300 bg-slate-900 border border-slate-800 p-4 rounded-xl">
                                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                                    {item}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold text-white mb-4">Common Property Law Questions</h2>
                        <div className="space-y-4">
                            {[
                                { q: 'What is conveyancing?', a: 'Conveyancing is the legal process of transferring ownership of property from seller to buyer. It involves reviewing the title, raising and addressing enquiries, exchanging contracts, and completing the transfer at the land registry. The process typically takes 8–12 weeks and should be handled by a qualified conveyancer or property solicitor.' },
                                { q: 'Can a landlord enter my property without notice?', a: 'In most jurisdictions, landlords must give reasonable notice (typically 24–48 hours) before entering a rental property, except in genuine emergencies. The specific requirements depend on your lease agreement and local tenancy law. Unauthorised entry may constitute a breach of your right to quiet enjoyment.' },
                                { q: 'What happens if a property purchase falls through?', a: 'Before exchange of contracts, either party can generally withdraw without financial penalty (beyond any costs incurred). After exchange, withdrawing is a breach of contract — the defaulting party may forfeit their deposit and face a claim for further losses. The specific consequences depend on the jurisdiction and contract terms.' },
                                { q: 'What is an easement?', a: 'An easement is a right to use another person\'s land for a specific purpose — for example, a right of way across a neighbouring property, or the right of a utility company to run pipes under your land. Easements usually run with the land and bind future owners. They should be identified during pre-purchase due diligence.' },
                            ].map(f => (
                                <div key={f.q} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                                    <h3 className="font-bold text-white mb-2">{f.q}</h3>
                                    <p className="text-slate-400 text-sm leading-relaxed">{f.a}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="p-8 bg-indigo-600/5 border border-indigo-500/20 rounded-2xl text-center">
                        <h3 className="text-xl font-bold text-white mb-4">Speak With a Property Lawyer</h3>
                        <p className="text-slate-300 mb-8">For complex property transactions or disputes, connect with a qualified property law specialist.</p>
                        <Button onClick={() => window.dispatchEvent(new CustomEvent('nomosdesk-open-demo'))}>Request a Consultation</Button>
                    </div>
                </div>
            </Section>
        </Layout>
    );
}
