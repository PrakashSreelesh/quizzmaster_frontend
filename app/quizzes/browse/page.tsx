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
import { Pagination } from "@/components/ui/Pagination";
import { Category } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function BrowseQuizzesPage() {
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>("");
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const { error: toastError } = useToast();

    // Fetch categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await api.get("/categories/");
                setCategories(response.data);
            } catch (error) {
                console.error("Failed to fetch categories", error);
            }
        };
        fetchCategories();
    }, []);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    const fetchQuizzes = async () => {
        setIsLoading(true);
        try {
            const response = await api.get("/quizzes/published", {
                params: {
                    search: debouncedSearch || undefined,
                    category: selectedCategory || undefined,
                    page,
                    limit: 12
                }
            });
            const { items, pagination } = response.data;
            setQuizzes(items);
            setTotalPages(pagination.totalPages);
        } catch (error: any) {
            console.error("Failed to fetch quizzes", error);
            if (error.response?.status !== 401) {
                toastError("Could not connect to the server. Please check your connection.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchQuizzes();
    }, [debouncedSearch, selectedCategory, page]);

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
                            className="pl-10 h-10 bg-slate-900/40 border-white/5"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Categories Filter */}
            {categories.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-10 pb-2 overflow-x-auto no-scrollbar animate-in slide-in-from-left duration-500">
                    <button
                        onClick={() => setSelectedCategory("")}
                        className={cn(
                            "px-4 py-2 rounded-full text-sm font-semibold transition-all whitespace-nowrap border",
                            selectedCategory === ""
                                ? "bg-violet-600 border-violet-500 text-white shadow-lg shadow-violet-500/20"
                                : "bg-slate-900/40 border-white/5 text-slate-400 hover:bg-slate-800 hover:text-white"
                        )}
                    >
                        All Quizzes
                    </button>
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.name)}
                            className={cn(
                                "px-4 py-2 rounded-full text-sm font-semibold transition-all whitespace-nowrap border",
                                selectedCategory === cat.name
                                    ? "bg-violet-600 border-violet-500 text-white shadow-lg shadow-violet-500/20"
                                    : "bg-slate-900/40 border-white/5 text-slate-400 hover:bg-slate-800 hover:text-white"
                            )}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>
            )
            }

            {
                isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <Skeleton key={i} className="h-64 rounded-xl bg-slate-900/40" />
                        ))}
                    </div>
                ) : quizzes.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-700">
                            {quizzes.map((quiz) => (
                                <QuizCard key={quiz.id} quiz={quiz} />
                            ))}
                        </div>

                        <Pagination
                            currentPage={page}
                            totalPages={totalPages}
                            onPageChange={setPage}
                        />
                    </>
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
                )
            }
        </div>
    );
}
