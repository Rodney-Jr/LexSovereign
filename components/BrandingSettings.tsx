import React, { useState, useEffect } from 'react';
import { Save, Loader2, Image as ImageIcon, Type, FileText, CheckCircle2, AlertTriangle, Droplet } from 'lucide-react';
import { BrandingProfile } from '../types';
import { authorizedFetch, getSavedSession } from '../utils/api';

const BrandingSettings: React.FC = () => {
    const [profile, setProfile] = useState<BrandingProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form State
    const [formData, setFormData] = useState<Partial<BrandingProfile>>({
        name: 'Default Branding',
        primaryFont: 'Times New Roman',
        coverPageEnabled: false,
        watermarkText: ''
    });

    useEffect(() => {
        fetchBranding();
    }, []);

    const fetchBranding = async () => {
        try {
            setIsLoading(true);
            const session = getSavedSession();
            if (!session?.token) return;

            const profiles = await authorizedFetch('/api/branding-profiles', {
                token: session.token
            });

            if (Array.isArray(profiles) && profiles.length > 0) {
                // Get the latest profile (assuming ordered by createdAt desc or version)
                const latest = profiles[0];
                setProfile(latest);
                setFormData({
                    name: latest.name,
                    logoUrl: latest.logoUrl,
                    primaryFont: latest.primaryFont,
                    headerText: latest.headerText,
                    footerText: latest.footerText,
                    coverPageEnabled: latest.coverPageEnabled,
                    watermarkText: latest.watermarkText || ''
                });
            }
        } catch (e: any) {
            console.error("Failed to fetch branding:", e);
            // Don't show error on 404/empty, just encourage creation
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setIsSaving(true);
            setSaveSuccess(false);
            setError(null);

            const session = getSavedSession();
            if (!session?.token) throw new Error("No active session");

            // We always create a new version (PostgreSQL logic likely handles version increment or updates)
            // But per the route implementation, it's a POST to root.
            const result = await authorizedFetch('/api/branding-profiles', {
                method: 'POST',
                token: session.token,
                body: JSON.stringify(formData)
            });

            setProfile(result);
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (e: any) {
            console.error(e);
            setError(e.message || "Failed to save branding profile");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="animate-spin text-purple-500" size={32} />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in slide-in-from-right-4">
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] space-y-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Droplet size={120} />
                </div>

                <div className="space-y-2">
                    <h4 className="text-lg font-bold text-white flex items-center gap-3">
                        <Droplet className="text-emerald-400" /> White Label & Watermarking
                    </h4>
                    <p className="text-sm text-slate-400">Configure how your tenant's identity appears on documents and exported files.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    {/* Left Column: Form */}
                    <div className="space-y-6">

                        {/* Profile Name */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Profile Name (Internal)</label>
                            <input
                                type="text"
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-purple-500 transition-all placeholder:text-slate-700"
                                placeholder="e.g. Corporate Standard 2024"
                                value={formData.name || ''}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>

                        {/* Watermark Text */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                                <Droplet size={12} /> Watermark Text
                            </label>
                            <input
                                type="text"
                                className="w-full bg-slate-950 border border-emerald-500/30 rounded-xl px-4 py-3 text-sm text-emerald-100 focus:outline-none focus:border-emerald-500 transition-all placeholder:text-slate-700"
                                placeholder="Leave empty to use Tenant Name"
                                value={formData.watermarkText || ''}
                                onChange={e => setFormData({ ...formData, watermarkText: e.target.value })}
                            />
                            <p className="text-[10px] text-slate-500 italic">This text will be overlaid diagonally on all document drafts and PDF exports.</p>
                        </div>

                        {/* Font Selection */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                                <Type size={12} /> Primary Font
                            </label>
                            <select
                                aria-label="Primary Font"
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-purple-500 transition-all"
                                value={formData.primaryFont || 'Times New Roman'}
                                onChange={e => setFormData({ ...formData, primaryFont: e.target.value })}
                            >
                                <option value="Times New Roman">Times New Roman (Standard)</option>
                                <option value="Arial">Arial (Modern)</option>
                                <option value="Calibri">Calibri (Clean)</option>
                                <option value="Roboto">Roboto (Digital)</option>
                            </select>
                        </div>

                        {/* Header Text */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Header Text</label>
                            <input
                                type="text"
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-purple-500 transition-all placeholder:text-slate-700"
                                placeholder="Top right header content..."
                                value={formData.headerText || ''}
                                onChange={e => setFormData({ ...formData, headerText: e.target.value })}
                            />
                        </div>

                        {/* Footer Text */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Footer Text</label>
                            <input
                                type="text"
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-purple-500 transition-all placeholder:text-slate-700"
                                placeholder="Bottom center footer content..."
                                value={formData.footerText || ''}
                                onChange={e => setFormData({ ...formData, footerText: e.target.value })}
                            />
                        </div>

                        {/* Cover Page Toggle */}
                        <div
                            className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${formData.coverPageEnabled
                                ? 'bg-purple-500/10 border-purple-500/30'
                                : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                                }`}
                            onClick={() => setFormData({ ...formData, coverPageEnabled: !formData.coverPageEnabled })}
                        >
                            <div className="flex items-center gap-3">
                                <FileText size={18} className={formData.coverPageEnabled ? "text-purple-400" : "text-slate-500"} />
                                <span className={`text-xs font-bold ${formData.coverPageEnabled ? "text-purple-300" : "text-slate-400"}`}>
                                    Generate Cover Page
                                </span>
                            </div>
                            <div className={`w-10 h-5 rounded-full relative transition-colors ${formData.coverPageEnabled ? 'bg-purple-500' : 'bg-slate-700'}`}>
                                <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${formData.coverPageEnabled ? 'left-6 shadow-sm' : 'left-1'}`} />
                            </div>
                        </div>

                    </div>

                    {/* Right Column: Preview */}
                    <div className="bg-slate-950 border border-slate-800 rounded-xl p-8 flex flex-col items-center justify-center min-h-[400px] relative overflow-hidden">

                        {/* Watermark Preview */}
                        <div className="absolute inset-0 pointer-events-none opacity-[0.05] flex items-center justify-center rotate-45 select-none text-6xl font-black text-slate-200 whitespace-nowrap overflow-hidden">
                            {formData.watermarkText || 'TENANT NAME'}
                        </div>

                        <div className="w-full max-w-[300px] aspect-[1/1.41] bg-white text-black text-[8px] p-8 shadow-2xl relative flex flex-col">
                            {/* Header */}
                            <div className="absolute top-4 right-4 text-gray-400 text-[6px] text-right">
                                {formData.headerText || 'CONFIDENTIAL'}
                            </div>

                            {/* Body Content Placeholder */}
                            <div className="mt-8 space-y-2 opacity-30">
                                <div className="h-2 bg-black w-3/4 mb-4"></div>
                                <div className="h-1 bg-black w-full"></div>
                                <div className="h-1 bg-black w-full"></div>
                                <div className="h-1 bg-black w-9/10"></div>
                                <div className="h-1 bg-black w-full"></div>
                                <div className="h-1 bg-black w-4/5"></div>
                            </div>

                            <div className="flex-1 flex items-center justify-center">
                                <span className="font-serif text-lg opacity-20 rotate-45 font-bold uppercase text-center leading-tight">
                                    {formData.watermarkText || 'TENANT NAME'}
                                </span>
                            </div>

                            <div className="mb-8 space-y-2 opacity-30">
                                <div className="h-1 bg-black w-full"></div>
                                <div className="h-1 bg-black w-full"></div>
                                <div className="h-1 bg-black w-3/4"></div>
                            </div>

                            {/* Footer */}
                            <div className="absolute bottom-4 left-0 w-full text-center text-gray-400 text-[6px] border-t border-gray-100 pt-2">
                                {formData.footerText || 'Page 1 of 1'}
                            </div>
                        </div>

                        <p className="mt-6 text-[10px] text-slate-500 font-mono">Live Preview (Approximation)</p>
                    </div>
                </div>

                <div className="pt-6 border-t border-slate-800 flex justify-end items-center gap-4">
                    {error && (
                        <div className="text-red-400 text-xs font-bold flex items-center gap-2 animate-pulse">
                            <AlertTriangle size={14} /> {error}
                        </div>
                    )}

                    {saveSuccess && (
                        <div className="text-emerald-400 text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-right-2">
                            <CheckCircle2 size={14} /> Profile Saved
                        </div>
                    )}

                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-emerald-900/20 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                        {isSaving ? 'Saving...' : 'Save Configuration'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BrandingSettings;
