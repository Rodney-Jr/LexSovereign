/**
 * @file StudioToasts.tsx
 * @module NomosDesk/Studio/UI
 * @description Non-blocking notification UI component.
 */

import React from 'react';
import { X, CheckCircle, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { Toast, ToastType } from '../hooks/useStudioToasts';

interface StudioToastsProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

const TOAST_CONFIG = {
  success: { icon: CheckCircle, classes: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' },
  error: { icon: AlertCircle, classes: 'bg-red-500/10 border-red-500/30 text-red-400' },
  warning: { icon: AlertTriangle, classes: 'bg-amber-500/10 border-amber-500/30 text-amber-400' },
  info: { icon: Info, classes: 'bg-blue-500/10 border-blue-500/30 text-blue-400' }
};

export const StudioToasts: React.FC<StudioToastsProps> = ({ 
  toasts, 
  onRemove 
}) => {
  return (
    <div className="fixed bottom-8 right-8 z-[110] flex flex-col gap-4 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const config = TOAST_CONFIG[toast.type];
        const Icon = config.icon;

        return (
          <div
            key={toast.id}
            className={`p-5 rounded-[2rem] border shadow-2xl backdrop-blur-md flex items-center justify-between gap-4 animate-in slide-in-from-right-8 fade-in duration-500 pointer-events-auto ${config.classes}`}
          >
            <div className="flex items-center gap-4">
              <div className="shrink-0 p-2 rounded-xl bg-white/5">
                <Icon size={20} />
              </div>
              <p className="text-xs font-bold leading-relaxed tracking-tight">{toast.message}</p>
            </div>
            <button 
              onClick={() => onRemove(toast.id)}
              className="p-2 hover:bg-white/5 rounded-xl transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default React.memo(StudioToasts);
