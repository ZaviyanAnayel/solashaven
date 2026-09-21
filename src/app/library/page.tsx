"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { LIBRARY_BOOKS, LIBRARY_ERAS, searchBooks } from "../../lib/library/libraryData";
import {
  ArrowLeft,
  BookOpen,
  Clock,
  Sparkles,
  Search,
  Feather,
  ShieldCheck,
  ChevronRight,
  Volume2,
  X,
  Compass,
  ScrollText
} from "lucide-react";
import StarCursorTrail from "../../components/StarCursorTrail";

export default function LibraryCatalogPage() {
  const [selectedEra, setSelectedEra] = useState<string>("All Eras");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredBooks = useMemo(() => {
    return searchBooks(searchQuery, selectedEra);
  }, [selectedEra, searchQuery]);

  return (
    <div className="min-h-screen bg-[#020204] text-white selection:bg-amber-400/30 selection:text-amber-100 font-sans">
      {/* Celestial cursor — golden star trail following the pointer */}
      <StarCursorTrail />
      {/* Top Navigation Header */}
      <header className="border-b border-white/10 bg-black/60 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-2 text-xs text-white/70 hover:text-white transition-colors px-3 py-1.5 rounded-full bg-white/5 border border-white/10"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Sanctuary Constellation</span>
            </Link>
            <Link
              href="/chronicles"
              className="hidden sm:flex items-center gap-2 text-xs text-white/50 hover:text-amber-300 transition-colors px-3 py-1.5 rounded-full bg-white/5 border border-white/10"
            >
              <Feather className="w-3.5 h-3.5 text-amber-400" />
              <span>Living Chronicles</span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-[11px] font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>4000 BC to 1928 • 100% Free Public Domain</span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-12 px-4 sm:px-6 max-w-5xl mx-auto text-center">
        {/* Subtle Ambient Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-amber-300 text-xs font-mono mb-4 animate-fade-in">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>The Sanctuary Library • Ancient Civilizations to Classical Masters</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif tracking-tight text-white/95 leading-tight mb-4">
          Timeless Literature for Solace, Grief & The Soul
        </h1>

        <p className="text-sm sm:text-base text-white/60 max-w-2xl mx-auto leading-relaxed mb-8">
          Complete, unabridged public-domain works spanning six millennia of human contemplation. Free to read forever, paired with continuous scroll reading and starlight quote reflection.
        </p>

        {/* Search Bar */}
        <div className="relative max-w-xl mx-auto">
          <Search className="w-4 h-4 text-white/40 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search 21 ancient & classic books (e.g. Gilgamesh, Ptahhotep, Rumi, Aurelius, Thoreau)..."
            className="w-full pl-11 pr-10 py-3.5 rounded-2xl bg-white/[0.04] border border-white/15 text-sm text-white placeholder-white/40 focus:outline-none focus:border-amber-400/50 transition-all shadow-xl"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-white/40 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Feature Pills */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 mt-6 text-xs text-white/50 font-mono">
          <span className="flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            {LIBRARY_BOOKS.length} Complete Unabridged Books
          </span>
          <span className="flex items-center gap-1.5">
            <ScrollText className="w-3.5 h-3.5 text-cyan-400" />
            Continuous Long-Scroll Reading
          </span>
          <span className="flex items-center gap-1.5">
            <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
            432Hz Soothing Sanctuary Audio
          </span>
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            Highlight & Release as Star
          </span>
        </div>
      </section>

      {/* Era Navigation Pills */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 mb-8">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-white/10">
          <div className="flex items-center gap-1.5 text-xs text-white/40 font-mono pr-2">
            <Compass className="w-3.5 h-3.5 text-amber-400/70" />
            <span>Eras:</span>
          </div>
          {LIBRARY_ERAS.map((era) => {
            const isActive = selectedEra === era;
            return (
              <button
                key={era}
                onClick={() => setSelectedEra(era)}
                className={`shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  isActive
                    ? "bg-amber-400/20 border border-amber-400/50 text-amber-200 shadow-md shadow-amber-500/10"
                    : "bg-white/[0.03] border border-white/5 text-white/60 hover:text-white hover:bg-white/[0.07]"
                }`}
              >
                {era}
              </button>
            );
          })}
        </div>
      </section>

      {/* Book Catalog Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
        <div className="mb-4 flex items-center justify-between text-xs text-white/40 font-mono">
          <span>Showing {filteredBooks.length} of {LIBRARY_BOOKS.length} masterworks</span>
          {selectedEra !== "All Eras" && (
            <button
              onClick={() => setSelectedEra("All Eras")}
              className="text-amber-300 hover:underline"
            >
              Clear Era Filter
            </button>
          )}
        </div>

        {filteredBooks.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-white/10 rounded-3xl p-8">
            <BookOpen className="w-10 h-10 text-white/20 mx-auto mb-3" />
            <h3 className="font-serif text-lg text-white/80">No books match your search</h3>
            <p className="text-xs text-white/40 mt-1 max-w-md mx-auto">
              Try searching for "Gilgamesh", "Ptahhotep", "Rumi", "Aurelius", "Thoreau", or reset filters.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedEra("All Eras");
              }}
              className="mt-4 px-4 py-2 rounded-xl bg-amber-400/20 border border-amber-400/40 text-amber-200 text-xs hover:bg-amber-400/30 transition-all"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredBooks.map((book) => (
              <article
                key={book.slug}
                className="group relative flex flex-col rounded-3xl bg-neutral-900/40 border border-white/10 hover:border-amber-400/40 transition-all duration-300 overflow-hidden hover:shadow-2xl hover:shadow-amber-500/5 hover:-translate-y-1"
              >
                {/* Book Jacket Top Header */}
                <div
                  className={`p-6 sm:p-7 bg-gradient-to-br ${book.coverGradient} border-b border-white/10 flex flex-col justify-between min-h-[190px]`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-1 rounded-full bg-black/40 border border-white/15 text-[10px] font-mono text-amber-300">
                      {book.category}
                    </span>
                    <span className="text-[11px] font-mono text-white/40">{book.year}</span>
                  </div>

                  <div>
                    <h2 className="text-2xl sm:text-3xl font-serif text-white group-hover:text-amber-200 transition-colors leading-tight">
                      {book.title}
                    </h2>
                    <p className="text-xs text-white/70 font-mono mt-1">
                      by <span className="text-white/90 font-medium">{book.author}</span>
                      {book.translator && (
                        <span className="text-white/40 text-[10px]"> • Transl. {book.translator}</span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Book Body */}
                <div className="p-6 flex-1 flex flex-col justify-between gap-5">
                  <div className="space-y-3">
                    <p className="text-xs text-white/60 leading-relaxed line-clamp-3">
                      {book.description}
                    </p>

                    {/* Featured Quote Block */}
                    <div className="p-3.5 rounded-2xl bg-white/[0.02] border-l-2 border-amber-400/60 text-white/80 italic text-xs font-serif leading-relaxed line-clamp-3">
                      "{book.quote}"
                    </div>
                  </div>

                  {/* Footer Meta & Action */}
                  <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3 text-[11px] font-mono text-white/40">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-white/40" />
                        {book.readTime}
                      </span>
                      <span>•</span>
                      <span>{book.chapters.length} Sections</span>
                    </div>

                    <Link
                      href={`/library/${book.slug}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-400/15 hover:bg-amber-400/25 border border-amber-400/30 text-amber-200 text-xs font-medium transition-all group-hover:border-amber-400/60"
                    >
                      <span>Read Free</span>
                      <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Feature Spotlight: Quote Highlight to Star */}
        <section className="mt-16 p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-amber-500/10 via-purple-500/5 to-transparent border border-amber-400/25 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-mono">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Sanctuary Reading Innovation</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-serif text-white">
              Highlight Any Line & Release It As Starlight
            </h3>
            <p className="text-xs sm:text-sm text-white/60 leading-relaxed">
              As you read any chapter in the Sanctuary Library, simply highlight a passage that
              touches your heart. You can instantly release it as an anonymous glowing star in the
              Solas Haven 3D constellation.
            </p>
          </div>

          <Link
            href="/"
            className="shrink-0 px-5 py-3 rounded-2xl bg-amber-400 text-black font-serif text-sm font-semibold hover:bg-amber-300 transition-all shadow-xl shadow-amber-500/20 flex items-center gap-2"
          >
            <span>Explore Constellation</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </section>

        {/* Legal & Public Domain Provenance Footer */}
        <div className="mt-14 text-center text-xs text-white/30 max-w-2xl mx-auto space-y-1 font-mono">
          <p>
            All works in the Sanctuary Library are confirmed in the Public Domain in the United
            States and internationally under Project Gutenberg and Standard Ebooks verification standards.
          </p>
          <p>Free for human contemplation, solace, and perpetual open preservation.</p>
        </div>
      </main>
    </div>
  );
}
