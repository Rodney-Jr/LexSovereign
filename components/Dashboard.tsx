
import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Cell
} from 'recharts';
import { AppMode } from '../types';
import { Clock, DollarSign, CheckCircle2, AlertTriangle, TrendingUp, Activity, Shield } from 'lucide-react';

const Dashboard: React.FC<{
  mode: AppMode;
  mattersCount: number;
  docsCount: number;
  rulesCount: number;
}> = ({ mode, mattersCount, docsCount, rulesCount }) => {
  const data = [
    { name: 'Jan', value: 400 },
    { name: 'Feb', value: 300 },
    { name: 'Mar', value: 600 },
    { name: 'Apr', value: mattersCount * 10 || 800 },
    { name: 'May', value: mattersCount * 12 || 500 },
  ];

  const colors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'];

  return (
    <div className="space-y-8">
      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard
          label={mode === AppMode.LAW_FIRM ? "Active Matters" : "Total Matters (YTD)"}
          value={mattersCount.toString()}
          icon={<DollarSign className="text-brand-secondary" />}
          trend={`${mattersCount > 0 ? '+1' : '0'} since launch`}
          trendUp={true}
        />
        <KpiCard
          label={mode === AppMode.LAW_FIRM ? "Vaulted Documents" : "Enclave Assets"}
          value={docsCount.toString()}
          icon={<Clock className="text-brand-primary" />}
          trend={`${docsCount} verified items`}
          trendUp={true}
        />
        <KpiCard
          label="Active Safety Rules"
          value={rulesCount.toString()}
          icon={<AlertTriangle className="text-amber-400" />}
          trend="GH_ACC_1 Stack Native"
          trendUp={false}
        />
        <KpiCard
          label="AI Validation Score"
          value="98.2%"
          icon={<CheckCircle2 className="text-brand-primary" />}
          trend="+1.2% model update"
          trendUp={true}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Efficiency Chart */}
        <div className="bg-brand-sidebar border border-brand-border rounded-2xl p-6 backdrop-blur-sm transition-all duration-500">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-lg">{mode === AppMode.LAW_FIRM ? "Billing Efficiency" : "Contract Velocity"}</h3>
            <TrendingUp size={20} className="text-brand-primary" />
          </div>
          <div className="h-[300px] relative overflow-hidden group/chart">
            <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/5 to-transparent animate-pulse"></div>
            <div className="flex flex-col h-full items-center justify-center border-2 border-dashed border-brand-border/40 rounded-3xl text-brand-muted relative z-10 space-y-4">
              <div className="p-4 bg-brand-bg rounded-2xl border border-brand-border shadow-inner group-hover/chart:scale-110 transition-transform duration-700">
                <Activity size={32} className="text-brand-primary animate-pulse" />
              </div>
              <div className="text-center space-y-1">
                <p className="text-sm font-bold tracking-tight text-brand-text">Initializing Sovereign Stream...</p>
                <p className="text-[10px] uppercase tracking-widest font-bold text-slate-600">Cross-Regional Sync in Progress</p>
              </div>
            </div>
          </div>
        </div>

        {/* Audit Confidence Chart */}
        <div className="bg-brand-sidebar border border-brand-border rounded-2xl p-6 backdrop-blur-sm transition-all duration-500">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-lg">AI Confidence Traces</h3>
            <span className="text-xs bg-brand-primary/10 text-brand-primary px-2 py-1 rounded border border-brand-primary/20">Live</span>
          </div>
          <div className="h-[300px] relative overflow-hidden group/chart">
            <div className="absolute inset-0 bg-gradient-to-br from-brand-secondary/5 to-transparent animate-pulse delay-700"></div>
            <div className="flex flex-col h-full items-center justify-center border-2 border-dashed border-brand-border/40 rounded-3xl text-brand-muted relative z-10 space-y-4">
              <div className="p-4 bg-brand-bg rounded-2xl border border-brand-border shadow-inner group-hover/chart:scale-110 transition-transform duration-700">
                <Shield className="text-brand-secondary animate-pulse" size={32} />
              </div>
              <div className="text-center space-y-1">
                <p className="text-sm font-bold tracking-tight text-brand-text">Synchronizing Audit Enclave...</p>
                <p className="text-[10px] uppercase tracking-widest font-bold text-slate-600">Calculating Zero-Knowledge Delta</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface KpiCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  trend: string;
  trendUp?: boolean;
}

const KpiCard: React.FC<KpiCardProps> = ({ label, value, icon, trend, trendUp }) => (
  <div className="bg-brand-sidebar border border-brand-border p-6 rounded-2xl hover:border-brand-primary/50 transition-all duration-500 group">
    <div className="flex items-center justify-between mb-4">
      <div className="p-2 bg-brand-bg rounded-xl group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <span className={`text-xs font-medium ${trendUp ? 'text-brand-primary' : 'text-amber-400'}`}>
        {trend}
      </span>
    </div>
    <div className="space-y-1">
      <p className="text-sm text-brand-muted font-medium">{label}</p>
      <h4 className="text-3xl font-bold tracking-tight text-brand-text">{value}</h4>
    </div>
  </div>
);

export default Dashboard;
