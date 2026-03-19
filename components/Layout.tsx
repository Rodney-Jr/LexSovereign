import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Briefcase,
  Gavel,
  ShieldCheck,
  LayoutDashboard,
  FileLock,
  Scale,
  Settings,
  MessageSquare,
  Activity,
  UserCheck,
  Building2,
  Lock,
  Globe,
  Target,
  Bug,
  ShieldAlert,
  Fingerprint,
  Box,
  BrainCircuit,
  LayoutGrid,
  User,
  Zap,
  Key,
  Database,
  Users,
  UserPlus,
  TrendingUp,
  Coins,
  ClipboardList,
  Monitor,
  GitBranch,
  Plug,
  Search,
  Cloud,
  Sparkles,
  ShoppingBag,
  Menu,
  X,
  FileCheck,
  Layout as LayoutIcon,
  FileText,
  ArrowDownToLine,
  Plus,
  CheckCircle2,
  Command,
  FileSignature,
  MonitorSmartphone,
  Banknote,
  Award,
  TrendingDown
} from 'lucide-react';
import { AppMode, UserRole } from '../types';
import { usePermissions } from '../hooks/usePermissions';
import { TAB_REQUIRED_PERMISSIONS } from '../constants';
import { useSovereign } from '../contexts/SovereignContext';



import CommandPalette from './CommandPalette';
import SovereignStaffDossierModal from './SovereignStaffDossierModal';
import ResizablePanel from './ResizablePanel';
import Breadcrumbs from './Breadcrumbs';
import MatterCreationModal from './MatterCreationModal';
import LeaveApplicationModal from './LeaveApplicationModal';
import TrialExpirationModal from './TrialExpirationModal';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  killSwitchActive: boolean;
  userRole: UserRole;
  userName?: string | null;
  theme: 'midnight' | 'gold' | 'cyber' | 'light';
  setTheme: (theme: 'midnight' | 'gold' | 'cyber' | 'light') => void;
  userId?: string | null;
  // Global Modal Props
  showMatterModal?: boolean;
  setShowMatterModal?: (show: boolean) => void;
  showLeaveModal?: boolean;
  setShowLeaveModal?: (show: boolean) => void;
  trialExpiredData?: { expiresAt?: string } | null;
  setTrialExpiredData?: (data: { expiresAt?: string } | null) => void;
  onMatterCreated?: (matter: any) => void;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  activeTab,
  setActiveTab,
  mode,
  setMode,
  killSwitchActive,
  userRole,
  userName,
  theme,
  setTheme,
  userId,
  showMatterModal = false,
  setShowMatterModal = () => { },
  showLeaveModal = false,
  setShowLeaveModal = () => { },
  trialExpiredData = null,
  setTrialExpiredData = () => { },
  onMatterCreated = () => { }
}) => {
  const { hasAnyPermission, role, canAccessTab } = usePermissions();
  const { session } = useSovereign();
  const [isPaletteOpen, setIsPaletteOpen] = React.useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [showMyDossierModal, setShowMyDossierModal] = React.useState(false);


  React.useEffect(() => {
    const handleGlobalKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalKey);
    return () => window.removeEventListener('keydown', handleGlobalKey);
  }, []);

  const isAllowed = (tab: string) => {
    const baseAllowed = canAccessTab(tab);
    if (!baseAllowed) return false;
    
    // UI Visibility Override
    if (session?.allowedNavItems !== null && session?.allowedNavItems !== undefined) {
      return session.allowedNavItems.includes(tab);
    }
    
    return true;
  };
  return (
    <div 
      className={`flex h-screen bg-brand-bg text-brand-text overflow-hidden transition-colors duration-500 theme-${theme}`}
    >
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] lg:hidden animate-in fade-in duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <ResizablePanel
        id="main-sidebar"
        direction="horizontal"
        initialSize={256}
        minSize={240}
        maxSize={480}
        collapseThreshold={120}
        className={`fixed inset-y-0 left-0 z-[100] lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="p-6 flex items-center justify-between">
          <a href={import.meta.env.VITE_MARKETING_URL || 'https://nomosdesk.com'} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="bg-emerald-500/20 p-2 rounded-lg">
              <ShieldCheck className="text-emerald-400 w-6 h-6" />
            </div>
            <span className="font-bold text-xl tracking-tight text-white">NomosDesk</span>
          </a>
          <button
            className="lg:hidden p-2 hover:bg-white/5 rounded-lg text-brand-muted"
            onClick={() => setIsSidebarOpen(false)}
            title="Close Sidebar"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-1.5 mt-4 overflow-y-auto scrollbar-hide">
          {/* CLIENT PORTAL VIEW */}
          {userRole === UserRole.CLIENT ? (
            <NavItem
              icon={<LayoutDashboard size={18} />}
              label="Client Portal"
              isActive={activeTab === 'client-portal'}
              onClick={() => setActiveTab('client-portal')}
              setIsSidebarOpen={setIsSidebarOpen}
            />
          ) : (
            <>
              {/* Intelligence Hub - Public/Common */}
              {isAllowed('dashboard') && (
                <NavItem
                  icon={<LayoutDashboard size={18} />}
                  label="Intelligence Hub"
                  isActive={activeTab === 'dashboard'}
                  onClick={() => setActiveTab('dashboard')}
                  setIsSidebarOpen={setIsSidebarOpen}
                />
              )}

              {/* Platform Owner Section */}
              {(isAllowed('platform-ops') || isAllowed('global-governance')) && (
                <div className="pt-4 pb-2 px-4 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-brand-muted uppercase tracking-[0.2em]">Platform Owner</span>
                </div>
              )}
              {isAllowed('platform-ops') && (
                <NavItem
                  icon={<Globe size={18} className="text-brand-secondary" />}
                  label="Global Plane"
                  isActive={activeTab === 'platform-ops'}
                  onClick={() => setActiveTab('platform-ops')}
                  setIsSidebarOpen={setIsSidebarOpen}
                />
              )}
              {isAllowed('global-governance') && (
                <NavItem
                  icon={<LayoutGrid size={18} />}
                  label="Global Governance"
                  isActive={activeTab === 'global-governance'}
                  onClick={() => setActiveTab('global-governance')}
                  setIsSidebarOpen={setIsSidebarOpen}
                />
              )}


              {/* Firm Management Section */}
              {(isAllowed('identity') || isAllowed('tenant-admin') || isAllowed('capacity') || isAllowed('tenant-governance') || isAllowed('hr-workbench') || isAllowed('expense-tracker') || isAllowed('asset-tracker')) && (
                <div className="pt-4 pb-2 px-4">
                  <span className="text-[10px] font-bold text-brand-muted uppercase tracking-[0.2em]">Firm Management</span>
                </div>
              )}

              {/* Capacity - Promoted to top of Firm Mgmt */}
              {isAllowed('capacity') && (
                <NavItem
                  icon={<Activity size={18} className="text-brand-secondary" />}
                  label="Workload & Capacity"
                  isActive={activeTab === 'capacity'}
                  onClick={() => setActiveTab('capacity')}
                  setIsSidebarOpen={setIsSidebarOpen}
                />
              )}

              {isAllowed('clients') && (
                <NavItem
                  icon={<Users size={18} className="text-brand-primary" />}
                  label="Client Directory"
                  isActive={activeTab === 'clients'}
                  onClick={() => setActiveTab('clients')}
                  setIsSidebarOpen={setIsSidebarOpen}
                />
              )}

              {isAllowed('identity') && (
                <NavItem
                  icon={<Fingerprint size={18} />}
                  label="User Management"
                  isActive={activeTab === 'identity'}
                  onClick={() => setActiveTab('identity')}
                  setIsSidebarOpen={setIsSidebarOpen}
                />
              )}
              {isAllowed('hr-workbench') && (
                <NavItem
                  icon={<Users size={18} className="text-blue-400" />}
                  label="HR Workbench"
                  isActive={activeTab === 'hr-workbench'}
                  onClick={() => setActiveTab('hr-workbench')}
                  setIsSidebarOpen={setIsSidebarOpen}
                />
              )}



              {isAllowed('expense-tracker') && (
                <NavItem
                  icon={<Coins size={18} className="text-orange-400" />}
                  label="Expense Tracker"
                  isActive={activeTab === 'expense-tracker'}
                  onClick={() => setActiveTab('expense-tracker')}
                  setIsSidebarOpen={setIsSidebarOpen}
                />
              )}
              {isAllowed('asset-tracker') && (
                <NavItem
                  icon={<MonitorSmartphone size={18} className="text-blue-400" />}
                  label="Asset Manager"
                  isActive={activeTab === 'asset-tracker'}
                  onClick={() => setActiveTab('asset-tracker')}
                  setIsSidebarOpen={setIsSidebarOpen}
                />
              )}

              {isAllowed('org-blueprint') && (
                <NavItem
                  icon={<GitBranch size={18} />}
                  label="Organization Blueprint"
                  isActive={activeTab === 'org-blueprint'}
                  onClick={() => setActiveTab('org-blueprint')}
                  setIsSidebarOpen={setIsSidebarOpen}
                />
              )}

              {/* Operations Section */}
              {(isAllowed('conflict-check') || isAllowed('reviews') || isAllowed('workflow') || isAllowed('vault') || isAllowed('chat')) && (
                <div className="pt-4 pb-2 px-4">
                  <span className="text-[10px] font-bold text-brand-muted uppercase tracking-[0.2em]">Operations</span>
                </div>
              )}
              {isAllowed('conflict-check') && (
                <NavItem
                  icon={<Search size={18} className="text-brand-secondary" />}
                  label="ZK Conflict Check"
                  isActive={activeTab === 'conflict-check'}
                  onClick={() => setActiveTab('conflict-check')}
                  setIsSidebarOpen={setIsSidebarOpen}
                />
              )}
              {isAllowed('reviews') && (
                <NavItem
                  icon={<Scale size={18} />}
                  label="Review Hub"
                  isActive={activeTab === 'reviews'}
                  onClick={() => setActiveTab('reviews')}
                  setIsSidebarOpen={setIsSidebarOpen}
                />
              )}
              {isAllowed('sentinel') && (
                <NavItem
                  icon={<ShieldAlert size={18} className="text-brand-primary" />}
                  label="Ghana Sentinel"
                  isActive={activeTab === 'sentinel'}
                  onClick={() => setActiveTab('sentinel')}
                  setIsSidebarOpen={setIsSidebarOpen}
                />
              )}
              {isAllowed('marketplace') && (
                <NavItem
                  icon={<ShoppingBag size={18} className="text-brand-primary" />}
                  label="Sovereign Marketplace"
                  isActive={activeTab === 'marketplace'}
                  onClick={() => setActiveTab('marketplace')}
                  setIsSidebarOpen={setIsSidebarOpen}
                />
              )}
              {isAllowed('workflow') && (
                <NavItem
                  icon={<Zap size={18} />}
                  label="Workflow Engine"
                  isActive={activeTab === 'workflow'}
                  onClick={() => setActiveTab('workflow')}
                  setIsSidebarOpen={setIsSidebarOpen}
                />
              )}
              {isAllowed('drafting') && (
                <NavItem
                  icon={<Sparkles size={18} className="text-brand-secondary" />}
                  label="Legal Drafting"
                  isActive={activeTab === 'drafting'}
                  onClick={() => setActiveTab('drafting')}
                  setIsSidebarOpen={setIsSidebarOpen}
                />
              )}
              {isAllowed('analysis') && (
                <NavItem
                  icon={<BrainCircuit size={18} className="text-brand-secondary" />}
                  label="Legal Analysis"
                  isActive={activeTab === 'analysis'}
                  onClick={() => setActiveTab('analysis')}
                  setIsSidebarOpen={setIsSidebarOpen}
                />
              )}
              {isAllowed('vault') && (
                <NavItem
                  icon={<FileLock size={18} />}
                  label="Sovereign Vault"
                  isActive={activeTab === 'vault'}
                  onClick={() => setActiveTab('vault')}
                  setIsSidebarOpen={setIsSidebarOpen}
                />
              )}
              {isAllowed('clm-center') && (
                <NavItem
                  icon={<FileCheck size={18} className="text-emerald-400" />}
                  label="CLM Operations"
                  isActive={activeTab === 'clm-center'}
                  onClick={() => setActiveTab('clm-center')}
                  setIsSidebarOpen={setIsSidebarOpen}
                />
              )}
              {isAllowed('case-center') && (
                <NavItem
                  icon={<Gavel size={18} className="text-sky-400" />}
                  label="Case Management"
                  isActive={activeTab === 'case-center'}
                  onClick={() => setActiveTab('case-center')}
                  setIsSidebarOpen={setIsSidebarOpen}
                />
              )}
              {isAllowed('analytics') && (
                <NavItem
                  icon={<Activity size={18} className="text-brand-secondary" />}
                  label="Analytics"
                  isActive={activeTab === 'analytics'}
                  onClick={() => setActiveTab('analytics')}
                  setIsSidebarOpen={setIsSidebarOpen}
                />
              )}
              {isAllowed('tenant-governance') && (
                <NavItem
                  icon={<ShieldCheck size={18} className="text-amber-500" />}
                  label="Firm Governance"
                  isActive={activeTab === 'tenant-governance'}
                  onClick={() => setActiveTab('tenant-governance')}
                  setIsSidebarOpen={setIsSidebarOpen}
                />
              )}
              {isAllowed('chat') && (
                <NavItem
                  icon={<MessageSquare size={18} />}
                  label="Legal Chat"
                  isActive={activeTab === 'chat'}
                  onClick={() => setActiveTab('chat')}
                  setIsSidebarOpen={setIsSidebarOpen}
                />
              )}

              {/* Financial Management Section */}
              {(isAllowed('billing') || isAllowed('growth') || isAllowed('accounting-hub')) && (
                <div className="pt-4 pb-2 px-4 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-brand-muted uppercase tracking-[0.2em]">Financial Management</span>
                </div>
              )}
              {isAllowed('billing') && (
                <NavItem
                  icon={<Coins size={18} className="text-emerald-400" />}
                  label="Sovereign Billing"
                  isActive={activeTab === 'billing'}
                  onClick={() => setActiveTab('billing')}
                  setIsSidebarOpen={setIsSidebarOpen}
                />
              )}
              {isAllowed('accounting-hub') && (
                <NavItem
                  icon={<Banknote size={18} className="text-blue-400" />}
                  label="Sovereign Accounting"
                  isActive={activeTab === 'accounting-hub'}
                  onClick={() => setActiveTab('accounting-hub')}
                  setIsSidebarOpen={setIsSidebarOpen}
                />
              )}
              {isAllowed('growth') && (
                <NavItem
                  icon={<TrendingUp size={18} className="text-brand-secondary" />}
                  label="Business Growth"
                  isActive={activeTab === 'growth'}
                  onClick={() => setActiveTab('growth')}
                  setIsSidebarOpen={setIsSidebarOpen}
                />
              )}

              {/* Enterprise Tier Section */}
              {(isAllowed('enclave') || isAllowed('audit')) && (
                <div className="pt-4 pb-2 px-4 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-brand-muted uppercase tracking-[0.2em]">Enterprise Tier</span>
                </div>
              )}

              {isAllowed('audit') && (
                <NavItem
                  icon={<Activity size={18} />}
                  label="Forensic Traces"
                  isActive={activeTab === 'audit'}
                  onClick={() => setActiveTab('audit')}
                  setIsSidebarOpen={setIsSidebarOpen}
                />
              )}

              {/* System Section */}
              {(isAllowed('status') || isAllowed('system-settings') || isAllowed('tenant-settings')) && (
                <div className="pt-4 pb-2 px-4">
                  <span className="text-[10px] font-bold text-brand-muted uppercase tracking-[0.2em]">System</span>
                </div>
              )}
              {isAllowed('status') && (
                <NavItem
                  icon={<Target size={18} />}
                  label="Project Roadmap"
                  isActive={activeTab === 'status'}
                  onClick={() => setActiveTab('status')}
                  setIsSidebarOpen={setIsSidebarOpen}
                />
              )}
              {isAllowed('system-settings') && (
                <NavItem
                  icon={<Globe size={18} className="text-brand-secondary" />}
                  label="Infrastructure Plane"
                  isActive={activeTab === 'system-settings'}
                  onClick={() => setActiveTab('system-settings')}
                  setIsSidebarOpen={setIsSidebarOpen}
                />
              )}
              {isAllowed('tenant-settings') && (
                <NavItem
                  icon={<Settings size={18} />}
                  label="Tenant Settings"
                  isActive={activeTab === 'tenant-settings'}
                  onClick={() => setActiveTab('tenant-settings')}
                  setIsSidebarOpen={setIsSidebarOpen}
                />
              )}

              <div className="h-[1px] bg-brand-border/50 mx-4 my-2 opacity-30" />
              <NavItem
                icon={<Fingerprint size={18} />}
                label="Sovereign Profile"
                isActive={activeTab === 'dossier'}
                onClick={() => setActiveTab('dossier')}
                setIsSidebarOpen={setIsSidebarOpen}
              />

            </>
          )}
        </nav>

        <div className="p-4 border-t border-brand-border space-y-4">
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-brand-muted uppercase tracking-[0.2em] ml-1">Appearance</span>
            <div className="flex flex-wrap gap-2 p-1 bg-brand-bg/50 rounded-xl border border-brand-border">
              {['midnight', 'gold', 'cyber', 'light'].map((t) => (
                <button
                  key={t}
                  onClick={() => setTheme(t as any)}
                  title={`${t.charAt(0).toUpperCase() + t.slice(1)} Theme`}
                  className={`w-8 h-8 rounded-lg border-2 transition-all theme-swatch-${t} ${theme === t ? 'border-brand-primary scale-110 shadow-lg shadow-brand-primary/20' : 'border-transparent opacity-50 hover:opacity-100'
                    }`}
                />
              ))}
            </div>
          </div>

          {role === 'GLOBAL_ADMIN' ? (
            <div className="flex items-center gap-2 p-2 bg-brand-bg/50 rounded-lg border border-brand-border">
              {mode === AppMode.LAW_FIRM ? <Scale className="text-brand-secondary" size={18} /> : <Building2 className="text-purple-400" size={18} />}
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value as AppMode)}
                className="bg-transparent text-sm focus:outline-none w-full cursor-pointer font-medium text-brand-text"
                aria-label="Select App Mode"
              >
                <option value={AppMode.LAW_FIRM} className="bg-brand-bg">Law Firm Mode</option>
                <option value={AppMode.ENTERPRISE} className="bg-brand-bg">Enterprise Mode</option>
              </select>
            </div>
          ) : (
            <div className="flex items-center gap-2 p-3 bg-brand-bg/30 rounded-xl border border-brand-border/50 opacity-60">
              {mode === AppMode.LAW_FIRM ? <Scale size={16} className="text-brand-secondary" /> : <Building2 size={16} className="text-purple-400" />}
              <span className="text-[10px] font-bold uppercase tracking-widest text-brand-text">
                {mode === AppMode.LAW_FIRM ? 'Law Firm Instance' : 'Enterprise Instance'}
              </span>
            </div>
          )}

              <div className="flex items-center justify-between p-2 bg-brand-bg/50 rounded-lg border border-brand-border cursor-pointer hover:bg-brand-bg/80 transition-all font-mono" onClick={() => setActiveTab('audit')}>
                <div className="flex items-center gap-2">
                  <Fingerprint size={16} className="text-brand-muted" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-brand-muted">System Integrity Scan</span>
                </div>
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              </div>

          {killSwitchActive && (
            <div className="flex items-center gap-2 p-2 bg-red-500/10 text-red-400 rounded-lg animate-pulse border border-red-500/20">
              <Lock size={18} />
              <span className="text-[10px] font-bold uppercase tracking-tight">Logical Lock Active</span>
            </div>
          )}
        </div>
      </ResizablePanel>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative w-full">
        <header className="h-16 border-b border-brand-border bg-brand-sidebar flex items-center justify-between px-4 lg:px-8 backdrop-blur-md sticky top-0 z-20 transition-all duration-500">
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden p-2 hover:bg-white/5 rounded-lg text-brand-muted"
              onClick={() => setIsSidebarOpen(true)}
              title="Open Sidebar"
            >
              <Menu size={24} />
            </button>
            <div className="flex flex-col gap-0.5 max-w-[150px] sm:max-w-[300px] lg:max-w-none">
              <Breadcrumbs />
            </div>
          </div>
          <div className="flex items-center gap-3 lg:gap-4">
            <button
               onClick={() => setIsPaletteOpen(true)}
               className="hidden sm:flex items-center gap-2 p-2 px-3 bg-brand-sidebar border border-transparent hover:border-brand-primary/40 hover:bg-brand-primary/5 rounded-xl text-brand-muted hover:text-brand-primary transition-all group"
               title="Global Sovereign Search (Ctrl+K)"
            >
               <Search size={16} className="group-hover:scale-110 transition-transform" />
               <span className="text-[10px] font-bold uppercase tracking-widest hidden lg:inline">Search</span>
               <kbd className="text-[10px] bg-brand-bg px-1 rounded border border-brand-border/50 opacity-40 group-hover:opacity-100 transition-opacity">⌘K</kbd>
            </button>
            {userName && (
              <div
                onClick={() => setShowMyDossierModal(true)}
                className="flex items-center gap-2 px-3 py-1.5 bg-brand-sidebar border border-brand-border rounded-xl cursor-pointer hover:border-brand-primary/40 group transition-all"
              >
                <div className="p-1 bg-brand-primary/10 rounded-lg group-hover:bg-brand-primary/20 transition-colors">
                  <User size={14} className="text-brand-primary" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-brand-text truncate max-w-[120px]">{userName}</span>
                  <span className="text-[8px] text-brand-muted uppercase font-bold tracking-tighter group-hover:text-brand-primary transition-colors">Open My Dossier</span>
                </div>
              </div>
            )}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-brand-primary/10 rounded-full border border-brand-primary/20">
              <ShieldCheck size={14} className="text-brand-primary" />
              <span className="text-[10px] font-bold text-brand-primary uppercase tracking-widest leading-none">Protocol Secured</span>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto bg-brand-bg p-4 lg:p-8 scroll-smooth transition-colors duration-500">
          {children}
        </div>
      </main>

      {isPaletteOpen && (
        <CommandPalette
          onClose={() => setIsPaletteOpen(false)}
          onNavigate={(tab) => {
            setActiveTab(tab);
            setIsPaletteOpen(false);
            if (typeof setIsSidebarOpen === 'function') {
              setIsSidebarOpen(false);
            }
          }}
        />
      )}

      {showMyDossierModal && userId && (
        <SovereignStaffDossierModal
          isSelfService
          staff={{
            id: userId,
            name: userName || 'User',
            role: role || 'Practitioner',
            department: 'Operations',
            email: '',
            phone: '',
            startDate: '',
            status: 'Active',
            annualLeaveTotal: 25,
            annualLeaveUsed: 0,
            sickDaysUsed: 0,
            cleRequired: 12,
            cleEarned: 0,
            salary: 0,
            bankAccount: '',
            hardware: [],
            appraisals: []
          }}
          onClose={() => setShowMyDossierModal(false)}
          onUpdateStatus={() => { }} // Not used in self-service
        />
      )}
      {showMatterModal && session && (
        <MatterCreationModal
          mode={session.mode || AppMode.LAW_FIRM}
          userId={session.userId || ''}
          tenantId={session.tenantId || ''}
          onClose={() => setShowMatterModal(false)}
          onCreated={(matter) => {
            if (onMatterCreated) onMatterCreated(matter);
            setShowMatterModal(false);
          }}
        />
      )}

      {showLeaveModal && (
        <LeaveApplicationModal isOpen={showLeaveModal} onClose={() => setShowLeaveModal(false)} />
      )}

      {!!trialExpiredData && (
        <TrialExpirationModal
          expiresAt={trialExpiredData?.expiresAt}
        />
      )}
    </div>
  );
};

const NavItem = ({ icon, label, isActive, onClick, disabled, isPremium, setIsSidebarOpen }: { icon: React.ReactNode, label: string, isActive: boolean, onClick: () => void, disabled?: boolean, isPremium?: boolean, setIsSidebarOpen?: (open: boolean) => void }) => (
  <button
    onClick={() => { onClick(); if (setIsSidebarOpen) setIsSidebarOpen(false); }}
    disabled={disabled}
    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 relative ${isActive
      ? 'bg-brand-primary/10 text-brand-primary border border-brand-primary/20 shadow-[0_0_12px_-4px_rgba(16,185,129,0.4)]'
      : 'text-brand-muted hover:bg-brand-sidebar hover:text-brand-text'
      } ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
  >
    {icon}
    <span className="text-sm font-medium">{label}</span>
    {isPremium && (
      <div className="absolute right-3 top-1/2 -translate-y-1/2 bg-amber-500/10 p-1 rounded-md border border-amber-500/20">
        <Zap size={10} className="text-amber-500" fill="currentColor" />
      </div>
    )}
  </button>
);

export default Layout;
