import { Request, Response } from 'express';
import { query } from '../config/database';
import { ApiResponse } from '../types/models';

export const getTestResults = async (
    req: Request<{ testId: string }>,
    res: Response<ApiResponse>,
): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, error: 'Not authenticated' });
            return;
        }

        const testResult = await query(
            `SELECT id FROM test_banks WHERE id = $1 AND training_center_id = $2`,
            [req.params.testId, req.user.trainingCenterId],
        );

        if (testResult.rows.length === 0) {
            res.status(404).json({ success: false, error: 'Test not found' });
            return;
        }

        const results = await query(
            `SELECT id, test_bank_id, student_id, student_name, student_email, score, total_questions,
                    passed, violation_count, has_suspicious_activity, exam_duration_seconds,
                    started_at, submitted_at, created_at
             FROM exam_results
             WHERE test_bank_id = $1
             ORDER BY submitted_at DESC`,
            [req.params.testId],
        );

        const stats = {
            total_attempts: results.rows.length,
            passed_count: results.rows.filter((r: any) => r.passed).length,
            failed_count: results.rows.filter((r: any) => !r.passed).length,
            average_score: results.rows.length > 0
                ? (results.rows.reduce((sum: number, r: any) => sum + (r.score || 0), 0) / results.rows.length).toFixed(2)
                : 0,
            suspicious_attempts: results.rows.filter((r: any) => r.has_suspicious_activity).length,
        };

        res.json({
            success: true,
            data: {
                results: results.rows,
                statistics: stats,
            },
        });
    } catch (error: any) {
        console.error('Get results error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

export const getResultDetail = async (
    req: Request<{ resultId: string }>,
    res: Response<ApiResponse>,
): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, error: 'Not authenticated' });
            return;
        }

        const resultQuery = await query(
            `SELECT er.* FROM exam_results er
             JOIN test_banks tb ON er.test_bank_id = tb.id
             WHERE er.id = $1 AND tb.training_center_id = $2`,
            [req.params.resultId, req.user.trainingCenterId],
        );

        if (resultQuery.rows.length === 0) {
            res.status(404).json({ success: false, error: 'Result not found' });
            return;
        }

        const result = resultQuery.rows[0];

        const answersQuery = await query(
            `SELECT sa.*, q.question_text, q.question_type, q.difficulty_level,
                    ao.option_text as selected_option
             FROM student_answers sa
             JOIN questions q ON sa.question_id = q.id
             LEFT JOIN answer_options ao ON sa.selected_answer_id = ao.id
             WHERE sa.exam_result_id = $1
             ORDER BY q.order_index`,
            [req.params.resultId],
        );

        const violationsQuery = await query(
            `SELECT id, violation_type, violation_details, severity, created_at
             FROM proctoring_violations
             WHERE exam_result_id = $1
             ORDER BY created_at DESC`,
            [req.params.resultId],
        );

        res.json({
            success: true,
            data: {
                result,
                answers: answersQuery.rows,
                violations: violationsQuery.rows,
            },
        });
    } catch (error: any) {
        console.error('Get result detail error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

export const getDashboardAnalytics = async (
    req: Request,
    res: Response<ApiResponse>,
): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, error: 'Not authenticated' });
            return;
        }

        const testsQuery = await query(
            `SELECT COUNT(*) as count FROM test_banks WHERE training_center_id = $1`,
            [req.user.trainingCenterId],
        );

        const studentsQuery = await query(
            `SELECT COUNT(DISTINCT student_email) as count FROM exam_results er
             JOIN test_banks tb ON er.test_bank_id = tb.id
             WHERE tb.training_center_id = $1`,
            [req.user.trainingCenterId],
        );

        const examsQuery = await query(
            `SELECT COUNT(*) as count FROM exam_results er
             JOIN test_banks tb ON er.test_bank_id = tb.id
             WHERE tb.training_center_id = $1`,
            [req.user.trainingCenterId],
        );

        const passRateQuery = await query(
            `SELECT COUNT(CASE WHEN passed THEN 1 END) as passed,
                    COUNT(*) as total
             FROM exam_results er
             JOIN test_banks tb ON er.test_bank_id = tb.id
             WHERE tb.training_center_id = $1`,
            [req.user.trainingCenterId],
        );

        const passRate =
            passRateQuery.rows[0].total > 0
                ? ((passRateQuery.rows[0].passed / passRateQuery.rows[0].total) * 100).toFixed(2)
                : 0;

        const recentQuery = await query(
            `SELECT er.id, er.student_name, er.score, er.passed, er.submitted_at,
                    tb.title
             FROM exam_results er
             JOIN test_banks tb ON er.test_bank_id = tb.id
             WHERE tb.training_center_id = $1
             ORDER BY er.submitted_at DESC
             LIMIT 10`,
            [req.user.trainingCenterId],
        );

        res.json({
            success: true,
            data: {
                total_tests: testsQuery.rows[0].count,
                total_students: studentsQuery.rows[0].count,
                total_exams: examsQuery.rows[0].count,
                pass_rate: passRate,
                recent_exams: recentQuery.rows,
            },
        });
    } catch (error: any) {
        console.error('Get analytics error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};
