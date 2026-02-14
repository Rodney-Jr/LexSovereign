import React, { useState } from 'react';
import { Button } from './ui';
import { Check, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function DemoRequestForm() {
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('submitting');
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        setStatus('success');
    };

    if (status === 'success') {
        return (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-8 text-center animate-fade-in">
                <div className="bg-emerald-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Check className="w-8 h-8 text-emerald-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Request Received</h3>
                <p className="text-slate-300 mb-6">
                    Thank you for your interest in LexSovereign. A member of our institutional team will contact you securely within 24 hours to schedule your private demonstration.
                </p>
                <p className="text-sm text-slate-500">
                    Your information is processed in accordance with our strict confidentiality protocols.
                </p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
            <h3 className="text-2xl font-bold text-white mb-2">Request a Private Demo</h3>
            <p className="text-slate-400 mb-8 text-sm">
                See how LexSovereign enforces governance and meaningful confidentiality.
            </p>

            <div className="space-y-5">
                <div className="grid grid-cols-2 gap-5">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">First Name</label>
                        <input
                            required
                            type="text"
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                            placeholder="Jane"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">Last Name</label>
                        <input
                            required
                            type="text"
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                            placeholder="Doe"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Work Email</label>
                    <input
                        required
                        type="email"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                        placeholder="j.doe@firm.law"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Organization</label>
                    <input
                        required
                        type="text"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                        placeholder="Legal Organization Name"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Organization Type</label>
                    <select
                        aria-label="Organization Type"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                    >
                        <option>Law Firm</option>
                        <option>Enterprise Legal Dept</option>
                        <option>Government / Public Sector</option>
                        <option>Other</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Message (Optional)</label>
                    <textarea
                        rows={3}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                        placeholder="Any specific governance requirements..."
                    ></textarea>
                </div>

                <Button
                    type="submit"
                    className="w-full mt-4"
                    size="lg"
                    disabled={status === 'submitting'}
                >
                    {status === 'submitting' ? (
                        <span className="flex items-center gap-2">
                            <Loader2 className="animate-spin w-5 h-5" /> Processing...
                        </span>
                    ) : (
                        "Schedule Demonstration"
                    )}
                </Button>

                <p className="text-xs text-slate-500 text-center mt-4">
                    By submitting this form using our secure connection, you agree to our <Link to="/privacy" className="underline hover:text-slate-400">Privacy Policy</Link>.
                </p>
            </div>
        </form>
    );
}
