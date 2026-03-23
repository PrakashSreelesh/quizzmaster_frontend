"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Brain, LayoutDashboard, LogOut, ClipboardList } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function Navbar() {
    const { user, logout, isAuthenticated, isInstructor } = useAuth();
    const pathname = usePathname();

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-white/5 bg-slate-950/50 backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-2 group">
                        <div className="bg-violet-600 rounded-lg p-1.5 transition-transform group-hover:scale-110 group-active:scale-95 shadow-lg shadow-violet-500/20">
                            <Brain className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-white">QuizzMaster</span>
                    </Link>

                    {/* Links */}
                    <div className="hidden md:flex items-center space-x-1">
                        {!isAuthenticated && (
                            <NavLink href="/" active={pathname === "/"}>Home</NavLink>
                        )}
                        <NavLink href="/quizzes/browse" active={pathname?.startsWith("/quizzes/browse")}>Browse</NavLink>

                        {isAuthenticated && (
                            <>
                                {isInstructor ? (
                                    <NavLink href="/dashboard" active={pathname?.startsWith("/dashboard")}>
                                        <LayoutDashboard className="h-4 w-4 mr-2" />
                                        Dashboard
                                    </NavLink>
                                ) : (
                                    <NavLink href="/analytics" active={pathname?.startsWith("/analytics")}>
                                        <ClipboardList className="h-4 w-4 mr-2" />
                                        My Progress
                                    </NavLink>
                                )}
                            </>
                        )}
                    </div>

                    {/* Auth Actions */}
                    <div className="flex items-center space-x-3">
                        {isAuthenticated ? (
                            <div className="flex items-center space-x-4">
                                <div className="hidden sm:flex flex-col items-end mr-2">
                                    <span className="text-sm font-medium text-white">{user?.username}</span>
                                    <span className="text-xs text-slate-400 capitalize">{user?.role}</span>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={logout}
                                    className="rounded-full hover:bg-red-500/10 hover:text-red-400 transition-colors"
                                    title="Logout"
                                >
                                    <LogOut className="h-5 w-5" />
                                </Button>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-2">
                                <Button variant="ghost" asChild className="hidden sm:inline-flex">
                                    <Link href="/auth/login">Log in</Link>
                                </Button>
                                <Button asChild className="rounded-full">
                                    <Link href="/auth/register">Get Started</Link>
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}

function NavLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
    return (
        <Link
            href={href}
            className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                active
                    ? "bg-white/10 text-white"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
            )}
        >
            <span className="flex items-center">{children}</span>
        </Link>
    );
}
