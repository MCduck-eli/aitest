import { randomBytes } from 'crypto';
import { Request, Response } from 'express';
import { query } from '../config/database';
import { generateQuestionsFromScript } from '../service/ai.service';
import { hashPassword } from '../utils/auth';
import { ApiResponse, TestBank, Question, AnswerOption } from '../types/models';

const generatePassword = (length = 14): string => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*';
    const bytes = randomBytes(length);
    let password = '';

    for (let i = 0; i < length; i += 1) {
        password += chars[bytes[i] % chars.length];
    }

    return password;
};

const generateUniqueAdminEmail = async (fullName: string): Promise<string> => {
    const baseSlug = fullName.toLowerCase().replace(/[^a-z0-9]+/g, '').slice(0, 24) || 'admin';
    let email = `${baseSlug}@aitest.uz`;

    let counter = 1;
    while (true) {
        const existing = await query('SELECT id FROM users WHERE email = $1', [email]);
        if (existing.rows.length === 0) {
            return email;
        }
        counter += 1;
        email = `${baseSlug}${counter}@aitest.uz`;
    }
};

// Create Test Bank
export const createTestBank = async (
    req: Request<{}, {}, { title: string; description?: string; subject?: string; duration_minutes?: number; passing_score?: number }>,
    res: Response<ApiResponse>,
): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, error: 'Not authenticated' });
            return;
        }

        const { title, description, subject, duration_minutes = 60, passing_score = 60 } = req.body;

        if (!title) {
            res.status(400).json({ success: false, error: 'Title required' });
            return;
        }

        const result = await query(
            `INSERT INTO test_banks (training_center_id, title, description, subject, duration_minutes, passing_score, created_by)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING *`,
            [req.user.trainingCenterId, title, description || null, subject || null, duration_minutes, passing_score, req.user.userId],
        );

        res.status(201).json({
            success: true,
            message: 'Test created successfully',
            data: result.rows[0],
        });
    } catch (error: any) {
        console.error('Create test error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

export const createAdminUser = async (
    req: Request<{}, {}, { full_name: string; role?: 'admin' | 'teacher'; subject?: string; study_group?: string; lesson_script?: string }>,
    res: Response<ApiResponse>,
): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, error: 'Not authenticated' });
            return;
        }

        const { full_name, role = 'teacher', subject, study_group, lesson_script } = req.body;

        if (!full_name?.trim()) {
            res.status(400).json({ success: false, error: 'To\'liq ism majburiy' });
            return;
        }

        if (!['admin', 'teacher'].includes(role)) {
            res.status(400).json({ success: false, error: 'Roli faqat admin yoki teacher bo\'lishi kerak' });
            return;
        }

        if (role === 'teacher' && (!subject?.trim() || !study_group?.trim() || !lesson_script?.trim())) {
            res.status(400).json({ success: false, error: 'Teacher uchun fan, guruh va dars skripti majburiy' });
            return;
        }

        const generatedEmail = await generateUniqueAdminEmail(full_name);
        const generatedPassword = generatePassword();
        const passwordHash = await hashPassword(generatedPassword);

        const userResult = await query(
            `INSERT INTO users (training_center_id, email, password_hash, full_name, role, subject, study_group, lesson_script)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             RETURNING id, email, full_name, role, training_center_id, subject, study_group, lesson_script`,
            [req.user.trainingCenterId, generatedEmail, passwordHash, full_name.trim(), role, subject || null, study_group || null, lesson_script || null],
        );

        const createdUser = userResult.rows[0];
        let createdTestBankId: string | null = null;

        if (lesson_script?.trim()) {
            try {
                const generatedQuestions = await generateQuestionsFromScript(lesson_script, subject, study_group);

                if (generatedQuestions?.length) {
                    const title = `${subject || 'Umumiy fan'} - ${study_group || 'Guruh'} dars skripti`;
                    const testResult = await query(
                        `INSERT INTO test_banks (training_center_id, title, description, subject, duration_minutes, passing_score, created_by)
                         VALUES ($1, $2, $3, $4, $5, $6, $7)
                         RETURNING id`,
                        [req.user.trainingCenterId, title, lesson_script.slice(0, 1000), subject || null, 60, 60, req.user.userId],
                    );

                    createdTestBankId = testResult.rows[0].id;

                    for (const q of generatedQuestions) {
                        const questionResult = await query(
                            `INSERT INTO questions (test_bank_id, question_text, question_type, difficulty_level, order_index)
                             VALUES ($1, $2, $3, $4, $5)
                             RETURNING id`,
                            [createdTestBankId, q.question_text, q.question_type || 'multiple_choice', q.difficulty_level || 'medium', 0],
                        );

                        const questionId = questionResult.rows[0].id;

                        for (let i = 0; i < q.options.length; i += 1) {
                            await query(
                                `INSERT INTO answer_options (question_id, option_text, is_correct, order_index)
                                 VALUES ($1, $2, $3, $4)`,
                                [questionId, q.options[i].text, Boolean(q.options[i].isCorrect), i],
                            );
                        }
                    }

                    await query(`UPDATE test_banks SET total_questions = $1 WHERE id = $2`, [generatedQuestions.length, createdTestBankId]);
                }
            } catch (quizError) {
                console.error('AI generated questions failed:', quizError);
            }
        }

        res.status(201).json({
            success: true,
            message: 'Yangi admin/teacher yaratildi. Login va parol avtomatik generatsiya qilindi.',
            data: {
                user: createdUser,
                generated_credentials: {
                    email: generatedEmail,
                    password: generatedPassword,
                },
                created_test_bank_id: createdTestBankId,
            },
        });
    } catch (error: any) {
        console.error('Create admin user error:', error);
        res.status(500).json({ success: false, error: error.message || 'Admin yaratishda xatolik' });
    }
};

// Get All Tests for Training Center
export const getTestBanks = async (req: Request, res: Response<ApiResponse>): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, error: 'Not authenticated' });
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
        console.error('Get tests error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Get Single Test
export const getTestBank = async (req: Request<{ id: string }>, res: Response<ApiResponse>): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, error: 'Not authenticated' });
            return;
        }

        const result = await query(
            `SELECT * FROM test_banks
             WHERE id = $1 AND training_center_id = $2`,
            [req.params.id, req.user.trainingCenterId],
        );

        if (result.rows.length === 0) {
            res.status(404).json({ success: false, error: 'Test not found' });
            return;
        }

        res.json({
            success: true,
            data: result.rows[0],
        });
    } catch (error: any) {
        console.error('Get test error:', error);
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
            res.status(401).json({ success: false, error: 'Not authenticated' });
            return;
        }

        const { title, description, subject, duration_minutes, passing_score, is_published } = req.body;

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
            [title, description, subject, duration_minutes, passing_score, is_published, req.params.id, req.user.trainingCenterId],
        );

        if (result.rows.length === 0) {
            res.status(404).json({ success: false, error: 'Test not found' });
            return;
        }

        res.json({
            success: true,
            message: 'Test updated successfully',
            data: result.rows[0],
        });
    } catch (error: any) {
        console.error('Update test error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Delete Test Bank
export const deleteTestBank = async (req: Request<{ id: string }>, res: Response<ApiResponse>): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, error: 'Not authenticated' });
            return;
        }

        const result = await query(
            `DELETE FROM test_banks
             WHERE id = $1 AND training_center_id = $2
             RETURNING id`,
            [req.params.id, req.user.trainingCenterId],
        );

        if (result.rows.length === 0) {
            res.status(404).json({ success: false, error: 'Test not found' });
            return;
        }

        res.json({
            success: true,
            message: 'Test deleted successfully',
        });
    } catch (error: any) {
        console.error('Delete test error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// ========== QUESTIONS ==========

// Create Question
export const createQuestion = async (
    req: Request<
        { testId: string },
        {},
        { question_text: string; question_type?: string; difficulty_level?: string; options: { text: string; isCorrect: boolean }[] }
    >,
    res: Response<ApiResponse>,
): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, error: 'Not authenticated' });
            return;
        }

        const { question_text, question_type = 'multiple_choice', difficulty_level = 'medium', options } = req.body;

        if (!question_text || !Array.isArray(options) || options.length === 0) {
            res.status(400).json({ success: false, error: 'Question text and options required' });
            return;
        }

        // Verify test belongs to training center
        const testResult = await query(
            `SELECT id FROM test_banks WHERE id = $1 AND training_center_id = $2`,
            [req.params.testId, req.user.trainingCenterId],
        );

        if (testResult.rows.length === 0) {
            res.status(404).json({ success: false, error: 'Test not found' });
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
            [req.params.testId, question_text, question_type, difficulty_level, nextOrder],
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
            message: 'Question created successfully',
            data: {
                ...questionResult.rows[0],
                options: optionsData,
            },
        });
    } catch (error: any) {
        console.error('Create question error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Get Questions for Test
export const getQuestions = async (req: Request<{ testId: string }>, res: Response<ApiResponse>): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, error: 'Not authenticated' });
            return;
        }

        // Verify test belongs to training center
        const testResult = await query(
            `SELECT id FROM test_banks WHERE id = $1 AND training_center_id = $2`,
            [req.params.testId, req.user.trainingCenterId],
        );

        if (testResult.rows.length === 0) {
            res.status(404).json({ success: false, error: 'Test not found' });
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
        console.error('Get questions error:', error);
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
            res.status(401).json({ success: false, error: 'Not authenticated' });
            return;
        }

        const { question_text, difficulty_level, options } = req.body;

        // Verify test and question
        const testResult = await query(
            `SELECT q.id FROM questions q
             JOIN test_banks tb ON q.test_bank_id = tb.id
             WHERE q.id = $1 AND q.test_bank_id = $2 AND tb.training_center_id = $3`,
            [req.params.questionId, req.params.testId, req.user.trainingCenterId],
        );

        if (testResult.rows.length === 0) {
            res.status(404).json({ success: false, error: 'Question not found' });
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
            await query(`DELETE FROM answer_options WHERE question_id = $1`, [req.params.questionId]);
            for (let i = 0; i < options.length; i++) {
                await query(
                    `INSERT INTO answer_options (question_id, option_text, is_correct, order_index)
                     VALUES ($1, $2, $3, $4)`,
                    [req.params.questionId, options[i].text, options[i].isCorrect, i],
                );
            }
        }

        res.json({
            success: true,
            message: 'Question updated successfully',
            data: result.rows[0],
        });
    } catch (error: any) {
        console.error('Update question error:', error);
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
            res.status(401).json({ success: false, error: 'Not authenticated' });
            return;
        }

        // Verify test and question
        const testResult = await query(
            `SELECT q.id FROM questions q
             JOIN test_banks tb ON q.test_bank_id = tb.id
             WHERE q.id = $1 AND q.test_bank_id = $2 AND tb.training_center_id = $3`,
            [req.params.questionId, req.params.testId, req.user.trainingCenterId],
        );

        if (testResult.rows.length === 0) {
            res.status(404).json({ success: false, error: 'Question not found' });
            return;
        }

        // Delete question
        await query(`DELETE FROM questions WHERE id = $1`, [req.params.questionId]);

        // Update test total questions count
        await query(
            `UPDATE test_banks SET total_questions = total_questions - 1 WHERE id = $1`,
            [req.params.testId],
        );

        res.json({
            success: true,
            message: 'Question deleted successfully',
        });
    } catch (error: any) {
        console.error('Delete question error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};
