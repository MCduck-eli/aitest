import { randomBytes } from 'crypto';
import { Request, Response } from 'express';
import { query } from '../config/database';
import { hashPassword, comparePassword, generateToken } from '../utils/auth';
import { ApiResponse, User, UserPublic } from '../types/models';

const slugify = (value: string): string => value.toLowerCase().replace(/[^a-z0-9]+/g, '').slice(0, 24) || 'center';

const generatePassword = (length = 12): string => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*';
    const bytes = randomBytes(length);
    let password = '';

    for (let i = 0; i < length; i += 1) {
        password += chars[bytes[i] % chars.length];
    }

    return password;
};

// Get subjects by training center
export const getSubjectsByTrainingCenter = async (
    req: Request<{ id: string }>,
    res: Response<ApiResponse>,
): Promise<void> => {
    try {
        const result = await query(
            `SELECT id, name, description FROM subjects WHERE training_center_id = $1 AND is_active = true ORDER BY name`,
            [req.params.id],
        );

        res.json({
            success: true,
            data: result.rows,
        });
    } catch (error: any) {
        console.error('Get subjects error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Get groups linked to a subject
export const getGroupsBySubject = async (
    req: Request<{ subjectId: string }>,
    res: Response<ApiResponse>,
): Promise<void> => {
    try {
        const result = await query(
            `SELECT g.id, g.name, g.description, sg.subject_id
             FROM study_groups g
             JOIN subject_groups sg ON g.id = sg.group_id
             WHERE sg.subject_id = $1 AND g.is_active = true
             ORDER BY g.name`,
            [req.params.subjectId],
        );

        res.json({
            success: true,
            data: result.rows,
        });
    } catch (error: any) {
        console.error('Get groups error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

const generateAdminEmail = async (centerName: string): Promise<string> => {
    const baseSlug = slugify(centerName) || 'center';
    const baseEmail = `${baseSlug}@aitest.uz`;
    const existing = await query('SELECT id FROM users WHERE email = $1', [baseEmail]);

    if (existing.rows.length === 0) {
        return baseEmail;
    }

    let counter = 2;
    let candidate = `${baseSlug}${counter}@aitest.uz`;

    while (true) {
        const duplicate = await query('SELECT id FROM users WHERE email = $1', [candidate]);
        if (duplicate.rows.length === 0) {
            return candidate;
        }
        counter += 1;
        candidate = `${baseSlug}${counter}@aitest.uz`;
    }
};

// Register Training Center
export const register = async (
    req: Request<{}, {}, { center_name: string; center_email: string; admin_name: string; phone?: string }>,
    res: Response<ApiResponse>,
): Promise<void> => {
    try {
        const { center_name, center_email, admin_name, phone } = req.body;

        if (!center_name?.trim() || !center_email?.trim() || !admin_name?.trim()) {
            res.status(400).json({
                success: false,
                error: 'Markaz nomi, email va admin ismi majburiy',
            });
            return;
        }

        // Check if training center already exists
        const existingCenter = await query('SELECT id FROM training_centers WHERE email = $1', [center_email]);
        if (existingCenter.rows.length > 0) {
            res.status(400).json({
                success: false,
                error: 'Bu elektron pochta bilan markaz allaqachon ro\'yxatdan o\'tgan',
            });
            return;
        }

        // Create training center
        const centerResult = await query(
            `INSERT INTO training_centers (name, email, phone)
             VALUES ($1, $2, $3)
             RETURNING id`,
            [center_name.trim(), center_email.trim(), phone || null],
        );

        const trainingCenterId = centerResult.rows[0].id;

        // Generate admin credentials
        const generatedEmail = await generateAdminEmail(center_name);
        const generatedPassword = generatePassword();
        const passwordHash = await hashPassword(generatedPassword);

        // Create admin user
        const userResult = await query(
            `INSERT INTO users (training_center_id, email, password_hash, full_name, role, is_active)
             VALUES ($1, $2, $3, $4, 'admin', true)
             RETURNING id, email, full_name, role`,
            [trainingCenterId, generatedEmail, passwordHash, admin_name.trim()],
        );

        const adminUser = userResult.rows[0];

        res.status(201).json({
            success: true,
            message: 'O\'quv markazi va admin hisobi muvaffaqiyatli yaratildi',
            data: {
                training_center: {
                    id: trainingCenterId,
                    name: center_name,
                    email: center_email,
                },
                admin: adminUser,
                generated_credentials: {
                    email: generatedEmail,
                    password: generatedPassword,
                },
            },
        });
    } catch (error: any) {
        console.error('Register error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Ro\'yxatdan o\'tishda xatolik',
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
        let trainingCenterId = user.training_center_id;
        if (user.role === 'super_admin' && !trainingCenterId) {
            const centerResult = await query(
                `SELECT id FROM training_centers ORDER BY created_at LIMIT 1`
            );
            if (centerResult.rows.length > 0) {
                trainingCenterId = centerResult.rows[0].id;
            }
        }

        const token = generateToken({
            userId: user.id,
            trainingCenterId: trainingCenterId,
            email: user.email,
            role: user.role,
        });

        const userPublic: UserPublic = {
            id: user.id,
            email: user.email,
            full_name: user.full_name,
            role: user.role,
            training_center_id: trainingCenterId,
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

        if (user.role === 'super_admin' && !user.training_center_id) {
            const centerResult = await query(
                `SELECT id FROM training_centers ORDER BY created_at LIMIT 1`
            );
            if (centerResult.rows.length > 0) {
                user.training_center_id = centerResult.rows[0].id;
            }
        }

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

// Student Login (simple login with name, center, subject_id, group_id)
export const studentLogin = async (
    req: Request<{}, {}, { full_name: string; training_center_id: string; subject_id: string; group_id: string }>,
    res: Response<ApiResponse>,
): Promise<void> => {
    try {
        const { full_name, training_center_id, subject_id, group_id } = req.body;

        if (!full_name?.trim() || !training_center_id?.trim() || !subject_id?.trim() || !group_id?.trim()) {
            res.status(400).json({
                success: false,
                error: 'Ism, markaz, fan va guruh majburiy',
            });
            return;
        }

        // Check if training center exists
        const centerResult = await query('SELECT id FROM training_centers WHERE id = $1', [training_center_id]);
        if (centerResult.rows.length === 0) {
            res.status(400).json({
                success: false,
                error: 'O\'quv markazi topilmadi',
            });
            return;
        }

        // Fetch subject and group names
        const subjectResult = await query('SELECT name FROM subjects WHERE id = $1', [subject_id]);
        const groupResult = await query('SELECT name FROM study_groups WHERE id = $1', [group_id]);

        if (subjectResult.rows.length === 0 || groupResult.rows.length === 0) {
            res.status(400).json({
                success: false,
                error: 'Fan yoki guruh topilmadi',
            });
            return;
        }

        const subjectName = subjectResult.rows[0].name;
        const groupName = groupResult.rows[0].name;

        // Generate a simple token for student (no password required)
        const studentId = randomBytes(16).toString('hex');
        const token = generateToken({
            userId: studentId,
            trainingCenterId: training_center_id,
            email: full_name,
            role: 'student',
        });

        // Create or update student progress
        const progressResult = await query(
            `INSERT INTO student_progress (training_center_id, student_name, subject, study_group, last_accessed_at)
             VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
             ON CONFLICT (training_center_id, student_name, subject, study_group)
             DO UPDATE SET
                 last_accessed_at = CURRENT_TIMESTAMP
             RETURNING id, lesson_number, completed_lessons`,
            [training_center_id, full_name.trim(), subjectName, groupName],
        );

        const studentProgress = progressResult.rows[0];

        res.json({
            success: true,
            message: 'Muvaffaqiyatli kirildi',
            data: {
                token,
                user: {
                    id: studentId,
                    full_name: full_name.trim(),
                    role: 'student',
                    training_center_id,
                    subject: subjectName,
                    study_group: groupName,
                    progress: studentProgress,
                },
            },
        });
    } catch (error: any) {
        console.error('Student login error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Kirishda xatolik',
        });
    }
};

// Get Training Centers (for student login)
export const getTrainingCenters = async (req: Request, res: Response<ApiResponse>): Promise<void> => {
    try {
        // Faqat admin/teacher foydalanuvchisi bor training centerlarni qaytarish
        const result = await query(
            `SELECT DISTINCT tc.id, tc.name, tc.email, tc.phone 
             FROM training_centers tc
             INNER JOIN users u ON u.training_center_id = tc.id
             WHERE tc.is_active = true AND u.role IN ('admin', 'teacher') AND u.is_active = true
             ORDER BY tc.name`,
        );

        res.json({
            success: true,
            data: result.rows,
        });
    } catch (error: any) {
        console.error('Get training centers error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to get training centers',
        });
    }
};
