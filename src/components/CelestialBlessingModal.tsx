"use client";

import React, { useEffect, useState } from "react";
import { Sparkles, Heart, Check, X, Loader2, Copy } from "lucide-react";
import { CELESTIAL_AFFIRMATIONS } from "../lib/sacredPrayers";
import { Letter } from "../lib/types";
import { soundEngine } from "../lib/audio";

interface CelestialBlessingModalProps {
  letter: Letter | null;
  onClose: () => void;
}

export default function CelestialBlessingModal({
  letter,
  onClose,
}: CelestialBlessingModalProps) {
  const [affirmation, setAffirmation] = useState(CELESTIAL_AFFIRMATIONS[0]);
  const [bespokeEcho, setBespokeEcho] = useState<string | null>(null);
  const [isLoadingEcho, setIsLoadingEcho] = useState<boolean>(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!letter) {
      setBespokeEcho(null);
      setIsLoadingEcho(false);
      return;
    }

    // Set initial sacred affirmation as instant baseline
    const randomAff =
      CELESTIAL_AFFIRMATIONS[
        Math.floor(Math.random() * CELESTIAL_AFFIRMATIONS.length)
      ];
    setAffirmation(randomAff);
    setBespokeEcho(null);
    setIsLoadingEcho(true);

    let isMounted = true;

    // Fetch Bespoke Celestial Echo from Groq AI
    const fetchEcho = async () => {
      try {
        const res = await fetch("/api/ai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "echo",
            letterText: letter.content,
            recipient: letter.recipient,
          }),
        });
        const data = await res.json();
        if (isMounted && data.success && data.text) {
          setBespokeEcho(data.text);
          soundEngine.playLightShimmer();
        }
      } catch {
        // Graceful fallback to static affirmation
      } finally {
        if (isMounted) {
          setIsLoadingEcho(false);
        }
      }
    };

    fetchEcho();

    return () => {
      isMounted = false;
    };
  }, [letter]);

  if (!letter) return null;

  const handleCopy = async () => {
    const textToCopy = bespokeEcho || affirmation.prayer;
    const { copyToClipboard } = await import("@/utils/clipboard");
    await copyToClipboard(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-2xl animate-fade-in">
      <div className="relative w-full max-w-lg rounded-3xl border border-amber-400/30 bg-gradient-to-b from-neutral-900/95 via-neutral-950/95 to-black p-5 sm:p-9 shadow-2xl shadow-amber-500/20 text-white overflow-hidden max-h-[90dvh] overflow-y-auto scrollbar-none text-center">
        {/* Luminous Heaven Background Glow */}
        <div className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full bg-amber-400/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 w-60 h-60 rounded-full bg-purple-500/10 blur-3xl" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 rounded-full bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Halo Icon */}
        <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400/20 to-purple-500/20 border border-amber-400/30 flex items-center justify-center text-amber-300 mb-4 shadow-lg shadow-amber-400/10">
          <Sparkles className="w-7 h-7 animate-pulse" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/25 text-amber-300 text-[11px] font-mono uppercase tracking-widest mb-3">
          {bespokeEcho ? (
            <span className="flex items-center gap-1">
              <span>✦</span> Bespoke Celestial Echo
            </span>
          ) : (
            <span>Celestial Blessing</span>
          )}
        </div>

        <h3 className="text-xl sm:text-2xl font-serif font-semibold text-white/95 mb-2 tracking-tight">
          {bespokeEcho ? "An Echo from the Cosmos" : affirmation.title}
        </h3>

        {isLoadingEcho && !bespokeEcho && (
          <div className="flex items-center justify-center gap-2 text-xs text-amber-300/80 mb-2 font-light animate-pulse">
            <Loader2 className="w-3 h-3 animate-spin" />
            <span>Listening to the frequency of your heart...</span>
          </div>
        )}

        <div className="relative my-4 px-6 py-5 rounded-2xl bg-white/[0.03] border border-amber-400/20 shadow-inner">
          <p className="text-sm sm:text-base text-neutral-200 leading-relaxed font-serif italic selection:bg-amber-400/30">
            &ldquo;{bespokeEcho || affirmation.prayer}&rdquo;
          </p>

          <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-white/40">
            <span>For: {letter.recipient || "The Cosmos"}</span>
            <button
              type="button"
              onClick={handleCopy}
              className="text-amber-300/70 hover:text-amber-300 flex items-center gap-1 transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-400">Blessing Saved</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy Blessing</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-center gap-3 text-xs text-white/50 font-mono my-4">
          <span>Sector: {letter.category.toUpperCase()}</span>
          <span>•</span>
          <span className="text-amber-300 font-semibold">★ Star Placed in Solas Haven</span>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-2 py-3 rounded-2xl bg-gradient-to-r from-amber-300 via-amber-200 to-amber-400 text-neutral-950 font-medium text-xs sm:text-sm tracking-wide shadow-xl shadow-amber-400/25 hover:brightness-105 active:scale-[0.99] transition-all cursor-pointer"
        >
          Breathe in Peace & Enter the Constellation
        </button>
      </div>
    </div>
  );
}