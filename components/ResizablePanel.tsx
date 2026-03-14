import React from 'react';
import { useDynamicLayout } from '../hooks/useDynamicLayout';
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown, MoveHorizontal } from 'lucide-react';

interface ResizablePanelProps {
    id: string;
    children: React.ReactNode;
    initialSize: number;
    minSize: number;
    maxSize: number;
    direction: 'horizontal' | 'vertical';
    className?: string;
    snapPoints?: number[];
    collapseThreshold?: number;
    repositionable?: boolean;
    header?: React.ReactNode;
}

const ResizablePanel: React.FC<ResizablePanelProps> = ({
    id,
    children,
    initialSize,
    minSize,
    maxSize,
    direction,
    className = '',
    snapPoints,
    collapseThreshold,
    repositionable,
    header
}) => {
    const {
        size,
        isResizing,
        isCollapsed,
        side,
        startResizing,
        toggleCollapse,
        swapSide
    } = useDynamicLayout({
        id,
        initialSize,
        minSize,
        maxSize,
        direction,
        snapPoints,
        collapseThreshold,
        repositionable
    });

    const isHorizontal = direction === 'horizontal';
    
    const style: React.CSSProperties = isHorizontal
        ? { width: isCollapsed ? '0px' : `${size}px`, transition: isResizing ? 'none' : 'width 300ms cubic-bezier(0.4, 0, 0.2, 1)' }
        : { height: isCollapsed ? '0px' : `${size}px`, transition: isResizing ? 'none' : 'height 300ms cubic-bezier(0.4, 0, 0.2, 1)' };

    return (
        <div 
            className={`relative flex flex-col bg-brand-sidebar border-brand-border overflow-hidden ${className} 
            ${isHorizontal ? 'h-full border-r' : 'w-full border-b'}
            ${isResizing ? 'select-none' : ''}`}
            style={style}
        >
            {/* Header / Actions */}
            {(header || repositionable) && !isCollapsed && (
                <div className="flex items-center justify-between p-4 border-b border-brand-border bg-brand-bg/20">
                    <div className="flex-1">{header}</div>
                    <div className="flex items-center gap-2">
                        {repositionable && (
                            <button 
                                onClick={swapSide}
                                title="Swap Position"
                                className="p-1.5 hover:bg-brand-primary/10 text-brand-muted hover:text-brand-primary rounded-lg transition-all"
                            >
                                <MoveHorizontal size={14} />
                            </button>
                        )}
                        <button 
                            onClick={toggleCollapse}
                            title="Collapse Panel"
                            className="p-1.5 hover:bg-brand-primary/10 text-brand-muted hover:text-brand-primary rounded-lg transition-all"
                        >
                            {isHorizontal ? <ChevronLeft size={14} /> : <ChevronUp size={14} />}
                        </button>
                    </div>
                </div>
            )}

            {/* Content Container */}
            <div className={`flex-1 overflow-auto custom-scrollbar ${isCollapsed ? 'opacity-0' : 'opacity-100 transition-opacity duration-300'}`}>
                {children}
            </div>

            {/* Resize Handle */}
            <div
                onMouseDown={startResizing}
                onTouchStart={startResizing}
                className={`smart-handle absolute transition-all duration-300
                ${isHorizontal ? 'right-0 top-0 w-1 h-full cursor-col-resize hover:w-2' : 'bottom-0 left-0 h-1 w-full cursor-row-resize hover:h-2'}
                ${isResizing ? 'bg-brand-primary shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'bg-transparent hover:bg-brand-primary/30'}
                `}
            >
                <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-8 flex items-center justify-center pointer-events-none transition-opacity ${isResizing ? 'opacity-100' : 'opacity-0 group-hover:opacity-40'}`}>
                    <div className="w-0.5 h-4 bg-brand-primary/40 rounded-full mx-0.5" />
                    <div className="w-0.5 h-6 bg-brand-primary/60 rounded-full mx-0.5" />
                    <div className="w-0.5 h-4 bg-brand-primary/40 rounded-full mx-0.5" />
                </div>
            </div>

            {/* Expander Button (visible when collapsed) */}
            {isCollapsed && (
                <button
                    onClick={toggleCollapse}
                    className="absolute inset-0 w-full h-full flex items-center justify-center bg-brand-primary/5 hover:bg-brand-primary/10 transition-colors group"
                >
                    <div className="p-2 bg-brand-primary/20 rounded-full group-hover:scale-110 transition-transform">
                        {isHorizontal ? <ChevronRight className="text-brand-primary" size={20} /> : <ChevronDown className="text-brand-primary" size={20} />}
                    </div>
                </button>
            )}
        </div>
    );
};

export default ResizablePanel;
