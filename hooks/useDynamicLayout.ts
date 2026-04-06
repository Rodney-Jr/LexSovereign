import { useState, useCallback, useEffect, useRef } from 'react';

interface UseDynamicLayoutOptions {
    id: string;
    initialSize: number;
    minSize: number;
    maxSize: number;
    direction: 'horizontal' | 'vertical';
    snapPoints?: number[];
    snapThreshold?: number;
    collapseThreshold?: number;
    repositionable?: boolean;
}

export const useDynamicLayout = ({
    id,
    initialSize,
    minSize,
    maxSize,
    direction,
    snapPoints = [],
    snapThreshold = 15,
    collapseThreshold,
    repositionable = false
}: UseDynamicLayoutOptions) => {
    const [size, setSize] = useState(() => {
        const saved = localStorage.getItem(`nomosdesk_layout_${id}`);
        return saved ? parseInt(saved, 10) : initialSize;
    });
    
    const [isResizing, setIsResizing] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [lastSize, setLastSize] = useState(size);
    const [side, setSide] = useState<'left' | 'right' | 'top' | 'bottom'>(() => {
        const saved = localStorage.getItem(`nomosdesk_side_${id}`);
        if (saved) return saved as any;
        return direction === 'horizontal' ? 'left' : 'top';
    });

    const startResizing = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault();
        setIsResizing(true);
    }, []);

    const stopResizing = useCallback(() => {
        setIsResizing(false);
    }, []);

    const toggleCollapse = useCallback(() => {
        if (isCollapsed) {
            setSize(lastSize > minSize ? lastSize : initialSize);
            setIsCollapsed(false);
        } else {
            setLastSize(size);
            setSize(0);
            setIsCollapsed(true);
        }
    }, [isCollapsed, lastSize, size, minSize, initialSize]);

    const swapSide = useCallback(() => {
        if (!repositionable) return;
        setSide(prev => {
            const next = direction === 'horizontal' 
                ? (prev === 'left' ? 'right' : 'left')
                : (prev === 'top' ? 'bottom' : 'top');
            localStorage.setItem(`nomosdesk_side_${id}`, next);
            return next;
        });
    }, [repositionable, direction, id]);

    const resize = useCallback((e: MouseEvent | TouchEvent) => {
        if (!isResizing) return;

        let clientCoord = 0;
        let totalSpan = 0;

        if (direction === 'horizontal') {
            clientCoord = 'touches' in e ? e.touches[0]?.clientX || 0 : (e as MouseEvent).clientX;
            totalSpan = window.innerWidth;
        } else {
            clientCoord = 'touches' in e ? e.touches[0]?.clientY || 0 : (e as MouseEvent).clientY;
            totalSpan = window.innerHeight;
        }

        let newSize = 0;
        if (side === 'left' || side === 'top') {
            newSize = clientCoord;
        } else {
            newSize = totalSpan - clientCoord;
        }

        // Apply Min/Max
        if (newSize < minSize) {
            if (collapseThreshold && newSize < collapseThreshold) {
                newSize = 0;
                setIsCollapsed(true);
            } else {
                newSize = minSize;
                setIsCollapsed(false);
            }
        } else if (newSize > maxSize) {
            newSize = maxSize;
            setIsCollapsed(false);
        } else {
            setIsCollapsed(false);
        }

        // Apply Snapping
        for (const snap of snapPoints) {
            if (Math.abs(newSize - snap) < snapThreshold) {
                newSize = snap;
                break;
            }
        }

        setSize(newSize);
        if (newSize > 0) {
            localStorage.setItem(`nomosdesk_layout_${id}`, newSize.toString());
        }
    }, [isResizing, direction, side, minSize, maxSize, collapseThreshold, snapPoints, snapThreshold, id]);

    useEffect(() => {
        if (isResizing) {
            window.addEventListener('mousemove', resize);
            window.addEventListener('mouseup', stopResizing);
            window.addEventListener('touchmove', resize);
            window.addEventListener('touchend', stopResizing);
        } else {
            window.removeEventListener('mousemove', resize);
            window.removeEventListener('mouseup', stopResizing);
            window.removeEventListener('touchmove', resize);
            window.removeEventListener('touchend', stopResizing);
        }
        return () => {
            window.removeEventListener('mousemove', resize);
            window.removeEventListener('mouseup', stopResizing);
            window.removeEventListener('touchmove', resize);
            window.removeEventListener('touchend', stopResizing);
        };
    }, [isResizing, resize, stopResizing]);

    return {
        size,
        isResizing,
        isCollapsed,
        side,
        startResizing,
        toggleCollapse,
        swapSide
    };
};
