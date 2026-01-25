
import React, { useState, useEffect, useRef } from 'react';
import { Search, Command, LayoutDashboard, FileLock, MessageSquare, Settings, Zap, Globe, GitBranch, Search as SearchIcon, X } from 'lucide-react';

interface CommandPaletteProps {
    onClose: () => void;
    onNavigate: (tab: string) => void;
}

const COMMANDS = [
    { id: 'dashboard', label: 'Intelligence Hub', icon: <LayoutDashboard size={18} />, category: 'Navigation' },
    { id: 'vault', label: 'Sovereign Vault', icon: <FileLock size={18} />, category: 'Navigation' },
    { id: 'chat', label: 'Legal Chat', icon: <MessageSquare size={18} />, category: 'Navigation' },
    { id: 'conflict-check', label: 'Conflict Check', icon: <SearchIcon size={18} />, category: 'Actions' },
    { id: 'workflow', label: 'Workflow Engine', icon: <Zap size={18} />, category: 'Operations' },
    { id: 'platform-ops', label: 'Global Plane', icon: <Globe size={18} />, category: 'Administration' },
    { id: 'org-blueprint', label: 'Firm Blueprint', icon: <GitBranch size={18} />, category: 'Administration' },
    { id: 'tenant-settings', label: 'Governance Controls', icon: <Settings size={18} />, category: 'Settings' },
];

const CommandPalette: React.FC<CommandPaletteProps> = ({ onClose, onNavigate }) => {
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);

    const filteredCommands = COMMANDS.filter(cmd =>
        cmd.label.toLowerCase().includes(query.toLowerCase()) ||
        cmd.category.toLowerCase().includes(query.toLowerCase())
    );

    useEffect(() => {
        inputRef.current?.focus();
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowDown') setSelectedIndex(prev => (prev + 1) % filteredCommands.length);
            if (e.key === 'ArrowUp') setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
            if (e.key === 'Enter' && filteredCommands[selectedIndex]) {
                onNavigate(filteredCommands[selectedIndex].id);
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [filteredCommands, selectedIndex, onClose, onNavigate]);

    return (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4 backdrop-blur-sm bg-brand-bg/40 animate-in fade-in duration-200">
            <div
                className="w-full max-w-2xl bg-brand-sidebar border border-brand-border rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
                onClick={e => e.stopPropagation()}
            >
                <div className="relative border-b border-brand-border p-4 flex items-center gap-3">
                    <Search className="text-brand-muted" size={20} />
                    <input
                        ref={inputRef}
                        type="text"
                        className="flex-1 bg-transparent border-none focus:outline-none text-brand-text placeholder-brand-muted font-medium"
                        placeholder="Type a command or search..."
                        value={query}
                        onChange={e => {
                            setQuery(e.target.value);
                            setSelectedIndex(0);
                        }}
                    />
                    <div className="flex items-center gap-1.5">
                        <kbd className="px-2 py-1 bg-brand-bg border border-brand-border rounded text-[10px] font-bold text-brand-muted uppercase tracking-widest shadow-sm">ESC</kbd>
                        <button onClick={onClose} title="Close Command Palette" className="p-1.5 hover:bg-brand-bg rounded-lg text-brand-muted transition-colors">
                            <X size={16} />
                        </button>
                    </div>
                </div>

                <div className="max-h-[60vh] overflow-y-auto p-2 scrollbar-hide">
                    {filteredCommands.length > 0 ? (
                        <div className="space-y-4">
                            {['Navigation', 'Actions', 'Operations', 'Administration', 'Settings'].map(category => {
                                const categoryCommands = filteredCommands.filter(c => c.category === category);
                                if (categoryCommands.length === 0) return null;

                                return (
                                    <div key={category} className="space-y-1">
                                        <h4 className="px-3 py-2 text-[10px] font-bold text-brand-muted uppercase tracking-[0.2em]">{category}</h4>
                                        {categoryCommands.map((cmd) => {
                                            const globalIndex = filteredCommands.indexOf(cmd);
                                            return (
                                                <button
                                                    key={cmd.id}
                                                    onClick={() => {
                                                        onNavigate(cmd.id);
                                                        onClose();
                                                    }}
                                                    onMouseEnter={() => setSelectedIndex(globalIndex)}
                                                    className={`w-full flex items-center justify-between px-3 py-3 rounded-xl transition-all ${selectedIndex === globalIndex ? 'bg-brand-primary/10 text-brand-primary border border-brand-primary/20 translate-x-1' : 'text-brand-text hover:bg-brand-bg'
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className={`p-2 rounded-lg ${selectedIndex === globalIndex ? 'bg-brand-primary/20' : 'bg-brand-bg border border-brand-border'}`}>
                                                            {cmd.icon}
                                                        </div>
                                                        <span className="font-semibold text-sm">{cmd.label}</span>
                                                    </div>
                                                    {selectedIndex === globalIndex && (
                                                        <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest opacity-60">
                                                            <span>Enter</span>
                                                            <Command size={10} />
                                                        </div>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="p-12 text-center space-y-3">
                            <div className="inline-flex p-4 bg-brand-bg rounded-full border border-brand-border animate-pulse">
                                <Search className="text-brand-muted" size={32} />
                            </div>
                            <p className="text-brand-muted font-medium italic">No matches found in the sovereign enclave.</p>
                        </div>
                    )}
                </div>

                <div className="bg-brand-bg/50 border-t border-brand-border px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <kbd className="px-1.5 py-0.5 bg-brand-sidebar border border-brand-border rounded text-[9px] font-bold text-brand-muted shadow-sm">↑↓</kbd>
                            <span className="text-[9px] font-bold text-brand-muted uppercase tracking-widest">Navigate</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <kbd className="px-1.5 py-0.5 bg-brand-sidebar border border-brand-border rounded text-[9px] font-bold text-brand-muted shadow-sm">↵</kbd>
                            <span className="text-[9px] font-bold text-brand-muted uppercase tracking-widest">Select</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 opacity-40">
                        <span className="text-[9px] font-bold text-brand-muted uppercase tracking-[0.2em]">LexSovereign Core</span>
                        <Command size={10} className="text-brand-muted" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CommandPalette;
