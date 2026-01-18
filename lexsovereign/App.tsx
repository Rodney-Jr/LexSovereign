
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import DocumentVault from './components/DocumentVault';
import LegalChat from './components/LegalChat';
import ArchitectureMap from './components/ArchitectureMap';
import OmnichannelPreview from './components/OmnichannelPreview';
import Settings from './components/Settings';
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
import { INITIAL_RULES, INITIAL_DOCS } from './constants';
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

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isPlatformMode, setIsPlatformMode] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mode, setMode] = useState<AppMode>(AppMode.LAW_FIRM);
  const [userRole, setUserRole] = useState<UserRole>(UserRole.TENANT_ADMIN);
  const [killSwitchActive, setKillSwitchActive] = useState(false);
  const [rules, setRules] = useState<RegulatoryRule[]>(INITIAL_RULES);
  const [documents, setDocuments] = useState<DocumentMetadata[]>(INITIAL_DOCS);
  const [matters, setMatters] = useState<Matter[]>(INITIAL_MATTERS);
  const [selectedMatter, setSelectedMatter] = useState<string | null>(null);
  const [isOnboarding, setIsOnboarding] = useState(false);
  const [isUserInvitation, setIsUserInvitation] = useState(false);
  const [showMatterModal, setShowMatterModal] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('lexSovereign_session');
    if (saved) {
      try {
        const { role } = JSON.parse(saved);
        if (role) {
          setUserRole(role);
          setIsAuthenticated(true);
          if (role === UserRole.GLOBAL_ADMIN) {
             setActiveTab('platform-ops');
          }
        }
      } catch (e) {
        localStorage.removeItem('lexSovereign_session');
      }
    }
  }, []);

  const handleAuthenticated = (role: UserRole) => {
    setUserRole(role);
    setIsAuthenticated(true);
    if (role === UserRole.GLOBAL_ADMIN) {
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
  };

  const handleInceptionComplete = (selectedMode: AppMode) => {
    setMode(selectedMode);
    setIsOnboarding(false);
    setIsAuthenticated(true);
    setUserRole(UserRole.TENANT_ADMIN);
  };

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
    return <TenantUserOnboarding mode={mode} onComplete={handleAuthenticated} />;
  }

  if (!isAuthenticated) {
    if (isPlatformMode) {
      return <PlatformGateway onAuthenticated={handleAuthenticated} onBackToTenant={() => setIsPlatformMode(false)} />;
    }
    return <AuthFlow onAuthenticated={handleAuthenticated} onStartOnboarding={() => setIsOnboarding(true)} onSecretTrigger={() => setIsPlatformMode(true)} />;
  }

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab} mode={mode} setMode={setMode} killSwitchActive={killSwitchActive}>
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-4">
             <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-[2rem] flex-1 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-emerald-500/20 rounded-2xl"><Rocket className="text-emerald-400" /></div>
                  <div>
                    <h4 className="font-bold text-white tracking-tight">Sovereign Enclave Pulse</h4>
                    <p className="text-xs text-slate-400">Verified as <span className="text-emerald-400 font-bold">{userRole}</span> • GH-ACC-1</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={handleLogout} className="p-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-all border border-red-500/20">
                    <LogOut size={18} />
                  </button>
                </div>
             </div>
             {userRole !== UserRole.GLOBAL_ADMIN && (
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
      {activeTab === 'identity' && <AccessGovernance userRole={userRole} setUserRole={setUserRole} />}
      {activeTab === 'reviews' && <ReviewHub userRole={userRole} />}
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
      {activeTab === 'settings' && <Settings mode={mode} killSwitchActive={killSwitchActive} setKillSwitchActive={setKillSwitchActive} />}

      {showMatterModal && <MatterCreationModal mode={mode} onClose={() => setShowMatterModal(false)} onCreated={handleCreateMatter} />}
    </Layout>
  );
};

export default App;
