import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const ROLE_DEFAULT_PERMISSIONS: Record<string, string[]> = {
  'TENANT_ADMIN': ['manage_tenant', 'read_all_audits', 'manage_users', 'manage_roles', 'configure_bridge', 'design_workflow', 'create_draft', 'upload_document', 'access_hr_workbench', 'access_accounting_hub', 'access_platform_roadmap', 'access_infrastructure_plane', 'view_trial_status'],
  'MANAGING_PARTNER': ['manage_tenant', 'manage_users', 'manage_roles', 'configure_bridge', 'read_all_audits', 'read_billing', 'create_matter', 'check_conflicts', 'review_work', 'upload_document', 'read_assigned_matter', 'design_workflow', 'create_draft', 'edit_draft', 'submit_review', 'ai_chat_execute', 'use_legal_chat', 'view_confidential', 'freeze_budget', 'approve_spend', 'manage_expenses', 'access_hr_workbench', 'access_accounting_hub', 'access_platform_roadmap', 'access_infrastructure_plane', 'view_trial_status'],
  'INTERNAL_COUNSEL': ['create_matter', 'read_assigned_matter', 'check_conflicts', 'review_work', 'upload_document', 'create_draft', 'edit_draft', 'use_legal_chat'],
  'GLOBAL_ADMIN': ['manage_platform', 'manage_tenant', 'read_all_audits', 'use_legal_chat', 'create_draft', 'upload_document'],
  'DEPUTY_GC': ['manage_users', 'read_all_audits', 'create_matter', 'review_work', 'check_conflicts', 'read_assigned_matter', 'manage_roles', 'create_draft', 'approve_document', 'read_billing', 'design_workflow', 'use_legal_chat'],
  'EXTERNAL_COUNSEL': ['read_assigned_matter', 'upload_document', 'create_matter', 'create_draft', 'use_legal_chat'],
  'CLIENT': ['read_assigned_matter', 'client_portal_access', 'export_final'],
  'EXECUTIVE_BOARD': ['read_all_audits', 'read_billing', 'use_legal_chat'],
  'COMPLIANCE': ['read_all_audits', 'manage_tenant', 'use_legal_chat'],
  'FINANCE_BILLING': ['read_billing'],
  'PARTNER': ['create_matter', 'read_assigned_matter', 'read_analytics', 'check_conflicts', 'review_work', 'upload_document', 'create_draft', 'edit_draft', 'approve_document', 'export_final', 'read_billing', 'read_all_audits', 'manage_users', 'design_workflow', 'use_legal_chat', 'can_freeze_budget'],
  'SENIOR_COUNSEL': ['create_matter', 'read_assigned_matter', 'check_conflicts', 'review_work', 'upload_document', 'create_draft', 'edit_draft', 'submit_review', 'use_legal_chat', 'read_billing'],
  'JUNIOR_ASSOCIATE': ['read_assigned_matter', 'check_conflicts', 'upload_document', 'create_draft', 'edit_draft', 'submit_review', 'create_matter', 'use_legal_chat'],
  'OWNER': ['read_all_audits', 'manage_tenant', 'manage_users', 'manage_roles', 'create_matter', 'upload_document', 'read_billing', 'review_work', 'check_conflicts', 'read_assigned_matter', 'create_draft', 'edit_draft', 'approve_document', 'export_final', 'ai_chat_execute', 'use_legal_chat', 'view_confidential', 'access_hr_workbench', 'access_accounting_hub', 'access_platform_roadmap', 'access_infrastructure_plane', 'view_trial_status'],
  'PARALEGAL': ['create_draft', 'edit_draft', 'submit_review', 'use_legal_chat'],
  'AUDITOR': ['read_all_audits', 'read_assigned_matter'],
  'CLERK': ['upload_field_intake', 'use_legal_chat', 'read_assigned_matter'],
  'ADMIN_MANAGER': ['manage_tenant', 'manage_users', 'manage_roles', 'read_billing', 'access_hr_workbench', 'access_accounting_hub', 'access_platform_roadmap', 'view_trial_status'],
  'FINANCE_MANAGER': ['read_billing', 'manage_expenses', 'read_analytics', 'manage_users', 'read_all_audits'],
  'SENIOR_ASSOCIATE': ['create_matter', 'read_assigned_matter', 'check_conflicts', 'review_work', 'upload_document', 'create_draft', 'edit_draft', 'submit_review', 'use_legal_chat', 'read_billing'],
  'GENERAL_COUNSEL': ['manage_tenant', 'manage_users', 'manage_roles', 'read_all_audits', 'read_billing', 'create_matter', 'check_conflicts', 'review_work', 'upload_document', 'read_assigned_matter', 'design_workflow', 'create_draft', 'edit_draft', 'approve_document', 'use_legal_chat', 'manage_expenses', 'read_analytics'],
  'CONTRACT_MANAGER': ['create_matter', 'read_assigned_matter', 'design_workflow', 'review_work', 'upload_document', 'create_draft', 'edit_draft', 'use_legal_chat', 'read_billing', 'manage_expenses'],
  'COMPLIANCE_OFFICER': ['read_all_audits', 'manage_tenant', 'review_work', 'read_assigned_matter', 'upload_document', 'use_legal_chat'],
  'LEGAL_OPS': ['manage_users', 'design_workflow', 'read_billing', 'read_all_audits', 'create_matter', 'upload_document', 'read_assigned_matter', 'create_draft', 'check_conflicts', 'use_legal_chat', 'manage_expenses', 'read_analytics']
};

async function syncPermissions() {
    console.log('--- Starting Global Permission Sync ---');

    try {
        // 1. Ensure all permissions from constants exist in the database
        const allPermissionIds = new Set<string>();
        Object.values(ROLE_DEFAULT_PERMISSIONS).forEach(perms => {
            perms.forEach(p => allPermissionIds.add(p));
        });

        console.log(`Checking ${allPermissionIds.size} unique permissions...`);
        for (const permId of allPermissionIds) {
            await prisma.permission.upsert({
                where: { id: permId },
                update: {},
                create: {
                    id: permId,
                    description: `System permission: ${permId}`,
                    resource: permId.split('_')[1]?.toUpperCase() || 'SYSTEM',
                    action: permId.split('_')[0]?.toUpperCase() || 'ACCESS'
                }
            });
        }
        console.log('✅ All permissions verified/upserted.');

        // 2. Sync Roles
        const dbRoles = await prisma.role.findMany();
        console.log(`Processing ${dbRoles.length} roles in database...`);

        let updatedCount = 0;
        for (const role of dbRoles) {
            const defaultPerms = ROLE_DEFAULT_PERMISSIONS[role.name];
            if (defaultPerms) {
                // Update this specific role record (including duplicates)
                await prisma.role.update({
                    where: { id: role.id },
                    data: {
                        permissions: {
                            set: defaultPerms.map(id => ({ id }))
                        }
                    }
                });
                updatedCount++;
            }
        }

        console.log(`✅ Successfully synced ${updatedCount} role records.`);
        console.log('--- Permission Sync Complete ---');

    } catch (e: any) {
        console.error('❌ Sync Failed:', e.message);
    } finally {
        await prisma.$disconnect();
    }
}

syncPermissions();
