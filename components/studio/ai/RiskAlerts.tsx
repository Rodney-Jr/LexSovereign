import React from 'react';
import { AlertCircle, AlertTriangle, ArrowRight, Zap } from 'lucide-react';

interface RiskAlert {
  id: string;
  title: string;
  description: string;
  severity: 'CRITICAL' | 'WARNING';
  actionLabel: string;
}

interface RiskAlertsProps {
  alerts: RiskAlert[];
  onAction: (alert: RiskAlert) => void;
}

export const RiskAlerts: React.FC<RiskAlertsProps> = ({ alerts, onAction }) => {
  if (!alerts || alerts.length === 0) return null;

  // Ensure critical alerts are first
  const sortedAlerts = [...alerts].sort((a, b) => 
    a.severity === 'CRITICAL' ? -1 : 1
  );

  return (
    <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
          Risk Management Center <span className="bg-red-500/10 text-red-400 px-1.5 py-0.5 rounded-full text-[10px]">{alerts.length}</span>
        </h3>
      </div>

      <div className="space-y-3">
        {sortedAlerts.map((alert) => (
          <div 
            key={alert.id}
            className={`group p-4 rounded-xl border ${alert.severity === 'CRITICAL' ? 'bg-red-500/5 border-red-500/20' : 'bg-amber-500/5 border-amber-500/20'} transition-all hover:scale-[1.02] hover:shadow-xl`}
          >
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${alert.severity === 'CRITICAL' ? 'bg-red-500/20' : 'bg-amber-500/20'}`}>
                {alert.severity === 'CRITICAL' ? (
                  <AlertCircle className="w-4 h-4 text-red-400" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                )}
              </div>
              
              <div className="flex-1">
                <h4 className={`text-sm font-semibold mb-1 ${alert.severity === 'CRITICAL' ? 'text-red-200' : 'text-amber-200'}`}>
                  {alert.title}
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  {alert.description}
                </p>
                
                <button 
                  onClick={() => onAction(alert)}
                  className={`w-full py-2 px-3 rounded-lg flex items-center justify-center gap-2 text-xs font-bold transition-all ${
                    alert.severity === 'CRITICAL' 
                      ? 'bg-red-500 text-white hover:bg-red-400' 
                      : 'bg-amber-500 text-slate-900 hover:bg-amber-400'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  {alert.actionLabel}
                  <ArrowRight className="w-3.5 h-3.5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
