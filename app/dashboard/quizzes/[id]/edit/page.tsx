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
import { Trash2, Edit, Plus, Save, Eye, EyeOff, Loader2, GripVertical, AlertCircle, ChevronDown, ChevronUp, HelpCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/context/ToastContext";
import Link from "next/link";

export default function EditQuizPage() {
    const { id } = useParams();
    const router = useRouter();
    const { success: toastSuccess, error: toastError } = useToast();

    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [editingQuestionId, setEditingQuestionId] = useState<string | 'new' | null>(null);
    const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(null);

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
        fetchData();
    }, [id]);

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
                <div>
                    <h1 className="text-4xl font-bold text-white mb-2">{quiz.title}</h1>
                    <p className="text-slate-400">Editing metadata and {questions.length} questions</p>
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
                    <Card className="border-white/5 bg-slate-900/40">
                        <CardHeader>
                            <CardTitle className="text-lg">Metadata</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-500 uppercase">Title</label>
                                <Input
                                    value={quiz.title}
                                    onChange={(e) => setQuiz({ ...quiz, title: e.target.value })}
                                    onBlur={() => handleUpdateQuiz({ title: quiz.title })}
                                    className="h-10 text-sm"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-500 uppercase">Description</label>
                                <textarea
                                    className="w-full rounded-md border border-border bg-slate-900/50 p-2 text-xs text-white h-24 focus:outline-none focus:ring-1 focus:ring-violet-500"
                                    value={quiz.description}
                                    onChange={(e) => setQuiz({ ...quiz, description: e.target.value })}
                                    onBlur={() => handleUpdateQuiz({ description: quiz.description })}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-500 uppercase">Time Limit (m)</label>
                                <Input
                                    type="number"
                                    value={quiz.time_limit_minutes || ""}
                                    onChange={(e) => setQuiz({ ...quiz, time_limit_minutes: e.target.value ? parseInt(e.target.value) : null })}
                                    onBlur={() => handleUpdateQuiz({ time_limit_minutes: quiz.time_limit_minutes })}
                                    className="h-10 text-sm"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-blue-500/20 bg-blue-500/5">
                        <CardContent className="p-4 flex items-center space-x-3 text-xs text-blue-300">
                            <AlertCircle className="h-4 w-4 shrink-0" />
                            <p>Quiz changes are saved automatically when fields lose focus (onBlur).</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Main: Question Builder */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-2xl font-bold text-white">Question Builder</h2>
                        <Button size="sm" onClick={() => setEditingQuestionId('new')} className="rounded-full">
                            <Plus className="h-4 w-4 mr-2" /> Add Question
                        </Button>
                    </div>

                    <div className="space-y-4">
                        {editingQuestionId === 'new' && (
                            <QuestionEditor
                                onSave={handleSaveQuestion}
                                onCancel={() => setEditingQuestionId(null)}
                                isSaving={isSaving}
                            />
                        )}

                        {questions.length === 0 && editingQuestionId !== 'new' && (
                            <div className="py-20 text-center border-2 border-dashed border-slate-800 rounded-3xl bg-slate-900/20">
                                <HelpCircle className="h-12 w-12 text-slate-700 mx-auto mb-4" />
                                <p className="text-slate-500">Your quiz doesn&apos;t have any questions yet.</p>
                            </div>
                        )}

                        {questions.map((q, idx) => (
                            <div key={q.id}>
                                {editingQuestionId === q.id ? (
                                    <QuestionEditor
                                        question={q}
                                        onSave={handleSaveQuestion}
                                        onCancel={() => setEditingQuestionId(null)}
                                        isSaving={isSaving}
                                    />
                                ) : (
                                    <Card className="border-white/5 bg-slate-900/40 overflow-hidden group">
                                        <div className="flex items-center p-4">
                                            <GripVertical className="h-4 w-4 text-slate-700 mr-4 shrink-0 cursor-grab active:cursor-grabbing" />
                                            <div className="flex-grow min-w-0">
                                                <div className="flex items-center space-x-2 mb-1">
                                                    <span className="text-[10px] font-bold text-violet-400 uppercase tracking-widest bg-violet-400/10 px-1.5 py-0.5 rounded">
                                                        {q.question_type.replace('_', ' ')}
                                                    </span>
                                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                                        {q.points} Points
                                                    </span>
                                                </div>
                                                <p className="text-white text-sm font-medium line-clamp-1">{q.text}</p>
                                            </div>
                                            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity ml-4">
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-white" onClick={() => setEditingQuestionId(q.id as unknown as string)}>
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-red-400" onClick={() => handleDeleteQuestion(q.id as unknown as string)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-white" onClick={() => setExpandedQuestionId(expandedQuestionId === (q.id as unknown as string) ? null : (q.id as unknown as string))}>
                                                    {expandedQuestionId === (q.id as unknown as string) ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                                </Button>
                                            </div>
                                        </div>

                                        {expandedQuestionId === (q.id as unknown as string) && (
                                            <CardContent className="bg-slate-950/30 pt-4 pb-6 px-12 animate-in slide-in-from-top-2 duration-300">
                                                <div className="space-y-2">
                                                    <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest block mb-2">Options</span>
                                                    {q.options.map((opt, i) => (
                                                        <div key={i} className="flex items-center space-x-3 text-sm">
                                                            {q.question_type !== 'short_answer' && (
                                                                <div className={cn(
                                                                    "w-4 h-4 rounded-full border flex items-center justify-center shrink-0",
                                                                    opt.is_correct ? "bg-green-500 border-green-500" : "border-slate-800"
                                                                )}>
                                                                    {opt.is_correct && <CheckCircle2 className="h-2 w-2 text-white" />}
                                                                </div>
                                                            )}
                                                            <span className={cn(
                                                                opt.is_correct ? "text-green-400 font-medium" : "text-slate-400"
                                                            )}>{opt.text}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </CardContent>
                                        )}
                                    </Card>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
