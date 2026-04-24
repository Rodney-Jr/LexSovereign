
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSovereign } from '../contexts/SovereignContext';
import { usePermissions } from '../hooks/usePermissions';

import { UserRole } from '../types';

interface ProtectedRouteProps {
    children: React.ReactNode;
    permission?: string;
    tab?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, permission, tab }) => {
    const { session, isLoading, can } = useSovereign();
    const { canAccessTab } = usePermissions();
    const location = useLocation();

    if (isLoading) {
        return (
            <div className="min-h-screen bg-brand-bg flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-brand-primary border-r-2 border-transparent" />
            </div>
        );
    }

    if (!session) {
        // Redirect to root which handles AuthFlow if not authenticated
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    // Gating Logic: Centralized Tab Check OR Manual Permission Check
    const fallbackPath = session.role === UserRole.CLIENT ? '/client-portal' : '/dashboard';

    if (tab && !canAccessTab(tab)) {
        return <Navigate to={fallbackPath} replace />;
    }

    if (permission && !can(permission)) {
        return <Navigate to={fallbackPath} replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
