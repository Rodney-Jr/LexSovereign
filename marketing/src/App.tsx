import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ForLawFirms from './pages/ForLawFirms';
import ForEnterprise from './pages/ForEnterprise';
import ForGovernment from './pages/ForGovernment';
import PricingPage from './pages/PricingPage';
import SecurityPage from './pages/SecurityPage';
import ClientIntakePage from './pages/ClientIntakePage';

// ScrollToTop component to handle scroll restoration on route change
function ScrollToTop() {
    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    return null;
}

export default function App() {
    return (
        <Router>
            {/* Ensures page starts at top on navigation */}
            <ScrollToTop />
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/for-law-firms" element={<ForLawFirms />} />
                <Route path="/for-enterprise-legal" element={<ForEnterprise />} />
                <Route path="/for-government" element={<ForGovernment />} />
                <Route path="/pricing" element={<PricingPage />} />
                <Route path="/security-and-compliance" element={<SecurityPage />} />
                <Route path="/client-intake-assistant" element={<ClientIntakePage />} />
                <Route path="/privacy" element={<SecurityPage />} /> {/* Fallback for demo */}
                <Route path="/terms" element={<SecurityPage />} /> {/* Fallback for demo */}
            </Routes>
        </Router>
    );
}
