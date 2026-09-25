"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Clock,
  Calendar,
  User,
  MapPin,
  Share2,
  ShieldCheck,
  Feather,
  Sparkles,
  BookOpen,
  Tag,
  Check,
} from "lucide-react";
import { CommunityStory } from "./ShareStoryModal";
import { CHRONICLES } from "../lib/chroniclesData";

const COMMUNITY_STORIES_KEY = "letters_to_eternity_community_stories_v1";

export default function CommunityChronicleFallback({ slug }: { slug: string }) {
  const [story, setStory] = useState<CommunityStory | null | undefined>(undefined);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(COMMUNITY_STORIES_KEY);
      if (saved) {
        const stories: CommunityStory[] = JSON.parse(saved);
        const found = stories.find((s) => s.slug === slug);
        if (found) {
          setStory(found);
          return;
        }
      }
    } catch {}
    setStory(null);
  }, [slug]);

  const handleShare = async () => {
    if (!story) return;
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${story.title} | Solas Haven`,
          text: `Read "${story.title}" on Solas Haven`,
          url,
        });
        return;
      } catch {}
    }
    const { copyToClipboard } = await import("@/utils/clipboard");
    const ok = await copyToClipboard(url);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // Loading state
  if (story === undefined) {
    return (
      <div className="min-h-screen bg-[#020204] text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-8 h-8 border-2 border-amber-300 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs text-white/50 font-mono">Searching celestial archives...</p>
      </div>
    );
  }

  // Not found in either static data or localStorage
  if (story === null) {
    return (
      <div className="min-h-screen bg-[#020204] text-white flex flex-col items-center justify-center p-6 text-center">
        <BookOpen className="w-12 h-12 text-white/20 mb-4" />
        <h1 className="text-2xl font-serif mb-2">Memoir Not Found</h1>
        <p className="text-sm text-white/50 max-w-sm mb-6">
          This chronicle may have been moved, archived, or was written in a private session.
        </p>
        <Link
          href="/chronicles"
          className="px-6 py-2.5 rounded-full bg-gradient-to-r from-amber-300 to-amber-400 text-black text-xs font-semibold hover:brightness-110 transition-all shadow-lg shadow-amber-400/20"
        >
          Return to Chronicles Archive
        </Link>
      </div>
    );
  }

  const related = CHRONICLES.slice(0, 3);

  return (
    <div className="min-h-screen bg-[#020204] text-white selection:bg-amber-400/30 selection:text-amber-100">
      {/* Top Bar */}
      <header className="border-b border-white/10 bg-black/50 backdrop-blur-xl sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <Link
            href="/chronicles"
            className="flex items-center gap-2 text-xs text-white/60 hover:text-white transition-colors px-3 py-1.5 rounded-full bg-white/5 border border-white/10"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>All Chronicles</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-xs text-white/80 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300 font-mono text-[11px]">Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-amber-300" />
                  <span>Share</span>
                </>
              )}
            </button>

            <Link
              href="/"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-300 text-black font-medium text-xs hover:brightness-110 transition-all"
            >
              <Feather className="w-3.5 h-3.5" />
              <span>Leave a Star</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Header */}
      <div className="relative w-full max-w-4xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14">
        {/* Category & Metadata Pills */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs text-white/50 mb-4">
          <span className="px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 font-mono text-[11px] border border-amber-400/30 font-semibold tracking-wider">
            COMMUNITY CHRONICLE
          </span>
          <span className="px-3 py-1 rounded-full bg-white/5 text-white/70 font-mono text-[11px] border border-white/10">
            {story.category}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-400/70" />
            {story.readTime}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3 text-white/40" />
            {story.publishedAt}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-medium tracking-tight text-white/95 mb-4 leading-[1.15]">
          {story.title}
        </h1>

        {/* Subtitle */}
        {story.subtitle && (
          <p className="text-base sm:text-xl text-neutral-300/90 font-serif italic leading-relaxed mb-6">
            "{story.subtitle}"
          </p>
        )}

        {/* Author Byline & Location */}
        <div className="flex flex-wrap items-center justify-between gap-3 py-3 border-y border-white/10 mb-8 text-xs text-white/70">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
              <User className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="font-medium text-white/90">{story.author}</span>
              {story.authorBio && (
                <span className="text-white/40 ml-2 italic">— {story.authorBio}</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-amber-300/80 font-mono">
            {story.locationName && (
              <span className="flex items-center gap-1 text-white/60">
                <MapPin className="w-3 h-3 text-amber-400" />
                {story.locationName}
              </span>
            )}
            <span className="text-amber-300/70">★ Verified Community Voice</span>
          </div>
        </div>
      </div>

      {/* Main Story Prose */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 pb-16">
        <div className="space-y-10 text-base sm:text-lg text-neutral-300 leading-relaxed font-sans">
          {story.sections.map((sec, sIdx) => (
            <section key={sIdx} className="space-y-5">
              {sec.heading && sec.heading !== "The Memoir" && (
                <h2 className="text-2xl sm:text-3xl font-serif font-medium text-white/95 pt-6 pb-2 border-b border-white/[0.08]">
                  {sec.heading}
                </h2>
              )}
              {sec.paragraphs.map((p, pIdx) => (
                <p
                  key={pIdx}
                  className={
                    sIdx === 0 && pIdx === 0
                      ? "first-letter:text-5xl first-letter:font-serif first-letter:text-amber-300 first-letter:float-left first-letter:mr-3 first-letter:leading-none text-neutral-200"
                      : "text-neutral-300"
                  }
                >
                  {p}
                </p>
              ))}
            </section>
          ))}
        </div>

        {/* Verification Badge */}
        <div className="mt-12 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Tag className="w-3.5 h-3.5 text-white/40" />
            <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-white/60 text-xs font-mono">
              #{story.category.toLowerCase().replace(/[^a-z0-9]/g, "-")}
            </span>
            <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-white/60 text-xs font-mono">
              #community-memoir
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-amber-300/80 font-mono">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>Archived Permanently in Solas Haven</span>
          </div>
        </div>

        {/* Related Chronicles Section */}
        {related.length > 0 && (
          <div className="mt-20 pt-10 border-t border-white/10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-300" />
                <h3 className="text-xl font-serif font-medium text-white">More Memoirs & Chronicles</h3>
              </div>
              <Link href="/chronicles" className="text-xs text-amber-300 hover:underline">
                View All ({CHRONICLES.length}) →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {related.map((rel) => (
                <Link
                  key={rel.slug}
                  href={`/chronicles/${rel.slug}`}
                  className="group block p-4 rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-amber-400/30 transition-all flex flex-col justify-between"
                >
                  {rel.coverImage && (
                    <div className="w-full h-28 rounded-xl overflow-hidden mb-3 bg-neutral-900">
                      <img
                        src={rel.coverImage}
                        alt={rel.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 brightness-90 group-hover:brightness-100"
                      />
                    </div>
                  )}
                  <div>
                    <span className="text-[10px] font-mono text-amber-300/80 block mb-1">
                      {rel.category}
                    </span>
                    <h4 className="text-sm font-serif font-medium text-white/95 group-hover:text-amber-200 transition-colors line-clamp-2 mb-2 leading-snug">
                      {rel.title}
                    </h4>
                  </div>
                  <span className="text-[11px] text-white/40 font-mono flex items-center gap-1 mt-2">
                    <Clock className="w-2.5 h-2.5" />
                    {rel.readTime}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Sanctuary Call to Action */}
        <div className="mt-16 p-8 sm:p-10 rounded-3xl border border-amber-400/20 bg-gradient-to-b from-amber-500/10 to-transparent text-center">
          <Sparkles className="w-6 h-6 text-amber-300 mx-auto mb-3" />
          <h3 className="text-xl font-serif font-medium text-white mb-2">
            Is there a letter lingering in your silence?
          </h3>
          <p className="text-xs sm:text-sm text-white/60 max-w-md mx-auto mb-6 leading-relaxed">
            Do not let your unsaid words weigh down your heart. Release them to the eternal living constellation of Solas Haven.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-amber-300 to-amber-400 text-black font-semibold text-xs hover:brightness-110 transition-all shadow-lg shadow-amber-300/20"
          >
            <Feather className="w-3.5 h-3.5" />
            <span>Enter the Sanctuary & Release a Star</span>
          </Link>
        </div>
      </main>

      <footer className="border-t border-white/10 py-8 px-4 text-center">
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-white/60 mb-3 font-sans">
          <Link href="/privacy" className="hover:text-amber-300 transition-colors">Privacy Policy</Link>
          <span>•</span>
          <Link href="/terms" className="hover:text-amber-300 transition-colors">Terms of Sanctuary</Link>
          <span>•</span>
          <Link href="/contact" className="hover:text-amber-300 transition-colors">Contact & Support</Link>
        </div>
        <p className="text-[11px] text-white/30 tracking-widest font-mono uppercase">
          Solas Haven • Operated by Zaviyan • business@zaviyanllc.com
        </p>
      </footer>
    </div>
  );
}
