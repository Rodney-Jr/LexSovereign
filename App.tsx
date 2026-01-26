
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout.tsx';
import Dashboard from './components/Dashboard';
import DocumentVault from './components/DocumentVault';
import LegalChat from './components/LegalChat';
import ArchitectureMap from './components/ArchitectureMap';
import OmnichannelPreview from './components/OmnichannelPreview';
import TenantSettings from './components/TenantSettings';
import GlobalSettings from './components/GlobalSettings';
import ProjectStatus from './components/ProjectStatus';
import ValidationHub from './components/ValidationHub';
import MatterIntelligence from './components/MatterIntelligence';
import ComplianceExport from './components/ComplianceExport';
import IdentityHub from './components/IdentityHub';
import EnclaveCommandCenter from './components/EnclaveCommandCenter';
import PredictiveOps from './components/PredictiveOps';
import TenantGovernance from './components/TenantGovernance';
import TenantAdministration from './components/TenantAdministration';
const TenantOnboarding = React.lazy(() => import('./components/TenantOnboarding'));
const TenantUserOnboarding = React.lazy(() => import('./components/TenantUserOnboarding'));
import ClientPortal from './components/ClientPortal';
import MatterWorkflow from './components/MatterWorkflow';
import ReviewHub from './components/ReviewHub';
import DecisionTraceLedger from './components/DecisionTraceLedger';
import AccessGovernance from './components/AccessGovernance';
import MatterCreationModal from './components/MatterCreationModal';
import MonetizationStrategy from './components/MonetizationStrategy';
import EngineeringBacklog from './components/EngineeringBacklog';
import GlobalControlPlane from './components/GlobalControlPlane';
import OrgChart from './components/OrgChart';
import BridgeRegistry from './components/BridgeRegistry';
import AuthFlow from './components/AuthFlow';
import PlatformGateway from './components/PlatformGateway';
import ZkConflictSearch from './components/ZkConflictSearch';
import { AppMode, RegulatoryRule, AuditLogEntry, DocumentMetadata, UserRole, Matter, Region } from './types';
import { INITIAL_RULES, INITIAL_DOCS, TAB_REQUIRED_PERMISSIONS, ROLE_DEFAULT_PERMISSIONS } from './constants';
import { Scale, ChevronRight, Plus, Rocket, ShieldCheck, Briefcase, LogOut, UserPlus, ShieldAlert } from 'lucide-react';

const INITIAL_MATTERS: Matter[] = [
  {
    id: 'MT-772',
    name: 'Shareholder Restructuring',
    client: 'Accra Global Partners',
    type: 'Litigation',
    internalCounsel: 'Jane Doe',
    region: Region.GHANA,
    status: 'Open',
    riskLevel: 'Medium',
    createdAt: '2024-05-01'
  }
];

import { PermissionProvider, usePermissions } from './hooks/usePermissions';
import { useInactivityLogout } from './hooks/useInactivityLogout';
import { useWorkPersistence } from './hooks/useWorkPersistence';

// ... (keep existing imports)

const AppContent: React.FC = () => {
  const { setPermissions, setRole, role: contextRole, hasAnyPermission } = usePermissions();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isPlatformMode, setIsPlatformMode] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mode, setMode] = useState<AppMode>(AppMode.LAW_FIRM);
  const [userId, setUserId] = useState<string>('11111111-1111-1111-1111-111111111111');
  const [tenantId, setTenantId] = useState<string>('22222222-2222-2222-2222-222222222222');
  const [killSwitchActive, setKillSwitchActive] = useState(false);
  const [rules, setRules] = useState<RegulatoryRule[]>(INITIAL_RULES);
  const [documents, setDocuments] = useState<DocumentMetadata[]>(INITIAL_DOCS);
  const [matters, setMatters] = useState<Matter[]>(INITIAL_MATTERS);
  const [selectedMatter, setSelectedMatter] = useState<string | null>(null);
  const [isOnboarding, setIsOnboarding] = useState(false);
  const [isUserInvitation, setIsUserInvitation] = useState(false);
  const [showMatterModal, setShowMatterModal] = useState(false);
  const [theme, setTheme] = useState<'midnight' | 'gold' | 'cyber' | 'light'>('midnight');

  // Security Hooks
  const { recoverWork, clearWork } = useWorkPersistence({ activeTab, selectedMatterId: selectedMatter });

  useInactivityLogout(() => {
    if (isAuthenticated) handleLogout();
  }, 300000); // 5 Minutes

  useEffect(() => {
    // Remove existing theme classes
    document.body.classList.remove('theme-midnight', 'theme-gold', 'theme-cyber', 'theme-light');
    // Add current theme class
    document.body.classList.add(`theme-${theme}`);

    // Save to local storage
    localStorage.setItem('lexSovereign_theme', theme);
  }, [theme]);

  // Load saved theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('lexSovereign_theme');
    if (savedTheme) {
      setTheme(savedTheme as any);
    }
  }, []);

  // RBAC Gatekeeper
  const isAllowed = (tab: string) => {
    if (contextRole === 'GLOBAL_ADMIN') return true;
    const required = TAB_REQUIRED_PERMISSIONS[tab];
    if (!required || required.length === 0) return true;
    return hasAnyPermission(required);
  };

  useEffect(() => {
    if (isAuthenticated && !isAllowed(activeTab)) {
      if (isAllowed('dashboard')) {
        setActiveTab('dashboard');
      } else {
        console.warn('Redirecting unauthorized access');
      }
    }
  }, [activeTab, contextRole, isAuthenticated, hasAnyPermission]);

  useEffect(() => {
    const saved = localStorage.getItem('lexSovereign_session') || sessionStorage.getItem('lexSovereign_session');
    if (saved) {
      try {
        const { role, userId: savedUserId, tenantId: savedTenantId, permissions, mode: savedMode } = JSON.parse(saved);
        if (role) {
          const normalizedRole = role.toUpperCase();
          setRole(normalizedRole);

          // Force hydration from constants to ensure latest RBAC rules apply immediately (fix stale cache)
          const activePermissions = ROLE_DEFAULT_PERMISSIONS[normalizedRole] || permissions || [];

          setPermissions(activePermissions);

          if (savedUserId) setUserId(savedUserId);
          if (savedTenantId) setTenantId(savedTenantId);
          if (savedMode) setMode(savedMode);
          setIsAuthenticated(true);
          if (normalizedRole === 'GLOBAL_ADMIN') {
            setActiveTab('platform-ops');
          }
        }
      } catch (e) {
        localStorage.removeItem('lexSovereign_session');
      }
    }
  }, []);

  // Fetch matters on mount... (keep existing)
  // Fetch matters on mount if token exists
  useEffect(() => {
    const fetchMatters = async () => {
      try {
        const saved = localStorage.getItem('lexSovereign_session') || sessionStorage.getItem('lexSovereign_session');
        if (!saved) return;

        const { token } = JSON.parse(saved);
        if (!token) return; // Skip if no real token (Simulation Mode)

        const res = await fetch('/api/matters', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setMatters(data);
          }
        }
      } catch (e) {
        // Silent fail for simulation mode or offline
      }
    };
    fetchMatters();
  }, [isAuthenticated]); // Re-run when authenticated

  const handleAuthenticated = (roleName: string, permissions: string[]) => {
    // Normalizing role name to uppercase for permission lookup
    const normalizedRole = roleName.toUpperCase();

    let finalPermissions = permissions;
    // Hybrid: Always try to get latest from constants for stability, fall back to provided perms
    if (!finalPermissions || finalPermissions.length === 0) {
      finalPermissions = ROLE_DEFAULT_PERMISSIONS[normalizedRole] || [];
    }

    setRole(normalizedRole);
    setPermissions(finalPermissions);
    setIsAuthenticated(true);

    // Persist session immediately to avoid refresh issues
    const sessionData = JSON.stringify({
      role: normalizedRole,
      userId,
      tenantId,
      permissions: finalPermissions
    });
    localStorage.setItem('lexSovereign_session', sessionData);

    if (normalizedRole === 'GLOBAL_ADMIN') {
      setActiveTab('platform-ops');
    }

    // Recover previous work context after login
    const savedWork = recoverWork();
    if (savedWork) {
      console.log("[Persistence] Recovering work session:", savedWork.activeTab);
      setActiveTab(savedWork.activeTab);
      if (savedWork.selectedMatterId) setSelectedMatter(savedWork.selectedMatterId);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setIsPlatformMode(false);
    setActiveTab('dashboard');
    setSelectedMatter(null);
    setIsUserInvitation(false);
    setIsOnboarding(false);
    localStorage.removeItem('lexSovereign_session');
    sessionStorage.removeItem('lexSovereign_session');
    // Note: We do NOT clearWork() here to allow recovery if logout was forced by inactivity
    setRole('');
    setPermissions([]);
  };

  const handleInceptionComplete = (selectedMode: AppMode) => {
    setMode(selectedMode);
    setIsOnboarding(false);

    // If a session was established during onboarding, use it
    const pending = (window as any)._pendingSession;
    if (pending) {
      localStorage.setItem('lexSovereign_session', JSON.stringify({
        role: pending.user.role,
        token: pending.token,
        userId: pending.user.id,
        tenantId: pending.user.tenantId,
        permissions: pending.user.permissions || []
      }));
      handleAuthenticated(pending.user.role, pending.user.permissions || []);
      delete (window as any)._pendingSession;
    } else {
      // Fallback (should not happen with new flow)
      handleAuthenticated('TENANT_ADMIN', []);
    }
  };

  // ... (keep document handlers)
  const handleAddDocument = (doc: DocumentMetadata) => {
    setDocuments(prev => [...prev, doc]);
  };

  const handleRemoveDocument = (id: string) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
  };

  const handleCreateMatter = (matter: Matter) => {
    setMatters(prev => [...prev, matter]);
    setShowMatterModal(false);
  };

  if (isOnboarding) {
    return <TenantOnboarding onComplete={(selectedMode: AppMode) => handleInceptionComplete(selectedMode)} />;
  }

  if (isUserInvitation) {
    return <TenantUserOnboarding mode={mode} userId={userId} tenantId={tenantId} onComplete={(role: UserRole) => handleAuthenticated(role, [])} />;
  }

  if (!isAuthenticated) {
    if (isPlatformMode) {
      return <PlatformGateway onAuthenticated={(role: string) => handleAuthenticated(role, [])} onBackToTenant={() => setIsPlatformMode(false)} />;
    }
    return <AuthFlow onAuthenticated={(role: string, perms: string[]) => handleAuthenticated(role, perms)} onStartOnboarding={() => setIsOnboarding(true)} onSecretTrigger={() => setIsPlatformMode(true)} />;
  }

  return (
    <Layout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      mode={mode}
      setMode={setMode}
      killSwitchActive={killSwitchActive}
      userRole={contextRole as any}
      theme={theme}
      setTheme={setTheme}
    >
      {/* userRole cast as any temporary until Layout updated */}
      <div className="animate-fade-in-up">
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
              <div className="bg-brand-primary/10 border border-brand-primary/20 p-6 rounded-[2rem] flex-1 flex items-center justify-between shadow-lg shadow-brand-primary/5">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-brand-primary/20 rounded-2xl animate-float"><Rocket className="text-brand-primary" /></div>
                  <div>
                    <h4 className="font-bold text-brand-text tracking-tight">System Operational Pulse</h4>
                    <p className="text-xs text-brand-muted">Verified as <span className="text-brand-primary font-bold">{contextRole}</span> • GH-ACC-1</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={handleLogout} aria-label="Logout" title="Logout" className="p-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-all border border-red-500/20">
                    <LogOut size={18} />
                  </button>
                </div>
              </div>
              {contextRole !== 'GLOBAL_ADMIN' && (
                <div onClick={() => setShowMatterModal(true)} className="bg-brand-secondary/10 border border-brand-secondary/20 p-6 rounded-[2rem] cursor-pointer hover:bg-brand-secondary/20 transition-all flex items-center gap-4 shadow-lg shadow-brand-secondary/5">
                  <div className="p-3 bg-brand-secondary/20 rounded-2xl"><Briefcase className="text-brand-secondary" /></div>
                  <div>
                    <h4 className="font-bold text-brand-text">Incept Matter</h4>
                    <p className="text-xs text-brand-muted">New Global Instance</p>
                  </div>
                </div>
              )}
            </div>
            <Dashboard mode={mode} />
          </div>
        )}

        {activeTab === 'platform-ops' && <GlobalControlPlane />}
        {activeTab === 'org-blueprint' && <OrgChart />}
        {activeTab === 'integration-bridge' && <BridgeRegistry />}
        {activeTab === 'identity' && <AccessGovernance userRole={contextRole as any} setUserRole={() => { }} />}
        {activeTab === 'reviews' && <ReviewHub userRole={contextRole as any} />}
        {activeTab === 'governance' && <TenantGovernance />}
        {activeTab === 'tenant-admin' && <TenantAdministration />}
        {activeTab === 'growth' && <MonetizationStrategy />}
        {activeTab === 'backlog' && <EngineeringBacklog />}
        {activeTab === 'client' && <ClientPortal />}
        {activeTab === 'predictive' && <PredictiveOps mode={mode} />}
        {activeTab === 'workflow' && <MatterWorkflow />}
        {activeTab === 'conflict-check' && <ZkConflictSearch />}

        {activeTab === 'vault' && (
          selectedMatter ? (
            <MatterIntelligence mode={mode} onBack={() => setSelectedMatter(null)} documents={documents} />
          ) : (
            <div className="space-y-8">
              <DocumentVault documents={documents} onAddDocument={handleAddDocument} onRemoveDocument={handleRemoveDocument} />
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
        {activeTab === 'tenant-settings' && <TenantSettings mode={mode} killSwitchActive={killSwitchActive} setKillSwitchActive={setKillSwitchActive} />}
        {activeTab === 'system-settings' && <GlobalSettings />}
      </div>

      {showMatterModal && <MatterCreationModal mode={mode} userId={userId} tenantId={tenantId} onClose={() => setShowMatterModal(false)} onCreated={handleCreateMatter} />}
    </Layout>
  );
};

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: any;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: any): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-8 text-white text-center">
          <ShieldAlert className="text-red-500 w-16 h-16 mb-6" />
          <h1 className="text-3xl font-bold mb-4">Sovereign Protocol Halted</h1>
          <p className="text-slate-400 max-w-lg mx-auto mb-8">
            An unrecoverable error occurred in the enclave governance layer.
            This has been logged to the forensic ledger.
          </p>
          <div className="bg-slate-900 p-6 rounded-xl border border-red-500/20 text-left w-full max-w-2xl overflow-auto max-h-64">
            <p className="text-red-400 font-mono text-xs whitespace-pre-wrap">
              {this.state.error?.toString()}
            </p>
          </div>
          <button
            onClick={() => window.location.href = '/'}
            className="mt-8 px-6 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl font-bold transition-all border border-red-500/20"
          >
            Re-Initialize Session
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function WrappedApp() {
  return (
    <PermissionProvider>
      <ErrorBoundary>
        <AppContent />
      </ErrorBoundary>
    </PermissionProvider>
  );
}
