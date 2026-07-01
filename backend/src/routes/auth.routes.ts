import { Router } from "express";
import { authMiddleware, requireRole } from "../middleware/auth";
import {
    registerTrainingCenter,
    login,
    getCurrentUser,
} from "../controllers/auth.controller";

const router = Router();

// Auth routes (public)
router.post('/login', login);

// Only the main super admin can create training centers and center admins
router.post('/register', authMiddleware, requireRole(['super_admin']), registerTrainingCenter);

// Protected routes
router.get("/me", authMiddleware, getCurrentUser);

export default router;
