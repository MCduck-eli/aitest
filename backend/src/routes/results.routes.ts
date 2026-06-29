import { Router } from 'express';
import { authMiddleware, requireRole } from '../middleware/auth';
import {
    getTestResults,
    getResultDetail,
    getDashboardAnalytics,
} from '../controllers/results.controller';

const router = Router();

// All results routes require authentication
router.use(authMiddleware);

// Results routes
router.get('/tests/:testId/results', requireRole(['admin', 'teacher']), getTestResults);
router.get('/results/:resultId', requireRole(['admin', 'teacher']), getResultDetail);
router.get('/dashboard/analytics', getDashboardAnalytics);

export default router;
