"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { AlertCircle, RotateCcw, Home } from "lucide-react";
import Link from "next/link";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] px-4 text-center">
            <div className="bg-red-500/10 p-6 rounded-3xl border border-red-500/20 mb-8">
                <AlertCircle className="h-16 w-16 text-red-400" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">Something went wrong</h1>
            <p className="text-slate-400 max-w-md mb-10 leading-relaxed">
                We encountered an unexpected error. Don&apos;t worry, your data is safe. You can try refreshing the page or head back to the home page.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4">
                <Button onClick={() => reset()} className="w-full sm:w-auto px-8">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Try Again
                </Button>
                <Button asChild variant="ghost" className="w-full sm:w-auto px-8">
                    <Link href="/">
                        <Home className="h-4 w-4 mr-2" />
                        Back to Home
                    </Link>
                </Button>
            </div>

            {error.digest && (
                <p className="mt-8 text-[10px] font-mono text-slate-600 uppercase tracking-widest">
                    Error ID: {error.digest}
                </p>
            )}
        </div>
    );
}
