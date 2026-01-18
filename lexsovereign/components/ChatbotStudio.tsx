
import React, { useState } from 'react';
import { 
  Bot, 
  Settings, 
  Database, 
  MessageSquare, 
  Globe, 
  Zap, 
  ShieldCheck, 
  Save, 
  Plus, 
  Trash2, 
  Search, 
  Terminal, 
  Smartphone,
  Eye,
  // Added missing EyeOff icon
  EyeOff,
  RefreshCw,
  Info,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { ChatbotConfig, KnowledgeArtifact } from '../types';
import { LexGeminiService } from '../services/geminiService';

const INITIAL_KNOWLEDGE: KnowledgeArtifact[] = [
  { id: 'k1', title: 'Onboarding Process', category: 'OnboardingProcess', content: 'Our client onboarding takes 48 hours. We require Ghana Card verification and a Conflict Check.', lastIndexed: '2h ago' },
  { id: 'k2', title: 'Real Estate Practice', category: 'PracticeArea', content: 'We specialize in land title registration and east-legon property disputes.', lastIndexed: '1d ago' },
  { id: 'k3', title: 'Fee Structure', category: 'Faq', content: 'Initial consultation is 500 GHS. We use GBA Scale of Fees for litigation.', lastIndexed: '3d ago' }
];

const ChatbotStudio: React.FC = () => {
  const [config, setConfig] = useState<ChatbotConfig>({
    id: 'bot_01',
    botName: 'SovereignAssistant',
    welcomeMessage: 'Welcome to Accra Partners. I am your Sovereign Assistant. How can I help you onboard today?',
    isEnabled: true,
    channels: { whatsapp: true, webWidget: true },
    knowledgeBaseIds: ['k1', 'k2'],
    systemInstruction: 'You are a lead generation bot for a premium Ghana law firm.'
  });

  const [knowledge, setKnowledge] = useState<KnowledgeArtifact[]>(INITIAL_KNOWLEDGE);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<{role: 'user' | 'bot', text: string}[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isIndexing, setIsIndexing] = useState(false);

  const gemini = new LexGeminiService();

  const handleTestChat = async () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput;
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setChatInput('');
    setIsTyping(true);

    try {
      const result = await gemini.publicChat(userMsg, config, knowledge);
      setChatMessages(prev => [...prev, { role: 'bot', text: result.text }]);
    } catch (e) {
      setChatMessages(prev => [...prev, { role: 'bot', text: "Error: Secure tunnel disrupted." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const startIndexing = () => {
    setIsIndexing(true);
    setTimeout(() => setIsIndexing(false), 2000);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-800 pb-8">
        <div className="space-y-1">
          <h3 className="text-3xl font-bold flex items-center gap-4 text-white tracking-tight">
            <div className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
              <Bot className="text-indigo-400" size={28} />
            </div>
            Sovereign Bot Studio
          </h3>
          <p className="text-slate-400 text-sm">Configure and train your tenant-branded public chatbot with Zero-Knowledge guardrails.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={startIndexing}
            className="px-6 py-3 bg-slate-900 border border-slate-800 text-slate-300 rounded-2xl font-bold text-xs flex items-center gap-2 hover:border-emerald-500/50 transition-all"
          >
            {isIndexing ? <RefreshCw className="animate-spin" size={16}/> : <Database size={16}/>}
            Sync Knowledge Base
          </button>
          <button className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold text-xs flex items-center gap-2 shadow-xl shadow-emerald-900/20 transition-all">
            <Save size={16}/> Push to Production
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left: Configuration & Knowledge */}
        <div className="lg:col-span-7 space-y-8">
           {/* Bot Config */}
           <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 space-y-8 shadow-2xl relative overflow-hidden">
              <h4 className="text-sm font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                 <Settings size={16} className="text-indigo-400" /> Identity & Personality
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Bot Public Name</label>
                    <input 
                      type="text" 
                      value={config.botName}
                      onChange={e => setConfig({...config, botName: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-3 text-sm text-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Egress Channels</label>
                    <div className="flex gap-3">
                       <ChannelToggle active={config.channels.whatsapp} label="WhatsApp" icon={<Smartphone size={14}/>} onClick={() => setConfig({...config, channels: {...config.channels, whatsapp: !config.channels.whatsapp}})} />
                       <ChannelToggle active={config.channels.webWidget} label="Web Widget" icon={<Globe size={14}/>} onClick={() => setConfig({...config, channels: {...config.channels, webWidget: !config.channels.webWidget}})} />
                    </div>
                 </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Welcome Hook</label>
                <input 
                  type="text" 
                  value={config.welcomeMessage}
                  onChange={e => setConfig({...config, welcomeMessage: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-3 text-sm text-slate-200 focus:outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">AI Strategic Mandate (System Prompt)</label>
                <textarea 
                  value={config.systemInstruction}
                  onChange={e => setConfig({...config, systemInstruction: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-sm text-slate-300 h-24 resize-none focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
           </div>

           {/* Knowledge Base */}
           <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 space-y-6 shadow-2xl">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                   <Database size={16} className="text-emerald-400" /> Knowledge Base Training
                </h4>
                <button className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-1 hover:underline">
                   <Plus size={14}/> Add Document
                </button>
              </div>

              <div className="space-y-3">
                 {knowledge.map(k => (
                   <div key={k.id} className="flex items-center justify-between p-4 bg-slate-950 border border-slate-800 rounded-2xl hover:border-indigo-500/30 transition-all group">
                      <div className="flex items-center gap-4">
                         <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-emerald-400 ${config.knowledgeBaseIds.includes(k.id) ? 'bg-emerald-500/10' : 'bg-slate-900 opacity-40'}`}>
                            <Database size={16} />
                         </div>
                         <div>
                            <p className="text-xs font-bold text-slate-200">{k.title}</p>
                            <p className="text-[9px] text-slate-600 font-mono uppercase tracking-tighter">{k.category} • Indexed {k.lastIndexed}</p>
                         </div>
                      </div>
                      <div className="flex items-center gap-4">
                         <button 
                          onClick={() => {
                            const ids = config.knowledgeBaseIds.includes(k.id) 
                              ? config.knowledgeBaseIds.filter(id => id !== k.id)
                              : [...config.knowledgeBaseIds, k.id];
                            setConfig({...config, knowledgeBaseIds: ids});
                          }}
                          className={`px-3 py-1 rounded-full text-[8px] font-bold uppercase border transition-all ${
                            config.knowledgeBaseIds.includes(k.id) ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-800 text-slate-500 border-slate-700'
                          }`}
                         >
                            {config.knowledgeBaseIds.includes(k.id) ? 'Active' : 'Ignored'}
                         </button>
                         <button className="p-1.5 text-slate-700 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all">
                            <Trash2 size={14}/>
                         </button>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>

        {/* Right: Live Sandbox & Guardrails */}
        <div className="lg:col-span-5 space-y-8">
           {/* Sandbox Terminal */}
           <div className="bg-black border border-slate-800 rounded-[3rem] overflow-hidden shadow-2xl flex flex-col h-[600px]">
              <div className="bg-slate-900/50 p-6 border-b border-slate-800 flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    <h5 className="text-[10px] font-bold text-white uppercase tracking-widest">Public Sandbox Preview</h5>
                 </div>
                 <span className="text-[9px] font-mono text-slate-500">PROVIDER: GEMINI-3-FLASH</span>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide">
                 <div className="flex justify-start">
                    <div className="bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-2xl rounded-tl-none max-w-[85%] text-xs text-indigo-100">
                       {config.welcomeMessage}
                    </div>
                 </div>
                 {chatMessages.map((m, i) => (
                   <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`p-4 rounded-2xl text-xs max-w-[85%] ${
                        m.role === 'user' 
                        ? 'bg-slate-800 text-white rounded-tr-none' 
                        : 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-100 rounded-tl-none'
                      }`}>
                         {m.text}
                      </div>
                   </div>
                 ))}
                 {isTyping && (
                   <div className="flex justify-start">
                      <div className="bg-indigo-500/10 p-3 rounded-2xl rounded-tl-none flex gap-1">
                         <div className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce"></div>
                         <div className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                         <div className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                      </div>
                   </div>
                 )}
              </div>

              <div className="p-6 bg-slate-950 border-t border-slate-800">
                 <div className="relative">
                    <input 
                      type="text" 
                      value={chatInput}
                      onChange={e => setChatInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleTestChat()}
                      placeholder="Simulate user query..."
                      className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-6 py-4 text-sm text-white pr-16 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <button 
                      onClick={handleTestChat}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 rounded-xl text-white hover:bg-indigo-500 transition-all"
                    >
                       <MessageSquare size={18} />
                    </button>
                 </div>
                 <div className="mt-4 flex items-center justify-between px-2">
                    <div className="flex items-center gap-4">
                       <div className="flex items-center gap-1.5 text-[8px] font-bold text-slate-500 uppercase tracking-widest">
                          <ShieldCheck size={10} className="text-emerald-500"/> RRE Intercept: ACTIVE
                       </div>
                       <div className="flex items-center gap-1.5 text-[8px] font-bold text-slate-500 uppercase tracking-widest">
                          <EyeOff size={10} className="text-amber-500"/> DAS Proxy: ACTIVE
                       </div>
                    </div>
                 </div>
              </div>
           </div>

           {/* Security Guardrails Panel */}
           <div className="bg-indigo-900/5 border border-indigo-500/10 p-8 rounded-[2.5rem] space-y-4">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                    <AlertTriangle className="text-indigo-400" size={20} />
                 </div>
                 <h5 className="font-bold text-sm text-indigo-300 uppercase tracking-widest">Non-Advisory Guardrails</h5>
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                The public bot is automatically restricted by the <strong>UPL-Interceptor v4</strong>. Any attempt by the user to solicit definitive legal strategy will result in an automated redirect to your onboarding flow.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
};

const ChannelToggle = ({ active, label, icon, onClick }: any) => (
  <button 
    onClick={onClick}
    className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-2xl border-2 transition-all font-bold text-[10px] uppercase tracking-widest ${
      active ? 'bg-indigo-600/10 border-indigo-500 text-indigo-400 shadow-lg shadow-indigo-900/10' : 'bg-slate-950 border-slate-800 text-slate-600 hover:text-slate-400'
    }`}
  >
    {icon}
    {label}
  </button>
);

export default ChatbotStudio;
