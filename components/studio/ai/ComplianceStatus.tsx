import React from 'react';
import { ShieldAlert, ShieldCheck, ShieldEllipsis, AlertCircle, FileWarning, Info, ExternalLink, ArrowRight } from 'lucide-react';
import { ComplianceResponse, ComplianceIssue } from '../../../utils/complianceApi';

interface ComplianceStatusProps {
    data: ComplianceResponse | null;
    isLoading: boolean;
    onFix: (issue: ComplianceIssue) => void;
    onReview: (issue: ComplianceIssue) => void;
    onEscalate: (issue: ComplianceIssue) => void;
}

export const ComplianceStatus: React.FC<ComplianceStatusProps> = ({ 
    data, 
    isLoading,
    onFix,
    onReview,
    onEscalate
}) => {
    if (isLoading && !data) {
        return (
            <div className="flex flex-col items-center justify-center p-8 bg-[#161B22] rounded-2xl border border-slate-800 animate-pulse">
                <div className="w-12 h-12 bg-slate-800 rounded-full mb-4"></div>
                <div className="h-4 w-32 bg-slate-800 rounded mb-2"></div>
                <div className="h-3 w-48 bg-slate-800 rounded"></div>
            </div>
        );
    }

    if (!data) return null;

    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'compliant':
                return {
                    icon: <ShieldCheck className="w-8 h-8 text-emerald-400" />,
                    bg: 'bg-emerald-500/10',
                    border: 'border-emerald-500/20',
                    label: 'Compliant',
                    color: 'text-emerald-400'
                };
            case 'partially_compliant':
                return {
                    icon: <ShieldEllipsis className="w-8 h-8 text-amber-400" />,
                    bg: 'bg-amber-500/10',
                    border: 'border-amber-500/20',
                    label: 'Partially Compliant',
                    color: 'text-amber-400'
                };
            default:
                return {
                    icon: <ShieldAlert className="w-8 h-8 text-rose-400" />,
                    bg: 'bg-rose-500/10',
                    border: 'border-rose-500/20',
                    label: 'Non-Compliant',
                    color: 'text-rose-400'
                };
        }
    };

    const config = getStatusConfig(data.status);

    return (
        <div className="space-y-6">
            {/* Score Card */}
            <div className={`p-6 ${config.bg} rounded-2xl border ${config.border} relative overflow-hidden group`}>
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                    {config.icon}
                </div>
                
                <div className="flex items-end gap-2 mb-2">
                    <span className="text-4xl font-black text-slate-100">{data.score}</span>
                    <span className="text-lg text-slate-500 font-bold">/100</span>
                </div>
                
                <div className="flex items-center gap-2 mb-4">
                    <div className={`w-2 h-2 rounded-full animate-pulse ${config.color.replace('text', 'bg')}`} />
                    <span className={`text-xs font-black uppercase tracking-widest ${config.color}`}>
                        {config.label}
                    </span>
                </div>

                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div 
                        className={`h-full transition-all duration-1000 ${config.color.replace('text', 'bg')}`}
                        style={{ width: `${data.score}%` }}
                    />
                </div>
            </div>

            {/* Issue List */}
            <div className="space-y-4">
                {data.issues.map((issue) => (
                    <div 
                        key={issue.id}
                        className="p-4 bg-[#161B22] rounded-xl border border-slate-800/50 hover:border-slate-700 transition-colors group"
                    >
                        <div className="flex items-start gap-3 mb-2">
                            <div className={`p-1.5 rounded-lg shrink-0 ${
                                issue.severity === 'critical' ? 'bg-rose-500/10 text-rose-400' :
                                issue.severity === 'warning' ? 'bg-amber-500/10 text-amber-400' :
                                'bg-blue-500/10 text-blue-400'
                            }`}>
                                {issue.severity === 'critical' ? <AlertCircle className="w-3.5 h-3.5" /> :
                                 issue.severity === 'warning' ? <FileWarning className="w-3.5 h-3.5" /> :
                                 <Info className="w-3.5 h-3.5" />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-bold text-slate-200 truncate">{issue.title}</h4>
                                <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">
                                    {issue.description}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            {issue.action === 'fix' && (
                                <button 
                                    onClick={() => onFix(issue)}
                                    className="flex-1 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-wider rounded-lg border border-indigo-500/20 flex items-center justify-center gap-1.5"
                                >
                                    Auto-Remediate <ArrowRight className="w-3 h-3" />
                                </button>
                            )}
                            {issue.action === 'review' && (
                                <button 
                                    onClick={() => onReview(issue)}
                                    className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-black uppercase tracking-wider rounded-lg border border-slate-700 flex items-center justify-center gap-1.5"
                                >
                                    Flag for Review <ExternalLink className="w-3 h-3" />
                                </button>
                            )}
                            <button 
                                onClick={() => onEscalate(issue)}
                                className="px-3 py-1.5 bg-rose-500/5 hover:bg-rose-500/10 text-rose-400 text-[10px] font-black uppercase tracking-wider rounded-lg border border-rose-500/20"
                            >
                                Escalate
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
