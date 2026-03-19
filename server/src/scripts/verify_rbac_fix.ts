import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import { JWT_SECRET } from '../jwtConfig';

const prisma = new PrismaClient();
const API_BASE = 'http://localhost:3001/api';

async function testRoute(token: string, endpoint: string) {
    try {
        const res = await axios.get(`${API_BASE}${endpoint}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return { status: res.status, data: res.data };
    } catch (err: any) {
        return { status: err.response?.status || 500, error: err.response?.data?.error || err.message };
    }
}

async function main() {
    console.log('=== VERIFYING RBAC PERMISSION FIX ===');

    // 1. Setup Test Users
    const tenantId = 'demo-tenant-lawfirm';
    
    // Global Admin
    const globalAdmin = await prisma.user.findFirst({ where: { role: { name: 'GLOBAL_ADMIN' } } });
    const globalAdminToken = jwt.sign({ id: globalAdmin?.id, email: globalAdmin?.email, role: 'GLOBAL_ADMIN', tenantId: null }, JWT_SECRET);

    // Tenant Admin
    const tenantAdmin = await prisma.user.findFirst({ where: { role: { name: 'TENANT_ADMIN' }, tenantId } });
    const tenantAdminToken = jwt.sign({ id: tenantAdmin?.id, email: tenantAdmin?.email, role: 'TENANT_ADMIN', tenantId }, JWT_SECRET);

    // Standard User with NO permission
    const junior = await prisma.user.findFirst({ where: { role: { name: 'JUNIOR_ASSOCIATE' }, tenantId } });
    if (!junior) throw new Error('Junior associate not found for testing.');
    
    const juniorTokenNoPerm = jwt.sign({ id: junior.id, email: junior.email, role: 'JUNIOR_ASSOCIATE', tenantId }, JWT_SECRET);

    // Standard User WITH Granular Permission Override
    await prisma.user.update({
        where: { id: junior.id },
        data: { permissions: ['VIEW_TENANT_SETTINGS'] }
    });
    const juniorTokenWithPerm = jwt.sign({ id: junior.id, email: junior.email, role: 'JUNIOR_ASSOCIATE', tenantId }, JWT_SECRET);

    console.log('--- Running Tests ---');

    // Test 1: Global Admin Bypass
    const res1 = await testRoute(globalAdminToken, `/tenant/settings?targetTenantId=${tenantId}`);
    console.log(`Test 1 (Global Admin Bypass): Status ${res1.status} ${res1.status === 200 ? '✅' : '❌'}`);

    // Test 2: Tenant Admin Fallback
    const res2 = await testRoute(tenantAdminToken, '/tenant/settings');
    console.log(`Test 2 (Tenant Admin Fallback): Status ${res2.status} ${res2.status === 200 ? '✅' : '❌'}`);

    // Test 3: Granular Permission Override
    const res3 = await testRoute(juniorTokenWithPerm, '/tenant/settings');
    console.log(`Test 3 (User Override - Has Perm): Status ${res3.status} ${res3.status === 200 ? '✅' : '❌'}`);

    // Test 4: Access Denied
    // First remove the permission
    await prisma.user.update({
        where: { id: junior.id },
        data: { permissions: [] }
    });
    const res4 = await testRoute(juniorTokenNoPerm, '/tenant/settings');
    console.log(`Test 4 (Access Denied - No Perm): Status ${res4.status} (Expected 403) ${res4.status === 403 ? '✅' : '❌'}`);

    console.log('\n=== VERIFICATION COMPLETE ===');
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
