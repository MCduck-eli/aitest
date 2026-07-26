"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const auth_controller_1 = require("../controllers/auth.controller");
const router = (0, express_1.Router)();
// Auth routes (public)
router.post('/login', auth_controller_1.login);
router.post('/student-login', auth_controller_1.studentLogin);
router.get('/training-centers', auth_controller_1.getTrainingCenters);
router.get('/training-centers/:id/subjects', auth_controller_1.getSubjectsByTrainingCenter);
router.get('/subjects/:subjectId/groups', auth_controller_1.getGroupsBySubject);
// Protected routes
router.get("/me", auth_1.authMiddleware, auth_controller_1.getCurrentUser);
exports.default = router;
