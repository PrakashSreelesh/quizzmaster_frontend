"use client";

import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { ArrowRight, Brain, GraduationCap, ClipboardList, BarChart3 } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] px-6 py-20 text-center">
      {/* Hero Section */}
      <div className="relative z-10 max-w-3xl animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-violet-500/20 bg-violet-500/10 mb-8">
          <Brain className="h-4 w-4 text-violet-400" />
          <span className="text-xs font-semibold text-violet-300 uppercase tracking-widest">
            Level up your knowledge
          </span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
          Master Any Topic with <span className="gradient-text">QuizzMaster</span>
        </h1>

        <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
          The all-in-one platform for instructors to build interactive quizzes and students to test their skills with instant grading.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
          <Button asChild size="lg" className="rounded-full px-10 text-lg group">
            <Link href="/quizzes/browse">
              Browse Quizzes
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
          <Button asChild variant="glass" size="lg" className="rounded-full px-10 text-lg">
            <Link href="/auth/login">Instructor Dashboard</Link>
          </Button>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <FeatureCard
            icon={<GraduationCap className="h-6 w-6 text-blue-400" />}
            title="Instant Grading"
            description="Submit your answers and get immediate per-question feedback."
          />
          <FeatureCard
            icon={<ClipboardList className="h-6 w-6 text-violet-400" />}
            title="Smart Builder"
            description="Instructors can create quizzes with multiple question types in minutes."
          />
          <FeatureCard
            icon={<BarChart3 className="h-6 w-6 text-indigo-400" />}
            title="Deep Analytics"
            description="Track progress with beautiful visualizations and performance metrics."
          />
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="glass-card p-6 rounded-2xl">
      <div className="mb-4 bg-slate-800/50 w-12 h-12 rounded-xl flex items-center justify-center">
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-2 text-white">{title}</h3>
      <p className="text-sm text-slate-400 leading-relaxed">{description}</p>
    </div>
  );
}
