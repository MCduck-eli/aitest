import { Router } from 'express';
import { authMiddleware, requireRole } from '../middleware/auth';
import {
    registerTrainingCenter,
    login,
    getCurrentUser,
} from '../controllers/auth.controller';

const router = Router();

// Auth routes (public)
router.post('/register', registerTrainingCenter);
router.post('/login', login);

// Protected routes
router.get('/me', authMiddleware, getCurrentUser);

export default router;
