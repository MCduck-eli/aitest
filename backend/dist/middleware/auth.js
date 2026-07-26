"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = exports.authMiddleware = void 0;
const auth_1 = require("../utils/auth");
const database_1 = require("../config/database");
const authMiddleware = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            res.status(401).json({
                success: false,
                error: 'Authorization token required',
            });
            return;
        }
        const payload = (0, auth_1.verifyToken)(token);
        // Fallback for super_admin trainingCenterId
        if (payload.role === 'super_admin' && !payload.trainingCenterId) {
            const centerResult = await (0, database_1.query)(`SELECT id FROM training_centers ORDER BY created_at LIMIT 1`);
            if (centerResult.rows.length > 0) {
                payload.trainingCenterId = centerResult.rows[0].id;
            }
        }
        req.user = payload;
        next();
    }
    catch (error) {
        res.status(401).json({
            success: false,
            error: error.message || 'Invalid token',
        });
    }
};
exports.authMiddleware = authMiddleware;
const requireRole = (roles) => {
    return (req, res, next) => {
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
exports.requireRole = requireRole;
