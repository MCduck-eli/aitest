"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const results_controller_1 = require("../controllers/results.controller");
const router = (0, express_1.Router)();
// All results routes require authentication
router.use(auth_1.authMiddleware);
// Results routes
router.get('/tests/:testId/results', (0, auth_1.requireRole)(['admin', 'teacher', 'super_admin']), results_controller_1.getTestResults);
router.get('/results/:resultId', (0, auth_1.requireRole)(['admin', 'teacher', 'super_admin']), results_controller_1.getResultDetail);
router.get('/dashboard/analytics', (0, auth_1.requireRole)(['admin', 'teacher', 'super_admin']), results_controller_1.getDashboardAnalytics);
exports.default = router;
