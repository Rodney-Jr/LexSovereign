import React, { useState, useEffect } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AppMode, DocumentMetadata, UserRole, Matter } from './types';
import { TAB_REQUIRED_PERMISSIONS } from './constants';
import {
  Scale,
  ChevronRight,
  Rocket,
  Briefcase,
  LogOut,
  ShieldAlert,
  Sparkles
} from 'lucide-react';

import Dashboard from './components/Dashboard';
import DocumentVault from './components/DocumentVault';
import LegalChat from './components/LegalChat';
import TenantSettings from './components/TenantSettings';
import GlobalSettings from './components/GlobalSettings';
import ProjectStatus from './components/ProjectStatus';
import MatterIntelligence from './components/MatterIntelligence';
import TenantGovernance from './components/TenantGovernance';
import TenantAdministration from './components/TenantAdministration';
import MatterWorkflow from './components/MatterWorkflow';
import ReviewHub from './components/ReviewHub';
import AccessGovernance from './components/AccessGovernance';
import MatterCreationModal from './components/MatterCreationModal';
import GlobalControlPlane from './components/GlobalControlPlane';
import OrgChart from './components/OrgChart';
import BridgeRegistry from './components/BridgeRegistry';
import ZkConflictSearch from './components/ZkConflictSearch';
import ChatbotStudio from './components/ChatbotStudio';
import SovereignBilling from './components/SovereignBilling';
import AppRouter from './components/AppRouter';
import CapacityDashboard from './components/CapacityDashboard';
import PredictiveOps from './components/PredictiveOps';
import EngineeringBacklog from './components/EngineeringBacklog';
import GrowthDashboard from './components/GrowthDashboard';
import GhanaReviewScreen from './components/GhanaReviewScreen';
import DecisionTraceLedger from './components/DecisionTraceLedger';
import { PricingGovernance } from './components/PricingGovernance';
import LegalDrafting from './components/LegalDrafting';
import SovereignMarketplace from './components/SovereignMarketplace';
import ClientPortal from './components/ClientPortal';

import { PermissionProvider, usePermissions } from './hooks/usePermissions';
import { useInactivityLogout } from './hooks/useInactivityLogout';
import { useAuth } from './hooks/useAuth';
import { useTheme } from './hooks/useTheme';
import { useSovereignData } from './hooks/useSovereignData';

const AppContent: React.FC = () => {
  // Persist Active Tab
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('lexSovereign_activeTab') || 'dashboard';
  });

  useEffect(() => {
    localStorage.setItem('lexSovereign_activeTab', activeTab);
  }, [activeTab]);

  const [selectedMatter, setSelectedMatter] = useState<string | null>(null);
  const [isPlatformMode, setIsPlatformMode] = useState(false);
  const [isOnboarding, setIsOnboarding] = useState(false);
  const [isUserInvitation, setIsUserInvitation] = useState(false);
  const [initialToken, setInitialToken] = useState('');
  const [showMatterModal, setShowMatterModal] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [resetToken, setResetToken] = useState('');

  // URL Invitation Discovery
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const resetTokenParam = params.get('resetToken');
    const planParam = params.get('plan');

    if (resetTokenParam) {
      setResetToken(resetTokenParam);
      setIsResettingPassword(true);
    } else if (token) {
      setInitialToken(token);
      setIsUserInvitation(true);
    } else if (planParam) {
      setIsOnboarding(true);
    } else if (window.location.pathname === '/join') {
      setIsUserInvitation(true);
    }
  }, []);

  // Modularized Hooks
  const {
    isAuthenticated,
    userId,
    userName,
    tenantId,
    mode,
    setMode,
    contextRole,
    handleAuthenticated,
    handleLogout,
    recoverWork
  } = useAuth(activeTab, selectedMatter);

  const { theme, setTheme } = useTheme();
  const {
    documents,
    matters,
    rules,
    addDocument,
    removeDocument,
    addMatter,
    createDocument
  } = useSovereignData(isAuthenticated);

  const { hasAnyPermission } = usePermissions();

  const [killSwitchActive, setKillSwitchActive] = useState(false);

  // API Sentinel
  useEffect(() => {
    const handleAuthFailure = () => {
      console.warn("[App] Session revoked via API signal. Forced logout.");
      handleLogout();
    };
    window.addEventListener('lex-sovereign-auth-failed', handleAuthFailure);
    return () => window.removeEventListener('lex-sovereign-auth-failed', handleAuthFailure);
  }, [handleLogout]);

  // Security Policy
  useInactivityLogout(handleLogout, 1800000, isAuthenticated && !isOnboarding);

  // RBAC Sentinel
  useEffect(() => {
    if (isAuthenticated) {
      const isAllowed = (tab: string) => {
        if (contextRole === 'GLOBAL_ADMIN') return true;
        const required = TAB_REQUIRED_PERMISSIONS[tab];
        return !required || required.length === 0 || hasAnyPermission(required);
      };

      if (!isAllowed(activeTab)) {
        setActiveTab('dashboard');
      }
    }
  }, [activeTab, contextRole, isAuthenticated, hasAnyPermission]);

  // Client Portal Redirection
  useEffect(() => {
    if (isAuthenticated && contextRole === 'CLIENT' && activeTab !== 'client-portal') {
      setActiveTab('client-portal');
    }
  }, [isAuthenticated, contextRole, activeTab]);

  const handleInceptionComplete = async (selectedMode: AppMode) => {
    const pending = (window as any)._pendingSession;
    if (pending) {
      await handleAuthenticated({
        role: pending.user.role,
        token: pending.token,
        userId: pending.user.id,
        userName: pending.user.name,
        tenantId: pending.user.tenantId,
        permissions: pending.user.permissions || [],
        mode: selectedMode
      });
      delete (window as any)._pendingSession;
    }
    setMode(selectedMode);
    setIsOnboarding(false);
  };

  return (
    <AppRouter
      isAuthenticated={isAuthenticated}
      isOnboarding={isOnboarding}
      isUserInvitation={isUserInvitation}
      isPlatformMode={isPlatformMode}
      mode={mode}
      userId={userId}
      userName={userName}
      tenantId={tenantId}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      setMode={setMode}
      contextRole={contextRole || ''}
      theme={theme}
      setTheme={setTheme}
      killSwitchActive={killSwitchActive}
      setKillSwitchActive={setKillSwitchActive}
      handleAuthenticated={handleAuthenticated}
      handleInceptionComplete={handleInceptionComplete}
      setIsPlatformMode={setIsPlatformMode}
      setIsOnboarding={setIsOnboarding}
      setIsUserInvitation={setIsUserInvitation}
      initialToken={initialToken}
      isResettingPassword={isResettingPassword}
      resetToken={resetToken}
      setIsResettingPassword={setIsResettingPassword}
    >
      <div className="animate-fade-in-up">
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
              <div className="bg-brand-primary/10 border border-brand-primary/20 p-6 rounded-[2rem] flex-1 flex items-center justify-between shadow-lg shadow-brand-primary/5">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-brand-primary/20 rounded-2xl animate-float"><Rocket className="text-brand-primary" /></div>
                  <div>
                    <h4 className="font-bold text-brand-text tracking-tight">{userName ? `Welcome, ${userName}` : 'System Operational Pulse'}</h4>
                    <p className="text-xs text-brand-muted">Verified as <span className="text-brand-primary font-bold">{contextRole}</span> • SOV-PRIMARY-1</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={handleLogout} title="Logout" className="p-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-all border border-red-500/20">
                    <LogOut size={18} />
                  </button>
                </div>
              </div>
              {contextRole !== 'GLOBAL_ADMIN' && (
                <>
                  <div onClick={() => setActiveTab('drafting')} className="bg-brand-primary/10 border border-brand-primary/20 p-6 rounded-[2rem] cursor-pointer hover:bg-brand-primary/20 transition-all flex items-center gap-4 shadow-lg shadow-brand-primary/5">
                    <div className="p-3 bg-brand-primary/20 rounded-2xl animate-pulse"><Sparkles className="text-brand-primary" size={24} /></div>
                    <div>
                      <h4 className="font-bold text-brand-text">Quick Draft</h4>
                      <p className="text-xs text-brand-muted">New Legal Artifact</p>
                    </div>
                  </div>

                  <div onClick={() => setShowMatterModal(true)} className="bg-brand-secondary/10 border border-brand-secondary/20 p-6 rounded-[2rem] cursor-pointer hover:bg-brand-secondary/20 transition-all flex items-center gap-4 shadow-lg shadow-brand-secondary/5">
                    <div className="p-3 bg-brand-secondary/20 rounded-2xl"><Briefcase className="text-brand-secondary" /></div>
                    <div>
                      <h4 className="font-bold text-brand-text">Incept Matter</h4>
                      <p className="text-xs text-brand-muted">New Global Instance</p>
                    </div>
                  </div>
                </>
              )}
            </div>
            <Dashboard
              mode={mode}
              userName={userName || 'User'}
              mattersCount={matters.length}
              docsCount={documents.length}
              rulesCount={rules.length}
            />
          </div>
        )}

        {activeTab === 'platform-ops' && <GlobalControlPlane userName={userName || 'Administrator'} onNavigate={setActiveTab} />}
        {activeTab === 'governance' && <TenantGovernance />}
        {activeTab === 'org-blueprint' && <OrgChart />}
        {activeTab === 'integration-bridge' && <BridgeRegistry />}
        {activeTab === 'identity' && <AccessGovernance userRole={contextRole as any} setUserRole={() => { }} />}
        {activeTab === 'reviews' && <ReviewHub userRole={contextRole as any} />}
        {activeTab === 'tenant-admin' && <TenantAdministration />}
        {activeTab === 'capacity' && <CapacityDashboard />}
        {activeTab === 'predictive' && <PredictiveOps mode={mode} />}
        {activeTab === 'workflow' && <MatterWorkflow />}
        {activeTab === 'conflict-check' && <ZkConflictSearch />}
        {activeTab === 'growth' && <GrowthDashboard />}
        {activeTab === 'sentinel' && <GhanaReviewScreen />}
        {activeTab === 'sentinel-demo' && <GhanaReviewScreen />}
        {activeTab === 'pricing-calib' && <PricingGovernance />}
        {activeTab === 'audit' && <DecisionTraceLedger />}
        {activeTab === 'backlog' && <EngineeringBacklog />}
        {activeTab === 'drafting' && <LegalDrafting onAddDocument={createDocument} matterId={selectedMatter} />}
        {activeTab === 'marketplace' && <SovereignMarketplace onAddDocument={createDocument} userRole={contextRole as any} />}

        {activeTab === 'vault' && (
          selectedMatter ? (
            <MatterIntelligence mode={mode} onBack={() => setSelectedMatter(null)} documents={documents} />
          ) : (
            <div className="space-y-8">
              <DocumentVault documents={documents} onAddDocument={createDocument} onRemoveDocument={removeDocument} />
              <div className="h-[1px] bg-brand-border w-full my-4"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {matters.map(matter => (
                  <div key={matter.id} onClick={() => setSelectedMatter(matter.id)} className="bg-brand-sidebar border border-brand-border p-6 rounded-3xl flex items-center justify-between group cursor-pointer hover:border-brand-primary/30 transition-all hover:bg-brand-sidebar/80">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-brand-primary/10 rounded-xl group-hover:bg-brand-primary/20 transition-colors"><Scale size={20} className="text-brand-primary" /></div>
                      <div>
                        <h4 className="font-bold text-brand-text">{matter.name}</h4>
                        <p className="text-[10px] text-brand-muted font-mono">{matter.id} • {matter.client}</p>
                      </div>
                    </div>
                    <ChevronRight className="text-brand-muted group-hover:text-brand-primary group-hover:translate-x-1 transition-all" />
                  </div>
                ))}
              </div>
            </div>
          )
        )}

        {activeTab === 'chat' && <LegalChat killSwitchActive={killSwitchActive} rules={rules} documents={documents} matters={matters} />}
        {activeTab === 'status' && <ProjectStatus />}
        {activeTab === 'tenant-settings' && <TenantSettings userRole={contextRole as any} setUserRole={() => { }} />}
        {activeTab === 'system-settings' && <GlobalSettings />}
        {activeTab === 'client-portal' && <ClientPortal userName={userName || 'Valued Client'} />}
      </div>

      {showMatterModal && (
        <MatterCreationModal
          mode={mode}
          userId={userId || ''}
          tenantId={tenantId || ''}
          onClose={() => setShowMatterModal(false)}
          onCreated={(m) => {
            addMatter(m);
            setShowMatterModal(false);
          }}
        />
      )}
    </AppRouter>
  );
};

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: any }> {
  state = { hasError: false, error: null };
  static getDerivedStateFromError(error: any) { return { hasError: true, error }; }
  componentDidCatch(error: any, errorInfo: any) { console.error("Uncaught error:", error, errorInfo); }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-8 text-white text-center">
          <ShieldAlert className="text-red-500 w-16 h-16 mb-6" />
          <h1 className="text-3xl font-bold mb-4">Sovereign Protocol Halted</h1>
          <p className="text-slate-400 max-w-lg mx-auto mb-8">An unrecoverable error occurred in the enclave governance layer.</p>
          <div className="bg-slate-900 p-6 rounded-xl border border-red-500/20 text-left w-full max-w-2xl overflow-auto max-h-64">
            <p className="text-red-400 font-mono text-xs whitespace-pre-wrap">{(this.state.error as any)?.toString()}</p>
          </div>
          <button onClick={() => window.location.href = '/'} className="mt-8 px-6 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl font-bold transition-all border border-red-500/20">Re-Initialize Session</button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function WrappedApp() {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || (window as any)._GOOGLE_CLIENT_ID;
  const hasValidGoogleClientId = googleClientId && googleClientId !== 'v0-google-client-id' && !googleClientId.includes('placeholder');

  if (!hasValidGoogleClientId) {
    console.warn("[Auth] Google OAuth is disabled - no valid Client ID found. Email/password login is still available.");
  }

  const AppWrapper = hasValidGoogleClientId ? (
    <GoogleOAuthProvider clientId={googleClientId}>
      <PermissionProvider>
        <ErrorBoundary>
          <AppContent />
        </ErrorBoundary>
      </PermissionProvider>
    </GoogleOAuthProvider>
  ) : (
    <PermissionProvider>
      <ErrorBoundary>
        <AppContent />
      </ErrorBoundary>
    </PermissionProvider>
  );

  return AppWrapper;
}
