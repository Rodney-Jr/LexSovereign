import React, { useState } from 'react';
import {
    X, User, Shield, Briefcase, Calendar, Award,
    CheckCircle2, AlertCircle, FileText, Activity,
    TrendingDown, Plus, ChevronRight, Lock, Unlock,
    DollarSign, MonitorSmartphone, Key, ShieldCheck,
    Banknote, Loader2
} from 'lucide-react';
import { authorizedFetch, getSavedSession } from '../utils/api';

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
}

interface SovereignStaffDossierModalProps {
    staff: StaffMember;
    onClose: () => void;
    onUpdateStatus: (id: string, newStatus: 'Active' | 'Suspended') => void;
}

const TAB_OPTIONS = [
    { id: 'profile', label: 'Identity & Access', icon: <Shield size={16} /> },
    { id: 'leave', label: 'Leave & Absences', icon: <Calendar size={16} /> },
    { id: 'compliance', label: 'CLE & Compliance', icon: <Award size={16} /> },
    { id: 'performance', label: 'Performance', icon: <Activity size={16} /> },
    { id: 'payroll', label: 'Payroll & Comp', icon: <Banknote size={16} /> },
    { id: 'assets', label: 'Hardware Assets', icon: <MonitorSmartphone size={16} /> },
] as const;

type TabId = typeof TAB_OPTIONS[number]['id'];

const SovereignStaffDossierModal: React.FC<SovereignStaffDossierModalProps> = ({ staff: basicStaff, onClose, onUpdateStatus }) => {
    const [activeTab, setActiveTab] = useState<TabId>('profile');
    const [staff, setStaff] = useState<StaffMember | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch full dossier on mount
    React.useEffect(() => {
        const fetchDossier = async () => {
            try {
                const session = getSavedSession();
                const data = await authorizedFetch(`/api/firm/staff/${basicStaff.id}/dossier`, {
                    token: session?.token
                });
                setStaff(data);
            } catch (error) {
                console.error('Failed to fetch staff dossier', error);
                // Fallback to basic info if dossier fetch fails
                setStaff({
                    ...basicStaff,
                    annualLeaveTotal: 25,
                    annualLeaveUsed: 0,
                    sickDaysUsed: 0,
                    cleRequired: 12,
                    cleEarned: 0,
                    salary: 0,
                    bankAccount: 'N/A',
                    hardware: [],
                    appraisals: [],
                    phone: 'N/A'
                });
            } finally {
                setIsLoading(false);
            }
        };
        fetchDossier();
    }, [basicStaff.id]);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showAppraisalForm, setShowAppraisalForm] = useState(false);
    const [showSalaryForm, setShowSalaryForm] = useState(false);
    const [appraisalForm, setAppraisalForm] = useState({ rating: 'Exceeds Expectations', notes: '', date: new Date().toISOString().slice(0, 10) });
    const [salaryForm, setSalaryForm] = useState({ amount: '', bankAccount: '', effectiveFrom: new Date().toISOString().slice(0, 10) });

    const handleSalarySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!staff) return;
        try {
            setIsSubmitting(true);
            const session = getSavedSession();
            await authorizedFetch('/api/firm/salary', {
                method: 'POST',
                token: session?.token,
                body: JSON.stringify({
                    userId: staff.id,
                    baseSalary: parseFloat(salaryForm.amount),
                    bankAccount: salaryForm.bankAccount,
                    effectiveFrom: salaryForm.effectiveFrom
                })
            });
            // Update local state
            setStaff(prev => prev ? { ...prev, salary: parseFloat(salaryForm.amount), bankAccount: salaryForm.bankAccount } : null);
            setShowSalaryForm(false);
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAppraisalSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!staff) return;
        try {
            setIsSubmitting(true);
            const session = getSavedSession();
            const newAppraisal = await authorizedFetch('/api/firm/appraisals', {
                method: 'POST',
                token: session?.token,
                body: JSON.stringify({
                    userId: staff.id,
                    rating: appraisalForm.rating,
                    notes: appraisalForm.notes,
                    date: appraisalForm.date
                })
            });
            // Update local state (backend returns the record, but we need to map names)
            const mapped = {
                date: newAppraisal.date.split('T')[0],
                rating: newAppraisal.rating,
                reviewer: session?.user?.name || 'Authorized Internal Reviewer',
                notes: newAppraisal.notes
            };
            setStaff(prev => prev ? { ...prev, appraisals: [mapped, ...prev.appraisals] } : null);
            setShowAppraisalForm(false);
            setAppraisalForm({ rating: 'Exceeds Expectations', notes: '', date: new Date().toISOString().slice(0, 10) });
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle ESC to close
    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    if (isLoading || !staff) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="text-blue-400 animate-spin" size={40} />
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Opening Secure Dossier...</p>
                </div>
            </div>
        );
    }

    const renderProfile = () => (
        <div className="space-y-6 animate-in fade-in duration-300">
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Full Name</p>
                    <p className="text-sm text-white font-medium">{staff.name}</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Role / Department</p>
                    <p className="text-sm text-white font-medium">{staff.role} • {staff.department}</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Contact Email</p>
                    <p className="text-sm text-slate-300 font-mono">{staff.email}</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Start Date</p>
                    <p className="text-sm text-slate-300 font-mono">{staff.startDate}</p>
                </div>
            </div>

            <div className="bg-red-500/5 border border-red-500/10 p-6 rounded-2xl space-y-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-500/10 rounded-xl text-red-400">
                        <Lock size={18} />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-red-200">Danger Zone: Access Control</h4>
                        <p className="text-xs text-red-400/60 mt-0.5">Modify NomosDesk access for this practitioner.</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    {staff.status === 'Suspended' ? (
                        <button
                            onClick={() => onUpdateStatus(staff.id, 'Active')}
                            className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
                        >
                            <Unlock size={14} /> Restore Access
                        </button>
                    ) : (
                        <button
                            onClick={() => onUpdateStatus(staff.id, 'Suspended')}
                            className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
                        >
                            <Lock size={14} /> Suspend Access
                        </button>
                    )}
                </div>
            </div>
        </div >
    );

    const renderLeave = () => (
        <div className="space-y-6 animate-in fade-in duration-300">
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col items-center justify-center text-center">
                    <p className="text-3xl font-black text-blue-400">{staff.annualLeaveTotal - staff.annualLeaveUsed}</p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2">{staff.annualLeaveTotal} Total Annual Days</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col items-center justify-center text-center">
                    <p className="text-3xl font-black text-amber-400">{staff.sickDaysUsed}</p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2">Sick Days Taken</p>
                </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-900 border border-slate-800 rounded-2xl">
                <div className="flex items-center gap-3 text-sm text-slate-300">
                    <FileText size={16} className="text-slate-500" />
                    Manually adjust leave balance
                </div>
                <button className="text-xs bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl font-bold transition-all">
                    Adjust Balance
                </button>
            </div>
        </div>
    );

    const renderCompliance = () => {
        const pct = Math.min(100, Math.round((staff.cleEarned / staff.cleRequired) * 100));
        const isComplete = pct >= 100;

        return (
            <div className="space-y-6 animate-in fade-in duration-300">
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-[2rem]">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold text-white">CLE Credits</span>
                        <span className={`text-[10px] font-black ${isComplete ? 'text-emerald-400' : 'text-amber-400'}`}>
                            {staff.cleEarned} / {staff.cleRequired} earned
                        </span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2">
                        <div
                            className={`h-2 rounded-full transition-all duration-700 dynamic-width ${isComplete ? 'bg-emerald-500' : 'bg-amber-500'}`}
                            style={{ '--width': `${pct}%` } as React.CSSProperties}
                        />
                    </div>
                </div>
                <div className="text-center py-10 bg-slate-900 border border-slate-800 rounded-[2rem]">
                    <Award size={32} className="mx-auto text-slate-600 mb-3" />
                    <p className="text-sm text-slate-400 font-medium">No external training certificates logged.</p>
                    <button className="mt-4 text-xs bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 px-4 py-2 rounded-xl font-bold transition-all">
                        Log CLE Credit
                    </button>
                </div>
            </div>
        );
    };

    const renderPerformance = () => (
        <div className="space-y-4 animate-in fade-in duration-300">
            {staff.appraisals.length === 0 ? (
                <div className="text-center py-10 bg-slate-900 border border-slate-800 rounded-[2rem]">
                    <Activity size={32} className="mx-auto text-slate-600 mb-3" />
                    <p className="text-sm text-slate-400 font-medium">No performance appraisals on record.</p>
                </div>
            ) : (
                staff.appraisals.map((rev, idx) => (
                    <div key={idx} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-start justify-between">
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-white">{rev.rating} Appraisal</span>
                                <span className="text-[10px] text-slate-500 border border-slate-700 px-1.5 py-0.5 rounded uppercase">{rev.date}</span>
                            </div>
                            <p className="text-xs text-slate-400 mt-1">Reviewer: {rev.reviewer}</p>
                            {rev.notes && <p className="text-xs text-slate-500 italic mt-2">"{rev.notes}"</p>}
                        </div>
                    </div>
                ))
            )}
            {showAppraisalForm && (
                <form onSubmit={handleAppraisalSubmit} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4 animate-in slide-in-from-top-2 duration-300">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Rating</label>
                            <select
                                title="Appraisal Rating"
                                value={appraisalForm.rating}
                                onChange={e => setAppraisalForm({ ...appraisalForm, rating: e.target.value })}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                            >
                                <option>Exceeds Expectations</option>
                                <option>Meets Expectations</option>
                                <option>Needs Improvement</option>
                                <option>Critical Failure</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Review Date</label>
                            <input
                                title="Review Date"
                                type="date"
                                value={appraisalForm.date}
                                onChange={e => setAppraisalForm({ ...appraisalForm, date: e.target.value })}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Internal Notes</label>
                        <textarea
                            title="Review Notes"
                            value={appraisalForm.notes}
                            onChange={e => setAppraisalForm({ ...appraisalForm, notes: e.target.value })}
                            placeholder="Draft private feedback..."
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none h-20"
                        />
                    </div>
                    <div className="flex gap-2">
                        <button type="button" onClick={() => setShowAppraisalForm(false)} className="flex-1 py-2 text-slate-500 text-[10px] font-bold uppercase tracking-widest">Cancel</button>
                        <button type="submit" disabled={isSubmitting} className="flex-1 bg-blue-600 text-white rounded-xl py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-blue-500 transition-all flex items-center justify-center gap-2">
                            {isSubmitting ? <Loader2 className="animate-spin" size={14} /> : <CheckCircle2 size={14} />} Confirm Review
                        </button>
                    </div>
                </form>
            )}
            <div className="flex gap-2">
                <button
                    onClick={() => setShowAppraisalForm(true)}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-3 rounded-xl text-xs font-bold transition-all"
                >
                    Schedule Review
                </button>
                <button className="flex-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 py-3 rounded-xl text-xs font-bold transition-all">
                    Add Disciplinary Note
                </button>
            </div>
        </div>
    );

    const renderPayroll = () => (
        <div className="space-y-6 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Base Salary (GHS)</p>
                    <p className="text-2xl font-black text-white font-mono">{staff.salary.toLocaleString()}</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Direct Deposit Acc.</p>
                    <p className="text-sm text-slate-300 font-mono mt-2">{staff.bankAccount === 'N/A' ? 'Not Set' : `**** ${staff.bankAccount.slice(-4)}`}</p>
                </div>
            </div>

            {showSalaryForm && (
                <form onSubmit={handleSalarySubmit} className="bg-slate-950 border border-slate-800 p-6 rounded-2xl space-y-4 animate-in slide-in-from-top-2 duration-300">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Base Amount (GHS)</label>
                            <input
                                title="Salary Amount"
                                type="number"
                                required
                                value={salaryForm.amount}
                                onChange={e => setSalaryForm({ ...salaryForm, amount: e.target.value })}
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Account Number</label>
                            <input
                                title="Bank Account Number"
                                type="text"
                                value={salaryForm.bankAccount}
                                onChange={e => setSalaryForm({ ...salaryForm, bankAccount: e.target.value })}
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none"
                            />
                        </div>
                    </div>
                    <div className="flex gap-2 pt-2">
                        <button type="button" onClick={() => setShowSalaryForm(false)} className="px-6 py-2 text-slate-500 text-[10px] font-bold uppercase tracking-widest">Cancel</button>
                        <button type="submit" disabled={isSubmitting} className="flex-1 bg-emerald-600 text-white rounded-xl py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-500 transition-all flex items-center justify-center gap-2">
                            {isSubmitting ? <Loader2 className="animate-spin" size={14} /> : <Banknote size={14} />} Update Payroll Information
                        </button>
                    </div>
                </form>
            )}

            <div className="flex flex-col gap-2">
                <button
                    onClick={() => {
                        setSalaryForm({ amount: staff.salary.toString(), bankAccount: staff.bankAccount, effectiveFrom: new Date().toISOString().slice(0, 10) });
                        setShowSalaryForm(true);
                    }}
                    className="w-full flex items-center justify-between p-4 bg-slate-900 border border-slate-800 rounded-2xl hover:bg-slate-800 transition-all text-left"
                >
                    <div className="flex items-center gap-3">
                        <Plus size={16} className="text-emerald-400" />
                        <div>
                            <span className="text-sm font-bold text-white block">Update Compensation Scheme</span>
                            <span className="text-xs text-slate-500">Record a salary increment or update bank details.</span>
                        </div>
                    </div>
                    <ChevronRight size={16} className="text-slate-600" />
                </button>
                <button className="w-full flex items-center justify-between p-4 bg-slate-900 border border-slate-800 rounded-2xl hover:bg-slate-800 transition-all text-left">
                    <div className="flex items-center gap-3">
                        <TrendingDown size={16} className="text-red-400" />
                        <div>
                            <span className="text-sm font-bold text-white block">Log Deduction</span>
                            <span className="text-xs text-slate-500">Record unpaid leave or clawback.</span>
                        </div>
                    </div>
                    <ChevronRight size={16} className="text-slate-600" />
                </button>
            </div>
        </div>
    );

    const renderAssets = () => (
        <div className="space-y-4 animate-in fade-in duration-300">
            {staff.hardware.map(hw => (
                <div key={hw.id} className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-xl ${hw.type === 'Laptop' ? 'bg-blue-500/10 text-blue-400' : hw.type === 'Phone' ? 'bg-purple-500/10 text-purple-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                            {hw.type === 'Laptop' ? <MonitorSmartphone size={18} /> : hw.type === 'Key' ? <Key size={18} /> : <ShieldCheck size={18} />}
                        </div>
                        <div>
                            <p className="text-sm font-bold text-white">{hw.name}</p>
                            <p className="text-[10px] text-slate-500 font-mono mt-0.5">{hw.id}</p>
                        </div>
                    </div>
                    <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full border ${hw.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : hw.status === 'Lost' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
                        {hw.status}
                    </span>
                </div>
            ))}
            <button className="w-full py-4 border border-dashed border-slate-700 text-slate-400 hover:border-blue-500/50 hover:text-blue-400 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2">
                <Plus size={16} /> Assign Hardware Asset
            </button>
        </div>
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-sm">
            <div className="bg-brand-bg border border-brand-border w-full max-w-4xl rounded-[2rem] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="px-6 py-5 border-b border-brand-border flex items-center justify-between bg-slate-900/50">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-lg font-black text-blue-400 shadow-inner">
                            {staff.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                            <div className="flex items-center gap-3">
                                <h2 className="text-xl font-black text-white">{staff.name}</h2>
                                {staff.status === 'Suspended' ? (
                                    <span className="bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded text-[10px] font-bold uppercase">Suspended</span>
                                ) : staff.status === 'On Leave' ? (
                                    <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded text-[10px] font-bold uppercase">On Leave</span>
                                ) : (
                                    <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded text-[10px] font-bold uppercase">Active</span>
                                )}
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5 font-medium">{staff.role} • {staff.department}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors"
                        title="Close Dossier"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body Layout */}
                <div className="flex flex-col md:flex-row flex-1 overflow-hidden">

                    {/* Sidebar Tabs */}
                    <div className="w-full md:w-64 bg-slate-900/30 border-r border-brand-border p-4 space-y-1 overflow-y-auto">
                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-3 mb-3 mt-2">Dossier Modules</p>
                        {TAB_OPTIONS.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as TabId)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === tab.id
                                    ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-sm'
                                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
                                    }`}
                            >
                                <span className={activeTab === tab.id ? 'text-blue-400' : 'text-slate-500'}>
                                    {tab.icon}
                                </span>
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-brand-bg">
                        {activeTab === 'profile' && renderProfile()}
                        {activeTab === 'leave' && renderLeave()}
                        {activeTab === 'compliance' && renderCompliance()}
                        {activeTab === 'performance' && renderPerformance()}
                        {activeTab === 'payroll' && renderPayroll()}
                        {activeTab === 'assets' && renderAssets()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SovereignStaffDossierModal;
