
import { prisma } from '../db';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

interface ProvisionTenantInput {
    name: string;
    adminEmail: string;
    adminName: string;
    adminPassword?: string;
    plan?: string;
    region?: string;
    appMode?: string;
}

interface ProvisionResult {
    tenantId: string;
    adminId: string;
    tempPassword: string;
    loginUrl: string;
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
        const { name, adminEmail, adminName, adminPassword, plan = 'STANDARD', region = 'GH_ACC_1', appMode = 'LAW_FIRM' } = input;

        // Generate a temporary password or use the provided one
        const tempPassword = adminPassword || (Math.random().toString(36).slice(-8) + "!Aa1");
        const passwordHash = await bcrypt.hash(tempPassword, 10);
        const adminId = randomUUID();
        const tenantId = randomUUID();

        try {
            console.log(`[TenantService] Starting provisioning for: ${name} (${adminEmail})`);
            await prisma.$transaction(async (tx) => {
                // 1. Create Tenant
                console.log(`[Provisioning] Step 1: Creating Tenant: ${tenantId}`);
                const tenant = await tx.tenant.create({
                    data: {
                        id: tenantId,
                        name,
                        plan,
                        primaryRegion: region,
                        appMode
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
                                { id: 'manage_tenant' }, { id: 'manage_users' }, { id: 'manage_roles' },
                                { id: 'read_billing' }, { id: 'read_all_audits' }, { id: 'create_matter' }
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
                                { id: 'create_matter' }, { id: 'read_assigned_matter' },
                                { id: 'create_draft' }, { id: 'edit_draft' }
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
                        name: adminName,
                        passwordHash,
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
            });
            console.log(`✅ [TenantService] Database transaction successful for tenant: ${tenantId}`);
        } catch (error: any) {
            console.error("❌ [TenantService] Provisioning Transaction Failed!");
            console.error("Error Detail:", error.message || error);
            if (error.code === 'P2025') {
                console.error("Tip: This error usually means one of the connected permissions (manage_tenant, etc) is missing from the database.");
            }
            throw error;
        }

        // Determine Login URL (Environment specific)
        const baseUrl = process.env.PLATFORM_URL || 'http://localhost:3000';
        const loginUrl = `${baseUrl}/login?email=${encodeURIComponent(adminEmail)}`;

        return {
            tenantId,
            adminId,
            tempPassword,
            loginUrl
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
