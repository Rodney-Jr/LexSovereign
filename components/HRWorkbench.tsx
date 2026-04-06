import React, { useState, useEffect } from 'react';
import { UserRole } from '../types';
import {
    Users, Calendar, ShieldAlert, CheckCircle2, XCircle, Search,
    Lock, Plus, X, UserPlus, Award, ClipboardList,
    Clock, CheckSquare, Square, Building2, ChevronRight, Loader2,
    Banknote, TrendingUp, TrendingDown, Zap
} from 'lucide-react';
import { authorizedFetch, getSavedSession } from '../utils/api';
import SovereignStaffDossierModal, { StaffMember } from './SovereignStaffDossierModal';
import ModuleGate from './ModuleGate';
import { usePermissions } from '../hooks/usePermissions';

interface HRWorkbenchProps {
    userRole?: UserRole | string;
}

type LeaveStatus = 'Pending' | 'Approved' | 'Rejected';
type CandidateStage = 'Applied' | 'Interviewed' | 'Offered' | 'Hired' | 'Rejected';

interface Candidate {
    id: string;
    name: string;
    position: string;
    stage: CandidateStage;
    appliedDate: string;
    notes?: string;
}

interface CLERecord {
    name: string;
    role: string;
    creditsRequired: number;
    creditsEarned: number;
    deadline: string;
}

interface OnboardingItem {
    id: string;
    label: string;
    done: boolean;
    assignee?: string;
}

const STAGE_STYLES: Record<CandidateStage, string> = {
    Applied: 'bg-slate-700/50 text-slate-300 border-slate-600',
    Interviewed: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    Offered: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    Hired: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    Rejected: 'bg-red-500/10 text-red-400 border-red-500/20',
};

const STAGES: CandidateStage[] = ['Applied', 'Interviewed', 'Offered', 'Hired', 'Rejected'];

const SovereignHRWorkbench: React.FC<HRWorkbenchProps> = ({ userRole }) => {
    const [activeTab, setActiveTab] = useState<'directory' | 'recruitment' | 'leave' | 'compliance' | 'payroll'>('directory');
    const [leaves, setLeaves] = useState<any[]>([]);
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [onboarding, setOnboarding] = useState<OnboardingItem[]>([]);
    const [staffDirectory, setStaffDirectory] = useState<StaffMember[]>([]);
    const [cleRecords, setCleRecords] = useState<any[]>([]);
    const [payrollData, setPayrollData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchLeave, setSearchLeave] = useState('');
    const [searchStaff, setSearchStaff] = useState('');
    const [showAddCandidate, setShowAddCandidate] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
    const [candidateForm, setCandidateForm] = useState({ name: '', email: '', position: '', stage: 'Applied' as CandidateStage, notes: '' });
    const [editingSalary, setEditingSalary] = useState<{ id: string; value: string } | null>(null);

    const isAdminManager = !userRole || userRole === 'ADMIN_MANAGER' || userRole === 'OWNER' || userRole === 'TENANT_ADMIN' || userRole === 'MANAGING_PARTNER';

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const session = getSavedSession();
                const [staff, leavesData, candidatesData, cleData, onboardingData, pData] = await Promise.all([
                    authorizedFetch('/api/firm/staff', { token: session?.token }),
                    authorizedFetch('/api/firm/leaves', { token: session?.token }),
                    authorizedFetch('/api/firm/recruitment/candidates', { token: session?.token }),
                    authorizedFetch('/api/firm/compliance/cle', { token: session?.token }),
                    authorizedFetch('/api/firm/onboarding', { token: session?.token }),
                    authorizedFetch('/api/firm/payroll', { token: session?.token })
                ]);

                setPayrollData(pData);

                const mappedStaff = staff.map((s: any) => ({ ...s, hardware: [], appraisals: [] }));

                setStaffDirectory(mappedStaff);
                setLeaves(leavesData);

                const mappedCandidates = candidatesData.map((c: any) => ({
                    id: c.id,
                    name: c.name,
                    position: c.role,
                    stage: c.status,
                    appliedDate: c.appliedOn ? c.appliedOn.split('T')[0] : new Date().toISOString().slice(0, 10),
                    notes: c.notes || undefined,
                }));
                setCandidates(mappedCandidates);
                setCleRecords(cleData);
                setOnboarding(onboardingData.map((o: any) => ({
                    id: o.id,
                    label: o.task || 'System task',
                    done: o.isCompleted,
                    assignee: o.role || 'Admin'
                })));
            } catch (error) {
                console.error('Failed to fetch HR data', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchAll();
    }, []);

    const handleApprove = async (id: string) => {
        try {
            const session = getSavedSession();
            await authorizedFetch(`/api/firm/leaves/${id}/status`, {
                method: 'PUT',
                token: session?.token,
                body: JSON.stringify({ status: 'Approved' })
            });
            setLeaves(prev => prev.map(l => l.id === id ? { ...l, status: 'Approved' } : l));
        } catch (e) {
            console.error(e);
        }
    };

    const handleReject = async (id: string) => {
        try {
            const session = getSavedSession();
            await authorizedFetch(`/api/firm/leaves/${id}/status`, {
                method: 'PUT',
                token: session?.token,
                body: JSON.stringify({ status: 'Rejected' })
            });
            setLeaves(prev => prev.map(l => l.id === id ? { ...l, status: 'Rejected' } : l));
        } catch (e) {
            console.error(e);
        }
    };

    const toggleOnboarding = async (id: string) => {
        try {
            const session = getSavedSession();
            await authorizedFetch(`/api/firm/onboarding/${id}/toggle`, {
                method: 'PUT',
                token: session?.token
            });
            setOnboarding(prev => prev.map(o => o.id === id ? { ...o, done: !o.done } : o));
        } catch (e) {
            console.error(e);
        }
    };

    const handleAddCandidate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!candidateForm.name.trim() || !candidateForm.position.trim()) return;

        try {
            setIsSubmitting(true);
            const session = getSavedSession();
            const newCand = await authorizedFetch('/api/firm/recruitment/candidates', {
                method: 'POST',
                token: session?.token,
                body: JSON.stringify({
                    name: candidateForm.name,
                    email: candidateForm.email || 'candidate@pending.com',
                    role: candidateForm.position,
                    status: candidateForm.stage,
                    notes: candidateForm.notes
                })
            });

            setCandidates(prev => [{
                id: newCand.id,
                name: newCand.name,
                position: newCand.role,
                stage: newCand.status as CandidateStage,
                appliedDate: newCand.appliedOn ? newCand.appliedOn.split('T')[0] : new Date().toISOString().slice(0, 10),
                notes: candidateForm.notes || undefined,
            }, ...prev]);

            setCandidateForm({ name: '', email: '', position: '', stage: 'Applied', notes: '' });
            setShowAddCandidate(false);
        } catch (e) {
            console.error(e);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateStaffStatus = async (id: string, newStatus: 'Active' | 'Suspended') => {
        try {
            const session = getSavedSession();
            await authorizedFetch(`/api/firm/staff/${id}/status`, {
                method: 'PUT',
                token: session?.token,
                body: JSON.stringify({ status: newStatus })
            });
        } catch (e) {
            console.error('[HR] Failed to update staff status:', e);
        }
        setStaffDirectory(prev => prev.map(s => s.id === id ? { ...s, status: newStatus } : s));
        if (selectedStaff && selectedStaff.id === id) {
            setSelectedStaff(prev => prev ? { ...prev, status: newStatus } : null);
        }
    };

    const handleMoveStage = async (candidateId: string, newStage: CandidateStage) => {
        try {
            const session = getSavedSession();
            await authorizedFetch(`/api/firm/recruitment/candidates/${candidateId}/stage`, {
                method: 'PUT',
                token: session?.token,
                body: JSON.stringify({ status: newStage })
            });
            setCandidates(prev => prev.map(c => c.id === candidateId ? { ...c, stage: newStage } : c));
        } catch (e) {
            console.error('[HR] Failed to move candidate stage:', e);
        }
    };

    const handleSalaryUpdate = async (userId: string) => {
        if (!editingSalary || editingSalary.id !== userId) return;
        const amount = parseFloat(editingSalary.value);
        if (isNaN(amount) || amount < 0) return;
        try {
            const session = getSavedSession();
            await authorizedFetch('/api/firm/salary', {
                method: 'POST',
                token: session?.token,
                body: JSON.stringify({ userId, baseSalary: amount, effectiveFrom: new Date().toISOString() })
            });
            setPayrollData((prev: any[]) => prev.map(p => p.id === userId ? { ...p, salary: amount, lastUpdated: new Date().toISOString().split('T')[0] } : p));
        } catch (e) {
            console.error('[HR] Failed to update salary:', e);
        } finally {
            setEditingSalary(null);
        }
    };

    const pendingCount = leaves.filter(l => l.status === 'Pending').length;
    const approvedCount = leaves.filter(l => l.status === 'Approved').length;

    const filteredLeaves = leaves.filter(l =>
        l.staffName?.toLowerCase().includes(searchLeave.toLowerCase()) ||
        l.type?.toLowerCase().includes(searchLeave.toLowerCase())
    );

    const filteredStaff = staffDirectory.filter(s =>
        s.name?.toLowerCase().includes(searchStaff.toLowerCase()) ||
        s.role?.toLowerCase().includes(searchStaff.toLowerCase()) ||
        s.department?.toLowerCase().includes(searchStaff.toLowerCase())
    );

    const tabs = [
        { key: 'directory', label: 'Staff Directory', icon: <Building2 size={14} /> },
        { key: 'leave', label: 'Leave & Absence', icon: <Calendar size={14} /> },
        { key: 'recruitment', label: 'Recruitment', icon: <UserPlus size={14} />, isPremium: true },
        { key: 'compliance', label: 'CLE & Compliance', icon: <Award size={14} />, isPremium: true },
        { key: 'payroll', label: 'Payroll Overview', icon: <Banknote size={14} />, isPremium: true },
    ] as const;

    useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setShowAddCandidate(false); };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, []);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl lg:text-3xl font-black text-white tracking-tight flex items-center gap-3">
                        <div className="p-2.5 bg-blue-500/10 rounded-2xl border border-blue-500/20">
                            <Users className="text-blue-400" size={22} />
                        </div>
                        Sovereign HR Workbench
                    </h2>
                    <p className="text-slate-400 text-xs mt-2">Personnel management, recruitment, leave, and compliance tracking.</p>
                </div>
                {activeTab === 'recruitment' && (
                    <button
                        onClick={() => setShowAddCandidate(true)}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-2 transition-all shadow-xl shadow-blue-900/20 self-start"
                    >
                        <Plus size={16} /> Add Candidate
                    </button>
                )}
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800 w-fit">
                {tabs.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`px-5 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 relative ${activeTab === tab.key
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}
                    >
                        {tab.icon}
                        {tab.label}
                        {tab.key === 'leave' && pendingCount > 0 && (
                            <span className="bg-amber-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">{pendingCount}</span>
                        )}
                    </button>
                ))}
            </div>

            {/* ─── STAFF DIRECTORY TAB ─── */}
            {activeTab === 'directory' && (
                <div className="space-y-6">
                    {isLoading ? (
                        <div className="p-16 flex justify-center items-center text-blue-500">
                            <Loader2 className="animate-spin" size={32} />
                        </div>
                    ) : (
                        <>
                            <div className="relative w-full max-w-md">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                                <input
                                    type="text"
                                    placeholder="Search by name, role, or department..."
                                    value={searchStaff}
                                    onChange={e => setSearchStaff(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-blue-500/50 transition-all shadow-inner"
                                />
                            </div>

                            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-slate-800 bg-slate-900/50">
                                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Practitioner</th>
                                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Role & Dept</th>
                                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Status</th>
                                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredStaff.map(staff => (
                                            <tr
                                                key={staff.id}
                                                onClick={() => setSelectedStaff(staff)}
                                                className="border-b border-slate-800/50 hover:bg-slate-800/50 transition-colors cursor-pointer group"
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-blue-400">
                                                            {staff.name?.split(' ').map(n => n[0]).join('') || '?'}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">{staff.name}</p>
                                                            <p className="text-[10px] text-slate-500 font-mono">{staff.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-xs font-medium text-slate-300">{staff.role}</p>
                                                    <p className="text-[10px] text-slate-500 uppercase">{staff.department}</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border ${staff.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : staff.status === 'Suspended' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                                                        {staff.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button
                                                        title="View Staff Dossier"
                                                        className="text-slate-500 group-hover:text-blue-400 transition-colors p-2 hover:bg-blue-500/10 rounded-full"
                                                    >
                                                        <ChevronRight size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {filteredStaff.length === 0 && (
                                    <div className="p-10 text-center text-slate-500 text-sm font-semibold">
                                        No personnel records match the search.
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* ─── LEAVE TAB ─── */}
            {activeTab === 'leave' && (
                <div className="space-y-6">
                    {isLoading ? (
                        <div className="p-16 flex justify-center items-center text-blue-500">
                            <Loader2 className="animate-spin" size={32} />
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-3 gap-4">
                                {[
                                    { label: 'Pending', value: pendingCount, color: 'amber' },
                                    { label: 'Approved', value: approvedCount, color: 'emerald' },
                                    { label: 'Total Requests', value: leaves.length, color: 'blue' },
                                ].map(s => (
                                    <div key={s.label} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-center">
                                        <p className={`text-2xl font-black text-${s.color}-400`}>{s.value}</p>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">{s.label}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="relative w-64">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                                <input
                                    type="text"
                                    placeholder="Search staff or type..."
                                    value={searchLeave}
                                    onChange={e => setSearchLeave(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-blue-500/50 transition-all"
                                />
                            </div>

                            <div className="space-y-3">
                                {filteredLeaves.map(record => (
                                    <div key={record.id} className="p-5 bg-slate-900 border border-slate-800 rounded-2xl hover:border-slate-700 transition-all">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-sm font-black text-blue-400">
                                                    {record.staffName?.split(' ').map((n: string) => n[0]).join('') || '?'}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-white">{record.staffName}</p>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <span className="text-[10px] font-bold uppercase text-slate-500 bg-slate-800 border border-slate-700 px-1.5 py-0.5 rounded">{record.type}</span>
                                                        <span className="text-[10px] font-mono text-slate-600">{record.startDate} → {record.endDate}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                {record.status === 'Pending' ? (
                                                    <>
                                                        <button onClick={() => handleApprove(record.id)} title="Approve" className="p-2 hover:bg-emerald-500/10 text-slate-600 hover:text-emerald-400 rounded-xl transition-all border border-transparent hover:border-emerald-500/20">
                                                            <CheckCircle2 size={18} />
                                                        </button>
                                                        <button onClick={() => handleReject(record.id)} title="Reject" className="p-2 hover:bg-red-500/10 text-slate-600 hover:text-red-400 rounded-xl transition-all border border-transparent hover:border-red-500/20">
                                                            <XCircle size={18} />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border ${record.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                                                        {record.status}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* ─── RECRUITMENT TAB ─── */}
            {activeTab === 'recruitment' && (
                <div className="space-y-6">
                        {isLoading ? (
                            <div className="p-16 flex justify-center items-center text-blue-500">
                                <Loader2 className="animate-spin" size={32} />
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                                {STAGES.map(stage => {
                                    const stageCandidates = candidates.filter(c => c.stage === stage);
                                    return (
                                        <div key={stage} className="bg-slate-900/50 border border-slate-800/50 rounded-3xl p-5 min-h-[400px]">
                                            <div className="flex items-center justify-between mb-5 px-1">
                                                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{stage}</h4>
                                                <span className="text-[10px] font-bold text-slate-600 bg-slate-800 px-2 py-0.5 rounded-full">{stageCandidates.length}</span>
                                            </div>
                                            <div className="space-y-3">
                                                {stageCandidates.map(candidate => (
                                                    <div key={candidate.id} className="bg-slate-900 border border-slate-800 p-4 rounded-2xl hover:border-slate-700 transition-all group">
                                                        <p className="text-sm font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">{candidate.name}</p>
                                                        <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-2">{candidate.position}</p>
                                                        <p className="text-[10px] text-slate-600 font-bold mb-3">
                                                            Applied: {candidate.appliedDate ? new Date(candidate.appliedDate).toLocaleDateString() : 'N/A'}
                                                        </p>
                                                        <select
                                                            title="Move to stage"
                                                            value={candidate.stage}
                                                            onChange={e => handleMoveStage(candidate.id, e.target.value as CandidateStage)}
                                                            onClick={e => e.stopPropagation()}
                                                            className="w-full bg-slate-800 border border-slate-700 text-slate-300 text-[10px] font-bold uppercase tracking-widest rounded-lg px-2 py-1.5 cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                        >
                                                            {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                                                        </select>
                                                    </div>
                                                ))}
                                                {stageCandidates.length === 0 && (
                                                    <div className="h-20 border border-dashed border-slate-800 rounded-2xl flex items-center justify-center text-[10px] text-slate-700 font-bold uppercase tracking-widest">
                                                        Empty
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
            )}

            {/* ─── COMPLIANCE / CLE TAB ─── */}
            {activeTab === 'compliance' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                        {isLoading ? (
                            <div className="p-16 flex justify-center items-center text-blue-500">
                                <Loader2 className="animate-spin" size={32} />
                            </div>
                        ) : (
                            <>
                                <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-8 space-y-6">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Award className="text-amber-400" size={20} />
                                        <h3 className="text-base font-bold text-white">CLE Credit Tracking</h3>
                                        <span className="text-[10px] text-slate-500 font-bold uppercase">Deadline: {cleRecords[0]?.deadline || '2026-12-31'}</span>
                                    </div>
                                    <div className="space-y-5">
                                        {cleRecords.map((staff: any) => {
                                            const pct = Math.min(100, Math.round((staff.completedCredits / staff.requiredCredits) * 100)) || 0;
                                            const isComplete = pct >= 100;
                                            return (
                                                <div key={staff.id} className="space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <span className="text-sm font-bold text-white">{staff.staffName}</span>
                                                        </div>
                                                        <span className={`text-[10px] font-black ${isComplete ? 'text-emerald-400' : 'text-amber-400'}`}>
                                                            {staff.completedCredits}/{staff.requiredCredits} credits
                                                        </span>
                                                    </div>
                                                    <div className="w-full bg-slate-800 rounded-full h-2">
                                                        <div
                                                            className={`h-2 rounded-full transition-all duration-700 ${isComplete ? 'bg-emerald-500' : 'bg-amber-500'}`}
                                                            style={{ width: `${pct}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        {cleRecords.length === 0 && (
                                            <div className="text-slate-500 text-sm text-center py-4">
                                                No CLE records available.
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-8 space-y-5">
                                    <div className="flex items-center gap-3">
                                        <ClipboardList className="text-blue-400" size={20} />
                                        <h3 className="text-base font-bold text-white">New Joiner Onboarding Checklist</h3>
                                        <span className="text-[10px] font-black text-slate-500 uppercase ml-auto">
                                            {onboarding.filter(o => o.done).length}/{onboarding.length} Complete
                                        </span>
                                    </div>
                                    <div className="space-y-3">
                                        {onboarding.map(item => (
                                            <button
                                                key={item.id}
                                                onClick={() => toggleOnboarding(item.id)}
                                                className={`w-full flex items-center gap-4 p-4 rounded-2xl border text-left transition-all ${item.done ? 'bg-emerald-500/5 border-emerald-500/20 opacity-70' : 'bg-slate-950 border-slate-800 hover:border-slate-700'}`}
                                            >
                                                {item.done
                                                    ? <CheckSquare size={18} className="text-emerald-400 shrink-0" />
                                                    : <Square size={18} className="text-slate-600 shrink-0" />
                                                }
                                                <div className="flex-1 min-w-0">
                                                    <span className={`text-sm font-medium ${item.done ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                                                        {item.label}
                                                    </span>
                                                    {item.assignee && (
                                                        <span className="text-[10px] text-slate-600 ml-3">→ {item.assignee}</span>
                                                    )}
                                                </div>
                                            </button>
                                        ))}
                                        {onboarding.length === 0 && (
                                            <div className="text-slate-500 text-sm text-center py-4">
                                                No onboarding tasks available.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
            )}

            {!isAdminManager && (
                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex gap-3">
                    <Lock className="text-amber-400 shrink-0" size={18} />
                    <p className="text-xs text-amber-200/80 leading-relaxed">
                        <strong>Access Restricted:</strong> Sensitive HR artifacts are only visible to the Administrative Manager and Firm Owners.
                    </p>
                </div>
            )}

            {/* Add Candidate Modal */}
            {showAddCandidate && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-xl">
                    <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl space-y-7 animate-in zoom-in-95 duration-300">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20">
                                    <UserPlus className="text-blue-400" size={22} />
                                </div>
                                <div>
                                    <h4 className="text-lg font-bold text-white">Add Candidate</h4>
                                    <p className="text-xs text-slate-500">Add to recruitment pipeline.</p>
                                </div>
                            </div>
                            <button onClick={() => setShowAddCandidate(false)} className="p-2 hover:bg-slate-800 rounded-full text-slate-500 hover:text-white transition-colors" title="Close">
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleAddCandidate} className="space-y-5">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Full Name</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="e.g. Ama Boateng"
                                    value={candidateForm.name}
                                    onChange={e => setCandidateForm(f => ({ ...f, name: e.target.value }))}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-3.5 text-sm text-white focus:border-blue-500/50 focus:outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Email Address</label>
                                <input
                                    type="email"
                                    placeholder="e.g. candidate@email.com"
                                    value={candidateForm.email}
                                    onChange={e => setCandidateForm(f => ({ ...f, email: e.target.value }))}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-3.5 text-sm text-white focus:border-blue-500/50 focus:outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Position Applied For</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="e.g. Junior Associate"
                                    value={candidateForm.position}
                                    onChange={e => setCandidateForm(f => ({ ...f, position: e.target.value }))}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-3.5 text-sm text-white focus:border-blue-500/50 focus:outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Pipeline Stage</label>
                                <select
                                    title="Pipeline Stage"
                                    value={candidateForm.stage}
                                    onChange={e => setCandidateForm(f => ({ ...f, stage: e.target.value as CandidateStage }))}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-3.5 text-sm text-slate-300 focus:border-blue-500/50 focus:outline-none transition-all cursor-pointer"
                                >
                                    {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Notes (optional)</label>
                                <textarea
                                    title="Notes"
                                    rows={2}
                                    placeholder="Interview notes, referrals, etc."
                                    value={candidateForm.notes}
                                    onChange={e => setCandidateForm(f => ({ ...f, notes: e.target.value }))}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-3.5 text-sm text-white focus:border-blue-500/50 focus:outline-none transition-all resize-none"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-blue-900/20 flex items-center justify-center gap-2 active:scale-[0.98]"
                            >
                                {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />}
                                Add to Pipeline
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* ─── PAYROLL OVERVIEW TAB ─── */}
            {activeTab === 'payroll' && (
                <div className="space-y-6">
                        {isLoading ? (
                            <div className="p-16 flex justify-center items-center text-blue-500">
                                <Loader2 className="animate-spin" size={32} />
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-[2rem]">
                                        <div className="flex items-center gap-3 mb-2">
                                            <TrendingUp className="text-emerald-400" size={18} />
                                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Monthly Commitment</p>
                                        </div>
                                        <p className="text-2xl font-black text-white font-mono">
                                            GHS {payrollData.reduce((s, p) => s + p.salary, 0).toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-[2rem]">
                                        <div className="flex items-center gap-3 mb-2">
                                            <TrendingDown className="text-amber-400" size={18} />
                                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Annual Commitment</p>
                                        </div>
                                        <p className="text-2xl font-black text-white font-mono">
                                            GHS {(payrollData.reduce((s, p) => s + p.salary, 0) * 12).toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-[2rem]">
                                        <div className="flex items-center gap-3 mb-2">
                                            <Users className="text-blue-400" size={18} />
                                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Payrolls</p>
                                        </div>
                                        <p className="text-2xl font-black text-white font-mono">{payrollData.filter(p => p.salary > 0).length}</p>
                                    </div>
                                </div>

                                <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-slate-800 bg-slate-900/50">
                                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Practitioner</th>
                                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Base Salary</th>
                                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Last Modified</th>
                                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {payrollData.map((p: any) => (
                                                <tr key={p.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors group">
                                                    <td className="px-6 py-4">
                                                        <div>
                                                            <p className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">{p.name}</p>
                                                            <p className="text-[10px] text-slate-500 uppercase tracking-widest">{p.role}</p>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {editingSalary && editingSalary.id === p.id ? (
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-xs text-slate-400">GHS</span>
                                                                <input
                                                                    type="number"
                                                                    title="Salary amount"
                                                                    autoFocus
                                                                    className="w-28 bg-slate-800 border border-blue-500/40 rounded-lg px-2 py-1 text-sm text-white font-mono focus:outline-none"
                                                                    value={editingSalary.value}
                                                                    onChange={e => setEditingSalary({ id: p.id, value: e.target.value })}
                                                                    onBlur={() => handleSalaryUpdate(p.id)}
                                                                    onKeyDown={e => { if (e.key === 'Enter') handleSalaryUpdate(p.id); if (e.key === 'Escape') setEditingSalary(null); }}
                                                                />
                                                            </div>
                                                        ) : (
                                                            <button
                                                                onClick={() => setEditingSalary({ id: p.id, value: String(p.salary) })}
                                                                className="text-sm font-bold text-white font-mono hover:text-blue-400 transition-colors cursor-pointer"
                                                                title="Click to edit salary"
                                                            >
                                                                GHS {p.salary.toLocaleString()}
                                                            </button>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 text-xs text-slate-400 font-mono">{p.lastUpdated}</td>
                                                    <td className="px-6 py-4 text-right">
                                                        <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${p.salary > 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                                                            {p.salary > 0 ? 'Active' : 'Unset'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        )}
                    </div>
            )}

            {selectedStaff && (
                <SovereignStaffDossierModal
                    staff={selectedStaff}
                    onClose={() => setSelectedStaff(null)}
                    onUpdateStatus={handleUpdateStaffStatus}
                />
            )}
        </div>
    );
};

export default SovereignHRWorkbench;
