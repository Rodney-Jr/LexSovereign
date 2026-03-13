import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Shield } from 'lucide-react';

interface VideoModalProps {
    isOpen: boolean;
    onClose: () => void;
    videoSrc: string;
}

export default function VideoModal({ isOpen, onClose, videoSrc }: VideoModalProps) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl"
                    />
                    
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="relative w-full max-w-5xl aspect-video bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-white/10"
                    >
                        {/* Header/Toolbar */}
                        <div className="absolute top-0 left-0 right-0 h-14 bg-gradient-to-b from-slate-950/80 to-transparent flex items-center justify-between px-6 z-10">
                            <div className="flex items-center gap-3">
                                <div className="p-1.5 bg-indigo-500/20 rounded-lg border border-indigo-500/30">
                                    <Shield className="w-4 h-4 text-indigo-400" />
                                </div>
                                <span className="text-xs font-bold text-white uppercase tracking-widest opacity-80">
                                    NomosDesk Intelligence Demo
                                </span>
                            </div>
                            <button 
                                onClick={onClose}
                                title="Close Video Modal"
                                className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Video Content - Using <img> for WebP recording */}
                        <img 
                            src={videoSrc}
                            alt="NomosDesk Intelligence Demo"
                            className="w-full h-full object-contain bg-black"
                        />

                        {/* Decoration */}
                        <div className="absolute bottom-4 right-6 pointer-events-none">
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-950/60 backdrop-blur-md border border-white/10">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                                    Matter Inception Flow v1.0
                                </span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
