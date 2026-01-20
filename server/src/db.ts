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
