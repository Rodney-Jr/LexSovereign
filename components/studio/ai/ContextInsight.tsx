import React from 'react';
import { Target, ShieldCheck, MapPin, BarChart } from 'lucide-react';

interface ContextInsightProps {
  sectionName: string;
  documentType: string;
  jurisdiction: string;
  confidenceLevel: 'HIGH' | 'MEDIUM' | 'LOW';
}

export const ContextInsight: React.FC<ContextInsightProps> = ({
  sectionName,
  documentType,
  jurisdiction,
  confidenceLevel
}) => {
  const confidenceColor = confidenceLevel === 'HIGH' ? 'text-emerald-400' : confidenceLevel === 'MEDIUM' ? 'text-amber-400' : 'text-slate-400';

  return (
    <div className="bg-[#151921] rounded-2xl p-4 border border-slate-800 shadow-lg animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 bg-purple-500/10 rounded-lg">
          <Target className="w-4 h-4 text-purple-400" />
        </div>
        <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">Contextual Insight</h3>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center text-xs">
          <span className="text-slate-400 flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5" /> Detected Section</span>
          <span className="text-slate-100 font-medium">{sectionName}</span>
        </div>
        
        <div className="flex justify-between items-center text-xs">
          <span className="text-slate-400 flex items-center gap-1.5"><BarChart className="w-3.5 h-3.5" /> Document Type</span>
          <span className="text-slate-100 font-medium text-right ml-4">{documentType}</span>
        </div>

        <div className="flex justify-between items-center text-xs">
          <span className="text-slate-400 flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> Jurisdiction</span>
          <span className="text-slate-100 font-medium">{jurisdiction}</span>
        </div>

        <div className="pt-3 border-t border-slate-800 mt-2 flex items-center justify-between">
          <span className="text-[10px] text-slate-500 uppercase tracking-tighter font-bold">Confidence Engine</span>
          <div className="flex items-center gap-1">
            <span className={`text-[10px] font-black ${confidenceColor}`}>{confidenceLevel}</span>
            <div className="flex gap-0.5">
              {[1, 2, 3].map((i) => (
                <div 
                  key={i} 
                  className={`w-1 h-3 rounded-full ${i <= (confidenceLevel === 'HIGH' ? 3 : confidenceLevel === 'MEDIUM' ? 2 : 1) ? 'bg-purple-500' : 'bg-slate-700'}`} 
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
