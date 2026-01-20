
import React from 'react';
import { Link, ShieldCheck, Globe } from 'lucide-react';

const GlobalSettings: React.FC = () => {
    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-12">
            <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-3xl space-y-8 shadow-2xl backdrop-blur-sm">
                <div className="space-y-2 border-b border-slate-800 pb-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-3">
                        <Globe className="text-blue-400" />
                        Global Infrastructure Plane
                    </h3>
                    <p className="text-slate-400 text-sm">
                        Phase 3 Omnichannel settings and Bridge Configurations.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {/* Column 1: Identity Bridge */}
                    <div className="space-y-8">
                        <div className="space-y-4">
                            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                                <Link size={16} /> Identity Bridge
                            </h4>
                            <div className="p-5 bg-slate-800/30 border border-slate-700 rounded-2xl space-y-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase">OIDC Discovery URL</label>
                                    <input
                                        type="text"
                                        readOnly
                                        value="https://idp.accrapartners.gh/.well-known/openid-configuration"
                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs font-mono text-emerald-400"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase">Signing Alg</label>
                                        <div className="bg-slate-950 p-2 rounded-lg text-xs font-mono text-slate-400">RS256</div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase">Token TTL</label>
                                        <div className="bg-slate-950 p-2 rounded-lg text-xs font-mono text-slate-400">15m (Mobile)</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Column 2: Egress & Latency */}
                    <div className="space-y-8">
                        <div className="space-y-4">
                            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                                <ShieldCheck size={16} /> Egress Sanitization
                            </h4>
                            <div className="p-5 bg-slate-800/30 border border-slate-700 rounded-2xl space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-slate-300">Strict PII Scrubbing</span>
                                    <div className="w-10 h-5 bg-emerald-500 rounded-full relative">
                                        <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full"></div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-slate-300">WhatsApp Proxy Pinning</span>
                                    <div className="w-10 h-5 bg-emerald-500 rounded-full relative">
                                        <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full"></div>
                                    </div>
                                </div>
                                <div className="pt-2">
                                    <p className="text-[9px] text-slate-500 leading-relaxed italic">
                                        "Phase 3 mandates that all tokens destined for Meta endpoints traverse the Sovereign Scrubbing Proxy GH-PROXY-01."
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Globe className="text-blue-400" size={18} />
                                <p className="text-xs">Sovereign Silo: West Africa</p>
                            </div>
                            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">Latency: 12ms</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GlobalSettings;
