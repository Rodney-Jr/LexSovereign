import React, { useState } from 'react';
import { LeaveRecord, HRArtifact, UserRole } from '../types';
import { Users, Calendar, FileText, UserCheck, ShieldAlert, CheckCircle2, XCircle, Search, Filter, Lock } from 'lucide-react';

interface HRWorkbenchProps {
    userRole: UserRole;
    leaveRecords: LeaveRecord[];
    hrArtifacts: HRArtifact[];
    onApproveLeave: (id: string) => void;
    onRejectLeave: (id: string) => void;
    onUploadArtifact: (artifact: Omit<HRArtifact, 'id'>) => void;
}

const SovereignHRWorkbench: React.FC<HRWorkbenchProps> = ({ userRole, leaveRecords, hrArtifacts, onApproveLeave, onRejectLeave, onUploadArtifact }) => {
    const [activeTab, setActiveTab] = useState<'recruitment' | 'leave' | 'compliance'>('leave');

    const isAdminManager = userRole === 'ADMIN_MANAGER' || userRole === 'OWNER';

    return (
        <div className="flex flex-col gap-6">
            {/* Tab Navigation */}
            <div className="flex gap-1 bg-slate-900/50 p-1 rounded-xl border border-slate-800 w-fit">
                {(['recruitment', 'leave', 'compliance'] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${activeTab === tab
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                            }`}
                    >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                ))}
            </div>

            <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
                {activeTab === 'leave' && (
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    <Calendar className="text-blue-400" size={20} />
                                    Leave & Absence Management
                                </h3>
                                <p className="text-xs text-slate-500 mt-1">Review and approve practitioner leave requests.</p>
                            </div>
                            <div className="flex gap-2">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                                    <input
                                        type="text"
                                        placeholder="Search staff..."
                                        className="bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-300 outline-none focus:ring-1 focus:ring-blue-500 w-48"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {leaveRecords.map((record) => (
                                <div key={record.id} className="p-4 bg-slate-950 rounded-xl border border-slate-800 hover:border-slate-700 transition-all group">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700 text-sm font-bold text-white">
                                                {record.userName.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <div>
                                                <div className="text-sm font-semibold text-white">{record.userName}</div>
                                                <div className="text-[10px] text-slate-500 flex items-center gap-2 mt-0.5">
                                                    <span className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 text-slate-400 uppercase tracking-tighter">
                                                        {record.type}
                                                    </span>
                                                    <span>•</span>
                                                    <span>{record.startDate} - {record.endDate}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {record.status === 'PENDING' ? (
                                                <>
                                                    <button
                                                        onClick={() => onApproveLeave(record.id)}
                                                        className="p-2 hover:bg-emerald-500/10 text-emerald-500 rounded-lg transition-colors border border-transparent hover:border-emerald-500/20"
                                                        title="Approve Request"
                                                    >
                                                        <CheckCircle2 size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => onRejectLeave(record.id)}
                                                        className="p-2 hover:bg-red-500/10 text-red-500 rounded-lg transition-colors border border-transparent hover:border-red-500/20"
                                                        title="Reject Request"
                                                    >
                                                        <XCircle size={18} />
                                                    </button>
                                                </>
                                            ) : (
                                                <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded ${record.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                                    }`}>
                                                    {record.status}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    {record.notes && (
                                        <div className="mt-3 text-[11px] text-slate-400 italic bg-slate-900/50 p-2 rounded border-l-2 border-slate-700">
                                            "{record.notes}"
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'recruitment' && (
                    <div className="p-12 text-center space-y-4">
                        <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto border border-blue-500/20">
                            <Users className="text-blue-400" size={32} />
                        </div>
                        <div>
                            <h4 className="text-lg font-bold text-white tracking-tight">Recruitment Pipeline</h4>
                            <p className="text-sm text-slate-500 max-w-sm mx-auto mt-2">
                                Securely manage candidate resumes and interview artifacts within the Private Enclave.
                            </p>
                        </div>
                        <button className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-xl shadow-blue-500/20 transition-all">
                            Initialize Talent Search
                        </button>
                    </div>
                )}

                {activeTab === 'compliance' && (
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <ShieldAlert className="text-amber-400" size={20} />
                                Compliance & Training (CLE)
                            </h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                                { name: 'OIDC Identity Audit', status: 'Compliant', date: 'Last run: 2h ago' },
                                { name: 'Hardware Key Rotation', status: 'Due in 5d', date: 'Next: Mar 11, 2026' },
                                { name: 'CLE Credits Review', status: 'In Progress', date: '8/12 lawyers eligible' },
                                { name: 'Data Sovereignty Check', status: 'Nominal', date: 'SOV-PR-1 active' }
                            ].map((item) => (
                                <div key={item.name} className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-start">
                                    <div>
                                        <div className="text-xs font-semibold text-slate-300">{item.name}</div>
                                        <div className="text-[10px] text-slate-500 mt-1">{item.date}</div>
                                    </div>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.status === 'Compliant' || item.status === 'Nominal' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                                        }`}>
                                        {item.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Sensitive HR Data Alert for non-admins */}
            {!isAdminManager && (
                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex gap-3">
                    <Lock className="text-amber-400 shrink-0" size={18} />
                    <p className="text-xs text-amber-200/80 leading-relaxed">
                        <strong>Access Restricted:</strong> Sensitive HR artifacts (contracts, payroll, files) are only visible to the Administrative Manager and Firm Owners. Leave status is public for internal coordination.
                    </p>
                </div>
            )}
        </div>
    );
};

export default SovereignHRWorkbench;
