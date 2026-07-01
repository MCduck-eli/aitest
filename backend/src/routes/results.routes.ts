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
router.get('/tests/:testId/results', requireRole(['admin', 'teacher', 'super_admin']), getTestResults);
router.get('/results/:resultId', requireRole(['admin', 'teacher', 'super_admin']), getResultDetail);
router.get('/dashboard/analytics', requireRole(['admin', 'teacher', 'super_admin']), getDashboardAnalytics);

export default router;
