import { Router } from "express";
import { authMiddleware, requireRole } from "../middleware/auth";
import {
    login,
    getCurrentUser,
    studentLogin,
    getTrainingCenters,
    getSubjectsByTrainingCenter,
    getGroupsBySubject,
} from "../controllers/auth.controller";

const router = Router();

// Auth routes (public)
router.post('/login', login);
router.post('/student-login', studentLogin);
router.get('/training-centers', getTrainingCenters);
router.get('/training-centers/:id/subjects', getSubjectsByTrainingCenter);
router.get('/subjects/:subjectId/groups', getGroupsBySubject);


// Protected routes
router.get("/me", authMiddleware, getCurrentUser);

export default router;
