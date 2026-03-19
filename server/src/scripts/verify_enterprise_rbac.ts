import { PrismaClient } from '@prisma/client';
import "dotenv/config";
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
    console.log('=== VERIFYING ENTERPRISE RBAC PERMISSIONS ===');

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

    console.log('--- Running Tests ---');

    console.log(`Global Admin User: ${globalAdmin?.email}`);
    console.log(`Tenant Admin User: ${tenantAdmin?.email}`);
    console.log(`Junior User: ${junior?.email}\n`);

    // Test 1: Global Admin Bypass (Access Settings which require VIEW on TENANT_SETTINGS)
    const res1 = await testRoute(globalAdminToken, `/tenant/settings?targetTenantId=${tenantId}`);
    console.log(`Test 1 (Global Admin Bypass): Status ${res1.status} ${res1.status === 200 ? '✅' : '❌'}`);

    // Test 2: Tenant Admin Fallback (Access Settings without specific explicit assignment in array, though we linked it in seed script too)
    const res2 = await testRoute(tenantAdminToken, '/tenant/settings');
    console.log(`Test 2 (Tenant Admin Fallback/Access): Status ${res2.status} ${res2.status === 200 ? '✅' : '❌'}`);

    // Test 3: Access Denied
    const res3 = await testRoute(juniorTokenNoPerm, '/tenant/settings');
    console.log(`Test 3 (Access Denied - No Role/Perm): Status ${res3.status} (Expected 403) ${res3.status === 403 ? '✅' : '❌'}`);

    console.log('\n=== VERIFICATION COMPLETE ===');
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
