import { Router } from 'express';
import { authMiddleware, requireRole } from '../middleware/auth';
import {
    createTestBank,
    getTestBanks,
    getTestBank,
    updateTestBank,
    deleteTestBank,
    createQuestion,
    getQuestions,
    updateQuestion,
    deleteQuestion,
    createAdminUser,
} from '../controllers/admin.controller';

const router = Router();

// All admin routes require authentication and admin/teacher/super_admin role
router.use(authMiddleware, requireRole(['admin', 'teacher', 'super_admin']));

// Super admin can create other admins/teachers
router.post('/users', requireRole(['super_admin']), createAdminUser);

// Test Bank routes
router.post('/tests', createTestBank);
router.get('/tests', getTestBanks);
router.get('/tests/:id', getTestBank);
router.put('/tests/:id', updateTestBank);
router.delete('/tests/:id', deleteTestBank);

// Question routes
router.post('/tests/:testId/questions', createQuestion);
router.get('/tests/:testId/questions', getQuestions);
router.put('/tests/:testId/questions/:questionId', updateQuestion);
router.delete('/tests/:testId/questions/:questionId', deleteQuestion);

export default router;
