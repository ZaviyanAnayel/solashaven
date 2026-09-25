"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  X,
  ArrowLeft,
  Clock,
  Calendar,
  User,
  MapPin,
  Share2,
  Sparkles,
  Feather,
  ShieldCheck,
  Check,
  ExternalLink,
} from "lucide-react";
import { CommunityStory } from "./ShareStoryModal";

interface CommunityStoryReaderModalProps {
  story: CommunityStory | null;
  onClose: () => void;
}

export default function CommunityStoryReaderModal({
  story,
  onClose,
}: CommunityStoryReaderModalProps) {
  const [copied, setCopied] = useState(false);

  // Close on Escape key press
  useEffect(() => {
    if (!story) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [story, onClose]);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (story) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [story]);

  if (!story) return null;

  const handleShare = async () => {
    const url = `${window.location.origin}/chronicles/${story.slug}`;
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
    await copyToClipboard(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="community-story-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/85 backdrop-blur-xl animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-3xl my-auto bg-[#08090f] border border-amber-400/30 rounded-3xl p-6 sm:p-10 shadow-2xl shadow-amber-500/10 text-white selection:bg-amber-400/30 selection:text-amber-100 max-h-[92vh] overflow-y-auto">
        {/* Top Control Bar */}
        <div className="flex items-center justify-between pb-5 mb-6 border-b border-white/10">
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-xs text-white/70 hover:text-white transition-colors px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Chronicles</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-xs text-white/80 hover:text-white transition-colors"
              title="Share chronicle link"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300 font-mono text-[11px]">Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-amber-300" />
                  <span className="hidden sm:inline">Share</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Metadata Badges */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-white/50 mb-4">
          <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-mono text-[10px] border border-amber-400/30 font-semibold tracking-wider">
            COMMUNITY CHRONICLE
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-white/5 text-white/70 font-mono text-[10px] border border-white/10">
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

        {/* Story Title */}
        <h1
          id="community-story-title"
          className="text-2xl sm:text-4xl lg:text-5xl font-serif font-medium tracking-tight text-white/95 mb-3 leading-[1.2]"
        >
          {story.title}
        </h1>

        {/* Subtitle if available */}
        {story.subtitle && (
          <p className="text-sm sm:text-base text-amber-200/80 font-serif italic mb-6">
            "{story.subtitle}"
          </p>
        )}

        {/* Author Byline & Location */}
        <div className="flex flex-wrap items-center justify-between gap-3 py-3.5 px-4 rounded-2xl bg-white/[0.03] border border-white/10 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
              <User className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-medium text-white/95">{story.author}</div>
              {story.authorBio && (
                <div className="text-xs text-white/50 italic">{story.authorBio}</div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-amber-300/80 font-mono">
            {story.locationName && (
              <span className="flex items-center gap-1 text-white/60">
                <MapPin className="w-3 h-3 text-amber-400" />
                {story.locationName}
              </span>
            )}
            <span className="px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-300 text-[10px] border border-amber-400/20">
              ★ Verified Voice
            </span>
          </div>
        </div>

        {/* Story Prose */}
        <div className="space-y-6 text-base sm:text-lg text-neutral-200 leading-relaxed font-sans">
          {story.sections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-4">
              {section.heading && section.heading !== "The Memoir" && (
                <h2 className="text-xl sm:text-2xl font-serif font-medium text-white/90 pt-4 pb-1 border-b border-white/10">
                  {section.heading}
                </h2>
              )}
              {section.paragraphs.map((p, pIdx) => (
                <p
                  key={pIdx}
                  className={
                    sIdx === 0 && pIdx === 0
                      ? "first-letter:text-5xl first-letter:font-serif first-letter:text-amber-300 first-letter:float-left first-letter:mr-3 first-letter:leading-none text-neutral-100"
                      : "text-neutral-300/90"
                  }
                >
                  {p}
                </p>
              ))}
            </div>
          ))}
        </div>

        {/* Verification and Sanctuary footer */}
        <div className="mt-10 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-amber-300/90 font-mono">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>Archived Permanently in Solas Haven Sanctuary</span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/chronicles/${story.slug}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-xs text-white/70 hover:text-white transition-colors border border-white/10"
              onClick={onClose}
            >
              <span>Dedicated Page</span>
              <ExternalLink className="w-3 h-3 text-amber-300" />
            </Link>

            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-300 to-amber-400 text-black text-xs font-semibold hover:brightness-110 transition-all shadow-md shadow-amber-400/20"
              onClick={onClose}
            >
              <Feather className="w-3 h-3" />
              <span>Leave a Star</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
