"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import api from "@/lib/api";
import { Quiz } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { BarChart3, Users, Target, CheckCircle2, TrendingUp, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuizAnalytics {
    total_submissions: number;
    average_score: number;
    max_possible_score: number;
    pass_rate: number;
    question_stats: {
        question_id: number;
        text: string;
        correct_count: number;
        total_attempts: number;
        accuracy: number;
    }[];
}

export default function InstructorQuizAnalyticsPage() {
    const { id } = useParams();
    const [analytics, setAnalytics] = useState<QuizAnalytics | null>(null);
    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [anaRes, quizRes] = await Promise.all([
                    api.get(`/analytics/quiz/${id}`),
                    api.get(`/quizzes/${id}`)
                ]);
                setAnalytics(anaRes.data);
                setQuiz(quizRes.data);
            } catch (err: any) {
                console.error("Failed to fetch analytics", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [id]);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)]">
                <Spinner className="h-12 w-12 mb-4" />
            </div>
        );
    }

    if (!analytics) return <div className="p-10 text-center">No analytics data yet.</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <Breadcrumbs items={[
                { label: "Dashboard", href: "/dashboard" },
                { label: quiz?.title || "Quiz", href: `/dashboard/quizzes/${id}/edit` },
                { label: "Analytics" }
            ]} />

            <div className="mb-10">
                <h1 className="text-4xl font-bold text-white mb-2">Performance <span className="gradient-text">Insights</span></h1>
                <p className="text-slate-400">Deep dive into how students are performing on &quot;{quiz?.title}&quot;</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                <StatItem icon={<Users className="text-blue-400" />} label="Submissions" value={analytics.total_submissions.toString()} />
                <StatItem icon={<Target className="text-violet-400" />} label="Avg. Score" value={`${analytics.average_score.toFixed(1)}/${analytics.max_possible_score}`} />
                <StatItem icon={<TrendingUp className="text-green-400" />} label="Pass Rate" value={`${analytics.pass_rate.toFixed(1)}%`} />
                <StatItem icon={<CheckCircle2 className="text-indigo-400" />} label="Completion" value={analytics.total_submissions > 0 ? "High" : "N/A"} />
            </div>

            <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white flex items-center">
                    <HelpCircle className="h-6 w-6 mr-2 text-slate-500" />
                    Question Breakdown
                </h2>

                <div className="grid grid-cols-1 gap-4">
                    {analytics.question_stats.map((q, idx) => (
                        <Card key={q.question_id} className="border-white/5 bg-slate-900/40">
                            <CardContent className="p-6">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div className="flex-grow max-w-2xl">
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Question {idx + 1}</span>
                                        <p className="text-white font-medium">{q.text}</p>
                                    </div>

                                    <div className="flex items-center space-x-10">
                                        <div className="text-center w-24">
                                            <span className="block text-xl font-bold text-white">{q.accuracy.toFixed(0)}%</span>
                                            <span className="block text-[10px] text-slate-500 uppercase font-bold tracking-widest">Accuracy</span>
                                        </div>
                                        <div className="w-32 h-2 bg-slate-800 rounded-full overflow-hidden shrink-0">
                                            <div
                                                className={cn(
                                                    "h-full transition-all duration-1000 ease-out",
                                                    q.accuracy > 70 ? "bg-green-500" : q.accuracy > 40 ? "bg-yellow-500" : "bg-red-500"
                                                )}
                                                style={{ width: `${q.accuracy}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}

function StatItem({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
    return (
        <Card className="border-white/5 bg-slate-900/40 p-6">
            <div className="bg-slate-800/50 p-3 rounded-xl w-fit mb-4">{icon}</div>
            <span className="block text-sm text-slate-500 mb-1">{label}</span>
            <span className="block text-2xl font-bold text-white">{value}</span>
        </Card>
    );
}
