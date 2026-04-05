import React from 'react';
import { Editor } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import { Copy, Scissors, Trash2, Bold, Italic, Highlighter, Underline } from 'lucide-react';
import { useStudioStore } from '../hooks/useStudioStore';

interface StudioBubbleMenuProps {
  editor: Editor;
  pluginKey: string;
}

export const StudioBubbleMenu: React.FC<StudioBubbleMenuProps> = ({ editor, pluginKey }) => {
  if (!editor) {
    return null;
  }

  const handleCopy = () => {
    const text = editor.state.doc.textBetween(
      editor.state.selection.from,
      editor.state.selection.to,
      ' '
    );
    navigator.clipboard.writeText(text);
  };

  const handleCut = () => {
    handleCopy();
    editor.chain().focus().deleteSelection().run();
  };

  const handleDelete = () => {
    editor.chain().focus().deleteSelection().run();
  };

  return (
    <BubbleMenu 
      editor={editor} 
      pluginKey={pluginKey}
      tippyOptions={{ duration: 100, zIndex: 99999, theme: 'light' }}
      className="flex items-center gap-1 p-1 bg-white/95 backdrop-blur-md border border-slate-200 shadow-2xl rounded-xl shrink-0"
    >
      <div className="flex items-center pr-2 border-r border-slate-200">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-1.5 rounded-lg transition-all ${
            editor.isActive('bold') 
              ? 'bg-emerald-50 text-emerald-600' 
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
          title="Bold"
        >
          <Bold size={14} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-1.5 rounded-lg transition-all ${
            editor.isActive('italic') 
              ? 'bg-emerald-50 text-emerald-600' 
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
          title="Italic"
        >
          <Italic size={14} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`p-1.5 rounded-lg transition-all ${
            editor.isActive('underline') 
              ? 'bg-emerald-50 text-emerald-600' 
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
          title="Underline"
        >
          <Underline size={14} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHighlight({ color: '#fef08a' }).run()}
          className={`p-1.5 rounded-lg transition-all ${
            editor.isActive('highlight') 
              ? 'bg-yellow-100 text-yellow-600' 
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
          title="Highlight Text"
        >
          <Highlighter size={14} />
        </button>
      </div>
      
      <div className="flex items-center pl-1">
        <button
          onClick={handleCopy}
          className="p-1.5 text-slate-600 hover:bg-slate-100 hover:text-blue-600 rounded-lg transition-all"
          title="Copy"
        >
          <Copy size={14} />
        </button>
        <button
          onClick={handleCut}
          className="p-1.5 text-slate-600 hover:bg-slate-100 hover:text-blue-600 rounded-lg transition-all"
          title="Cut"
        >
          <Scissors size={14} />
        </button>
        <button
          onClick={handleDelete}
          className="p-1.5 text-slate-600 hover:bg-slate-100 hover:text-red-500 rounded-lg transition-all"
          title="Delete"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </BubbleMenu>
  );
};

export default StudioBubbleMenu;
