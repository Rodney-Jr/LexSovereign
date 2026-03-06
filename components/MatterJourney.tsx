import React from 'react';
import {
    CheckCircle2,
    Circle,
    Clock,
    FileSearch,
    PenTool,
    ShieldCheck,
    ArrowRight
} from 'lucide-react';

interface Stage {
    id: string;
    label: string;
    description: string;
    icon: React.ReactNode;
    status: 'completed' | 'current' | 'upcoming';
}

interface MatterJourneyProps {
    currentStatus: string;
}

const MatterJourney: React.FC<MatterJourneyProps> = ({ currentStatus }) => {
    const stages: Stage[] = [
        {
            id: 'ingestion',
            label: 'Ingestion',
            description: 'Discovery & data synchronization',
            icon: <FileSearch size={18} />,
            status: 'completed'
        },
        {
            id: 'analysis',
            label: 'AI Analysis',
            description: 'Legal research & risk scan',
            icon: <ShieldCheck size={18} />,
            status: currentStatus === 'OPEN' || currentStatus === 'REVIEW' ? 'completed' : 'current'
        },
        {
            id: 'drafting',
            label: 'Drafting',
            description: 'Sovereign document production',
            icon: <PenTool size={18} />,
            status: currentStatus === 'REVIEW' ? 'completed' : currentStatus === 'OPEN' ? 'current' : 'upcoming'
        },
        {
            id: 'review',
            label: 'Review',
            description: 'Counsel & client validation',
            icon: <CheckCircle2 size={18} />,
            status: currentStatus === 'REVIEW' ? 'current' : 'upcoming'
        }
    ];

    return (
        <div className="relative pt-4 overflow-x-auto scrollbar-hide">
            <div className="absolute top-[28px] left-[40px] right-[40px] h-px bg-slate-800 hidden md:block" />

            <div className="flex flex-col md:flex-row justify-between items-start gap-8 md:gap-4 min-w-max pb-4 px-4">
                {stages.map((stage, idx) => (
                    <div key={stage.id} className="relative flex flex-row md:flex-col items-center gap-6 md:gap-4 md:text-center w-full md:w-[22%] group z-10">
                        <div className={`relative w-12 h-12 rounded-2xl flex items-center justify-center border transition-all duration-500 shrink-0 ${stage.status === 'completed'
                            ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                            : stage.status === 'current'
                                ? 'bg-blue-600/10 border-blue-500/60 text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.3)]'
                                : 'bg-slate-900 border-slate-800 text-slate-600'
                            }`}>
                            {stage.status === 'completed' ? <CheckCircle2 size={22} className="text-emerald-400" /> :
                                stage.status === 'current' ? React.cloneElement(stage.icon as React.ReactElement<{ size: number; className?: string }>, { size: 22, className: "text-blue-400" }) :
                                    React.cloneElement(stage.icon as React.ReactElement<{ size: number }>, { size: 20 })
                            }
                        </div>

                        <div className="md:pt-1 space-y-1 w-full">
                            <div className="flex flex-col md:items-center justify-center">
                                <h5 className={`font-bold text-xs uppercase tracking-widest ${stage.status === 'upcoming' ? 'text-slate-500' : 'text-white'
                                    }`}>
                                    {stage.label}
                                </h5>
                                {stage.status === 'current' && (
                                    <span className="text-[7px] font-black uppercase tracking-[0.2em] text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full mt-1 border border-blue-500/20 shadow-sm animate-pulse whitespace-nowrap">
                                        Active Phase
                                    </span>
                                )}
                            </div>
                            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter opacity-70 line-clamp-2 md:max-w-[120px] mx-auto leading-relaxed">
                                {stage.description}
                            </p>
                        </div>

                        {/* Mobile arrow indicator */}
                        {idx < stages.length - 1 && (
                            <div className="md:hidden absolute -bottom-6 left-6 text-slate-700">
                                <ArrowRight size={12} className="rotate-90" />
                            </div>
                        )}

                        {/* Desktop step completion line */}
                        {idx < stages.length - 1 && (
                            <div className={`hidden md:block absolute top-[24px] left-[calc(50%+24px)] w-[calc(100%-48px)] h-px ${stage.status === 'completed' ? 'bg-emerald-500/40' : 'bg-slate-800'}`} />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MatterJourney;
