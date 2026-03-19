import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Briefcase, 
  Mail, 
  Phone, 
  MapPin, 
  ArrowRight, 
  MoreVertical,
  Edit2,
  Trash2,
  ExternalLink,
  ChevronRight,
  Filter,
  Building2,
  User,
  CheckCircle2,
  AlertCircle,
  Activity,
  Loader2,
  Clock
} from 'lucide-react';
import { Client } from '../types';
import { authorizedFetch, getSavedSession } from '../utils/api';
import { useNotification } from './NotificationProvider';

const ClientDirectory: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    contactEmail: '',
    contactPhone: '',
    billingAddress: '',
    taxId: '',
    type: 'CORPORATE' as 'CORPORATE' | 'INDIVIDUAL'
  });

  const { notify } = useNotification();

  const fetchClients = async () => {
    setLoading(true);
    const session = getSavedSession();
    if (!session?.token) return;

    try {
      const data = await authorizedFetch('/api/clients', { token: session.token });
      setClients(data);
    } catch (error: any) {
      notify('error', 'Sync Failure', error.message || 'Failed to retrieve records from the enclave.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    const session = getSavedSession();
    if (!session?.token) return;

    try {
      await authorizedFetch('/api/clients', {
        method: 'POST',
        token: session.token,
        body: formData
      });
      notify('success', 'Client Registered', `${formData.name} added to the Sovereign Registry.`);
      setShowAddModal(false);
      setFormData({
        name: '',
        industry: '',
        contactEmail: '',
        contactPhone: '',
        billingAddress: '',
        taxId: '',
        type: 'CORPORATE'
      });
      fetchClients();
    } catch (error: any) {
      notify('error', 'Registration Failed', error.message);
    }
  };

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.industry?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.contactEmail?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-brand-primary/10 rounded-xl border border-brand-primary/20">
              <Users className="text-brand-primary" size={24} />
            </div>
            <h2 className="text-3xl font-bold text-white tracking-tight">Client Directory</h2>
          </div>
          <p className="text-slate-500 text-sm pl-11">Manage sovereign entities and stakeholder records across the enclave.</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-brand-primary transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search directory..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-brand-sidebar border border-brand-border rounded-2xl py-3 pl-12 pr-6 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary/50 w-full md:w-64 transition-all"
            />
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-brand-primary hover:bg-brand-primary-hover text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-brand-primary/20 active:scale-95 whitespace-nowrap"
          >
            <Plus size={20} />
            Add Entity
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-brand-sidebar/40 border border-brand-border p-6 rounded-3xl backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20">
              <Building2 className="text-blue-400" size={20} />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest font-bold text-slate-500">Corporate Clients</p>
              <h3 className="text-2xl font-bold text-white">{clients.filter(c => c.type === 'CORPORATE').length}</h3>
            </div>
          </div>
        </div>
        <div className="bg-brand-sidebar/40 border border-brand-border p-6 rounded-3xl backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-500/10 rounded-2xl border border-purple-500/20">
              <User className="text-purple-400" size={20} />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest font-bold text-slate-500">Private Individuals</p>
              <h3 className="text-2xl font-bold text-white">{clients.filter(c => c.type === 'INDIVIDUAL').length}</h3>
            </div>
          </div>
        </div>
        <div className="bg-brand-sidebar/40 border border-brand-border p-6 rounded-3xl backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-brand-primary/10 rounded-2xl border border-brand-primary/20">
              <Activity className="text-brand-primary" size={20} />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest font-bold text-slate-500">Active Matters</p>
              <h3 className="text-2xl font-bold text-white">
                {clients.reduce((acc, curr) => acc + (curr._count?.matters || 0), 0)}
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-brand-sidebar/20 border border-brand-border rounded-[2.5rem] border-dashed">
          <Loader2 className="animate-spin text-brand-primary mb-4" size={32} />
          <p className="text-slate-500 animate-pulse uppercase tracking-widest text-xs font-bold">Synchronizing Enclave...</p>
        </div>
      ) : filteredClients.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredClients.map((client) => (
            <div 
              key={client.id}
              className="bg-brand-sidebar border border-brand-border rounded-[2rem] p-6 hover:border-brand-primary/40 transition-all duration-500 group relative overflow-hidden"
            >
              {/* Background Glow */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 blur-[50px] group-hover:bg-brand-primary/10 transition-all duration-500"></div>
              
              <div className="flex justify-between items-start mb-6 relative z-10">
                <div className="flex items-center gap-4">
                  <div className={`p-4 rounded-2xl transition-all duration-500 ring-1 shadow-inner ${
                    client.type === 'CORPORATE' 
                      ? 'bg-blue-500/10 ring-blue-500/20 group-hover:bg-blue-500/20' 
                      : 'bg-purple-500/10 ring-purple-500/20 group-hover:bg-purple-500/20'
                  }`}>
                    {client.type === 'CORPORATE' ? <Building2 size={24} className="text-blue-400" /> : <User size={24} className="text-purple-400" />}
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white group-hover:text-brand-primary transition-colors truncate max-w-[180px]">
                      {client.name}
                    </h4>
                    <p className="text-[10px] font-mono text-slate-600 uppercase tracking-tighter">
                      ID: {client.id.split('-')[0]}...{client.id.split('-').pop()}
                    </p>
                  </div>
                </div>
                <button className="p-2 hover:bg-white/5 rounded-xl transition-colors text-slate-500 hover:text-white">
                  <MoreVertical size={18} />
                </button>
              </div>

              <div className="space-y-4 relative z-10">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-brand-bg/50 border border-brand-border/40 p-3 rounded-2xl">
                    <p className="text-[8px] uppercase tracking-widest font-bold text-slate-600 mb-1">Status</p>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 size={12} className="text-brand-primary" />
                      <span className="text-xs font-bold text-slate-300">Verified</span>
                    </div>
                  </div>
                  <div className="bg-brand-bg/50 border border-brand-border/40 p-3 rounded-2xl">
                    <p className="text-[8px] uppercase tracking-widest font-bold text-slate-600 mb-1">Active Matters</p>
                    <div className="flex items-center gap-1.5">
                      <Briefcase size={12} className="text-brand-secondary" />
                      <span className="text-xs font-bold text-slate-300">{client._count?.matters || 0}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {client.contactEmail && (
                    <div className="flex items-center gap-2.5 text-slate-400 group-hover:text-slate-300 transition-colors">
                      <Mail size={14} className="text-slate-600" />
                      <span className="text-xs truncate">{client.contactEmail}</span>
                    </div>
                  )}
                  {client.industry && (
                    <div className="flex items-center gap-2.5 text-slate-400 group-hover:text-slate-300 transition-colors">
                      <Filter size={14} className="text-slate-600" />
                      <span className="text-xs">{client.industry}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2.5 text-slate-400">
                    <Clock size={14} className="text-slate-600" />
                    <span className="text-[10px]">Registered {new Date(client.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="pt-4 mt-2 border-t border-brand-border/40 flex items-center justify-between">
                  {client.name === 'Unknown Client' ? (
                    <span className="text-[10px] font-bold text-amber-500/80 uppercase tracking-widest flex items-center gap-1.5">
                      <AlertCircle size={12} /> Data Recovery Req
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Sovereign Entity</span>
                  )}
                  <button className="flex items-center gap-1.5 text-brand-primary hover:text-brand-primary-hover font-bold text-xs group/btn">
                    View Portfolio
                    <ChevronRight size={14} className="group-hover/btn:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-32 bg-brand-sidebar/20 border border-brand-border rounded-[2.5rem] border-dashed text-center">
          <div className="p-6 bg-brand-sidebar border border-brand-border rounded-full mb-6 relative">
            <Users size={48} className="text-slate-700" />
            <div className="absolute -top-1 -right-1 p-2 bg-brand-primary/20 rounded-full animate-ping"></div>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Registry Void Detected</h3>
          <p className="text-slate-500 max-w-sm mx-auto mb-8">No client records found in the current enclave sector. Start by registering a new sovereign entity.</p>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-brand-primary/10 border border-brand-primary/30 hover:bg-brand-primary/20 text-brand-primary px-8 py-3 rounded-2xl font-bold transition-all active:scale-95"
          >
            <Plus size={20} />
            Initialize First Record
          </button>
        </div>
      )}

      {/* Add Client Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 lg:p-6">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setShowAddModal(false)}></div>
          
          <div className="bg-brand-sidebar border border-brand-border w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden relative z-10 animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-brand-border bg-gradient-to-r from-brand-primary/5 to-transparent">
              <div className="flex items-center gap-4 mb-2">
                <div className="p-3 bg-brand-primary/10 rounded-2xl border border-brand-primary/20">
                  <Plus className="text-brand-primary" size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white tracking-tight">Register Entity</h3>
                  <p className="text-slate-500 text-xs">Create a new entry in the Sovereign Client Directory.</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleAddClient} className="p-8 space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 px-1">Entity Name *</label>
                  <input 
                    required
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g. Acme Corporation Ltd." 
                    className="w-full bg-brand-bg border border-brand-border rounded-2xl py-3 px-5 text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 px-1">Type</label>
                    <select 
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value as any})}
                      className="w-full bg-brand-bg border border-brand-border rounded-2xl py-3 px-5 text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/50 appearance-none"
                    >
                      <option value="CORPORATE">Corporate</option>
                      <option value="INDIVIDUAL">Individual</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 px-1">Industry</label>
                    <input 
                      type="text" 
                      value={formData.industry}
                      onChange={(e) => setFormData({...formData, industry: e.target.value})}
                      placeholder="e.g. FinTech" 
                      className="w-full bg-brand-bg border border-brand-border rounded-2xl py-3 px-5 text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 px-1">Email</label>
                    <input 
                      type="email" 
                      value={formData.contactEmail}
                      onChange={(e) => setFormData({...formData, contactEmail: e.target.value})}
                      placeholder="compliance@acme.com" 
                      className="w-full bg-brand-bg border border-brand-border rounded-2xl py-3 px-5 text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 px-1">Phone</label>
                    <input 
                      type="text" 
                      value={formData.contactPhone}
                      onChange={(e) => setFormData({...formData, contactPhone: e.target.value})}
                      placeholder="+233..." 
                      className="w-full bg-brand-bg border border-brand-border rounded-2xl py-3 px-5 text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 px-1">Billing Address</label>
                  <textarea 
                    value={formData.billingAddress}
                    onChange={(e) => setFormData({...formData, billingAddress: e.target.value})}
                    placeholder="HQ Location..." 
                    rows={2}
                    className="w-full bg-brand-bg border border-brand-border rounded-2xl py-3 px-5 text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/50 resize-none"
                  ></textarea>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-white py-4 rounded-2xl font-bold transition-all border border-brand-border"
                >
                  Discard
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-brand-primary hover:bg-brand-primary-hover text-white py-4 rounded-2xl font-bold transition-all shadow-lg shadow-brand-primary/20 active:scale-95"
                >
                  Commit Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientDirectory;
