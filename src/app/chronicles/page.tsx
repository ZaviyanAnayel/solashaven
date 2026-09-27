"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { CHRONICLES } from "../../lib/chroniclesData";
import {
  ArrowLeft,
  BookOpen,
  Clock,
  Sparkles,
  Feather,
  ShieldCheck,
  User,
  MapPin,
  PenSquare,
  Search,
  Tag,
  Calendar,
  Heart,
  Flame,
  ChevronRight,
  X
} from "lucide-react";
import ShareStoryModal, { CommunityStory } from "../../components/ShareStoryModal";
import CommunityStoryReaderModal from "../../components/CommunityStoryReaderModal";
import UserProfileModal from "../../components/UserProfileModal";
import CreatorIntelPulse from "../../components/CreatorIntelPulse";
import { useSoulProfile, CELESTIAL_AVATARS } from "../../lib/useSoulProfile";

const COMMUNITY_STORIES_KEY = "letters_to_eternity_community_stories_v1";

const CATEGORIES = [
  "All",
  "Grief & Memory",
  "Unspoken Love",
  "Spiritual Solace",
  "Forgiveness & Reconciliation",
  "Family & Roots",
  "Hope & Horizons",
  "Everyday Angels",
];

export default function ChroniclesPage() {
  const [communityStories, setCommunityStories] = useState<CommunityStory[]>([]);
  const [readingCommunityStory, setReadingCommunityStory] = useState<CommunityStory | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isSearchFocused, setIsSearchFocused] = useState<boolean>(false);

  const { profile, updateProfile } = useSoulProfile();
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Load community stories from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(COMMUNITY_STORIES_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setCommunityStories(parsed);
        }
      }
    } catch {}
  }, []);

  // Handle outside clicks to close search suggestions dropdown
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setIsSearchFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleStoryPublished = (newStory: CommunityStory) => {
    const updated = [newStory, ...communityStories];
    setCommunityStories(updated);
    try {
      localStorage.setItem(COMMUNITY_STORIES_KEY, JSON.stringify(updated));
    } catch {}
  };

  // Filtered community stories
  const filteredCommunityStories = useMemo(() => {
    return communityStories.filter((story) => {
      const matchesCategory =
        selectedCategory === "All" ||
        story.category.toLowerCase().includes(selectedCategory.toLowerCase()) ||
        selectedCategory.toLowerCase().includes(story.category.toLowerCase());
      if (!matchesCategory) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const matchTitle = (story.title || "").toLowerCase().includes(q);
      const matchAuthor = (story.author || "").toLowerCase().includes(q);
      const matchExcerpt = (story.excerpt || "").toLowerCase().includes(q);
      const matchLocation = (story.locationName || "").toLowerCase().includes(q);
      const matchContent = (story.sections || []).some((sec) =>
        (sec.paragraphs || []).some((p) => p.toLowerCase().includes(q))
      );
      return matchTitle || matchAuthor || matchExcerpt || matchLocation || matchContent;
    });
  }, [communityStories, selectedCategory, searchQuery]);

  // Instant Suggestions for Search Dropdown (matches from the first character)
  const searchSuggestions = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();

    const communityMatches = communityStories.filter((item) => {
      const matchTitle = (item.title || "").toLowerCase().includes(q);
      const matchAuthor = (item.author || "").toLowerCase().includes(q);
      const matchExcerpt = (item.excerpt || "").toLowerCase().includes(q);
      const matchCategory = (item.category || "").toLowerCase().includes(q);
      return matchTitle || matchAuthor || matchExcerpt || matchCategory;
    });

    const staticMatches = CHRONICLES.filter((item) => {
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchAuthor = (item.author || "").toLowerCase().includes(q);
      const matchExcerpt = item.excerpt.toLowerCase().includes(q);
      const matchTags = (item.tags || []).some((t) => t.toLowerCase().includes(q));
      const matchCategory = item.category.toLowerCase().includes(q);
      return matchTitle || matchAuthor || matchExcerpt || matchTags || matchCategory;
    });

    return [...communityMatches, ...staticMatches].slice(0, 8);
  }, [searchQuery, communityStories]);

  // Filtered stories for the full page feed
  const filteredChronicles = useMemo(() => {
    return CHRONICLES.filter((item) => {
      const matchesCategory =
        selectedCategory === "All" || item.category === selectedCategory;
      if (!matchesCategory) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchAuthor = (item.author || "").toLowerCase().includes(q);
      const matchExcerpt = item.excerpt.toLowerCase().includes(q);
      const matchTags = (item.tags || []).some((t) => t.toLowerCase().includes(q));

      return matchTitle || matchAuthor || matchExcerpt || matchTags;
    });
  }, [selectedCategory, searchQuery]);

  const currentAvatar =
    CELESTIAL_AVATARS.find((a) => a.id === profile.avatarId) || CELESTIAL_AVATARS[0];

  return (
    <div className="min-h-screen bg-[#020204] text-white selection:bg-amber-400/30 selection:text-amber-100">
      {/* Top Header */}
      <header className="border-b border-white/10 bg-black/60 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs text-white/60 hover:text-white transition-colors px-3 py-1.5 rounded-full bg-white/5 border border-white/10"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Living Constellation</span>
          </Link>

          <div className="flex items-center gap-2 text-xs text-amber-300 font-serif hidden md:flex">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>The Chronicles of Eternity • Solas Haven</span>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Soul Profile Pill */}
            <button
              onClick={() => setIsProfileModalOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/30 text-white transition-all text-xs font-medium shadow-sm"
              title="Your Soul Identity & Sacred Devotion Streak"
            >
              <div
                className={`w-5 h-5 rounded-full bg-gradient-to-tr ${currentAvatar.gradient} p-0.5 flex-shrink-0 flex items-center justify-center overflow-hidden`}
              >
                {profile.customAvatarUrl ? (
                  <img
                    src={profile.customAvatarUrl}
                    alt={profile.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <Sparkles className="w-3 h-3 text-white" />
                )}
              </div>
              <span className="hidden sm:inline font-serif font-medium">{profile.name}</span>
              <span className="px-1.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-mono flex items-center gap-0.5 font-semibold">
                <Flame className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                <span>Day {profile.streak}</span>
              </span>
            </button>

            <button
              onClick={() => setIsShareModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white font-medium text-xs transition-all"
            >
              <PenSquare className="w-3.5 h-3.5 text-amber-300" />
              <span className="hidden xs:inline">Share Story</span>
            </button>

            <Link
              href="/"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-300 text-black font-medium text-xs hover:brightness-110 transition-all shadow-md shadow-amber-300/20"
            >
              <Feather className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Leave a Star</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        {/* Hero Section */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-300 text-xs font-mono mb-4">
            <BookOpen className="w-3.5 h-3.5" />
            <span>52 SACRED REFLECTIONS & ESSAYS</span>
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-medium tracking-tight text-white/95 mb-4 max-w-3xl mx-auto leading-tight">
            The Living Chronicles
          </h1>
          <p className="text-sm sm:text-base text-neutral-400 max-w-2xl mx-auto leading-relaxed">
            Editorial reflections on grief, love, forgiveness, and silent prayer — written by the Solas Haven team as companions for the night.
          </p>
        </div>

        {/* Search & Suggestions Dropdown Section */}
        <div ref={searchContainerRef} className="mb-10 space-y-4 max-w-4xl mx-auto relative z-30">
          {/* Search Bar Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-white/40 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onFocus={() => setIsSearchFocused(true)}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchFocused(true);
              }}
              placeholder="Type any word, city, or name (e.g. 'Kyoto', 'father', 'rain', 'Seattle', 'umbrella')..."
              className="w-full pl-11 pr-10 py-3.5 rounded-2xl bg-white/[0.04] border border-white/15 text-white placeholder-white/40 text-sm focus:outline-none focus:border-amber-400/60 focus:bg-black/80 shadow-lg shadow-black/50 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setIsSearchFocused(false);
                }}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-full text-white/40 hover:text-white transition-colors"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Instant Autocomplete Suggestions Dropdown (Opens on first character typed) */}
          {isSearchFocused && searchQuery.trim().length >= 1 && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-[#09090e] border border-amber-400/30 rounded-2xl shadow-2xl shadow-black/90 backdrop-blur-2xl overflow-hidden animate-fade-in z-50">
              <div className="px-4 py-2.5 bg-amber-500/[0.05] border-b border-white/10 flex items-center justify-between text-[11px] font-mono text-amber-300">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>Matching Chronicles ({searchSuggestions.length} suggested)</span>
                </span>
                <span className="text-white/40">Click any story to read directly</span>
              </div>

              {searchSuggestions.length > 0 ? (
                <div className="divide-y divide-white/5 max-h-96 overflow-y-auto">
                  {searchSuggestions.map((item) => (
                    <Link
                      key={item.slug}
                      href={`/chronicles/${item.slug}`}
                      onClick={() => setIsSearchFocused(false)}
                      className="p-3.5 hover:bg-amber-400/[0.08] transition-colors flex items-center justify-between gap-3 group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {item.coverImage && (
                          <div className="w-12 h-12 rounded-xl overflow-hidden bg-neutral-900 flex-shrink-0 border border-white/10">
                            <img
                              src={item.coverImage}
                              alt={item.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 text-[10px] font-mono text-amber-300/80 mb-0.5">
                            <span className="px-1.5 py-0.2 rounded bg-amber-400/10 border border-amber-400/20">
                              {item.category}
                            </span>
                            {item.author && (
                              <span className="text-white/50 truncate">• {item.author}</span>
                            )}
                          </div>
                          <h4 className="text-sm font-serif font-medium text-white group-hover:text-amber-200 transition-colors truncate">
                            {item.title}
                          </h4>
                          <p className="text-xs text-white/40 truncate mt-0.5">
                            {item.excerpt}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-xs text-amber-300/60 group-hover:text-amber-300 font-mono flex-shrink-0">
                        <span className="hidden sm:inline text-[11px]">{item.readTime}</span>
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-xs text-white/50 font-mono">
                  No matching chronicles found for "{searchQuery}". Try another keyword.
                </div>
              )}

              {filteredChronicles.length > searchSuggestions.length && (
                <div className="p-2.5 bg-white/[0.02] border-t border-white/10 text-center">
                  <button
                    onClick={() => setIsSearchFocused(false)}
                    className="text-xs font-mono text-amber-300/90 hover:text-amber-200 hover:underline"
                  >
                    View all {filteredChronicles.length} results below ↓
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Category Filter Pills (Fixed formatting so all categories are fully visible) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none pt-2">
            {CATEGORIES.map((cat) => {
              const count =
                cat === "All"
                  ? CHRONICLES.length
                  : CHRONICLES.filter((c) => c.category === cat).length;
              const label = cat === "All" ? `All (${count})` : `${cat} (${count})`;
              const isSelected = selectedCategory === cat;

              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`shrink-0 px-4 py-2 rounded-full text-xs font-mono whitespace-nowrap transition-all border ${
                    isSelected
                      ? "bg-amber-400/20 border-amber-400/60 text-amber-300 shadow-md shadow-amber-400/10 font-medium"
                      : "bg-white/5 border-white/10 text-white/70 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Community Submitted Stories (if any) */}
        {filteredCommunityStories.length > 0 && (
          <div className="mb-14">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-300" />
                <h2 className="text-lg font-serif text-amber-200">Community Submissions</h2>
                <span className="text-xs text-white/40 font-mono">({filteredCommunityStories.length})</span>
              </div>
              <span className="text-[11px] text-amber-300/70 font-mono hidden sm:inline">
                Click any card to read full chronicle
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredCommunityStories.map((story) => (
                <article
                  key={story.slug}
                  onClick={() => setReadingCommunityStory(story)}
                  className="group cursor-pointer p-6 rounded-3xl border border-amber-400/25 bg-amber-500/[0.03] hover:bg-amber-500/[0.08] hover:border-amber-400/60 hover:shadow-xl hover:shadow-amber-500/10 transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2 text-xs text-white/40 mb-3">
                      <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-mono text-[10px] border border-amber-400/30 font-semibold tracking-wider">
                        COMMUNITY
                      </span>
                      <span className="text-white/60">{story.category}</span>
                      {story.locationName && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-white/50">
                            <MapPin className="w-3 h-3 text-amber-400/70" />
                            {story.locationName}
                          </span>
                        </>
                      )}
                    </div>
                    <h3 className="text-xl font-serif font-semibold text-white/95 group-hover:text-amber-200 transition-colors mb-2">
                      {story.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-amber-300/80 mb-3">
                      <User className="w-3 h-3" />
                      <span>{story.author}</span>
                      {story.authorBio && <span className="text-white/40 italic">— {story.authorBio}</span>}
                    </div>
                    <p className="text-sm text-neutral-300/80 line-clamp-3 leading-relaxed mb-4">
                      {story.sections[0]?.paragraphs[0]}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-white/40 font-mono">
                    <span className="flex items-center gap-1 text-white/50">
                      <Clock className="w-3 h-3 text-amber-400/70" />
                      {story.readTime || "2 min read"}
                    </span>
                    <div className="flex items-center gap-1.5 text-amber-300 font-sans font-medium group-hover:translate-x-0.5 transition-transform">
                      <span>Read Memoir</span>
                      <span>→</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}

        {/* Stories Grid */}
        <div className="mb-6 flex items-center justify-between text-xs text-white/40 font-mono">
          <span>Showing {filteredChronicles.length} of {CHRONICLES.length} chronicles</span>
          {selectedCategory !== "All" && (
            <span className="text-amber-300/70">Category: {selectedCategory}</span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredChronicles.map((article) => (
            <article
              key={article.slug}
              className="group relative rounded-3xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-amber-400/30 transition-all duration-300 flex flex-col overflow-hidden shadow-lg shadow-black/40"
            >
              {/* Cover Image */}
              {article.coverImage && (
                <div className="relative h-48 w-full overflow-hidden bg-neutral-900">
                  <img
                    src={article.coverImage}
                    alt={article.title}
                    loading="lazy"
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 brightness-90 group-hover:brightness-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#020204] via-transparent to-black/30" />
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-amber-300 font-mono text-[10px] border border-white/10">
                    {article.category}
                  </span>
                  <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white/70 font-mono text-[10px] border border-white/10 flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" />
                    {article.readTime}
                  </span>
                </div>
              )}

              {/* Card Body */}
              <div className="p-6 flex flex-col flex-1 justify-between">
                <div>
                  {/* Author attribution */}
                  {article.author && (
                    <div className="flex items-center gap-1.5 text-xs text-amber-300/80 mb-2 font-medium">
                      <User className="w-3 h-3 text-amber-400" />
                      <span>{article.author}</span>
                    </div>
                  )}

                  <h2 className="text-lg sm:text-xl font-serif font-semibold text-white/95 group-hover:text-amber-200 transition-colors mb-2 leading-snug">
                    <Link href={`/chronicles/${article.slug}`}>
                      {article.title}
                    </Link>
                  </h2>

                  <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed line-clamp-3 mb-4">
                    {article.excerpt}
                  </p>
                </div>

                {/* Tags & Action Link */}
                <div>
                  {article.tags && article.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {article.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded-full bg-white/5 text-white/50 text-[10px] font-mono border border-white/5"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs">
                    <Link
                      href={`/chronicles/${article.slug}`}
                      className="text-amber-300/90 group-hover:text-amber-200 font-medium flex items-center gap-1 transition-colors"
                    >
                      <span>Read Memoir</span>
                      <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </Link>
                    <span className="text-[11px] text-white/30 font-mono">
                      {article.publishedAt}
                    </span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Empty Search State */}
        {filteredChronicles.length === 0 && (
          <div className="text-center py-16 px-4">
            <BookOpen className="w-10 h-10 text-white/20 mx-auto mb-3" />
            <h3 className="text-lg font-serif text-white/80 mb-1">No chronicles matched your search</h3>
            <p className="text-xs text-white/40 mb-4">
              Try adjusting your search terms or select another category filter.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All");
              }}
              className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs transition-colors"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Bottom CTA to Share a Story */}
        <div className="mt-20 p-8 sm:p-12 rounded-3xl border border-amber-400/25 bg-gradient-to-b from-amber-500/10 via-amber-500/5 to-transparent text-center relative overflow-hidden">
          <Sparkles className="w-8 h-8 text-amber-300 mx-auto mb-3 animate-pulse" />
          <h3 className="text-2xl sm:text-3xl font-serif font-medium text-white mb-2">
            Every human soul carries a story worth recording.
          </h3>
          <p className="text-xs sm:text-sm text-white/60 max-w-lg mx-auto mb-6 leading-relaxed">
            Your private grief, your unspoken confessions, or the ordinary miracle of someone who saved your life. Add your voice to the global sanctuary.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => setIsShareModalOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-amber-300 to-amber-400 text-black font-semibold text-xs hover:brightness-110 transition-all shadow-lg shadow-amber-300/20"
            >
              <PenSquare className="w-4 h-4" />
              <span>Share Your True Story</span>
            </button>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 hover:bg-white/15 text-white font-medium text-xs transition-all border border-white/15"
            >
              <Feather className="w-4 h-4 text-amber-300" />
              <span>Release a Star to the Sky</span>
            </Link>
          </div>
        </div>
      </main>

      {/* Share Story Modal */}
      <ShareStoryModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        onStoryPublished={handleStoryPublished}
      />

      {/* Soul Profile Modal */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profile={profile}
        onSaveProfile={updateProfile}
      />

      {/* Community Story Reader Modal */}
      <CommunityStoryReaderModal
        story={readingCommunityStory}
        onClose={() => setReadingCommunityStory(null)}
      />

      {/* Creator Intelligence Hub (Sanctuary Sentinel) */}
      <CreatorIntelPulse />

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 px-4 text-center mt-12">
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