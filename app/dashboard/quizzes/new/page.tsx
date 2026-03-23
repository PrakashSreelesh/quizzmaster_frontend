"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Plus, ChevronRight, Loader2, BookOpen, Clock, FileText, Users, Tag } from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { ImportModal } from "@/components/instructor/ImportModal";
import { TagInput } from "@/components/ui/TagInput";
import { Category } from "@/lib/types";

export default function NewQuizPage() {
    const router = useRouter();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [timeLimit, setTimeLimit] = useState<number | "">("");
    const [maxAttempts, setMaxAttempts] = useState<number | "">(1);
    const [categories, setCategories] = useState<string[]>([]);
    const [allCategories, setAllCategories] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { error: toastError } = useToast();

    const [showImportModal, setShowImportModal] = useState(false);

    // Fetch existing categories for suggestions
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await api.get("/categories/");
                // Handle different response formats (backend returns data: Category[])
                const cats = response.data.data || response.data;
                setAllCategories(cats.map((c: any) => c.name));
            } catch (err) {
                console.error("Failed to fetch categories", err);
            }
        };
        fetchCategories();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await api.post("/quizzes/", {
                title,
                description,
                time_limit_minutes: timeLimit === "" ? null : timeLimit,
                max_attempts: maxAttempts === "" ? 1 : maxAttempts,
                categories,
            });
            router.push(`/dashboard/quizzes/${response.data.id}/edit`);
        } catch (err: any) {
            toastError(err.response?.data?.detail || "Failed to create quiz.");
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto px-4 py-10">
            <Breadcrumbs items={[{ label: "Dashboard", href: "/dashboard" }, { label: "New Quiz" }]} />

            <div className="mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-bold text-white mb-2">Create New <span className="gradient-text">Quiz</span></h1>
                    <p className="text-slate-400">Set up the foundations of your quiz. You can add questions in the next step.</p>
                </div>
                <Button
                    variant="outline"
                    onClick={() => setShowImportModal(true)}
                    className="border-violet-500/30 text-violet-400 hover:bg-violet-500/10 h-11"
                >
                    <FileText className="h-4 w-4 mr-2" />
                    Import from Excel
                </Button>
            </div>

            {showImportModal && (
                <ImportModal
                    onClose={() => setShowImportModal(false)}
                    onComplete={(quizId: string) => router.push(`/dashboard/quizzes/${quizId}/edit`)}
                />
            )}

            <Card className="border-white/5 bg-slate-900/40">
                <form onSubmit={handleSubmit}>
                    <CardHeader>
                        <CardTitle>Quiz Details</CardTitle>
                        <CardDescription>Basic information about your quiz</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300 flex items-center">
                                <FileText className="h-4 w-4 mr-2 text-slate-500" />
                                Quiz Title
                            </label>
                            <Input
                                required
                                placeholder="e.g. Introduction to Python"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                disabled={isLoading}
                                className="h-12"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300 flex items-center">
                                <BookOpen className="h-4 w-4 mr-2 text-slate-500" />
                                Description
                            </label>
                            <textarea
                                className="flex min-h-[120px] w-full rounded-lg border border-border bg-slate-900/50 px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-transparent transition-all disabled:cursor-not-allowed disabled:opacity-50 text-white"
                                placeholder="Give your students some context about this quiz..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300 flex items-center">
                                <Clock className="h-4 w-4 mr-2 text-slate-500" />
                                Time Limit (Minutes)
                            </label>
                            <Input
                                type="number"
                                placeholder="Leave blank for no limit"
                                value={timeLimit}
                                onChange={(e) => setTimeLimit(e.target.value === "" ? "" : parseInt(e.target.value))}
                                disabled={isLoading}
                                min={1}
                                className="h-12"
                            />
                            <p className="text-xs text-slate-500 italic">Students will see a countdown during the quiz.</p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300 flex items-center">
                                <Users className="h-4 w-4 mr-2 text-slate-500" />
                                Max Attempts
                            </label>
                            <Input
                                type="number"
                                placeholder="1"
                                value={maxAttempts}
                                onChange={(e) => setMaxAttempts(e.target.value === "" ? "" : parseInt(e.target.value))}
                                disabled={isLoading}
                                min={1}
                                className="h-12"
                            />
                            <p className="text-xs text-slate-500 italic">Total number of times a student can take this quiz.</p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300 flex items-center">
                                <Tag className="h-4 w-4 mr-2 text-slate-500" />
                                Categories
                            </label>
                            <TagInput
                                tags={categories}
                                onTagsChange={setCategories}
                                suggestions={allCategories}
                                placeholder="e.g. IT, Programming, Python"
                                disabled={isLoading}
                            />
                            <p className="text-xs text-slate-500 italic">Press Enter or use commas to add multiple categories.</p>
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-end pt-6 border-t border-white/5">
                        <Button variant="ghost" onClick={() => router.back()} disabled={isLoading} className="mr-2">
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading} className="px-8 shadow-violet-500/20 shadow-lg">
                            {isLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                                <>
                                    Create & Continue
                                    <ChevronRight className="h-4 w-4 ml-2" />
                                </>
                            )}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
