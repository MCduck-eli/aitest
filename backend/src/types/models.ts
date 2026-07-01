// Training Center
export interface TrainingCenter {
    id: string;
    name: string;
    description?: string;
    email: string;
    phone?: string;
    address?: string;
    subscription_plan: 'free' | 'starter' | 'pro' | 'enterprise';
    is_active: boolean;
    stripe_customer_id?: string;
    created_at: Date;
    updated_at: Date;
}

// User
export interface User {
    id: string;
    training_center_id: string | null;
    email: string;
    password_hash: string;
    full_name: string;
    role: 'admin' | 'teacher' | 'student' | 'super_admin';
    subject?: string;
    study_group?: string;
    lesson_script?: string;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
}

// User without password
export interface UserPublic extends Omit<User, 'password_hash'> {}

// Test Bank
export interface TestBank {
    id: string;
    training_center_id: string;
    title: string;
    description?: string;
    subject?: string;
    duration_minutes: number;
    total_questions: number;
    passing_score: number;
    is_published: boolean;
    created_by: string;
    created_at: Date;
    updated_at: Date;
}

// Question
export interface Question {
    id: string;
    test_bank_id: string;
    question_text: string;
    question_type: 'multiple_choice' | 'true_false' | 'short_answer';
    difficulty_level: 'easy' | 'medium' | 'hard';
    order_index: number;
    created_at: Date;
    updated_at: Date;
}

// Answer Option
export interface AnswerOption {
    id: string;
    question_id: string;
    option_text: string;
    is_correct: boolean;
    order_index: number;
    created_at: Date;
}

// Exam Result
export interface ExamResult {
    id: string;
    test_bank_id: string;
    student_id?: string;
    student_name: string;
    student_email?: string;
    score?: number;
    total_questions: number;
    passed: boolean;
    violation_count: number;
    has_suspicious_activity: boolean;
    exam_duration_seconds?: number;
    final_photo_base64?: Buffer;
    started_at: Date;
    submitted_at: Date;
    created_at: Date;
}

// Subscription
export interface Subscription {
    id: string;
    training_center_id: string;
    plan_name: string;
    price_usd: number;
    billing_period: 'monthly' | 'yearly';
    status: 'active' | 'cancelled' | 'expired';
    started_at: Date;
    expires_at?: Date;
    stripe_subscription_id?: string;
    created_at: Date;
    updated_at: Date;
}

// JWT Payload
export interface JWTPayload {
    userId: string;
    trainingCenterId: string | null;
    email: string;
    role: string;
}

// API Response
export interface ApiResponse<T = any> {
    success: boolean;
    message?: string;
    data?: T;
    error?: string;
}
