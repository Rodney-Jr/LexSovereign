import React, { useState } from 'react';
import { Calculator, BarChart3, Rocket, FileText, ChevronRight, PieChart, Download } from 'lucide-react';
import { Button } from '../../ui';
import { Editor } from '@tiptap/react';
import { jsPDF } from 'jspdf';

interface ROIStrategyPanelProps {
  editor: Editor | null;
}

export const ROIStrategyPanel: React.FC<ROIStrategyPanelProps> = ({ editor }) => {
  const [inputs, setInputs] = useState({
    lawyersCount: 5,
    hourlyRate: 250,
    monthlyVolume: 20,
    riskLevel: 'Medium'
  });

  const [isGenerating, setIsGenerating] = useState(false);

  const calculateROI = () => {
    const baselineHours = inputs.monthlyVolume * 8.5; // 8.5h per doc baseline
    const nomosHours = inputs.monthlyVolume * 2.5; // 2.5h with NomosDesk
    const hoursSaved = baselineHours - nomosHours;
    const monthlySavings = hoursSaved * inputs.hourlyRate;
    const annualSavings = monthlySavings * 12;
    
    const riskMultiplier = inputs.riskLevel === 'High' ? 2 : inputs.riskLevel === 'Low' ? 0.5 : 1;
    const riskAvoidanceValue = 500000 * riskMultiplier; // Abstract high-stakes risk value

    return {
      hoursSaved,
      monthlySavings,
      annualSavings,
      riskAvoidanceValue
    };
  };

  const downloadPDF = () => {
    const roi = calculateROI();
    const doc = new jsPDF();
    const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

    // --- PDF Header Style ---
    doc.setFillColor(7, 9, 12);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text('NOMOSDESK: INSTITUTIONAL ROI', 20, 25);
    doc.setFontSize(10);
    doc.text('SOVEREIGN LEGAL INFRASTRUCTURE • Q2-2026', 20, 32);

    // --- Body ---
    doc.setTextColor(30, 30, 30);
    doc.setFontSize(14);
    doc.setFont('Helvetica', 'bold');
    doc.text('Executive Summary', 20, 60);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(10);
    const summaryText = `This analysis quantifies the institutional advantage of transitioning to a Sovereign Legal Enclave. Implementing NomosDesk is projected to reduce professional drafting overhead by ~70% and mitigate high-stakes document risk via deterministic guardrails. Generated on ${new Date().toLocaleDateString()}.`;
    doc.text(doc.splitTextToSize(summaryText, 170), 20, 70);

    // --- Financials ---
    doc.setFillColor(245, 247, 250);
    doc.rect(20, 90, 170, 70, 'F');
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Projected Financial Returns', 30, 105);
    
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Monthly Document Volume: ${inputs.monthlyVolume}`, 30, 115);
    doc.text(`Estimated Hourly Rate: ${formatter.format(inputs.hourlyRate)}/hr`, 30, 122);
    doc.text(`Recovered Professional Hours: ${roi.hoursSaved.toFixed(1)} hrs/mo`, 30, 129);
    
    doc.setFont('Helvetica', 'bold');
    doc.text(`Monthly Operational ROI: ${formatter.format(roi.monthlySavings)}`, 30, 142);
    doc.text(`Projected Annual ROI: ${formatter.format(roi.annualSavings)}`, 30, 150);

    // --- Risk ---
    doc.setFontSize(12);
    doc.text(`Risk Mitigation Profile: [${inputs.riskLevel.toUpperCase()}]`, 20, 180);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(10);
    const riskText = `The Deterministic Risk Engine removes human blindspots. Based on a ${inputs.riskLevel} risk level, this institution avoids an estimated ${formatter.format(roi.riskAvoidanceValue)} in annual outlier liabilities.`;
    doc.text(doc.splitTextToSize(riskText, 170), 20, 190);

    // --- Footer ---
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    const footer = 'PRIVACY NOTICE: Generated within a secure Sovereign Enclave. Proprietary NomosDesk Valuation Methodologies applied.';
    doc.text(footer, 105, 280, { align: 'center' });

    doc.save(`nomosdesk_roi_proposal_${new Date().getTime()}.pdf`);
  };

  const generateProposal = () => {
    if (!editor) return;
    setIsGenerating(true);
    
    const roi = calculateROI();
    const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

    const proposalMarkdown = `
# 🏛️ NomosDesk: Institutional ROI & Risk Mitigation Analysis
**PREPARED BY:** NomosDesk Strategy Engine (Internal Draft)
**DATE:** ${new Date().toLocaleDateString()}

---

## ⚡ Executive Summary
This analysis quantify the institutional advantage of transitioning to a **Sovereign Legal Enclave**. 
Implementing NomosDesk is projected to reduce professional drafting overhead by **~70%** and mitigate high-stakes document risk via deterministic guardrails.

---

## 📊 Projected Financial Returns
Based on an intake of **${inputs.monthlyVolume} documents** per month and a professional rate of **${formatter.format(inputs.hourlyRate)}/hr**:

- **Drafting Efficiency Gain**: Recovering ~**${roi.hoursSaved} professional hours** per month.
- **Monthly Operational ROI**: **${formatter.format(roi.monthlySavings)}** in billable value recovery.
- **Projected Annual ROI**: **${formatter.format(roi.annualSavings)}** net operational gain.

---

## 🛡️ Risk Mitigation Score: ${inputs.riskLevel === 'High' ? 'CRITICAL' : 'STRATEGIC'}
The **Deterministic Risk Engine** removes human blindspots in high-stakes drafting.
- **Mitigated Liability Exposure**: Projected **${formatter.format(roi.riskAvoidanceValue)}** in "Outlier-Risk" avoidance annually based on institutional profiles.

---

## 🚀 Recommendation
Provision a dedicated **Sovereign Enclave** for the department to capture these gains immediately.
`;

    setTimeout(() => {
      editor.chain().focus().insertContent(proposalMarkdown).run();
      setIsGenerating(false);
    }, 1200);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="p-5 bg-indigo-500/5 rounded-[2rem] border border-indigo-500/10 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:rotate-12 transition-transform">
          <Calculator size={48} />
        </div>
        
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-indigo-500/10 rounded-xl">
             <PieChart className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <h4 className="text-[11px] font-black text-white uppercase tracking-widest leading-none mb-1">ROI Strategy</h4>
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Internal Proposal Gen</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label htmlFor="roi-lawyers" className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Legal Headcount</label>
            <input 
              id="roi-lawyers"
              type="number" 
              value={inputs.lawyersCount}
              onChange={(e) => setInputs({...inputs, lawyersCount: parseInt(e.target.value)})}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-indigo-400 outline-none focus:border-indigo-500"
              aria-label="Number of lawyers"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="roi-rate" className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Hourly Rate ($)</label>
            <input 
              id="roi-rate"
              type="number" 
              value={inputs.hourlyRate}
              onChange={(e) => setInputs({...inputs, hourlyRate: parseInt(e.target.value)})}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-indigo-400 outline-none focus:border-indigo-500"
              aria-label="Average hourly rate"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="roi-volume" className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Monthly Docs</label>
            <input 
              id="roi-volume"
              type="number" 
              value={inputs.monthlyVolume}
              onChange={(e) => setInputs({...inputs, monthlyVolume: parseInt(e.target.value)})}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-indigo-400 outline-none focus:border-indigo-500"
              aria-label="Monthly document volume"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="roi-risk" className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Risk Level</label>
            <select 
              id="roi-risk"
              value={inputs.riskLevel}
              onChange={(e) => setInputs({...inputs, riskLevel: e.target.value})}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-indigo-400 outline-none appearance-none"
              aria-label="Institutional risk level"
            >
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
          </div>
        </div>

        <button 
          onClick={generateProposal}
          disabled={isGenerating || !editor}
          className="w-full mt-6 py-3 bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50 text-slate-950 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all shadow-xl shadow-indigo-500/20 active:scale-95 flex items-center justify-center gap-2"
        >
          {isGenerating ? (
             <div className="w-3 h-3 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
          ) : (
            <>
              <FileText size={14} />
              Generate Proposal
            </>
          )}
        </button>

        <button 
          onClick={downloadPDF}
          disabled={isGenerating}
          className="w-full mt-3 py-3 border border-indigo-500/20 hover:bg-indigo-500/5 text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2"
        >
          <Download size={14} />
          Download Institutional PDF
        </button>
      </div>

      <div className="flex items-center gap-2 px-6 py-3 border border-slate-800/50 rounded-full text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em]">
        <Rocket size={12} className="text-emerald-500" /> Use this to justify procurement
      </div>
    </div>
  );
};
