"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const admin_controller_1 = require("../controllers/admin.controller");
const router = (0, express_1.Router)();
// All admin routes require authentication and admin/teacher/super_admin role
router.use(auth_1.authMiddleware, (0, auth_1.requireRole)(['admin', 'teacher', 'super_admin']));
// Super admin can create other admins/teachers
router.post('/users', (0, auth_1.requireRole)(['super_admin']), admin_controller_1.createAdminUser);
// Test Bank routes
router.post('/tests', admin_controller_1.createTestBank);
router.get('/tests', admin_controller_1.getTestBanks);
router.get('/tests/:id', admin_controller_1.getTestBank);
router.put('/tests/:id', admin_controller_1.updateTestBank);
router.delete('/tests/:id', admin_controller_1.deleteTestBank);
// Question routes
router.post('/tests/:testId/questions', admin_controller_1.createQuestion);
router.get('/tests/:testId/questions', admin_controller_1.getQuestions);
router.put('/tests/:testId/questions/:questionId', admin_controller_1.updateQuestion);
router.delete('/tests/:testId/questions/:questionId', admin_controller_1.deleteQuestion);
exports.default = router;
