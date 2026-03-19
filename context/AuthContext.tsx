"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '@/lib/api';
import { User } from '@/lib/types';
import { useRouter, usePathname } from 'next/navigation';
import { LoadingScreen } from '@/components/ui/LoadingScreen';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (token: string) => Promise<void>;
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
        } catch (error) {
            localStorage.removeItem('access_token');
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (token) {
            fetchUser();
        } else {
            setIsLoading(false);
        }
    }, []);

    const login = async (token: string) => {
        localStorage.setItem('access_token', token);
        await fetchUser();
        router.push('/');
    };

    const logout = () => {
        localStorage.removeItem('access_token');
        setUser(null);
        router.push('/auth/login');
    };

    // Route guarding (simple client-side check)
    useEffect(() => {
        if (!isLoading) {
            const isAuthPage = pathname?.startsWith('/auth');
            const token = localStorage.getItem('access_token');

            if (!token && !isAuthPage && pathname !== '/') {
                router.push('/auth/login');
            }
        }
    }, [pathname, user, isLoading, router]);

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
            {isLoading ? <LoadingScreen /> : children}
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
