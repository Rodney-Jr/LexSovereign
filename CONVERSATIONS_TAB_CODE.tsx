// Add this after the Leads tab content (around line 535)

{/* Conversations Tab */ }
{
    activeTab === 'conversations' && (
        <div className="grid grid-cols-1 gap-10 animate-in slide-in-from-right-4 duration-500">
            <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                    <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <MessageSquare size={14} className="text-indigo-400" /> Marketing Chatbot Conversations
                    </h4>
                    <button onClick={() => window.location.reload()} className="text-slate-500 hover:text-white transition-colors" title="Reload Conversations">
                        <RefreshCw size={14} />
                    </button>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
                    <div className="p-8 space-y-6">
                        {conversations.length > 0 ? (
                            conversations.map((conv: any) => {
                                const messages = conv.messages as any[];
                                const lastMessage = messages[messages.length - 1];
                                const firstUserMessage = messages.find((m: any) => m.role === 'user');

                                return (
                                    <div key={conv.id} className="bg-slate-950 border border-slate-800 rounded-2xl p-6 hover:border-indigo-500/30 transition-all">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center">
                                                        <MessageSquare size={18} className="text-white" />
                                                    </div>
                                                    <div>
                                                        <p className="text-white font-bold text-sm">
                                                            {conv.visitorName || conv.visitorEmail || 'Anonymous Visitor'}
                                                        </p>
                                                        <p className="text-slate-500 text-xs">
                                                            Session: {conv.sessionId.slice(0, 16)}...
                                                        </p>
                                                    </div>
                                                </div>
                                                {firstUserMessage && (
                                                    <p className="text-slate-300 text-sm mt-3 pl-13">
                                                        "{firstUserMessage.content}"
                                                    </p>
                                                )}
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-slate-500">
                                                    {new Date(conv.createdAt).toLocaleDateString()}
                                                </p>
                                                <p className="text-xs text-slate-600">
                                                    {new Date(conv.createdAt).toLocaleTimeString()}
                                                </p>
                                                <span className="inline-block mt-2 text-[8px] font-bold text-indigo-400 bg-indigo-400/5 px-2 py-0.5 rounded-full border border-indigo-400/10 uppercase tracking-widest">
                                                    {messages.length} messages
                                                </span>
                                            </div>
                                        </div>

                                        {/* Message Thread */}
                                        <div className="mt-4 space-y-2 max-h-60 overflow-y-auto">
                                            {messages.map((msg: any, idx: number) => (
                                                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                                    <div className={`max-w-[80%] rounded-xl px-4 py-2 text-xs ${msg.role === 'user'
                                                            ? 'bg-indigo-600 text-white'
                                                            : 'bg-slate-800 text-slate-300'
                                                        }`}>
                                                        {msg.content}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="text-center py-20">
                                <MessageSquare size={48} className="mx-auto text-slate-700 mb-4" />
                                <p className="text-slate-500 text-sm">No conversations yet.</p>
                                <p className="text-slate-600 text-xs mt-2">Visitor conversations from the marketing chatbot will appear here.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
