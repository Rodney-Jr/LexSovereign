import React, { useState } from 'react';
import { Send, Command, Loader2, Sparkles, Wand2 } from 'lucide-react';

interface CopilotInputProps {
  onCommand: (command: string) => void;
  isLoading?: boolean;
}

export const CopilotInput: React.FC<CopilotInputProps> = ({ onCommand, isLoading }) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onCommand(input.trim());
      setInput('');
    }
  };

  return (
    <div className="relative mt-8 group animate-in slide-in-from-bottom-6 duration-700">
      {/* Background Glow */}
      <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-2xl blur-xl opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
      
      <form 
        onSubmit={handleSubmit}
        className="relative bg-[#1A1F29] border border-slate-700/50 rounded-2xl p-3 focus-within:border-purple-500/50 shadow-2xl transition-all hover:border-slate-600/50"
      >
        <div className="flex items-center gap-2 mb-2 px-1">
          <Wand2 className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Sovereign Copilot</span>
        </div>

        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder="Ask anything about this document..."
            className="w-full bg-transparent border-none focus:ring-0 text-sm placeholder:text-slate-600 text-slate-200 resize-none min-h-[80px]"
          />
          
          <div className="absolute bottom-0 right-0 p-1 flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-800/80 rounded-lg text-[10px] text-slate-500 border border-white/5 opacity-50 group-focus-within:opacity-100 transition-opacity">
              <Command className="w-2.5 h-2.5" />
              <span>ENTER</span>
            </div>
            <button 
              type="submit"
              disabled={isLoading || !input.trim()}
              className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl text-white shadow-lg shadow-purple-500/20 hover:scale-110 active:scale-95 transition-all disabled:opacity-30 disabled:hover:scale-100"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        <div className="mt-2 flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
          {['Add termination', 'Improve paragraph', 'Ghana compliance'].map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => setInput(q)}
              className="whitespace-nowrap px-2.5 py-1 bg-slate-800/50 hover:bg-slate-700 text-[10px] text-slate-400 rounded-lg border border-white/5 transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
      </form>
    </div>
  );
};
