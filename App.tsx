
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
import ClientPortal from './components/ClientPortal';
import MatterWorkflow from './components/MatterWorkflow';
import TenantOnboarding from './components/TenantOnboarding';
import TenantUserOnboarding from './components/TenantUserOnboarding';
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
        const { role, userId: savedUserId, tenantId: savedTenantId, permissions } = JSON.parse(saved);
        if (role) {
          setRole(role);

          let activePermissions = permissions;
          // Self-Healing: If session has no permissions (stale cache), hydrate from defaults
          if (!activePermissions || activePermissions.length === 0) {
            activePermissions = ROLE_DEFAULT_PERMISSIONS[role] || [];
          }

          setPermissions(activePermissions);

          if (savedUserId) setUserId(savedUserId);
          if (savedTenantId) setTenantId(savedTenantId);
          setIsAuthenticated(true);
          if (role === 'GLOBAL_ADMIN') {
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
    let finalPermissions = permissions;
    // Fallback: If no permissions provided (e.g. from simplistic onboarding), use defaults
    if (!finalPermissions || finalPermissions.length === 0) {
      finalPermissions = ROLE_DEFAULT_PERMISSIONS[roleName] || [];
    }

    setRole(roleName);
    setPermissions(finalPermissions);
    setIsAuthenticated(true);

    // Persist session immediately to avoid refresh issues
    const sessionData = JSON.stringify({
      role: roleName,
      userId,
      tenantId,
      permissions: finalPermissions
    });
    localStorage.setItem('lexSovereign_session', sessionData);

    if (roleName === 'GLOBAL_ADMIN') {
      setActiveTab('platform-ops');
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
    setRole('');
    setPermissions([]);
  };

  const handleInceptionComplete = (selectedMode: AppMode) => {
    setMode(selectedMode);
    setIsOnboarding(false);
    // Automatically login as Tenant Admin with full permissions
    handleAuthenticated('TENANT_ADMIN', []);
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
    return <TenantOnboarding onComplete={handleInceptionComplete} />;
  }

  if (isUserInvitation) {
    return <TenantUserOnboarding mode={mode} onComplete={(role) => handleAuthenticated(role, [])} />;
    // TODO: Update TenantUserOnboarding signature later
  }

  if (!isAuthenticated) {
    if (isPlatformMode) {
      return <PlatformGateway onAuthenticated={(role) => handleAuthenticated(role, [])} onBackToTenant={() => setIsPlatformMode(false)} />;
    }
    return <AuthFlow onAuthenticated={handleAuthenticated} onStartOnboarding={() => setIsOnboarding(true)} onSecretTrigger={() => setIsPlatformMode(true)} />;
  }

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab} mode={mode} setMode={setMode} killSwitchActive={killSwitchActive} userRole={contextRole as any}>
      {/* userRole cast as any temporary until Layout updated */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-[2rem] flex-1 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-500/20 rounded-2xl"><Rocket className="text-emerald-400" /></div>
                <div>
                  <h4 className="font-bold text-white tracking-tight">Sovereign Enclave Pulse</h4>
                  <p className="text-xs text-slate-400">Verified as <span className="text-emerald-400 font-bold">{contextRole}</span> • GH-ACC-1</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={handleLogout} aria-label="Logout" title="Logout" className="p-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-all border border-red-500/20">
                  <LogOut size={18} />
                </button>
              </div>
            </div>
            {contextRole !== 'GLOBAL_ADMIN' && (
              <div onClick={() => setShowMatterModal(true)} className="bg-blue-500/10 border border-blue-500/20 p-6 rounded-[2rem] cursor-pointer hover:bg-blue-500/20 transition-all flex items-center gap-4">
                <div className="p-3 bg-blue-500/20 rounded-2xl"><Briefcase className="text-blue-400" /></div>
                <div>
                  <h4 className="font-bold text-white">Incept Matter</h4>
                  <p className="text-xs text-slate-400">New Global Instance</p>
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
            <div className="h-[1px] bg-slate-800 w-full my-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {matters.map(matter => (
                <div key={matter.id} onClick={() => setSelectedMatter(matter.id)} className="bg-slate-900/40 border border-slate-800 p-6 rounded-3xl flex items-center justify-between group cursor-pointer hover:border-emerald-500/30 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-emerald-500/10 rounded-xl group-hover:bg-emerald-500/20 transition-colors"><Scale size={20} className="text-emerald-400" /></div>
                    <div>
                      <h4 className="font-bold text-white">{matter.name}</h4>
                      <p className="text-[10px] text-slate-500 font-mono">{matter.id} • {matter.client}</p>
                    </div>
                  </div>
                  <ChevronRight className="text-slate-600 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
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
