import React, { Suspense, useEffect } from 'react';
import { Routes, Route, useLocation } from './utils/ssr-compat';
import ChatbotWidget from './components/ChatbotWidget';

// Helper to handle SSR-safe lazy loading
// During SSR, we want to skip the 'lazy' boundary if we can to avoid Suspense aborts
const isSSR = import.meta.env.SSR;

function lazySSR(factory: () => Promise<{ default: React.ComponentType<any> }>) {
    return React.lazy(factory);
}

// Route-level code splitting — each page loads its own chunk
const HomePage = lazySSR(() => import('./pages/HomePage'));
const ForLawFirms = lazySSR(() => import('./pages/ForLawFirms'));
const ForEnterprise = lazySSR(() => import('./pages/ForEnterprise'));
const ForGovernment = lazySSR(() => import('./pages/ForGovernment'));
const PricingPage = lazySSR(() => import('./pages/PricingPage'));
const SecurityPage = lazySSR(() => import('./pages/SecurityPage'));
const ClientIntakePage = lazySSR(() => import('./pages/ClientIntakePage'));
const PrivacyPage = lazySSR(() => import('./pages/PrivacyPage'));
const TermsPage = lazySSR(() => import('./pages/TermsPage'));
const InsightsIndexPage = lazySSR(() => import('./pages/insights/InsightsIndexPage'));
const LegalSoftwareAfrica = lazySSR(() => import('./pages/insights/LegalSoftwareAfrica'));
const GovernmentCaseManagement = lazySSR(() => import('./pages/insights/GovernmentCaseManagement'));
const ConflictCheckingSoftware = lazySSR(() => import('./pages/insights/ConflictCheckingSoftware'));
const SovereignLegalData = lazySSR(() => import('./pages/insights/SovereignLegalData'));
const NomosVsClio = lazySSR(() => import('./pages/insights/NomosVsClio'));
const FutureOfLegalChatbots = lazySSR(() => import('./pages/insights/FutureOfLegalChatbots'));
const AutomatingConflictChecks = lazySSR(() => import('./pages/insights/AutomatingConflictChecks'));
const SovereignLegalTechTrends = lazySSR(() => import('./pages/insights/SovereignLegalTechTrends'));
const ModernizingMinistriesOfJustice = lazySSR(() => import('./pages/insights/ModernizingMinistriesOfJustice'));
const DataSovereigntyCompliance = lazySSR(() => import('./pages/insights/DataSovereigntyCompliance'));
const StaticFormsVsAIIntake = lazySSR(() => import('./pages/insights/StaticFormsVsAIIntake'));
const CloudVsPrivateEnclaves = lazySSR(() => import('./pages/insights/CloudVsPrivateEnclaves'));
const GovernmentLegalCollaboration = lazySSR(() => import('./pages/insights/GovernmentLegalCollaboration'));
const HardwareSovereignSecurity = lazySSR(() => import('./pages/insights/HardwareSovereignSecurity'));
const PersonalInjuryIntakeAutomation = lazySSR(() => import('./pages/insights/PersonalInjuryIntakeAutomation'));
const ImmigrationIntakeAutomation = lazySSR(() => import('./pages/insights/ImmigrationIntakeAutomation'));
const WhyGenericCRMsFail = lazySSR(() => import('./pages/insights/WhyGenericCRMsFail'));
const LeadLifecycleManagement = lazySSR(() => import('./pages/insights/LeadLifecycleManagement'));
const UnalterableAuditTrails = lazySSR(() => import('./pages/insights/UnalterableAuditTrails'));
const AutomatingMatterCloseout = lazySSR(() => import('./pages/insights/AutomatingMatterCloseout'));
const DigitalTransformationGuide = lazySSR(() => import('./pages/insights/DigitalTransformationGuide'));
const LegacyDataMigration = lazySSR(() => import('./pages/insights/LegacyDataMigration'));
const ISO27001Readiness = lazySSR(() => import('./pages/insights/ISO27001Readiness'));
const AuditReadyRecords = lazySSR(() => import('./pages/insights/AuditReadyRecords'));
const LegalCRMConversionOptimization = lazySSR(() => import('./pages/insights/LegalCRMConversionOptimization'));





// Pillar Pages
const LegalPracticeManagement = lazySSR(() => import('./pages/pillars/LegalPracticeManagement'));
const AILegalSoftware = lazySSR(() => import('./pages/pillars/AILegalSoftware'));
const LawFirmCRM = lazySSR(() => import('./pages/pillars/LawFirmCRM'));
const LegalIntakeAutomation = lazySSR(() => import('./pages/pillars/LegalIntakeAutomation'));

// Comparison Pages
const NomosVsClioComparison = lazySSR(() => import('./pages/comparisons/NomosVsClioComparison'));
const NomosVsMyCase = lazySSR(() => import('./pages/comparisons/NomosVsMyCase'));
const NomosVsPracticePanther = lazySSR(() => import('./pages/comparisons/NomosVsPracticePanther'));


// Page-transition loading fallback
function PageLoader() {
    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );
}

// Scroll restoration on route change
function ScrollToTop() {
    const { pathname } = useLocation();
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);
    return null;
}

export default function App() {
    return (
        <>
            <ScrollToTop />
            <Suspense fallback={<PageLoader />}>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/for-law-firms" element={<ForLawFirms />} />
                    <Route path="/for-enterprise-legal" element={<ForEnterprise />} />
                    <Route path="/for-government" element={<ForGovernment />} />
                    <Route path="/pricing" element={<PricingPage />} />
                    <Route path="/security-and-compliance" element={<SecurityPage />} />
                    <Route path="/client-intake-assistant" element={<ClientIntakePage />} />
                    <Route path="/privacy" element={<PrivacyPage />} />
                    <Route path="/terms" element={<TermsPage />} />
                    <Route path="/insights" element={<InsightsIndexPage />} />
                    <Route path="/insights/legal-software-africa-guide" element={<LegalSoftwareAfrica />} />
                    <Route path="/insights/government-legal-case-management" element={<GovernmentCaseManagement />} />
                    <Route path="/insights/conflict-checking-software-law-firms" element={<ConflictCheckingSoftware />} />
                    <Route path="/insights/sovereign-legal-data-infrastructure" element={<SovereignLegalData />} />
                    <Route path="/insights/nomosdesk-vs-clio" element={<NomosVsClio />} />
                    <Route path="/insights/future-of-legal-ai-chatbots" element={<FutureOfLegalChatbots />} />
                    <Route path="/insights/automating-conflict-checks" element={<AutomatingConflictChecks />} />
                    <Route path="/insights/sovereign-legal-tech-trends-2026" element={<SovereignLegalTechTrends />} />
                    <Route path="/insights/modernizing-ministries-of-justice" element={<ModernizingMinistriesOfJustice />} />
                    <Route path="/insights/data-sovereignty-compliance-africa" element={<DataSovereigntyCompliance />} />
                    <Route path="/insights/static-forms-vs-ai-intake" element={<StaticFormsVsAIIntake />} />
                    <Route path="/insights/cloud-vs-private-enclaves-security" element={<CloudVsPrivateEnclaves />} />
                    <Route path="/insights/inter-departmental-government-legal-collaboration" element={<GovernmentLegalCollaboration />} />
                    <Route path="/insights/hardware-level-sovereign-db-security" element={<HardwareSovereignSecurity />} />
                    <Route path="/insights/personal-injury-intake-automation" element={<PersonalInjuryIntakeAutomation />} />
                    <Route path="/insights/immigration-intake-automation" element={<ImmigrationIntakeAutomation />} />
                    <Route path="/insights/why-generic-crms-fail-law-firms" element={<WhyGenericCRMsFail />} />
                    <Route path="/insights/lead-lifecycle-management-for-legal-teams" element={<LeadLifecycleManagement />} />
                    <Route path="/insights/unalterable-audit-trails-judicial-records" element={<UnalterableAuditTrails />} />
                    <Route path="/insights/automating-matter-close-out-compliance" element={<AutomatingMatterCloseout />} />
                    <Route path="/insights/digital-transformation-guide-2026" element={<DigitalTransformationGuide />} />
                    <Route path="/insights/legacy-legal-data-migration-sovereign-cloud" element={<LegacyDataMigration />} />
                    <Route path="/insights/iso-27001-readiness-law-firms" element={<ISO27001Readiness />} />
                    <Route path="/insights/audit-ready-automated-legal-records" element={<AuditReadyRecords />} />
                    <Route path="/insights/legal-crm-conversion-optimization" element={<LegalCRMConversionOptimization />} />





                    {/* Pillar Routes */}
                    <Route path="/legal-practice-management-software" element={<LegalPracticeManagement />} />
                    <Route path="/ai-for-law-firms" element={<AILegalSoftware />} />
                    <Route path="/law-firm-crm-software" element={<LawFirmCRM />} />
                    <Route path="/automated-legal-intake" element={<LegalIntakeAutomation />} />

                    {/* Comparison Routes */}
                    <Route path="/vs/nomosdesk-vs-clio" element={<NomosVsClioComparison />} />
                    <Route path="/vs/nomosdesk-vs-mycase" element={<NomosVsMyCase />} />
                    <Route path="/vs/nomosdesk-vs-practicepanther" element={<NomosVsPracticePanther />} />

                </Routes>
            </Suspense>
            {/* Chatbot Widget — appears on all pages */}
            <ChatbotWidget />
        </>
    );
}

