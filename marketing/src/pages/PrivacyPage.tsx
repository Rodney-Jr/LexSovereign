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
                            <h2 className="text-2xl font-bold text-white mb-4">1. Data Roles: Controller vs. Processor</h2>
                            <p>
                                NomosDesk is operated by Nexus Technologies Limited (Company Registration No. CS339712014), registered at 50 Caloundra Street, New Ashongman Estates, GE-208-4173 Accra, Ghana.
                            </p>
                            <p className="mt-4">
                                <strong>As a Controller:</strong> We control the data necessary to manage your account (e.g., your name, billing email, payment information, and usage analytics).
                            </p>
                            <p className="mt-4">
                                <strong>As a Processor:</strong> For the legal case files, client data, and matter details you upload into the platform ("Customer Data"), you (the law firm) act as the Data Controller. We act strictly as a Data Processor operating under your instructions.
                            </p>
                            <p className="mt-4">
                                <strong>No Data Brokerage:</strong> NomosDesk is not a data broker and expressly prohibits the sale of any personal data.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">2. Information We Collect</h2>
                            <ul className="list-disc list-inside space-y-2 mt-2 text-slate-300">
                                <li><strong>Account Information:</strong> Name, email, firm details, and payment processing information (handled via secure third parties like Stripe).</li>
                                <li><strong>Platform Usage Data:</strong> IP addresses, browser types, and interaction metrics to help us improve the system.</li>
                                <li><strong>Customer Data:</strong> The specific legal documents and client information you choose to host on our platform.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">3. How We Use Information</h2>
                            <p>We use your information to:</p>
                            <ul className="list-disc list-inside space-y-2 mt-2 text-slate-300">
                                <li>Provide, maintain, and secure the NomosDesk platform.</li>
                                <li>Process your subscription payments.</li>
                                <li>Communicate with you regarding updates, support, and platform notices.</li>
                                <li>Detect and prevent fraud or security incidents.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">4. Artificial Intelligence & Data Usage</h2>
                            <p>
                                We use third-party AI providers via secure APIs to power the "Drafting Studio" and generative features.
                            </p>
                            <p className="mt-4">
                                <strong>No Training on Customer Data:</strong> The specific case files, prompts, and client data you submit to our AI tools are processed for immediate output generation only. We DO NOT use your Customer Data to train our foundational models, and our API agreements legally prohibit our third-party AI providers from using your data to train their models.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">5. Data Sharing & Subprocessors</h2>
                            <p>
                                We do not sell your data. We share data only with trusted third-party service providers (subprocessors) necessary to run our infrastructure (e.g., cloud hosting, email delivery, payment routing). These providers are bound by strict confidentiality and data protection agreements.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">6. Security Practices</h2>
                            <p>
                                We implement industry-standard security practices, including data encryption in transit and at rest, secure access protocols, and regular system monitoring, to protect your data from unauthorized access. (Note: While we strive to protect your data, no internet transmission is 100% secure).
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">7. Data Retention</h2>
                            <p>
                                We retain your account information as long as your account is active. When you cancel, we will delete or anonymize your Customer Data according to our internal deletion schedules, unless legal obligations require further retention.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">8. Your Rights</h2>
                            <p>
                                Depending on your jurisdiction, you may have the right to access, correct, or delete your personal data. Please contact us to exercise these rights regarding your account information.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">9. Contact Us</h2>
                            <p>For privacy inquiries, please contact our Data Protection Officer at:</p>
                            <address className="not-italic mt-4 text-slate-300">
                                <strong className="text-white">Nexus Technologies Limited</strong><br />
                                50 Caloundra Street<br />
                                New Ashongman Estates<br />
                                GE-208-4173 Accra<br />
                                Ghana<br />
                                <a href="mailto:privacy@nomosdesk.com" className="text-indigo-400 hover:text-indigo-300 mt-2 block">privacy@nomosdesk.com</a>
                            </address>
                        </section>
                    </div>
                </div>
            </Section>
        </Layout>
    );
}
