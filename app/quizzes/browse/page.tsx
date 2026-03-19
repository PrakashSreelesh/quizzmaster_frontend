"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Quiz } from "@/lib/types";
import { QuizCard } from "@/components/quizzes/QuizCard";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { Search, SlidersHorizontal, BookOpen } from "lucide-react";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { useToast } from "@/context/ToastContext";

export default function BrowseQuizzesPage() {
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");
    const { error: toastError } = useToast();

    useEffect(() => {
        const fetchQuizzes = async () => {
            try {
                const response = await api.get("/quizzes/published");
                setQuizzes(response.data);
            } catch (error: any) {
                console.error("Failed to fetch quizzes", error);
                // Don't show toast for 401 as interceptor handles redirect
                if (error.response?.status !== 401) {
                    toastError("Could not connect to the server. Please check your connection.");
                }
            } finally {
                setIsLoading(false);
            }
        };
        fetchQuizzes();
    }, [toastError]);

    const filteredQuizzes = quizzes.filter((quiz) =>
        quiz.title.toLowerCase().includes(search.toLowerCase()) ||
        quiz.description.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <Breadcrumbs items={[{ label: "Browse Quizzes" }]} />

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                <div className="max-w-xl">
                    <h1 className="text-4xl font-bold text-white mb-2">Explore <span className="gradient-text">Quizzes</span></h1>
                    <p className="text-slate-400">Discover interactive quizzes created by instructors to challenge your knowledge.</p>
                </div>

                <div className="flex items-center space-x-3 w-full md:w-auto">
                    <div className="relative flex-grow md:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                        <Input
                            placeholder="Search quizzes..."
                            className="pl-10 h-10"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <button className="flex items-center space-x-2 px-4 h-10 rounded-lg border border-white/5 bg-slate-900/50 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
                        <SlidersHorizontal className="h-4 w-4" />
                        <span className="text-sm font-medium">Filter</span>
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <Skeleton key={i} className="h-64 rounded-xl" />
                    ))}
                </div>
            ) : filteredQuizzes.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-700">
                    {filteredQuizzes.map((quiz) => (
                        <QuizCard key={quiz.id} quiz={quiz} />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 bg-slate-900/20 rounded-3xl border border-dashed border-slate-800">
                    <div className="bg-slate-800/50 p-6 rounded-full mb-6">
                        <BookOpen className="h-12 w-12 text-slate-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">No quizzes found</h3>
                    <p className="text-slate-400 max-w-xs text-center">
                        {search ? `We couldn't find any results for "${search}"` : "There are no published quizzes available at the moment."}
                    </p>
                </div>
            )}
        </div>
    );
}
