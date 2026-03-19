import { cn } from "@/lib/utils"

export function Spinner({ className }: { className?: string }) {
    return (
        <div className={cn("relative flex items-center justify-center", className)}>
            {/* Outer revolving ring */}
            <div className="absolute inset-0 rounded-full border-2 border-violet-500/10" />

            {/* Pulsing core */}
            <div className="h-1/3 w-1/3 rounded-full bg-violet-500/40 animate-pulse" />

            {/* Animated tracks */}
            <div
                className={cn(
                    "absolute inset-0 rounded-full border-2 border-transparent border-t-violet-500 animate-[spin_1s_linear_infinite]",
                )}
            />
            <div
                className={cn(
                    "absolute inset-1 rounded-full border border-transparent border-b-blue-400 animate-[spin_1.5s_linear_infinite_reverse] opacity-50",
                )}
            />

            <span className="sr-only">Loading...</span>
        </div>
    )
}
