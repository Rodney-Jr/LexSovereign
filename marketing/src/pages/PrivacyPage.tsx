import React from 'react';
import Layout from '../layouts/Layout';
import SEO from '../components/SEO';
import { Section } from '../components/ui';

export default function PrivacyPage() {
    return (
        <Layout>
            <SEO
                title="Privacy Policy & Data Protection"
                description="NomosDesk's commitment to data privacy. Learn how we protect your legal data in compliance with GDPR and international standards."
                canonical="/privacy"
                schema={[
                    {
                        '@context': 'https://schema.org',
                        '@type': 'WebPage',
                        name: 'NomosDesk Privacy Policy',
                        url: 'https://nomosdesk.com/privacy',
                        description: 'Information about how NomosDesk collects, uses, and protects personal data.',
                    },
                    {
                        '@context': 'https://schema.org',
                        '@type': 'BreadcrumbList',
                        itemListElement: [
                            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://nomosdesk.com' },
                            { '@type': 'ListItem', position: 2, name: 'Privacy Policy', item: 'https://nomosdesk.com/privacy' },
                        ],
                    },
                ]}
            />

            <Section className="pt-32 pb-20 bg-slate-950">
                <div className="max-w-3xl mx-auto">
                    <h1 className="text-4xl font-bold text-white mb-4">Privacy Policy</h1>
                    <p className="text-slate-400 text-sm mb-12">Last updated: February 2026</p>

                    <div className="prose prose-invert max-w-none space-y-10 text-slate-300 leading-relaxed">

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">1. Introduction</h2>
                            <p>
                                NomosDesk ("we", "us", or "our") is operated by Nexus Technologies Limited. We are committed to protecting the privacy and confidentiality of personal data entrusted to us. This Privacy Policy explains how we collect, use, store, and disclose information when you use our platform, website, or services.
                            </p>
                            <p className="mt-4">
                                NomosDesk is designed for legal professionals and institutions. We understand the heightened sensitivity of legal data and apply industry-leading standards to its protection.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">2. Data We Collect</h2>
                            <h3 className="text-lg font-semibold text-white mb-2">2.1 Account Data</h3>
                            <p>When you create an account, we collect your name, email address, organization name, and role. This is required to provide access to the platform.</p>

                            <h3 className="text-lg font-semibold text-white mb-2 mt-6">2.2 Usage Data</h3>
                            <p>We collect anonymized usage logs including feature interactions, page views, and session duration to improve platform performance and user experience.</p>

                            <h3 className="text-lg font-semibold text-white mb-2 mt-6">2.3 Matter & Document Data</h3>
                            <p>Legal matter data, documents, conflict check records, and case files submitted to NomosDesk are stored encrypted and logically isolated per tenant. We do not access this data except for authorized support purposes with explicit written consent.</p>

                            <h3 className="text-lg font-semibold text-white mb-2 mt-6">2.4 Communications</h3>
                            <p>If you contact us via email or the demo request form, we retain the content of your communications and your contact details to respond and improve our services.</p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">3. How We Use Your Data</h2>
                            <ul className="list-disc list-inside space-y-2 text-slate-300">
                                <li>To provide and maintain the NomosDesk platform</li>
                                <li>To communicate important service updates and security notices</li>
                                <li>To process demo requests and sales inquiries</li>
                                <li>To improve platform features through anonymized analytics</li>
                                <li>To comply with applicable legal and regulatory obligations</li>
                            </ul>
                            <p className="mt-4">We do not sell, rent, or share your personal data with third parties for marketing purposes.</p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">4. Data Residency & Storage</h2>
                            <p>
                                NomosDesk offers configurable data residency options. Institutional and government clients may elect to have their data stored within a specific jurisdiction (e.g., within Africa, the EU, or a private deployment). Default cloud storage uses enterprise-grade, ISO 27001-aligned data centers.
                            </p>
                            <p className="mt-4">
                                All data is encrypted at rest using AES-256 and in transit using TLS 1.3.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">5. Data Retention</h2>
                            <p>
                                Account data is retained for the duration of the active subscription plus an additional 90-day grace period post-termination. Upon confirmed account deletion, all data is permanently purged within 30 days. Legal matter data is retained per the data retention policy agreed in your service agreement.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">6. Your Rights</h2>
                            <p>Depending on your jurisdiction, you may have the right to:</p>
                            <ul className="list-disc list-inside space-y-2 mt-2 text-slate-300">
                                <li>Access the personal data we hold about you</li>
                                <li>Request correction of inaccurate data</li>
                                <li>Request deletion of your data ("Right to be Forgotten")</li>
                                <li>Object to or restrict certain processing</li>
                                <li>Receive a portable copy of your data</li>
                            </ul>
                            <p className="mt-4">To exercise any of these rights, contact us at <a href="mailto:privacy@nomosdesk.com" className="text-indigo-400 hover:text-indigo-300">privacy@nomosdesk.com</a>.</p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">7. Cookies</h2>
                            <p>
                                NomosDesk uses essential cookies only to maintain session state and security tokens. We do not use advertising cookies or third-party tracking pixels. Analytics, where used, are anonymized and aggregated.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">8. Third-Party Services</h2>
                            <p>We use a limited set of trusted third-party services to operate the platform. Each is bound by data processing agreements:</p>
                            <ul className="list-disc list-inside space-y-2 mt-2 text-slate-300">
                                <li>Cloud infrastructure providers (encrypted hosting)</li>
                                <li>Email delivery services (transactional alerts only)</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">9. Children's Privacy</h2>
                            <p>
                                NomosDesk is not directed at individuals under 18 years of age. We do not knowingly collect personal data from minors.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">10. Changes to This Policy</h2>
                            <p>
                                We may update this Privacy Policy from time to time. Material changes will be communicated via email or platform notification at least 14 days in advance of taking effect.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">11. Contact</h2>
                            <p>For any privacy-related questions or concerns, please contact:</p>
                            <address className="not-italic mt-4 text-slate-300">
                                <strong className="text-white">Nexus Technologies Limited (NomosDesk)</strong><br />
                                Data Protection Officer<br />
                                <a href="mailto:privacy@nomosdesk.com" className="text-indigo-400 hover:text-indigo-300">privacy@nomosdesk.com</a>
                            </address>
                        </section>

                    </div>
                </div>
            </Section>
        </Layout>
    );
}
