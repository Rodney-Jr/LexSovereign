import React, { useEffect, useState } from 'react';
import {
    Shield,
    Cpu,
    Lock,
    Globe,
    Fingerprint,
    Activity,
    Loader2
} from 'lucide-react';
import { authorizedFetch, getSavedSession } from '../utils/api';

interface ActivityItem {
    id: string;
    type: 'ENCLAVE' | 'AI' | 'SECURITY' | 'JURISDICTION';
    message: string;
    timestamp: string;
}

const ActivityFeed: React.FC = () => {
    const [activities, setActivities] = useState<ActivityItem[]>([]);
    const [loading, setLoading] = useState(true);

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
                    <div className="flex-1 pb-4">
                        <p className="text-xs text-slate-300 font-medium leading-relaxed group-hover:text-white transition-colors">
                            {activity.message}
                        </p>
                        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                            {activity.timestamp}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ActivityFeed;
