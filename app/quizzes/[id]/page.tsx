"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { Quiz, Question } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Clock, BookOpen, User, Play, AlertCircle, Info } from "lucide-react";

export default function QuizDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                const response = await api.get(`/quizzes/published/${id}`);
                setQuiz(response.data);
            } catch (err: any) {
                setError(err.response?.data?.detail || "Failed to load quiz metadata.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchQuiz();
    }, [id]);

    if (isLoading) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-10">
                <Skeleton className="h-6 w-48 mb-6" />
                <Skeleton className="h-12 w-3/4 mb-4" />
                <Skeleton className="h-64 rounded-2xl" />
            </div>
        );
    }

    if (!quiz && !isLoading) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-20 text-center">
                <h1 className="text-2xl font-bold text-white mb-8">Quiz Not Found</h1>
                <Button onClick={() => router.push("/quizzes/browse")}>Back to Browsing</Button>
            </div>
        );
    }

    if (!quiz) return null;

    return (
        <div className="max-w-4xl mx-auto px-4 py-10">
            <Breadcrumbs items={[{ label: "Browse", href: "/quizzes/browse" }, { label: quiz.title }]} />

            <div className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{quiz.title}</h1>
                <div className="flex flex-wrap items-center gap-6 text-slate-400">
                    <div className="flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        <span>{quiz.instructor_name || "Guest Instructor"}</span>
                    </div>
                    <div className="flex items-center">
                        <BookOpen className="h-4 w-4 mr-2" />
                        <span>{quiz.question_count || 0} Questions</span>
                    </div>
                    {quiz.time_limit_minutes && (
                        <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-2" />
                            <span>{quiz.time_limit_minutes} Minutes Limit</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Card className="md:col-span-2 border-white/5 bg-slate-900/40">
                    <CardHeader>
                        <CardTitle>About this quiz</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                            {quiz.description || "No detailed description provided for this quiz."}
                        </p>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card className="border-violet-500/20 bg-violet-500/5">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center">
                                <Info className="h-5 w-5 mr-2 text-violet-400" />
                                Instructions
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-slate-400 space-y-3">
                            <p>• You have one attempt for this quiz.</p>
                            <p>• Make sure you have a stable internet connection.</p>
                            {quiz.time_limit_minutes && (
                                <p>• Timer starts as soon as you click the button below.</p>
                            )}
                            <p>• Good luck!</p>
                        </CardContent>
                        <CardFooter>
                            <Button asChild size="lg" className="w-full">
                                <Link href={`/quizzes/${id}/take`}>
                                    Start Now
                                    <Play className="h-4 w-4 ml-2 fill-current" />
                                </Link>
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    );
}

function Link({ href, children, ...props }: any) {
    return <a href={href} {...props}>{children}</a>;
}
