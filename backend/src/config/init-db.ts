import { query } from '../config/database';

export const initializeDatabase = async (): Promise<void> => {
    console.log('🔄 Initializing database...');

    try {
        // Training Centers (Organizations)
        await query(`
            CREATE TABLE IF NOT EXISTS training_centers (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name VARCHAR(255) NOT NULL UNIQUE,
                description TEXT,
                email VARCHAR(255) NOT NULL UNIQUE,
                phone VARCHAR(20),
                address TEXT,
                subscription_plan VARCHAR(50) DEFAULT 'free',
                is_active BOOLEAN DEFAULT true,
                stripe_customer_id VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Users (Admins, Teachers, Students)
        await query(`
            CREATE TABLE IF NOT EXISTS users (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                training_center_id UUID NOT NULL REFERENCES training_centers(id) ON DELETE CASCADE,
                email VARCHAR(255) NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                full_name VARCHAR(255) NOT NULL,
                role VARCHAR(50) DEFAULT 'student',
                is_active BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(training_center_id, email)
            );
        `);

        // Test Banks (Exams/Tests)
        await query(`
            CREATE TABLE IF NOT EXISTS test_banks (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                training_center_id UUID NOT NULL REFERENCES training_centers(id) ON DELETE CASCADE,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                subject VARCHAR(255),
                duration_minutes INT DEFAULT 60,
                total_questions INT DEFAULT 0,
                passing_score INT DEFAULT 60,
                is_published BOOLEAN DEFAULT false,
                created_by UUID NOT NULL REFERENCES users(id),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Questions
        await query(`
            CREATE TABLE IF NOT EXISTS questions (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                test_bank_id UUID NOT NULL REFERENCES test_banks(id) ON DELETE CASCADE,
                question_text TEXT NOT NULL,
                question_type VARCHAR(50) DEFAULT 'multiple_choice',
                difficulty_level VARCHAR(20) DEFAULT 'medium',
                order_index INT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Answer Options
        await query(`
            CREATE TABLE IF NOT EXISTS answer_options (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
                option_text TEXT NOT NULL,
                is_correct BOOLEAN DEFAULT false,
                order_index INT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Student Exam Results
        await query(`
            CREATE TABLE IF NOT EXISTS exam_results (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                test_bank_id UUID NOT NULL REFERENCES test_banks(id),
                student_id UUID REFERENCES users(id) ON DELETE SET NULL,
                student_name VARCHAR(255) NOT NULL,
                student_email VARCHAR(255),
                score INT,
                total_questions INT,
                passed BOOLEAN DEFAULT false,
                violation_count INT DEFAULT 0,
                has_suspicious_activity BOOLEAN DEFAULT false,
                exam_duration_seconds INT,
                final_photo_base64 BYTEA,
                started_at TIMESTAMP,
                submitted_at TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Student Answers
        await query(`
            CREATE TABLE IF NOT EXISTS student_answers (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                exam_result_id UUID NOT NULL REFERENCES exam_results(id) ON DELETE CASCADE,
                question_id UUID NOT NULL REFERENCES questions(id),
                selected_answer_id UUID REFERENCES answer_options(id),
                answer_text TEXT,
                is_correct BOOLEAN,
                time_taken_seconds INT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Proctoring Violations Log
        await query(`
            CREATE TABLE IF NOT EXISTS proctoring_violations (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                exam_result_id UUID NOT NULL REFERENCES exam_results(id) ON DELETE CASCADE,
                violation_type VARCHAR(100),
                violation_details TEXT,
                severity VARCHAR(50),
                snapshot_base64 BYTEA,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Subscription/Payment History
        await query(`
            CREATE TABLE IF NOT EXISTS subscriptions (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                training_center_id UUID NOT NULL REFERENCES training_centers(id) ON DELETE CASCADE,
                plan_name VARCHAR(100),
                price_usd DECIMAL(10, 2),
                billing_period VARCHAR(50),
                status VARCHAR(50) DEFAULT 'active',
                started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                expires_at TIMESTAMP,
                stripe_subscription_id VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Create indexes for performance
        await query(`CREATE INDEX IF NOT EXISTS idx_users_training_center ON users(training_center_id);`);
        await query(`CREATE INDEX IF NOT EXISTS idx_test_banks_training_center ON test_banks(training_center_id);`);
        await query(`CREATE INDEX IF NOT EXISTS idx_questions_test_bank ON questions(test_bank_id);`);
        await query(`CREATE INDEX IF NOT EXISTS idx_exam_results_test_bank ON exam_results(test_bank_id);`);
        await query(`CREATE INDEX IF NOT EXISTS idx_exam_results_student ON exam_results(student_id);`);
        await query(`CREATE INDEX IF NOT EXISTS idx_violations_exam_result ON proctoring_violations(exam_result_id);`);

        console.log('✅ Database initialized successfully!');
    } catch (error) {
        console.error('❌ Database initialization error:', error);
        throw error;
    }
};
