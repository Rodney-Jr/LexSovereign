
import { prisma } from '../db';
import { TenantService } from '../services/TenantService';
import { sendTenantWelcomeEmail } from '../services/EmailService';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const TEST_EMAIL = `demo-verify-${Date.now()}@test-nomosdesk.com`;
const TEST_NAME = 'Verification User';
const TEST_ORG = 'VerifyOrg Legal';

async function cleanup(tenantId?: string, userId?: string) {
    try {
        if (userId) await prisma.user.delete({ where: { id: userId } }).catch(() => { });
        if (tenantId) await prisma.tenant.delete({ where: { id: tenantId } }).catch(() => { });
        await prisma.lead.deleteMany({ where: { email: TEST_EMAIL } }).catch(() => { });
    } catch { }
}

async function run() {
    console.log('--- Demo Automation Verification ---');
    let tenantId: string | undefined;
    let userId: string | undefined;

    try {
        // STEP 1: Simulate lead creation
        console.log('\n[1] Creating demo lead...');
        const lead = await prisma.lead.create({
            data: { email: TEST_EMAIL, name: TEST_NAME, company: TEST_ORG, source: 'WEB_MODAL', status: 'NEW' }
        });
        console.log('    ✅ Lead created:', lead.id);

        // STEP 2: Provision tenant
        console.log('\n[2] Provisioning tenant...');
        const result = await TenantService.provisionTenant({
            name: TEST_ORG,
            adminEmail: TEST_EMAIL,
            adminName: TEST_NAME,
            plan: 'STANDARD',
            region: 'GH_ACC_1'
        });
        tenantId = result.tenantId;
        userId = result.adminId;
        console.log('    ✅ Tenant provisioned:', result.tenantId);
        console.log('    ✅ Admin user:', result.adminId);
        // @ts-ignore
        console.log('    ✅ Provisioning successful');

        // STEP 3: Update lead status
        console.log('\n[3] Updating lead to CONVERTED...');
        await prisma.lead.update({ where: { id: lead.id }, data: { status: 'CONVERTED' } });
        const updated = await prisma.lead.findUnique({ where: { id: lead.id } });
        console.log('    ✅ Lead status:', updated?.status);

        // STEP 4: Send welcome email
        console.log('\n[4] Sending welcome email...');
        await sendTenantWelcomeEmail({
            to: TEST_EMAIL, adminName: TEST_NAME,
            tenantName: TEST_ORG, tempPassword: 'Check email for login link', loginUrl: result.loginUrl
        });
        console.log('    ✅ Welcome email dispatched to:', TEST_EMAIL);

        console.log('\n✅✅ All steps PASSED. Demo automation is operational.\n');
    } catch (err: any) {
        console.error('\n❌ Verification FAILED:', err.message);
    } finally {
        console.log('[Cleanup] Removing test data...');
        await cleanup(tenantId, userId);
        console.log('[Cleanup] Done.');
        await prisma.$disconnect();
    }
}

run();
