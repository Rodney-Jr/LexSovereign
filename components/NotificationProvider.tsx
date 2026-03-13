import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { X, AlertCircle, CheckCircle2, Info, AlertTriangle } from 'lucide-react';

export type NotificationType = 'error' | 'warning' | 'success' | 'info';

interface Notification {
    id: string;
    type: NotificationType;
    message: string;
    description?: string;
}

interface NotificationContextType {
    notify: (type: NotificationType, message: string, description?: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) throw new Error('useNotification must be used within a NotificationProvider');
    return context;
};

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const notify = useCallback((type: NotificationType, message: string, description?: string) => {
        const id = Math.random().toString(36).substring(2, 9);
        setNotifications(prev => [...prev, { id, type, message, description }]);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== id));
        }, 5000);
    }, []);

    const removeNotification = (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    return (
        <NotificationContext.Provider value={{ notify }}>
            {children}
            <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 max-w-md w-full">
                {notifications.map(n => (
                    <div
                        key={n.id}
                        className={`glass border p-4 rounded-2xl shadow-xl flex items-start gap-4 animate-in slide-in-from-right-4 duration-300 ${
                            n.type === 'error' ? 'border-red-500/20 bg-red-500/5' :
                            n.type === 'warning' ? 'border-amber-500/20 bg-amber-500/5' :
                            n.type === 'success' ? 'border-emerald-500/20 bg-emerald-500/5' :
                            'border-blue-500/20 bg-blue-500/5'
                        }`}
                    >
                        <div className={`mt-0.5 ${
                            n.type === 'error' ? 'text-red-400' :
                            n.type === 'warning' ? 'text-amber-400' :
                            n.type === 'success' ? 'text-emerald-400' :
                            'text-blue-400'
                        }`}>
                            {n.type === 'error' && <AlertCircle size={20} />}
                            {n.type === 'warning' && <AlertTriangle size={20} />}
                            {n.type === 'success' && <CheckCircle2 size={20} />}
                            {n.type === 'info' && <Info size={20} />}
                        </div>
                        <div className="flex-1">
                            <h4 className="text-sm font-bold text-white">{n.message}</h4>
                            {n.description && <p className="text-xs text-slate-400 mt-1 line-clamp-2">{n.description}</p>}
                        </div>
                        <button
                            onClick={() => removeNotification(n.id)}
                            className="text-slate-500 hover:text-white transition-colors"
                            title="Dismiss notification"
                        >
                            <X size={16} />
                        </button>
                    </div>
                ))}
            </div>
        </NotificationContext.Provider>
    );
};
