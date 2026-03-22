import React from 'react';
import { TextDiff } from '../hooks/useDocumentState';

interface RedlineRendererProps {
  diffs: TextDiff[];
}

export const RedlineRenderer: React.FC<RedlineRendererProps> = ({ diffs }) => {
  if (diffs.length === 0) {
    return <span className="opacity-40 italic">No tracked changes remaining in this section.</span>;
  }

  return (
    <div className="redline-stream leading-loose font-serif text-[15px] space-x-1">
      {diffs.map((diff) => {
        if (diff.type === 'equal') {
          return <span key={diff.id} className="text-slate-900">{diff.value}</span>;
        }

        if (diff.type === 'insert') {
          return (
            <span 
              key={diff.id} 
              className={`bg-emerald-100 text-emerald-900 underline decoration-emerald-400 group relative ${diff.status === 'accepted' ? 'bg-transparent underline-none' : ''}`}
              title={`Added by: ${diff.author} - ${new Date(diff.timestamp).toLocaleTimeString()}`}
            >
              {diff.value}
              {/* Diff Context Hint (Tooltip) */}
              <span className="absolute -top-6 left-0 bg-slate-800 text-white text-[9px] px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-[100]">
                {diff.author} (Draft)
              </span>
            </span>
          );
        }

        if (diff.type === 'delete') {
          return (
            <span 
              key={diff.id} 
              className={`bg-red-100 text-red-900 line-through decoration-red-400 group relative opacity-60 ${diff.status === 'rejected' ? 'line-through-none opacity-100 bg-transparent' : ''}`}
              title={`Removed by: ${diff.author} - ${new Date(diff.timestamp).toLocaleTimeString()}`}
            >
              {diff.value}
              <span className="absolute -top-6 left-0 bg-slate-800 text-white text-[9px] px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-[100]">
                {diff.author} (Deleted)
              </span>
            </span>
          );
        }

        return null;
      })}
    </div>
  );
};
