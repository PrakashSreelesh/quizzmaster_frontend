"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Quiz } from "@/lib/types";
import { InstructorQuizCard } from "@/components/instructor/InstructorQuizCard";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { Plus, LayoutDashboard, BarChart3, Users, PlusCircle, Search } from "lucide-react";
import { Pagination } from "@/components/ui/Pagination";
import { Input } from "@/components/ui/Input";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useToast } from "@/context/ToastContext";

export default function InstructorDashboardPage() {
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    const { isInstructor, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const { success: toastSuccess, error: toastError } = useToast();

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1); // Reset to first page on new search
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    useEffect(() => {
        if (!authLoading && !isInstructor) {
            router.push("/");
        }
    }, [isInstructor, authLoading, router]);

    const fetchQuizzes = async () => {
        setIsLoading(true);
        try {
            const response = await api.get("/quizzes/my", {
                params: {
                    search: debouncedSearch || undefined,
                    page,
                    limit: 9 // 3x3 grid looks better
                }
            });
            // The interceptor unwraps GenericResponse data
            const { items, pagination } = response.data;
            setQuizzes(items);
            setTotalPages(pagination.totalPages);
            setTotalItems(pagination.total);
        } catch (error: any) {
            console.error("Failed to fetch own quizzes", error);
            if (error.response?.status !== 401) {
                toastError("Failed to load your quizzes.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isInstructor) fetchQuizzes();
    }, [isInstructor, debouncedSearch, page]);

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this quiz? This action is irreversible.")) return;
        try {
            await api.delete(`/quizzes/${id}`);
            // If it's the last item on the page, go to prev page
            if (quizzes.length === 1 && page > 1) {
                setPage(page - 1);
            } else {
                fetchQuizzes();
            }
            toastSuccess("Quiz deleted successfully.");
        } catch (error) {
            toastError("Failed to delete quiz.");
        }
    };

    const handleTogglePublish = async (id: string, published: boolean) => {
        try {
            await api.put(`/quizzes/${id}`, { is_published: published });
            setQuizzes(prev => prev.map(q => q.id === id ? { ...q, is_published: published } : q));
            toastSuccess(published ? "Quiz published." : "Quiz unpublished.");
        } catch (error) {
            toastError("Failed to update quiz status.");
        }
    };

    if (authLoading) return null;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <div>
                    <div className="flex items-center space-x-2 text-violet-400 mb-2">
                        <LayoutDashboard className="h-5 w-5" />
                        <span className="text-sm font-bold uppercase tracking-widest">Instructor Dashboard</span>
                    </div>
                    <h1 className="text-4xl font-bold text-white mb-2">Welcome Back, <span className="gradient-text">Educator</span></h1>
                    <p className="text-slate-400">Manage your quizzes, track student scores, and analyze performance.</p>
                </div>

                <div className="flex items-center space-x-4">
                    <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                        <Input
                            placeholder="Search quizzes..."
                            className="pl-10 bg-slate-900/40 border-white/5 h-11"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <Button asChild size="lg" className="rounded-xl shadow-violet-500/20 shadow-xl h-11">
                        <Link href="/dashboard/quizzes/new">
                            <Plus className="h-5 w-5 mr-2" />
                            New Quiz
                        </Link>
                    </Button>
                </div>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-72 rounded-3xl bg-slate-900/40" />)}
                </div>
            ) : quizzes.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-700">
                        {quizzes.map((quiz) => (
                            <InstructorQuizCard
                                key={quiz.id}
                                quiz={quiz}
                                onDelete={handleDelete}
                                onTogglePublish={handleTogglePublish}
                            />
                        ))}
                    </div>

                    <Pagination
                        currentPage={page}
                        totalPages={totalPages}
                        onPageChange={setPage}
                    />
                </>
            ) : (
                <div className="flex flex-col items-center justify-center py-24 bg-slate-900/20 rounded-3xl border border-dashed border-slate-800">
                    <div className="bg-slate-800/50 p-6 rounded-full mb-6 text-slate-500">
                        <PlusCircle className="h-12 w-12" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                        {search ? "No results found" : "No quizzes yet"}
                    </h3>
                    <p className="text-slate-400 max-w-xs text-center mb-8">
                        {search ? `We couldn't find anything matching "${search}"` : "Create your first quiz to start engaging with your students."}
                    </p>
                    {search ? (
                        <Button variant="ghost" onClick={() => setSearch("")}>Clear Search</Button>
                    ) : (
                        <Button asChild variant="outline" className="border-slate-700">
                            <Link href="/dashboard/quizzes/new">Create Your First Quiz</Link>
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
}
