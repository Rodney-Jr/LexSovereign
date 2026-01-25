
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
import { Clock, DollarSign, CheckCircle2, AlertTriangle, TrendingUp } from 'lucide-react';

const Dashboard: React.FC<{ mode: AppMode }> = ({ mode }) => {
  const data = [
    { name: 'Jan', value: 400 },
    { name: 'Feb', value: 300 },
    { name: 'Mar', value: 600 },
    { name: 'Apr', value: 800 },
    { name: 'May', value: 500 },
  ];

  const colors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'];

  return (
    <div className="space-y-8">
      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard
          label={mode === AppMode.LAW_FIRM ? "WIP Revenue" : "Legal Spend (YTD)"}
          value={mode === AppMode.LAW_FIRM ? "$248k" : "$1.2M"}
          icon={<DollarSign className="text-brand-secondary" />}
          trend="+12% vs last month"
          trendUp={true}
        />
        <KpiCard
          label={mode === AppMode.LAW_FIRM ? "Time-to-Filing (Avg)" : "Cycle-to-Sign (Avg)"}
          value={mode === AppMode.LAW_FIRM ? "4.2 Days" : "18.5 Days"}
          icon={<Clock className="text-brand-primary" />}
          trend="-0.5 days since Q1"
          trendUp={true}
        />
        <KpiCard
          label="Risk-Intercepted Docs"
          value="14"
          icon={<AlertTriangle className="text-amber-400" />}
          trend="7 flagged for Ghana KYC"
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
          <div className="h-[300px]">
            <div className="flex h-full items-center justify-center border-2 border-dashed border-brand-border rounded-xl text-brand-muted">
              <p>Chart System Offline (Strict Mode Compat)</p>
            </div>
          </div>
        </div>

        {/* Audit Confidence Chart */}
        <div className="bg-brand-sidebar border border-brand-border rounded-2xl p-6 backdrop-blur-sm transition-all duration-500">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-lg">AI Confidence Traces</h3>
            <span className="text-xs bg-brand-primary/10 text-brand-primary px-2 py-1 rounded border border-brand-primary/20">Live</span>
          </div>
          <div className="h-[300px]">
            <div className="flex h-full items-center justify-center border-2 border-dashed border-brand-border rounded-xl text-brand-muted">
              <p>Chart System Offline (Strict Mode Compat)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const KpiCard = ({ label, value, icon, trend, trendUp }: any) => (
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
