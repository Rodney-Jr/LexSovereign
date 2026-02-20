import React, { Suspense, useEffect } from 'react';
import { Routes, Route, useLocation } from './utils/ssr-compat';
import ChatbotWidget from './components/ChatbotWidget';

// Route-level code splitting — each page loads its own chunk
const HomePage = React.lazy(() => import('./pages/HomePage'));
const ForLawFirms = React.lazy(() => import('./pages/ForLawFirms'));
const ForEnterprise = React.lazy(() => import('./pages/ForEnterprise'));
const ForGovernment = React.lazy(() => import('./pages/ForGovernment'));
const PricingPage = React.lazy(() => import('./pages/PricingPage'));
const SecurityPage = React.lazy(() => import('./pages/SecurityPage'));
const ClientIntakePage = React.lazy(() => import('./pages/ClientIntakePage'));
const PrivacyPage = React.lazy(() => import('./pages/PrivacyPage'));
const TermsPage = React.lazy(() => import('./pages/TermsPage'));
const InsightsIndexPage = React.lazy(() => import('./pages/insights/InsightsIndexPage'));
const LegalSoftwareAfrica = React.lazy(() => import('./pages/insights/LegalSoftwareAfrica'));
const GovernmentCaseManagement = React.lazy(() => import('./pages/insights/GovernmentCaseManagement'));
const ConflictCheckingSoftware = React.lazy(() => import('./pages/insights/ConflictCheckingSoftware'));
const SovereignLegalData = React.lazy(() => import('./pages/insights/SovereignLegalData'));
const NomosVsClio = React.lazy(() => import('./pages/insights/NomosVsClio'));

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
                </Routes>
            </Suspense>
            {/* Chatbot Widget — appears on all pages */}
            <ChatbotWidget />
        </>
    );
}

