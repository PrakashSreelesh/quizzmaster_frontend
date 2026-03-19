"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Brain, ArrowRight, Loader2, AlertCircle, GraduationCap, ClipboardList, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/context/ToastContext";

export default function RegisterPage() {
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState<'instructor' | 'student' | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const { success: toastSuccess, error: toastError } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!role) {
            toastError("Please select your role.");
            return;
        }

        setIsLoading(true);

        try {
            // Register
            await api.post("/auth/register", {
                email,
                username,
                password,
                role,
            });

            // Login immediately
            const formData = new URLSearchParams();
            formData.append("username", username);
            formData.append("password", password);

            const response = await api.post("/auth/login", formData, {
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
            });

            toastSuccess("Registration successful! Welcome aboard.");
            await login(response.data.access_token);
        } catch (err: any) {
            const errorMsg = err.response?.data?.detail || "Registration failed. Try again.";
            toastError(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)] px-4 py-12">
            <div className="w-full max-w-lg animate-in fade-in zoom-in duration-500">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center bg-violet-600 rounded-2xl p-3 shadow-xl shadow-violet-500/20 mb-4">
                        <Brain className="h-8 w-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
                    <p className="text-slate-400">Join QuizzMaster today and start testing or building</p>
                </div>

                <Card className="border-white/5 bg-slate-900/40">
                    <form onSubmit={handleSubmit}>
                        <CardHeader className="text-center">
                            <CardTitle className="text-xl">Join the Platform</CardTitle>
                            <CardDescription>Tell us who you are so we can tailor your experience</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Role Selection */}
                            <div className="grid grid-cols-2 gap-4">
                                <RoleCard
                                    active={role === 'student'}
                                    onClick={() => setRole('student')}
                                    icon={<GraduationCap className="h-6 w-6" />}
                                    title="Student"
                                    description="I want to take quizzes"
                                />
                                <RoleCard
                                    active={role === 'instructor'}
                                    onClick={() => setRole('instructor')}
                                    icon={<ClipboardList className="h-6 w-6" />}
                                    title="Instructor"
                                    description="I want to build quizzes"
                                />
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300">Email Address</label>
                                    <Input
                                        required
                                        type="email"
                                        placeholder="name@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        disabled={isLoading}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300">Username</label>
                                    <Input
                                        required
                                        placeholder="johndoe"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        disabled={isLoading}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300">Password</label>
                                    <Input
                                        required
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        disabled={isLoading}
                                    />
                                    <p className="text-xs text-slate-500">Must be at least 6 characters</p>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-col space-y-4">
                            <Button type="submit" className="w-full text-lg h-12" disabled={isLoading}>
                                {isLoading ? (
                                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                                ) : (
                                    <>
                                        Create Account
                                        <ArrowRight className="h-5 w-5 ml-2" />
                                    </>
                                )}
                            </Button>
                            <p className="text-sm text-slate-400 text-center">
                                Already have an account?{" "}
                                <Link href="/auth/login" className="text-violet-400 hover:text-violet-300 font-medium">
                                    Log in
                                </Link>
                            </p>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </div>
    );
}

function RoleCard({ active, onClick, icon, title, description }: { active: boolean, onClick: () => void, icon: React.ReactNode, title: string, description: string }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                "relative flex flex-col items-center p-4 rounded-xl border transition-all duration-300 group",
                active
                    ? "border-violet-500 bg-violet-500/10 ring-1 ring-violet-500"
                    : "border-slate-800 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/60"
            )}
        >
            {active && (
                <div className="absolute top-2 right-2 bg-violet-500 rounded-full p-0.5">
                    <Check className="h-3 w-3 text-white" />
                </div>
            )}
            <div className={cn(
                "mb-2 p-3 rounded-lg transition-colors",
                active ? "bg-violet-500 text-white" : "bg-slate-800 text-slate-400 group-hover:text-slate-300"
            )}>
                {icon}
            </div>
            <span className={cn("text-sm font-bold mb-1", active ? "text-white" : "text-slate-300")}>{title}</span>
            <span className="text-[10px] text-slate-500 text-center line-clamp-1">{description}</span>
        </button>
    );
}
