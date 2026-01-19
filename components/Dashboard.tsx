
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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard
          label={mode === AppMode.LAW_FIRM ? "WIP Revenue" : "Legal Spend (YTD)"}
          value={mode === AppMode.LAW_FIRM ? "$248k" : "$1.2M"}
          icon={<DollarSign className="text-blue-400" />}
          trend="+12% vs last month"
          trendUp={true}
        />
        <KpiCard
          label={mode === AppMode.LAW_FIRM ? "Time-to-Filing (Avg)" : "Cycle-to-Sign (Avg)"}
          value={mode === AppMode.LAW_FIRM ? "4.2 Days" : "18.5 Days"}
          icon={<Clock className="text-emerald-400" />}
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
          icon={<CheckCircle2 className="text-emerald-400" />}
          trend="+1.2% model update"
          trendUp={true}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Efficiency Chart */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-lg">{mode === AppMode.LAW_FIRM ? "Billing Efficiency" : "Contract Velocity"}</h3>
            <TrendingUp size={20} className="text-emerald-500" />
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              {/* <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }}
                  itemStyle={{ color: '#f1f5f9' }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} fillOpacity={0.8} />
                  ))}
                </Bar>
              </BarChart> */}
              <div className="flex h-full items-center justify-center border-2 border-dashed border-slate-800 rounded-xl text-slate-600">
                <p>Chart System Offline (Strict Mode Compat)</p>
              </div>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Audit Confidence Chart */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-lg">AI Confidence Traces</h3>
            <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded border border-emerald-500/20">Live</span>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }}
                />
                <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

const KpiCard = ({ label, value, icon, trend, trendUp }: any) => (
  <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl hover:border-slate-700 transition-colors group">
    <div className="flex items-center justify-between mb-4">
      <div className="p-2 bg-slate-800 rounded-xl group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <span className={`text-xs font-medium ${trendUp ? 'text-emerald-400' : 'text-amber-400'}`}>
        {trend}
      </span>
    </div>
    <div className="space-y-1">
      <p className="text-sm text-slate-400 font-medium">{label}</p>
      <h4 className="text-3xl font-bold tracking-tight text-white">{value}</h4>
    </div>
  </div>
);

export default Dashboard;
