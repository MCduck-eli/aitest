import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../config/database';
import { ApiResponse, TestBank, Question, AnswerOption } from '../types/models';

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
