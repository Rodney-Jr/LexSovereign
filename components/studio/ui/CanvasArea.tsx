/**
 * @file CanvasArea.tsx
 * @module NomosDesk/Studio/UI
 * @description The high-fidelity workspace area for document composition.
 */

import React from 'react';
import { LegalEditor } from './LegalEditor';
import { RedlineRenderer } from '../../RedlineRenderer';
import { StudioMode } from '../domain/documentTypes';
import { TextDiff } from '../../../hooks/useDocumentState';

interface CanvasAreaProps {
  activeMode: StudioMode;
  rawContent: string;
  diffs: TextDiff[];
  zoom: number;
  onUpdate: (newText: string) => void;
}

export const CanvasArea: React.FC<CanvasAreaProps> = ({ 
  activeMode, 
  rawContent, 
  diffs, 
  zoom, 
  onUpdate 
}) => {
  return (
    <div className="flex-1 relative overflow-hidden flex flex-col items-center">
      {activeMode === 'review' ? (
        <div className="flex-1 w-full overflow-y-auto pt-16 pb-32 bg-[#0A0C10] flex flex-col items-center scrollbar-hide">
          <div 
            className="bg-white shadow-2xl p-[25mm] w-[210mm] min-h-[297mm] text-slate-900 font-serif mb-20 animate-in fade-in zoom-in-95 duration-500 origin-top"
            style={{ 
              transform: `scale(${zoom})`,
              marginTop: '40px'
            }}
          >
            <RedlineRenderer diffs={diffs} />
          </div>
        </div>
      ) : (
        <LegalEditor 
          content={rawContent} 
          onUpdate={onUpdate} 
          zoom={zoom}
        />
      )}
    </div>
  );
};

export default React.memo(CanvasArea);
