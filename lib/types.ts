export interface User {
    id: number;
    email: string;
    username: string;
    role: 'instructor' | 'student';
    is_active: boolean;
    created_at: string;
}

export interface Quiz {
    id: number;
    title: string;
    description: string;
    instructor_id: number;
    is_published: boolean;
    time_limit_minutes: number | null;
    created_at: string;
    updated_at: string | null;
    question_count?: number;
    instructor_name?: string;
}

export interface Question {
    id: number;
    quiz_id: number;
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
    id: number;
    quiz_id: number;
    student_id: number;
    score: number | null;
    max_score: number | null;
    percentage: number | null;
    submitted_at: string;
    graded_at: string | null;
    quiz_title?: string;
    student_name?: string;
}
