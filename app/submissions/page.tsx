"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { SubmissionDetailOut } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Pagination } from "@/components/ui/Pagination";
import { Skeleton } from "@/components/ui/Skeleton";
import { History, Search, ArrowRight, CheckCircle2, Target, Calendar, Clock } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useToast } from "@/context/ToastContext";

export default function MySubmissionsPage() {
    const [submissions, setSubmissions] = useState<SubmissionDetailOut[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const { error: toastError } = useToast();

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    const fetchSubmissions = async () => {
        setIsLoading(true);
        try {
            const response = await api.get("/submissions/my", {
                params: {
                    search: debouncedSearch || undefined,
                    page,
                    limit: 10
                }
            });
            const { items, pagination } = response.data;
            setSubmissions(items);
            setTotalPages(pagination.totalPages);
        } catch (error: any) {
            console.error("Failed to fetch submissions", error);
            if (error.response?.status !== 401) {
                toastError("Failed to load submission history.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSubmissions();
    }, [debouncedSearch, page]);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <Breadcrumbs items={[{ label: "My Progress", href: "/analytics" }, { label: "Submission History" }]} />

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                <div>
                    <div className="flex items-center space-x-2 text-violet-400 mb-2">
                        <History className="h-5 w-5" />
                        <span className="text-sm font-bold uppercase tracking-widest">Submission History</span>
                    </div>
                    <h1 className="text-4xl font-bold text-white mb-2">All your <span className="gradient-text">Attempts</span></h1>
                    <p className="text-slate-400">Review your past performance and track your growth.</p>
                </div>

                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <Input
                        placeholder="Search by quiz title..."
                        className="pl-10 h-11 bg-slate-900/40 border-white/5"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {isLoading ? (
                <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <Skeleton key={i} className="h-24 rounded-2xl bg-slate-900/40" />
                    ))}
                </div>
            ) : submissions.length > 0 ? (
                <div className="space-y-4 animate-in fade-in duration-700">
                    <div className="grid grid-cols-1 gap-4">
                        {submissions.map((sub) => (
                            <Link key={sub.id} href={`/submissions/${sub.id}`}>
                                <Card className="border-white/5 bg-slate-900/40 hover:bg-slate-900/60 hover:border-violet-500/30 transition-all duration-300 group overflow-hidden relative">
                                    <CardContent className="p-0">
                                        <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                            <div className="flex items-center space-x-4">
                                                <div className={cn(
                                                    "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-lg",
                                                    (sub.percentage || 0) >= 60 ? "bg-green-500/10 text-green-400 shadow-green-500/5" : "bg-red-500/10 text-red-400 shadow-red-500/5"
                                                )}>
                                                    {(sub.percentage || 0) >= 60 ? <CheckCircle2 className="h-6 w-6" /> : <Target className="h-6 w-6" />}
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-bold text-white group-hover:text-violet-400 transition-colors uppercase tracking-tight">
                                                        {sub.quiz_title}
                                                    </h3>
                                                    <div className="flex items-center space-x-4 text-xs text-slate-500 mt-1">
                                                        <span className="flex items-center">
                                                            <Calendar className="h-3 w-3 mr-1" />
                                                            {new Date(sub.submitted_at).toLocaleDateString()}
                                                        </span>
                                                        <span className="flex items-center">
                                                            <Clock className="h-3 w-3 mr-1" />
                                                            {new Date(sub.submitted_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center space-x-12">
                                                <div className="grid grid-cols-2 gap-8 md:block md:text-right">
                                                    <div className="md:mb-1">
                                                        <span className="text-2xl font-black text-white italic">
                                                            {(sub.percentage || 0).toFixed(0)}%
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="text-[10px] text-slate-500 uppercase font-black tracking-[0.2em]">
                                                            {sub.score}/{sub.max_score} POINTS
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="hidden md:block">
                                                    <div className="bg-slate-800/50 p-2 rounded-lg group-hover:bg-violet-500/20 group-hover:text-violet-400 transition-all">
                                                        <ArrowRight className="h-5 w-5 text-slate-600 group-hover:text-violet-400 transition-all transform group-hover:translate-x-1" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        {/* Activity Progress Bar Mini */}
                                        <div className="absolute bottom-0 left-0 h-1 bg-violet-600/20 w-full">
                                            <div
                                                className={cn(
                                                    "h-full transition-all duration-1000 ease-out",
                                                    (sub.percentage || 0) >= 60 ? "bg-green-500/50" : "bg-red-500/50"
                                                )}
                                                style={{ width: `${sub.percentage}%` }}
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>

                    <Pagination
                        currentPage={page}
                        totalPages={totalPages}
                        onPageChange={setPage}
                    />
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-24 bg-slate-900/20 rounded-3xl border border-dashed border-slate-800">
                    <div className="bg-slate-800/50 p-6 rounded-full mb-6">
                        <History className="h-12 w-12 text-slate-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                        {search ? "No results found" : "No submission history"}
                    </h3>
                    <p className="text-slate-400 max-w-xs text-center">
                        {search ? `We couldn't find any submissions for "${search}"` : "You haven't taken any quizzes yet. Start learning today!"}
                    </p>
                    <Button asChild variant="outline" className="mt-8 border-slate-700">
                        <Link href="/quizzes/browse">Browse Quizzes</Link>
                    </Button>
                </div>
            )}
        </div>
    );
}
