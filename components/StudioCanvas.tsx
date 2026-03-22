import React, { useMemo, useRef } from 'react';
import { PageSheet } from './PageSheet';
import { useDocumentState } from '../hooks/useDocumentState';

interface StudioCanvasProps {
  content: string;
  onUpdate: (newText: string) => void;
  isRedlineMode?: boolean;
  zoom?: number;
}

export const StudioCanvas: React.FC<StudioCanvasProps> = ({ 
  content, 
  onUpdate, 
  isRedlineMode = false,
  zoom = 1
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  /**
   * paginateContent:
   * Logic: Estimates the lines per A4 page based on 1.6 line-height and margin-aware height.
   * Splits the raw text into a virtual array of strings, each representing one page.
   */
  const paginatedContent = useMemo(() => {
    // Standard legal drafting: ~42 lines per A4 page with 25mm margins.
    // This is an estimation for real-time responsiveness.
    // In production, we would use DOM-based measurements.
    const averageCharsPerPage = 3200; 
    const pages: string[] = [];
    
    // Simple character-based splitting for visual parity.
    // In advanced mode, we split by paragraphs/newlines.
    let remaining = content;
    while (remaining.length > 0) {
      pages.push(remaining.substring(0, averageCharsPerPage));
      remaining = remaining.substring(averageCharsPerPage);
    }
    
    return pages.length > 0 ? pages : [""];
  }, [content]);

  return (
    <div 
      ref={containerRef}
      className="studio-canvas flex-1 overflow-y-auto pt-16 pb-32 bg-[#0A0C10] flex flex-col items-center scroll-smooth scrollbar-hide"
      onMouseUp={() => {
        const selection = window.getSelection()?.toString();
        if (selection && selection.length > 50) {
          console.log('[LEGAL SEARCH] Selection detected (High Intent):', selection);
        }
      }}
    >
      <div 
        className="relative mx-auto transition-transform duration-500 ease-in-out origin-top" 
        style={{ 
          width: '210mm',
          transform: `scale(${zoom})`
        }}
      >
        {/* The Editing Surface (Seamless Virtualization) */}
        {/* We use one long textarea positioned absolutely to provide a single flow of text 
            while rendering separate PageSheets underneath to maintain A4 boundaries. */}
        <textarea
          value={content}
          onChange={(e) => onUpdate(e.target.value)}
          className="w-full bg-transparent text-transparent caret-emerald-500 focus:outline-none resize-none leading-[1.6] px-[25mm] py-[25mm] block font-serif text-[15px]"
          style={{ 
            height: `${paginatedContent.length * 297}mm`,
            fontFamily: 'Georgia, serif',
            zIndex: 10,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            position: 'relative'
          }}
          placeholder="Begin drafting your enterprise legal document..."
          spellCheck={false}
        />

        {/* The Background Stack (Physical Sheets) */}
        <div className="absolute inset-0 pointer-events-none z-0 flex flex-col items-center">
          {paginatedContent.map((pageText, idx) => (
            <PageSheet 
              key={idx}
              pageNumber={idx + 1}
              totalPageCount={paginatedContent.length}
              content={pageText} 
            />
          ))}
        </div>

        {/* The Visual Layer (Visible Text Rendered for the User) */}
        <div 
          className="absolute inset-0 pointer-events-none z-[5] flex flex-col items-center"
        >
          {paginatedContent.map((pageText, idx) => (
            <div 
              key={idx} 
              className="w-[210mm] h-[297mm] p-[25mm] text-slate-950 font-serif text-[15px] leading-[1.6] whitespace-pre-wrap mb-16"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              {/* This is the text the user actually sees */}
              {pageText}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
