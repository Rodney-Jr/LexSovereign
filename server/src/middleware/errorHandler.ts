import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';

export interface AppError extends Error {
    statusCode?: number;
    code?: string;
    details?: any;
}

export const errorHandler = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    console.error(`[Error] ${req.method} ${req.url} - ${err.message}`);
    
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';
    let code = err.code || 'INTERNAL_SERVER_ERROR';
    let details = err.details || null;

    // Prisma Error Handling
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === 'P2002') {
            statusCode = 409;
            message = 'A record with this unique value already exists.';
            code = 'UNIQUE_CONSTRAINT_VIOLATION';
        } else if (err.code === 'P2025') {
            statusCode = 404;
            message = 'The requested record was not found.';
            code = 'RECORD_NOT_FOUND';
        }
    }

    // JWT / Auth Errors
    if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid authentication token.';
        code = 'INVALID_TOKEN';
    } else if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Authentication token has expired.';
        code = 'TOKEN_EXPIRED';
    }

    res.status(statusCode).json({
        success: false,
        error: message,
        code: code,
        details: details,
        requestId: req.headers['x-request-id'] || Date.now().toString(36),
        timestamp: new Date().toISOString()
    });
};
