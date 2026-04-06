import { apiFetch } from '../utils/api';

export default function EarlyAccessForm() {
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        organization: '',
        role: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');
        
        try {
            await apiFetch('/api/leads', {
                method: 'POST',
                body: JSON.stringify({
                    email: formData.email,
                    name: formData.name,
                    company: formData.organization,
                    source: 'EARLY_ACCESS_MODAL',
                    metadata: {
                        role: formData.role
                    }
                })
            });
            setStatus('success');
            setFormData({ name: '', email: '', organization: '', role: '' });
        } catch (err) {
            console.error('Lead submission failed:', err);
            setStatus('error');
        }
    };

    if (status === 'success') {
        return (
            <div className="bg-emerald-500/10 border border-emerald-500/20 p-8 rounded-2xl text-center">
                <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-6 h-6 text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Application Received</h3>
                <p className="text-slate-400">Our pilot program coordination team will contact you shortly to schedule your personalized institutional briefing.</p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Full Name</label>
                    <input
                        required
                        type="text"
                        placeholder="e.g. Ama Mensah"
                        className="w-full bg-slate-900/50 border border-slate-800 focus:border-indigo-500 outline-none p-3 rounded-xl text-white transition-colors"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Email Address</label>
                    <input
                        required
                        type="email"
                        placeholder="ama@firm.com"
                        className="w-full bg-slate-900/50 border border-slate-800 focus:border-indigo-500 outline-none p-3 rounded-xl text-white transition-colors"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Organization</label>
                    <input
                        required
                        type="text"
                        placeholder="e.g. Mensah & Co."
                        className="w-full bg-slate-900/50 border border-slate-800 focus:border-indigo-500 outline-none p-3 rounded-xl text-white transition-colors"
                        value={formData.organization}
                        onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Role</label>
                    <select
                        required
                        className="w-full bg-slate-900/50 border border-slate-800 focus:border-indigo-500 outline-none p-3 rounded-xl text-white transition-colors appearance-none"
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    >
                        <option value="" disabled>Select Role</option>
                        <option value="Partner">Managing Partner / Partner</option>
                        <option value="Associate">Senior Associate / Associate</option>
                        <option value="LegalOps">Legal Operations / IT</option>
                        <option value="GC">General Counsel</option>
                    </select>
                </div>
            </div>
            <Button
                type="submit"
                disabled={status === 'loading'}
                className="w-full py-4 mt-2"
            >
                {status === 'loading' ? 'Processing Application...' : 'Apply for Pilot Access'}
                <Send className="ml-2 w-4 h-4" />
            </Button>
            <p className="text-[10px] text-center text-slate-500 mt-4 leading-relaxed">
                By submitting this request, you agree to our <a href="/terms" className="underline">Terms of Service</a> and acknowledge your interest in Nexus Technologies Limited's digital infrastructure initiatives.
            </p>
        </form>
    );
}
