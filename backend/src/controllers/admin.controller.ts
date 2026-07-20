import { randomBytes } from "crypto";
import { Request, Response } from "express";
import { query } from "../config/database";
import {
    generateQuestionsFromScript,
    extractTopicsFromScript,
} from "../service/ai.service";
import { hashPassword } from "../utils/auth";
import { ApiResponse, TestBank, Question, AnswerOption } from "../types/models";
import { sendTelegramMessage } from "../service/telegram.service";

// O'quvchilarning oxirgi 24 soatdagi natijalarini olish
export const getExamResults = async (
    req: Request,
    res: Response<ApiResponse>,
): Promise<void> => {
    try {
        if (!req.user || req.user.role !== "admin") {
            res.status(401).json({ success: false, error: "Not authenticated as admin" });
            return;
        }

        const centerId = req.user.trainingCenterId;
        
        // Oxirgi 24 soatdagi ma'lumotlarni olamiz
        const result = await query(`
            SELECT id, student_name, student_email, score, passed, violation_count, has_suspicious_activity, is_ai_exam, ai_feedback, created_at, encode(final_photo_base64, 'escape') as photo_base64
            FROM exam_results 
            WHERE training_center_id = $1 
              AND created_at >= NOW() - INTERVAL '24 hours'
            ORDER BY created_at DESC
        `, [centerId]);

        res.status(200).json({
            success: true,
            data: result.rows,
        });
    } catch (error: any) {
        console.error("Get exam results error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};

const generatePassword = (length = 14): string => {
    const chars =
        "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*";
    const bytes = randomBytes(length);
    let password = "";

    for (let i = 0; i < length; i += 1) {
        password += chars[bytes[i] % chars.length];
    }

    return password;
};

const generateUniqueAdminEmail = async (fullName: string): Promise<string> => {
    const baseSlug =
        fullName
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "")
            .slice(0, 24) || "admin";
    let email = `${baseSlug}@aitest.uz`;

    let counter = 1;
    while (true) {
        const existing = await query("SELECT id FROM users WHERE email = $1", [
            email,
        ]);
        if (existing.rows.length === 0) {
            return email;
        }
        counter += 1;
        email = `${baseSlug}${counter}@aitest.uz`;
    }
};

// Create Test Bank
export const createTestBank = async (
    req: Request<
        {},
        {},
        {
            title: string;
            description?: string;
            subject?: string;
            duration_minutes?: number;
            passing_score?: number;
        }
    >,
    res: Response<ApiResponse>,
): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: "Not authenticated",
            });
            return;
        }

        const {
            title,
            description,
            subject,
            duration_minutes = 60,
            passing_score = 60,
        } = req.body;

        if (!title) {
            res.status(400).json({ success: false, error: "Title required" });
            return;
        }

        const result = await query(
            `INSERT INTO test_banks (training_center_id, title, description, subject, duration_minutes, passing_score, created_by)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING *`,
            [
                req.user.trainingCenterId,
                title,
                description || null,
                subject || null,
                duration_minutes,
                passing_score,
                req.user.userId,
            ],
        );

        res.status(201).json({
            success: true,
            message: "Test created successfully",
            data: result.rows[0],
        });
    } catch (error: any) {
        console.error("Create test error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};

export const createAdminUser = async (
    req: Request<
        {},
        {},
        {
            full_name: string;
            role?: "admin" | "teacher";
            subject?: string;
            study_group?: string;
            lesson_script?: string;
        }
    >,
    res: Response<ApiResponse>,
): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: "Not authenticated",
            });
            return;
        }

        const {
            full_name,
            role = "teacher",
            subject,
            study_group,
            lesson_script,
        } = req.body;

        if (!full_name?.trim()) {
            res.status(400).json({
                success: false,
                error: "To'liq ism majburiy",
            });
            return;
        }

        if (!["admin", "teacher"].includes(role)) {
            res.status(400).json({
                success: false,
                error: "Roli faqat admin bo'lishi kerak",
            });
            return;
        }

        // Admin uchun subject, study_group, lesson_script majburiy emas
        if (
            role === "teacher" &&
            (!subject?.trim() || !study_group?.trim() || !lesson_script?.trim())
        ) {
            res.status(400).json({
                success: false,
                error: "Teacher uchun fan, guruh va dars skripti majburiy",
            });
            return;
        }

        const centerName = full_name.trim();
        const generatedEmail = await generateUniqueAdminEmail(centerName);

        // Super_admin uchun har safar yangi o'quv markazi yaratiladi
        let trainingCenterId;
        if (req.user.role === "super_admin") {
            const centerResult = await query(
                `INSERT INTO training_centers (name, email)
                 VALUES ($1, $2)
                 ON CONFLICT (name) DO UPDATE SET email = EXCLUDED.email
                 RETURNING id`,
                [centerName, generatedEmail],
            );
            trainingCenterId = centerResult.rows[0].id;
        } else {
            trainingCenterId = req.user.trainingCenterId;
            if (!trainingCenterId) {
                // Zaxira: mavjud birinchi training center
                const centerResult = await query(
                    `SELECT id FROM training_centers ORDER BY created_at LIMIT 1`,
                );
                if (centerResult.rows.length > 0) {
                    trainingCenterId = centerResult.rows[0].id;
                } else {
                    res.status(400).json({
                        success: false,
                        error: "Training center topilmadi. Avval admin yarating.",
                    });
                    return;
                }
            }
        }

        const generatedPassword = generatePassword();
        const passwordHash = await hashPassword(generatedPassword);

        const userResult = await query(
            `INSERT INTO users (training_center_id, email, password_hash, full_name, role, subject, study_group, lesson_script)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             RETURNING id, email, full_name, role, training_center_id, subject, study_group, lesson_script`,
            [
                trainingCenterId,
                generatedEmail,
                passwordHash,
                centerName,
                role,
                subject || null,
                study_group || null,
                lesson_script || null,
            ],
        );

        const createdUser = userResult.rows[0];
        let createdTestBankId: string | null = null;

        if (lesson_script?.trim()) {
            try {
                const generatedQuestions = await generateQuestionsFromScript(
                    lesson_script,
                    subject,
                    study_group,
                );

                if (generatedQuestions?.length) {
                    const title = `${subject || "Umumiy fan"} - ${study_group || "Guruh"} dars skripti`;
                    const testResult = await query(
                        `INSERT INTO test_banks (training_center_id, title, description, subject, duration_minutes, passing_score, created_by)
                         VALUES ($1, $2, $3, $4, $5, $6, $7)
                         RETURNING id`,
                        [
                            req.user.trainingCenterId,
                            title,
                            lesson_script.slice(0, 1000),
                            subject || null,
                            60,
                            60,
                            req.user.userId,
                        ],
                    );

                    createdTestBankId = testResult.rows[0].id;

                    for (const q of generatedQuestions) {
                        const questionResult = await query(
                            `INSERT INTO questions (test_bank_id, question_text, question_type, difficulty_level, order_index)
                             VALUES ($1, $2, $3, $4, $5)
                             RETURNING id`,
                            [
                                createdTestBankId,
                                q.question_text,
                                q.question_type || "multiple_choice",
                                q.difficulty_level || "medium",
                                0,
                            ],
                        );

                        const questionId = questionResult.rows[0].id;

                        for (let i = 0; i < q.options.length; i += 1) {
                            await query(
                                `INSERT INTO answer_options (question_id, option_text, is_correct, order_index)
                                 VALUES ($1, $2, $3, $4)`,
                                [
                                    questionId,
                                    q.options[i].text,
                                    Boolean(q.options[i].isCorrect),
                                    i,
                                ],
                            );
                        }
                    }

                    await query(
                        `UPDATE test_banks SET total_questions = $1 WHERE id = $2`,
                        [generatedQuestions.length, createdTestBankId],
                    );
                }
            } catch (quizError) {
                console.error("AI generated questions failed:", quizError);
            }
        }

        res.status(201).json({
            success: true,
            message:
                "Yangi admin/teacher yaratildi. Login va parol avtomatik generatsiya qilindi.",
            data: {
                user: createdUser,
                generated_credentials: {
                    email: generatedEmail,
                    password: generatedPassword,
                },
                created_test_bank_id: createdTestBankId,
            },
        });

        // Send credentials to super_admin via Telegram
        if (
            req.user.role === "super_admin" &&
            process.env.SUPER_ADMIN_CHAT_ID
        ) {
            const telegramMessage = `
                🎉 *Yangi Admin/Teacher yaratildi!* 🎉

                👤 *To'liq ismi:* ${full_name}
                📧 *Login (Email):* ${generatedEmail}
                🔑 *Parol:* ${generatedPassword}
                📚 *Roli:* ${role}

                ⚠️ *ESLATMA:* Bu ma'lumotlarni xavfsiz joyda saqlang. Parol keyinchalik o'zgartirilishi mumkin.
            `;
            await sendTelegramMessage(
                process.env.SUPER_ADMIN_CHAT_ID,
                telegramMessage,
            );
        }
    } catch (error: any) {
        console.error("Create admin user error:", error);
        res.status(500).json({
            success: false,
            error: error.message || "Admin yaratishda xatolik",
        });
    }
};

// Get All Tests for Training Center
export const getTestBanks = async (
    req: Request,
    res: Response<ApiResponse>,
): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: "Not authenticated",
            });
            return;
        }

        const result = await query(
            `SELECT tb.*, u.full_name as created_by_name
             FROM test_banks tb
             LEFT JOIN users u ON tb.created_by = u.id
             WHERE tb.training_center_id = $1
             ORDER BY tb.created_at DESC`,
            [req.user.trainingCenterId],
        );

        res.json({
            success: true,
            data: result.rows,
        });
    } catch (error: any) {
        console.error("Get tests error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Get Single Test
export const getTestBank = async (
    req: Request<{ id: string }>,
    res: Response<ApiResponse>,
): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: "Not authenticated",
            });
            return;
        }

        const result = await query(
            `SELECT * FROM test_banks
             WHERE id = $1 AND training_center_id = $2`,
            [req.params.id, req.user.trainingCenterId],
        );

        if (result.rows.length === 0) {
            res.status(404).json({ success: false, error: "Test not found" });
            return;
        }

        res.json({
            success: true,
            data: result.rows[0],
        });
    } catch (error: any) {
        console.error("Get test error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Update Test Bank
export const updateTestBank = async (
    req: Request<{ id: string }, {}, Partial<TestBank>>,
    res: Response<ApiResponse>,
): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: "Not authenticated",
            });
            return;
        }

        const {
            title,
            description,
            subject,
            duration_minutes,
            passing_score,
            is_published,
        } = req.body;

        const result = await query(
            `UPDATE test_banks
             SET title = COALESCE($1, title),
                 description = COALESCE($2, description),
                 subject = COALESCE($3, subject),
                 duration_minutes = COALESCE($4, duration_minutes),
                 passing_score = COALESCE($5, passing_score),
                 is_published = COALESCE($6, is_published),
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $7 AND training_center_id = $8
             RETURNING *`,
            [
                title,
                description,
                subject,
                duration_minutes,
                passing_score,
                is_published,
                req.params.id,
                req.user.trainingCenterId,
            ],
        );

        if (result.rows.length === 0) {
            res.status(404).json({ success: false, error: "Test not found" });
            return;
        }

        res.json({
            success: true,
            message: "Test updated successfully",
            data: result.rows[0],
        });
    } catch (error: any) {
        console.error("Update test error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Delete Test Bank
export const deleteTestBank = async (
    req: Request<{ id: string }>,
    res: Response<ApiResponse>,
): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: "Not authenticated",
            });
            return;
        }

        const result = await query(
            `DELETE FROM test_banks
             WHERE id = $1 AND training_center_id = $2
             RETURNING id`,
            [req.params.id, req.user.trainingCenterId],
        );

        if (result.rows.length === 0) {
            res.status(404).json({ success: false, error: "Test not found" });
            return;
        }

        res.json({
            success: true,
            message: "Test deleted successfully",
        });
    } catch (error: any) {
        console.error("Delete test error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// ========== SUBJECTS (Fanlar) ==========

export const createSubject = async (
    req: Request<{}, {}, { name: string; description?: string }>,
    res: Response<ApiResponse>,
): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: "Not authenticated",
            });
            return;
        }

        const { name, description } = req.body;

        if (!name?.trim()) {
            res.status(400).json({
                success: false,
                error: "Fan nomi majburiy",
            });
            return;
        }

        const result = await query(
            `INSERT INTO subjects (training_center_id, name, description)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [req.user.trainingCenterId, name.trim(), description || null],
        );

        res.status(201).json({
            success: true,
            message: "Fan yaratildi",
            data: result.rows[0],
        });
    } catch (error: any) {
        console.error("Create subject error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};

export const getSubjects = async (
    req: Request,
    res: Response<ApiResponse>,
): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: "Not authenticated",
            });
            return;
        }

        const result = await query(
            `SELECT * FROM subjects
             WHERE training_center_id = $1
             ORDER BY created_at DESC`,
            [req.user.trainingCenterId],
        );

        res.json({
            success: true,
            data: result.rows,
        });
    } catch (error: any) {
        console.error("Get subjects error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};

export const updateSubject = async (
    req: Request<
        { id: string },
        {},
        { name?: string; description?: string; is_active?: boolean }
    >,
    res: Response<ApiResponse>,
): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: "Not authenticated",
            });
            return;
        }

        const { name, description, is_active } = req.body;

        const result = await query(
            `UPDATE subjects
             SET name = COALESCE($1, name),
                 description = COALESCE($2, description),
                 is_active = COALESCE($3, is_active),
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $4 AND training_center_id = $5
             RETURNING *`,
            [
                name,
                description,
                is_active,
                req.params.id,
                req.user.trainingCenterId,
            ],
        );

        if (result.rows.length === 0) {
            res.status(404).json({ success: false, error: "Fan topilmadi" });
            return;
        }

        res.json({
            success: true,
            message: "Fan yangilandi",
            data: result.rows[0],
        });
    } catch (error: any) {
        console.error("Update subject error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};

export const deleteSubject = async (
    req: Request<{ id: string }>,
    res: Response<ApiResponse>,
): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: "Not authenticated",
            });
            return;
        }

        const result = await query(
            `DELETE FROM subjects
             WHERE id = $1 AND training_center_id = $2
             RETURNING id`,
            [req.params.id, req.user.trainingCenterId],
        );

        if (result.rows.length === 0) {
            res.status(404).json({ success: false, error: "Fan topilmadi" });
            return;
        }

        res.json({
            success: true,
            message: "Fan o'chirildi",
        });
    } catch (error: any) {
        console.error("Delete subject error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// ========== STUDY GROUPS (Guruhlar) ==========

export const createGroup = async (
    req: Request<{}, {}, { name: string; description?: string }>,
    res: Response<ApiResponse>,
): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: "Not authenticated",
            });
            return;
        }

        const { name, description } = req.body;

        if (!name?.trim()) {
            res.status(400).json({
                success: false,
                error: "Guruh nomi majburiy",
            });
            return;
        }

        const result = await query(
            `INSERT INTO study_groups (training_center_id, name, description)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [req.user.trainingCenterId, name.trim(), description || null],
        );

        res.status(201).json({
            success: true,
            message: "Guruh yaratildi",
            data: result.rows[0],
        });
    } catch (error: any) {
        console.error("Create group error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};

export const getGroups = async (
    req: Request,
    res: Response<ApiResponse>,
): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: "Not authenticated",
            });
            return;
        }

        const result = await query(
            `SELECT * FROM study_groups
             WHERE training_center_id = $1
             ORDER BY created_at DESC`,
            [req.user.trainingCenterId],
        );

        res.json({
            success: true,
            data: result.rows,
        });
    } catch (error: any) {
        console.error("Get groups error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};

export const updateGroup = async (
    req: Request<
        { id: string },
        {},
        { name?: string; description?: string; is_active?: boolean }
    >,
    res: Response<ApiResponse>,
): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: "Not authenticated",
            });
            return;
        }

        const { name, description, is_active } = req.body;

        const result = await query(
            `UPDATE study_groups
             SET name = COALESCE($1, name),
                 description = COALESCE($2, description),
                 is_active = COALESCE($3, is_active),
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $4 AND training_center_id = $5
             RETURNING *`,
            [
                name,
                description,
                is_active,
                req.params.id,
                req.user.trainingCenterId,
            ],
        );

        if (result.rows.length === 0) {
            res.status(404).json({ success: false, error: "Guruh topilmadi" });
            return;
        }

        res.json({
            success: true,
            message: "Guruh yangilandi",
            data: result.rows[0],
        });
    } catch (error: any) {
        console.error("Update group error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};

export const deleteGroup = async (
    req: Request<{ id: string }>,
    res: Response<ApiResponse>,
): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: "Not authenticated",
            });
            return;
        }

        const result = await query(
            `DELETE FROM study_groups
             WHERE id = $1 AND training_center_id = $2
             RETURNING id`,
            [req.params.id, req.user.trainingCenterId],
        );

        if (result.rows.length === 0) {
            res.status(404).json({ success: false, error: "Guruh topilmadi" });
            return;
        }

        res.json({
            success: true,
            message: "Guruh o'chirildi",
        });
    } catch (error: any) {
        console.error("Delete group error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// ========== SUBJECT-GROUP RELATIONSHIPS (Fan-Guruh bog'lanishi) ==========

export const linkSubjectGroup = async (
    req: Request<{}, {}, { subject_id: string; group_id: string }>,
    res: Response<ApiResponse>,
): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: "Not authenticated",
            });
            return;
        }

        const { subject_id, group_id } = req.body;

        if (!subject_id?.trim() || !group_id?.trim()) {
            res.status(400).json({
                success: false,
                error: "Fan va guruh majburiy",
            });
            return;
        }

        const result = await query(
            `INSERT INTO subject_groups (subject_id, group_id)
             VALUES ($1, $2)
             RETURNING *`,
            [subject_id, group_id],
        );

        res.status(201).json({
            success: true,
            message: "Fan va guruh bog'landi",
            data: result.rows[0],
        });
    } catch (error: any) {
        if (error.code === "23505") {
            res.status(400).json({
                success: false,
                error: "Bu bog'lanish allaqachon mavjud",
            });
            return;
        }
        console.error("Link subject group error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};

export const unlinkSubjectGroup = async (
    req: Request<{ id: string }>,
    res: Response<ApiResponse>,
): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: "Not authenticated",
            });
            return;
        }

        const result = await query(
            `DELETE FROM subject_groups WHERE id = $1 RETURNING *`,
            [req.params.id],
        );

        if (result.rows.length === 0) {
            res.status(404).json({
                success: false,
                error: "Bog'lanish topilmadi",
            });
            return;
        }

        res.json({
            success: true,
            message: "Fan va guruh bog'lanishi o'chirildi",
        });
    } catch (error: any) {
        console.error("Unlink subject group error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};

export const getSubjectGroups = async (
    req: Request,
    res: Response<ApiResponse>,
): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: "Not authenticated",
            });
            return;
        }

        const result = await query(
            `SELECT sg.*, s.name as subject_name, g.name as group_name
             FROM subject_groups sg
             JOIN subjects s ON sg.subject_id = s.id
             JOIN study_groups g ON sg.group_id = g.id
             WHERE s.training_center_id = $1
             ORDER BY s.name, g.name`,
            [req.user.trainingCenterId],
        );

        res.json({
            success: true,
            data: result.rows,
        });
    } catch (error: any) {
        console.error("Get subject groups error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// ========== LESSON SCRIPTS (Dars skriptlari) ==========

export const createLessonScript = async (
    req: Request<
        {},
        {},
        {
            subject_id: string;
            group_ids?: string[];
            title?: string;
            content: string;
        }
    >,
    res: Response<ApiResponse>,
): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: "Not authenticated",
            });
            return;
        }

        const { subject_id, group_ids, title, content } = req.body;

        if (!subject_id?.trim() || !content?.trim()) {
            res.status(400).json({
                success: false,
                error: "Fan va kontent majburiy",
            });
            return;
        }

        const topics = await extractTopicsFromScript(content);
        const topicsJson = JSON.stringify(topics);

        // Agar group_ids berilgan bo'lsa, har bir guruh uchun alohida lesson script yaratish
        if (group_ids?.length) {
            const createdScripts = [];
            for (const group_id of group_ids) {
                const result = await query(
                    `INSERT INTO lesson_scripts (training_center_id, subject_id, group_id, title, content, topics, created_by)
                     VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7)
                     RETURNING *`,
                    [
                        req.user.trainingCenterId,
                        subject_id,
                        group_id,
                        title?.trim() || null,
                        content.trim(),
                        topicsJson,
                        req.user.userId,
                    ],
                );
                createdScripts.push(result.rows[0]);
            }

            res.status(201).json({
                success: true,
                message: `${createdScripts.length} ta dars skripti saqlandi`,
                data: createdScripts,
            });
        } else {
            // Group berilmagan bo'lsa, fan uchun umumiy lesson script yaratish
            const result = await query(
                `INSERT INTO lesson_scripts (training_center_id, subject_id, group_id, title, content, topics, created_by)
                 VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7)
                 RETURNING *`,
                [
                    req.user.trainingCenterId,
                    subject_id,
                    null,
                    title?.trim() || null,
                    content.trim(),
                    topicsJson,
                    req.user.userId,
                ],
            );

            res.status(201).json({
                success: true,
                message: "Dars skripti saqlandi",
                data: result.rows[0],
            });
        }
    } catch (error: any) {
        console.error("Create lesson script error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Dars skriptidan AI savollar generatsiya qilish
export const generateQuestionsFromLessonScript = async (
    req: Request<{ id: string }>,
    res: Response<ApiResponse>,
): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: "Not authenticated",
            });
            return;
        }

        const scriptResult = await query(
            `SELECT ls.*, s.name as subject_name, g.name as group_name
             FROM lesson_scripts ls
             JOIN subjects s ON ls.subject_id = s.id
             JOIN study_groups g ON ls.group_id = g.id
             WHERE ls.id = $1 AND ls.training_center_id = $2`,
            [req.params.id, req.user.trainingCenterId],
        );

        if (scriptResult.rows.length === 0) {
            res.status(404).json({
                success: false,
                error: "Dars skripti topilmadi",
            });
            return;
        }

        const lessonScript = scriptResult.rows[0];

        if (lessonScript.test_bank_id) {
            res.status(400).json({
                success: false,
                error: "Bu dars skripti uchun allaqachon test yaratilgan",
            });
            return;
        }

        const subjectName = lessonScript.subject_name || "Fan";
        const groupName = lessonScript.group_name || "Guruh";

        const generatedQuestions = await generateQuestionsFromScript(
            lessonScript.content,
            subjectName,
            groupName,
        );

        if (!generatedQuestions?.length) {
            res.status(500).json({
                success: false,
                error: "AI savollar generatsiya qilmadi",
            });
            return;
        }

        const testTitle = `${subjectName} - ${groupName} - ${lessonScript.title}`;
        const testResult = await query(
            `INSERT INTO test_banks (training_center_id, title, description, subject, duration_minutes, passing_score, created_by)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING id`,
            [
                req.user.trainingCenterId,
                testTitle,
                lessonScript.content.slice(0, 1000),
                subjectName,
                60,
                60,
                req.user.userId,
            ],
        );

        const testBankId = testResult.rows[0].id;

        for (const q of generatedQuestions) {
            const questionResult = await query(
                `INSERT INTO questions (test_bank_id, question_text, question_type, difficulty_level, order_index)
                 VALUES ($1, $2, $3, $4, $5)
                 RETURNING id`,
                [
                    testBankId,
                    q.question_text,
                    q.question_type || "multiple_choice",
                    q.difficulty_level || "medium",
                    0,
                ],
            );

            const questionId = questionResult.rows[0].id;

            for (let i = 0; i < q.options.length; i++) {
                await query(
                    `INSERT INTO answer_options (question_id, option_text, is_correct, order_index)
                     VALUES ($1, $2, $3, $4)`,
                    [
                        questionId,
                        q.options[i].text,
                        Boolean(q.options[i].isCorrect),
                        i,
                    ],
                );
            }
        }

        await query(
            `UPDATE test_banks SET total_questions = $1 WHERE id = $2`,
            [generatedQuestions.length, testBankId],
        );
        await query(
            `UPDATE lesson_scripts SET test_bank_id = $1 WHERE id = $2`,
            [testBankId, lessonScript.id],
        );

        res.json({
            success: true,
            message: `${generatedQuestions.length} ta savol generatsiya qilindi`,
            data: {
                test_bank_id: testBankId,
                questions_count: generatedQuestions.length,
            },
        });
    } catch (error: any) {
        console.error("Generate questions error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};

export const getLessonScripts = async (
    req: Request,
    res: Response<ApiResponse>,
): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: "Not authenticated",
            });
            return;
        }

        const result = await query(
            `SELECT ls.*, s.name as subject_name, g.name as group_name, u.full_name as created_by_name
             FROM lesson_scripts ls
             LEFT JOIN subjects s ON ls.subject_id = s.id
             LEFT JOIN study_groups g ON ls.group_id = g.id
             LEFT JOIN users u ON ls.created_by = u.id
             WHERE ls.training_center_id = $1
             ORDER BY ls.created_at DESC`,
            [req.user.trainingCenterId],
        );

        res.json({
            success: true,
            data: result.rows,
        });
    } catch (error: any) {
        console.error("Get lesson scripts error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};

export const deleteLessonScript = async (
    req: Request<{ id: string }>,
    res: Response<ApiResponse>,
): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: "Not authenticated",
            });
            return;
        }

        const result = await query(
            `DELETE FROM lesson_scripts
             WHERE id = $1 AND training_center_id = $2
             RETURNING id`,
            [req.params.id, req.user.trainingCenterId],
        );

        if (result.rows.length === 0) {
            res.status(404).json({
                success: false,
                error: "Dars skripti topilmadi",
            });
            return;
        }

        res.json({
            success: true,
            message: "Dars skripti o'chirildi",
        });
    } catch (error: any) {
        console.error("Delete lesson script error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// ========== STUDENT PROGRESS (O'quvchilarning dars darajasi) ==========

export const getStudentProgress = async (
    req: Request,
    res: Response<ApiResponse>,
): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: "Not authenticated",
            });
            return;
        }

        const result = await query(
            `SELECT sp.*,
                    (SELECT ls.title FROM lesson_scripts ls
                     JOIN subjects s ON ls.subject_id = s.id
                     WHERE s.name = sp.subject
                     AND (ls.group_id IS NULL OR ls.group_id = (SELECT id FROM study_groups WHERE name = sp.study_group LIMIT 1))
                     AND ls.training_center_id = $1
                     ORDER BY ls.created_at DESC LIMIT 1) as lesson_script_title,
                    (SELECT ls.content FROM lesson_scripts ls
                     JOIN subjects s ON ls.subject_id = s.id
                     WHERE s.name = sp.subject
                     AND (ls.group_id IS NULL OR ls.group_id = (SELECT id FROM study_groups WHERE name = sp.study_group LIMIT 1))
                     AND ls.training_center_id = $1
                     ORDER BY ls.created_at DESC LIMIT 1) as lesson_script_content
             FROM student_progress sp
             WHERE sp.training_center_id = $1
             ORDER BY sp.last_accessed_at DESC`,
            [req.user.trainingCenterId],
        );

        res.json({
            success: true,
            data: result.rows,
        });
    } catch (error: any) {
        console.error("Get student progress error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// ========== USERS (Adminlar ro'yxati) ==========

export const getUsers = async (
    req: Request,
    res: Response<ApiResponse>,
): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: "Not authenticated",
            });
            return;
        }

        // Super admin barcha adminlarni ko'radi
        let result;
        if (req.user.role === "super_admin") {
            result = await query(
                `SELECT id, email, full_name, role, subject, study_group, is_active, created_at
                 FROM users
                 WHERE role IN ('admin', 'teacher')
                 ORDER BY created_at DESC`,
            );
        } else {
            result = await query(
                `SELECT id, email, full_name, role, subject, study_group, is_active, created_at
                 FROM users
                 WHERE training_center_id = $1
                 ORDER BY created_at DESC`,
                [req.user.trainingCenterId],
            );
        }

        res.json({
            success: true,
            data: result.rows,
        });
    } catch (error: any) {
        console.error("Get users error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};

export const deleteUser = async (
    req: Request<{ id: string }>,
    res: Response<ApiResponse>,
): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: "Not authenticated",
            });
            return;
        }

        // Super admin o'zini o'chira olmaydi
        if (req.params.id === req.user.userId) {
            res.status(400).json({
                success: false,
                error: "O'zingizni o'chira olmaysiz",
            });
            return;
        }

        let result;
        if (req.user.role === "super_admin") {
            // Super_admin barcha adminlarni o'chira oladi
            result = await query(
                `DELETE FROM users
                 WHERE id = $1 AND role IN ('admin', 'teacher')
                 RETURNING id`,
                [req.params.id],
            );
        } else {
            // Admin faqat o'z training_center_id dagi foydalanuvchilarni o'chira oladi
            result = await query(
                `DELETE FROM users
                 WHERE id = $1 AND training_center_id = $2 AND role != 'super_admin'
                 RETURNING id`,
                [req.params.id, req.user.trainingCenterId],
            );
        }

        if (result.rows.length === 0) {
            res.status(404).json({
                success: false,
                error: "Foydalanuvchi topilmadi yoki o'chirib bo'lmaydi",
            });
            return;
        }

        res.json({
            success: true,
            message: "Foydalanuvchi o'chirildi",
        });
    } catch (error: any) {
        console.error("Delete user error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Barcha adminlarni o'chirish (super_admin uchun)
export const deleteAllAdmins = async (
    req: Request,
    res: Response<ApiResponse>,
): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: "Not authenticated",
            });
            return;
        }

        if (req.user.role !== "super_admin") {
            res.status(403).json({
                success: false,
                error: "Faqat super_admin barcha adminlarni o'chira oladi",
            });
            return;
        }

        const result = await query(
            `DELETE FROM users
             WHERE role IN ('admin', 'teacher')
             RETURNING id`,
        );

        res.json({
            success: true,
            message: `${result.rows.length} ta admin o\'chirildi`,
            data: { deleted_count: result.rows.length },
        });
    } catch (error: any) {
        console.error("Delete all admins error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Admin parolini reset qilish
export const resetAdminPassword = async (
    req: Request<{ id: string }>,
    res: Response<ApiResponse>,
): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: "Not authenticated",
            });
            return;
        }

        if (req.user.role !== "super_admin") {
            res.status(403).json({
                success: false,
                error: "Faqat super_admin parolni o'zgartira oladi",
            });
            return;
        }

        const newPassword = generatePassword();
        const passwordHash = await hashPassword(newPassword);

        const result = await query(
            `UPDATE users
             SET password_hash = $1
             WHERE id = $2 AND role IN ('admin', 'teacher')
             RETURNING id, email, full_name`,
            [passwordHash, req.params.id],
        );

        if (result.rows.length === 0) {
            res.status(404).json({ success: false, error: "Admin topilmadi" });
            return;
        }

        res.json({
            success: true,
            message: "Parol o'zgartirildi",
            data: {
                user: result.rows[0],
                new_password: newPassword,
            },
        });
    } catch (error: any) {
        console.error("Reset password error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// ========== QUESTIONS ==========

// Create Question
export const createQuestion = async (
    req: Request<
        { testId: string },
        {},
        {
            question_text: string;
            question_type?: string;
            difficulty_level?: string;
            options: { text: string; isCorrect: boolean }[];
        }
    >,
    res: Response<ApiResponse>,
): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: "Not authenticated",
            });
            return;
        }

        const {
            question_text,
            question_type = "multiple_choice",
            difficulty_level = "medium",
            options,
        } = req.body;

        if (!question_text || !Array.isArray(options) || options.length === 0) {
            res.status(400).json({
                success: false,
                error: "Question text and options required",
            });
            return;
        }

        // Verify test belongs to training center
        const testResult = await query(
            `SELECT id FROM test_banks WHERE id = $1 AND training_center_id = $2`,
            [req.params.testId, req.user.trainingCenterId],
        );

        if (testResult.rows.length === 0) {
            res.status(404).json({ success: false, error: "Test not found" });
            return;
        }

        // Get max order index
        const orderResult = await query(
            `SELECT MAX(order_index) as max_order FROM questions WHERE test_bank_id = $1`,
            [req.params.testId],
        );
        const nextOrder = (orderResult.rows[0].max_order || 0) + 1;

        // Create question
        const questionResult = await query(
            `INSERT INTO questions (test_bank_id, question_text, question_type, difficulty_level, order_index)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [
                req.params.testId,
                question_text,
                question_type,
                difficulty_level,
                nextOrder,
            ],
        );

        const questionId = questionResult.rows[0].id;

        // Create answer options
        const optionsData = [];
        for (let i = 0; i < options.length; i++) {
            const optionResult = await query(
                `INSERT INTO answer_options (question_id, option_text, is_correct, order_index)
                 VALUES ($1, $2, $3, $4)
                 RETURNING *`,
                [questionId, options[i].text, options[i].isCorrect, i],
            );
            optionsData.push(optionResult.rows[0]);
        }

        // Update test total questions count
        await query(
            `UPDATE test_banks SET total_questions = total_questions + 1 WHERE id = $1`,
            [req.params.testId],
        );

        res.status(201).json({
            success: true,
            message: "Question created successfully",
            data: {
                ...questionResult.rows[0],
                options: optionsData,
            },
        });
    } catch (error: any) {
        console.error("Create question error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Get Questions for Test
export const getQuestions = async (
    req: Request<{ testId: string }>,
    res: Response<ApiResponse>,
): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: "Not authenticated",
            });
            return;
        }

        // Verify test belongs to training center
        const testResult = await query(
            `SELECT id FROM test_banks WHERE id = $1 AND training_center_id = $2`,
            [req.params.testId, req.user.trainingCenterId],
        );

        if (testResult.rows.length === 0) {
            res.status(404).json({ success: false, error: "Test not found" });
            return;
        }

        // Get questions with options
        const questionsResult = await query(
            `SELECT * FROM questions WHERE test_bank_id = $1 ORDER BY order_index`,
            [req.params.testId],
        );

        const questions = [];
        for (const question of questionsResult.rows) {
            const optionsResult = await query(
                `SELECT * FROM answer_options WHERE question_id = $1 ORDER BY order_index`,
                [question.id],
            );
            questions.push({
                ...question,
                options: optionsResult.rows,
            });
        }

        res.json({
            success: true,
            data: questions,
        });
    } catch (error: any) {
        console.error("Get questions error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Update Question
export const updateQuestion = async (
    req: Request<{ testId: string; questionId: string }, {}, any>,
    res: Response<ApiResponse>,
): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: "Not authenticated",
            });
            return;
        }

        const { question_text, difficulty_level, options } = req.body;

        // Verify test and question
        const testResult = await query(
            `SELECT q.id FROM questions q
             JOIN test_banks tb ON q.test_bank_id = tb.id
             WHERE q.id = $1 AND q.test_bank_id = $2 AND tb.training_center_id = $3`,
            [
                req.params.questionId,
                req.params.testId,
                req.user.trainingCenterId,
            ],
        );

        if (testResult.rows.length === 0) {
            res.status(404).json({
                success: false,
                error: "Question not found",
            });
            return;
        }

        // Update question
        const result = await query(
            `UPDATE questions
             SET question_text = COALESCE($1, question_text),
                 difficulty_level = COALESCE($2, difficulty_level),
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $3
             RETURNING *`,
            [question_text, difficulty_level, req.params.questionId],
        );

        // Update options if provided
        if (Array.isArray(options)) {
            await query(`DELETE FROM answer_options WHERE question_id = $1`, [
                req.params.questionId,
            ]);
            for (let i = 0; i < options.length; i++) {
                await query(
                    `INSERT INTO answer_options (question_id, option_text, is_correct, order_index)
                     VALUES ($1, $2, $3, $4)`,
                    [
                        req.params.questionId,
                        options[i].text,
                        options[i].isCorrect,
                        i,
                    ],
                );
            }
        }

        res.json({
            success: true,
            message: "Question updated successfully",
            data: result.rows[0],
        });
    } catch (error: any) {
        console.error("Update question error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Delete Question
export const deleteQuestion = async (
    req: Request<{ testId: string; questionId: string }>,
    res: Response<ApiResponse>,
): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: "Not authenticated",
            });
            return;
        }

        // Verify test and question
        const testResult = await query(
            `SELECT q.id FROM questions q
             JOIN test_banks tb ON q.test_bank_id = tb.id
             WHERE q.id = $1 AND q.test_bank_id = $2 AND tb.training_center_id = $3`,
            [
                req.params.questionId,
                req.params.testId,
                req.user.trainingCenterId,
            ],
        );

        if (testResult.rows.length === 0) {
            res.status(404).json({
                success: false,
                error: "Question not found",
            });
            return;
        }

        // Delete question
        await query(`DELETE FROM questions WHERE id = $1`, [
            req.params.questionId,
        ]);

        // Update test total questions count
        await query(
            `UPDATE test_banks SET total_questions = total_questions - 1 WHERE id = $1`,
            [req.params.testId],
        );

        res.json({
            success: true,
            message: "Question deleted successfully",
        });
    } catch (error: any) {
        console.error("Delete question error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};
