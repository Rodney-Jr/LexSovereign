
import React, { useState } from 'react';
import { X, Calendar, Clipboard, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { authorizedFetch, getSavedSession } from '../utils/api';

interface LeaveApplicationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

const LeaveApplicationModal: React.FC<LeaveApplicationModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        type: 'Vacation',
        startDate: '',
        endDate: '',
        reason: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        const session = getSavedSession();
        if (!session?.token) {
            setError("Session expired. Please login again.");
            setIsSubmitting(false);
            return;
        }

        try {
            await authorizedFetch('/api/firm/leaves', {
                method: 'POST',
                body: JSON.stringify({
                    ...formData,
                    userId: session.userId, // Backend might get this from token but good to be explicit
                    status: 'Pending'
                }),
                token: session.token
            });

            setSuccess(true);
            setTimeout(() => {
                onClose();
                if (onSuccess) onSuccess();
                // Reset state
                setSuccess(false);
                setFormData({ type: 'Vacation', startDate: '', endDate: '', reason: '' });
            }, 2000);
        } catch (err: any) {
            setError(err.message || "Failed to submit leave request.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-brand-sidebar border border-brand-border w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500">
                <div className="p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div className="space-y-1">
                            <h3 className="text-2xl font-bold text-brand-text tracking-tight">Request Leave</h3>
                            <p className="text-xs text-brand-muted uppercase tracking-widest font-bold">Self-Service Portal</p>
                        </div>
                        <button
                            onClick={onClose}
                            title="Close Modal"
                            className="p-2 hover:bg-white/5 rounded-xl text-brand-muted transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {success ? (
                        <div className="py-12 flex flex-col items-center justify-center text-center space-y-4 animate-in fade-in zoom-in duration-500">
                            <div className="w-16 h-16 bg-brand-primary/20 rounded-full flex items-center justify-center text-brand-primary">
                                <CheckCircle2 size={32} />
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-brand-text">Request Submitted</h4>
                                <p className="text-sm text-brand-muted mt-2">Your leave application is now pending approval from the Admin Manager.</p>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3 text-red-400 animate-in slide-in-from-top-2">
                                    <AlertCircle size={18} className="shrink-0 mt-0.5" />
                                    <p className="text-xs font-medium">{error}</p>
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-brand-muted uppercase tracking-widest ml-1">Leave Type</label>
                                <select
                                    required
                                    title="Leave Type"
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    className="w-full bg-brand-bg border border-brand-border rounded-2xl px-5 py-3 text-sm text-brand-text focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all outline-none appearance-none cursor-pointer"
                                >
                                    <option value="Vacation">Vacation</option>
                                    <option value="Sick">Sick Leave</option>
                                    <option value="CLE">CLE (Continuing Legal Education)</option>
                                    <option value="Maternity">Maternity Leave</option>
                                    <option value="Paternity">Paternity Leave</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-brand-muted uppercase tracking-widest ml-1">Start Date</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted" size={16} />
                                        <input
                                            required
                                            type="date"
                                            title="Start Date"
                                            value={formData.startDate}
                                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                            className="w-full bg-brand-bg border border-brand-border rounded-2xl pl-12 pr-5 py-3 text-sm text-brand-text focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all shadow-inner outline-none"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-brand-muted uppercase tracking-widest ml-1">End Date</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted" size={16} />
                                        <input
                                            required
                                            type="date"
                                            title="End Date"
                                            value={formData.endDate}
                                            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                            className="w-full bg-brand-bg border border-brand-border rounded-2xl pl-12 pr-5 py-3 text-sm text-brand-text focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all shadow-inner outline-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-brand-muted uppercase tracking-widest ml-1">Reason / Notes</label>
                                <div className="relative">
                                    <Clipboard className="absolute left-4 top-4 text-brand-muted" size={16} />
                                    <textarea
                                        required
                                        rows={3}
                                        title="Reason for leave"
                                        placeholder="Briefly explain the reason for your leave..."
                                        value={formData.reason}
                                        onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                        className="w-full bg-brand-bg border border-brand-border rounded-2xl pl-12 pr-5 py-4 text-sm text-brand-text focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all shadow-inner outline-none resize-none"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-4 bg-brand-primary text-brand-bg font-bold rounded-2xl shadow-lg shadow-brand-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-3 mt-4"
                            >
                                {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : null}
                                {isSubmitting ? 'Incepting Request...' : 'Submit Application'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LeaveApplicationModal;
