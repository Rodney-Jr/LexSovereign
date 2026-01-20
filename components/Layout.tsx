
import React from 'react';
import {
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
  TrendingUp,
  Coins,
  ClipboardList,
  Monitor,
  GitBranch,
  Plug,
  Search,
  // Added missing Cloud icon
  Cloud
} from 'lucide-react';
import { AppMode, UserRole } from '../types';
import { TAB_PERMISSIONS } from '../constants';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  killSwitchActive: boolean;
  userRole: UserRole;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  activeTab,
  setActiveTab,
  mode,
  setMode,
  killSwitchActive,
  userRole
}) => {
  const isAllowed = (tab: string) => {
    return TAB_PERMISSIONS[tab]?.includes(userRole) ?? false;
  };
  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-800 bg-slate-900/50 flex flex-col shadow-2xl">
        <div className="p-6 flex items-center gap-3">
          <div className="bg-emerald-500/20 p-2 rounded-lg">
            <ShieldCheck className="text-emerald-400 w-6 h-6" />
          </div>
          <span className="font-bold text-xl tracking-tight text-white">LexSovereign</span>
        </div>

        <nav className="flex-1 px-4 space-y-1.5 mt-4 overflow-y-auto scrollbar-hide">
          {/* Intelligence Hub - Public/Common */}
          {isAllowed('dashboard') && (
            <NavItem
              icon={<LayoutDashboard size={18} />}
              label="Intelligence Hub"
              isActive={activeTab === 'dashboard'}
              onClick={() => setActiveTab('dashboard')}
            />
          )}

          {/* Platform Owner Section */}
          {(isAllowed('platform-ops') || isAllowed('governance')) && (
            <div className="pt-4 pb-2 px-4 flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em]">Platform Owner</span>
              <Monitor size={10} className="text-cyan-500" />
            </div>
          )}
          {isAllowed('platform-ops') && (
            <NavItem
              icon={<Globe size={18} className="text-cyan-400" />}
              label="Global Plane"
              isActive={activeTab === 'platform-ops'}
              onClick={() => setActiveTab('platform-ops')}
            />
          )}
          {isAllowed('governance') && (
            <NavItem
              icon={<LayoutGrid size={18} />}
              label="Tenant Governance"
              isActive={activeTab === 'governance'}
              onClick={() => setActiveTab('governance')}
            />
          )}

          {/* Management Section */}
          {(isAllowed('org-blueprint') || isAllowed('integration-bridge') || isAllowed('tenant-admin') || isAllowed('identity') || isAllowed('backlog')) && (
            <div className="pt-4 pb-2 px-4 flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em]">Management</span>
            </div>
          )}
          {isAllowed('org-blueprint') && (
            <NavItem
              icon={<GitBranch size={18} className="text-blue-400" />}
              label="Firm Blueprint"
              isActive={activeTab === 'org-blueprint'}
              onClick={() => setActiveTab('org-blueprint')}
            />
          )}
          {isAllowed('integration-bridge') && (
            <NavItem
              icon={<Plug size={18} className="text-emerald-400" />}
              label="Bridge Registry"
              isActive={activeTab === 'integration-bridge'}
              onClick={() => setActiveTab('integration-bridge')}
            />
          )}
          {isAllowed('tenant-admin') && (
            <NavItem
              icon={<Building2 size={18} />}
              label="Tenant Admin"
              isActive={activeTab === 'tenant-admin'}
              onClick={() => setActiveTab('tenant-admin')}
            />
          )}
          {isAllowed('identity') && (
            <NavItem
              icon={<Key size={18} />}
              label="Access Governance"
              isActive={activeTab === 'identity'}
              onClick={() => setActiveTab('identity')}
            />
          )}
          {isAllowed('backlog') && (
            <NavItem
              icon={<ClipboardList size={18} />}
              label="Eng Backlog"
              isActive={activeTab === 'backlog'}
              onClick={() => setActiveTab('backlog')}
            />
          )}

          {/* Operations Section */}
          {(isAllowed('conflict-check') || isAllowed('reviews') || isAllowed('workflow') || isAllowed('vault') || isAllowed('chat')) && (
            <div className="pt-4 pb-2 px-4">
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em]">Operations</span>
            </div>
          )}
          {isAllowed('conflict-check') && (
            <NavItem
              icon={<Search size={18} className="text-blue-400" />}
              label="ZK Conflict Check"
              isActive={activeTab === 'conflict-check'}
              onClick={() => setActiveTab('conflict-check')}
            />
          )}
          {isAllowed('reviews') && (
            <NavItem
              icon={<Scale size={18} />}
              label="Review Hub"
              isActive={activeTab === 'reviews'}
              onClick={() => setActiveTab('reviews')}
            />
          )}
          {isAllowed('workflow') && (
            <NavItem
              icon={<Zap size={18} />}
              label="Workflow Engine"
              isActive={activeTab === 'workflow'}
              onClick={() => setActiveTab('workflow')}
            />
          )}
          {isAllowed('vault') && (
            <NavItem
              icon={<FileLock size={18} />}
              label="Sovereign Vault"
              isActive={activeTab === 'vault'}
              onClick={() => setActiveTab('vault')}
            />
          )}
          {isAllowed('chat') && (
            <NavItem
              icon={<MessageSquare size={18} />}
              label="Legal Chat"
              isActive={activeTab === 'chat'}
              onClick={() => setActiveTab('chat')}
            />
          )}

          {/* Enterprise Tier Section */}
          {(isAllowed('enclave') || isAllowed('growth') || isAllowed('audit')) && (
            <div className="pt-4 pb-2 px-4 flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em]">Enterprise Tier</span>
              <Lock size={10} className="text-slate-700" />
            </div>
          )}
          {isAllowed('enclave') && (
            <NavItem
              icon={<Box size={18} />}
              label="Physical Enclave"
              isActive={activeTab === 'enclave'}
              disabled={true}
              onClick={() => setActiveTab('enclave')}
            />
          )}
          {isAllowed('growth') && (
            <NavItem
              icon={<Coins size={18} />}
              label="Business Growth"
              isActive={activeTab === 'growth'}
              onClick={() => setActiveTab('growth')}
            />
          )}
          {isAllowed('audit') && (
            <NavItem
              icon={<Activity size={18} />}
              label="Forensic Traces"
              isActive={activeTab === 'audit'}
              onClick={() => setActiveTab('audit')}
            />
          )}

          {/* System Section */}
          {(isAllowed('status') || isAllowed('system-settings') || isAllowed('tenant-settings')) && (
            <div className="pt-4 pb-2 px-4">
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em]">System</span>
            </div>
          )}
          {isAllowed('status') && (
            <NavItem
              icon={<Target size={18} />}
              label="Project Roadmap"
              isActive={activeTab === 'status'}
              onClick={() => setActiveTab('status')}
            />
          )}
          {isAllowed('system-settings') && (
            <NavItem
              icon={<Globe size={18} className="text-blue-400" />}
              label="Infrastructure Plane"
              isActive={activeTab === 'system-settings'}
              onClick={() => setActiveTab('system-settings')}
            />
          )}
          {isAllowed('tenant-settings') && (
            <NavItem
              icon={<Settings size={18} />}
              label="Gov Controls"
              isActive={activeTab === 'tenant-settings'}
              onClick={() => setActiveTab('tenant-settings')}
            />
          )}
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-4">
          <div className="flex items-center gap-2 p-2 bg-slate-800/50 rounded-lg">
            {mode === AppMode.LAW_FIRM ? <Scale className="text-blue-400" size={18} /> : <Building2 className="text-purple-400" size={18} />}
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as AppMode)}
              className="bg-transparent text-sm focus:outline-none w-full cursor-pointer font-medium"
            >
              <option value={AppMode.LAW_FIRM}>Law Firm Mode</option>
              <option value={AppMode.ENTERPRISE}>Enterprise Mode</option>
            </select>
          </div>

          {killSwitchActive && (
            <div className="flex items-center gap-2 p-2 bg-red-500/10 text-red-400 rounded-lg animate-pulse border border-red-500/20">
              <Lock size={18} />
              <span className="text-[10px] font-bold uppercase tracking-tight">Logical Lock Active</span>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-16 border-b border-slate-800 bg-slate-900/30 flex items-center justify-between px-8 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-slate-100 capitalize">{activeTab.replace('-', ' ')}</h2>
            <div className="h-4 w-[1px] bg-slate-700"></div>
            <div className="flex items-center gap-2 text-[10px] text-slate-400 uppercase tracking-widest font-bold">
              <Cloud size={14} className="text-blue-400" />
              <span>Orchestrator: Railway Hybrid</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/10 rounded-full border border-blue-500/20">
              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">MVP Phase 1</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
              <UserCheck size={14} className="text-emerald-400" />
              <span className="text-[10px] font-medium text-emerald-400 uppercase tracking-widest">Counsel Verified</span>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto bg-slate-950 p-8 scroll-smooth">
          {children}
        </div>
      </main>
    </div>
  );
};

const NavItem = ({ icon, label, isActive, onClick, disabled }: { icon: any, label: string, isActive: boolean, onClick: () => void, disabled?: boolean }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 ${isActive
      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_12px_-4px_rgba(16,185,129,0.4)]'
      : 'text-slate-500 hover:bg-slate-800/50 hover:text-slate-100'
      } ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
  >
    {icon}
    <span className="text-sm font-medium">{label}</span>
  </button>
);

export default Layout;