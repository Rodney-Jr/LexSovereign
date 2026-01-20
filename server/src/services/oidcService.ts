
import { prisma } from '../db';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../jwtConfig';

interface OIDCProfile {
    sub: string;
    email: string;
    name: string;
    provider: string; // 'AZURE_AD', 'OKTA'
    groups?: string[]; // e.g., ["LexSovereign_Tenants", "Legal_Counsel"]
    department?: string;
    clearance_level?: string;
}

export class OIDCService {

    /**
     * Map External Claims to Internal User/Role
     */
    static async handleLogin(profile: OIDCProfile) {

        let user = await prisma.user.findFirst({
            where: {
                OR: [
                    { provider: profile.provider, providerId: profile.sub },
                    { email: profile.email } // Fallback linkage
                ]
            },
            include: { role: { include: { permissions: true } } }
        });

        // JIT (Just-In-Time) Provisioning
        if (!user) {
            // Determine Role from Groups
            let mappedRoleName = 'CLIENT'; // Default
            if (profile.groups?.includes('Legal_Counsel')) mappedRoleName = 'INTERNAL_COUNSEL';
            if (profile.groups?.includes('General_Counsel')) mappedRoleName = 'TENANT_ADMIN';

            const role = await prisma.role.findUnique({ where: { name: mappedRoleName } })
                || await prisma.role.findFirst({ where: { name: 'INTERNAL_COUNSEL' } }); // Fallback

            if (!role) throw new Error("Mapped Role not found during JIT provisioning");

            // Create User
            user = await prisma.user.create({
                data: {
                    email: profile.email,
                    name: profile.name,
                    passwordHash: 'FEDERATED_NO_PASSWORD',
                    provider: profile.provider,
                    providerId: profile.sub,
                    roleId: role.id,
                    roleString: role.name,
                    attributes: {
                        department: profile.department || 'Unknown',
                        clearance: profile.clearance_level || 'Standard'
                    }
                },
                include: { role: { include: { permissions: true } } }
            });
        } else {
            // Update logic could go here (Sync attributes on login)
            // e.g. update latest clearance level
        }

        // Generate Internal Token
        const permissions = (user as any).role?.permissions.map((p: any) => p.id) || [];
        const token = jwt.sign({
            id: user.id,
            email: user.email,
            role: (user as any).role?.name,
            permissions,
            tenantId: user.tenantId,
            provider: (user as any).provider
        }, JWT_SECRET, { expiresIn: '8h' });

        return { token, user };
    }
}
