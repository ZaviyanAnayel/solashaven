"use client";

import React, { useState } from "react";
import Link from "next/link";
import { BookOpen, Sparkles, Flame } from "lucide-react";
import { soundEngine } from "../lib/audio";

interface LibraryFloatingOrbProps {
  onOpenCandles?: () => void;
}

export default function LibraryFloatingOrb({ onOpenCandles }: LibraryFloatingOrbProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    soundEngine.playLightShimmer();
  };

  return (
    <aside
      aria-label="Sanctuary Library & Candle Navigation"
      className="fixed bottom-3 left-3 sm:bottom-6 sm:left-6 z-40 pointer-events-auto flex items-center gap-2 group"
    >
      {/* The Sanctuary Library Navigation */}
      <Link
        href="/library"
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative flex items-center gap-3 p-1 sm:p-1.5 sm:pr-5 rounded-full bg-gradient-to-r from-neutral-950/90 via-amber-950/40 to-neutral-950/90 border border-amber-400/35 hover:border-amber-300/70 shadow-2xl shadow-amber-500/20 hover:shadow-amber-400/40 backdrop-blur-2xl transition-all duration-500 hover:scale-[1.03] active:scale-[0.98] cursor-pointer"
        title="Explore The Sanctuary Library (4000 BC to 1928)"
      >
        {/* Breathing Starlight Ambient Glow Behind Orb */}
        <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-amber-400/25 via-emerald-500/15 to-indigo-500/20 blur-lg opacity-70 group-hover:opacity-100 animate-pulse transition-opacity pointer-events-none" />

        {/* Circular Celestial Book Orb with Continuous Orbital Motion Effect */}
        <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shrink-0 overflow-hidden">
          {/* Outer Orbiting Gold/Emerald Ring */}
          <div className="absolute inset-0 rounded-full p-[1.5px] bg-gradient-to-tr from-amber-300 via-emerald-400 to-amber-500 animate-[spin_10s_linear_infinite]">
            <div className="w-full h-full rounded-full bg-black/90" />
          </div>

          {/* Secondary Counter-rotating Aura Ring */}
          <div className="absolute inset-1 rounded-full border border-amber-400/25 animate-[spin_14s_linear_infinite_reverse]" />

          {/* Core Pulsing Icon */}
          <div className="relative z-10 flex items-center justify-center text-amber-300 group-hover:text-amber-200 transition-colors">
            <BookOpen className="w-5 h-5 sm:w-5 sm:h-5 transition-transform duration-500 group-hover:scale-115 drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
          </div>

          {/* Glowing Stardust Pinpoint */}
          <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-amber-200 blur-[0.5px] animate-ping" />
        </div>

        {/* Rich Typography Label (Hidden on mobile for sleek thumb-friendly circular orb, elegant on tablet/desktop) */}
        <div className="hidden sm:flex flex-col text-left py-0.5">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-serif font-semibold text-white/95 group-hover:text-amber-200 transition-colors tracking-wide">
              The Sanctuary Library
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          </div>
          <span className="text-[10px] font-mono text-amber-300/80 tracking-tight flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5 text-amber-400" />
            <span>4000 BC to 1928 • Full Wisdom</span>
          </span>
        </div>
      </Link>

      {/* Turn Candle Sanctuary Button (Directly next to Library Button) */}
      <button
        type="button"
        onClick={() => {
          soundEngine.playLightShimmer();
          if (onOpenCandles) {
            onOpenCandles();
          } else {
            window.location.href = "/candle";
          }
        }}
        className="relative flex items-center gap-2.5 p-1 sm:p-1.5 sm:pr-4 rounded-full bg-gradient-to-r from-neutral-950/90 via-amber-950/50 to-neutral-950/90 border border-amber-400/40 hover:border-amber-300/80 shadow-2xl shadow-amber-500/25 hover:shadow-amber-400/50 backdrop-blur-2xl transition-all duration-500 hover:scale-[1.03] active:scale-[0.98] cursor-pointer group/candle"
        title="Turn Candle — Light an Eternal Flame in the Sacred Quietude"
      >
        {/* Breathing Starlight Ambient Glow Behind Candle Orb */}
        <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-amber-500/30 via-orange-500/20 to-yellow-400/25 blur-lg opacity-70 group-hover/candle:opacity-100 animate-pulse transition-opacity pointer-events-none" />

        {/* Circular Celestial Flame Orb */}
        <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shrink-0 overflow-hidden">
          <div className="absolute inset-0 rounded-full p-[1.5px] bg-gradient-to-tr from-amber-400 via-orange-400 to-yellow-300 animate-[spin_8s_linear_infinite]">
            <div className="w-full h-full rounded-full bg-black/90" />
          </div>
          <div className="absolute inset-1 rounded-full border border-amber-400/30 animate-[spin_12s_linear_infinite_reverse]" />
          <div className="relative z-10 flex items-center justify-center text-amber-300 group-hover/candle:text-amber-200 transition-colors">
            <Flame className="w-5 h-5 sm:w-5 sm:h-5 transition-transform duration-500 group-hover/candle:scale-120 drop-shadow-[0_0_10px_rgba(245,158,11,0.8)] fill-amber-400/40 animate-pulse" />
          </div>
          <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-amber-200 blur-[0.5px] animate-ping" />
        </div>

        {/* Typography Label */}
        <div className="hidden sm:flex flex-col text-left py-0.5">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-serif font-semibold text-amber-100 group-hover/candle:text-white transition-colors tracking-wide">
              Turn Candle
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          </div>
          <span className="text-[10px] font-mono text-amber-300/80 tracking-tight flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5 text-amber-400" />
            <span>Eternal Quiet Sanctuary</span>
          </span>
        </div>
      </button>
    </aside>
  );
}
