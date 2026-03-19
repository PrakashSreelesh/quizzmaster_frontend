"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Submission } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Button } from "@/components/ui/Button";
import { BarChart3, CheckCircle2, Target, History, ArrowRight, BookOpen } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useToast } from "@/context/ToastContext";
import { Skeleton } from "@/components/ui/Skeleton";

interface StudentStats {
    total_submissions: number;
    quizzes_passed: number;
    average_percentage: number;
    recent_submissions: Submission[];
}

export default function StudentAnalyticsPage() {
    const [stats, setStats] = useState<StudentStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { error: toastError } = useToast();

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get("/analytics/me");
                setStats(response.data);
            } catch (error: any) {
                console.error("Failed to fetch student analytics", error);
                if (error.response?.status !== 401) {
                    toastError("Failed to load your analytics.");
                }
            } finally {
                setIsLoading(false);
            }
        };
        fetchStats();
    }, [toastError]);

    if (isLoading) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-10">
                <Skeleton className="h-6 w-48 mb-6" />
                <Skeleton className="h-12 w-96 mb-10" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-40 rounded-2xl" />)}
                </div>
                <div className="space-y-4">
                    <Skeleton className="h-8 w-48 mb-4" />
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 rounded-2xl" />)}
                </div>
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-20 text-center">
                <h2 className="text-2xl font-bold text-white mb-4">No data available</h2>
                <Button asChild><Link href="/quizzes/browse">Take your first quiz</Link></Button>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <Breadcrumbs items={[{ label: "My Progress" }]} />

            <div className="mb-10">
                <h1 className="text-4xl font-bold text-white mb-2">Personal <span className="gradient-text">Analytics</span></h1>
                <p className="text-slate-400">Track your learning journey and performance across all quizzes.</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <StatCard
                    icon={<BookOpen className="h-6 w-6 text-blue-400" />}
                    label="Total Quizzes"
                    value={stats.total_submissions.toString()}
                    description="Attempts made so far"
                />
                <StatCard
                    icon={<CheckCircle2 className="h-6 w-6 text-green-400" />}
                    label="Quizzes Passed"
                    value={stats.quizzes_passed.toString()}
                    description={`${((stats.quizzes_passed / (stats.total_submissions || 1)) * 100).toFixed(0)}% success rate`}
                />
                <StatCard
                    icon={<Target className="h-6 w-6 text-violet-400" />}
                    label="Avg. Score"
                    value={`${stats.average_percentage.toFixed(1)}%`}
                    description="Overall average performance"
                />
            </div>

            {/* Recent Activity */}
            <div className="space-y-6">
                <div className="flex items-center space-x-2 mb-2">
                    <History className="h-5 w-5 text-slate-400" />
                    <h2 className="text-2xl font-bold text-white">Recent Activity</h2>
                </div>

                {stats.recent_submissions && stats.recent_submissions.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4">
                        {stats.recent_submissions.map((sub) => (
                            <Link key={sub.id} href={`/submissions/${sub.id}`}>
                                <Card className="border-white/5 bg-slate-900/40 hover:bg-slate-900/60 hover:border-violet-500/30 transition-all duration-300 group">
                                    <CardContent className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="flex items-center space-x-4">
                                            <div className={cn(
                                                "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                                                (sub.percentage || 0) >= 60 ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"
                                            )}>
                                                {(sub.percentage || 0) >= 60 ? <CheckCircle2 className="h-6 w-6" /> : <Target className="h-6 w-6" />}
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold text-white group-hover:text-violet-400 transition-colors uppercase tracking-tight">
                                                    {sub.quiz_title}
                                                </h3>
                                                <p className="text-xs text-slate-500">
                                                    {new Date(sub.submitted_at).toLocaleDateString()} at {new Date(sub.submitted_at).toLocaleTimeString()}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-6">
                                            <div className="text-right">
                                                <span className="block text-xl font-bold text-white">{(sub.percentage || 0).toFixed(0)}%</span>
                                                <span className="block text-[10px] text-slate-500 uppercase font-bold tracking-widest">
                                                    {sub.score}/{sub.max_score} Points
                                                </span>
                                            </div>
                                            <ArrowRight className="h-5 w-5 text-slate-600 group-hover:text-white transition-all transform group-hover:translate-x-1" />
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="py-20 text-center bg-slate-900/20 rounded-3xl border border-dashed border-slate-800">
                        <p className="text-slate-500">No submissions found. Start a quiz to see your progress!</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function StatCard({ icon, label, value, description }: { icon: React.ReactNode, label: string, value: string, description: string }) {
    return (
        <Card className="border-white/5 bg-slate-900/40 p-6">
            <div className="flex items-start justify-between mb-4">
                <div className="bg-slate-800/50 p-3 rounded-xl">
                    {icon}
                </div>
            </div>
            <div>
                <span className="block text-sm text-slate-500 mb-1">{label}</span>
                <span className="block text-3xl font-bold text-white mb-2">{value}</span>
                <p className="text-xs text-slate-400">{description}</p>
            </div>
        </Card>
    );
}
