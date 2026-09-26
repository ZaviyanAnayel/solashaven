"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { CATEGORIES, LetterCategory } from "../lib/types";
import {
  Volume2,
  VolumeX,
  Sparkles,
  Feather,
  Star,
  ShieldCheck,
  BookOpen,
  Compass,
  Search,
  X,
  Globe2,
  MapPin,
  ChevronDown,
  Wind,
  Flame,
  Moon,
  Menu,
  ChevronRight,
  Bookmark,
  Landmark
} from "lucide-react";
import { filterRegions, EarthRegion } from "../lib/countries";
import { useSoulProfile, CELESTIAL_AVATARS } from "../lib/useSoulProfile";
import GlobalPulse from "./GlobalPulse";

interface HeaderProps {
  selectedCategory: LetterCategory | "all";
  onSelectCategory: (cat: LetterCategory | "all") => void;
  searchLocation: string;
  onSearchLocationChange: (val: string) => void;
  onOpenReleaseModal: () => void;
  onOpenPrivacyModal: () => void;
  onWander: () => void;
  isAudioPlaying: boolean;
  onToggleAudio: () => void;
  totalStarsCount: number;
  userStarsCount: number;
  onFocusMyStar: () => void;
  onOpenVigil?: () => void;
  onOpenBreath?: () => void;
  onOpenProfile?: () => void;
  onOpenWell?: () => void;
  onOpenCandles?: () => void;
}

export default function Header({
  selectedCategory,
  onSelectCategory,
  searchLocation,
  onSearchLocationChange,
  onOpenReleaseModal,
  onOpenPrivacyModal,
  onWander,
  isAudioPlaying,
  onToggleAudio,
  totalStarsCount,
  userStarsCount,
  onFocusMyStar,
  onOpenVigil,
  onOpenBreath,
  onOpenProfile,
  onOpenWell,
  onOpenCandles,
}: HeaderProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [localCountry, setLocalCountry] = useState<string>("");
  const { profile } = useSoulProfile();
  const currentAvatar =
    CELESTIAL_AVATARS.find((a) => a.id === profile.avatarId) || CELESTIAL_AVATARS[0];
  const matchingRegions = filterRegions(searchLocation, 12);

  // Dynamically detect the visitor's own country or region so it's customized for EVERY user worldwide
  useEffect(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const parts = tz.split("/");
      const region = parts[parts.length - 1]?.replace(/_/g, " ");
      if (region) {
        setLocalCountry(region);
      }
    } catch {}

    // Lightweight async check for exact country name via internal API (zero CORS errors)
    fetch("/api/geo")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.country && data.country !== "Earth") {
          setLocalCountry(data.country);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-30 pointer-events-none">
      <div className="mx-auto w-full max-w-[1700px] px-3 sm:px-6 py-2.5 sm:py-3.5 flex flex-col gap-2 sm:gap-2.5">
        {/* Top Bar: Brand, Navigation, Tools */}
        <div className="flex items-center justify-between pointer-events-auto w-full gap-2 sm:gap-4">
          {/* Logo & Vision */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <div className="relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-br from-amber-400/15 via-amber-500/5 to-purple-500/10 border border-amber-300/30 backdrop-blur-xl shadow-xl shadow-amber-500/15 group">
              <svg viewBox="0 0 40 40" fill="none" className="w-5 h-5 sm:w-5.5 sm:h-5.5 transition-transform duration-700 group-hover:scale-110">
                <defs>
                  <linearGradient id="solasGold" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FDE68A" />
                    <stop offset="50%" stopColor="#F59E0B" />
                    <stop offset="100%" stopColor="#D97706" />
                  </linearGradient>
                  <linearGradient id="havenArc" x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#818CF8" stopOpacity="0.8" />
                    <stop offset="50%" stopColor="#FDE68A" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.7" />
                  </linearGradient>
                  <radialGradient id="solasGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#FDE68A" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
                  </radialGradient>
                </defs>
                {/* Haven Sanctuary Arc / Cradle */}
                <path
                  d="M8 22C8 28.6274 13.3726 34 20 34C26.6274 34 32 28.6274 32 22"
                  stroke="url(#havenArc)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeDasharray="2 1"
                  className="opacity-75"
                />
                <path
                  d="M10 21C10 26.5228 14.4772 31 20 31C25.5228 31 30 26.5228 30 21"
                  stroke="url(#solasGold)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                {/* Central Solas Radiant Star (Light) */}
                <circle cx="20" cy="18" r="4" fill="url(#solasGlow)" className="animate-pulse" />
                <path
                  d="M20 7L21.6 14.4L29 16L21.6 17.6L20 25L18.4 17.6L11 16L18.4 14.4Z"
                  fill="url(#solasGold)"
                />
                <circle cx="20" cy="16" r="1.5" fill="#FFFFFF" />
              </svg>
              <div className="absolute inset-0 rounded-2xl bg-amber-400/20 blur-md pointer-events-none" />
            </div>
            <div className="shrink-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold tracking-[0.14em] uppercase text-white/95 text-[14px] sm:text-[15px] font-serif">
                  Solas Haven
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5 text-[10px] sm:text-[11px] text-white/50 font-light">
                <span className="hidden md:inline">Where unspoken words find peace</span>
                <span className="hidden md:inline text-white/20">•</span>
                <button
                  type="button"
                  onClick={onOpenPrivacyModal}
                  className="inline-flex items-center gap-1 text-emerald-400/90 hover:text-emerald-300 transition-colors font-mono cursor-pointer"
                  title="View Sanctuary Zero-Knowledge Guarantee"
                >
                  <ShieldCheck className="w-3 h-3" />
                  <span>100% Anonymous</span>
                </button>
              </div>
            </div>
          </div>

          {/* Center Navigation: Responsive & Collision-Free (Never Overlaps) */}
          <div className="hidden lg:flex items-center justify-center shrink-0">
            {/* Full Expanded Nav on Ultra-wide (2xl >= 1536px) */}
            <nav className="hidden 2xl:flex items-center gap-1 p-1 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-2xl shadow-lg shadow-black/40">
              <Link
                href="/chronicles"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-white/80 hover:text-white hover:bg-white/10 transition-all whitespace-nowrap"
              >
                <BookOpen className="w-3.5 h-3.5 text-amber-300" />
                <span>Chronicles</span>
              </Link>

              <Link
                href="/library"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-white/80 hover:text-white hover:bg-white/10 transition-all whitespace-nowrap"
              >
                <Bookmark className="w-3.5 h-3.5 text-amber-400" />
                <span>Library</span>
              </Link>

              <button
                type="button"
                onClick={() => {
                  if (onOpenCandles) onOpenCandles();
                  else window.location.href = "/candle";
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-amber-200 hover:text-white hover:bg-amber-400/15 border border-amber-400/25 hover:border-amber-300/60 shadow-sm shadow-amber-500/10 transition-all whitespace-nowrap cursor-pointer"
                title="Turn Candle — Light an Eternal Flame in the Sacred Quietude"
              >
                <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400/30 animate-pulse" />
                <span>Turn Candle</span>
              </button>

              <Link
                href="/museum"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-amber-200 hover:text-white hover:bg-white/10 transition-all whitespace-nowrap"
              >
                <Landmark className="w-3.5 h-3.5 text-amber-300" />
                <span>The Almost Museum</span>
              </Link>

              {onOpenVigil && (
                <button
                  type="button"
                  onClick={onOpenVigil}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-amber-200/90 hover:text-amber-200 hover:bg-amber-400/15 transition-all whitespace-nowrap cursor-pointer"
                  title="Hold Global Silent Vigil"
                >
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  <span>Vigil</span>
                </button>
              )}

              {onOpenBreath && (
                <button
                  type="button"
                  onClick={onOpenBreath}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-sky-200/90 hover:text-sky-200 hover:bg-sky-400/15 transition-all whitespace-nowrap cursor-pointer"
                  title="Somatic Grounding Breath"
                >
                  <Wind className="w-3.5 h-3.5 text-sky-300" />
                  <span>Breathe</span>
                </button>
              )}

              {onOpenWell && (
                <button
                  type="button"
                  onClick={onOpenWell}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-amber-200/90 hover:text-amber-200 hover:bg-amber-400/15 transition-all whitespace-nowrap cursor-pointer"
                  title="Talk with Solas (Sanctuary AI)"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                  <span>Let&apos;s Talk</span>
                </button>
              )}

              <button
                type="button"
                onClick={onWander}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-indigo-200/90 hover:text-indigo-200 hover:bg-indigo-400/15 transition-all whitespace-nowrap cursor-pointer"
                title="Wander to a random star"
              >
                <Compass className="w-3.5 h-3.5 text-indigo-300" />
                <span>Wander</span>
              </button>

              <Link
                href="/about"
                className="px-3 py-1.5 rounded-full text-xs font-medium text-white/60 hover:text-white hover:bg-white/10 transition-all whitespace-nowrap"
              >
                About
              </Link>
            </nav>

            {/* Compact 2-Pill Nav on Standard Laptops / Zoomed Screens (1024px to 1535px) */}
            <nav className="flex 2xl:hidden items-center gap-1 p-1 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-2xl shadow-lg shadow-black/40">
              <Link
                href="/chronicles"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-white/80 hover:text-white hover:bg-white/10 transition-all whitespace-nowrap"
              >
                <BookOpen className="w-3.5 h-3.5 text-amber-300" />
                <span>Chronicles</span>
              </Link>

              <Link
                href="/library"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-white/80 hover:text-white hover:bg-white/10 transition-all whitespace-nowrap"
              >
                <Bookmark className="w-3.5 h-3.5 text-amber-400" />
                <span>Library</span>
              </Link>

              <button
                type="button"
                onClick={() => {
                  if (onOpenCandles) onOpenCandles();
                  else window.location.href = "/candle";
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-amber-200 hover:text-white hover:bg-amber-400/15 border border-amber-400/25 hover:border-amber-300/60 shadow-sm shadow-amber-500/10 transition-all whitespace-nowrap cursor-pointer"
                title="Turn Candle — Light an Eternal Flame in the Sacred Quietude"
              >
                <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400/30 animate-pulse" />
                <span>Turn Candle</span>
              </button>

              <Link
                href="/museum"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-amber-200 hover:text-white hover:bg-white/10 transition-all whitespace-nowrap"
              >
                <Landmark className="w-3.5 h-3.5 text-amber-300" />
                <span>Museum</span>
              </Link>
            </nav>
          </div>

          {/* Right Action Tools Cluster */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">

            {/* Earth Search Toggle (Desktop only, available in mobile menu) */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className={`hidden sm:flex p-2 rounded-full border text-xs transition-all backdrop-blur-xl cursor-pointer ${
                isSearchOpen || searchLocation
                  ? "bg-amber-400/20 border-amber-400/50 text-amber-200 shadow-md shadow-amber-400/20"
                  : "bg-white/5 hover:bg-white/10 border-white/10 text-white/70 hover:text-white"
              }`}
              title={searchLocation ? `Filtered by ${searchLocation}` : "Filter stars by region"}
            >
              <Globe2 className="w-4 h-4" />
            </button>

            {/* Sound Toggle */}
            <button
              onClick={onToggleAudio}
              title={isAudioPlaying ? "Mute ambient audio" : "Play 432Hz ambient frequency"}
              className={`p-1.5 sm:p-2 rounded-full border transition-all duration-300 backdrop-blur-xl cursor-pointer ${
                isAudioPlaying
                  ? "bg-amber-500/20 border-amber-400/50 text-amber-300 shadow-md shadow-amber-500/20"
                  : "bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10"
              }`}
            >
              {isAudioPlaying ? (
                <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-300" />
              ) : (
                <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              )}
            </button>

            {/* User Stars Locator (Desktop only, accessible in drawer) */}
            {userStarsCount > 0 && (
              <button
                onClick={onFocusMyStar}
                className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-amber-400/15 border border-amber-400/40 text-amber-300 hover:bg-amber-400/25 transition-all text-xs font-medium cursor-pointer"
                title="Locate your stars"
              >
                <Star className="w-3.5 h-3.5 fill-amber-300" />
                <span>{userStarsCount}</span>
              </button>
            )}

            {/* Soul Profile Pill (Desktop only, prominent in mobile menu drawer) */}
            <button
              onClick={onOpenProfile}
              className="hidden sm:flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 hover:border-amber-400/40 text-white transition-all text-xs font-medium shadow-sm cursor-pointer"
              title="Your Profile & Starlight Milestones"
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
              <span className="font-serif">{profile.name}</span>
              <span className="px-1.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-mono flex items-center gap-0.5 font-semibold">
                <Flame className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                <span>{profile.streak}d</span>
              </span>
            </button>

            {/* Primary Action: Release a Star */}
            <button
              onClick={onOpenReleaseModal}
              className="group relative inline-flex items-center gap-1 sm:gap-1.5 px-3 sm:px-5 py-1.5 sm:py-2 rounded-full bg-gradient-to-r from-amber-200 via-amber-100 to-amber-300 text-neutral-950 font-semibold text-xs sm:text-sm tracking-wide shadow-lg shadow-amber-300/20 hover:shadow-amber-300/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer"
            >
              <Feather className="w-3 h-3 sm:w-3.5 sm:h-3.5 transition-transform group-hover:-rotate-12" />
              <span>Release</span>
            </button>

            {/* Mobile Sanctuary Menu Button (Accessible on all screens below 2xl) */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="2xl:hidden flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border border-amber-400/35 bg-amber-400/10 hover:bg-amber-400/20 text-amber-200 hover:text-white transition-all backdrop-blur-xl cursor-pointer shadow-sm active:scale-95"
              title="Open Sanctuary Navigation Drawer"
            >
              <Menu className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-300" />
              <span className="text-xs font-serif font-medium">Menu</span>
            </button>
          </div>
        </div>

        {/* Expandable Earth Region Search Bar (Dynamic & Universal with Live Autocomplete) */}
        {isSearchOpen && (
          <div className="relative pointer-events-auto flex flex-col gap-2 p-2.5 rounded-2xl bg-black/85 border border-white/15 backdrop-blur-2xl animate-fade-in shadow-2xl">
            <div className="flex flex-col sm:flex-row items-center gap-2 w-full">
              <div className="relative flex-1 w-full flex items-center">
                <Search className="w-4 h-4 text-white/40 absolute left-3.5 pointer-events-none" />
                <input
                  type="text"
                  autoFocus
                  value={searchLocation}
                  onFocus={() => setIsDropdownOpen(true)}
                  onChange={(e) => {
                    onSearchLocationChange(e.target.value);
                    setIsDropdownOpen(true);
                  }}
                  placeholder="Search any country or realm (e.g. United States, Japan, Brazil, Ocean)..."
                  className="w-full pl-9 pr-8 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-xs text-white placeholder-white/40 focus:outline-none focus:border-amber-400/50 transition-all"
                />
                {searchLocation && (
                  <button
                    onClick={() => {
                      onSearchLocationChange("");
                      setIsDropdownOpen(false);
                    }}
                    className="absolute right-2.5 p-1 rounded-full text-white/40 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Dynamic Universal Presets - Shows User's OWN local place first! */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none py-0.5">
                <button
                  onClick={() => {
                    onSearchLocationChange("");
                    setIsDropdownOpen(false);
                  }}
                  className={`shrink-0 px-2.5 py-1 rounded-lg text-[11px] font-mono border transition-all ${
                    !searchLocation
                      ? "bg-white/20 border-white/40 text-white"
                      : "bg-white/5 border-white/10 text-white/60 hover:text-white"
                  }`}
                >
                  All Earth
                </button>

                {/* Dynamic Local Region Button */}
                {localCountry && (
                  <button
                    onClick={() => {
                      onSearchLocationChange(localCountry);
                      setIsDropdownOpen(false);
                    }}
                    className={`shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-mono border transition-all ${
                      searchLocation.toLowerCase() === localCountry.toLowerCase()
                        ? "bg-amber-400/25 border-amber-400/60 text-amber-300"
                        : "bg-amber-400/10 border-amber-400/25 text-amber-300/80 hover:text-amber-200"
                    }`}
                  >
                    <MapPin className="w-3 h-3 text-amber-400" />
                    <span>Near Me ({localCountry})</span>
                  </button>
                )}

                {/* Universal Poetic Earth Realms */}
                {[
                  { label: "🌊 Oceans", query: "Ocean" },
                  { label: "🌲 Forests", query: "Rainforest" },
                  { label: "🏔️ Mountains", query: "Himalayas" },
                  { label: "❄️ Polar", query: "Antarctica" }
                ].map((r) => (
                  <button
                    key={r.label}
                    onClick={() => {
                      onSearchLocationChange(r.query);
                      setIsDropdownOpen(false);
                    }}
                    className={`shrink-0 px-2.5 py-1 rounded-lg text-[11px] font-mono border transition-all ${
                      searchLocation.toLowerCase() === r.query.toLowerCase()
                        ? "bg-amber-400/20 border-amber-400/50 text-amber-300"
                        : "bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {/* LIVE AUTOCOMPLETE DROPDOWN - Displays all matching world nations and realms */}
            {isDropdownOpen && searchLocation.trim().length > 0 && matchingRegions.length > 0 && (
              <div className="w-full mt-1 p-2 rounded-xl bg-neutral-900/95 border border-white/15 shadow-2xl max-h-56 overflow-y-auto scrollbar-none animate-fade-in z-50">
                <div className="flex items-center justify-between px-2.5 py-1 text-[10px] font-mono text-white/40 border-b border-white/10 mb-1">
                  <span>WORLD NATIONS & REALMS MATCHING "{searchLocation.toUpperCase()}" ({matchingRegions.length})</span>
                  <span className="text-amber-300/80">Tap to Filter & Teleport</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                  {matchingRegions.map((region) => (
                    <button
                      key={region.name}
                      type="button"
                      onClick={() => {
                        onSearchLocationChange(region.name);
                        setIsDropdownOpen(false);
                      }}
                      className="flex items-center justify-between px-3 py-1.5 rounded-lg text-xs text-neutral-200 hover:text-white hover:bg-white/10 text-left transition-colors"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="text-sm shrink-0">{region.flag}</span>
                        <span className="truncate">{region.name}</span>
                      </div>
                      <span className="text-[10px] font-mono text-white/40 ml-2 shrink-0">
                        {region.category === "realm" ? "Realm" : region.category === "city" ? "City" : "Nation"}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Category Pills (Sub-Nav - Fluidly Centered, Never Clipped on Zoom) */}
        <div className="pointer-events-auto w-full overflow-x-auto scrollbar-none py-1 px-1 flex justify-start lg:justify-center">
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 px-2 sm:px-4 mx-auto">
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => onSelectCategory(cat.id)}
                  className={`shrink-0 flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-medium tracking-wide transition-all duration-200 backdrop-blur-md border ${
                    isSelected
                      ? "bg-white/15 border-white/40 text-white shadow-md shadow-white/10"
                      : "bg-black/40 border-white/10 text-white/50 hover:text-white/90 hover:bg-white/[0.08]"
                  }`}
                  style={
                    isSelected && cat.id !== "all"
                      ? {
                          borderColor: `${cat.color}70`,
                          backgroundColor: `${cat.color}20`,
                          color: "#ffffff"
                        }
                      : {}
                  }
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Global Pulse Ticker (Flows naturally right below category pills with ZERO collision) */}
        <GlobalPulse />
      </div>

      {/* Mobile Sanctuary Drawer (Full Touch-Screen Navigation) */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 z-50 pointer-events-auto flex justify-end bg-black/80 backdrop-blur-xl animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm h-full bg-[#07080f]/95 border-l border-white/10 p-5 sm:p-6 flex flex-col shadow-2xl overflow-y-auto"
          >
            {/* Drawer Top Bar */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-amber-400/15 border border-amber-300/30 text-amber-300">
                  <Compass className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif text-sm tracking-wider uppercase text-white/95">
                    Sanctuary Compass
                  </h3>
                  <p className="text-[10px] text-white/40 font-mono">Mobile Navigation</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-full bg-white/5 border border-white/10 text-white/60 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Soul Profile Card in Drawer */}
            <div className="my-4 p-3.5 rounded-2xl bg-white/[0.03] border border-amber-400/25 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full bg-gradient-to-tr ${currentAvatar.gradient} p-0.5 flex-shrink-0 flex items-center justify-center overflow-hidden shadow-md`}
                >
                  {profile.customAvatarUrl ? (
                    <img
                      src={profile.customAvatarUrl}
                      alt={profile.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <Sparkles className="w-4 h-4 text-white" />
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-serif font-medium text-white">{profile.name}</h4>
                  <div className="flex items-center gap-1 text-[11px] text-amber-300 font-mono mt-0.5">
                    <Flame className="w-3 h-3 text-amber-400 fill-amber-400" />
                    <span>Day {profile.streak} of Presence</span>
                  </div>
                </div>
              </div>

              {onOpenProfile && (
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenProfile();
                  }}
                  className="px-3 py-1.5 rounded-full bg-amber-400/20 hover:bg-amber-400/30 border border-amber-400/40 text-amber-200 text-xs font-medium transition-all"
                >
                  Profile
                </button>
              )}
            </div>

            {/* Mobile World Region Search inside Drawer */}
            <div className="relative mb-3">
              <Search className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchLocation}
                onChange={(e) => onSearchLocationChange(e.target.value)}
                placeholder="Search stars by country or ocean..."
                className="w-full pl-9 pr-8 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-xs text-white placeholder-white/40 focus:outline-none focus:border-amber-400/50 transition-all"
              />
              {searchLocation && (
                <button
                  type="button"
                  onClick={() => onSearchLocationChange("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-white/40 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Locate My Stars if user has released any */}
            {userStarsCount > 0 && onFocusMyStar && (
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onFocusMyStar();
                }}
                className="flex items-center justify-between p-3 mb-3 rounded-xl bg-amber-400/10 hover:bg-amber-400/15 border border-amber-400/30 text-amber-200 text-sm font-medium transition-all text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-400/20 flex items-center justify-center text-amber-300">
                    <Star className="w-4 h-4 fill-amber-300" />
                  </div>
                  <div>
                    <div>Locate My Stars ({userStarsCount})</div>
                    <div className="text-[10px] text-amber-300/70">Jump to your star in the sky</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-amber-300/60" />
              </button>
            )}

            {/* Navigation Links */}
            <nav className="flex flex-col gap-1.5 flex-1">
              <Link
                href="/chronicles"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.08] border border-white/5 text-white/90 text-sm font-medium transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-400/10 flex items-center justify-center text-amber-300">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <div>The Living Chronicles</div>
                    <div className="text-[10px] text-white/40">52+ authentic human memoirs</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-white/40" />
              </Link>

              <Link
                href="/library"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.08] border border-white/5 text-white/90 text-sm font-medium transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center text-amber-400">
                    <Bookmark className="w-4 h-4" />
                  </div>
                  <div>
                    <div>The Sanctuary Library</div>
                    <div className="text-[10px] text-white/40">Full public domain masterpieces</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-white/40" />
              </Link>

              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  if (onOpenCandles) onOpenCandles();
                  else window.location.href = "/candle";
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-amber-500/[0.06] hover:bg-amber-500/[0.12] border border-amber-400/20 text-amber-100 text-sm font-medium transition-all text-left cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400">
                    <Flame className="w-4 h-4 fill-amber-400/30 animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span>Turn Candle (Sanctuary)</span>
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-amber-400/20 text-amber-300">New</span>
                    </div>
                    <div className="text-[10px] text-amber-200/60">Light an eternal flame in the stillness</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-amber-400/60" />
              </button>

              <Link
                href="/museum"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.08] border border-white/5 text-white/90 text-sm font-medium transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center text-amber-300">
                    <Landmark className="w-4 h-4" />
                  </div>
                  <div>
                    <div>The Almost Museum</div>
                    <div className="text-[10px] text-white/40">Adopt unfinished stories, art & songs</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-white/40" />
              </Link>

              {onOpenVigil && (
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenVigil();
                  }}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.08] border border-white/5 text-white/90 text-sm font-medium transition-all text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center text-amber-400">
                      <Flame className="w-4 h-4" />
                    </div>
                    <div>
                      <div>Global Silent Vigil</div>
                      <div className="text-[10px] text-white/40">Join worldwide collective presence</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-white/40" />
                </button>
              )}

              {onOpenBreath && (
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenBreath();
                  }}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.08] border border-white/5 text-white/90 text-sm font-medium transition-all text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-sky-500/15 flex items-center justify-center text-sky-300">
                      <Wind className="w-4 h-4" />
                    </div>
                    <div>
                      <div>Somatic Grounding Breath</div>
                      <div className="text-[10px] text-white/40">4-7-8 calming rhythm</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-white/40" />
                </button>
              )}

              {onOpenWell && (
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenWell();
                  }}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.08] border border-white/5 text-white/90 text-sm font-medium transition-all text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/15 flex items-center justify-center text-indigo-300">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <div>Let&apos;s Talk with Solas</div>
                      <div className="text-[10px] text-white/40">Sanctuary AI Companion</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-white/40" />
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onWander();
                }}
                className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.08] border border-white/5 text-white/90 text-sm font-medium transition-all text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/15 flex items-center justify-center text-purple-300">
                    <Compass className="w-4 h-4" />
                  </div>
                  <div>
                    <div>Wander the Sky</div>
                    <div className="text-[10px] text-white/40">Glide to a random star</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-white/40" />
              </button>

              <Link
                href="/about"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.08] border border-white/5 text-white/90 text-sm font-medium transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-neutral-800 flex items-center justify-center text-neutral-300">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <div>About Solas Haven</div>
                    <div className="text-[10px] text-white/40">Sanctuary ethos & creator</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-white/40" />
              </Link>

              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenPrivacyModal();
                }}
                className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/15 border border-emerald-500/20 text-emerald-300 text-sm font-medium transition-all text-left mt-2"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div>100% Anonymous Guarantee</div>
                    <div className="text-[10px] text-emerald-400/70">Zero tracking, zero surveillance</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-emerald-400/50" />
              </button>
            </nav>

            {/* Bottom Quick Action in Drawer */}
            <div className="mt-4 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenReleaseModal();
                }}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-200 via-amber-100 to-amber-300 text-neutral-950 font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-300/20 active:scale-[0.98] transition-all"
              >
                <Feather className="w-4 h-4" />
                <span>Leave a Star in Eternity</span>
              </button>

              {/* Drawer Legal Footer Links */}
              <div className="mt-4 flex items-center justify-center gap-3 text-[11px] text-white/40 font-mono">
                <Link href="/privacy" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-amber-300 transition-colors">Privacy</Link>
                <span>•</span>
                <Link href="/terms" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-amber-300 transition-colors">Terms</Link>
                <span>•</span>
                <Link href="/contact" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-amber-300 transition-colors">Contact</Link>
              </div>

              {/* Zaviyan Sister Platforms */}
              <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-center gap-3 text-[10px] text-white/40 font-mono">
                <span className="text-amber-200/60 uppercase tracking-wider">Zaviyan:</span>
                <a href="https://webdevworker.com" target="_blank" rel="noopener noreferrer" className="hover:text-amber-300 transition-colors">WebDevWorker</a>
                <span>•</span>
                <a href="https://calcworker.com" target="_blank" rel="noopener noreferrer" className="hover:text-amber-300 transition-colors">CalcWorker</a>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}