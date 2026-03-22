export interface User {
    id: string;
    email: string;
    username: string;
    role: 'instructor' | 'student';
    is_active: boolean;
    created_at: string;
}

export interface Quiz {
    id: string;
    title: string;
    description: string;
    instructor_id: string;
    is_published: boolean;
    time_limit_minutes: number | null;
    max_attempts: number;
    created_at: string;
    updated_at: string | null;
    question_count?: number;
    submission_count?: number;
    average_score?: number;
    instructor_name?: string;
    user_attempts?: number;
}

export interface Question {
    id: string;
    quiz_id: string;
    text: string;
    question_type: 'multiple_choice' | 'true_false' | 'short_answer';
    points: number;
    order: number;
    options: Option[];
}

export interface Option {
    id?: string;
    text: string;
    is_correct?: boolean;
}

export interface Submission {
    id: string;
    quiz_id: string;
    student_id: string;
    score: number | null;
    max_score: number | null;
    percentage: number | null;
    submitted_at: string;
    graded_at: string | null;
    quiz_title?: string;
    student_name?: string;

    // Metadata
    ip_address?: string;
    user_agent?: string;
    browser?: string;
    os?: string;
    location?: string;
}
