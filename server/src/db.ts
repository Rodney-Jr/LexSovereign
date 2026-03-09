import { PrismaClient } from '@prisma/client';
import { AsyncLocalStorage } from 'async_hooks';
import { tenantIsolationMiddleware } from './middleware/tenantIsolation';

// Async Local Storage to track context across async calls in a request
export const requestContext = new AsyncLocalStorage<{ tenantId?: string, userId?: string }>();

const prismaClient = new PrismaClient();

// Apply Middleware
prismaClient.$use(tenantIsolationMiddleware(() => {
    const store = requestContext.getStore();
    return store?.tenantId;
}));

export const prisma = prismaClient;

/**
 * Verifies database connectivity and logs connection details (masked).
 */
export const verifyConnection = async () => {
    try {
        const url = process.env.DATABASE_URL || '';
        const maskedUrl = url.replace(/:([^:@]+)@/, ':****@');
        console.log(`[Database] Attempting to connect to: ${maskedUrl}`);

        await prisma.$queryRaw`SELECT 1`;
        console.log('✅ [Database] Connection successful.');
        return true;
    } catch (error: any) {
        console.error('❌ [Database] Connection failed:', error.message);
        return false;
    }
};
