"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { Submission, Quiz, Question } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { CheckCircle2, XCircle, Trophy, BarChart3, ArrowRight, User, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { useToast } from "@/context/ToastContext";
import { Skeleton } from "@/components/ui/Skeleton";

interface GradedAnswer {
    question_id: number;
    answer_value: string;
    is_correct: boolean;
    points_awarded: number;
    correct_value?: string;
    question_text?: string;
    question_type?: string;
}

export default function SubmissionResultPage() {
    const { id } = useParams();
    const router = useRouter();
    const [submission, setSubmission] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { error: toastError } = useToast();

    useEffect(() => {
        const fetchResult = async () => {
            try {
                const response = await api.get(`/submissions/my/${id}`);
                setSubmission(response.data);
            } catch (err: any) {
                console.error("Failed to fetch submission result", err);
                if (err.response?.status !== 401) {
                    toastError("Failed to load submission results.");
                }
            } finally {
                setIsLoading(false);
            }
        };
        fetchResult();
    }, [id, toastError]);

    if (isLoading) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-10">
                <Skeleton className="h-6 w-48 mb-6" />
                <Skeleton className="h-64 rounded-3xl mb-12" />
                <div className="space-y-6">
                    <Skeleton className="h-8 w-48 mb-6" />
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 rounded-3xl" />)}
                </div>
            </div>
        );
    }

    if (!submission && !isLoading) {
        return (
            <div className="max-w-xl mx-auto px-4 py-20 text-center">
                <h2 className="text-2xl font-bold text-white mb-8">Submission not found</h2>
                <Button onClick={() => router.push("/quizzes/browse")}>Back to Browsing</Button>
            </div>
        );
    }

    const isPassed = submission.percentage >= 60;

    return (
        <div className="max-w-4xl mx-auto px-4 py-10">
            <Breadcrumbs items={[{ label: "Browse", href: "/quizzes/browse" }, { label: "Result" }]} />

            {/* Hero Result Section */}
            <div className="relative overflow-hidden mb-12 rounded-3xl border border-white/5 bg-slate-900/40 p-8 md:p-12 text-center animate-in fade-in slide-in-from-bottom-8 duration-1000">
                <div className="relative z-10">
                    <div className={cn(
                        "inline-flex items-center justify-center rounded-3xl p-6 mb-8 shadow-2xl",
                        isPassed ? "bg-green-500/20 shadow-green-500/20" : "bg-red-500/20 shadow-red-500/20"
                    )}>
                        {isPassed ? (
                            <Trophy className="h-16 w-16 text-green-400" />
                        ) : (
                            <XCircle className="h-16 w-16 text-red-400" />
                        )}
                    </div>

                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                        {isPassed ? "Congratulations!" : "Keep Practicing!"}
                    </h1>
                    <p className="text-xl text-slate-400 mb-8">
                        You scored <span className="text-white font-bold">{submission.score}</span> out of {submission.max_score}
                    </p>

                    <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-8">
                        <StatCard icon={<BarChart3 className="h-5 w-5" />} label="Percentage" value={`${submission.percentage.toFixed(1)}%`} />
                        <StatCard icon={<CheckCircle2 className="h-5 w-5" />} label="Status" value={isPassed ? "PASSED" : "FAILED"} />
                        <StatCard icon={<Calendar className="h-5 w-5" />} label="Date" value={new Date(submission.submitted_at).toLocaleDateString()} />
                    </div>

                    <Button asChild size="lg" className="rounded-full px-10">
                        <Link href="/quizzes/browse">
                            Browse More Quizzes
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                    </Button>
                </div>

                {/* Abstract Background Blur */}
                <div className={cn(
                    "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-[100px] pointer-events-none",
                    isPassed ? "bg-green-500/10" : "bg-red-500/10"
                )} />
            </div>

            {/* Detailed Feedback */}
            <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white mb-6">Detailed Feedback</h2>
                {submission.answers.map((ans: GradedAnswer, index: number) => (
                    <Card key={index} className={cn(
                        "border-white/5 bg-slate-900/40",
                        ans.is_correct ? "hover:border-green-500/30" : "hover:border-red-500/30"
                    )}>
                        <CardHeader className="flex flex-row items-start justify-between pb-2">
                            <div className="space-y-1">
                                <CardTitle className="text-lg">Question {index + 1}</CardTitle>
                                <p className="text-slate-300">{ans.question_text}</p>
                            </div>
                            <div className={cn(
                                "flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold uppercase",
                                ans.is_correct ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"
                            )}>
                                {ans.is_correct ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                                <span>{ans.is_correct ? "Correct" : "Incorrect"}</span>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 rounded-xl bg-slate-950/50 border border-white/5">
                                    <span className="text-xs text-slate-500 uppercase block mb-1">Your Answer</span>
                                    <span className={cn("font-medium", ans.is_correct ? "text-green-400" : "text-red-400")}>
                                        {ans.answer_value || "No answer provided"}
                                    </span>
                                </div>
                                {!ans.is_correct && (
                                    <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/10">
                                        <span className="text-xs text-slate-500 uppercase block mb-1">Correct Answer</span>
                                        <span className="text-green-400 font-medium">
                                            {ans.correct_value}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
    return (
        <div className="flex items-center space-x-3 bg-slate-950/50 px-5 py-3 rounded-2xl border border-white/5">
            <div className="text-slate-500">{icon}</div>
            <div className="text-left">
                <span className="block text-[10px] text-slate-500 uppercase font-bold tracking-wider">{label}</span>
                <span className="block text-white font-semibold">{value}</span>
            </div>
        </div>
    );
}

function Link({ href, children, ...props }: any) {
    return <a href={href} {...props}>{children}</a>;
}
