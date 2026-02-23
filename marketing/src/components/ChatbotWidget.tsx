import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Minimize2, X, Send, Calendar, CheckCircle, Loader2, ChevronRight } from 'lucide-react';
import { apiFetch } from '../utils/api';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Message {
    role: 'user' | 'assistant' | 'form' | 'success';
    content: string;
}

interface DemoFormData {
    name: string;
    email: string;
    company: string;
    phone: string;
}

// ─── In-Chat Demo Form ────────────────────────────────────────────────────────

function DemoRequestForm({ onSubmit, onSkip }: {
    onSubmit: (data: DemoFormData) => void;
    onSkip: () => void;
}) {
    const [form, setForm] = useState<DemoFormData>({ name: '', email: '', company: '', phone: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Partial<DemoFormData & { consent: string }>>({});
    const [hasConsent, setHasConsent] = useState(false);

    const validate = () => {
        const e: Partial<DemoFormData & { consent: string }> = {};
        if (!form.name.trim()) e.name = 'Required';
        if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email required';
        if (!hasConsent) e.consent = 'You must acknowledge the legal disclaimer to proceed.';
        return e;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length > 0) { setErrors(errs); return; }
        setIsSubmitting(true);
        await onSubmit(form);
        setIsSubmitting(false);
    };

    return (
        <div className="bg-slate-800 rounded-2xl rounded-tl-sm p-4 max-w-[95%] space-y-3 border border-indigo-500/20">
            <div className="flex items-center gap-2 mb-1">
                <Calendar size={14} className="text-indigo-400" />
                <p className="text-xs font-bold text-indigo-300 uppercase tracking-wider">Book a Demo</p>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
                Fill in your details and our team will reach out to schedule a personalised walkthrough.
            </p>
            <form onSubmit={handleSubmit} className="space-y-3">
                {/* Inputs Row 1 */}
                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <input
                            type="text"
                            placeholder="Full Name *"
                            value={form.name}
                            onChange={e => { setForm(f => ({ ...f, name: e.target.value })); setErrors(er => ({ ...er, name: '' })); }}
                            className={`w-full bg-slate-900 border rounded-xl px-3 py-2 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all ${errors.name ? 'border-red-500' : 'border-slate-700'}`}
                        />
                        {errors.name && <p className="text-red-400 text-[10px] mt-0.5 ml-1">{errors.name}</p>}
                    </div>
                    <div>
                        <input
                            type="email"
                            placeholder="Work Email *"
                            value={form.email}
                            onChange={e => { setForm(f => ({ ...f, email: e.target.value })); setErrors(er => ({ ...er, email: '' })); }}
                            className={`w-full bg-slate-900 border rounded-xl px-3 py-2 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all ${errors.email ? 'border-red-500' : 'border-slate-700'}`}
                        />
                        {errors.email && <p className="text-red-400 text-[10px] mt-0.5 ml-1">{errors.email}</p>}
                    </div>
                </div>
                {/* Inputs Row 2 */}
                <div className="grid grid-cols-2 gap-2">
                    <input
                        type="text"
                        placeholder="Organisation"
                        value={form.company}
                        onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                    />
                    <input
                        type="tel"
                        placeholder="Phone Number"
                        value={form.phone}
                        onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                    />
                </div>

                {/* AI Intake Legal Acknowledgment checkbox */}
                <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-700/50 mt-2">
                    <label className="flex items-start gap-2 cursor-pointer group">
                        <div className="relative flex items-center mt-0.5 shrink-0">
                            <input
                                type="checkbox"
                                checked={hasConsent}
                                onChange={(e) => {
                                    setHasConsent(e.target.checked);
                                    if (e.target.checked) setErrors(er => ({ ...er, consent: '' }));
                                }}
                                className="peer appearance-none w-4 h-4 border border-slate-600 rounded bg-slate-800 checked:bg-indigo-500 checked:border-indigo-500 transition-all cursor-pointer"
                            />
                            <svg className="absolute w-4 h-4 pointer-events-none opacity-0 peer-checked:opacity-100 text-white p-0.5 transition-opacity" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                        </div>
                        <div className="flex-1">
                            <p className="text-[10px] text-slate-400 leading-snug">
                                By submitting this form, you acknowledge that you are interacting with an automated AI assistant.
                                <strong className="text-slate-300 font-medium mx-1">Submitting your information does not establish an attorney-client relationship.</strong>
                                The receiving firm determines when representation begins and controls confidentiality.
                            </p>
                        </div>
                    </label>
                    {errors.consent && <p className="text-red-400 text-[10px] mt-1.5 ml-6 animate-pulse">{errors.consent}</p>}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-1">
                    <button
                        type="submit"
                        disabled={isSubmitting || !hasConsent}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed text-white py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                    >
                        {isSubmitting ? (
                            <><Loader2 size={12} className="animate-spin" /> Submitting...</>
                        ) : (
                            <><ChevronRight size={12} /> Request Demo</>
                        )}
                    </button>
                    <button
                        type="button"
                        onClick={onSkip}
                        className="px-3 py-2 text-slate-500 hover:text-slate-300 text-xs transition-colors rounded-xl hover:bg-slate-700/50"
                    >
                        Skip
                    </button>
                </div>
            </form>
        </div>
    );
}

// ─── Success Bubble ───────────────────────────────────────────────────────────

function SuccessBubble({ name }: { name: string }) {
    return (
        <div className="bg-emerald-900/40 border border-emerald-500/30 rounded-2xl rounded-tl-sm p-4 max-w-[90%]">
            <div className="flex items-center gap-2 mb-2">
                <CheckCircle size={16} className="text-emerald-400" />
                <p className="text-xs font-bold text-emerald-300">Demo Request Received!</p>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
                Thanks, <span className="font-semibold text-white">{name}</span>! Our team will be in touch within 24 hours to schedule your personalised NomosDesk walkthrough. In the meantime, feel free to ask me anything about the platform.
            </p>
        </div>
    );
}

// ─── Main Widget ──────────────────────────────────────────────────────────────

export default function ChatbotWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [showDemoForm, setShowDemoForm] = useState(false);
    const [submittedName, setSubmittedName] = useState('');
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: 'Hi! How can I help you learn more about NomosDesk?' }
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const [sessionId] = useState(() => `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to latest message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, showDemoForm]);

    // Listen for regular chat open — opens chat with welcome message intact
    useEffect(() => {
        const openChat = () => {
            setIsOpen(true);
            setIsMinimized(false);
        };
        window.addEventListener('nomosdesk-open-chat', openChat);
        return () => window.removeEventListener('nomosdesk-open-chat', openChat);
    }, []);

    // Listen for demo-intent open — opens chat with no welcome message, shows form directly
    useEffect(() => {
        const openDemo = () => {
            setIsOpen(true);
            setIsMinimized(false);
            if (!submittedName) {
                // Clear messages so no welcome greeting appears before the form
                setMessages([]);
                setShowDemoForm(true);
            }
        };
        window.addEventListener('nomosdesk-open-demo', openDemo);
        return () => window.removeEventListener('nomosdesk-open-demo', openDemo);
    }, [submittedName]);

    const handleDemoSubmit = async (data: DemoFormData) => {
        try {
            await apiFetch('/api/leads', {
                method: 'POST',
                body: JSON.stringify({
                    name: data.name,
                    email: data.email,
                    company: data.company,
                    phone: data.phone,
                    source: 'CHATBOT_DEMO'
                })
            });
        } catch (err) {
            console.error('Lead submission error:', err);
            // Still show success — don't penalise user for network issues
        }
        setSubmittedName(data.name);
        setShowDemoForm(false);
        // Add a success message into the chat stream
        setMessages(prev => [...prev, { role: 'success', content: data.name }]);
    };

    const handleDemoSkip = () => {
        setShowDemoForm(false);
        setMessages(prev => [...prev, {
            role: 'assistant',
            content: 'No problem! Feel free to ask me anything about NomosDesk — features, pricing, security, or how it compares to other platforms.'
        }]);
    };

    const handleSendMessage = async () => {
        if (!inputMessage.trim() || isLoading) return;

        const userMessage = inputMessage.trim();
        setInputMessage('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        try {
            const response = await apiFetch('/api/chat-conversations', {
                method: 'POST',
                body: JSON.stringify({ sessionId, message: userMessage })
            });
            const data = await response.json();
            setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'Sorry, I encountered an error. Please try again or email us at access@nomosdesk.com.'
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    // ── Closed state: floating button ──────────────────────────────────────────
    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 z-50 group"
                aria-label="Open chat"
            >
                <MessageCircle size={28} />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                    1
                </span>
            </button>
        );
    }

    // ── Open state: chat window ────────────────────────────────────────────────
    return (
        <div className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${isMinimized ? 'w-80' : 'w-96'}`}>
            <div className={`bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden ${isMinimized ? 'h-16' : 'h-[620px]'} flex flex-col`}>

                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                            <MessageCircle size={20} className="text-white" />
                        </div>
                        <div>
                            <h3 className="text-white font-bold text-sm">NomosDesk Assistant</h3>
                            <p className="text-indigo-200 text-xs">We typically reply instantly</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setIsMinimized(!isMinimized)}
                            className="text-white/80 hover:text-white transition-colors p-1"
                            aria-label="Minimize chat"
                        >
                            <Minimize2 size={18} />
                        </button>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-white/80 hover:text-white transition-colors p-1"
                            aria-label="Close chat"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {!isMinimized && (
                    <>
                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950">
                            {messages.map((msg, idx) => {
                                if (msg.role === 'success') {
                                    return (
                                        <div key={idx} className="flex justify-start">
                                            <SuccessBubble name={msg.content} />
                                        </div>
                                    );
                                }
                                return (
                                    <div
                                        key={idx}
                                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                            className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${msg.role === 'user'
                                                ? 'bg-indigo-600 text-white rounded-br-sm'
                                                : 'bg-slate-800 text-slate-200 rounded-bl-sm'
                                                }`}
                                        >
                                            <p className="text-sm leading-relaxed">{msg.content}</p>
                                        </div>
                                    </div>
                                );
                            })}

                            {/* In-chat demo form — appears after messages */}
                            {showDemoForm && (
                                <div className="flex justify-start animate-in slide-in-from-bottom-2 duration-300">
                                    <DemoRequestForm
                                        onSubmit={handleDemoSubmit}
                                        onSkip={handleDemoSkip}
                                    />
                                </div>
                            )}

                            {/* Typing indicator */}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-slate-800 text-slate-200 rounded-2xl rounded-bl-sm px-4 py-3">
                                        <div className="flex gap-1">
                                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input — hidden while demo form is showing */}
                        {!showDemoForm && (
                            <div className="p-4 bg-slate-900 border-t border-slate-800 shrink-0">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={inputMessage}
                                        onChange={e => setInputMessage(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        placeholder="Type your message..."
                                        className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none placeholder:text-slate-600"
                                        disabled={isLoading}
                                    />
                                    <button
                                        onClick={handleSendMessage}
                                        disabled={!inputMessage.trim() || isLoading}
                                        className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white p-2.5 rounded-xl transition-colors"
                                        aria-label="Send message"
                                    >
                                        <Send size={18} />
                                    </button>
                                </div>
                                <p className="text-[10px] text-slate-600 mt-2 text-center">
                                    Powered by NomosDesk AI
                                </p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
