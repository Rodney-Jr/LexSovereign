import React from 'react';
import Layout from '../layouts/Layout';
import SEO from '../components/SEO';
import { Section } from '../components/ui';

export default function TermsPage() {
    return (
        <Layout>
            <SEO
                title="Terms of Service & Usage Agreement"
                description="Read the terms governing the use of the NomosDesk legal governance platform. Professional responsibility and service standards."
                canonical="/terms"
                schema={[
                    {
                        '@context': 'https://schema.org',
                        '@type': 'WebPage',
                        name: 'NomosDesk Terms of Service',
                        url: 'https://nomosdesk.com/terms',
                        description: 'Terms and conditions governing use of the NomosDesk platform.',
                    },
                    {
                        '@context': 'https://schema.org',
                        '@type': 'BreadcrumbList',
                        itemListElement: [
                            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://nomosdesk.com' },
                            { '@type': 'ListItem', position: 2, name: 'Terms of Service', item: 'https://nomosdesk.com/terms' },
                        ],
                    },
                ]}
            />

            <Section className="pt-32 pb-20 bg-slate-950">
                <div className="max-w-3xl mx-auto">
                    <h1 className="text-4xl font-bold text-white mb-4">Terms of Service</h1>
                    <p className="text-slate-400 text-sm mb-12">Last updated: February 2026</p>

                    <div className="prose prose-invert max-w-none space-y-10 text-slate-300 leading-relaxed">

                        <p className="text-lg">
                            By accessing or using the NomosDesk platform ("Service"), provided by Nexus Technologies Limited (Company Registration No. CS339712014), trading as NomosDesk ("Company", "we", "us"), you agree to be bound by these Terms of Service ("Terms"). Nexus Technologies Limited is a registered company incorporated in Accra, Ghana, with its registered office at 50 Caloundra Street, New Ashongman Estates, GE-208-4173 Accra, Ghana.
                        </p>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">1. Platform Positioning & Not Legal Advice</h2>
                            <p>
                                NomosDesk is a secure legal matter management and governance platform. As detailed in our Regulatory Classification, we strictly provide B2B SaaS infrastructure. NomosDesk is not a law firm, and our software does not constitute legal advice or professional legal services. Your use of the Services does not create an attorney-client relationship. You remain solely responsible for your professional obligations, ethical compliance, and the quality of the legal representation you provide.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">2. License & Account Access</h2>
                            <p>
                                Subject to these Terms, we grant you a limited, non-exclusive, non-transferable right to access and use the Services for your internal business purposes. You are responsible for safeguarding your account credentials and for all activities occurring under your account.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">3. Acceptable Use</h2>
                            <p>You agree not to:</p>
                            <ul className="list-disc list-inside space-y-2 mt-2 text-slate-300">
                                <li>Use the Services for illegal purposes or to facilitate the unauthorized practice of law.</li>
                                <li>Upload malicious code, viruses, or attempts to breach our security.</li>
                                <li>Reverse engineer or attempt to copy the platform's underlying technology.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">4. AI Tool Acknowledgment & Disclaimers</h2>
                            <p>The platform features automated AI assistance ("AI Tools").</p>
                            <ul className="list-disc list-inside space-y-2 mt-2 text-slate-300">
                                <li><strong>Assistive Only:</strong> AI Tools are designed to assist, not replace, professional human judgment. You must independently review, verify, and validate all AI-generated content before relying upon it.</li>
                                <li><strong>No Warranty on Output:</strong> NomosDesk does not guarantee the accuracy, completeness, or jurisdictional validity of AI outputs (which may contain "hallucinations" or errors).</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">5. Conflict Checking Limitation</h2>
                            <p>
                                Our internal search and indexing features may aid in identifying potential conflicts; however, they are purely administrative aids. You agree not to rely exclusively on NomosDesk to clear legal conflicts of interest. You maintain full responsibility for executing manual conflict checks required by your jurisdiction.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">6. User Data & Confidentiality</h2>
                            <p>
                                You retain ownership of the data you upload ("Customer Data"). You grant NomosDesk a limited license to process this data solely to provide the Services. We will protect Customer Data using industry-standard security measures.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">7. Warranties and Disclaimers</h2>
                            <p className="uppercase">
                                THE SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE." WE EXPRESSLY DISCLAIM ALL WARRANTIES, WHETHER EXPRESS OR IMPLIED, INCLUDING IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE DO NOT GUARANTEE THAT THE SERVICES WILL BE UNINTERRUPTED, ERROR-FREE, OR PERFECTLY SECURE.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">8. Limitation of Liability</h2>
                            <p className="uppercase">
                                TO THE MAXIMUM EXTENT PERMITTED BY LAW, NOMOSDESK SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, PUNITIVE, OR CONSEQUENTIAL DAMAGES (INCLUDING LOSS OF PROFITS, LOSS OF DATA, OR MALPRACTICE CLAIMS).
                            </p>
                            <p className="uppercase mt-4">
                                OUR TOTAL CUMULATIVE LIABILITY ARISING OUT OF THIS AGREEMENT SHALL NOT EXCEED THE TOTAL AMOUNTS PAID BY YOU TO NOMOSDESK IN THE <strong>[TWELVE (12)]</strong> MONTHS PRECEDING THE CLAIM.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">9. Indemnification</h2>
                            <p>
                                You agree to defend and indemnify NomosDesk from any claims or damages arising from (a) your breach of these Terms, (b) your violation of applicable laws or ethical rules, or (c) claims from third parties regarding your substantive legal representation.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">10. Service Modification & Termination</h2>
                            <p>
                                We reserve the right to modify or interrupt the Services for maintenance. We are not liable for any resulting downtime (Force Majeure events excepted). You may cancel your subscription at any time. We may suspend or terminate your access for violating these Terms.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">11. Governing Law & Dispute Resolution</h2>
                            <p>
                                These Terms are governed by the laws of <strong>[INSERT STATE, e.g., Delaware]</strong>. Any disputes shall be resolved exclusively in the state or federal courts located in <strong>[INSERT COUNTY/STATE]</strong>.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">12. Contact</h2>
                            <p>For questions regarding these Terms, please contact:</p>
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
