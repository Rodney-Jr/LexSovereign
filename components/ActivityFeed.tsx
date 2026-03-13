import React, { useEffect, useState } from 'react';
import {
    Shield,
    Cpu,
    Lock,
    Globe,
    Fingerprint,
    Activity,
    Loader2,
    Eye,
    Clock
} from 'lucide-react';
import { authorizedFetch, getSavedSession } from '../utils/api';
import VersionPreviewModal from './VersionPreviewModal';

interface ActivityItem {
    id: string;
    type: 'ENCLAVE' | 'AI' | 'SECURITY' | 'JURISDICTION';
    message: string;
    timestamp: string;
}

const ActivityFeed: React.FC = () => {
    const [activities, setActivities] = useState<ActivityItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [previewTarget, setPreviewTarget] = useState<{ docId: string; versionId: string } | null>(null);

    useEffect(() => {
        const fetchActivities = async () => {
            const session = getSavedSession();
            if (!session?.token) return;

            try {
                const data = await authorizedFetch('/api/documents/client-audit', { token: session.token });
                if (Array.isArray(data)) {
                    setActivities(data);
                }
            } catch (e) {
                console.error("Failed to fetch client activities", e);
            } finally {
                setLoading(false);
            }
        };
        fetchActivities();
    }, []);

    const getIcon = (type: string) => {
        switch (type) {
            case 'ENCLAVE': return <Lock size={14} className="text-blue-400" />;
            case 'AI': return <Cpu size={14} className="text-purple-400" />;
            case 'SECURITY': return <Fingerprint size={14} className="text-emerald-400" />;
            case 'JURISDICTION': return <Globe size={14} className="text-amber-400" />;
            case 'VERSION': return <Clock size={14} className="text-indigo-400" />;
            default: return <Activity size={14} />;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-10">
                <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
            </div>
        );
    }

    if (activities.length === 0) {
        return (
            <div className="text-center py-6 opacity-40">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 italic">No activity detected within vault boundaries.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {activities.map((activity) => (
                <div key={activity.id} className="flex gap-4 group">
                    <div className="relative flex flex-col items-center">
                        <div className="p-2 bg-slate-800/50 rounded-lg border border-slate-700/50 group-hover:border-slate-600 transition-colors">
                            {getIcon(activity.type)}
                        </div>
                        <div className="flex-1 w-px bg-slate-800 my-1" />
                    </div>
                    <div className="flex-1 space-y-1">
                        <p className="text-xs text-slate-300 font-medium leading-relaxed group-hover:text-white transition-colors">
                            {activity.message}
                        </p>
                        
                        {(activity as any).metadata?.documentId && (activity as any).metadata?.versionId && (
                            <button 
                                onClick={() => setPreviewTarget({ 
                                    docId: (activity as any).metadata.documentId, 
                                    versionId: (activity as any).metadata.versionId 
                                })}
                                className="mt-2 text-[9px] font-bold text-brand-primary uppercase tracking-[0.2em] flex items-center gap-2 hover:text-brand-secondary transition-colors"
                            >
                                <Eye size={12} /> Preview Artifact State
                            </button>
                        )}

                        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                            {activity.timestamp}
                        </p>
                    </div>
                </div>
            ))}

            {previewTarget && (
                <VersionPreviewModal 
                    documentId={previewTarget.docId}
                    versionId={previewTarget.versionId}
                    onClose={() => setPreviewTarget(null)}
                />
            )}
        </div>
    );
};

export default ActivityFeed;
