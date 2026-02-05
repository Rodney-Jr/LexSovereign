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
    userName?: string | null;
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
    isResettingPassword?: boolean;
    resetToken?: string;
    setIsResettingPassword?: (active: boolean) => void;
    children: React.ReactNode;
}

const AppRouter: React.FC<AppRouterProps> = ({
    isAuthenticated,
    isOnboarding,
    isUserInvitation,
    isPlatformMode,
    mode,
    userId,
    userName,
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
    isResettingPassword,
    resetToken,
    setIsResettingPassword,
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
                        console.log('[AppRouter] onComplete called');
                        // TenantUserOnboarding already saved the session to localStorage
                        // Read it back to get the correct user data
                        const sessionStr = localStorage.getItem('lexSovereign_session');
                        console.log('[AppRouter] Session from localStorage:', sessionStr);

                        if (sessionStr) {
                            const session = JSON.parse(sessionStr);
                            console.log('[AppRouter] Parsed session:', session);
                            console.log('[AppRouter] Calling handleAuthenticated...');
                            handleAuthenticated({
                                role: session.role,
                                userId: session.userId,
                                userName: session.userName,
                                tenantId: session.tenantId,
                                permissions: session.permissions || [],
                                token: session.token
                            });
                            console.log('[AppRouter] handleAuthenticated called');
                            console.log('[AppRouter] Setting isUserInvitation to false to trigger navigation');
                            setIsUserInvitation(false);
                        } else {
                            console.error('[AppRouter] No session found in localStorage!');
                        }
                    }}
                />
            </Suspense>
        );
    }

    if (isResettingPassword && resetToken) {
        const ResetPassword = React.lazy(() => import('./ResetPassword'));
        return (
            <Suspense fallback={<div className="min-h-screen bg-slate-950" />}>
                <ResetPassword
                    token={resetToken}
                    onComplete={() => {
                        if (setIsResettingPassword) setIsResettingPassword(false);
                        // Redirect to login (AuthFlow will be shown as isAuthenticated is false)
                        window.history.replaceState({}, document.title, "/");
                    }}
                    onBack={() => {
                        if (setIsResettingPassword) setIsResettingPassword(false);
                        window.history.replaceState({}, document.title, "/");
                    }}
                />
            </Suspense>
        );
    }

    if (!isAuthenticated) {
        if (isPlatformMode) {
            return (
                <PlatformGateway
                    onAuthenticated={(role: UserRole, permissions: string[], uName?: string) => handleAuthenticated({
                        role,
                        userId: 'PLATFORM_OWNER',
                        userName: uName || 'Platform Owner',
                        tenantId: 'GLOBAL',
                        permissions: permissions || []
                    })}
                    onBackToTenant={() => setIsPlatformMode(false)}
                />
            );
        }
        return (
            <AuthFlow
                onAuthenticated={(role: string, perms: string[], uId?: string, tId?: string, token?: string, uName?: string) => handleAuthenticated({
                    role,
                    permissions: perms,
                    userId: uId || 'legacy-uid',
                    userName: uName,
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
            userName={userName}
            theme={theme}
            setTheme={setTheme}
        >
            {children}
        </Layout>
    );
};

export default AppRouter;
