"use client";

import { Button } from "@/components/ui/Button";
import { Search, Home, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] px-4 text-center">
            <div className="relative mb-12">
                <h1 className="text-[12rem] font-black text-white/5 leading-none select-none">404</h1>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-violet-600/20 p-8 rounded-full blur-2xl animate-pulse" />
                    <Search className="h-24 w-24 text-violet-500 relative z-10" />
                </div>
            </div>

            <h2 className="text-3xl font-bold text-white mb-4">Page Not Found</h2>
            <p className="text-slate-400 max-w-md mb-10 leading-relaxed">
                The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4">
                <Button asChild className="w-full sm:w-auto px-8 shadow-violet-500/20 shadow-xl">
                    <Link href="/">
                        <Home className="h-4 w-4 mr-2" />
                        Back to Home
                    </Link>
                </Button>
                <Button onClick={() => window.history.back()} variant="ghost" className="w-full sm:w-auto px-8">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Go Back
                </Button>
            </div>
        </div>
    );
}
