import { useEffect } from 'react';

interface WorkBuffer {
    activeTab: string;
    selectedMatterId: string | null;
    lastUpdated: number;
    // Can be extended for draft contents, etc.
}

export const useWorkPersistence = (state: Partial<WorkBuffer>) => {
    const STORAGE_KEY = 'lexSovereign_work_buffer';

    // Update effect: Sync state to storage whenever tracked values change
    useEffect(() => {
        if (!state.activeTab) return;

        const buffer: WorkBuffer = {
            activeTab: state.activeTab,
            selectedMatterId: state.selectedMatterId || null,
            lastUpdated: Date.now()
        };

        localStorage.setItem(STORAGE_KEY, JSON.stringify(buffer));
    }, [state.activeTab, state.selectedMatterId]);

    const recoverWork = (): WorkBuffer | null => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (!saved) return null;

        try {
            const buffer: WorkBuffer = JSON.parse(saved);
            // Data expires after 24 hours
            if (Date.now() - buffer.lastUpdated > 86400000) {
                localStorage.removeItem(STORAGE_KEY);
                return null;
            }
            return buffer;
        } catch (e) {
            return null;
        }
    };

    const clearWork = () => {
        localStorage.removeItem(STORAGE_KEY);
    };

    return { recoverWork, clearWork };
};
