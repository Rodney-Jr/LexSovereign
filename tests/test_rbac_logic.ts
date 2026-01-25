
import { TAB_REQUIRED_PERMISSIONS, ROLE_DEFAULT_PERMISSIONS } from '../constants';
import { UserRole } from '../types';

console.log("Running RBAC Logic Verification (Permission-Based)...");

function canAccess(role: UserRole, tab: string): boolean {
    // Global Admin Bypass Logic Simulation (mirrors App.tsx)
    if (role === UserRole.GLOBAL_ADMIN) return true;

    const required = TAB_REQUIRED_PERMISSIONS[tab];
    if (!required || required.length === 0) return true;

    const userPerms = ROLE_DEFAULT_PERMISSIONS[role] || [];

    // Check if user has ANY of the required permissions
    return required.some(req => userPerms.includes(req));
}

const assertions = [
    {
        name: "Tenant Admin cannot access Global Plane",
        check: () => !canAccess(UserRole.TENANT_ADMIN, 'platform-ops'),
        expected: true
    },
    {
        name: "Tenant Admin cannot access Backlog",
        check: () => !canAccess(UserRole.TENANT_ADMIN, 'backlog'),
        expected: true
    },
    {
        name: "Tenant Admin cannot access Roadmap/Status",
        check: () => !canAccess(UserRole.TENANT_ADMIN, 'status'),
        expected: true
    },
    {
        name: "Global Admin CAN access Global Plane",
        check: () => canAccess(UserRole.GLOBAL_ADMIN, 'platform-ops'),
        expected: true
    },
    {
        name: "Client cannot access Access Governance",
        check: () => !canAccess(UserRole.CLIENT, 'identity'), // identity requires manage_users
        expected: true
    },
    {
        name: "Client CAN access Client Portal",
        check: () => canAccess(UserRole.CLIENT, 'client'),
        expected: true
    },
    {
        name: "Tenant Admin cannot access Enclave (Physical)",
        check: () => !canAccess(UserRole.TENANT_ADMIN, 'enclave'),
        expected: true
    },
    {
        name: "Tenant Admin CAN access Tenant Settings",
        check: () => canAccess(UserRole.TENANT_ADMIN, 'tenant-settings'),
        expected: true
    },
    {
        name: "Tenant Admin cannot access System Infrastructure Settings",
        check: () => !canAccess(UserRole.TENANT_ADMIN, 'system-settings'),
        expected: true
    },
    {
        name: "Global Admin CAN access System Settings",
        check: () => canAccess(UserRole.GLOBAL_ADMIN, 'system-settings'),
        expected: true
    }
];

let passed = 0;
let failed = 0;

assertions.forEach(test => {
    try {
        const result = test.check();
        if (result === test.expected) {
            console.log(`[PASS] ${test.name}`);
            passed++;
        } else {
            console.error(`[FAIL] ${test.name}`);
            failed++;
        }
    } catch (e) {
        console.error(`[ERROR] ${test.name}: ${e}`);
        failed++;
    }
});

console.log(`\nResults: ${passed} Passed, ${failed} Failed`);

if (failed > 0) process.exit(1);
else console.log("✅ All RBAC Configuration Logic Verified.");
