import React from "react";
import Link from "next/link";
import { Layers, ArrowRight, BookOpen, ChevronRight } from "lucide-react";

interface RelatedTopic {
  title: string;
  description: string;
  href: string;
}

interface LearnPageShellProps {
  topicTitle: string;
  category: string;
  relatedTopics?: RelatedTopic[];
  children: React.ReactNode;
}

export function LearnPageShell({
  topicTitle,
  category,
  relatedTopics,
  children,
}: LearnPageShellProps) {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] relative overflow-x-hidden flex flex-col justify-between">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/4 h-[600px] w-[600px] mesh-glow-1 pointer-events-none rounded-full opacity-60" />
      <div className="absolute top-[400px] right-1/4 h-[700px] w-[700px] mesh-glow-2 pointer-events-none rounded-full opacity-50" />

      {/* Navigation */}
      <nav className="z-30 border-b border-slate-200/60 px-6 py-4 bg-white/80 backdrop-blur-md sticky top-0">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2.5 hover:opacity-90 transition">
              <div className="h-9 w-9 rounded-xl bg-[#0B5D4B] flex items-center justify-center shadow-md">
                <Layers className="text-white h-4.5 w-4.5" />
              </div>
              <span className="font-display text-xl font-black tracking-tight text-[#0B5D4B]">
                Arth<span className="text-[#18B27A] font-extrabold">AI</span>
              </span>
            </Link>

            <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-slate-400">
              <span>/</span>
              <Link href="/learn" className="hover:text-primary transition flex items-center gap-1 text-slate-600">
                <BookOpen className="h-3.5 w-3.5" />
                Learn
              </Link>
              <span>/</span>
              <span className="text-primary font-extrabold truncate max-w-[200px]">{topicTitle}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-4 py-2 rounded-full transition uppercase tracking-wider"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="bg-[#0B5D4B] hover:bg-[#074739] text-white text-xs font-bold px-5 py-2 rounded-full transition shadow-md uppercase tracking-wider"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-6 py-12 flex-1 relative z-10 space-y-16 w-full">
        {children}

        {/* Related Topics Cross-Linking */}
        {relatedTopics && relatedTopics.length > 0 && (
          <div className="border-t border-slate-200/80 pt-12 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">
                Explore Architecture Topics
              </h3>
              <Link
                href="/learn"
                className="text-xs font-bold text-[#0B5D4B] hover:underline flex items-center gap-1"
              >
                All Topics &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {relatedTopics.map((rel, idx) => (
                <Link
                  key={idx}
                  href={rel.href}
                  className="p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-emerald-500/50 hover:shadow-md transition-all group block space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-slate-900 group-hover:text-primary transition-colors">
                      {rel.title}
                    </h4>
                    <ChevronRight className="h-4 w-4 text-slate-400 group-hover:translate-x-1 group-hover:text-primary transition-all" />
                  </div>
                  <p className="text-xs text-slate-550 leading-relaxed font-medium">
                    {rel.description}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/60 py-8 text-center text-xs text-slate-400 font-bold bg-white/50 backdrop-blur-sm relative z-10">
        © {new Date().getFullYear()} ArthAI Financial Technologies Private Limited. All rights reserved.
      </footer>
    </div>
  );
}
