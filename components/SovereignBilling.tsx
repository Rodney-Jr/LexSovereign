
import React, { useState } from 'react';
import {
   CreditCard,
   Zap,
   ShieldCheck,
   Clock,
   ArrowUpRight,
   CheckCircle2,
   Plus,
   BarChart3,
   Building2,
   Lock,
   Globe,
   RefreshCw,
   TrendingUp,
   Receipt,
   Download,
   AlertCircle
} from 'lucide-react';
import { SaaSPlan } from '../types';
import { authorizedFetch, getSavedSession } from '../utils/api';
import ClientInvoicesRecord from './ClientInvoicesRecord';
import SovereignFinanceOps from './SovereignFinanceOps';

const SovereignBilling: React.FC = () => {
   const [isSyncing, setIsSyncing] = useState(false);
   const [billingData, setBillingData] = useState<any>(null);
   const showPlatformBilling = import.meta.env.VITE_SHOW_PRICING === 'true';
   const [activeTab, setActiveTab] = useState<'PLATFORM' | 'CLIENT' | 'FINANCE_OPS'>(
      showPlatformBilling ? 'PLATFORM' : 'CLIENT'
   );

   const fetchBilling = async () => {
      const session = getSavedSession();
      if (!session?.token) return;
      try {
         const data = await authorizedFetch('/api/tenant/billing', { token: session.token });
         setBillingData(data);
      } catch (e) {
         console.error("[Billing] Failed to fetch:", e);
      }
   };

   React.useEffect(() => {
      fetchBilling();
   }, []);

   const handleSync = async () => {
      setIsSyncing(true);
      await fetchBilling();
      setIsSyncing(false);
   };

   const handleManageBilling = async () => {
      const session = getSavedSession();
      if (!session?.token) return;
      try {
         const response = await authorizedFetch('/api/stripe/portal', {
            method: 'POST',
            token: session.token
         });
         if (response.url) {
            window.location.href = response.url;
         } else {
            alert("Billing portal is only available for paid subscriptions.");
         }
      } catch (e) {
         console.error("[Stripe Portal] Error:", e);
         alert("Cannot manage billing: This account does not have an active Stripe subscription.");
      }
   };

   return (
      <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20">
         {/* Sub-Navigation Tabs */}
         <div className="flex items-center gap-2 p-1.5 bg-slate-900/50 border border-slate-800 rounded-3xl w-fit">
            {showPlatformBilling && (
               <button
                  onClick={() => setActiveTab('PLATFORM')}
                  className={`px-8 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'PLATFORM' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
               >
                  SaaS Platform Billing
               </button>
            )}
            <button
               onClick={() => setActiveTab('CLIENT')}
               className={`px-8 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'CLIENT' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
            >
               Client Invoicing
            </button>
            <button
               onClick={() => setActiveTab('FINANCE_OPS')}
               className={`px-8 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'FINANCE_OPS' ? 'bg-amber-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
            >
               Finance Ops
            </button>
         </div>

         {activeTab === 'CLIENT' ? (
            <ClientInvoicesRecord />
         ) : activeTab === 'FINANCE_OPS' ? (
            <SovereignFinanceOps userRole={(getSavedSession()?.user as any)?.role || 'ASSOCIATE'} />
         ) : (
            <>
               {/* Usage Meters */}
               <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  <div className="lg:col-span-8 bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                     <div className="absolute top-0 right-0 p-8 opacity-5">
                        <Zap size={150} />
                     </div>

                     <div className="flex items-center justify-between mb-10">
                        <div className="space-y-1">
                           <h3 className="text-2xl font-bold text-white tracking-tight">Resource Utilization Ledger</h3>
                           <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">Real-time SaaS telemetry</p>
                        </div>
                        <button
                           onClick={handleSync}
                           title="Sync Resource Metrics"
                           className="p-3 bg-slate-950 border border-slate-800 rounded-2xl text-slate-400 hover:text-emerald-400 transition-all"
                        >
                           <RefreshCw size={18} className={isSyncing ? 'animate-spin' : ''} />
                        </button>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <UsageMeter
                           label="AI Credits (Inference)"
                           current={billingData?.usage?.aiCredits?.current || 0}
                           max={billingData?.usage?.aiCredits?.max || 10000}
                           color="emerald"
                           sub="Sovereign Core Inference"
                        />
                        <UsageMeter
                           label="Vault Storage (Pinned)"
                           current={billingData?.usage?.storage?.current || 0}
                           max={billingData?.usage?.storage?.max || 50}
                           unit={billingData?.usage?.storage?.unit || 'GB'}
                           color="blue"
                           sub="Primary Silo Residency Limit"
                        />
                        <UsageMeter
                           label="Active Team Slots"
                           current={billingData?.usage?.users?.current || 0}
                           max={billingData?.usage?.users?.max || 100}
                           color="purple"
                           sub="Institutional Tier"
                        />
                     </div>

                     <div className="mt-12 p-6 bg-slate-950/80 border border-slate-800 rounded-[2rem] flex items-center justify-between">
                        <div className="flex items-center gap-6">
                           <div className="space-y-0.5">
                              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Burn Rate</p>
                              <p className="text-xl font-bold text-white tracking-tight">{billingData?.usage?.burnRate || '0.0'} Credits <span className="text-slate-600 text-xs">/ hr</span></p>
                           </div>
                           <div className="w-[1px] h-10 bg-slate-800"></div>
                           <div className="space-y-0.5">
                              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Projected Overage</p>
                              <p className="text-xl font-bold text-emerald-500 tracking-tight">${billingData?.usage?.projectedOverage?.toFixed(2) || '0.00'}</p>
                           </div>
                        </div>
                        <button
                           onClick={handleManageBilling}
                           className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-2xl font-bold text-xs uppercase transition-all shadow-xl shadow-emerald-900/20 active:scale-95 flex items-center gap-2"
                        >
                           <Plus size={16} /> Allocate Credits
                        </button>
                     </div>
                  </div>

                  <div className="lg:col-span-4 space-y-6">
                     {/* Active Subscription Status */}
                     <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-[2.5rem] flex flex-col justify-between h-full relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform">
                           <ShieldCheck size={100} />
                        </div>
                        <div className="space-y-6 relative z-10">
                           <div className="flex items-center gap-4">
                              <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20 text-blue-400">
                                 <Building2 size={24} />
                              </div>
                              <div>
                                 <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Enterprise Plan</p>
                                 <h4 className="text-lg font-bold text-white uppercase tracking-tighter">{billingData?.planId || 'Institutional'} Tier</h4>
                              </div>
                           </div>
                           <div className="space-y-4">
                              <PlanFeature label="Sovereign Silo Residency (Logical)" />
                              <PlanFeature label="Ethics & Bias Guardrails" />
                              <PlanFeature label="BYOK Encryption (HSM-Backed)" />
                              <PlanFeature label="Auditable Decision Trace" />
                           </div>
                        </div>
                        <div className="space-y-3 relative z-10 pt-8 mt-8 border-t border-slate-800">
                           <button
                              onClick={handleManageBilling}
                              className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-2xl text-xs uppercase tracking-widest transition-all border border-slate-700 active:scale-95"
                           >
                              {billingData?.hasStripeCustomer ? 'Manage Subscription' : 'Plan Settings'}
                           </button>
                           <p className="text-[9px] text-slate-500 text-center font-medium italic">
                              {billingData?.subscriptionStatus === 'active' ? 'Deployment Status: Active' : `Status: ${billingData?.subscriptionStatus || 'PROVISIONED'}`}
                           </p>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Modular Capabilities */}
               <div className="space-y-6">
                  <div className="flex items-center justify-between px-2">
                     <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                        <CheckCircle2 size={14} className="text-emerald-400" /> Included Sovereign Capabilities
                     </h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <ModuleProcurementCard
                        title="Sovereign Accounting"
                        description="GAAP-compliant ledger, automated Trust accounting, and QuickBooks/LawPay sync."
                        moduleKey="ACCOUNTING_HUB"
                        isEnabled={true}
                        isPreActivated={true}
                        onProcure={() => {}}
                     />
                     <ModuleProcurementCard
                        title="HR Enterprise"
                        description="Recruitment pipelines, Payroll management, and automated Compliance tracking."
                        moduleKey="HR_ENTERPRISE"
                        isEnabled={true}
                        isPreActivated={true}
                        onProcure={() => {}}
                     />
                  </div>
               </div>

               {/* Invoice Ledger */}
               <div className="space-y-6">
                  <div className="flex items-center justify-between px-2">
                     <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                        <Receipt size={14} className="text-blue-400" /> Administrative Billing Ledger
                     </h4>
                     <span className="text-[10px] font-mono text-slate-600">FIPS 140-2 Standard: SYNCED</span>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 rounded-[2rem] overflow-hidden shadow-2xl">
                     <table className="w-full text-left">
                        <thead className="bg-slate-800/50 border-b border-slate-800 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                           <tr>
                              <th className="px-8 py-5">Statement Cycle</th>
                              <th className="px-8 py-5">Resource Delta</th>
                              <th className="px-8 py-5">Amount (Primary Currency)</th>
                              <th className="px-8 py-5 text-right">Artifacts</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50 text-xs">
                           {billingData?.history ? (
                              billingData.history.length > 0 ? (
                                 billingData.history.map((row: any) => (
                                    <InvoiceRow key={row.id} cycle={row.cycle} delta={row.delta} amount={row.amount} status={row.status} downloadUrl={row.downloadUrl} />
                                 ))
                              ) : (
                                 <tr><td colSpan={4} className="px-8 py-6 text-center text-slate-500 italic font-medium">No billing records found for this silo.</td></tr>
                              )
                           ) : (
                              <tr><td colSpan={4} className="px-8 py-4 text-center text-slate-500">Retrieving ledger...</td></tr>
                           )}
                        </tbody>
                     </table>
                  </div>
               </div>

               {billingData?.usage?.predictiveAlertDate && (
                  <div className="bg-amber-500/5 border border-amber-500/10 p-8 rounded-[2.5rem] flex items-start gap-6">
                     <div className="p-3 bg-amber-500/10 rounded-2xl border border-amber-500/20 shrink-0">
                        <AlertCircle className="text-amber-500" size={24} />
                     </div>
                     <div className="space-y-1">
                        <h5 className="font-bold text-xs text-amber-400 uppercase tracking-widest">Predictive Quota Alert</h5>
                        <p className="text-[10px] text-slate-400 leading-relaxed">
                           Based on current matter velocity, you will consume your allocated <strong>{billingData?.usage?.aiCredits?.max?.toLocaleString() || '10,000'} Credits</strong> by {new Date(billingData.usage.predictiveAlertDate).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}.
                        </p>
                     </div>
                  </div>
               )}
            </>
         )}
      </div>
   );
};

const UsageMeter = ({ label, current, max, unit = "", color, sub }: any) => {
   const pct = Math.round((current / max) * 100);
   return (
      <div className="space-y-4">
         <div className="space-y-1">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</p>
            <div className="flex items-baseline gap-2">
               <p className="text-2xl font-bold text-white tabular-nums">{current}{unit}</p>
               <p className="text-[10px] text-slate-500 font-mono">/ {max}{unit}</p>
            </div>
         </div>
         <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
            <div
               className={`h-full bg-${color}-500 shadow-[0_0_10px_rgba(var(--color-rgb),0.4)] transition-all duration-1000 dynamic-width`}
               style={{ '--width': `${pct}%` } as React.CSSProperties}
            ></div>
         </div>
         <p className="text-[9px] text-slate-600 italic font-medium">{sub}</p>
      </div>
   );
};

const PlanFeature = ({ label }: { label: string }) => (
   <div className="flex items-center gap-3 text-[11px] text-slate-300 group/feat">
      <CheckCircle2 size={12} className="text-emerald-500 transition-transform group-hover/feat:scale-125" />
      {label}
   </div>
);

const InvoiceRow = ({ cycle, delta, amount, status, downloadUrl }: any) => (
   <tr className="hover:bg-slate-800/20 transition-all group">
      <td className="px-8 py-5 font-bold text-slate-200">{cycle}</td>
      <td className="px-8 py-5 font-mono text-slate-500">{delta}</td>
      <td className="px-8 py-5 font-bold text-white">{amount}</td>
      <td className="px-8 py-5 text-right">
         <div className="flex items-center justify-end gap-3">
            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${status === 'PAID' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-800 text-slate-400 border-slate-700'
               }`}>
               {status}
            </span>
            {downloadUrl && (
               <a
                  href={downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Download Invoice"
                  className="p-2 hover:bg-slate-800 rounded-xl text-slate-600 hover:text-blue-400 transition-all opacity-0 group-hover:opacity-100"
               >
                  <Download size={14} />
               </a>
            )}
         </div>
      </td>
   </tr>
);

const ModuleProcurementCard = ({ title, description, moduleKey, isEnabled, onProcure, isPreActivated }: { title: string, description: string, moduleKey: string, isEnabled: boolean, onProcure: () => void, isPreActivated?: boolean }) => (
   <div className={`p-8 rounded-[2rem] border transition-all flex flex-col justify-between ${isEnabled ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-slate-900 border-slate-800 hover:border-blue-500/30'}`}>
      <div className="space-y-4">
         <div className="flex items-center justify-between">
            <h5 className={`font-bold text-sm uppercase tracking-widest ${isEnabled ? 'text-emerald-400' : 'text-white'}`}>{title}</h5>
            {isEnabled ? (
               <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                  <CheckCircle2 size={10} className="text-emerald-500" />
                  <span className="text-[10px] font-black uppercase text-emerald-500">{isPreActivated ? 'Forever Free' : 'Active'}</span>
               </div>
            ) : (
               <Zap size={16} className="text-blue-500" />
            )}
         </div>
         <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
            {description}
         </p>
      </div>
      <button
         disabled={isEnabled}
         onClick={onProcure}
         className={`mt-6 w-full py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${isEnabled ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20 active:scale-95'}`}
      >
         {isPreActivated ? 'Capability Included' : isEnabled ? 'Capability Enabled' : `Activate ${title}`}
      </button>
   </div>
);

export default SovereignBilling;
