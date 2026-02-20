import React from 'react';
import Layout from '../layouts/Layout';
import SEO from '../components/SEO';
import { Section } from '../components/ui';

export default function TermsPage() {
    return (
        <Layout>
            <SEO
                title="Terms of Service"
                description="NomosDesk Terms of Service. Read the terms governing the use of the NomosDesk legal governance platform operated by Nexus Technologies Limited."
                canonical="/terms"
                schema={{
                    '@context': 'https://schema.org',
                    '@type': 'WebPage',
                    name: 'NomosDesk Terms of Service',
                    url: 'https://nomosdesk.com/terms',
                    description: 'Terms and conditions governing use of the NomosDesk platform.',
                }}
            />

            <Section className="pt-32 pb-20 bg-slate-950">
                <div className="max-w-3xl mx-auto">
                    <h1 className="text-4xl font-bold text-white mb-4">Terms of Service</h1>
                    <p className="text-slate-400 text-sm mb-12">Last updated: February 2026</p>

                    <div className="prose prose-invert max-w-none space-y-10 text-slate-300 leading-relaxed">

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
                            <p>
                                By accessing or using the NomosDesk platform ("Service"), provided by Nexus Technologies Limited ("Company", "we", "us"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree, you may not use the Service.
                            </p>
                            <p className="mt-4">
                                These Terms apply to all users including individual legal professionals, law firms, enterprise legal departments, and government institutions.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">2. Description of Service</h2>
                            <p>
                                NomosDesk is a secure legal matter management and governance platform. The Service includes conflict checking workflows, document management, role-based access control, judicial research tools, client intake tooling, and related features as described on our website.
                            </p>
                            <p className="mt-4">
                                Features may be updated, modified, or discontinued at our discretion. We will provide reasonable notice of significant changes.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">3. Accounts & Access</h2>
                            <h3 className="text-lg font-semibold text-white mb-2">3.1 Registration</h3>
                            <p>You must provide accurate and complete information when creating an account. You are responsible for maintaining the security of your credentials.</p>

                            <h3 className="text-lg font-semibold text-white mb-2 mt-6">3.2 Tenant Responsibility</h3>
                            <p>Each subscribing organization is a "Tenant". The Tenant Administrator is responsible for managing user access within their organization and ensuring all users comply with these Terms.</p>

                            <h3 className="text-lg font-semibold text-white mb-2 mt-6">3.3 Unauthorized Access</h3>
                            <p>You must not attempt to access another tenant's data, circumvent access controls, or use the Service to conduct any activity that would violate applicable laws or professional codes of conduct.</p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">4. Acceptable Use</h2>
                            <p>You agree to use NomosDesk only for lawful purposes within the scope of legitimate legal practice or institutional governance. You must not:</p>
                            <ul className="list-disc list-inside space-y-2 mt-2 text-slate-300">
                                <li>Use the Service to process data in violation of any applicable data protection law</li>
                                <li>Upload unlawful, defamatory, or infringing content</li>
                                <li>Attempt to reverse-engineer the platform or copy its proprietary features</li>
                                <li>Use automated tools to scrape or extract data without written authorization</li>
                                <li>Interfere with the security or integrity of the Service</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">5. Data Ownership</h2>
                            <p>
                                You retain full ownership of all data, documents, and matter information you upload to NomosDesk. By using the Service, you grant us a limited, non-exclusive license to process your data solely for the purpose of delivering the Service to you.
                            </p>
                            <p className="mt-4">
                                We do not claim any intellectual property rights over your legal content.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">6. Subscription & Payment</h2>
                            <h3 className="text-lg font-semibold text-white mb-2">6.1 Plans</h3>
                            <p>Subscription plans (Starter, Professional, Institutional) are billed monthly or annually as selected. All fees are shown on our Pricing page and are non-refundable except where required by law.</p>

                            <h3 className="text-lg font-semibold text-white mb-2 mt-6">6.2 Cancellation</h3>
                            <p>You may cancel your subscription at any time. Access continues until the end of the current billing period. No prorated refunds are issued for unused time.</p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">7. Intellectual Property</h2>
                            <p>
                                All elements of the NomosDesk platform — including its code, interface, branding, and proprietary workflows — are the intellectual property of Nexus Technologies Limited. No part of the Service may be reproduced, distributed, or used outside the scope of these Terms without our written consent.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">8. Disclaimers</h2>
                            <p>
                                NomosDesk is a practice management and governance tool. It does not constitute legal advice. The platform's AI-assisted research features are for informational support only and must be reviewed by qualified legal professionals before reliance.
                            </p>
                            <p className="mt-4">
                                The Service is provided "as is" without warranties of any kind, either express or implied, to the maximum extent permitted by law.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">9. Limitation of Liability</h2>
                            <p>
                                To the maximum extent permitted by applicable law, Nexus Technologies Limited shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Service. Our total liability shall not exceed the fees paid by you in the 12 months preceding the claim.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">10. Governing Law</h2>
                            <p>
                                These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which Nexus Technologies Limited is incorporated, without regard to its conflict of law provisions.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">11. Changes to Terms</h2>
                            <p>
                                We reserve the right to modify these Terms at any time. Material changes will be communicated with at least 30 days' notice. Continued use of the Service after changes take effect constitutes acceptance.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">12. Contact</h2>
                            <p>If you have questions about these Terms, contact us at:</p>
                            <address className="not-italic mt-4 text-slate-300">
                                <strong className="text-white">Nexus Technologies Limited</strong><br />
                                Legal & Compliance<br />
                                <a href="mailto:legal@nomosdesk.com" className="text-indigo-400 hover:text-indigo-300">legal@nomosdesk.com</a>
                            </address>
                        </section>

                    </div>
                </div>
            </Section>
        </Layout>
    );
}
