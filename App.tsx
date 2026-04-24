import React, { useState, useEffect } from 'react';
import { AppMode, DocumentMetadata, UserRole, Matter } from './types';
import { TAB_REQUIRED_PERMISSIONS } from './constants';
import {
  Scale,
  ChevronRight,
  Rocket,
  Briefcase,
  LogOut,
  ShieldAlert,
  Sparkles,
  Calendar,
  UserPlus,
  Shield
} from 'lucide-react';

import Dashboard from './components/Dashboard';
import DocumentVault from './components/DocumentVault';
import LegalChat from './components/LegalChat';
import TenantSettings from './components/TenantSettings';
import GlobalSettings from './components/GlobalSettings';
import ProjectStatus from './components/ProjectStatus';
import MatterIntelligence from './components/MatterIntelligence';
import GlobalGovernanceConsole from './components/GlobalGovernanceConsole';
import MatterWorkflow from './components/MatterWorkflow';
import ReviewHub from './components/ReviewHub';
import AccessGovernance from './components/AccessGovernance';
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
import SovereignReviewScreen from './components/SovereignReviewScreen';
import AccountingDashboard from './components/AccountingDashboard';
import DecisionTraceLedger from './components/DecisionTraceLedger';
import { PricingGovernance } from './components/PricingGovernance';
import LegalDrafting from './components/LegalDrafting';
import SovereignMarketplace from './components/SovereignMarketplace';
import ClientPortal from './components/ClientPortal';
import CaseAnalysisModal from './components/CaseAnalysisModal';
import CLMCenter from './components/CLMCenter';
import CaseCenter from './components/CaseCenter';
import EnterpriseDashboard from './components/EnterpriseDashboard';
import TenantGovernanceConsole from './components/TenantGovernanceConsole';
import SovereignExpenseTracker from './components/SovereignExpenseTracker';
import SovereignHRWorkbench from './components/HRWorkbench';
import SovereignAssetManager from './components/SovereignAssetManager';
import DossierWorkspace from './components/DossierWorkspace';
import ClientDirectory from './components/ClientDirectory';

import { PermissionProvider, usePermissions } from './hooks/usePermissions';
import { useInactivityLogout } from './hooks/useInactivityLogout';
import { useAuth } from './hooks/useAuth';
import { useTheme } from './hooks/useTheme';
import { useSovereignData } from './hooks/useSovereignData';
import { NotificationProvider, useNotification } from './components/NotificationProvider';

import { Routes, Route, Navigate, useNavigate, Link, useParams, useLocation } from 'react-router-dom';
import { useSovereign } from './contexts/SovereignContext';
import ProtectedRoute from './components/ProtectedRoute';

const AppContent: React.FC = () => {
  const { session, logout, setSession } = useSovereign();
  const navigate = useNavigate();
  const location = useLocation();

  const activeTab = location.pathname.split('/')[1] || 'dashboard';

  const [selectedMatter, setSelectedMatter] = useState<string | null>(null);
  const [editingDocId, setEditingDocId] = useState<string | null>(null);
  const [isPlatformMode, setIsPlatformMode] = useState(false);
  const [isOnboarding, setIsOnboarding] = useState(false);
  const [isUserInvitation, setIsUserInvitation] = useState(false);
  const [initialToken, setInitialToken] = useState('');
  const [showMatterModal, setShowMatterModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
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

  // Modularized Hooks (Keep temporarily while migrating)
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
  } = useAuth('dashboard', selectedMatter); 

  const { theme, setTheme } = useTheme();
  const {
    documents,
    matters,
    rules,
    addDocument,
    removeDocument,
    addMatter,
    createDocument,
    updateDocument,
    getDocumentContent
  } = useSovereignData(!!session);

  const { hasPermission, checkVisibility, canAccessTab } = usePermissions();

  const [killSwitchActive, setKillSwitchActive] = useState(false);
  const [trialExpiredData, setTrialExpiredData] = useState<{ expiresAt?: string } | null>(null);

  const { notify } = useNotification();

  const { targetTenant, setTargetTenant } = useSovereign();


  const releaseTargetTenant = () => {
    setTargetTenant(null);
    notify('success', 'Management Context Released', 'Returning to Global Governance scope.');
    navigate('/global-governance');
  };

  // API Sentinel
  useEffect(() => {
    const handleAuthFailure = () => {
      console.warn("[App] Session revoked via API signal. Forced logout.");
      handleLogout();
    };
    const handleTrialExpired = (e: any) => {
      console.warn("[App] Sovereign Trial Matured. Locking UI.");
      setTrialExpiredData(e.detail);
    };
    const handleApiError = (e: any) => {
      notify('error', e.detail.message || 'API Error', e.detail.description);
    };
    const handleApiSuccess = (e: any) => {
      notify('success', e.detail.message || 'Action Completed');
    };

    window.addEventListener('nomosdesk-auth-failed', handleAuthFailure);
    window.addEventListener('nomosdesk-trial-expired', handleTrialExpired);
    window.addEventListener('nomosdesk-api-error', handleApiError);
    window.addEventListener('nomosdesk-api-success', handleApiSuccess);

    return () => {
      window.removeEventListener('nomosdesk-auth-failed', handleAuthFailure);
      window.removeEventListener('nomosdesk-trial-expired', handleTrialExpired);
      window.removeEventListener('nomosdesk-api-error', handleApiError);
      window.removeEventListener('nomosdesk-api-success', handleApiSuccess);
    };
  }, [handleLogout, notify]);

  // Security Policy: Hardened 30-minute inactivity logout
  useInactivityLogout(handleLogout, 1800000, !!session && !isOnboarding);

  const handleInceptionComplete = (selectedMode: AppMode) => {
    setMode(selectedMode);
    setIsOnboarding(false);
  };

  const effectiveRole = (session?.role === 'GLOBAL_ADMIN' && targetTenant) ? 'TENANT_ADMIN' : (session?.role || '');
  const effectiveMode = (session?.role === 'GLOBAL_ADMIN' && targetTenant) ? targetTenant.mode : mode;

  return (
    <AppRouter
      isAuthenticated={!!session}
      isOnboarding={isOnboarding}
      isUserInvitation={isUserInvitation}
      isPlatformMode={isPlatformMode}
      mode={effectiveMode}
      userId={session?.userId || null}
      userName={session?.userName}
      tenantId={session?.tenantId || null}
      activeTab={activeTab}
      setActiveTab={(t) => navigate(`/${t === 'dashboard' ? '' : t}`)}
      setMode={setMode}
      contextRole={effectiveRole}
      theme={theme}
      setTheme={setTheme}
      killSwitchActive={killSwitchActive}
      setKillSwitchActive={setKillSwitchActive}
      handleAuthenticated={(s) => { handleAuthenticated(s); setSession(s); }}
      handleInceptionComplete={handleInceptionComplete}
      setIsPlatformMode={setIsPlatformMode}
      setIsOnboarding={setIsOnboarding}
      setIsUserInvitation={setIsUserInvitation}
      initialToken={initialToken}
      isResettingPassword={isResettingPassword}
      resetToken={resetToken}
      setIsResettingPassword={setIsResettingPassword}
      showMatterModal={showMatterModal}
      setShowMatterModal={setShowMatterModal}
      showLeaveModal={showLeaveModal}
      setShowLeaveModal={setShowLeaveModal}
      trialExpiredData={trialExpiredData}
      setTrialExpiredData={setTrialExpiredData}
      onMatterCreated={(m) => {
        addMatter(m);
      }}
    >
      {/* Sovereign Management Banner (Focus Plane) */}
      {targetTenant && session?.role === 'GLOBAL_ADMIN' && (
        <div className="bg-brand-primary/20 border-b border-brand-primary/30 py-3 px-6 flex items-center justify-between animate-fade-in sticky top-0 z-[60] backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-primary/30 rounded-lg animate-pulse">
              <Shield className="text-brand-primary" size={18} />
            </div>
            <div>
              <span className="text-xs font-bold text-brand-primary uppercase tracking-tighter">Sovereign Management Mode</span>
              <p className="text-sm font-bold text-brand-text">Managing Silo: <span className="text-brand-primary">{targetTenant.name}</span></p>
            </div>
          </div>
          <button 
            onClick={releaseTargetTenant}
            className="px-4 py-1.5 bg-brand-primary hover:bg-brand-primary/80 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-brand-primary/20"
          >
            Release Context
          </button>
        </div>
      )}

      <div className="animate-fade-in-up">
        <Routes>
          <Route path="/" element={<Navigate to={session?.role === UserRole.CLIENT ? "/client-portal" : "/dashboard"} replace />} />
          
          <Route path="/dashboard" element={
            session?.role === UserRole.CLIENT ? <Navigate to="/client-portal" replace /> :
            <div className="space-y-6">
              <div className="flex items-center justify-between gap-4">
                <div className="bg-brand-primary/10 border border-brand-primary/20 p-6 rounded-[2rem] flex-1 flex items-center justify-between shadow-lg shadow-brand-primary/5">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-brand-primary/20 rounded-2xl animate-float"><Rocket className="text-brand-primary" /></div>
                    <div>
                      <h4 className="font-bold text-brand-text tracking-tight">{session?.userName ? `Welcome, ${session.userName}` : 'System Operational Pulse'}</h4>
                      <p className="text-xs text-brand-muted">Verified as <span className="text-brand-primary font-bold">{effectiveRole}</span> • SOV-PRIMARY-1</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={handleLogout} title="Logout" className="p-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-all border border-red-500/20">
                      <LogOut size={18} />
                    </button>
                  </div>
                </div>
                {effectiveRole !== 'GLOBAL_ADMIN' && effectiveRole !== UserRole.CLIENT && (
                  <>
                    {(session?.allowedQuickActions === null || session?.allowedQuickActions === undefined || session.allowedQuickActions.includes('quick_draft')) && (
                      <Link to="/drafting" className="bg-brand-primary/10 border border-brand-primary/20 p-6 rounded-[2rem] cursor-pointer hover:bg-brand-primary/20 transition-all flex items-center gap-4 shadow-lg shadow-brand-primary/5">
                        <div className="p-3 bg-brand-primary/20 rounded-2xl animate-pulse"><Sparkles className="text-brand-primary" size={24} /></div>
                        <div>
                          <h4 className="font-bold text-brand-text">Quick Draft</h4>
                          <p className="text-xs text-brand-muted">New Legal Artifact</p>
                        </div>
                      </Link>
                    )}

                    {(session?.allowedQuickActions === null || session?.allowedQuickActions === undefined || session.allowedQuickActions.includes('incept_matter')) && (
                      <div onClick={() => setShowMatterModal(true)} className="bg-brand-secondary/10 border border-brand-secondary/20 p-6 rounded-[2rem] cursor-pointer hover:bg-brand-secondary/20 transition-all flex items-center gap-4 shadow-lg shadow-brand-secondary/5">
                        <div className="p-3 bg-brand-secondary/20 rounded-2xl"><Briefcase className="text-brand-secondary" /></div>
                        <div>
                          <h4 className="font-bold text-brand-text">Incept Matter</h4>
                          <p className="text-xs text-brand-muted">New Global Instance</p>
                        </div>
                      </div>
                    )}

                    {(session?.allowedQuickActions === null || session?.allowedQuickActions === undefined || session.allowedQuickActions.includes('request_leave')) && (
                      <div onClick={() => setShowLeaveModal(true)} className="bg-amber-500/10 border border-amber-500/20 p-6 rounded-[2rem] cursor-pointer hover:bg-amber-500/20 transition-all flex items-center gap-4 shadow-lg shadow-amber-500/5">
                        <div className="p-3 bg-amber-500/20 rounded-2xl"><Calendar className="text-amber-500" /></div>
                        <div>
                          <h4 className="font-bold text-brand-text">Request Leave</h4>
                          <p className="text-xs text-brand-muted">Submit Application</p>
                        </div>
                      </div>
                    )}

                    {(effectiveRole === 'TENANT_ADMIN' || effectiveRole === 'GLOBAL_ADMIN') && (
                      <div onClick={() => navigate('/tenant-settings?tab=organization&invite=true')} className="bg-purple-500/10 border border-purple-500/20 p-6 rounded-[2rem] cursor-pointer hover:bg-purple-500/20 transition-all flex items-center gap-4 shadow-lg shadow-purple-500/5">
                        <div className="p-3 bg-purple-500/20 rounded-2xl"><UserPlus className="text-purple-400" /></div>
                        <div>
                          <h4 className="font-bold text-brand-text">Invite Practitioner</h4>
                          <p className="text-xs text-brand-muted">Expand Organization</p>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
              <Dashboard
                mode={effectiveMode}
                userName={session?.userName || 'User'}
                tenantName={session?.tenantName}
                mattersCount={matters.length}
                docsCount={documents.length}
                rulesCount={rules.length}
              />
            </div>
          } />

          <Route path="/platform-ops" element={<ProtectedRoute tab="platform-ops"><GlobalControlPlane userName={session?.userName || 'Administrator'} userRole={session?.role as any} onNavigate={(t) => navigate(`/${t}`)} /></ProtectedRoute>} />
          <Route path="/global-governance" element={<ProtectedRoute tab="global-governance"><GlobalGovernanceConsole /></ProtectedRoute>} />
          <Route path="/tenant-governance" element={<ProtectedRoute tab="tenant-governance"><TenantGovernanceConsole /></ProtectedRoute>} />
          <Route path="/org-blueprint" element={<ProtectedRoute tab="org-blueprint"><OrgChart /></ProtectedRoute>} />
          <Route path="/integration-bridge" element={<ProtectedRoute tab="integration-bridge"><BridgeRegistry /></ProtectedRoute>} />
          <Route path="/identity" element={<ProtectedRoute tab="identity"><AccessGovernance userRole={session?.role as any} setUserRole={() => { }} /></ProtectedRoute>} />
          <Route path="/reviews" element={<ProtectedRoute tab="reviews"><ReviewHub userRole={session?.role as any} /></ProtectedRoute>} />
          <Route path="/capacity" element={<ProtectedRoute tab="capacity"><CapacityDashboard /></ProtectedRoute>} />
          <Route path="/predictive" element={<ProtectedRoute tab="predictive"><PredictiveOps mode={mode} /></ProtectedRoute>} />
          <Route path="/workflow" element={<ProtectedRoute tab="workflow"><MatterWorkflow /></ProtectedRoute>} />
          <Route path="/conflict-check" element={<ProtectedRoute tab="conflict-check"><ZkConflictSearch /></ProtectedRoute>} />
          <Route path="/growth" element={<ProtectedRoute tab="growth"><GrowthDashboard /></ProtectedRoute>} />
          <Route path="/sentinel" element={<ProtectedRoute tab="sentinel"><SovereignReviewScreen /></ProtectedRoute>} />
          <Route path="/sentinel-demo" element={<ProtectedRoute tab="sentinel"><SovereignReviewScreen /></ProtectedRoute>} />
          <Route path="/pricing-calib" element={<ProtectedRoute tab="pricing-calib">{import.meta.env.VITE_SHOW_PRICING === 'true' ? <PricingGovernance /> : <Navigate to="/dashboard" />}</ProtectedRoute>} />
          <Route path="/audit" element={<ProtectedRoute tab="audit"><DecisionTraceLedger /></ProtectedRoute>} />
          <Route path="/backlog" element={<ProtectedRoute tab="backlog"><EngineeringBacklog /></ProtectedRoute>} />
          <Route path="/drafting" element={<ProtectedRoute tab="drafting">
            <LegalDrafting
              onAddDocument={createDocument}
              onUpdateDocument={updateDocument}
              getDocumentContent={getDocumentContent}
              documents={documents}
              matterId={selectedMatter}
              initialEditingDocId={editingDocId}
              onClearInitialDoc={() => setEditingDocId(null)}
            />
          </ProtectedRoute>} />
          <Route path="/analysis" element={<ProtectedRoute tab="analysis"><CaseAnalysisModal isOpen={true} onClose={() => navigate('/dashboard')} /></ProtectedRoute>} />
          <Route path="/clm-center" element={<ProtectedRoute tab="clm-center"><CLMCenter /></ProtectedRoute>} />
          <Route path="/case-center" element={<ProtectedRoute tab="case-center"><CaseCenter /></ProtectedRoute>} />
          <Route path="/billing" element={<ProtectedRoute tab="billing">{String(import.meta.env.VITE_SHOW_PRICING).toLowerCase() === 'true' ? <SovereignBilling /> : <Navigate to="/dashboard" />}</ProtectedRoute>} />
          <Route path="/marketplace" element={<ProtectedRoute tab="marketplace"><SovereignMarketplace onAddDocument={createDocument} userRole={session?.role as any} /></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute tab="analytics"><EnterpriseDashboard /></ProtectedRoute>} />
          <Route path="/hr-workbench" element={<ProtectedRoute tab="hr-workbench"><SovereignHRWorkbench userRole={session?.role as any} /></ProtectedRoute>} />
          <Route path="/expense-tracker" element={<ProtectedRoute tab="expense-tracker"><SovereignExpenseTracker /></ProtectedRoute>} />
          <Route path="/asset-tracker" element={<ProtectedRoute tab="asset-tracker"><SovereignAssetManager /></ProtectedRoute>} />
          <Route path="/accounting-hub" element={<ProtectedRoute tab="accounting-hub"><AccountingDashboard /></ProtectedRoute>} />
          <Route path="/vault/:matterId?" element={<ProtectedRoute tab="vault">
            <VaultRouteWrapper 
               documents={documents} 
               matters={matters} 
               mode={mode}
               checkVisibility={checkVisibility}
               createDocument={createDocument}
               updateDocument={updateDocument}
               getDocumentContent={getDocumentContent}
               removeDocument={removeDocument}
               setEditingDocId={setEditingDocId}
            />
          </ProtectedRoute>} />
          <Route path="/chat" element={<ProtectedRoute tab="chat"><LegalChat killSwitchActive={killSwitchActive} rules={rules} documents={documents} matters={matters} /></ProtectedRoute>} />
          <Route path="/status" element={<ProtectedRoute tab="status"><ProjectStatus /></ProtectedRoute>} />
          <Route path="/dossier" element={<ProtectedRoute><DossierWorkspace isSelfService /></ProtectedRoute>} />
          <Route path="/dossier/:id" element={<ProtectedRoute tab="identity"><DossierWorkspace /></ProtectedRoute>} />
          <Route path="/tenant-settings" element={<ProtectedRoute tab="tenant-settings"><TenantSettings userRole={session?.role as any} setUserRole={() => { }} /></ProtectedRoute>} />
          <Route path="/system-settings" element={<ProtectedRoute tab="system-settings"><GlobalSettings /></ProtectedRoute>} />
          <Route path="/client-portal" element={<ProtectedRoute tab="client-portal"><ClientPortal userName={session?.userName || 'Valued Client'} onLogout={handleLogout} /></ProtectedRoute>} />
          <Route path="/clients" element={<ProtectedRoute tab="clients"><ClientDirectory /></ProtectedRoute>} />
        </Routes>
      </div>
    </AppRouter>
  );
};

const VaultRouteWrapper: React.FC<any> = ({ 
  documents, 
  matters, 
  mode, 
  checkVisibility, 
  createDocument, 
  updateDocument, 
  getDocumentContent, 
  removeDocument,
  setEditingDocId
}) => {
  const { matterId } = useParams<{ matterId?: string }>();
  const navigate = useNavigate();

  if (matterId) {
    return (
      <MatterIntelligence
        matterId={matterId}
        mode={mode}
        onBack={() => navigate('/vault')}
        documents={documents.filter(checkVisibility)}
        onCreateDocument={createDocument}
        onDocumentDoubleClick={(id: string) => {
          setEditingDocId(id);
          navigate('/drafting');
        }}
      />
    );
  }

  return (
    <div className="space-y-8">
      <DocumentVault
        documents={documents.filter(checkVisibility)}
        onAddDocument={createDocument}
        onUpdateDocument={updateDocument}
        getDocumentContent={getDocumentContent}
        onRemoveDocument={removeDocument}
      />
      <div className="h-[1px] bg-brand-border w-full my-4"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {matters.filter(checkVisibility).map((matter: any) => (
          <div 
            key={matter.id} 
            onClick={() => navigate(`/vault/${matter.id}`)} 
            className="bg-brand-sidebar border border-brand-border p-6 rounded-3xl flex items-center justify-between group cursor-pointer hover:border-brand-primary/30 transition-all hover:bg-brand-sidebar/80"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-brand-primary/10 rounded-xl group-hover:bg-brand-primary/20 transition-colors">
                <Scale size={20} className="text-brand-primary" />
              </div>
              <div>
                <h4 className="font-bold text-brand-text">{matter.name}</h4>
                <p className="text-[10px] text-brand-muted font-mono">{matter.id} • {matter.client}</p>
              </div>
            </div>
            <div className="flex flex-col items-center gap-1 group-hover:translate-x-1 transition-all">
              <span className="text-[8px] font-bold text-brand-primary uppercase tracking-widest bg-brand-primary/10 px-2 py-0.5 rounded">Active</span>
              <ChevronRight className="text-brand-muted group-hover:text-brand-primary" />
            </div>
          </div>
        ))}
      </div>
    </div>
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
import { SovereignProvider } from './contexts/SovereignContext';
export default function WrappedApp() {
  return (
    <SovereignProvider>
      <PermissionProvider>
        <NotificationProvider>
          <ErrorBoundary>
            <AppContent />
          </ErrorBoundary>
        </NotificationProvider>
      </PermissionProvider>
    </SovereignProvider>
  );
}
