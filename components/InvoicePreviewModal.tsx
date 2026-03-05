
import React, { useRef } from 'react';
import {
    X,
    Printer,
    Download,
    Mail,
    ShieldCheck,
    FileText,
    Globe,
    Scale
} from 'lucide-react';

interface InvoiceLineItem {
    id: string;
    description: string;
    amount: number;
}

interface InvoiceDetails {
    id: string;
    totalAmount: number;
    status: string;
    createdAt: string;
    dueDate: string | null;
    issuedAt: string | null;
    matter: {
        id: string;
        name: string;
        client: string;
        description: string;
    };
    lineItems: InvoiceLineItem[];
}

interface InvoicePreviewModalProps {
    invoice: InvoiceDetails;
    onClose: () => void;
}

const InvoicePreviewModal: React.FC<InvoicePreviewModalProps> = ({ invoice, onClose }) => {
    const printRef = useRef<HTMLDivElement>(null);

    const handlePrint = () => {
        if (printRef.current) {
            window.print();
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-300">
            <div className="bg-slate-900 border border-slate-800 w-full max-w-5xl h-[90vh] rounded-[3rem] shadow-[0_0_100px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden animate-in zoom-in-95 duration-500">

                {/* Modal Header */}
                <div className="p-8 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20">
                            <Receipt className="text-blue-400" size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white tracking-tight">Invoice Preview</h3>
                            <p className="text-[10px] text-slate-500 font-mono uppercase tracking-[0.2em]">Artifact Reference: {invoice.id.slice(0, 12).toUpperCase()}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={handlePrint}
                            className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl transition-all"
                            title="Print Document"
                        >
                            <Printer size={20} />
                        </button>
                        <button
                            className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl transition-all"
                            title="Download PDF"
                        >
                            <Download size={20} />
                        </button>
                        <div className="w-[1px] h-8 bg-slate-800 mx-2"></div>
                        <button
                            onClick={onClose}
                            className="p-3 hover:bg-slate-800 rounded-2xl text-slate-500 hover:text-white transition-all"
                            title="Close Preview"
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Document Content (A4 Style) */}
                <div className="flex-1 overflow-y-auto bg-slate-950 p-12 flex justify-center scrollbar-hide">
                    <div
                        ref={printRef}
                        className="bg-white text-slate-900 w-[210mm] min-h-[297mm] p-[20mm] shadow-2xl rounded-sm print:shadow-none print:p-0 font-sans"
                    >
                        {/* Header / Branding */}
                        <div className="flex justify-between items-start mb-16">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 text-slate-950">
                                    <Globe size={32} className="text-blue-600" />
                                    <span className="text-2xl font-black italic tracking-tighter">LEX SOVEREIGN</span>
                                </div>
                                <div className="text-[10px] text-slate-500 font-medium leading-relaxed max-w-[200px]">
                                    Institutional Legal Operations<br />
                                    Secure Enclave Access Protocol<br />
                                    Global Jurisdictional Network
                                </div>
                            </div>
                            <div className="text-right space-y-1">
                                <h1 className="text-4xl font-black text-slate-950 tracking-tighter italic uppercase">INVOICE</h1>
                                <p className="text-xs font-bold text-slate-400 font-mono">#{invoice.id.slice(0, 8).toUpperCase()}</p>
                            </div>
                        </div>

                        {/* Billing Info */}
                        <div className="grid grid-cols-2 gap-12 mb-16 pb-12 border-b border-slate-100">
                            <div className="space-y-4">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Bill To:</p>
                                <div className="space-y-1">
                                    <p className="text-lg font-bold text-slate-900">{invoice.matter.client}</p>
                                    <p className="text-xs text-slate-500 leading-relaxed">
                                        Matter: {invoice.matter.name}<br />
                                        Ref: {invoice.matter.id.slice(0, 8).toUpperCase()}
                                    </p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Date Issued:</p>
                                    <p className="text-xs font-bold text-slate-900">{invoice.issuedAt ? new Date(invoice.issuedAt).toLocaleDateString() : 'DRAFT'}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Due Date:</p>
                                    <p className="text-xs font-bold text-slate-900">{invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'Net 14'}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Status:</p>
                                    <p className="text-xs font-bold text-blue-600">{invoice.status}</p>
                                </div>
                            </div>
                        </div>

                        {/* Line Items */}
                        <div className="mb-20">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b-2 border-slate-900 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                        <th className="py-4">Description</th>
                                        <th className="py-4 text-right">Amount (USD)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {invoice.lineItems.map((item, idx) => (
                                        <tr key={item.id || idx}>
                                            <td className="py-6 pr-8">
                                                <p className="text-sm font-bold text-slate-900 mb-1">{item.description}</p>
                                                <p className="text-[10px] text-slate-500 italic">Consultation and Sovereign Legal Processing Services rendered.</p>
                                            </td>
                                            <td className="py-6 text-right font-bold text-slate-900">
                                                ${item.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Totals */}
                        <div className="flex justify-end mb-24">
                            <div className="w-[300px] space-y-4">
                                <div className="flex justify-between text-xs py-2 border-b border-slate-100">
                                    <span className="text-slate-500 font-medium">Subtotal</span>
                                    <span className="text-slate-900 font-bold">${invoice.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                </div>
                                <div className="flex justify-between text-xs py-2 border-b border-slate-100">
                                    <span className="text-slate-500 font-medium">Tax (0.0%)</span>
                                    <span className="text-slate-900 font-bold">$0.00</span>
                                </div>
                                <div className="flex justify-between items-center pt-4">
                                    <span className="text-sm font-black uppercase tracking-widest text-slate-400">Total Amount</span>
                                    <span className="text-3xl font-black text-slate-950 italic tracking-tighter tabular-nums">
                                        ${invoice.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Footer / Notes */}
                        <div className="mt-auto space-y-8">
                            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-4">
                                <ShieldCheck className="text-blue-600 shrink-0" size={20} />
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Sovereign Proof of Legitimacy</p>
                                    <p className="text-[9px] text-slate-500 leading-snug">
                                        This invoice is cryptographically signed and stored on the LexSovereign Ledger. Any tampering with this document will invalidate the Sovereign checksum linked to the matter's root certificate.
                                    </p>
                                </div>
                            </div>
                            <div className="flex justify-between items-end">
                                <div className="text-[9px] text-slate-400 font-medium uppercase tracking-widest">
                                    &copy; 2026 LexSovereign Enclave &bull; Generated via Institutional Node Alpha-1
                                </div>
                                <div className="flex items-center gap-2 text-[9px] font-bold text-slate-900">
                                    <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                                    CERTIFIED FIRM IDENTITY
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Action Bar */}
                <div className="p-8 bg-slate-900 border-t border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-4 text-xs font-bold text-slate-500">
                        <Scale size={16} className="text-slate-600" />
                        SECURE AUDIT TRACE LOGGED
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={onClose}
                            className="px-8 py-3.5 text-slate-400 font-bold text-sm hover:text-white transition-all hover:bg-slate-800 rounded-2xl"
                            title="Close modal"
                        >
                            Close
                        </button>
                        <button className="bg-blue-600 hover:bg-blue-500 text-white px-10 py-3.5 rounded-2xl font-bold text-sm shadow-2xl shadow-blue-900/40 transition-all flex items-center gap-3 active:scale-95 group">
                            <Mail size={18} className="group-hover:-translate-y-0.5 transition-transform" />
                            Finalize & Send to Client
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Re-importing missing component from Lucide
const Receipt = ({ size, className }: { size?: number, className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size || 24}
        height={size || 24}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1Z" />
        <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
        <path d="M12 17.5V18.5" />
        <path d="M12 5.5v1" />
    </svg>
);

export default InvoicePreviewModal;
