import React, { useRef } from 'react';
import { EditorView } from 'prosemirror-view';
import { toggleMark, setBlockType } from 'prosemirror-commands';
import { 
  Bold, 
  Italic, 
  Underline, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  AlignJustify,
  Type,
  Heading1,
  Heading2,
  Heading3,
  Undo,
  Redo,
  ChevronDown,
  FileUp,
  FilePlus,
  Save,
  Eraser
} from 'lucide-react';
import { undo, redo } from 'prosemirror-history';
import { cn } from '../lib/utils';
import { legalSchema } from '../Schema/LegalSchema';

interface FormattingToolbarProps {
  view: EditorView | null;
  onImport?: (content: string) => void;
  onSaveAsNew?: () => void;
  onSave?: () => void;
}

export const FormattingToolbar: React.FC<FormattingToolbarProps> = ({ view, onImport, onSaveAsNew, onSave }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  if (!view) return null;

  const isMarkActive = (type: any) => {
    const { from, $from, to, empty } = view.state.selection;
    if (empty) return !!type.isInSet(view.state.storedMarks || $from.marks());
    return view.state.doc.rangeHasMark(from, to, type);
  };

  const execCommand = (command: any) => {
    view.focus();
    command(view.state, view.dispatch);
  };

  const setTextAlign = (align: string) => {
    const { selection, tr } = view.state;
    const { from, to } = selection;
    
    view.state.doc.nodesBetween(from, to, (node, pos) => {
      if (node.type.name === 'paragraph' || node.type.name === 'heading') {
        tr.setNodeMarkup(pos, undefined, { ...node.attrs, align });
      }
    });
    
    view.dispatch(tr);
    view.focus();
  };

  const getActiveFont = () => {
    const { $from } = view.state.selection;
    const mark = legalSchema.marks.fontFamily.isInSet($from.marks());
    return mark ? mark.attrs.family : 'Times New Roman';
  };

  const getActiveSize = () => {
    const { $from } = view.state.selection;
    const mark = legalSchema.marks.fontSize.isInSet($from.marks());
    return mark ? mark.attrs.size : '12pt';
  };

  const applyMarkWithAttr = (type: any, attrs: any) => {
    view.focus();
    const { tr, selection } = view.state;
    if (selection.empty) {
        view.dispatch(tr.addStoredMark(type.create(attrs)));
    } else {
        view.dispatch(tr.addMark(selection.from, selection.to, type.create(attrs)));
    }
  };

  const handleImportClick = () => fileInputRef.current?.click();
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
        const text = event.target?.result as string;
        if (onImport) onImport(text);
    };
    
    if (file.name.endsWith('.html') || file.name.endsWith('.txt')) {
        reader.readAsText(file);
    } else {
        // Placeholder for DOCX/PDF
        alert('Rich document import (DOCX/PDF) requires the Sovereign Conversion Service. Importing as plain text for now.');
        reader.readAsText(file);
    }
  };

  const clearFormatting = () => {
    view.focus();
    const { tr, selection } = view.state;
    if (selection.empty) return;
    Object.keys(legalSchema.marks).forEach(name => {
      tr.removeMark(selection.from, selection.to, legalSchema.marks[name]);
    });
    view.dispatch(tr);
  };

  return (
    <div className="flex items-center gap-1 p-1.5 bg-white border border-gray-200 rounded-xl shadow-lg overflow-x-auto whitespace-nowrap scrollbar-hide max-w-full">
      <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} accept=".txt,.html,.docx,.pdf" />

      {/* Persistence Group */}
      <div className="flex items-center gap-1 px-1">
        <ToolbarButton onClick={() => onSave?.()} icon={Save} title="Quick Save" />
        <ToolbarButton onClick={() => onSaveAsNew?.()} icon={FilePlus} title="Save as New Draft" />
        <ToolbarButton onClick={handleImportClick} icon={FileUp} title="Import Document" />
      </div>

      <div className="w-[1px] h-4 bg-gray-200 mx-1" />

      <ToolbarButton onClick={() => execCommand(undo)} icon={Undo} title="Undo" />
      <ToolbarButton onClick={() => execCommand(redo)} icon={Redo} title="Redo" />
      <ToolbarButton onClick={clearFormatting} icon={Eraser} title="Clear Formatting" />
      
      <div className="w-[1px] h-4 bg-gray-200 mx-1" />

      {/* Font Family Dropdown */}
      <div className="relative group">
        <button className="flex items-center gap-2 px-3 py-1.5 text-[11px] font-bold text-gray-700 hover:bg-gray-50 rounded-lg min-w-[120px] justify-between">
          <span className="truncate" style={{ fontFamily: getActiveFont() }}>{getActiveFont()}</span>
          <ChevronDown className="w-3 h-3 text-gray-400 shrink-0" />
        </button>
        <div className="absolute top-full left-0 mt-1 hidden group-hover:block bg-white border border-gray-200 rounded-xl shadow-xl z-20 min-w-[150px]">
          {['Times New Roman', 'Arial', 'Courier New', 'Georgia', 'Verdana'].map(font => (
            <button 
              key={font}
              onClick={() => applyMarkWithAttr(legalSchema.marks.fontFamily, { family: font })}
              className="w-full text-left px-4 py-2 text-xs hover:bg-brand-primary/5 hover:text-brand-primary transition-colors"
              style={{ fontFamily: font }}
            >
              {font}
            </button>
          ))}
        </div>
      </div>

      {/* Font Size Dropdown */}
      <div className="relative group">
        <button className="flex items-center gap-2 px-3 py-1.5 text-[11px] font-bold text-gray-700 hover:bg-gray-50 rounded-lg min-w-[60px] justify-between">
          <span>{getActiveSize()}</span>
          <ChevronDown className="w-3 h-3 text-gray-400 shrink-0" />
        </button>
        <div className="absolute top-full left-0 mt-1 hidden group-hover:block bg-white border border-gray-200 rounded-xl shadow-xl z-20 min-w-[80px]">
          {['10pt', '11pt', '12pt', '14pt', '16pt', '18pt', '24pt'].map(size => (
            <button 
              key={size}
              onClick={() => applyMarkWithAttr(legalSchema.marks.fontSize, { size })}
              className="w-full text-left px-4 py-2 text-xs hover:bg-brand-primary/5 hover:text-brand-primary transition-colors"
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      <div className="w-[1px] h-4 bg-gray-200 mx-1" />
      
      <ToolbarButton 
        active={isMarkActive(legalSchema.marks.strong)} 
        onClick={() => execCommand(toggleMark(legalSchema.marks.strong))} 
        icon={Bold} 
        title="Bold"
      />
      <ToolbarButton 
        active={isMarkActive(legalSchema.marks.em)} 
        onClick={() => execCommand(toggleMark(legalSchema.marks.em))} 
        icon={Italic} 
        title="Italic"
      />
      <ToolbarButton 
        active={isMarkActive(legalSchema.marks.u)} 
        onClick={() => execCommand(toggleMark(legalSchema.marks.u))} 
        icon={Underline} 
        title="Underline"
      />
      
      <div className="w-[1px] h-4 bg-gray-200 mx-1" />
      
      <ToolbarButton onClick={() => setTextAlign('left')} icon={AlignLeft} title="Align Left" />
      <ToolbarButton onClick={() => setTextAlign('center')} icon={AlignCenter} title="Align Center" />
      <ToolbarButton onClick={() => setTextAlign('right')} icon={AlignRight} title="Align Right" />
      <ToolbarButton onClick={() => setTextAlign('justify')} icon={AlignJustify} title="Justify" />
      
      <div className="w-[1px] h-4 bg-gray-200 mx-1" />
      
      <ToolbarButton onClick={() => execCommand(setBlockType(legalSchema.nodes.heading, { level: 1 }))} icon={Heading1} title="H1" />
      <ToolbarButton onClick={() => execCommand(setBlockType(legalSchema.nodes.heading, { level: 2 }))} icon={Heading2} title="H2" />
      <ToolbarButton onClick={() => execCommand(setBlockType(legalSchema.nodes.paragraph))} icon={Type} title="Text" />
    </div>
  );
};

const ToolbarButton = ({ active, onClick, icon: Icon, title }: { active?: boolean, onClick: () => void, icon: any, title: string }) => (
  <button
    onClick={(e) => { e.preventDefault(); onClick(); }}
    title={title}
    className={cn(
      "p-2 rounded-lg transition-all flex items-center justify-center",
      active 
        ? "bg-brand-primary/10 text-brand-primary" 
        : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
    )}
  >
    <Icon className="w-4 h-4" />
  </button>
);

