"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Mail, ArrowRight, Loader2, ChevronLeft } from "lucide-react";
import { useToast } from "@/context/ToastContext";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { success: toastSuccess, error: toastError } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await api.post("/auth/forgot-password", { email });
            toastSuccess("Reset OTP sent to your email.");
            // Redirect to reset password page with email as query param
            router.push(`/auth/reset-password?email=${encodeURIComponent(email)}`);
        } catch (err: any) {
            toastError(err.response?.data?.detail || "Failed to send reset code.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)] px-4">
            <div className="w-full max-w-md animate-in fade-in zoom-in duration-500">
                <div className="mb-6">
                    <Button asChild variant="ghost" size="sm" className="text-slate-400 hover:text-white -ml-2">
                        <Link href="/auth/login">
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Back to Login
                        </Link>
                    </Button>
                </div>

                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center bg-rose-500 rounded-2xl p-3 shadow-xl shadow-rose-500/20 mb-4">
                        <Mail className="h-8 w-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">Forgot Password?</h1>
                    <p className="text-slate-400">Enter your email and we&apos;ll send you an OTP to reset your password.</p>
                </div>

                <Card className="border-white/5 bg-slate-900/40">
                    <form onSubmit={handleSubmit}>
                        <CardHeader>
                            <CardTitle className="text-xl">Request Reset</CardTitle>
                            <CardDescription>We will send a 6-digit code</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Email Address</label>
                                <Input
                                    required
                                    type="email"
                                    placeholder="your@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={isLoading}
                                />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button type="submit" className="w-full text-lg h-12 bg-rose-600 hover:bg-rose-500 shadow-rose-600/20" disabled={isLoading}>
                                {isLoading ? (
                                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                                ) : (
                                    <>
                                        Send OTP
                                        <ArrowRight className="h-5 w-5 ml-2" />
                                    </>
                                )}
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </div>
    );
}
