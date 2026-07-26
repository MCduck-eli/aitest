"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const admin_controller_1 = require("../controllers/admin.controller");
const router = (0, express_1.Router)();
// Public/Student accessible route - requires auth
router.get('/lesson-scripts', auth_1.authMiddleware, (0, auth_1.requireRole)(['admin', 'teacher', 'super_admin', 'student']), admin_controller_1.getLessonScripts);
// All admin routes require authentication and admin/teacher/super_admin role
router.use(auth_1.authMiddleware, (0, auth_1.requireRole)(['admin', 'teacher', 'super_admin']));
// Super admin can create other admins/teachers
router.post('/users', (0, auth_1.requireRole)(['super_admin']), admin_controller_1.createAdminUser);
// Users management (only super_admin and admin)
router.get('/users/list', (0, auth_1.requireRole)(['super_admin', 'admin']), admin_controller_1.getUsers);
router.delete('/users/:id', (0, auth_1.requireRole)(['super_admin', 'admin']), admin_controller_1.deleteUser);
router.delete('/users/all', (0, auth_1.requireRole)(['super_admin']), admin_controller_1.deleteAllAdmins);
router.post('/users/:id/reset-password', (0, auth_1.requireRole)(['super_admin']), admin_controller_1.resetAdminPassword);
// Subjects (Fanlar) management
router.post('/subjects', (0, auth_1.requireRole)(['super_admin', 'admin']), admin_controller_1.createSubject);
router.get('/subjects', admin_controller_1.getSubjects);
router.put('/subjects/:id', (0, auth_1.requireRole)(['super_admin', 'admin']), admin_controller_1.updateSubject);
router.delete('/subjects/:id', (0, auth_1.requireRole)(['super_admin', 'admin']), admin_controller_1.deleteSubject);
// Study Groups (Guruhlar) management
router.post('/groups', (0, auth_1.requireRole)(['super_admin', 'admin']), admin_controller_1.createGroup);
router.get('/groups', admin_controller_1.getGroups);
router.put('/groups/:id', (0, auth_1.requireRole)(['super_admin', 'admin']), admin_controller_1.updateGroup);
router.delete('/groups/:id', (0, auth_1.requireRole)(['super_admin', 'admin']), admin_controller_1.deleteGroup);
// Subject-Group Relationships (Fan-Guruh bog'lanishi)
router.post('/subject-groups', (0, auth_1.requireRole)(['super_admin', 'admin']), admin_controller_1.linkSubjectGroup);
router.get('/subject-groups', admin_controller_1.getSubjectGroups);
router.delete('/subject-groups/:id', (0, auth_1.requireRole)(['super_admin', 'admin']), admin_controller_1.unlinkSubjectGroup);
// Lesson Scripts (Dars skriptlari) management
router.post('/lesson-scripts', (0, auth_1.requireRole)(['super_admin', 'admin', 'teacher']), admin_controller_1.createLessonScript);
router.delete('/lesson-scripts/:id', (0, auth_1.requireRole)(['super_admin', 'admin', 'teacher']), admin_controller_1.deleteLessonScript);
router.post('/lesson-scripts/:id/generate-questions', (0, auth_1.requireRole)(['super_admin', 'admin', 'teacher']), admin_controller_1.generateQuestionsFromLessonScript);
// Student Progress (O'quvchilarning dars darajasi)
router.get('/student-progress', admin_controller_1.getStudentProgress);
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
