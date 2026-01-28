import React, { Suspense } from 'react';
import { AppMode, UserRole, SessionData } from '../types';
import Layout from './Layout';
import AuthFlow from './AuthFlow';
import PlatformGateway from './PlatformGateway';
import { ThemeMode } from '../hooks/useTheme';

const TenantOnboarding = React.lazy(() => import('./TenantOnboarding'));
const TenantUserOnboarding = React.lazy(() => import('./TenantUserOnboarding'));

interface AppRouterProps {
    isAuthenticated: boolean;
    isOnboarding: boolean;
    isUserInvitation: boolean;
    isPlatformMode: boolean;
    mode: AppMode;
    userId: string | null;
    tenantId: string | null;
    activeTab: string;
    setActiveTab: (tab: string) => void;
    setMode: (mode: AppMode) => void;
    contextRole: string;
    theme: ThemeMode;
    setTheme: (theme: ThemeMode) => void;
    killSwitchActive: boolean;
    setKillSwitchActive: (active: boolean) => void;
    handleAuthenticated: (session: SessionData) => Promise<any> | void;
    handleInceptionComplete: (mode: AppMode) => void;
    setIsPlatformMode: (active: boolean) => void;
    setIsOnboarding: (active: boolean) => void;
    setIsUserInvitation: (active: boolean) => void;
    initialToken?: string;
    children: React.ReactNode;
}

const AppRouter: React.FC<AppRouterProps> = ({
    isAuthenticated,
    isOnboarding,
    isUserInvitation,
    isPlatformMode,
    mode,
    userId,
    tenantId,
    activeTab,
    setActiveTab,
    setMode,
    contextRole,
    theme,
    setTheme,
    killSwitchActive,
    setKillSwitchActive,
    handleAuthenticated,
    handleInceptionComplete,
    setIsPlatformMode,
    setIsOnboarding,
    setIsUserInvitation,
    initialToken,
    children
}) => {
    if (isOnboarding) {
        return (
            <Suspense fallback={<div className="min-h-screen bg-slate-950" />}>
                <TenantOnboarding onComplete={handleInceptionComplete} />
            </Suspense>
        );
    }

    if (isUserInvitation) {
        return (
            <Suspense fallback={<div className="min-h-screen bg-slate-950" />}>
                <TenantUserOnboarding
                    mode={mode}
                    userId={userId || ''}
                    tenantId={tenantId || ''}
                    initialToken={initialToken}
                    onBack={() => setIsUserInvitation(false)}
                    onComplete={() => {
                        // TenantUserOnboarding already saved the session to localStorage
                        // Read it back to get the correct user data
                        const sessionStr = localStorage.getItem('lexSovereign_session');
                        if (sessionStr) {
                            const session = JSON.parse(sessionStr);
                            handleAuthenticated({
                                role: session.role,
                                userId: session.userId,
                                tenantId: session.tenantId,
                                permissions: session.permissions || [],
                                token: session.token
                            });
                        }
                    }}
                />
            </Suspense>
        );
    }

    if (!isAuthenticated) {
        if (isPlatformMode) {
            return (
                <PlatformGateway
                    onAuthenticated={(role: string) => handleAuthenticated({
                        role,
                        userId: 'PLATFORM_OWNER',
                        tenantId: 'GLOBAL',
                        permissions: []
                    })}
                    onBackToTenant={() => setIsPlatformMode(false)}
                />
            );
        }
        return (
            <AuthFlow
                onAuthenticated={(role: string, perms: string[], uId?: string, tId?: string, token?: string) => handleAuthenticated({
                    role,
                    permissions: perms,
                    userId: uId || 'legacy-uid',
                    tenantId: tId || 'legacy-tid',
                    token
                })}
                onStartOnboarding={() => setIsOnboarding(true)}
                onStartInvitation={() => setIsUserInvitation(true)}
                onSecretTrigger={() => setIsPlatformMode(true)}
            />
        );
    }

    return (
        <Layout
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            mode={mode}
            setMode={setMode}
            killSwitchActive={killSwitchActive}
            userRole={contextRole as UserRole}
            theme={theme}
            setTheme={setTheme}
        >
            {children}
        </Layout>
    );
};

export default AppRouter;
