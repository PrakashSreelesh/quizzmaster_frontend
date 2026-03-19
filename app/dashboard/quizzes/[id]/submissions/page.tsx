"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { Submission, Quiz } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Users, FileText, Calendar, CheckCircle2, ChevronRight, Search, Download } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/Input";

export default function InstructorQuizSubmissionsPage() {
    const { id } = useParams();
    const router = useRouter();
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [subRes, quizRes] = await Promise.all([
                    api.get(`/submissions/quiz/${id}`),
                    api.get(`/quizzes/${id}`)
                ]);
                setSubmissions(subRes.data);
                setQuiz(quizRes.data);
            } catch (err: any) {
                console.error("Failed to fetch submissions", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const filteredSubmissions = submissions.filter(s =>
        s.student_name?.toLowerCase().includes(search.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)]">
                <Spinner className="h-12 w-12 mb-4" />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <Breadcrumbs items={[
                { label: "Dashboard", href: "/dashboard" },
                { label: quiz?.title || "Quiz", href: `/dashboard/quizzes/${id}/edit` },
                { label: "Submissions" }
            ]} />

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                <div>
                    <h1 className="text-4xl font-bold text-white mb-2">Quiz <span className="gradient-text">Submissions</span></h1>
                    <p className="text-slate-400">Viewing all student attempts for &quot;{quiz?.title}&quot;</p>
                </div>

                <div className="flex items-center space-x-3">
                    <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                        <Input
                            placeholder="Search student..."
                            className="pl-10 h-10"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <Button variant="outline" size="sm" className="border-slate-800 h-10">
                        <Download className="h-4 w-4 mr-2" /> Export CSV
                    </Button>
                </div>
            </div>

            <Card className="border-white/5 bg-slate-900/40 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-white/5 bg-slate-950/40">
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Student</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Date</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">Score</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">Percentage</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredSubmissions.length > 0 ? (
                                filteredSubmissions.map((sub) => (
                                    <tr key={sub.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="w-8 h-8 rounded-full bg-violet-500/10 text-violet-400 flex items-center justify-center mr-3 font-bold text-xs border border-violet-500/20 uppercase">
                                                    {sub.student_name?.[0] || "S"}
                                                </div>
                                                <span className="font-medium text-white">{sub.student_name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-400">
                                            {new Date(sub.submitted_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-white font-mono text-center">
                                            {sub.score}/{sub.max_score}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={cn(
                                                "px-2 py-1 rounded-full text-[10px] font-bold border",
                                                (sub.percentage || 0) >= 60
                                                    ? "bg-green-500/10 text-green-400 border-green-500/20"
                                                    : "bg-red-500/10 text-red-400 border-red-500/20"
                                            )}>
                                                {(sub.percentage || 0).toFixed(1)}%
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Button variant="ghost" size="sm" asChild className="group-hover:text-violet-400 h-8">
                                                <Link href={`#`}>
                                                    View Details
                                                </Link>
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="py-20 text-center text-slate-500">
                                        No submissions found matching your search.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}
