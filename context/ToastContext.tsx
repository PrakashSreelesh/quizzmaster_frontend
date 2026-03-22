"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { X, CheckCircle2, AlertCircle, Info, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";

type ToastType = "success" | "error" | "info" | "loading";

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    toast: (message: string, type: ToastType) => void;
    success: (message: string) => void;
    error: (message: string) => void;
    info: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const addToast = useCallback((message: string, type: ToastType) => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts((prev) => [...prev, { id, message, type }]);

        if (type !== 'loading') {
            setTimeout(() => removeToast(id), 5000);
        }
    }, [removeToast]);

    const success = (msg: string) => addToast(msg, "success");
    const error = (msg: string) => addToast(msg, "error");
    const info = (msg: string) => addToast(msg, "info");

    return (
        <ToastContext.Provider value={{ toast: addToast, success, error, info }}>
            {children}
            <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
                <AnimatePresence>
                    {toasts.map((t) => (
                        <motion.div
                            key={t.id}
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                            className={cn(
                                "pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl backdrop-blur-md min-w-[280px] max-w-md",
                                t.type === "success" && "bg-green-500/10 border-green-500/20 text-green-400",
                                t.type === "error" && "bg-red-500/10 border-red-500/20 text-red-400",
                                t.type === "info" && "bg-blue-500/10 border-blue-500/20 text-blue-400",
                                t.type === "loading" && "bg-violet-500/10 border-violet-500/20 text-violet-400"
                            )}
                        >
                            <div className="shrink-0">
                                {t.type === "success" && <CheckCircle2 className="h-5 w-5" />}
                                {t.type === "error" && <AlertCircle className="h-5 w-5" />}
                                {t.type === "info" && <Info className="h-5 w-5" />}
                                {t.type === "loading" && <Loader2 className="h-5 w-5 animate-spin" />}
                            </div>
                            <p className="text-sm font-medium leading-tight">{t.message}</p>
                            <div className="relative flex items-center justify-center h-7 w-7 ml-auto shrink-0 group">
                                {t.type !== 'loading' && (
                                    <svg className="absolute -rotate-90 h-7 w-7 pointer-events-none">
                                        <circle
                                            cx="14"
                                            cy="14"
                                            r="12"
                                            fill="transparent"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeDasharray="75.4"
                                            className="opacity-10"
                                        />
                                        <motion.circle
                                            cx="14"
                                            cy="14"
                                            r="12"
                                            fill="transparent"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeDasharray="75.4"
                                            initial={{ strokeDashoffset: 0 }}
                                            animate={{ strokeDashoffset: 75.4 }}
                                            transition={{ duration: 5, ease: "linear" }}
                                        />
                                    </svg>
                                )}
                                <button
                                    onClick={() => removeToast(t.id)}
                                    className="relative z-10 p-1 rounded-full hover:bg-white/10 transition-colors pointer-events-auto"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) throw new Error("useToast must be used within ToastProvider");
    return context;
}
