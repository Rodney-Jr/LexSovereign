
import { prisma } from '../db';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

interface ProvisionTenantInput {
    name: string;
    adminEmail: string;
    adminName: string;
    plan?: string;
    region?: string;
    appMode?: string;
    isTrial?: boolean;
}

interface ProvisionResult {
    tenantId: string;
    adminId: string;
    loginUrl: string;
    tempPassword?: string;
}

export class TenantService {

    /**
     * Provisions a new tenant with all necessary dependencies in a single transaction.
     * 1. Create Tenant
     * 2. Create Admin User
     * 3. Create Default Roles (System Roles)
     * 4. Create Chatbot Config (Empty/Disabled)
     * 5. Create Default Branding Profile
     */
    static async provisionTenant(input: ProvisionTenantInput): Promise<ProvisionResult> {
        const { name, adminEmail, adminName, plan = 'STANDARD', region = 'GH_ACC_1', appMode = 'LAW_FIRM', isTrial = true } = input;

        const adminId = randomUUID();
        const tenantId = randomUUID();
        let tempPassword = '';
        let passwordHash = '';

        try {
            console.log(`[TenantService] Starting provisioning for: ${name} (${adminEmail})`);
            
            // 🔥 [IDENTITY] Generate a secure random temporary password for the new admin
            tempPassword = randomUUID().replace(/-/g, '').substring(0, 12);
            passwordHash = await bcrypt.hash(tempPassword, 10);

            await prisma.$transaction(async (tx) => {
                // 1. Create Tenant
                console.log(`[Provisioning] Step 1: Creating Tenant: ${tenantId}`);

                // Trial Logic: 30 days from now
                const trialExpiresAt = new Date();
                trialExpiresAt.setDate(trialExpiresAt.getDate() + 30);

                const tenant = await tx.tenant.create({
                    data: {
                        id: tenantId,
                        name,
                        plan,
                        primaryRegion: region,
                        appMode,
                        status: 'ACTIVE',
                        isTrial: isTrial,
                        trialExpiresAt: isTrial ? trialExpiresAt : null,
                        aiCreditLimit: isTrial ? 50.0 : 500.0 // Higher limit for non-trial
                    }
                });

                // 2. Create Roles (TENANT_ADMIN, INTERNAL_COUNSEL)
                console.log(`[Provisioning] Step 2: Creating Admin Role`);
                const adminRole = await tx.role.create({
                    data: {
                        name: 'TENANT_ADMIN',
                        description: 'Full access to tenant resources',
                        isSystem: true,
                        tenantId: tenant.id,
                        permissions: {
                            connect: [
                                { id: 'MANAGE:TENANT_SETTINGS' }, { id: 'MANAGE:USER' }, { id: 'MANAGE:ROLE' },
                                { id: 'VIEW_BILLING:TENANT' }, { id: 'VIEW_STATS:TENANT' }, { id: 'CREATE:MATTER' },
                                { id: 'VIEW:CLIENT' }, { id: 'CREATE:CLIENT' }, { id: 'UPLOAD:DOCUMENT' },
                                { id: 'CREATE:DRAFT' }, { id: 'EDIT:DRAFT' }, { id: 'USE:CHAT' },
                                { id: 'EXECUTE:AI' }, { id: 'ACCESS:HR' }, { id: 'ACCESS:ACCOUNTING' }
                            ]
                        }
                    }
                });

                console.log(`[Provisioning] Step 3: Creating User Role`);
                const userRole = await tx.role.create({
                    data: {
                        name: process.env.DEFAULT_USER_ROLE || 'INTERNAL_COUNSEL',
                        description: 'Standard access to matters and documents',
                        isSystem: true,
                        tenantId: tenant.id,
                        permissions: {
                            connect: [
                                { id: 'CREATE:MATTER' }, { id: 'VIEW:MATTER' }, { id: 'CHECK:CONFLICTS' },
                                { id: 'CREATE:DRAFT' }, { id: 'EDIT:DRAFT' }, { id: 'VIEW:CLIENT' }
                            ]
                        }
                    }
                });

                // 3. Create Admin User
                console.log(`[Provisioning] Step 4: Creating Admin User: ${adminId}`);
                await tx.user.create({
                    data: {
                        id: adminId,
                        email: adminEmail,
                        passwordHash,
                        name: adminName,
                        tenantId: tenant.id,
                        roleId: adminRole.id,
                        region: region,
                        roleSeniority: 10.0
                    }
                });

                // 4. Create Chatbot Config
                console.log(`[Provisioning] Step 5: Creating Chatbot Config`);
                await tx.chatbotConfig.create({
                    data: {
                        tenantId: tenant.id,
                        botName: `${name} Assistant`,
                        welcomeMessage: `Welcome to ${name}. How can I assist you securely today?`,
                        systemInstruction: `You are the AI assistant for ${name}. Act with professional legal decorum.`,
                        channels: { webWidget: false, whatsapp: false },
                        knowledgeBaseIds: []
                    }
                });

                // 5. Create Default Branding
                console.log(`[Provisioning] Step 6: Creating Default Branding Profile`);
                await tx.brandingProfile.create({
                    data: {
                        tenantId: tenant.id,
                        name: 'Default Brand',
                        primaryColor: '#4F46E5',
                        secondaryColor: '#6366F1',
                        primaryFont: 'Times New Roman',
                        headerText: `${name} - Confidential`,
                        footerText: `Generated by ${name} Legal Enclave`,
                        watermarkText: 'CONFIDENTIAL'
                    }
                });

                // 6. Create Default General Matter
                console.log(`[Provisioning] Step 7: Creating Default General Matter`);
                let internalClient = await tx.client.findFirst({
                    where: { name: 'Firm Internal', tenantId: tenant.id }
                });
                
                if (!internalClient) {
                    internalClient = await tx.client.create({
                        data: { name: 'Firm Internal', tenantId: tenant.id }
                    });
                }

                await tx.matter.create({
                    data: {
                        name: 'General Enclave Matters',
                        clientId: internalClient.id,
                        type: 'ADMIN',
                        status: 'OPEN',
                        riskLevel: 'LOW',
                        tenantId: tenant.id
                    }
                });

                // 7. Create Default FirmAccount (Internal Operational Ledger)
                console.log(`[Provisioning] Step 8: Creating Default FirmAccount`);
                await tx.firmAccount.create({
                    data: {
                        name: 'General Operating Account',
                        type: 'OPERATING',
                        currency: 'USD',
                        balance: 0,
                        tenantId: tenant.id
                    }
                });
            });
            console.log(`✅ [TenantService] Database transaction successful for tenant: ${tenantId}`);
        } catch (error: any) {
            console.error("❌ [TenantService] Provisioning Transaction Failed!");
            console.error("Error Detail:", error.message || error);
            if (error.code === 'P2025') {
                console.error("❌ Tip: A connected record (permission or role) was not found in the database.");
                console.error("Please ensure you have run 'npm run seed' to synchronize system permissions.");
            }
            throw error;
        }

        // Determine Login URL (Environment specific)
        const baseUrl = process.env.PLATFORM_URL || 'https://app.nomosdesk.com';
        const loginUrl = `${baseUrl}/login?email=${encodeURIComponent(adminEmail)}`;

        return {
            tenantId,
            adminId,
            loginUrl,
            tempPassword: tempPassword // Return in cleartext for initial handoff
        };
    }

    static async getTenantDetails(tenantId: string) {
        return prisma.tenant.findUnique({
            where: { id: tenantId },
            include: {
                _count: {
                    select: { users: true, matters: true }
                }
            }
        });
    }

    static async updateTenantStatus(tenantId: string, status: string) {
        return prisma.tenant.update({
            where: { id: tenantId },
            data: { status }
        });
    }

    static async deleteTenant(tenantId: string) {
        // Soft delete by updating status or hard delete?
        // For a true "Sovereign Decommission", we might want to wipe data.
        // For now, let's mark as DELETED.
        return prisma.tenant.update({
            where: { id: tenantId },
            data: { status: 'DELETED' }
        });
    }

    static async manageUserStatus(userId: string, isActive: boolean) {
        return prisma.user.update({
            where: { id: userId },
            data: { isActive }
        });
    }
}
