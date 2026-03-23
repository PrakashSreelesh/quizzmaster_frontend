"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '@/lib/api';
import { User } from '@/lib/types';
import { useRouter, usePathname } from 'next/navigation';
import { LoadingScreen } from '@/components/ui/LoadingScreen';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: () => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
    isInstructor: boolean;
    isStudent: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    const fetchUser = async () => {
        try {
            const response = await api.get('/auth/me');
            setUser(response.data);
            return response.data.role;
        } catch (error) {
            setUser(null);
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUser();
    }, []);

    const login = async () => {
        const role = await fetchUser();
        if (role === 'instructor') {
            router.push('/dashboard');
        } else if (role === 'student') {
            router.push('/analytics');
        } else {
            router.push('/');
        }
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout');
        } catch (err) {
            console.error("Logout failed:", err);
        } finally {
            setUser(null);
            router.push('/auth/login');
        }
    };

    // Route guarding (simple client-side check)
    useEffect(() => {
        if (!isLoading) {
            const isAuthPage = pathname?.startsWith('/auth');

            if (!user && !isAuthPage && pathname !== '/') {
                router.push('/auth/login');
            } else if (user && (isAuthPage || pathname === '/')) {
                if (user.role === 'instructor') {
                    router.push('/dashboard');
                } else if (user.role === 'student') {
                    router.push('/analytics');
                }
            }
        }
    }, [pathname, user, isLoading, router]);

    // Determine if we should show the children or a loading state while redirecting
    const isAuthPage = pathname?.startsWith('/auth');
    const isPublicPage = isAuthPage || pathname === '/';
    const shouldShowChildren = !isLoading && (isPublicPage || !!user);

    const value = {
        user,
        isLoading,
        login,
        logout,
        isAuthenticated: !!user,
        isInstructor: user?.role === 'instructor',
        isStudent: user?.role === 'student',
    };

    return (
        <AuthContext.Provider value={value}>
            {shouldShowChildren ? children : <LoadingScreen />}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
