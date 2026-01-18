
import React, { useState, useRef } from 'react';
import { Upload, FileText, Trash2, ShieldCheck, RefreshCw, X } from 'lucide-react';

export interface UploadedFile {
  id: string;
  name: string;
  size: string;
  status: 'scanning' | 'encrypted';
}

interface FileUploaderProps {
  files: UploadedFile[];
  onFilesAdded: (files: FileList) => void;
  onRemove: (id: string) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ files, onFilesAdded, onRemove }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      onFilesAdded(e.dataTransfer.files);
    }
  };

  return (
    <div className="space-y-4">
      <div 
        onClick={() => fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative group cursor-pointer border-2 border-dashed rounded-[2rem] p-10 text-center transition-all duration-300 ${
          isDragging 
            ? 'border-emerald-500 bg-emerald-500/10 shadow-[0_0_30px_rgba(16,185,129,0.2)] scale-[1.01]' 
            : 'border-slate-800 bg-slate-950/50 hover:border-blue-500/40 hover:bg-blue-500/5'
        }`}
      >
        <input 
          type="file" 
          multiple 
          ref={fileInputRef} 
          onChange={(e) => e.target.files && onFilesAdded(e.target.files)} 
          className="hidden" 
        />
        
        <div className="flex flex-col items-center gap-4 relative z-10">
          <div className={`p-4 rounded-2xl transition-all duration-300 ${
            isDragging ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-400 group-hover:scale-110 group-hover:text-blue-400'
          }`}>
            <Upload size={28} />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-bold text-slate-200">
              {isDragging ? 'Release to ingest artifacts' : 'Attach evidentiary artifacts'}
            </p>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">
              Drag & Drop or click to browse (Max 50MB/file)
            </p>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <ShieldCheck size={48} />
        </div>
      </div>

      {files.length > 0 && (
        <div className="grid grid-cols-1 gap-3 animate-in fade-in slide-in-from-top-2 duration-500">
          {files.map((file) => (
            <div key={file.id} className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl flex items-center justify-between group hover:border-slate-700 transition-all backdrop-blur-sm">
              <div className="flex items-center gap-4">
                <div className={`p-2.5 rounded-xl transition-colors ${
                  file.status === 'encrypted' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-blue-500/10 text-blue-400'
                }`}>
                  {file.status === 'encrypted' ? <ShieldCheck size={20} /> : <RefreshCw size={20} className="animate-spin" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-slate-100 truncate max-w-[200px] md:max-w-[300px]">{file.name}</p>
                    {file.status === 'encrypted' && (
                      <span className="text-[8px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-1.5 py-0.5 rounded font-mono font-bold uppercase">Sealed</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-[9px] text-slate-500 uppercase font-mono">{file.size}</p>
                    <span className="text-slate-800 text-[8px]">•</span>
                    <p className={`text-[9px] font-bold uppercase tracking-tighter ${
                      file.status === 'encrypted' ? 'text-emerald-500/80' : 'text-blue-400/80'
                    }`}>
                      {file.status === 'encrypted' ? 'PII Scoped & HSM Signed' : 'Blind-fold NER Redaction...'}
                    </p>
                  </div>
                </div>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); onRemove(file.id); }}
                className="p-2.5 hover:bg-red-500/10 text-slate-600 hover:text-red-400 rounded-xl transition-all"
                title="Remove artifact"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUploader;
