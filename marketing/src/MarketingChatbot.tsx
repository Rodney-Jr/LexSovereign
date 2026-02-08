import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Bot, Sparkles, ChevronRight, Loader2 } from 'lucide-react';

interface Message {
    role: 'user' | 'bot';
    text: string;
    timestamp: Date;
}

interface MarketingChatbotProps {
    onBookDemo?: () => void;
}

const MarketingChatbot: React.FC<MarketingChatbotProps> = ({ onBookDemo }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'bot',
            text: "Greetings. I am the LexSovereign AI. How can I assist you with your regional legal technology requirements today?",
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg: Message = {
            role: 'user',
            text: input,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        try {
            // Use the platform's public chatbot API
            // Note: In a real production scenario, VITE_PLATFORM_URL would be used
            const platformUrl = import.meta.env.VITE_PLATFORM_URL || '';
            const response = await fetch(`${platformUrl}/api/chatbot/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: input,
                    config: {
                        botName: 'SovereignAssistant',
                        systemInstruction: `You are an expert LexSovereign sales and marketing bot. You represent Nexus Technologies Limited. 
                        Your goal is to sell LexSovereign to Managing Partners and General Counsels in Africa (Ghana, Nigeria, Kenya, South Africa). 
                        
                        KEY MESSAGING:
                        1. Sovereignty: Cryptographic isolation. Only the firm holds the keys (BYOK).
                        2. Velocity: 90-second first drafts via AI Auto-Hydrate.
                        3. Certainty: AI is hard-pinned to regional law (POPIA, NDPR, DPA); it won't hallucinate or quote foreign law.
                        4. Sanctity: Total client privacy via logical software enclaves and Zero-Knowledge architecture.
                        5. Intelligence: 3-layer research (Sovereign Vault for internal precedents, Jurisdictional Archives for regional law, and Privacy-Scrubbed Global Search).
                        
                        Tone: Professional, elite, reassuring, and non-technical. Focus on Emotional ROI: speed, safety, and profitability.
                        Encourage users to 'Book a Sovereign Demo' or 'Launch Enclave'. Use the phrase 'African Legal Excellence' as a sign-off frequently.`,
                        knowledgeBaseIds: ['k1', 'k2', 'k3'] // Default knowledge artifacts
                    }
                })
            });

            if (!response.ok) throw new Error("Connection lost");

            const data = await response.json();
            setMessages(prev => [...prev, {
                role: 'bot',
                text: data.text || "I am processing your request through our secure enclave. One moment.",
                timestamp: new Date()
            }]);
        } catch (e) {
            setMessages(prev => [...prev, {
                role: 'bot',
                text: "My secure uplink is currently being optimized. Please feel free to explore our solutions in the meantime.",
                timestamp: new Date()
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="fixed bottom-8 right-8 z-[200] font-sans">
            {/* Trigger Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    title="Open Sovereign Assistant"
                    className="w-16 h-16 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 group relative"
                >
                    <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-20 group-hover:opacity-40"></div>
                    <MessageSquare size={28} className="relative z-10" />
                    <div className="absolute -top-2 -right-2 bg-emerald-400 w-4 h-4 rounded-full border-2 border-[#020617] animate-pulse"></div>
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className="w-[380px] h-[550px] bg-[#0f172a]/95 backdrop-blur-xl border border-white/10 rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-300">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-emerald-600/20 to-blue-600/20 p-6 border-b border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20">
                                <Bot className="text-emerald-400" size={20} />
                            </div>
                            <div>
                                <h4 className="font-bold text-white text-sm">Sovereign Assistant</h4>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                                    <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">Secure Uplink</span>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            title="Close Assistant"
                            className="p-2 hover:bg-white/5 rounded-xl text-slate-400 hover:text-white transition-all"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Messages */}
                    <div
                        ref={scrollRef}
                        className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide"
                    >
                        {messages.map((m, i) => (
                            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`p-4 rounded-2xl text-xs leading-relaxed max-w-[85%] ${m.role === 'user'
                                    ? 'bg-emerald-600 text-white rounded-tr-none shadow-lg shadow-emerald-900/20'
                                    : 'bg-white/5 border border-white/10 text-slate-200 rounded-tl-none'
                                    }`}>
                                    {m.text}
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="flex justify-start">
                                <div className="bg-white/5 border border-white/10 p-3 rounded-2xl rounded-tl-none flex gap-1">
                                    <div className="w-1.5 h-1.5 bg-emerald-400/50 rounded-full animate-bounce"></div>
                                    <div className="w-1.5 h-1.5 bg-emerald-400/50 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                                    <div className="w-1.5 h-1.5 bg-emerald-400/50 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input Area */}
                    <div className="p-6 bg-white/5 border-t border-white/5">
                        <div className="relative">
                            <input
                                type="text"
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSend()}
                                placeholder="Ask about regional enclaves..."
                                className="w-full bg-[#020617] border border-white/10 rounded-2xl px-5 py-4 text-xs text-white focus:outline-none focus:border-emerald-500/50 transition-all pr-12 placeholder:text-slate-600"
                            />
                            <button
                                onClick={handleSend}
                                disabled={!input.trim() || isTyping}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isTyping ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                            </button>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                            <QuickAction label="Book Demo" onClick={() => onBookDemo?.()} />
                            <QuickAction label="Pricing" onClick={() => setInput("What are the sovereign pricing tiers?")} />
                            <QuickAction label="Compliance" onClick={() => setInput("How do you ensure NDPR/POPIA compliance?")} />
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="bg-[#020617] p-3 text-center border-t border-white/5">
                        <p className="text-[8px] text-slate-600 flex items-center justify-center gap-1 uppercase tracking-[0.2em] font-bold">
                            <Sparkles size={8} className="text-emerald-500" /> Powered by LexSovereign AI Enclave
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

const QuickAction = ({ label, onClick }: { label: string, onClick: () => void }) => (
    <button
        onClick={onClick}
        className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[9px] font-bold text-slate-400 uppercase tracking-widest hover:bg-emerald-500/10 hover:text-emerald-400 hover:border-emerald-500/30 transition-all active:scale-95"
    >
        {label}
    </button>
);

export default MarketingChatbot;
