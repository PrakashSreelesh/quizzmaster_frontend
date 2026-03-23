"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { Quiz, Question } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { QuestionEditor } from "@/components/instructor/QuestionEditor";
import { Skeleton } from "@/components/ui/Skeleton";
import { Trash2, Edit, Plus, Save, Eye, EyeOff, Loader2, GripVertical, AlertCircle, ChevronDown, ChevronUp, HelpCircle, CheckCircle2, Users, Tag, Pencil, Check, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/context/ToastContext";
import Link from "next/link";
import { TagInput } from "@/components/ui/TagInput";

export default function EditQuizPage() {
    const { id } = useParams();
    const router = useRouter();
    const { success: toastSuccess, error: toastError } = useToast();

    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [allCategories, setAllCategories] = useState<string[]>([]);
    const [editingQuestionId, setEditingQuestionId] = useState<string | 'new' | null>(null);
    const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(null);
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [tempTitle, setTempTitle] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [quizRes, qRes] = await Promise.all([
                    api.get(`/quizzes/${id}`),
                    api.get(`/quizzes/${id}/questions`)
                ]);
                setQuiz(quizRes.data);
                setQuestions(qRes.data);
            } catch (err: any) {
                console.error("Failed to fetch quiz data", err);
                if (err.response?.status !== 401) {
                    toastError("Failed to load quiz data.");
                }
            } finally {
                setIsLoading(false);
            }
        };
        const fetchAllCategories = async () => {
            try {
                const response = await api.get("/categories/");
                const cats = response.data.data || response.data;
                setAllCategories(cats.map((c: any) => c.name));
            } catch (err) {
                console.error("Failed to fetch all categories", err);
            }
        };

        fetchData();
        fetchAllCategories();
    }, [id, toastError]);

    useEffect(() => {
        if (quiz) setTempTitle(quiz.title);
    }, [quiz]);

    const handleUpdateQuiz = async (data: Partial<Quiz>) => {
        setIsSaving(true);
        try {
            const res = await api.put(`/quizzes/${id}`, data);
            setQuiz(res.data);
            toastSuccess("Quiz updated.");
        } catch (err: any) {
            if (err.response?.status !== 401) {
                toastError("Failed to update quiz.");
            }
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveQuestion = async (qData: Partial<Question>) => {
        setIsSaving(true);
        try {
            if (editingQuestionId === 'new') {
                const res = await api.post(`/quizzes/${id}/questions`, {
                    ...qData,
                    order: questions.length
                });
                setQuestions([...questions, res.data]);
            } else {
                const res = await api.put(`/quizzes/${id}/questions/${editingQuestionId}`, qData);
                setQuestions(questions.map(q => (q.id as unknown as string) === editingQuestionId ? res.data : q));
            }
            setEditingQuestionId(null);
            toastSuccess("Question saved.");
        } catch (err: any) {
            if (err.response?.status !== 401) {
                toastError("Failed to save question.");
            }
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteQuestion = async (qId: string) => {
        if (!confirm("Are you sure?")) return;
        try {
            await api.delete(`/quizzes/${id}/questions/${qId}`);
            setQuestions(questions.filter(q => (q.id as unknown as string) !== qId));
            toastSuccess("Question deleted.");
        } catch (err: any) {
            if (err.response?.status !== 401) {
                toastError("Failed to delete question.");
            }
        }
    };

    if (isLoading) {
        return (
            <div className="max-w-5xl mx-auto px-4 py-10 space-y-8">
                <Skeleton className="h-6 w-64" />
                <Skeleton className="h-32 rounded-2xl" />
                <Skeleton className="h-[400px] rounded-2xl" />
            </div>
        );
    }

    if (!quiz) return <div className="p-10 text-center">Quiz not found.</div>;

    return (
        <div className="max-w-5xl mx-auto px-4 py-8 md:py-12">
            <Breadcrumbs items={[{ label: "Dashboard", href: "/dashboard" }, { label: "Edit Quiz" }]} />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div className="flex-1">
                    <div className="flex items-center gap-3 group">
                        {isEditingTitle ? (
                            <div className="flex items-center gap-2 flex-grow max-w-2xl">
                                <Input
                                    value={tempTitle}
                                    onChange={(e) => setTempTitle(e.target.value)}
                                    className="text-3xl font-bold h-12 bg-slate-900/50 border-violet-500/50 focus:ring-violet-500/50"
                                    autoFocus
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            handleUpdateQuiz({ title: tempTitle });
                                            setIsEditingTitle(false);
                                        } else if (e.key === 'Escape') {
                                            setTempTitle(quiz.title);
                                            setIsEditingTitle(false);
                                        }
                                    }}
                                />
                                <Button
                                    size="icon"
                                    className="shrink-0 h-12 w-12 rounded-xl bg-violet-600 hover:bg-violet-500"
                                    onClick={() => {
                                        handleUpdateQuiz({ title: tempTitle });
                                        setIsEditingTitle(false);
                                    }}
                                >
                                    <Check className="h-6 w-6" />
                                </Button>
                            </div>
                        ) : (
                            <>
                                <h1 className="text-4xl font-bold text-white leading-tight">{quiz.title}</h1>
                                <button
                                    onClick={() => setIsEditingTitle(true)}
                                    className="p-2 text-slate-500 hover:text-violet-400 hover:bg-violet-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                    title="Edit title"
                                >
                                    <Pencil className="h-5 w-5" />
                                </button>
                            </>
                        )}
                    </div>
                    <div className="flex items-center mt-2 text-blue-400/80 text-sm font-medium">
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Quiz changes are saved automatically
                    </div>
                </div>
                <div className="flex items-center space-x-3">
                    <Button
                        variant="outline"
                        className={cn(
                            "border-slate-800",
                            quiz.is_published ? "text-green-400 hover:text-green-300" : "text-slate-400"
                        )}
                        onClick={() => {
                            if (!quiz.is_published && questions.length === 0) {
                                toastError("Cannot publish a quiz with no questions.");
                                return;
                            }
                            handleUpdateQuiz({ is_published: !quiz.is_published });
                        }}
                        disabled={isSaving}
                    >
                        {quiz.is_published ? (
                            <><Eye className="h-4 w-4 mr-2" /> Published</>
                        ) : (
                            <><EyeOff className="h-4 w-4 mr-2" /> Draft</>
                        )}
                    </Button>
                    <Button asChild variant="secondary">
                        <Link href={`/quizzes/${id}`}>View Public Page</Link>
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
                {/* Sidebar: Details */}
                <div className="space-y-6">

                    <Card className="border-white/5 bg-slate-900/40 relative z-20">
                        <CardHeader>
                            <CardTitle className="text-lg">Metadata</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-500 uppercase">Description</label>
                                <textarea
                                    className="w-full rounded-md border border-border bg-slate-900/50 p-2 text-xs text-white h-24 focus:outline-none focus:ring-1 focus:ring-violet-500"
                                    value={quiz.description}
                                    onChange={(e) => setQuiz({ ...quiz, description: e.target.value })}
                                    onBlur={() => handleUpdateQuiz({ description: quiz.description })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase">Time (min)</label>
                                    <Input
                                        type="number"
                                        value={quiz.time_limit_minutes || ""}
                                        onChange={(e) => setQuiz({ ...quiz, time_limit_minutes: e.target.value ? parseInt(e.target.value) : null })}
                                        onBlur={() => handleUpdateQuiz({ time_limit_minutes: quiz.time_limit_minutes })}
                                        className="h-10 text-sm"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase">Attempts</label>
                                    <Input
                                        type="number"
                                        value={quiz.max_attempts}
                                        onChange={(e) => setQuiz({ ...quiz, max_attempts: e.target.value ? parseInt(e.target.value) : 1 })}
                                        onBlur={() => handleUpdateQuiz({ max_attempts: quiz.max_attempts })}
                                        className="h-10 text-sm"
                                        min={1}
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center">
                                    <Tag className="h-3 w-3 mr-1" />
                                    Categories
                                </label>
                                <TagInput
                                    tags={quiz.categories || []}
                                    onTagsChange={(tags) => {
                                        setQuiz({ ...quiz, categories: tags });
                                        handleUpdateQuiz({ categories: tags });
                                    }}
                                    suggestions={allCategories}
                                    placeholder="Add category..."
                                />
                                <p className="text-[10px] text-slate-500 italic mt-1">Press Enter or use commas.</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main: Question Builder */}
                <div className="lg:col-span-2 space-y-6 overflow-hidden">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-4">
                            <h2 className="text-2xl font-bold text-white">Questions</h2>
                            <span className="bg-slate-800 text-slate-400 px-2 py-0.5 rounded text-xs font-medium">
                                {questions.length} total
                            </span>
                        </div>
                        <Button size="sm" onClick={() => setEditingQuestionId('new')} className="rounded-full">
                            <Plus className="h-4 w-4 mr-2" /> Add Question
                        </Button>
                    </div>

                    <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                        {editingQuestionId === 'new' && (
                            <QuestionEditor
                                onSave={handleSaveQuestion}
                                onCancel={() => setEditingQuestionId(null)}
                                isSaving={isSaving}
                            />
                        )}

                        {questions
                            .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                            .map((question, index) => (
                                <Card key={question.id || index} className={cn(
                                    "border-white/5 bg-slate-900/40 overflow-hidden transition-all duration-300",
                                    editingQuestionId === question.id ? "ring-2 ring-violet-500/50" : "hover:border-white/10"
                                )}>
                                    {editingQuestionId === question.id ? (
                                        <QuestionEditor
                                            question={question}
                                            onSave={handleSaveQuestion}
                                            onCancel={() => setEditingQuestionId(null)}
                                            isSaving={isSaving}
                                        />
                                    ) : (
                                        <>
                                            <div
                                                className="p-4 cursor-pointer flex items-center justify-between group"
                                                onClick={() => setExpandedQuestionId(expandedQuestionId === question.id ? null : question.id as string)}
                                            >
                                                <div className="flex items-center space-x-4 flex-1 min-w-0">
                                                    <div className="bg-slate-800/80 rounded-lg h-10 w-10 flex items-center justify-center shrink-0 border border-white/5 text-slate-400 group-hover:text-violet-400 transition-colors">
                                                        {(currentPage - 1) * itemsPerPage + index + 1}
                                                    </div>
                                                    <div className="truncate flex-1">
                                                        <p className="font-medium text-slate-200 truncate">{question.text}</p>
                                                        <div className="flex items-center mt-1 space-x-3 text-[10px] text-slate-500 uppercase tracking-wider font-bold">
                                                            <span>{question.question_type.replace('_', ' ')}</span>
                                                            <span>•</span>
                                                            <span>{question.points} Points</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-1 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-slate-400 hover:text-violet-400 hover:bg-violet-500/10"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setEditingQuestionId(question.id as string);
                                                        }}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-slate-400 hover:text-red-400 hover:bg-red-500/10"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteQuestion(question.id as string);
                                                        }}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                    {expandedQuestionId === question.id ? (
                                                        <ChevronUp className="h-4 w-4 text-slate-600 ml-1" />
                                                    ) : (
                                                        <ChevronDown className="h-4 w-4 text-slate-600 ml-1" />
                                                    )}
                                                </div>
                                            </div>

                                            {expandedQuestionId === question.id && (
                                                <div className="px-6 pb-6 pt-2 border-t border-white/5 animate-in slide-in-from-top-2 duration-300">
                                                    <div className="space-y-4">
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            {question.options?.map((opt, i) => (
                                                                <div
                                                                    key={i}
                                                                    className={cn(
                                                                        "p-3 rounded-xl border text-sm flex items-center justify-between",
                                                                        opt.is_correct
                                                                            ? "bg-green-500/10 border-green-500/30 text-green-400"
                                                                            : "bg-slate-900/50 border-white/5 text-slate-400"
                                                                    )}
                                                                >
                                                                    <span className="flex-1">{opt.text}</span>
                                                                    {opt.is_correct && <CheckCircle2 className="h-4 w-4 ml-2 shrink-0" />}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </Card>
                            ))}

                        {questions.length > itemsPerPage && (
                            <div className="flex items-center justify-center space-x-2 pt-4">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                    className="border-slate-800 text-slate-400"
                                >
                                    <ChevronLeft className="h-4 w-4 mr-1" /> Prev
                                </Button>
                                <span className="text-sm text-slate-500 px-4">
                                    Page {currentPage} of {Math.ceil(questions.length / itemsPerPage)}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(prev => Math.min(Math.ceil(questions.length / itemsPerPage), prev + 1))}
                                    disabled={currentPage === Math.ceil(questions.length / itemsPerPage)}
                                    className="border-slate-800 text-slate-400"
                                >
                                    Next <ChevronRight className="h-4 w-4 ml-1" />
                                </Button>
                            </div>
                        )}

                        {questions.length === 0 && !editingQuestionId && (
                            <div className="text-center py-20 bg-slate-900/20 rounded-2xl border border-dashed border-white/5">
                                <HelpCircle className="h-12 w-12 text-slate-700 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-slate-300">No questions yet</h3>
                                <p className="text-slate-500 mb-6">Start building your quiz by adding your first question.</p>
                                <Button onClick={() => setEditingQuestionId('new')} className="rounded-full">
                                    <Plus className="h-4 w-4 mr-2" /> Add Your First Question
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
