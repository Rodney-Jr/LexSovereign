import React from 'react';

interface PageSheetProps {
  pageNumber: number;
  totalPageCount: number;
  content?: string;
  children?: React.ReactNode;
  digitalHash?: string;
  timestamp?: number;
}

export const PageSheet: React.FC<PageSheetProps> = ({ 
  pageNumber, 
  totalPageCount, 
  content, 
  children,
  digitalHash, 
  timestamp 
}) => {
  return (
    <div 
      className="page-sheet-container bg-white shadow-2xl relative mx-auto mb-16 overflow-hidden print:shadow-none print:m-0 print:border-none"
      style={{ 
        width: '210mm', 
        minHeight: '297mm',
        padding: '25mm',
        boxSizing: 'border-box'
      }}
    >
      {/* Content Layer (Serif for Professional Legal Drafting) */}
      <div 
        className="document-content-layer w-full h-full text-slate-950 text-[15px] leading-[1.6] break-words whitespace-pre-wrap font-serif"
        style={{ fontFamily: 'Georgia, serif' }}
      >
        {children || content}
      </div>

      {/* Enterprise Footer (Visible only on print or on hover) */}
      <div className="absolute bottom-8 left-[25mm] right-[25mm] border-t border-slate-100 pt-3 flex justify-between items-center select-none">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-black tracking-widest text-slate-300 uppercase">
            Internal Document Integrity
          </span>
          <span className="text-[8px] font-mono text-slate-400 opacity-60 print:opacity-100">
            SHA256: {digitalHash || 'PENDING-COMPUTE'} | {timestamp ? new Date(timestamp).toLocaleString() : 'PENDING'}
          </span>
        </div>
        <div className="text-[10px] font-bold text-slate-400">
          PAGE {pageNumber} / {totalPageCount}
        </div>
      </div>
    </div>
  );
};
