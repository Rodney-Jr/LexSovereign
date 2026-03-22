import React from 'react';
import { RedlineSidebar } from '../../RedlineSidebar';
import { StudioMode } from '../domain/documentTypes';
import { TextDiff } from '../../../hooks/useDocumentState';
import { useStudioStore } from '../hooks/useStudioStore';
import { IntelligencePanel } from '../ai/IntelligencePanel';

export interface RightPanelProps {
  isVisible: boolean;
  activeMode: StudioMode;
  diffs: TextDiff[];
  rawContent: string;
  isSearching: boolean;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  onToggle: () => void;
  style?: React.CSSProperties;
}

export const RightPanel: React.FC<RightPanelProps> = ({ 
  isVisible, 
  activeMode, 
  diffs, 
  rawContent,
  isSearching, 
  onAccept, 
  onReject, 
  onToggle,
  style 
}) => {
  const editor = useStudioStore((state) => state.editor);

  if (!isVisible) return null;

  return (
    <aside 
      className={`h-full border-l border-slate-800 bg-[#07090C] overflow-hidden flex flex-col w-[400px]`}
      style={style}
    >
      {activeMode === 'review' ? (
        <RedlineSidebar 
          diffs={diffs} 
          onAccept={onAccept} 
          onReject={onReject} 
        />
      ) : (
        <IntelligencePanel 
          editor={editor} 
          rawContent={rawContent} 
        />
      )}
    </aside>
  );
};

export default React.memo(RightPanel);
