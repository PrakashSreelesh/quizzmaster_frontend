"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { Quiz, Question, Option } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";
import { ChevronLeft, ChevronRight, Send, Clock, AlertCircle, Info, CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/context/ToastContext";
import { Skeleton } from "@/components/ui/Skeleton";

export default function QuizTakePage() {
    const { id } = useParams();
    const router = useRouter();
    const { error: toastError } = useToast();
    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [timeLeft, setTimeLeft] = useState<number | null>(null);
    const [isTimerStarted, setIsTimerStarted] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Request with shuffle=true for question randomization
                const response = await api.get(`/quizzes/published/${id}?shuffle=true`);
                // Interceptor unwraps to response.data.data
                const data = response.data;
                setQuiz(data);
                setQuestions(data.questions || []);

                if (data.time_limit_minutes && !isTimerStarted) {
                    setTimeLeft(data.time_limit_minutes * 60);
                    setIsTimerStarted(true);
                }
            } catch (err: any) {
                console.error("Failed to load quiz content", err);
                if (err.response?.status !== 401) {
                    toastError("Failed to load quiz content.");
                }
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]); // Only load once when ID changes

    const handleSubmit = useCallback(async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);

        try {
            // Include ALL questions in submission (for unattended status)
            const formattedAnswers = questions.map(q => ({
                question_id: q.id,
                answer_value: answers[q.id] || null, // null = unattended
            }));

            const response = await api.post(`/submissions/quiz/${id}`, {
                answers: formattedAnswers,
            });

            // The interceptor unwraps the response.data to the inner data object
            // So response.data should be the submission object itself.
            if (response.data && response.data.id) {
                router.push(`/submissions/${response.data.id}`);
            } else {
                throw new Error("Invalid response from server");
            }
        } catch (err: any) {
            console.error("Submission failed", err);
            const msg = err.response?.data?.detail || err.message || "Submission failed. Please try again.";
            toastError(msg);
            setIsSubmitting(false);
        }
    }, [id, questions, answers, isSubmitting, router, toastError]);

    // Timer logic
    useEffect(() => {
        if (timeLeft === null || timeLeft < 0 || isSubmitting) {
            return;
        }

        if (timeLeft === 0) {
            handleSubmit();
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft(prev => (prev !== null && prev > 0 ? prev - 1 : 0));
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, handleSubmit, isSubmitting]);

    const setAnswer = (questionId: string, value: string) => {
        setAnswers(prev => ({ ...prev, [questionId]: value }));
    };

    if (isLoading) {
        return (
            <div className="max-w-3xl mx-auto px-4 py-12">
                <div className="mb-10 space-y-4">
                    <Skeleton className="h-10 w-3/4" />
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-1.5 w-full" />
                </div>
                <div className="space-y-8">
                    <Skeleton className="h-16 w-full rounded-2xl" />
                    <div className="space-y-4">
                        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-14 w-full rounded-xl" />)}
                    </div>
                </div>
            </div>
        );
    }


    if (!quiz && !isLoading) {
        return (
            <div className="max-w-xl mx-auto px-4 py-20 text-center">
                <Button onClick={() => window.location.reload()}>Retry Loading</Button>
            </div>
        );
    }

    const currentQuestion = questions[currentIndex];
    const progress = ((currentIndex + 1) / questions.length) * 100;

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div className="max-w-3xl mx-auto px-4 py-6 md:py-12">
            {/* Header / Progress */}
            <div className="sticky top-16 z-20 bg-slate-950/80 backdrop-blur-sm pt-4 pb-6 mb-8 border-b border-white/5">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h1 className="text-xl font-bold text-white line-clamp-1">{quiz?.title}</h1>
                        <p className="text-sm text-slate-500">Question {currentIndex + 1} of {questions.length}</p>
                    </div>

                    {timeLeft !== null && (
                        <div className={cn(
                            "flex items-center space-x-2 px-3 py-1.5 rounded-full border transition-colors",
                            timeLeft < 60
                                ? "border-red-500/50 bg-red-500/10 text-red-400 animate-pulse"
                                : "border-violet-500/20 bg-violet-500/10 text-violet-400"
                        )}>
                            <Clock className="h-4 w-4" />
                            <span className="font-mono font-bold">{formatTime(timeLeft)}</span>
                        </div>
                    )}
                </div>

                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-violet-600 to-indigo-500 transition-all duration-500 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* Question Canvas */}
            <div className="min-h-[400px]">
                {currentQuestion && (
                    <div key={currentQuestion.id} className="animate-in fade-in slide-in-from-right-4 duration-500">
                        <h2 className="text-2xl font-semibold text-white mb-8 leading-snug">
                            {currentQuestion.text}
                        </h2>

                        <div className="space-y-3">
                            {currentQuestion.question_type === 'short_answer' ? (
                                <div className="space-y-4">
                                    <Input
                                        placeholder="Type your answer here..."
                                        className="h-14 text-lg"
                                        value={answers[currentQuestion.id] || ""}
                                        onChange={(e) => setAnswer(currentQuestion.id, e.target.value)}
                                        autoFocus
                                    />
                                    <div className="flex items-center text-xs text-slate-500">
                                        <Info className="h-3 w-3 mr-1" />
                                        Short answers are case-insensitive.
                                    </div>
                                </div>
                            ) : (
                                currentQuestion.options.map((option: Option) => (
                                    <button
                                        key={option.id || option.text}
                                        onClick={() => setAnswer(currentQuestion.id, option.id || option.text)}
                                        className={cn(
                                            "w-full flex items-center p-4 rounded-xl border text-left transition-all duration-200 group",
                                            answers[currentQuestion.id] === (option.id || option.text)
                                                ? "border-violet-500 bg-violet-500/10 ring-1 ring-violet-500 shadow-lg shadow-violet-500/10"
                                                : "border-slate-800 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/60"
                                        )}
                                    >
                                        <div className={cn(
                                            "flex-shrink-0 w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center transition-colors",
                                            answers[currentQuestion.id] === (option.id || option.text)
                                                ? "border-violet-500 bg-violet-500"
                                                : "border-slate-700 group-hover:border-slate-500"
                                        )}>
                                            {answers[currentQuestion.id] === (option.id || option.text) && (
                                                <CheckCircle2 className="h-4 w-4 text-white" />
                                            )}
                                        </div>
                                        <span className={cn(
                                            "text-lg font-medium",
                                            answers[currentQuestion.id] === (option.id || option.text) ? "text-white" : "text-slate-300"
                                        )}>
                                            {option.text}
                                        </span>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Navigation */}
            <div className="mt-12 flex items-center justify-between">
                <Button
                    variant="outline"
                    disabled={currentIndex === 0 || isSubmitting}
                    onClick={() => setCurrentIndex(prev => prev - 1)}
                    className="border-slate-800 text-slate-400 h-12 px-6"
                >
                    <ChevronLeft className="h-5 w-5 mr-2" />
                    Previous
                </Button>

                {currentIndex === questions.length - 1 ? (
                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="bg-indigo-600 hover:bg-indigo-500 h-12 px-8 font-bold"
                    >
                        {isSubmitting ? (
                            <Loader2 className="h-5 w-5 animate-spin mr-2" />
                        ) : (
                            <>
                                Finish Quiz
                                <Send className="h-5 w-5 ml-2" />
                            </>
                        )}
                    </Button>
                ) : (
                    <Button
                        onClick={() => setCurrentIndex(prev => prev - 1 + 2)}
                        disabled={isSubmitting}
                        className="h-12 px-8"
                    >
                        Next Question
                        <ChevronRight className="h-5 w-5 ml-2" />
                    </Button>
                )}
            </div>
        </div>
    );
}

