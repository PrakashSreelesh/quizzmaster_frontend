"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { KeyRound, Lock, ArrowRight, Loader2, ChevronLeft, ShieldCheck } from "lucide-react";
import { useToast } from "@/context/ToastContext";

function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const emailParam = searchParams.get("email") || "";

    const [email, setEmail] = useState(emailParam);
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { success: toastSuccess, error: toastError } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            toastError("Passwords do not match.");
            return;
        }

        if (newPassword.length < 6) {
            toastError("Password must be at least 6 characters.");
            return;
        }

        setIsLoading(true);

        try {
            await api.post("/auth/reset-password", {
                email,
                otp_code: otp,
                new_password: newPassword
            });
            toastSuccess("Password updated successfully!");
            router.push("/auth/login");
        } catch (err: any) {
            toastError(err.response?.data?.detail || "Failed to reset password.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md animate-in fade-in zoom-in duration-500">
            <div className="mb-6">
                <Button asChild variant="ghost" size="sm" className="text-slate-400 hover:text-white -ml-2">
                    <Link href="/auth/forgot-password">
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Change Email
                    </Link>
                </Button>
            </div>

            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center bg-violet-600 rounded-2xl p-3 shadow-xl shadow-violet-500/20 mb-4">
                    <KeyRound className="h-8 w-8 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">Reset Password</h1>
                <p className="text-slate-400">Enter the 6-digit code we sent to your email.</p>
            </div>

            <Card className="border-white/5 bg-slate-900/40">
                <form onSubmit={handleSubmit}>
                    <CardHeader>
                        <CardTitle className="text-xl">Set New Password</CardTitle>
                        <CardDescription>Verified by {email || "email"}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {!emailParam && (
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
                        )}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">OTP Code</label>
                            <Input
                                required
                                placeholder="123456"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                disabled={isLoading}
                                maxLength={6}
                                className="text-center text-xl tracking-[10px] font-bold"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">New Password</label>
                            <Input
                                required
                                type="password"
                                placeholder="••••••••"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Confirm Password</label>
                            <Input
                                required
                                type="password"
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" className="w-full text-lg h-12" disabled={isLoading}>
                            {isLoading ? (
                                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                            ) : (
                                <>
                                    Reset Password
                                    <ShieldCheck className="h-5 w-5 ml-2" />
                                </>
                            )}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)] px-4 py-10">
            <Suspense fallback={<div className="text-white">Loading...</div>}>
                <ResetPasswordForm />
            </Suspense>
        </div>
    );
}
