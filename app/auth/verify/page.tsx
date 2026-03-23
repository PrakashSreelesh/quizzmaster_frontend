"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { useToast } from "@/context/ToastContext";
import { Mail, Timer, RotateCcw, Edit2, CheckCircle2 } from "lucide-react";

function VerifyOTPContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { success: toastSuccess, error: toastError } = useToast();

    const userId = searchParams.get("user_id");
    const [otp, setOtp] = useState("");
    const [isVerifying, setIsVerifying] = useState(false);
    const [timeLeft, setTimeLeft] = useState(1200); // 20 mins in seconds
    const [isResending, setIsResending] = useState(false);
    const [isEditingEmail, setIsEditingEmail] = useState(false);
    const [newEmail, setNewEmail] = useState("");

    useEffect(() => {
        if (!userId) {
            router.push("/auth/login");
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);

        return () => clearInterval(timer);
    }, [userId, router]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        if (otp.length !== 6) {
            toastError("Please enter a valid 6-digit OTP.");
            return;
        }

        setIsVerifying(true);
        try {
            await api.post("/auth/verify-otp", { user_id: userId, otp_code: otp });
            toastSuccess("Account verified successfully!");
            router.push("/auth/login?verified=true");
        } catch (err: any) {
            toastError(err.response?.data?.detail || "Verification failed.");
        } finally {
            setIsVerifying(false);
        }
    };

    const handleResend = async () => {
        setIsResending(true);
        try {
            await api.post("/auth/resend-otp", { user_id: userId });
            toastSuccess("New OTP sent to your email.");
            setTimeLeft(1200);
        } catch (err: any) {
            toastError("Failed to resend OTP.");
        } finally {
            setIsResending(false);
        }
    };

    const handleUpdateEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!confirm("Are you sure? A new OTP will be sent to the new email address.")) return;

        try {
            await api.post("/auth/update-email", { user_id: userId, new_email: newEmail });
            toastSuccess("Email updated and new OTP sent.");
            setIsEditingEmail(false);
            setTimeLeft(1200);
        } catch (err: any) {
            toastError(err.response?.data?.detail || "Failed to update email.");
        }
    };

    if (isEditingEmail) {
        return (
            <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4 bg-slate-950">
                <Card className="w-full max-w-md border-white/5 bg-slate-900 shadow-2xl">
                    <CardHeader className="text-center pt-8 pb-4">
                        <CardTitle className="text-3xl font-bold text-white mb-2">Edit Email</CardTitle>
                        <p className="text-slate-400">Enter your correct email address.</p>
                    </CardHeader>
                    <CardContent className="px-8 pb-10">
                        <form onSubmit={handleUpdateEmail} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-500 uppercase tracking-widest px-1">NEW EMAIL</label>
                                <input
                                    type="email"
                                    required
                                    className="w-full bg-slate-800 border-white/10 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-violet-500 outline-none transition-all"
                                    placeholder="your-name@example.com"
                                    value={newEmail}
                                    onChange={(e) => setNewEmail(e.target.value)}
                                />
                            </div>
                            <div className="flex space-x-3">
                                <Button type="button" variant="outline" className="flex-1" onClick={() => setIsEditingEmail(false)}>Cancel</Button>
                                <Button type="submit" className="flex-1">Update & Resend</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4 bg-slate-950">
            <Card className="w-full max-w-md border-white/5 bg-slate-900 shadow-2xl">
                <CardHeader className="text-center pt-8 pb-4">
                    <div className="bg-violet-500/10 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-violet-500/20">
                        <Mail className="h-10 w-10 text-violet-400" />
                    </div>
                    <CardTitle className="text-3xl font-bold text-white mb-2">Verify <span className="gradient-text">Email</span></CardTitle>
                    <p className="text-slate-400">Please enter the 6-digit code we sent to your email.</p>
                </CardHeader>

                <CardContent className="px-8 pb-10">
                    <form onSubmit={handleVerify} className="space-y-8">
                        <div className="flex justify-center">
                            <input
                                type="text"
                                maxLength={6}
                                className="w-56 text-center text-4xl font-bold tracking-[0.5rem] bg-slate-800/50 border-2 border-white/5 text-white rounded-2xl px-2 py-4 focus:border-violet-500/50 focus:ring-4 focus:ring-violet-500/10 outline-none transition-all placeholder:text-slate-700"
                                placeholder="000000"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ""))}
                                autoFocus
                            />
                        </div>

                        <div className="flex flex-col items-center space-y-4">
                            <div className="flex items-center space-x-2 text-slate-400 bg-slate-800/30 px-4 py-2 rounded-full border border-white/5">
                                <Timer className="h-4 w-4 text-violet-400" />
                                <span className="text-sm font-medium">{timeLeft > 0 ? `Expires in ${formatTime(timeLeft)}` : "OTP Expired"}</span>
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-12 text-lg rounded-xl shadow-lg shadow-violet-500/20"
                                disabled={isVerifying || timeLeft <= 0 || otp.length < 6}
                            >
                                {isVerifying ? "Verifying..." : "Confirm Verification"}
                            </Button>

                            <div className="flex items-center space-x-6 pt-4">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleResend}
                                    disabled={timeLeft > 0 || isResending}
                                    className="text-slate-500 hover:text-white"
                                >
                                    <RotateCcw className="h-3.5 w-3.5 mr-2" />
                                    Resend OTP
                                </Button>
                                <div className="w-px h-4 bg-slate-800"></div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setIsEditingEmail(true)}
                                    className="text-slate-500 hover:text-white"
                                >
                                    <Edit2 className="h-3.5 w-3.5 mr-2" />
                                    Edit Email
                                </Button>
                            </div>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

export default function VerifyOTPPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <VerifyOTPContent />
        </Suspense>
    );
}
