"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentUser = exports.login = exports.registerTrainingCenter = void 0;
const crypto_1 = require("crypto");
const database_1 = require("../config/database");
const auth_1 = require("../utils/auth");
const slugify = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, '').slice(0, 24) || 'center';
const generatePassword = (length = 12) => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*';
    const bytes = (0, crypto_1.randomBytes)(length);
    let password = '';
    for (let i = 0; i < length; i += 1) {
        password += chars[bytes[i] % chars.length];
    }
    return password;
};
const generateAdminEmail = async (centerName) => {
    const baseSlug = slugify(centerName) || 'center';
    const baseEmail = `${baseSlug}@aitest.uz`;
    const existing = await (0, database_1.query)('SELECT id FROM users WHERE email = $1', [baseEmail]);
    if (existing.rows.length === 0) {
        return baseEmail;
    }
    let counter = 2;
    let candidate = `${baseSlug}${counter}@aitest.uz`;
    while (true) {
        const duplicate = await (0, database_1.query)('SELECT id FROM users WHERE email = $1', [candidate]);
        if (duplicate.rows.length === 0) {
            return candidate;
        }
        counter += 1;
        candidate = `${baseSlug}${counter}@aitest.uz`;
    }
};
// Register Training Center
const registerTrainingCenter = async (req, res) => {
    try {
        const { center_name, center_email, admin_email, admin_password, admin_name, phone } = req.body;
        // Validate input
        if (!center_name || !center_email || !admin_name) {
            res.status(400).json({
                success: false,
                error: 'Markaz nomi, elektron pochta va administrator ismi talab qilinadi',
            });
            return;
        }
        const generatedAdminEmail = admin_email?.trim() || await generateAdminEmail(center_name);
        const generatedAdminPassword = admin_password?.trim() || generatePassword();
        // Check if training center already exists
        const centerResult = await (0, database_1.query)('SELECT id FROM training_centers WHERE email = $1 OR name = $2', [center_email, center_name]);
        if (centerResult.rows.length > 0) {
            res.status(400).json({
                success: false,
                error: 'Training center already exists',
            });
            return;
        }
        // Create training center
        const centerResponse = await (0, database_1.query)(`INSERT INTO training_centers (name, email, phone, subscription_plan)
             VALUES ($1, $2, $3, $4)
             RETURNING id`, [center_name, center_email, phone || null, 'free']);
        const centerId = centerResponse.rows[0].id;
        // Hash admin password
        const passwordHash = await (0, auth_1.hashPassword)(generatedAdminPassword);
        // Create admin user
        const userResponse = await (0, database_1.query)(`INSERT INTO users (training_center_id, email, password_hash, full_name, role)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id, email, full_name, role, training_center_id`, [centerId, generatedAdminEmail, passwordHash, admin_name, 'admin']);
        const user = userResponse.rows[0];
        const token = (0, auth_1.generateToken)({
            userId: user.id,
            trainingCenterId: user.training_center_id,
            email: user.email,
            role: user.role,
        });
        res.status(201).json({
            success: true,
            message: 'Markaz muvaffaqiyatli ro\'yxatga olindi. Admin uchun login va parol yaratilgan.',
            data: {
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    full_name: user.full_name,
                    role: user.role,
                    training_center_id: user.training_center_id,
                },
                generated_credentials: {
                    email: generatedAdminEmail,
                    password: generatedAdminPassword,
                },
            },
        });
    }
    catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Registration failed',
        });
    }
};
exports.registerTrainingCenter = registerTrainingCenter;
// Login
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({
                success: false,
                error: 'Email and password required',
            });
            return;
        }
        // Find user
        const userResult = await (0, database_1.query)(`SELECT u.id, u.email, u.password_hash, u.full_name, u.role, u.training_center_id
             FROM users u
             WHERE u.email = $1 AND u.is_active = true`, [email]);
        if (userResult.rows.length === 0) {
            res.status(401).json({
                success: false,
                error: 'Invalid credentials',
            });
            return;
        }
        const user = userResult.rows[0];
        // Verify password
        const isPasswordValid = await (0, auth_1.comparePassword)(password, user.password_hash);
        if (!isPasswordValid) {
            res.status(401).json({
                success: false,
                error: 'Invalid credentials',
            });
            return;
        }
        // Generate token
        const token = (0, auth_1.generateToken)({
            userId: user.id,
            trainingCenterId: user.training_center_id,
            email: user.email,
            role: user.role,
        });
        const userPublic = {
            id: user.id,
            email: user.email,
            full_name: user.full_name,
            role: user.role,
            training_center_id: user.training_center_id,
            is_active: user.is_active,
            created_at: user.created_at,
            updated_at: user.updated_at,
        };
        res.json({
            success: true,
            message: 'Login successful',
            data: {
                token,
                user: userPublic,
            },
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Login failed',
        });
    }
};
exports.login = login;
// Get current user
const getCurrentUser = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: 'Not authenticated',
            });
            return;
        }
        const userResult = await (0, database_1.query)(`SELECT id, email, full_name, role, training_center_id, is_active, created_at, updated_at
             FROM users
             WHERE id = $1`, [req.user.userId]);
        if (userResult.rows.length === 0) {
            res.status(404).json({
                success: false,
                error: 'User not found',
            });
            return;
        }
        const user = userResult.rows[0];
        res.json({
            success: true,
            data: user,
        });
    }
    catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to get user',
        });
    }
};
exports.getCurrentUser = getCurrentUser;
