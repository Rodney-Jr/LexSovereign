
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
    },
    {
        name: "LEGAL_OPS CAN access Practitioner Directory",
        check: () => canAccess(UserRole.LEGAL_OPS, 'tenant-admin'),
        expected: true
    },
    {
        name: "LEGAL_OPS CAN access Workflow Engine",
        check: () => canAccess(UserRole.LEGAL_OPS, 'workflow'),
        expected: true
    },
    {
        name: "LEGAL_OPS CAN access Legal Drafting",
        check: () => canAccess(UserRole.LEGAL_OPS, 'drafting'),
        expected: true
    },
    {
        name: "PARTNER CAN access Billing/Growth",
        check: () => canAccess(UserRole.PARTNER, 'growth'),
        expected: true
    },
    {
        name: "PARTNER CAN access Forensic Traces/Audit",
        check: () => canAccess(UserRole.PARTNER, 'audit'),
        expected: true
    },
    {
        name: "PARTNER CAN access Practitioner Directory",
        check: () => canAccess(UserRole.PARTNER, 'tenant-admin'),
        expected: true
    },
    {
        name: "DEPUTY_GC CAN access Billing/Growth",
        check: () => canAccess(UserRole.DEPUTY_GC, 'growth'),
        expected: true
    },
    {
        name: "DEPUTY_GC CAN access Forensic Traces/Audit",
        check: () => canAccess(UserRole.DEPUTY_GC, 'audit'),
        expected: true
    },
    {
        name: "DEPUTY_GC CAN access Practitioner Directory",
        check: () => canAccess(UserRole.DEPUTY_GC, 'tenant-admin'),
        expected: true
    },
    {
        name: "JUNIOR_ASSOCIATE CAN access Matter Creation (via conflict check or chat)",
        check: () => canAccess(UserRole.JUNIOR_ASSOCIATE, 'conflict-check') && canAccess(UserRole.JUNIOR_ASSOCIATE, 'chat'),
        expected: true
    },
    {
        name: "JUNIOR_ASSOCIATE cannot access Growth",
        check: () => !canAccess(UserRole.JUNIOR_ASSOCIATE, 'growth'),
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
