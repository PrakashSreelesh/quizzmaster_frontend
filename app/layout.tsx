import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/context/ToastContext";
import { Navbar } from "@/components/Navbar";
import { PageTransition } from "@/components/PageTransition";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "QuizzMaster | Online Quiz Platform",
  description: "Modern platform for creating and taking quizzes with instant grading and analytics.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={cn(inter.className, "antialiased")}>
        <AuthProvider>
          <ToastProvider>
            <div className="relative min-h-screen">
              {/* Background Decorative Elements */}
              <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 bg-slate-950" />
              <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-violet-600/10 blur-[120px] pointer-events-none -z-10" />
              <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none -z-10" />

              <Navbar />
              <main className="relative min-h-[calc(100vh-64px)]">
                <PageTransition>{children}</PageTransition>
              </main>
            </div>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
