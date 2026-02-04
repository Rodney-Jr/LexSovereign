
import React, { useState, useEffect } from 'react';
import {
  Shield,
  Lock,
  MapPin,
  Eye,
  FileText,
  ChevronRight,
  Search,
  Filter,
  Info,
  Trash2,
  ShieldAlert,
  X,
  SlidersHorizontal,
  ChevronDown,
  Briefcase,
  Sparkles
} from 'lucide-react';
import { DocumentMetadata, Region, PrivilegeStatus } from '../types';
import DocumentIngestModal from './DocumentIngestModal';
import DocumentTemplateMarketplace from './DocumentTemplateMarketplace';
import DraftingStudio from './DraftingStudio';

interface DocumentVaultProps {
  documents: DocumentMetadata[];
  onAddDocument: (doc: DocumentMetadata) => Promise<any> | void;
  onRemoveDocument: (id: string) => void;
}

const DocumentVault: React.FC<DocumentVaultProps> = ({ documents, onAddDocument, onRemoveDocument }) => {
  const [showIngest, setShowIngest] = useState(false);
  const [search, setSearch] = useState('');
  const [filterRegion, setFilterRegion] = useState<string>('All');
  const [filterMatterId, setFilterMatterId] = useState<string>('All');
  const [filterPrivilege, setFilterPrivilege] = useState<string>('All');
  const [filterClassification, setFilterClassification] = useState<string>('All');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Marketplace & Studio State
  const [showMarketplace, setShowMarketplace] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [brandingProfiles, setBrandingProfiles] = useState<any[]>([]);
  const [selectedBrandingId, setSelectedBrandingId] = useState<string>("");

  useEffect(() => {
    const fetchBranding = async () => {
      try {
        const token = localStorage.getItem('lexSovereign_token');
        const response = await fetch('/api/branding-profiles', { // Note: Assuming this route exists or will be added
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setBrandingProfiles(data);
        }
      } catch (err) {
        console.warn('Could not fetch branding profiles');
      }
    };
    fetchBranding();
  }, []);

  const handleExport = async (id: string, format: 'DOCX' | 'PDF', name: string) => {
    try {
      const token = localStorage.getItem('lexSovereign_token');
      const sovPin = (window as any)._SOVEREIGN_PIN_ || '';

      const response = await fetch(`/api/export/${id}/export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          ...(sovPin ? { 'x-sov-pin': sovPin } : {})
        },
        body: JSON.stringify({ format, brandingProfileId: selectedBrandingId || undefined })
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${name}.${format.toLowerCase()}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export Error:', err);
      alert('Failed to export document. Ensure the document is finalized.');
    }
  };

  // Derive unique matter IDs from current document set for the filter dropdown
  const uniqueMatterIds = Array.from(new Set(documents.map(doc => doc.matterId))).sort();

  const filteredDocs = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(search.toLowerCase()) ||
      (doc.matterId?.toLowerCase().includes(search.toLowerCase()) ?? false);
    const matchesRegion = filterRegion === 'All' || doc.region === filterRegion;
    const matchesMatter = filterMatterId === 'All' || doc.matterId === filterMatterId;
    const matchesPrivilege = filterPrivilege === 'All' || doc.privilege === filterPrivilege;
    const matchesClassification = filterClassification === 'All' || doc.classification === filterClassification;

    return matchesSearch && matchesRegion && matchesMatter && matchesPrivilege && matchesClassification;
  });

  const clearFilters = () => {
    setSearch('');
    setFilterRegion('All');
    setFilterMatterId('All');
    setFilterPrivilege('All');
    setFilterClassification('All');
  };

  const highlightText = (text: string, highlight: string) => {
    if (!highlight.trim()) return <span>{text}</span>;
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) =>
          part.toLowerCase() === highlight.toLowerCase() ? (
            <mark key={i} className="bg-emerald-500/30 text-emerald-200 px-0.5 rounded">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  const hasActiveFilters = search !== '' || filterRegion !== 'All' || filterMatterId !== 'All' || filterPrivilege !== 'All' || filterClassification !== 'All';

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-2xl font-bold text-white tracking-tight">Sovereign Vault</h3>
            <div className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-emerald-500/5 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
              {documents.length} Total Artifacts
            </div>
          </div>
          <p className="text-brand-muted text-sm">Managing cryptographically-pinned legal artifacts across {new Set(documents.map(d => d.region)).size} regional silos.</p>
        </div>
        <div className="flex items-center gap-3">
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-[10px] font-bold text-brand-muted uppercase tracking-widest hover:text-brand-text transition-colors flex items-center gap-1.5 px-4"
            >
              <X size={14} /> Clear All
            </button>
          )}
          <button
            onClick={() => setShowMarketplace(true)}
            className="px-6 py-3 bg-brand-secondary/10 hover:bg-brand-secondary/20 text-brand-secondary rounded-2xl font-bold transition-all flex items-center gap-2 border border-brand-secondary/20 hover:border-brand-secondary/40 active:scale-95 shadow-lg shadow-brand-secondary/5"
          >
            <Sparkles size={20} className="animate-pulse text-brand-secondary" />
            New Sovereign Draft
          </button>
          <button
            onClick={() => setShowIngest(true)}
            className="bg-brand-primary hover:opacity-90 text-brand-bg px-6 py-3 rounded-2xl font-bold transition-all flex items-center gap-2 shadow-xl shadow-brand-primary/20 active:scale-95"
          >
            <FileText size={20} />
            Ingest Document
          </button>
        </div>
      </div>

      <div className="bg-brand-sidebar border border-brand-border rounded-3xl overflow-hidden shadow-xl backdrop-blur-md transition-all duration-500">
        {/* Enhanced Search & Filter Bar */}
        <div className="p-4 border-b border-brand-border flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted" size={18} />
            <input
              type="text"
              placeholder="Search by filename or Matter ID..."
              className="w-full bg-brand-bg border border-brand-border rounded-2xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-brand-primary transition-all placeholder:text-brand-muted/40 text-brand-text"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3">
            {/* Matter ID Quick Filter */}
            <div className="flex items-center gap-2 px-4 py-3 bg-brand-bg border border-brand-border rounded-2xl transition-all hover:border-brand-secondary/30">
              <Briefcase size={16} className="text-brand-secondary" />
              <select
                title="Matter ID Filter"
                className="bg-transparent text-xs font-bold text-brand-text focus:outline-none cursor-pointer appearance-none pr-6 relative"
                value={filterMatterId}
                onChange={e => setFilterMatterId(e.target.value)}
              >
                <option value="All" className="bg-brand-bg">All Matters</option>
                {uniqueMatterIds.map(m => <option key={m} value={m} className="bg-brand-bg">{m}</option>)}
              </select>
              <ChevronDown size={12} className="text-brand-muted -ml-4 pointer-events-none" />
            </div>

            <div className="flex items-center gap-2 px-4 py-3 bg-brand-bg border border-brand-border rounded-2xl transition-all hover:border-brand-primary/30">
              <Shield size={16} className="text-brand-secondary" />
              <select
                title="Branding Profile"
                className="bg-transparent text-xs font-bold text-brand-text focus:outline-none cursor-pointer appearance-none pr-6 relative"
                value={selectedBrandingId}
                onChange={e => setSelectedBrandingId(e.target.value)}
              >
                <option value="" className="bg-brand-bg">Default Branding</option>
                {brandingProfiles.map(p => <option key={p.id} value={p.id} className="bg-brand-bg">{p.name}</option>)}
              </select>
              <ChevronDown size={12} className="text-brand-muted -ml-4 pointer-events-none" />
            </div>

            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`p-3 rounded-2xl border transition-all flex items-center gap-2 transition-all duration-500 ${showAdvancedFilters
                ? 'bg-brand-primary/10 border-brand-primary text-brand-primary'
                : 'bg-brand-bg border-brand-border text-brand-muted hover:text-brand-text'
                }`}
            >
              <SlidersHorizontal size={18} />
              <span className="text-[10px] font-bold uppercase tracking-widest">Filters</span>
            </button>
          </div>
        </div>

        {/* Advanced Filters Drawer */}
        {showAdvancedFilters && (
          <div className="p-6 bg-slate-950/50 border-b border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-top-2 duration-300">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Privilege Status</label>
              <div className="flex flex-wrap gap-2">
                {['All', ...Object.values(PrivilegeStatus)].map(p => (
                  <button
                    key={p}
                    onClick={() => setFilterPrivilege(p)}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase transition-all border ${filterPrivilege === p
                      ? 'bg-purple-500/10 border-purple-500 text-purple-400'
                      : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
                      }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Classification</label>
              <div className="flex flex-wrap gap-2">
                {['All', 'Confidential', 'Highly Sensitive', 'Public'].map(c => (
                  <button
                    key={c}
                    onClick={() => setFilterClassification(c)}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase transition-all border ${filterClassification === c
                      ? 'bg-blue-500/10 border-blue-500 text-blue-400'
                      : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
                      }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-end justify-end">
              <div className="text-[10px] font-mono text-slate-600 uppercase tracking-widest">
                {filteredDocs.length} of {documents.length} artifacts visible
              </div>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-brand-sidebar border-b border-brand-border">
              <tr>
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-brand-muted">Document / Matter</th>
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-brand-muted">Sovereignty Info</th>
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-brand-muted">Classification</th>
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-brand-muted">Privilege</th>
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-brand-muted text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {filteredDocs.map((doc) => (
                <tr key={doc.id} className="hover:bg-brand-primary/5 transition-all group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="p-2.5 bg-brand-bg rounded-xl group-hover:bg-brand-primary/10 transition-colors">
                        <FileText size={22} className="text-brand-primary" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-slate-100 group-hover:text-emerald-400 transition-colors truncate">
                          {highlightText(doc.name, search)}
                        </div>
                        <div className="text-[10px] text-slate-500 mono tracking-tighter uppercase">
                          {highlightText(doc.matterId || 'UNCATEGORIZED', search)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-[11px]">
                        <MapPin size={12} className="text-blue-400" />
                        <span className="text-slate-300 font-medium">{doc.region} Silo</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] font-mono">
                        <Shield size={12} className={doc.encryption === 'BYOK' ? 'text-emerald-400' : 'text-blue-400'} />
                        <span className={doc.encryption === 'BYOK' ? 'text-emerald-400/80' : 'text-blue-400/80'}>{doc.encryption} Protocol</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase border shadow-sm ${doc.classification === 'Highly Sensitive'
                      ? 'bg-red-500/10 text-red-400 border-red-500/20 shadow-red-500/5'
                      : doc.classification === 'Confidential'
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-amber-500/5'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}>
                      {doc.classification}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase border shadow-sm ${doc.privilege === PrivilegeStatus.PRIVILEGED
                      ? 'bg-purple-500/10 text-purple-400 border-purple-500/20 shadow-purple-500/5'
                      : 'bg-blue-500/10 text-blue-400 border-blue-500/20 shadow-blue-500/5'
                      }`}>
                      {doc.privilege}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                      <button title="View Document" className="p-2.5 hover:bg-slate-800 rounded-xl text-slate-500 hover:text-white transition-all">
                        <Eye size={18} />
                      </button>
                      <button
                        title="Export DOCX"
                        onClick={() => handleExport(doc.id, 'DOCX', doc.name)}
                        className="p-2.5 hover:bg-emerald-500/10 rounded-xl text-slate-500 hover:text-emerald-400 transition-all"
                      >
                        <FileText size={18} />
                      </button>
                      <button
                        title="Export PDF"
                        onClick={() => handleExport(doc.id, 'PDF', doc.name)}
                        className="p-2.5 hover:bg-red-500/10 rounded-xl text-slate-500 hover:text-red-400 transition-all"
                      >
                        <ShieldAlert size={18} />
                      </button>
                      <button
                        title="Delete Document"
                        onClick={() => onRemoveDocument(doc.id)}
                        className="p-2.5 hover:bg-red-500/10 rounded-xl text-slate-600 hover:text-red-400 transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredDocs.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-24 text-center">
                    <div className="flex flex-col items-center gap-6 text-slate-500">
                      <div className="w-20 h-20 bg-slate-900 border border-slate-800 rounded-full flex items-center justify-center opacity-50 relative">
                        <Search size={32} className="text-slate-700" />
                        <div className="absolute top-0 right-0 w-6 h-6 bg-red-500/20 border border-red-500/30 rounded-full flex items-center justify-center">
                          <X size={12} className="text-red-400" />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-lg font-bold text-slate-300">No sovereign artifacts found</p>
                        <p className="text-xs text-slate-500 max-w-xs mx-auto uppercase tracking-widest leading-relaxed">
                          Your current filters returned zero results in the vault.
                        </p>
                      </div>
                      <button
                        onClick={clearFilters}
                        className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border border-slate-700"
                      >
                        Reset Search Workspace
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>



      {showIngest && (
        <DocumentIngestModal
          onClose={() => setShowIngest(false)}
          onIngest={(doc) => {
            onAddDocument(doc);
            setShowIngest(false);
          }}
        />
      )}

      <DocumentTemplateMarketplace
        isOpen={showMarketplace}
        onClose={() => setShowMarketplace(false)}
        onSelect={(id) => {
          setSelectedTemplateId(id);
          setShowMarketplace(false);
        }}
      />

      {selectedTemplateId && (
        <DraftingStudio
          templateId={selectedTemplateId}
          matterId={filterMatterId !== 'All' ? filterMatterId : null}
          onClose={() => setSelectedTemplateId(null)}
          onSave={(name, content) => {
            onAddDocument({
              id: `DOC-GEN-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
              name,
              type: 'Draft',
              size: `${(new Blob([content]).size / 1024).toFixed(1)} KB`,
              uploadedBy: 'Sovereign AI',
              uploadedAt: new Date().toLocaleTimeString(),
              region: filterRegion !== 'All' ? (filterRegion as Region) : Region.PRIMARY,
              matterId: filterMatterId !== 'All' ? filterMatterId : 'UNCATEGORIZED',
              privilege: PrivilegeStatus.PRIVILEGED,
              classification: 'Confidential',
              encryption: 'DAS'
            });
            setSelectedTemplateId(null);
          }}
        />
      )}
    </div>
  );
};

interface InfoCardProps {
  icon: React.ReactNode;
  title: string;
  desc: string;
  color: 'emerald' | 'blue' | 'purple';
}

const InfoCard: React.FC<InfoCardProps> = ({ icon, title, desc, color }) => {
  const brandColor = color === 'emerald' ? 'brand-primary' : color === 'blue' ? 'brand-secondary' : 'brand-muted';
  return (
    <div className={`bg-brand-primary/5 border border-brand-primary/10 p-6 rounded-3xl group hover:border-brand-primary/30 transition-all duration-500`}>
      <div className="flex items-center gap-3 mb-3">
        {icon}
        <h4 className={`font-bold text-sm text-${brandColor} uppercase tracking-widest`}>{title}</h4>
      </div>
      <p className={`text-[10px] text-brand-muted/80 leading-relaxed font-medium`}>
        {desc}
      </p>
    </div>
  );
};

export default DocumentVault;
