/**
 * @file TopToolbar.tsx
 * @module NomosDesk/Studio/UI
 * @description Document-specific action toolbar (Zoom, Print, Save).
 */

import React from 'react';
import { 
  Printer, Save, Download, FileUp,
  ZoomIn, ZoomOut, Maximize2, Minimize2,
  GitBranch, Sparkles, Wand2,
  Bold, Italic, Type, List, ListOrdered,
  Menu, PanelLeft, PanelRight,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Table, Link as LinkIcon, FileJson,
  RotateCcw, RotateCw, FileDown
} from 'lucide-react';
import * as mammoth from 'mammoth';
import { Document, Packer, Paragraph, TextRun, Table as DocxTable, TableRow as DocxRow, TableCell as DocxCell, HeadingLevel } from 'docx';
import { saveAs } from 'file-saver';
// @ts-ignore
import html2pdf from 'html2pdf.js';
import { StudioMode } from '../domain/documentTypes';
import { useStudioStore } from '../hooks/useStudioStore';

interface TopToolbarProps {
  // Added toggle handlers for panels
  onToggleLeft?: () => void;
  onToggleRight?: () => void;
  onPrint: () => void;
  onCommit: () => void;
}

export const TopToolbar: React.FC<TopToolbarProps> = ({ 
  onToggleLeft,
  onToggleRight,
  onPrint, 
  onCommit 
}) => {
  const { 
    activeMode, zoom, isSaving, 
    toggleBold, toggleItalic, toggleHeading, 
    toggleUnderline, toggleBulletList, toggleOrderedList,
    setZoom 
  } = useStudioStore();

  const handleZoom = (delta: number) => {
    setZoom(Math.min(1.5, Math.max(0.4, zoom + delta)));
  };

  return (
    <div className="h-14 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between px-4 z-10 backdrop-blur-sm">
      <div className="flex items-center gap-4">
        {/* Toggle Left Sidebar */}
        <button 
          onClick={onToggleLeft}
          title="Toggle Navigator / Library"
          className="p-2.5 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-emerald-500 transition-all active:scale-90 border border-transparent hover:border-slate-700/50"
        >
          <PanelLeft size={18} />
        </button>

        <div className="flex items-center gap-6 border-l border-slate-800/50 pl-4">
          {/* Workspace Controls */}
          <div className="flex items-center gap-3">
            <div className="flex bg-slate-800/50 border border-slate-700/50 rounded-xl p-1 shadow-inner">
              <button 
                title="Zoom Out"
                onClick={() => handleZoom(-0.1)}
                className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-all active:scale-95"
              >
                <ZoomOut size={16} />
              </button>
              <div className="w-12 flex items-center justify-center">
                <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-tighter">
                  {Math.round(zoom * 100)}%
                </span>
              </div>
              <button 
                title="Zoom In"
                onClick={() => handleZoom(0.1)}
                className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-all active:scale-95"
              >
                <ZoomIn size={16} />
              </button>
            </div>
          </div>

          {/* History Controls */}
          <div className="flex items-center gap-1 pl-6 border-l border-slate-800/50">
            <button 
              onClick={() => useStudioStore.getState().undo()}
              className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-all active:scale-90"
              title="Undo (Ctrl+Z)"
            >
              <RotateCcw size={16} />
            </button>
            <button 
              onClick={() => useStudioStore.getState().redo()}
              className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-all active:scale-90"
              title="Redo (Ctrl+Y)"
            >
              <RotateCw size={16} />
            </button>
            <div className="w-px h-4 bg-slate-800 mx-1" />
            <button 
              onClick={() => useStudioStore.getState().toggleTrackChanges()}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                useStudioStore((state) => state.trackChanges)
                  ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]'
                  : 'bg-slate-800 text-slate-500 border border-transparent hover:text-slate-300'
              }`}
              title="Toggle Track Changes (Redline Mode)"
            >
              <GitBranch size={14} className={useStudioStore((state) => state.trackChanges) ? 'animate-pulse' : ''} />
              <span>Track Changes</span>
            </button>
          </div>

          {/* Typography Controls */}
          <div className="flex items-center gap-2 pl-6 border-l border-slate-800/50">
            <select 
              onChange={(e) => useStudioStore.getState().setFontFamily(e.target.value)}
              className="bg-slate-900 text-slate-400 text-[10px] font-bold uppercase tracking-wider rounded border border-slate-800 px-2 py-1 outline-none hover:border-slate-700 transition-all cursor-pointer"
              title="Font Family"
            >
              <option value="Inter">Sans</option>
              <option value="Georgia">Serif</option>
              <option value="Courier New">Mono</option>
            </select>
            <select 
              onChange={(e) => useStudioStore.getState().setFontSize(e.target.value)}
              className="bg-slate-900 text-slate-400 text-[10px] font-bold uppercase tracking-wider rounded border border-slate-800 px-2 py-1 outline-none hover:border-slate-700 transition-all cursor-pointer"
              title="Font Size"
            >
              <option value="12px">12pt</option>
              <option value="14px">14pt</option>
              <option value="16px">16pt</option>
              <option value="18px">18pt</option>
              <option value="24px">24pt</option>
            </select>
          </div>

          {/* Formatting Controls (TipTap Powered) */}
          <div className="flex items-center gap-1 pl-6 border-l border-slate-800/50">
            <button 
              onClick={toggleBold}
              className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-all active:scale-90"
              title="Bold (Ctrl+B)"
            >
              <Bold size={16} />
            </button>
            <button 
              onClick={toggleItalic}
              className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-all active:scale-90"
              title="Italic (Ctrl+I)"
            >
              <Italic size={16} />
            </button>
            <button 
              onClick={toggleUnderline}
              className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-all active:scale-90"
              title="Underline (Ctrl+U)"
            >
              <u className="text-xs font-bold no-underline border-b-2 border-slate-400">U</u>
            </button>
            <div className="w-px h-4 bg-slate-800 mx-1" />
            <button 
              onClick={() => toggleHeading(1)}
              className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-all active:scale-90 font-bold text-xs"
              title="H1"
            >
              H1
            </button>
            <button 
              onClick={() => toggleHeading(2)}
              className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-all active:scale-90 font-bold text-xs"
              title="H2"
            >
              H2
            </button>
            <div className="w-px h-4 bg-slate-800 mx-1" />
            <button 
              onClick={toggleBulletList}
              className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-all active:scale-90"
              title="Bullet List"
            >
              <List size={16} />
            </button>
            <button 
              onClick={toggleOrderedList}
              className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-all active:scale-90"
              title="Numbered List"
            >
              <ListOrdered size={16} />
            </button>
          </div>

          {/* Alignment Tools */}
          <div className="flex items-center gap-1 pl-6 border-l border-slate-800/50">
            <button 
              onClick={() => useStudioStore.getState().setTextAlign('left')}
              className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-all active:scale-90"
              title="Align Left"
            >
              <AlignLeft size={16} />
            </button>
            <button 
              onClick={() => useStudioStore.getState().setTextAlign('center')}
              className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-all active:scale-90"
              title="Align Center"
            >
              <AlignCenter size={16} />
            </button>
            <button 
              onClick={() => useStudioStore.getState().setTextAlign('right')}
              className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-all active:scale-90"
              title="Align Right"
            >
              <AlignRight size={16} />
            </button>
            <button 
              onClick={() => useStudioStore.getState().setTextAlign('justify')}
              className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-all active:scale-90"
              title="Justify"
            >
              <AlignJustify size={16} />
            </button>
          </div>

          {/* Insertion Tools */}
          <div className="flex items-center gap-1 pl-6 border-l border-slate-800/50">
            <button 
              onClick={() => useStudioStore.getState().insertTable()}
              className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-all active:scale-90"
              title="Insert Table"
            >
              <Table size={16} />
            </button>
            <button 
              onClick={() => {
                const url = window.prompt('Enter Enclave Link URL:');
                if (url) useStudioStore.getState().setLink(url);
              }}
              className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-all active:scale-90"
              title="Insert Link"
            >
              <LinkIcon size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden lg:flex items-center gap-4 pr-6 border-r border-slate-800/50">
           <button 
              className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-800 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-emerald-400 transition-all border border-transparent hover:border-emerald-500/20"
              title="Import External Artifact"
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = '.txt,.md,.json,.docx';
                input.onchange = (e: any) => {
                  const file = e.target.files[0];
                  if (!file) return;
                  
                  const isDocx = file.name.endsWith('.docx');
                  const reader = new FileReader();

                  reader.onload = async (re: any) => {
                    const editor = useStudioStore.getState().editor;
                    if (!editor) return;

                    if (isDocx) {
                      try {
                        const arrayBuffer = re.target.result;
                        const result = await mammoth.convertToHtml({ arrayBuffer });
                        editor.commands.setContent(result.value);
                        console.log("[IMPORT] MS Word Artifact Hydrated via Mammoth.");
                      } catch (err) {
                        console.error("[IMPORT] MS Word Conversion Failed:", err);
                      }
                    } else {
                      const content = re.target.result;
                      editor.commands.setContent(content);
                      console.log("[IMPORT] Text Artifact Hydrated.");
                    }
                  };

                  if (isDocx) {
                    reader.readAsArrayBuffer(file);
                  } else {
                    reader.readAsText(file);
                  }
                };
                input.click();
              }}
           >
              <FileUp size={14} />
              Import
           </button>
        </div>
        {/* Export Tools */}
        <div className="flex items-center gap-1.5 pr-4 border-r border-slate-800/50">
          <button 
            onClick={async () => {
              const editor = useStudioStore.getState().editor;
              if (!editor) return;
              try {
                const json = editor.getJSON();
                const children = json.content || [];

                const docxChildren = children.map((node: any) => {
                  if (node.type === 'heading') {
                    const level = node.attrs?.level === 1 ? HeadingLevel.HEADING_1 : HeadingLevel.HEADING_2;
                    return new Paragraph({
                      text: node.content?.[0]?.text || '',
                      heading: level,
                      spacing: { before: 240, after: 120 }
                    });
                  }

                  if (node.type === 'paragraph') {
                    const runs = (node.content || []).map((child: any) => {
                      return new TextRun({
                        text: child.text || '',
                        bold: child.marks?.some((m: any) => m.type === 'bold'),
                        italics: child.marks?.some((m: any) => m.type === 'italic'),
                        underline: child.marks?.some((m: any) => m.type === 'underline' || m.type === 'TextStyle'),
                      });
                    });
                    return new Paragraph({ children: runs, spacing: { after: 120 } });
                  }
                  
                  return new Paragraph({ text: '' });
                });

                const doc = new Document({
                  sections: [{
                    properties: {},
                    children: docxChildren as any
                  }]
                });

                const blob = await Packer.toBlob(doc);
                saveAs(blob, `Sovereign_Legal_Draft_${Date.now()}.docx`);
              } catch (err) {
                console.error("Docx Export Failed:", err);
              }
            }}
            className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-800 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-blue-400 transition-all border border-transparent hover:border-blue-500/20 active:scale-95"
            title="Export as MS Word (.docx)"
          >
            <FileDown size={14} />
            <span>Word</span>
          </button>

          <button 
            onClick={() => {
              const element = document.querySelector('.legal-editor-workspace');
              if (!element) return;
              const opt = {
                margin: 0,
                filename: `Sovereign_Legal_Artifact_${Date.now()}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true, letterRendering: true },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
              };
              html2pdf().set(opt).from(element).save();
            }}
            className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-800 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-red-400 transition-all border border-transparent hover:border-red-500/20 active:scale-95"
            title="Export as PDF (.pdf)"
          >
            <FileDown size={14} />
            <span>PDF</span>
          </button>
        </div>


        <button 
          onClick={() => {
            // Local Draft Save (Without Vault Commit)
            localStorage.setItem('nomos_studio_draft', 'SAVED_AT_' + Date.now());
          }}
          className="flex items-center gap-2 px-4 py-2 hover:bg-slate-800 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition-all border border-transparent hover:border-slate-700 active:scale-95"
          title="Save to Local Cache"
        >
          <div className="w-1.5 h-1.5 bg-sky-500 rounded-full animate-pulse" />
          <span>Save Draft</span>
        </button>

        <button 
          onClick={onPrint}
          className="flex items-center gap-2 px-4 py-2 hover:bg-slate-800 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition-all border border-transparent hover:border-slate-700 shadow-lg active:scale-95"
        >
          <Printer size={16} />
          <span className="hidden sm:inline">Print</span>
        </button>
        <button 
          onClick={onCommit}
          disabled={isSaving}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black transition-all active:scale-95 shadow-xl ${
            isSaving 
              ? 'bg-slate-800 text-slate-600 grayscale' 
              : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-emerald-500/20'
          }`}
        >
          {isSaving ? (
            <div className="w-4 h-4 border-2 border-slate-600 border-t-white rounded-full animate-spin"></div>
          ) : (
            <Save size={16} />
          )}
          <span>{isSaving ? 'Vaulting...' : 'Commit'}</span>
        </button>

        {/* Toggle Right Sidebar */}
        <button 
          onClick={onToggleRight}
          title="Toggle Intelligence Sidebar"
          className="p-2.5 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-amber-500 transition-all active:scale-90 border border-transparent hover:border-slate-700/50"
        >
          <PanelRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default React.memo(TopToolbar);
