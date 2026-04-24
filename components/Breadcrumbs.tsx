
import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const ROUTE_LABELS: Record<string, string> = {
    'dashboard': 'Intelligence Hub',
    'registry': 'Sovereign Vault',
    'chat': 'Legal Chat',
    'conflict-check': 'Conflict Check',
    'dossier': 'Sovereign Profile',
    'settings': 'Tenant Settings',
    'audit': 'Forensic Traces',
    'status': 'Project Roadmap',
    'system-settings': 'Infrastructure Plane',
    'tenant-settings': 'Tenant Settings',
    'accounting': 'Sovereign Accounting',
    'matters': 'Sovereign Matters',
    'vault': 'Sovereign Vault',
    'drafting': 'Drafting Studio',
    'analysis': 'Case Analysis',
    'accounting-hub': 'Accounting Hub',
    'billing': 'Sovereign Billing',
    'client-portal': 'Client Portal'
};

import { useSovereign } from '../contexts/SovereignContext';
import { UserRole } from '../types';

const Breadcrumbs: React.FC = () => {
    const location = useLocation();
    const { session } = useSovereign();
    const pathnames = location.pathname.split('/').filter((x) => x);
    const homeTarget = session?.role === UserRole.CLIENT ? "/client-portal" : "/dashboard";

    return (
        <nav className="flex items-center space-x-2 text-[10px] lg:text-xs font-bold uppercase tracking-widest text-brand-muted">
            <Link 
                to={homeTarget} 
                className="hover:text-brand-primary transition-colors flex items-center gap-1.5 group"
            >
                <Home size={14} className="group-hover:scale-110 transition-transform" />
                <span className="hidden sm:inline">Nomos</span>
            </Link>
            
            {pathnames.length > 0 && <ChevronRight size={12} className="opacity-40" />}
            
            {pathnames.map((value, index) => {
                const last = index === pathnames.length - 1;
                const to = `/${pathnames.slice(0, index + 1).join('/')}`;
                
                // Special handling for Matter IDs (simple regex for MT-XXXX or similar)
                let label = ROUTE_LABELS[value] || value.replace(/-/g, ' ');
                if (value.startsWith('MT-') || (value.length > 20 && !value.includes('-'))) {
                    label = `Matter: ${value.split('-').pop()}`;
                }

                return (
                    <React.Fragment key={to}>
                        {last ? (
                            <span className="text-brand-text truncate max-w-[150px] lg:max-w-none">
                                {label}
                            </span>
                        ) : (
                            <>
                                <Link to={to} className="hover:text-brand-primary transition-colors truncate max-w-[100px] lg:max-w-none">
                                    {label}
                                </Link>
                                <ChevronRight size={12} className="opacity-40" />
                            </>
                        )}
                    </React.Fragment>
                );
            })}
        </nav>
    );
};

export default Breadcrumbs;
