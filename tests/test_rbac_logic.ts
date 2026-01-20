
import { TAB_PERMISSIONS } from '../constants';
import { UserRole } from '../types';

console.log("Running RBAC Logic Verification...");

const assertions = [
    {
        name: "Tenant Admin cannot access Global Plane",
        check: () => !TAB_PERMISSIONS['platform-ops'].includes(UserRole.TENANT_ADMIN),
        expected: true
    },
    {
        name: "Tenant Admin cannot access Backlog",
        check: () => !TAB_PERMISSIONS['backlog'].includes(UserRole.TENANT_ADMIN),
        expected: true
    },
    {
        name: "Tenant Admin cannot access Roadmap/Status",
        check: () => !TAB_PERMISSIONS['status'].includes(UserRole.TENANT_ADMIN),
        expected: true
    },
    {
        name: "Global Admin CAN access Global Plane",
        check: () => TAB_PERMISSIONS['platform-ops'].includes(UserRole.GLOBAL_ADMIN),
        expected: true
    },
    {
        name: "Client cannot access Access Governance",
        check: () => !TAB_PERMISSIONS['identity'].includes(UserRole.CLIENT),
        expected: true
    },
    {
        name: "Client CAN access Client Portal",
        check: () => TAB_PERMISSIONS['client'].includes(UserRole.CLIENT),
        expected: true
    },
    {
        name: "Tenant Admin cannot access Enclave (Physical)",
        check: () => !TAB_PERMISSIONS['enclave'].includes(UserRole.TENANT_ADMIN),
        expected: true
    },
    {
        name: "Tenant Admin CAN access Tenant Settings",
        check: () => TAB_PERMISSIONS['tenant-settings'].includes(UserRole.TENANT_ADMIN),
        expected: true
    },
    {
        name: "Tenant Admin cannot access System Infrastructure Settings",
        check: () => !TAB_PERMISSIONS['system-settings'].includes(UserRole.TENANT_ADMIN),
        expected: true
    },
    {
        name: "Global Admin CAN access System Settings",
        check: () => TAB_PERMISSIONS['system-settings'].includes(UserRole.GLOBAL_ADMIN),
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
