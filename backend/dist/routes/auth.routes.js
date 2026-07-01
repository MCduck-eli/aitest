"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const auth_controller_1 = require("../controllers/auth.controller");
const router = (0, express_1.Router)();
// Auth routes (public)
router.post('/login', auth_controller_1.login);
// Only the main super admin can create training centers and center admins
router.post('/register', auth_1.authMiddleware, (0, auth_1.requireRole)(['super_admin']), auth_controller_1.registerTrainingCenter);
// Protected routes
router.get("/me", auth_1.authMiddleware, auth_controller_1.getCurrentUser);
exports.default = router;
