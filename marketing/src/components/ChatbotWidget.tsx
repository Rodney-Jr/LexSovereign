import React, { useState } from 'react';
import { MessageCircle, Minimize2, X, Send } from 'lucide-react';
import { apiFetch } from '../utils/api';

export default function ChatbotWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([
        { role: 'assistant', content: 'Hi! How can I help you learn more about NomosDesk?' }
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const [sessionId] = useState(() => `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
    const [isLoading, setIsLoading] = useState(false);

    React.useEffect(() => {
        const toggleChat = () => setIsOpen(true);
        window.addEventListener('nomosdesk-open-chat', toggleChat);
        return () => window.removeEventListener('nomosdesk-open-chat', toggleChat);
    }, []);

    const handleSendMessage = async () => {
        if (!inputMessage.trim() || isLoading) return;

        const userMessage = inputMessage.trim();
        setInputMessage('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        try {
            const response = await apiFetch('/api/chat-conversations', {
                method: 'POST',
                body: JSON.stringify({
                    sessionId,
                    message: userMessage
                })
            });

            const data = await response.json();
            setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'Sorry, I encountered an error. Please try again or contact us directly.'
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

    return (
        <div className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${isMinimized ? 'w-80' : 'w-96'}`}>
            {/* Chat Window */}
            <div className={`bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden ${isMinimized ? 'h-16' : 'h-[600px]'} flex flex-col`}>
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 flex items-center justify-between">
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
                            {messages.map((msg, idx) => (
                                <div
                                    key={idx}
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[80%] rounded-2xl px-4 py-2 ${msg.role === 'user'
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-slate-800 text-slate-200'
                                            }`}
                                    >
                                        <p className="text-sm">{msg.content}</p>
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-slate-800 text-slate-200 rounded-2xl px-4 py-2">
                                        <div className="flex gap-1">
                                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Input */}
                        <div className="p-4 bg-slate-900 border-t border-slate-800">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={inputMessage}
                                    onChange={(e) => setInputMessage(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Type your message..."
                                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                                    disabled={isLoading}
                                />
                                <button
                                    onClick={handleSendMessage}
                                    disabled={!inputMessage.trim() || isLoading}
                                    className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white p-2 rounded-xl transition-colors"
                                    aria-label="Send message"
                                >
                                    <Send size={20} />
                                </button>
                            </div>
                            <p className="text-xs text-slate-500 mt-2 text-center">
                                Powered by NomosDesk AI
                            </p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
