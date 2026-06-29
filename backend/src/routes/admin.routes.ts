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
} from '../controllers/admin.controller';

const router = Router();

// All admin routes require authentication and admin/teacher role
router.use(authMiddleware, requireRole(['admin', 'teacher']));

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
