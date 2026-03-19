"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Quiz } from "@/lib/types";
import { InstructorQuizCard } from "@/components/instructor/InstructorQuizCard";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { Plus, LayoutDashboard, BarChart3, Users, PlusCircle } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useToast } from "@/context/ToastContext";

export default function InstructorDashboardPage() {
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { isInstructor, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const { success: toastSuccess, error: toastError } = useToast();

    useEffect(() => {
        if (!authLoading && !isInstructor) {
            router.push("/");
        }
    }, [isInstructor, authLoading, router]);

    const fetchQuizzes = async () => {
        try {
            const response = await api.get("/quizzes/my");
            setQuizzes(response.data);
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
    }, [isInstructor]);

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this quiz? This action is irreversible.")) return;
        try {
            await api.delete(`/quizzes/${id}`);
            setQuizzes(prev => prev.filter(q => q.id !== id));
            toastSuccess("Quiz deleted successfully.");
        } catch (error) {
            toastError("Failed to delete quiz.");
        }
    };

    const handleTogglePublish = async (id: number, published: boolean) => {
        try {
            await api.put(`/quizzes/${id}`, { is_published: published });
            setQuizzes(prev => prev.map(q => q.id === id ? { ...q, is_published: published } : q));
            toastSuccess(published ? "Quiz published." : "Quiz unpublished.");
        } catch (error) {
            toastError("Failed to update quiz status.");
        }
    };

    if (authLoading || isLoading) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-10">
                <Skeleton className="h-10 w-64 mb-10" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-64 rounded-xl" />)}
                </div>
            </div>
        );
    }

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

                <Button asChild size="lg" className="rounded-full shadow-violet-500/20 shadow-xl">
                    <Link href="/dashboard/quizzes/new">
                        <Plus className="h-5 w-5 mr-2" />
                        Create New Quiz
                    </Link>
                </Button>
            </div>

            {quizzes.length > 0 ? (
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
            ) : (
                <div className="flex flex-col items-center justify-center py-24 bg-slate-900/20 rounded-3xl border border-dashed border-slate-800">
                    <div className="bg-slate-800/50 p-6 rounded-full mb-6 text-slate-500">
                        <PlusCircle className="h-12 w-12" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">No quizzes yet</h3>
                    <p className="text-slate-400 max-w-xs text-center mb-8">
                        Create your first quiz to start engaging with your students.
                    </p>
                    <Button asChild variant="outline" className="border-slate-700">
                        <Link href="/dashboard/quizzes/new">Create Your First Quiz</Link>
                    </Button>
                </div>
            )}
        </div>
    );
}
