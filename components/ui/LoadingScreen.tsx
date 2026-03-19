"use client";

import { Loader2, Brain } from "lucide-react";

export function LoadingScreen() {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-[128px] animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[128px] animate-pulse delay-700" />
            </div>

            <div className="relative flex flex-col items-center">
                <div className="relative mb-8 group">
                    <div className="absolute inset-0 bg-violet-500 rounded-2xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity animate-pulse" />
                    <div className="relative bg-slate-900 border border-white/10 rounded-2xl p-5 shadow-2xl">
                        <Brain className="h-12 w-12 text-violet-400 animate-bounce" />
                    </div>

                    {/* Ring animation */}
                    <div className="absolute -inset-4 border border-violet-500/10 rounded-full animate-[spin_3s_linear_infinite]" />
                    <div className="absolute -inset-8 border border-blue-500/5 rounded-full animate-[spin_4s_linear_infinite_reverse]" />
                </div>

                <div className="flex flex-col items-center space-y-2">
                    <h2 className="text-xl font-bold text-white tracking-tight">QuizzMaster</h2>
                    <div className="flex items-center space-x-2 text-slate-500">
                        <Loader2 className="h-4 w-4 animate-spin text-violet-500" />
                        <span className="text-sm font-medium animate-pulse">Initializing experience...</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
