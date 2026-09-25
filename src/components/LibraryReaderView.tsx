"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { LibraryBook } from "../lib/library/types";
import { soundEngine } from "../lib/audio";
import { persistNewStar } from "../lib/starPersistence";
import { Letter } from "../lib/types";
import {
  ArrowLeft,
  BookOpen,
  Volume2,
  VolumeX,
  Type,
  Sparkles,
  Share2,
  Check,
  Menu,
  X,
  ArrowUp,
  ShieldCheck,
  Bookmark,
  ChevronDown
} from "lucide-react";

interface LibraryReaderViewProps {
  book: LibraryBook;
  relatedBooks: LibraryBook[];
}

export default function LibraryReaderView({ book, relatedBooks }: LibraryReaderViewProps) {
  const [fontSize, setFontSize] = useState<"sm" | "base" | "lg" | "xl">("base");
  const [fontFamily, setFontFamily] = useState<"serif" | "sans">("serif");
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [isTocOpen, setIsTocOpen] = useState(false);
  const [copiedQuote, setCopiedQuote] = useState(false);
  const [selectedText, setSelectedText] = useState<string | null>(null);
  const [starReleasedToast, setStarReleasedToast] = useState<string | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeChapterTitle, setActiveChapterTitle] = useState(book.chapters[0]?.title || "");
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      soundEngine.stopAmbient();
    };
  }, []);

  // Track scroll progress and active chapter in view
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const currentProgress = (window.scrollY / totalHeight) * 100;
        setScrollProgress(Math.min(100, Math.max(0, currentProgress)));
      }

      setShowBackToTop(window.scrollY > 500);

      // Find which chapter section is currently in view
      for (const chapter of book.chapters) {
        const el = document.getElementById(chapter.id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 200 && rect.bottom >= 100) {
            setActiveChapterTitle(chapter.title);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [book.chapters]);

  const toggleAudio = () => {
    if (isAudioPlaying) {
      soundEngine.stopAmbient();
      setIsAudioPlaying(false);
    } else {
      soundEngine.startAmbient();
      setIsAudioPlaying(true);
    }
  };

  const scrollToChapter = (chapterId: string) => {
    const target = document.getElementById(chapterId);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      setIsTocOpen(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Text selection listener for quote release
  const handleMouseUp = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 15) {
      const text = selection.toString().trim();
      setSelectedText(text.slice(0, 300));
    }
  };

  const releaseSelectedQuoteAsStar = async () => {
    if (!selectedText) return;

    try {
      const newStar: Letter = {
        id: `star-library-${Date.now()}`,
        recipient: `${book.author} • ${book.title}`,
        category: "prayer",
        content: `"${selectedText}" — from ${book.title} by ${book.author}`,
        createdAt: "Just now",
        locationName: "The Sanctuary Library",
        lightCount: 1,
        whispers: [],
        x: (Math.random() - 0.5) * 1200,
        y: (Math.random() - 0.5) * 1200,
        size: 1.6,
        color: book.accentColor || "#f59e0b",
        glowColor: "rgba(245, 158, 11, 0.6)",
        pulseSpeed: 1.2,
        pulsePhase: Math.random() * Math.PI * 2,
        isNew: true
      };

      // Multi-tier persistence shield (localStorage mirrors + IndexedDB)
      await persistNewStar(newStar, true);

      // Trigger pleasant auditory shimmer
      soundEngine.playLightShimmer();

      setStarReleasedToast(`Quote released into Solas Haven as a permanent starlight letter!`);
      setSelectedText(null);
      setTimeout(() => setStarReleasedToast(null), 5000);
    } catch {
      setStarReleasedToast("Saved to your celestial reflections.");
      setTimeout(() => setStarReleasedToast(null), 4000);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${book.title} - ${book.author}`,
          text: `Reading ${book.title} by ${book.author} on Solas Haven.`,
          url,
        });
      } catch {}
    } else {
      const { copyToClipboard } = await import("@/utils/clipboard");
      await copyToClipboard(url);
      setCopiedQuote(true);
      setTimeout(() => setCopiedQuote(false), 3000);
    }
  };

  const fontSizeClasses = {
    sm: "text-sm leading-relaxed",
    base: "text-base sm:text-lg leading-loose",
    lg: "text-lg sm:text-xl leading-loose",
    xl: "text-xl sm:text-2xl leading-loose",
  };

  return (
    <div
      className="min-h-screen bg-[#030408] text-white selection:bg-amber-400/30 selection:text-amber-100 flex flex-col justify-between relative"
      onMouseUp={handleMouseUp}
      onTouchEnd={handleMouseUp}
    >
      {/* Real-time Reading Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-[3px] bg-white/5">
        <div
          className="h-full bg-gradient-to-r from-amber-400 via-amber-300 to-emerald-400 transition-all duration-150 shadow-[0_0_8px_rgba(245,158,11,0.8)]"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Sticky Top Reader Header */}
      <header className="sticky top-0 z-40 bg-[#030408]/92 backdrop-blur-2xl border-b border-white/10 px-3 sm:px-8 py-2.5 sm:py-3 transition-all">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-2">
          {/* Back to Library */}
          <Link
            href="/library"
            className="flex items-center gap-2 text-xs text-white/70 hover:text-white transition-colors px-3 py-1.5 rounded-full bg-white/5 border border-white/10 shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sanctuary Library</span>
            <span className="sm:hidden">Library</span>
          </Link>

          {/* Book Title & Current Active Section */}
          <div className="flex-1 text-center px-2 min-w-0">
            <h1 className="text-xs sm:text-sm font-serif text-white/95 truncate">
              {book.title}
            </h1>
            <p className="text-[10px] text-amber-300/80 font-mono truncate flex items-center justify-center gap-1.5">
              <span>{activeChapterTitle}</span>
              <span className="text-white/30">•</span>
              <span>{Math.round(scrollProgress)}% read</span>
            </p>
          </div>

          {/* Reader Controls */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Ambient 432Hz Audio Toggle */}
            <button
              onClick={toggleAudio}
              title={isAudioPlaying ? "Mute 432Hz ambient sound" : "Play 432Hz meditative sound"}
              className={`p-2 rounded-full border transition-all cursor-pointer ${
                isAudioPlaying
                  ? "bg-amber-400/20 border-amber-400/50 text-amber-300 shadow-lg shadow-amber-500/20"
                  : "bg-white/5 border-white/10 text-white/60 hover:text-white"
              }`}
            >
              {isAudioPlaying ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            </button>

            {/* Font Family Toggle */}
            <button
              onClick={() => setFontFamily((prev) => (prev === "serif" ? "sans" : "serif"))}
              title="Switch Serif / Sans"
              className="p-2 rounded-full bg-white/5 border border-white/10 text-white/60 hover:text-white transition-colors cursor-pointer hidden sm:flex"
            >
              <Type className="w-3.5 h-3.5" />
            </button>

            {/* Font Size Adjuster */}
            <div className="flex items-center rounded-full bg-white/5 border border-white/10 p-0.5 text-xs font-mono">
              <button
                onClick={() =>
                  setFontSize((prev) =>
                    prev === "xl" ? "lg" : prev === "lg" ? "base" : "sm"
                  )
                }
                className="px-2 py-1 text-white/60 hover:text-white transition-colors"
                title="Smaller font"
              >
                A-
              </button>
              <button
                onClick={() =>
                  setFontSize((prev) =>
                    prev === "sm" ? "base" : prev === "base" ? "lg" : "xl"
                  )
                }
                className="px-2 py-1 text-white/60 hover:text-white transition-colors border-l border-white/10"
                title="Larger font"
              >
                A+
              </button>
            </div>

            {/* Table of Contents Drawer Toggle */}
            <button
              onClick={() => setIsTocOpen(true)}
              title="Table of Contents (Jump to chapter)"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-400/15 border border-amber-400/35 text-amber-200 hover:bg-amber-400/25 transition-colors cursor-pointer text-xs font-mono"
            >
              <Menu className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Index</span>
            </button>
          </div>
        </div>
      </header>

      {/* Floating Quote Selection Tooltip */}
      {selectedText && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-fade-in">
          <div className="flex items-center gap-2 p-2 px-4 rounded-full bg-neutral-900/95 border border-amber-400/50 backdrop-blur-2xl shadow-2xl shadow-amber-500/20 text-xs">
            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
            <span className="text-white/90">Selected Quote</span>
            <button
              onClick={releaseSelectedQuoteAsStar}
              className="ml-2 px-3 py-1 rounded-full bg-amber-400 text-black font-semibold text-xs hover:bg-amber-300 transition-all cursor-pointer shadow-md"
            >
              Release as Starlight ✦
            </button>
            <button
              onClick={() => setSelectedText(null)}
              className="p-1 text-white/40 hover:text-white cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {starReleasedToast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 animate-fade-in max-w-md w-full px-4">
          <div className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-amber-400/20 border border-amber-400/60 backdrop-blur-2xl text-amber-200 text-xs shadow-2xl">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
              <span>{starReleasedToast}</span>
            </div>
            <Link
              href="/"
              className="underline font-semibold hover:text-white shrink-0 ml-2"
            >
              View in Sky →
            </Link>
          </div>
        </div>
      )}

      {/* Table of Contents Drawer */}
      {isTocOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-sm animate-fade-in">
          <div
            className="w-full max-w-md bg-neutral-950 border-l border-white/15 h-full p-6 flex flex-col justify-between overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div>
                  <h2 className="font-serif text-lg text-white">{book.title}</h2>
                  <p className="text-xs text-white/50 font-mono mt-0.5">
                    {book.chapters.length} Sections • Complete Scroll
                  </p>
                </div>
                <button
                  onClick={() => setIsTocOpen(false)}
                  className="p-2 rounded-full bg-white/5 border border-white/10 text-white/60 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Chapter Jump List */}
              <div className="flex flex-col gap-2 mt-4">
                {book.chapters.map((ch, idx) => {
                  const isActive = activeChapterTitle === ch.title;
                  return (
                    <button
                      key={ch.id}
                      onClick={() => scrollToChapter(ch.id)}
                      className={`text-left p-3 rounded-2xl border transition-all cursor-pointer ${
                        isActive
                          ? "bg-amber-400/20 border-amber-400/50 text-amber-200 shadow-md"
                          : "bg-white/[0.02] border-white/5 text-white/70 hover:text-white hover:bg-white/[0.06]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-serif text-sm font-medium">{ch.title}</span>
                        <span className="text-[10px] font-mono text-white/40">#{idx + 1}</span>
                      </div>
                      {ch.subtitle && (
                        <p className="text-[11px] text-white/40 mt-1 line-clamp-1 italic font-serif">
                          {ch.subtitle}
                        </p>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-6 border-t border-white/10 text-xs text-white/40 font-mono text-center">
              {book.publicDomainNotice}
            </div>
          </div>
        </div>
      )}

      {/* Main Continuous Full-Book Reading Container */}
      <main
        className={`flex-1 max-w-3xl mx-auto w-full px-4 sm:px-8 py-10 sm:py-16 ${
          fontFamily === "serif" ? "font-serif" : "font-sans"
        }`}
      >
        {/* Book Title Banner */}
        <div className="mb-14 text-center space-y-4 pb-10 border-b border-white/10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-mono">
            <span>{book.category}</span>
            <span>•</span>
            <span>{book.year}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-serif text-white/95 tracking-tight leading-tight">
            {book.title}
          </h1>

          <p className="text-sm sm:text-base text-white/60 font-mono">
            by <span className="text-white font-medium">{book.author}</span>
            {book.translator && (
              <span className="text-white/40"> • Transl. {book.translator}</span>
            )}
          </p>

          <div className="p-4 rounded-2xl bg-white/[0.02] border-l-2 border-amber-400/60 max-w-xl mx-auto text-left italic text-xs sm:text-sm text-white/80 font-serif leading-relaxed">
            "{book.quote}"
          </div>

          <div className="flex items-center justify-center gap-4 text-xs font-mono text-white/40 pt-2">
            <span>{book.chapters.length} Chapters</span>
            <span>•</span>
            <span>Continuous Full-Book Scroll</span>
            <span>•</span>
            <button
              onClick={handleShare}
              className="text-amber-300 hover:underline flex items-center gap-1 cursor-pointer"
            >
              {copiedQuote ? <Check className="w-3 h-3" /> : <Share2 className="w-3 h-3" />}
              <span>{copiedQuote ? "Copied" : "Share"}</span>
            </button>
          </div>
        </div>

        {/* Continuous Flowing Chapters (Every chapter laid out sequentially) */}
        <div className="space-y-16">
          {book.chapters.map((chapter, cIdx) => (
            <section
              key={chapter.id}
              id={chapter.id}
              className="scroll-mt-28 space-y-6 pb-12 border-b border-white/10 last:border-0"
            >
              {/* Chapter Header */}
              <div className="space-y-2 pt-4">
                <span className="text-[11px] font-mono text-amber-400/80 uppercase tracking-widest block">
                  Chapter {cIdx + 1} of {book.chapters.length}
                </span>
                <h2 className="text-2xl sm:text-3xl font-serif text-white/90 leading-snug">
                  {chapter.title}
                </h2>
                {chapter.subtitle && (
                  <p className="text-sm sm:text-base text-amber-200/70 italic font-serif">
                    "{chapter.subtitle}"
                  </p>
                )}
              </div>

              {/* Chapter Text Paragraphs */}
              <div className={`space-y-6 text-white/80 ${fontSizeClasses[fontSize]}`}>
                {chapter.content.map((p, pIdx) => (
                  <p key={pIdx} className="tracking-wide">
                    {p}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Book Conclusion & Public Domain Provenance */}
        <div className="mt-16 p-6 sm:p-8 rounded-3xl bg-white/[0.02] border border-white/10 text-center space-y-3">
          <ShieldCheck className="w-6 h-6 text-amber-400 mx-auto" />
          <h3 className="text-lg font-serif text-white">End of Volume</h3>
          <p className="text-xs text-white/50 max-w-md mx-auto leading-relaxed font-mono">
            {book.publicDomainNotice}
          </p>
          <div className="pt-2">
            <Link
              href="/library"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-amber-400/15 hover:bg-amber-400/25 border border-amber-400/40 text-amber-200 text-xs font-medium transition-all"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Explore More Books in the Library</span>
            </Link>
          </div>
        </div>

        {/* Related Books */}
        {relatedBooks.length > 0 && (
          <section className="mt-16 pt-12 border-t border-white/10">
            <h3 className="text-lg font-serif text-white/90 mb-4">Recommended Next Reads</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {relatedBooks.map((rb) => (
                <Link
                  key={rb.slug}
                  href={`/library/${rb.slug}`}
                  className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-amber-400/40 transition-all block group"
                >
                  <span className="text-[10px] font-mono text-amber-300 block mb-1">
                    {rb.category}
                  </span>
                  <h4 className="font-serif text-sm text-white group-hover:text-amber-200 transition-colors line-clamp-1">
                    {rb.title}
                  </h4>
                  <p className="text-xs text-white/50 font-mono mt-0.5">{rb.author}</p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Floating Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          title="Back to Top"
          className="fixed bottom-6 right-6 z-40 p-3 rounded-full bg-amber-400/20 hover:bg-amber-400/30 border border-amber-400/50 text-amber-200 backdrop-blur-xl shadow-xl transition-all hover:scale-110 cursor-pointer animate-fade-in"
        >
          <ArrowUp className="w-4 h-4" />
        </button>
      )}

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black/40 py-6 px-4 text-center text-xs text-white/40 font-mono mt-20">
        <p>{book.publicDomainNotice}</p>
        <p className="mt-1 text-white/30">
          Solas Haven • The Internet's Sanctuary for Unspoken Words
        </p>
      </footer>
    </div>
  );
}
