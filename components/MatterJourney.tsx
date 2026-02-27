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
        <div className="relative">
            <div className="absolute left-6 top-0 bottom-0 w-px bg-slate-800" />
            <div className="space-y-8">
                {stages.map((stage, idx) => (
                    <div key={stage.id} className="relative flex gap-6 group">
                        <div className={`relative z-10 w-12 h-12 rounded-2xl flex items-center justify-center border transition-all duration-500 ${stage.status === 'completed'
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                                : stage.status === 'current'
                                    ? 'bg-blue-500/10 border-blue-500/50 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.2)]'
                                    : 'bg-slate-900 border-slate-800 text-slate-600'
                            }`}>
                            {stage.status === 'completed' ? <CheckCircle2 size={20} /> : stage.icon}
                        </div>

                        <div className="flex-1 pt-1">
                            <div className="flex items-center justify-between mb-1">
                                <h5 className={`font-bold text-sm tracking-tight ${stage.status === 'upcoming' ? 'text-slate-500' : 'text-white'
                                    }`}>
                                    {stage.label}
                                </h5>
                                {stage.status === 'current' && (
                                    <span className="text-[8px] font-bold uppercase tracking-widest text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full animate-pulse border border-blue-500/20">
                                        Active Phase
                                    </span>
                                )}
                            </div>
                            <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                                {stage.description}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MatterJourney;
