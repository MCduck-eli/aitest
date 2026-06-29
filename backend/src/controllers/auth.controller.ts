import { Request, Response } from 'express';
import { query } from '../config/database';
import { hashPassword, comparePassword, generateToken } from '../utils/auth';
import { ApiResponse, User, UserPublic } from '../types/models';

// Register Training Center
export const registerTrainingCenter = async (
    req: Request<{}, {}, {
        center_name: string;
        center_email: string;
        admin_email: string;
        admin_password: string;
        admin_name: string;
        phone?: string;
    }>,
    res: Response<ApiResponse>,
): Promise<void> => {
    try {
        const { center_name, center_email, admin_email, admin_password, admin_name, phone } = req.body;

        // Validate input
        if (!center_name || !center_email || !admin_email || !admin_password || !admin_name) {
            res.status(400).json({
                success: false,
                error: 'Missing required fields',
            });
            return;
        }

        // Check if training center already exists
        const centerResult = await query(
            'SELECT id FROM training_centers WHERE email = $1 OR name = $2',
            [center_email, center_name],
        );

        if (centerResult.rows.length > 0) {
            res.status(400).json({
                success: false,
                error: 'Training center already exists',
            });
            return;
        }

        // Create training center
        const centerResponse = await query(
            `INSERT INTO training_centers (name, email, phone, subscription_plan)
             VALUES ($1, $2, $3, $4)
             RETURNING id`,
            [center_name, center_email, phone || null, 'free'],
        );

        const centerId = centerResponse.rows[0].id;

        // Hash admin password
        const passwordHash = await hashPassword(admin_password);

        // Create admin user
        const userResponse = await query(
            `INSERT INTO users (training_center_id, email, password_hash, full_name, role)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id, email, full_name, role, training_center_id`,
            [centerId, admin_email, passwordHash, admin_name, 'admin'],
        );

        const user = userResponse.rows[0] as User;
        const token = generateToken({
            userId: user.id,
            trainingCenterId: user.training_center_id,
            email: user.email,
            role: user.role,
        });

        res.status(201).json({
            success: true,
            message: 'Training center registered successfully',
            data: {
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    full_name: user.full_name,
                    role: user.role,
                    training_center_id: user.training_center_id,
                },
            },
        });
    } catch (error: any) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Registration failed',
        });
    }
};

// Login
export const login = async (
    req: Request<{}, {}, { email: string; password: string }>,
    res: Response<ApiResponse>,
): Promise<void> => {
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
        const userResult = await query(
            `SELECT u.id, u.email, u.password_hash, u.full_name, u.role, u.training_center_id
             FROM users u
             WHERE u.email = $1 AND u.is_active = true`,
            [email],
        );

        if (userResult.rows.length === 0) {
            res.status(401).json({
                success: false,
                error: 'Invalid credentials',
            });
            return;
        }

        const user = userResult.rows[0] as User;

        // Verify password
        const isPasswordValid = await comparePassword(password, user.password_hash);

        if (!isPasswordValid) {
            res.status(401).json({
                success: false,
                error: 'Invalid credentials',
            });
            return;
        }

        // Generate token
        const token = generateToken({
            userId: user.id,
            trainingCenterId: user.training_center_id,
            email: user.email,
            role: user.role,
        });

        const userPublic: UserPublic = {
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
    } catch (error: any) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Login failed',
        });
    }
};

// Get current user
export const getCurrentUser = async (req: Request, res: Response<ApiResponse>): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: 'Not authenticated',
            });
            return;
        }

        const userResult = await query(
            `SELECT id, email, full_name, role, training_center_id, is_active, created_at, updated_at
             FROM users
             WHERE id = $1`,
            [req.user.userId],
        );

        if (userResult.rows.length === 0) {
            res.status(404).json({
                success: false,
                error: 'User not found',
            });
            return;
        }

        const user = userResult.rows[0] as UserPublic;

        res.json({
            success: true,
            data: user,
        });
    } catch (error: any) {
        console.error('Get user error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to get user',
        });
    }
};
