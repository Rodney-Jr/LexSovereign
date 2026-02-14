import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Shield, Lock, ChevronRight } from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs));
}

interface LayoutProps {
    children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location]);

    return (
        <div className="min-h-screen bg-slate-950 text-slate-50 font-inter selection:bg-indigo-500/30">
            {/* Navigation */}
            <header
                className={cn(
                    "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
                    isScrolled ? "bg-slate-950/90 backdrop-blur-md border-b border-slate-800 py-3" : "bg-transparent py-5"
                )}
            >
                <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20 group-hover:border-indigo-500/50 transition-colors">
                            <Shield className="w-6 h-6 text-indigo-400" />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-white">Lex<span className="text-indigo-400">Sovereign</span></span>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-8">
                        <NavLink to="/for-law-firms">For Law Firms</NavLink>
                        <NavLink to="/for-enterprise-legal">For Enterprise</NavLink>
                        <NavLink to="/for-government">For Government</NavLink>
                        <NavLink to="/pricing">Pricing</NavLink>
                        <div className="h-4 w-px bg-slate-800" />
                        <Link to="/security-and-compliance" className="text-sm font-medium text-slate-400 hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                            <Lock className="w-3 h-3" /> Security
                        </Link>
                    </nav>

                    {/* Desktop CTA */}
                    <div className="hidden md:flex items-center gap-4">
                        <Link
                            to="/client-intake-assistant"
                            className="text-sm font-semibold text-slate-300 hover:text-white transition-colors"
                        >
                            Add Intake Assistant
                        </Link>
                        <Link
                            to="/#demo"
                            className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-full text-sm font-semibold transition-all shadow-lg shadow-indigo-900/20 hover:shadow-indigo-900/40"
                        >
                            Request Demo
                        </Link>
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button
                        className="md:hidden p-2 text-slate-400 hover:text-white"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden absolute top-full left-0 right-0 bg-slate-950 border-b border-slate-800 p-6 flex flex-col gap-4 shadow-2xl">
                        <MobileNavLink to="/for-law-firms">For Law Firms</MobileNavLink>
                        <MobileNavLink to="/for-enterprise-legal">For Enterprise</MobileNavLink>
                        <MobileNavLink to="/for-government">For Government</MobileNavLink>
                        <MobileNavLink to="/pricing">Pricing</MobileNavLink>
                        <MobileNavLink to="/security-and-compliance">Security & Compliance</MobileNavLink>
                        <hr className="border-slate-800 my-2" />
                        <Link
                            to="/#demo"
                            className="bg-indigo-600 text-white px-6 py-3 rounded-xl text-center font-semibold"
                        >
                            Request a Demonstration
                        </Link>
                    </div>
                )}
            </header>

            {/* Main Content */}
            <main className="pt-20">
                {children}
            </main>

            {/* Footer */}
            <footer className="bg-slate-950 border-t border-slate-900 pt-16 pb-8">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                        <div className="col-span-1 md:col-span-1">
                            <Link to="/" className="flex items-center gap-2 mb-6">
                                <Shield className="w-6 h-6 text-indigo-500" />
                                <span className="text-lg font-bold text-white">LexSovereign</span>
                            </Link>
                            <p className="text-slate-400 text-sm leading-relaxed mb-6">
                                Secure legal matter and governance platform designed for professional responsibility,
                                confidentiality, and institutional oversight.
                            </p>
                            <div className="flex gap-4">
                                {/* Social placeholders */}
                            </div>
                        </div>

                        <div>
                            <h4 className="font-semibold text-white mb-4">Solutions</h4>
                            <ul className="space-y-3 text-sm text-slate-400">
                                <li><Link to="/for-law-firms" className="hover:text-indigo-400 transition-colors">Law Firms</Link></li>
                                <li><Link to="/for-enterprise-legal" className="hover:text-indigo-400 transition-colors">Enterprise Legal</Link></li>
                                <li><Link to="/for-government" className="hover:text-indigo-400 transition-colors">Government</Link></li>
                                <li><Link to="/pricing" className="hover:text-indigo-400 transition-colors">Pricing</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-semibold text-white mb-4">Platform</h4>
                            <ul className="space-y-3 text-sm text-slate-400">
                                <li><Link to="/security-and-compliance" className="hover:text-indigo-400 transition-colors">Security & Compliance</Link></li>
                                <li><Link to="/security-and-compliance#audit" className="hover:text-indigo-400 transition-colors">Audit Trails</Link></li>
                                <li><Link to="/security-and-compliance#roles" className="hover:text-indigo-400 transition-colors">Role Governance</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-semibold text-white mb-4">Contact</h4>
                            <ul className="space-y-3 text-sm text-slate-400">
                                <li><a href="mailto:access@lexsovereign.com" className="hover:text-indigo-400 transition-colors">access@lexsovereign.com</a></li>
                                <li><Link to="/#demo" className="hover:text-indigo-400 transition-colors">Schedule Demo</Link></li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-slate-900 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500">
                        <div className="text-center md:text-left">
                            <p>© 2026 LexSovereign. All rights reserved.</p>
                            <p className="mt-1 text-slate-600 italic">The LexSovereign platform is owned and operated by Nexus Technologies Limited.</p>
                        </div>
                        <div className="flex gap-6 mt-4 md:mt-0">
                            <Link to="/privacy" className="hover:text-slate-300">Privacy Policy</Link>
                            <Link to="/terms" className="hover:text-slate-300">Terms of Service</Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}

function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
    const location = useLocation();
    const isActive = location.pathname === to;

    return (
        <Link
            to={to}
            className={cn(
                "text-sm font-medium transition-colors hover:text-indigo-400",
                isActive ? "text-indigo-400" : "text-slate-300"
            )}
        >
            {children}
        </Link>
    );
}

function MobileNavLink({ to, children }: { to: string; children: React.ReactNode }) {
    const location = useLocation();
    const isActive = location.pathname === to;

    return (
        <Link
            to={to}
            className={cn(
                "text-lg font-medium py-2 border-l-2 pl-4 transition-all",
                isActive ? "border-indigo-500 text-indigo-400 bg-indigo-500/5" : "border-transparent text-slate-400 hover:text-white"
            )}
        >
            {children}
        </Link>
    );
}
