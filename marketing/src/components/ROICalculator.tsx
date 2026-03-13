import React, { useState, useMemo } from 'react';
import { Calculator, Clock, Target, ArrowRight, ShieldCheck } from 'lucide-react';

export const ROICalculator: React.FC = () => {
    const [lawyerCount, setLawyerCount] = useState<number>(5);
    const [hourlyRate, setHourlyRate] = useState<number>(250);
    const [adminHours, setAdminHours] = useState<number>(15);

    const calculations = useMemo(() => {
        // Assume Sovereign Enclave saves 40% of administrative/drafting time
        const timeSavedPercentage = 0.40;
        
        const hoursSavedPerLawyerPerWeek = adminHours * timeSavedPercentage;
        const totalHoursSavedPerMonth = hoursSavedPerLawyerPerWeek * 4 * lawyerCount;
        const additionalRevenuePerMonth = totalHoursSavedPerMonth * hourlyRate;
        
        // Assuming Founding Firm Tier pricing is $150/user/mo
        const monthlyCost = 150 * lawyerCount;
        const roiPercentage = ((additionalRevenuePerMonth - monthlyCost) / monthlyCost) * 100;

        return {
            hoursSavedPerMonth: Math.round(totalHoursSavedPerMonth),
            additionalRevenue: Math.round(additionalRevenuePerMonth),
            roi: Math.round(roiPercentage),
            monthlyCost
        };
    }, [lawyerCount, hourlyRate, adminHours]);

    const formatGHS = (amount: number) => {
        return new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS', maximumFractionDigits: 0 }).format(amount);
    };

    return (
        <section className="py-24 bg-brand-surface relative overflow-hidden" id="roi-calculator">
            <div className="absolute inset-0 portal-grid opacity-30 pointer-events-none"></div>
            
            <div className="absolute top-0 right-0 p-8 opacity-10 blur-xl pointer-events-none">
                <Calculator size={400} />
            </div>

            <div className="container mx-auto px-6 relative z-10">
                <div className="text-center mb-16 max-w-2xl mx-auto">
                    <span className="text-brand-primary font-mono text-sm tracking-wider uppercase mb-4 block">Interactive Telemetry</span>
                    <h2 className="text-3xl md:text-5xl font-display font-medium text-brand-text mb-6">Calculate Your Sovereign ROI</h2>
                    <p className="text-brand-muted text-lg">
                        See exactly how much unbillable time your firm loses to legacy processes, and the empirical revenue unlocked by transitioning to NomosDesk.
                    </p>
                </div>

                <div className="flex flex-col lg:flex-row gap-12 max-w-6xl mx-auto">
                    
                    {/* Input Controls */}
                    <div className="w-full lg:w-1/2 dashboard-panel p-8">
                        <h3 className="text-xl font-medium text-brand-text mb-8 flex items-center gap-2">
                            <Target className="w-5 h-5 text-brand-primary" />
                            Firm Parameters
                        </h3>

                        <div className="space-y-8">
                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-sm font-medium text-brand-muted">
                                    <label>Number of Practitioners</label>
                                    <span className="text-brand-text font-mono text-lg">{lawyerCount} Users</span>
                                </div>
                                <input 
                                    type="range" 
                                    min="1" max="50" step="1"
                                    value={lawyerCount}
                                    onChange={(e) => setLawyerCount(Number(e.target.value))}
                                    className="w-full accent-brand-primary h-2 bg-brand-border rounded-lg appearance-none cursor-pointer"
                                />
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-sm font-medium text-brand-muted">
                                    <label>Average Billable Rate (GH₵/hr)</label>
                                    <span className="text-brand-text font-mono text-lg">{formatGHS(hourlyRate)}</span>
                                </div>
                                <input 
                                    type="range" 
                                    min="50" max="1000" step="10"
                                    value={hourlyRate}
                                    onChange={(e) => setHourlyRate(Number(e.target.value))}
                                    className="w-full accent-brand-primary h-2 bg-brand-border rounded-lg appearance-none cursor-pointer"
                                />
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-sm font-medium text-brand-muted">
                                    <label>Unbillable Admin Hours (Per Week/User)</label>
                                    <span className="text-brand-text font-mono text-lg">{adminHours} Hours</span>
                                </div>
                                <input 
                                    type="range" 
                                    min="5" max="30" step="1"
                                    value={adminHours}
                                    onChange={(e) => setAdminHours(Number(e.target.value))}
                                    className="w-full accent-brand-primary h-2 bg-brand-border rounded-lg appearance-none cursor-pointer"
                                />
                            </div>
                        </div>

                        <div className="mt-8 p-4 border border-brand-border rounded border-dashed bg-black/20">
                            <p className="text-xs text-brand-muted flex items-start gap-2">
                                <ShieldCheck className="w-4 h-4 text-brand-primary shrink-0" />
                                Model assumes a conservative 40% reduction in document drafting, review, and matter administration time using Sovereign AI.
                            </p>
                        </div>
                    </div>

                    {/* Output Projections */}
                    <div className="w-full lg:w-1/2 flex flex-col gap-6">
                        
                        <div className="dashboard-panel p-8 bg-gradient-to-br from-brand-surface to-brand-primary/10 border-brand-primary/30 relative overflow-hidden group hover:border-brand-primary/60 transition-colors">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/10 rounded-full blur-2xl -mr-16 -mt-16 group-hover:bg-brand-primary/20 transition-all"></div>
                            
                            <h4 className="text-sm font-mono text-brand-muted uppercase tracking-wider mb-2">Projected Revenue Lift</h4>
                            <div className="text-5xl font-display font-semibold text-brand-primary drop-shadow-[0_0_15px_rgba(201,171,123,0.3)]">
                                {formatGHS(calculations.additionalRevenue)}<span className="text-xl text-brand-muted font-normal">/mo</span>
                            </div>
                            <p className="text-sm text-brand-muted mt-2">Recovered billable capacity across {lawyerCount} practitioners.</p>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="dashboard-panel p-6">
                                <Clock className="w-6 h-6 text-brand-muted mb-4" />
                                <h4 className="text-xs font-mono text-brand-muted uppercase tracking-wider mb-1">Time Recovered</h4>
                                <div className="text-2xl font-mono text-brand-text">
                                    {calculations.hoursSavedPerMonth} <span className="text-sm">hrs/mo</span>
                                </div>
                            </div>
                            
                            <div className="dashboard-panel p-6">
                                <Calculator className="w-6 h-6 text-brand-muted mb-4" />
                                <h4 className="text-xs font-mono text-brand-muted uppercase tracking-wider mb-1">ROI Multiplier</h4>
                                <div className="text-2xl font-mono text-green-400">
                                    {calculations.roi}%
                                </div>
                            </div>
                        </div>

                        <button 
                            className="mt-auto w-full group relative overflow-hidden rounded bg-brand-primary text-black px-8 py-4 font-medium transition-all hover:bg-white flex items-center justify-center gap-2"
                            onClick={() => {
                                console.log('[Telemetry EVENT] Clicked: Request Trial from ROI Calculator', {
                                    projectedROI: calculations.roi,
                                    projectedRevenue: calculations.additionalRevenue,
                                    firmSize: lawyerCount
                                });
                                window.location.href = '/founding-firms';
                            }}
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                Start Your Sovereign Trial <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </span>
                            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity"></div>
                        </button>
                    </div>

                </div>
            </div>
        </section>
    );
};
