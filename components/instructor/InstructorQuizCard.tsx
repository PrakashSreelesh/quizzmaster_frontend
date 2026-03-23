"use client";

import { Quiz } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Edit, BarChart3, Users, Trash2, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface InstructorQuizCardProps {
    quiz: Quiz;
    onDelete?: (id: string) => void;
    onTogglePublish?: (id: string, published: boolean) => void;
}

export function InstructorQuizCard({ quiz, onDelete, onTogglePublish }: InstructorQuizCardProps) {
    return (
        <Card className="border-white/5 bg-slate-900/40 hover:bg-slate-900/60 transition-all duration-300">
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <div className={cn(
                        "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border",
                        quiz.is_published
                            ? "bg-green-500/10 text-green-400 border-green-500/20"
                            : "bg-slate-800 text-slate-500 border-slate-700"
                    )}>
                        {quiz.is_published ? "Published" : "Draft"}
                    </div>
                    <div className="flex space-x-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-500 hover:text-white"
                            onClick={() => onTogglePublish?.(quiz.id, !quiz.is_published)}
                            title={quiz.is_published ? "Unpublish" : "Publish"}
                        >
                            {quiz.is_published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-500 hover:text-red-400"
                            onClick={() => onDelete?.(quiz.id)}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
                <CardTitle className="text-xl mt-2 line-clamp-1">{quiz.title}</CardTitle>
                <CardDescription className="line-clamp-2 min-h-[2.5rem]">
                    {quiz.description || "No description provided."}
                </CardDescription>
            </CardHeader>

            <CardContent className="py-4 border-y border-white/5 my-2">
                <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center text-sm text-slate-400">
                        <Users className="h-4 w-4 mr-2 text-slate-500" />
                        <span>Submissions</span>
                    </div>
                    <div className="text-sm font-bold text-white text-right">{quiz.submission_count || 0}</div>

                    <div className="flex items-center text-sm text-slate-400">
                        <BarChart3 className="h-4 w-4 mr-2 text-slate-500" />
                        <span>Avg. Score</span>
                    </div>
                    <div className="text-sm font-bold text-white text-right">{(quiz.average_score || 0).toFixed(1)}%</div>

                    <div className="flex items-center text-sm text-slate-400">
                        <Users className="h-4 w-4 mr-2 text-slate-500" />
                        <span>Max Attempts</span>
                    </div>
                    <div className="text-sm font-bold text-white text-right">{quiz.max_attempts}</div>
                </div>
            </CardContent>

            <CardFooter className="grid grid-cols-2 gap-2 pt-4">
                <Button variant="outline" asChild size="sm" className="w-full border-slate-800">
                    <Link href={`/dashboard/quizzes/${quiz.id}/edit`}>
                        <Edit className="h-3.5 w-3.5 mr-2" />
                        Edit
                    </Link>
                </Button>
                <Button asChild variant="secondary" size="sm" className="w-full">
                    <Link href={`/dashboard/quizzes/${quiz.id}/analytics`}>
                        <BarChart3 className="h-3.5 w-3.5 mr-2" />
                        Stats
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    );
}
