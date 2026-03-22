import Link from "next/link";
import { Quiz } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Clock, BookOpen, User, Play } from "lucide-react";

interface QuizCardProps {
    quiz: Quiz;
}

export function QuizCard({ quiz }: QuizCardProps) {
    return (
        <Card className="flex flex-col h-full group transition-all duration-300 hover:shadow-2xl hover:shadow-violet-500/10 border-white/5 bg-slate-900/40">
            <CardHeader>
                <div className="flex justify-between items-start mb-2">
                    <div className="bg-violet-500/10 text-violet-400 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-violet-500/20">
                        {quiz.question_count || 0} Questions
                    </div>
                    {quiz.time_limit_minutes && (
                        <div className="flex items-center text-slate-500 text-[10px] font-medium">
                            <Clock className="h-3 w-3 mr-1" />
                            {quiz.time_limit_minutes}m
                        </div>
                    )}
                </div>
                <CardTitle className="text-xl group-hover:text-violet-400 transition-colors line-clamp-1">
                    {quiz.title}
                </CardTitle>
                <CardDescription className="line-clamp-2 min-h-[2.5rem]">
                    {quiz.description || "No description provided."}
                </CardDescription>
            </CardHeader>

            <CardContent className="flex-grow">
                <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center text-slate-400">
                        <User className="h-4 w-4 mr-2 text-slate-500" />
                        <span>{quiz.instructor_name || "Guest Instructor"}</span>
                    </div>
                    {quiz.user_attempts !== undefined && (
                        <div className="text-[11px] font-medium text-slate-500">
                            Attempts: <span className={cn(
                                quiz.user_attempts >= quiz.max_attempts ? "text-red-400" : "text-violet-400"
                            )}>
                                {quiz.user_attempts}/{quiz.max_attempts}
                            </span>
                        </div>
                    )}
                </div>
            </CardContent>

            <CardFooter className="pt-0">
                <Button asChild className="w-full group/btn">
                    <Link href={`/quizzes/${quiz.id}`}>
                        View Quiz
                        <Play className="h-4 w-4 ml-2 fill-current transition-transform group-hover/btn:translate-x-1" />
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    );
}
