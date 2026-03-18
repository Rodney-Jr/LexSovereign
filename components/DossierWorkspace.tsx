
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    X, User, Shield, Briefcase, Calendar, Award,
    CheckCircle2, AlertCircle, FileText, Activity,
    TrendingDown, Plus, ChevronRight, Lock, Unlock,
    DollarSign, MonitorSmartphone, Key, ShieldCheck,
    Banknote, Loader2,
    Fingerprint, Scale, FileSignature, Clock
} from 'lucide-react';
import { useSovereign } from '../contexts/SovereignContext';
import { authorizedFetch } from '../utils/api';
import { UserRole, Matter, KnowledgeArtifact } from '../types';
import { 
    ClientMattersView, 
    ClientBillingView, 
    ClientDocumentsView, 
    KYCStatusIndicator 
} from './ClientDossierModules';

export interface StaffMember {
    id: string;
    name: string;
    role: string;
    department: string;
    email: string;
    phone: string;
    startDate: string;
    status: 'Active' | 'Suspended' | 'On Leave';
    annualLeaveTotal: number;
    annualLeaveUsed: number;
    sickDaysUsed: number;
    cleRequired: number;
    cleEarned: number;
    salary: number;
    bankAccount: string;
    hardware: { id: string; type: string; name: string; status: 'Active' | 'Returned' | 'Lost' }[];
    appraisals: { date: string; rating: string; reviewer: string; notes?: string }[];
    kycStatus?: 'Verified' | 'Pending' | 'Rejected';
    associatedMatters?: Matter[];
    billingSummary?: { totalInvoiced: number; outstanding: number; trustBalance: number };
    sharedDocuments?: KnowledgeArtifact[];
}

const TAB_OPTIONS = [
    { id: 'profile', label: 'Identity & Access', icon: <Shield size={16} />, roles: ['ALL'] },
    { id: 'leave', label: 'Leave & Absences', icon: <Calendar size={16} />, roles: ['PRACTITIONER'] },
    { id: 'compliance', label: 'CLE & Compliance', icon: <Award size={16} />, roles: ['PRACTITIONER'] },
    { id: 'performance', label: 'Performance', icon: <Activity size={16} />, roles: ['PRACTITIONER'] },
    { id: 'activity', label: 'Activity Heatmap', icon: <Activity size={16} />, roles: ['PRACTITIONER'] },
    { id: 'payroll', label: 'Payroll & Comp', icon: <Banknote size={16} />, roles: ['PRACTITIONER'] },
    { id: 'assets', label: 'Hardware Assets', icon: <MonitorSmartphone size={16} />, roles: ['PRACTITIONER'] },
    { id: 'matters', label: 'Sovereign Matters', icon: <Scale size={16} />, roles: ['CLIENT'] },
    { id: 'client-billing', label: 'Billing & Ledger', icon: <Banknote size={16} />, roles: ['CLIENT'] },
    { id: 'documents', label: 'Legal Vault', icon: <FileSignature size={16} />, roles: ['CLIENT'] },
] as const;

type TabId = typeof TAB_OPTIONS[number]['id'];

interface DossierWorkspaceProps {
    isSelfService?: boolean;
}

const DossierWorkspace: React.FC<DossierWorkspaceProps> = ({ isSelfService }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { session, can } = useSovereign();
    
    const [activeTab, setActiveTab] = useState<TabId>('profile');
    const [staff, setStaff] = useState<StaffMember | null>(null);
    const [heatmapData, setHeatmapData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [editingProfile, setEditingProfile] = useState(false);
    const [profileForm, setProfileForm] = useState({ name: '', email: '', phone: '', bankAccount: '' });

    const targetId = isSelfService ? session?.userId : id;

    useEffect(() => {
        if (!targetId) {
            if (isSelfService && !session?.userId) return; // Wait for session
            setIsLoading(false);
            return;
        }

        const fetchDossier = async () => {
            try {
                setIsLoading(true);
                const dossierUrl = isSelfService ? '/api/firm/my-dossier' : `/api/firm/staff/${targetId}/dossier`;
                const [data, heatmap] = await Promise.all([
                    authorizedFetch(dossierUrl, { token: session?.token }),
                    authorizedFetch(`/api/productivity/heatmap/${targetId}`, { token: session?.token }).catch(() => null)
                ]);
                setStaff(data);
                setProfileForm({
                    name: data.name,
                    email: data.email,
                    phone: data.phone || '',
                    bankAccount: data.bankAccount || ''
                });
                if (heatmap) setHeatmapData(heatmap);
            } catch (error) {
                console.error('Failed to fetch staff dossier', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchDossier();
    }, [targetId, isSelfService, session?.token]);

    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsSubmitting(true);
            await authorizedFetch('/api/firm/my-profile', {
                method: 'PUT',
                token: session?.token,
                body: JSON.stringify(profileForm)
            });
            setStaff(prev => prev ? { ...prev, ...profileForm } : null);
            setEditingProfile(false);
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading || !staff) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
                <Loader2 className="text-brand-primary animate-spin" size={32} />
                <p className="text-brand-muted text-[10px] font-bold uppercase tracking-widest">Hydrating Dossier...</p>
            </div>
        );
    }

    const renderProfile = () => (
        <div className="space-y-6 animate-in fade-in duration-500">
            <form onSubmit={handleProfileUpdate} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-brand-sidebar border border-brand-border p-5 rounded-2xl shadow-sm">
                        <p className="text-[10px] font-bold text-brand-muted uppercase tracking-widest mb-1">Full Name</p>
                        {editingProfile ? (
                            <input
                                title="Full Name"
                                type="text"
                                value={profileForm.name}
                                onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                                className="bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-sm text-brand-text w-full focus:outline-none focus:ring-1 focus:ring-brand-primary/50"
                            />
                        ) : (
                            <p className="text-sm text-brand-text font-semibold">{staff.name}</p>
                        )}
                    </div>
                    <div className="bg-brand-sidebar border border-brand-border p-5 rounded-2xl shadow-sm">
                        <p className="text-[10px] font-bold text-brand-muted uppercase tracking-widest mb-1">Role / Department</p>
                        <p className="text-sm text-brand-text font-semibold">{staff.role} • {staff.department}</p>
                    </div>
                    <div className="bg-brand-sidebar border border-brand-border p-5 rounded-2xl shadow-sm">
                        <p className="text-[10px] font-bold text-brand-muted uppercase tracking-widest mb-1">Contact Email</p>
                        {editingProfile ? (
                            <input
                                title="Email"
                                type="email"
                                value={profileForm.email}
                                onChange={e => setProfileForm({ ...profileForm, email: e.target.value })}
                                className="bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-sm text-brand-text w-full focus:outline-none focus:ring-1 focus:ring-brand-primary/50"
                            />
                        ) : (
                            <p className="text-sm text-brand-muted font-mono">{staff.email}</p>
                        )}
                    </div>
                    <div className="bg-brand-sidebar border border-brand-border p-5 rounded-2xl shadow-sm">
                        <p className="text-[10px] font-bold text-brand-muted uppercase tracking-widest mb-1">Contact Phone</p>
                        {editingProfile ? (
                            <input
                                title="Phone"
                                type="text"
                                value={profileForm.phone}
                                onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })}
                                className="bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-sm text-brand-text w-full focus:outline-none focus:ring-1 focus:ring-brand-primary/50"
                            />
                        ) : (
                            <p className="text-sm text-brand-muted font-mono">{staff.phone || 'N/A'}</p>
                        )}
                    </div>
                </div>

                {isSelfService && (
                    <div className="flex gap-3">
                        {editingProfile ? (
                            <>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20"
                                >
                                    {isSubmitting ? <Loader2 className="animate-spin" size={14} /> : <CheckCircle2 size={14} />} Save Updates
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setEditingProfile(false)}
                                    className="text-brand-muted text-xs font-bold hover:text-brand-text transition-colors"
                                >
                                    Discard
                                </button>
                            </>
                        ) : (
                            <button
                                type="button"
                                onClick={() => setEditingProfile(true)}
                                className="bg-brand-primary/10 hover:bg-brand-primary/20 text-brand-primary border border-brand-primary/20 px-6 py-2 rounded-xl text-xs font-bold transition-all"
                            >
                                Edit Identity Data
                            </button>
                        )}
                    </div>
                )}
            </form>
        </div>
    );

    const renderActivity = () => {
        if (!heatmapData) return <div className="text-center py-10 text-brand-muted">Activity index pending.</div>;
        const maxCount = Math.max(...(heatmapData.heatmap || []).map((d: any) => d.count), 1);

        return (
            <div className="space-y-6">
                <div className="bg-brand-sidebar border border-brand-border p-6 rounded-[2rem] shadow-inner">
                    <h3 className="text-sm font-bold text-brand-text mb-6">Sovereign Proof of Work (90D)</h3>
                    <div className="flex flex-wrap gap-1.5">
                        {(heatmapData.heatmap || []).map((day: any) => {
                            const intensity = Math.max(0.1, day.count / maxCount);
                            return (
                                <div
                                    key={day.date}
                                    title={`${day.date}: ${day.count} activities`}
                                    className="w-4 h-4 rounded-sm transition-all hover:ring-2 hover:ring-brand-primary"
                                    style={{ backgroundColor: day.count === 0 ? 'rgba(255,255,255,0.05)' : `rgba(16, 185, 129, ${intensity})` }}
                                />
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col gap-6 animate-in slide-in-from-bottom-4 duration-500">
            {/* Workspace Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-full bg-brand-primary/20 border-2 border-brand-primary/30 flex items-center justify-center text-2xl font-black text-brand-primary shadow-lg shadow-brand-primary/10">
                        {staff.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-black text-brand-text tracking-tight">{staff.name}</h1>
                            {staff.status === 'Active' ? (
                                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">Operational</span>
                            ) : (
                                <span className="bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">{staff.status}</span>
                            )}
                        </div>
                        <p className="text-sm text-brand-muted font-medium mt-1 uppercase tracking-widest">{staff.role} • {staff.department}</p>
                    </div>
                </div>
                {can('identity') && !isSelfService && (
                    <button className="bg-brand-sidebar border border-brand-border px-4 py-2 rounded-xl text-xs font-bold text-brand-muted hover:text-brand-text transition-all">
                        Manage Permissions
                    </button>
                )}
            </div>

            {/* Main Workspace Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-8 mt-4">
                {/* Navigation Rails */}
                <div className="space-y-1">
                    <p className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em] pl-4 mb-4">Workspace Modules</p>
                    {TAB_OPTIONS.filter(tab => {
                        const roles = tab.roles as readonly string[];
                        if (roles.includes('ALL')) return true;
                        if (staff.role === UserRole.CLIENT) return roles.includes('CLIENT');
                        return roles.includes('PRACTITIONER');
                    }).map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as TabId)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all border ${
                                activeTab === tab.id
                                ? 'bg-brand-primary/10 text-brand-primary border-brand-primary/20 shadow-sm'
                                : 'text-brand-muted hover:text-brand-text hover:bg-brand-sidebar/50 border-transparent'
                            }`}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Module Viewport */}
                <div className="bg-brand-sidebar/30 border border-brand-border p-8 rounded-[2.5rem] shadow-sm min-h-[500px]">
                    {activeTab === 'profile' && renderProfile()}
                    {activeTab === 'activity' && renderActivity()}
                    {activeTab === 'leave' && <div className="text-center py-20 text-brand-muted">Absence Ledger Module in migration...</div>}
                    {activeTab === 'compliance' && <div className="text-center py-20 text-brand-muted">CLE Compliance Module in migration...</div>}
                    {activeTab === 'performance' && <div className="text-center py-20 text-brand-muted">Performance Engine Module in migration...</div>}
                    {activeTab === 'payroll' && <div className="text-center py-20 text-brand-muted">Sovereign Payroll Module in migration...</div>}
                    {activeTab === 'assets' && <div className="text-center py-20 text-brand-muted">Asset Registry Module in migration...</div>}
                    
                    {/* Client Modules */}
                    {activeTab === 'matters' && <ClientMattersView matters={staff.associatedMatters || []} />}
                    {activeTab === 'client-billing' && <ClientBillingView billing={staff.billingSummary || { totalInvoiced: 0, outstanding: 0, trustBalance: 0 }} />}
                    {activeTab === 'documents' && <ClientDocumentsView docs={staff.sharedDocuments || []} />}
                </div>
            </div>
        </div>
    );
};

export default DossierWorkspace;
