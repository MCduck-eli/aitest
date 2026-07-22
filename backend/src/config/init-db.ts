import { query } from '../config/database';
import { hashPassword } from '../utils/auth';

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
                training_center_id UUID NULL REFERENCES training_centers(id) ON DELETE CASCADE,
                email VARCHAR(255) NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                full_name VARCHAR(255) NOT NULL,
                role VARCHAR(50) DEFAULT 'student',
                is_active BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(training_center_id, email),
                UNIQUE(email)
            );
        `);

        await query(`
            ALTER TABLE users
            ALTER COLUMN training_center_id DROP NOT NULL;
        `);

        await query(`
            ALTER TABLE users
            ADD COLUMN IF NOT EXISTS subject VARCHAR(255);
        `);

        await query(`
            ALTER TABLE users
            ADD COLUMN IF NOT EXISTS study_group VARCHAR(255);
        `);

        await query(`
            ALTER TABLE users
            ADD COLUMN IF NOT EXISTS lesson_script TEXT;
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

        // Subjects (Fanlar)
        await query(`
            CREATE TABLE IF NOT EXISTS subjects (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                training_center_id UUID NOT NULL REFERENCES training_centers(id) ON DELETE CASCADE,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                is_active BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(training_center_id, name)
            );
        `);

        // Study Groups (Guruhlar)
        await query(`
            CREATE TABLE IF NOT EXISTS study_groups (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                training_center_id UUID NOT NULL REFERENCES training_centers(id) ON DELETE CASCADE,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                is_active BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(training_center_id, name)
            );
        `);

        // Subject-Group Relationships (Fan-Guruh bog'lanishi)
        await query(`
            CREATE TABLE IF NOT EXISTS subject_groups (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
                group_id UUID NOT NULL REFERENCES study_groups(id) ON DELETE CASCADE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(subject_id, group_id)
            );
        `);

        // Lesson Scripts (Dars skriptlari)
        await query(`
            CREATE TABLE IF NOT EXISTS lesson_scripts (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                training_center_id UUID NOT NULL REFERENCES training_centers(id) ON DELETE CASCADE,
                subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
                group_id UUID REFERENCES study_groups(id) ON DELETE CASCADE,
                title VARCHAR(255),
                content TEXT NOT NULL,
                test_bank_id UUID REFERENCES test_banks(id) ON DELETE SET NULL,
                topics JSONB DEFAULT '[]'::jsonb,
                created_by UUID NOT NULL REFERENCES users(id),
                is_active BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Student Progress (O'quvchilarning dars darajasi)
        await query(`
            CREATE TABLE IF NOT EXISTS student_progress (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                training_center_id UUID NOT NULL REFERENCES training_centers(id) ON DELETE CASCADE,
                student_name VARCHAR(255) NOT NULL,
                subject VARCHAR(255) NOT NULL,
                study_group VARCHAR(255) NOT NULL,
                current_lesson_script_id UUID REFERENCES lesson_scripts(id) ON DELETE SET NULL,
                lesson_number INTEGER DEFAULT 1,
                completed_lessons TEXT[] DEFAULT '{}',
                last_accessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(training_center_id, student_name, subject, study_group)
            );
        `);

        // Create indexes for performance
        await query(`CREATE INDEX IF NOT EXISTS idx_users_training_center ON users(training_center_id);`);
        await query(`CREATE INDEX IF NOT EXISTS idx_test_banks_training_center ON test_banks(training_center_id);`);
        await query(`CREATE INDEX IF NOT EXISTS idx_questions_test_bank ON questions(test_bank_id);`);
        await query(`CREATE INDEX IF NOT EXISTS idx_exam_results_test_bank ON exam_results(test_bank_id);`);
        await query(`CREATE INDEX IF NOT EXISTS idx_exam_results_student ON exam_results(student_id);`);
        await query(`CREATE INDEX IF NOT EXISTS idx_violations_exam_result ON proctoring_violations(exam_result_id);`);
        await query(`CREATE INDEX IF NOT EXISTS idx_subjects_training_center ON subjects(training_center_id);`);
        await query(`CREATE INDEX IF NOT EXISTS idx_study_groups_training_center ON study_groups(training_center_id);`);
        await query(`CREATE INDEX IF NOT EXISTS idx_lesson_scripts_training_center ON lesson_scripts(training_center_id);`);
        await query(`CREATE INDEX IF NOT EXISTS idx_student_progress_training_center ON student_progress(training_center_id);`);

        const masterAdminEmail = process.env.MASTER_ADMIN_EMAIL?.trim() || 'superadmin@aitest.com';
        const masterAdminPassword = process.env.MASTER_ADMIN_PASSWORD?.trim() || 'SuperAdmin123!';
        const masterAdminName = process.env.MASTER_ADMIN_NAME?.trim() || 'Main Administrator';
        const masterAdminPasswordHash = await hashPassword(masterAdminPassword);

        await query(
            `INSERT INTO users (email, password_hash, full_name, role, is_active)
             VALUES ($1::varchar, $2::varchar, $3::varchar, 'super_admin', true)
             ON CONFLICT (email) DO UPDATE SET
                 password_hash = EXCLUDED.password_hash,
                 full_name = EXCLUDED.full_name,
                 role = EXCLUDED.role,
                 is_active = EXCLUDED.is_active;`,
            [masterAdminEmail, masterAdminPasswordHash, masterAdminName],
        );

        // Clean up 'Main Training Center' if exists (not needed anymore)
        await query(
            `DELETE FROM training_centers WHERE name = 'Main Training Center'`
        );

        console.log('✅ Database initialized successfully!');
    } catch (error) {
        console.error('❌ Database initialization error:', error);
        throw error;
    }
};
