
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
import { usePermissions } from '../hooks/usePermissions';
import { TAB_REQUIRED_PERMISSIONS } from '../constants';



import CommandPalette from './CommandPalette';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  killSwitchActive: boolean;
  userRole: UserRole;
  theme: 'midnight' | 'gold' | 'cyber' | 'light';
  setTheme: (theme: 'midnight' | 'gold' | 'cyber' | 'light') => void;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  activeTab,
  setActiveTab,
  mode,
  setMode,
  killSwitchActive,
  theme,
  setTheme
}) => {
  const { hasAnyPermission, role } = usePermissions();
  const [isPaletteOpen, setIsPaletteOpen] = React.useState(false);
  const [showAdvanced, setShowAdvanced] = React.useState(() => {
    return localStorage.getItem('lexSovereign_advancedMode') === 'true';
  });

  const toggleAdvanced = () => {
    const newState = !showAdvanced;
    setShowAdvanced(newState);
    localStorage.setItem('lexSovereign_advancedMode', newState.toString());
  };

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
    // If global admin, allow everything (fail-safe)
    if (role === 'GLOBAL_ADMIN') return true;

    const required = TAB_REQUIRED_PERMISSIONS[tab];
    // If no specific permissions required (and not explicitly restricted), allow or deny?
    // Let's say if list is empty [] it is public.
    if (!required || required.length === 0) return true;

    return hasAnyPermission(required);
  };
  return (
    <div className="flex h-screen bg-brand-bg text-brand-text overflow-hidden transition-colors duration-500">
      {/* Sidebar */}
      <aside className="w-64 border-r border-brand-border bg-brand-sidebar flex flex-col shadow-2xl transition-all duration-500">
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
              <span className="text-[10px] font-bold text-brand-muted uppercase tracking-[0.2em]">Platform Owner</span>
            </div>
          )}
          {isAllowed('platform-ops') && (
            <NavItem
              icon={<Globe size={18} className="text-brand-secondary" />}
              label="Global Plane"
              isActive={activeTab === 'platform-ops'}
              onClick={() => setActiveTab('platform-ops')}
            />
          )}
          {isAllowed('governance') && (
            <NavItem
              icon={<LayoutGrid size={18} />}
              label="Global Governance"
              isActive={activeTab === 'governance'}
              onClick={() => setActiveTab('governance')}
            />
          )}

          {/* Management Section */}
          {(isAllowed('org-blueprint') || (isAllowed('integration-bridge') && showAdvanced) || isAllowed('tenant-admin') || isAllowed('identity') || (isAllowed('backlog') && showAdvanced)) && (
            <div className="pt-4 pb-2 px-4 flex items-center justify-between">
              <span className="text-[10px] font-bold text-brand-muted uppercase tracking-[0.2em]">Management</span>
            </div>
          )}
          {isAllowed('org-blueprint') && (
            <NavItem
              icon={<GitBranch size={18} className="text-brand-secondary" />}
              label="Firm Blueprint"
              isActive={activeTab === 'org-blueprint'}
              onClick={() => setActiveTab('org-blueprint')}
            />
          )}
          {isAllowed('integration-bridge') && showAdvanced && (
            <NavItem
              icon={<Plug size={18} className="text-brand-primary" />}
              label="Bridge Registry"
              isActive={activeTab === 'integration-bridge'}
              onClick={() => setActiveTab('integration-bridge')}
            />
          )}
          {isAllowed('tenant-admin') && (
            <NavItem
              icon={<Building2 size={18} />}
              label="Organization Admin"
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
          {isAllowed('backlog') && showAdvanced && (
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
              <span className="text-[10px] font-bold text-brand-muted uppercase tracking-[0.2em]">Operations</span>
            </div>
          )}
          {isAllowed('conflict-check') && (
            <NavItem
              icon={<Search size={18} className="text-brand-secondary" />}
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
          {isAllowed('workflow') && showAdvanced && (
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
          {(isAllowed('enclave') || isAllowed('growth') || (isAllowed('audit') && showAdvanced)) && (
            <div className="pt-4 pb-2 px-4 flex items-center justify-between">
              <span className="text-[10px] font-bold text-brand-muted uppercase tracking-[0.2em]">Enterprise Tier</span>
            </div>
          )}
          {isAllowed('growth') && (
            <NavItem
              icon={<Coins size={18} />}
              label="Business Growth"
              isActive={activeTab === 'growth'}
              onClick={() => setActiveTab('growth')}
            />
          )}
          {isAllowed('audit') && showAdvanced && (
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
              <span className="text-[10px] font-bold text-brand-muted uppercase tracking-[0.2em]">System</span>
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
              icon={<Globe size={18} className="text-brand-secondary" />}
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

          <div className="flex items-center justify-between p-2 bg-brand-bg/50 rounded-lg border border-brand-border cursor-pointer hover:bg-brand-bg/80 transition-all" onClick={toggleAdvanced}>
            <div className="flex items-center gap-2">
              <Fingerprint size={16} className={showAdvanced ? "text-brand-primary" : "text-brand-muted"} />
              <span className="text-[10px] font-bold uppercase tracking-widest text-brand-muted">Advanced Mode</span>
            </div>
            <div className={`w-8 h-4 rounded-full relative transition-colors ${showAdvanced ? 'bg-brand-primary/40' : 'bg-brand-muted/20'}`}>
              <div className={`absolute top-1 w-2 h-2 rounded-full bg-white transition-all ${showAdvanced ? 'left-5 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'left-1'}`} />
            </div>
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
        <header className="h-16 border-b border-brand-border bg-brand-sidebar flex items-center justify-between px-8 backdrop-blur-md sticky top-0 z-20 transition-all duration-500">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-brand-text capitalize">{activeTab.replace('-', ' ')}</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 bg-brand-primary/10 rounded-full border border-brand-primary/20">
              <ShieldCheck size={14} className="text-brand-primary" />
              <span className="text-[10px] font-bold text-brand-primary uppercase tracking-widest">Protocol Secured</span>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto bg-brand-bg p-8 scroll-smooth transition-colors duration-500">
          {children}
        </div>
      </main>

      {isPaletteOpen && (
        <CommandPalette
          onClose={() => setIsPaletteOpen(false)}
          onNavigate={(tab) => {
            setActiveTab(tab);
            setIsPaletteOpen(false);
          }}
        />
      )}
    </div>
  );
};

const NavItem = ({ icon, label, isActive, onClick, disabled }: { icon: React.ReactNode, label: string, isActive: boolean, onClick: () => void, disabled?: boolean }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 ${isActive
      ? 'bg-brand-primary/10 text-brand-primary border border-brand-primary/20 shadow-[0_0_12px_-4px_rgba(16,185,129,0.4)]'
      : 'text-brand-muted hover:bg-brand-sidebar hover:text-brand-text'
      } ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
  >
    {icon}
    <span className="text-sm font-medium">{label}</span>
  </button>
);

export default Layout;