
import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Settings,
  ShieldAlert,
  Users,
  CheckCircle2,
  AlertTriangle,
  Gavel,
  Building2,
  Scale,
  Globe,
  Monitor,
  Plus,
  Save,
  Trash2,
  Lock as ShieldLock,
  X,
  Copy,
  Info,
  Loader2,
  Zap
} from 'lucide-react';
import { UserRole } from '../types';
import { usePermissions } from '../hooks/usePermissions';
import RoleTemplateMarketplace from './RoleTemplateMarketplace';
import { authorizedFetch, getSavedSession } from '../utils/api';

interface Permission {
  id: string;
  action: string;
  resource: string;
  description: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  isSystem: boolean;
  tenantId: string | null;
  permissions: Permission[];
}

interface AccessGovernanceProps {
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
}

const AccessGovernance: React.FC<AccessGovernanceProps> = ({ userRole }) => {
  const { hasAnyPermission, role: contextRole } = usePermissions();
  const [roles, setRoles] = useState<Role[]>([]);
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editPerms, setEditPerms] = useState<string[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showMarketplace, setShowMarketplace] = useState(false);

  const canManageRoles = hasAnyPermission(['manage_roles']) || contextRole === 'GLOBAL_ADMIN';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    const session = getSavedSession();
    if (!session?.token) {
      console.warn('[AccessGovernance] No session found.');
      setIsLoading(false);
      return;
    }

    try {
      console.log('[AccessGovernance] Fetching roles and permissions...');
      const [rolesData, permsData] = await Promise.all([
        authorizedFetch('/api/roles', { token: session.token }),
        authorizedFetch('/api/roles/permissions', { token: session.token }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Enclave request timed out (30s)')), 30000))
      ].slice(0, 2)); // Use slice to remove timeout from result but let it run? No, that's not how it works.

      // Proper timeout implementation
      const fetchWithTimeout = async () => {
        const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Enclave synchronization timed out')), 15000));
        return Promise.race([
          Promise.all([
            authorizedFetch('/api/roles', { token: session.token }),
            authorizedFetch('/api/roles/permissions', { token: session.token })
          ]),
          timeout
        ]);
      };

      const [rolesDataReal, permsDataReal] = await fetchWithTimeout() as [any, any];

      setRoles(rolesDataReal);
      setAllPermissions(permsDataReal);
      if (rolesDataReal.length > 0 && !selectedRole) {
        setSelectedRole(rolesDataReal[0]);
      }
      console.log('[AccessGovernance] Sync complete.');
    } catch (error: any) {
      console.error('Failed to fetch roles', error);
      alert(`Access Governance Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
    setIsEditing(false);
    setEditName(role.name);
    setEditDesc(role.description);
    setEditPerms(role.permissions.map(p => p.id));
  };

  const handleCreate = async () => {
    if (!editName) return;
    const session = getSavedSession();
    if (!session?.token) return;

    setIsSaving(true);
    try {
      await authorizedFetch('/api/roles', {
        method: 'POST',
        token: session.token,
        body: JSON.stringify({
          name: editName,
          description: editDesc,
          permissionIds: editPerms
        })
      });

      await fetchData();
      setShowCreateModal(false);
      resetForm();
    } catch (e: any) {
      console.error(e);
      alert(e.message || "Failed to create role.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedRole) return;
    const session = getSavedSession();
    if (!session?.token) return;

    setIsSaving(true);
    try {
      await authorizedFetch(`/api/roles/${selectedRole.id}`, {
        method: 'PUT',
        token: session.token,
        body: JSON.stringify({
          name: editName,
          description: editDesc,
          permissionIds: editPerms
        })
      });

      await fetchData();
      setIsEditing(false);
    } catch (e: any) {
      console.error(e);
      alert(e.message || "Failed to update role.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedRole || selectedRole.isSystem) return;
    if (!confirm('Are you sure you want to delete this role?')) return;

    const session = getSavedSession();
    if (!session?.token) return;

    try {
      await authorizedFetch(`/api/roles/${selectedRole.id}`, {
        method: 'DELETE',
        token: session.token
      });

      setSelectedRole(null);
      await fetchData();
    } catch (e: any) {
      console.error(e);
      alert(e.message || "Failed to delete role.");
    }
  };

  const applyTemplate = async (type: string) => {
    try {
      const session = getSavedSession();
      if (!session?.token) return;

      await authorizedFetch(`/api/roles/templates/${type}`, {
        method: 'POST',
        token: session.token
      });
      await fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const resetForm = () => {
    setEditName('');
    setEditDesc('');
    setEditPerms([]);
  };

  const groupPermissions = () => {
    const groups: Record<string, Permission[]> = {};
    allPermissions.forEach(p => {
      const resource = p.resource; // e.g. 'matter', 'user'
      if (!groups[resource]) groups[resource] = [];
      groups[resource].push(p);
    });
    return groups;
  };

  if (isLoading) return <div className="p-10 flex items-center justify-center text-slate-500"><Loader2 className="animate-spin mr-2" /> Loading Access Governance...</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-24 animate-in fade-in">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-6">
        <div>
          <h3 className="text-2xl font-bold flex items-center gap-3 text-white">
            <div className="p-2 bg-blue-500/10 rounded-xl border border-blue-500/20"><ShieldCheck className="text-blue-400" size={24} /></div>
            Role Governance
          </h3>
          <p className="text-slate-400 text-sm mt-1">Manage tenant permissions and enforce least-privilege access.</p>
        </div>
        {userRole === UserRole.TENANT_ADMIN && (
          <div className="flex gap-3">
            <button
              onClick={() => setShowMarketplace(true)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-blue-400 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-2 border border-blue-500/20"
            >
              <Zap size={14} /> Browse Blueprints
            </button>
            <button
              onClick={() => { setShowCreateModal(true); resetForm(); }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-emerald-900/20 flex items-center gap-2"
            >
              <Plus size={16} /> Create Role
            </button>
          </div>
        )}
      </div>

      <RoleTemplateMarketplace
        isOpen={showMarketplace}
        onClose={() => setShowMarketplace(false)}
        onApplySuccess={fetchData}
      />

      <div className="grid grid-cols-12 gap-8">
        {/* Roles List */}
        <div className="col-span-4 space-y-3">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest px-2 mb-4">Available Roles</h4>
          {roles.map(role => (
            <button
              key={role.id}
              onClick={() => handleRoleSelect(role)}
              className={`w-full p-4 rounded-xl border text-left transition-all group relative ${selectedRole?.id === role.id
                ? 'bg-blue-600/10 border-blue-500/50 shadow-lg shadow-blue-900/10'
                : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-bold text-sm text-slate-200 flex items-center gap-2">
                    {role.name}
                    {role.isSystem && <span className="px-1.5 py-0.5 bg-slate-800 text-slate-500 text-[9px] rounded uppercase tracking-wider border border-slate-700">System</span>}
                  </div>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{role.description || 'No description provided.'}</p>
                </div>
                {selectedRole?.id === role.id && <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse mt-1.5"></div>}
              </div>
            </button>
          ))}
        </div>

        {/* Role Details / Editor */}
        <div className="col-span-8">
          {selectedRole ? (
            <div className="bg-slate-900/50 border border-slate-800 rounded-[2rem] p-8 space-y-6 relative overflow-hidden">
              {/* Background deco */}
              <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none text-slate-500">
                <Users size={200} />
              </div>

              {/* Editor Header */}
              <div className="relative z-10 space-y-4">
                {isEditing ? (
                  <div className="space-y-4 max-w-lg">
                    <input
                      className="text-2xl font-bold bg-transparent border-b border-slate-700 focus:border-blue-500 outline-none w-full pb-2"
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      placeholder="Role Name"
                    />
                    <textarea
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                      value={editDesc}
                      onChange={e => setEditDesc(e.target.value)}
                      placeholder="Description..."
                      rows={2}
                    />
                  </div>
                ) : (
                  <div>
                    <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                      {selectedRole.name}
                      {selectedRole.isSystem && (
                        <span title="System Role (Read Only)">
                          <ShieldLock size={16} className="text-slate-500" />
                        </span>
                      )}
                    </h2>
                    <p className="text-slate-400 mt-2 text-sm">{selectedRole.description}</p>
                  </div>
                )}

                {/* Actions */}
                {canManageRoles && !selectedRole.isSystem && (
                  <div className="flex items-center gap-3 pt-2">
                    {isEditing ? (
                      <>
                        <button onClick={handleUpdate} disabled={isSaving} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                          {isSaving ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />} Save Changes
                        </button>
                        <button onClick={() => { setIsEditing(false); handleRoleSelect(selectedRole); }} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-xs font-bold uppercase tracking-wider">Cancel</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => { setIsEditing(true); setEditName(selectedRole.name); setEditDesc(selectedRole.description); setEditPerms(selectedRole.permissions.map(p => p.id)); }} className="px-4 py-2 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-lg text-xs font-bold uppercase tracking-wider">
                          Edit Configuration
                        </button>
                        <button onClick={handleDelete} className="px-4 py-2 bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-500/30 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                          <Trash2 size={14} /> Delete
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>

              <div className="h-[1px] bg-slate-800 w-full relative z-10"></div>

              {/* Permissions Matrix */}
              <div className="relative z-10">
                <h5 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Settings size={14} /> Assigned Capabilities
                </h5>

                <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide">
                  {Object.entries(groupPermissions()).map(([resource, perms]) => (
                    <div key={resource} className="bg-slate-950/50 rounded-xl p-4 border border-slate-800">
                      <h6 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-800/50 pb-2">{resource} Control Plane</h6>
                      <div className="grid grid-cols-2 gap-3">
                        {perms.map(perm => {
                          const isActive = isEditing ? editPerms.includes(perm.id) : selectedRole.permissions.some(p => p.id === perm.id);
                          return (
                            <label key={perm.id} className={`flex items-start gap-3 p-3 rounded-lg border text-xs cursor-pointer transition-all ${isActive
                              ? 'bg-emerald-500/5 border-emerald-500/30'
                              : 'bg-slate-900 border-slate-800 opacity-60 hover:opacity-100'
                              }`}>
                              <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition-colors ${isActive
                                ? 'bg-emerald-500 border-emerald-500'
                                : 'bg-slate-950 border-slate-700'
                                }`}>
                                {isActive && <CheckCircle2 size={10} className="text-white" />}
                              </div>
                              <input
                                type="checkbox"
                                className="hidden"
                                disabled={!isEditing}
                                checked={isActive}
                                onChange={() => {
                                  if (!isEditing) return;
                                  setEditPerms(prev =>
                                    prev.includes(perm.id)
                                      ? prev.filter(id => id !== perm.id)
                                      : [...prev, perm.id]
                                  );
                                }}
                              />
                              <div>
                                <span className={`font-bold block ${isActive ? 'text-emerald-400' : 'text-slate-400'}`}>{perm.action}</span>
                                <span className="text-[10px] text-slate-500 block leading-tight mt-0.5">{perm.description}</span>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 border border-slate-800 border-dashed rounded-[2rem] p-10">
              <ShieldAlert size={48} className="mb-4 opacity-50" />
              <p className="font-bold">Select a role to govern</p>
              <p className="text-xs">Or create a new custom role for your tenant layout.</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-2xl w-full shadow-2xl relative overflow-hidden animate-in zoom-in-95">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <Plus className="text-emerald-400" /> Define New Role
            </h3>

            <div className="space-y-4 mb-8">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-1">Role Name</label>
                <input
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-emerald-500"
                  placeholder="e.g. M&A Senior Associate"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-1">Description</label>
                <textarea
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-emerald-500"
                  placeholder="Scope of authority..."
                  rows={2}
                  value={editDesc}
                  onChange={e => setEditDesc(e.target.value)}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">Initial Capabilities</label>
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 h-48 overflow-y-auto grid grid-cols-2 gap-2">
                  {allPermissions.map(p => (
                    <label key={p.id} className="flex items-center gap-2 p-2 hover:bg-slate-900 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        className="accent-emerald-500"
                        checked={editPerms.includes(p.id)}
                        onChange={() => setEditPerms(prev => prev.includes(p.id) ? prev.filter(id => id !== p.id) : [...prev, p.id])}
                      />
                      <span className="text-xs font-mono text-slate-400">{p.id}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button onClick={() => setShowCreateModal(false)} className="px-5 py-2.5 text-slate-400 hover:text-white text-sm font-bold transition-colors">Cancel</button>
              <button onClick={handleCreate} disabled={!editName || isSaving} className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-900/20">
                {isSaving ? 'Provisioning...' : 'Create Role'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccessGovernance;
