import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/auth';
import { JWTPayload } from '../types/models';
import { query } from '../config/database';

declare global {
    namespace Express {
        interface Request {
            user?: JWTPayload;
        }
    }
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            res.status(401).json({
                success: false,
                error: 'Authorization token required',
            });
            return;
        }

        const payload = verifyToken(token);

        // Fallback for super_admin trainingCenterId
        if (payload.role === 'super_admin' && !payload.trainingCenterId) {
            const centerResult = await query(
                `SELECT id FROM training_centers ORDER BY created_at LIMIT 1`
            );
            if (centerResult.rows.length > 0) {
                payload.trainingCenterId = centerResult.rows[0].id;
            }
        }

        req.user = payload;
        next();
    } catch (error: any) {
        res.status(401).json({
            success: false,
            error: error.message || 'Invalid token',
        });
    }
};

export const requireRole = (roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        if (!req.user || !roles.includes(req.user.role)) {
            res.status(403).json({
                success: false,
                error: 'Insufficient permissions',
            });
            return;
        }
        next();
    };
};
