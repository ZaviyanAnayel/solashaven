"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Sparkles,
  RotateCcw,
  Star,
  Copy,
  Check,
  Feather,
  Compass,
  ArrowLeft,
  Moon,
  Sun
} from "lucide-react";
import { soundEngine } from "../lib/audio";

interface DailyOracleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenReleaseModal?: (prefilledText: string) => void;
}

interface OracleCard {
  id: number;
  title: string;
  archetype: string;
  affirmation: string;
  reflection: string;
  romanUrduSummary: string;
  element: string;
  glowColor: string;
}

const ORACLE_DECK: OracleCard[] = [
  {
    id: 1,
    title: "The Quiet Horizon",
    archetype: "Patience & Growth",
    affirmation: "You are not falling behind. The seeds you planted in silence are merely learning how to grow in the dark.",
    reflection: "Do not confuse incubation with failure. Some roots must stretch miles into the earth before the flower dares meet the sun.",
    romanUrduSummary: "Tum peechay nahi reh gaye, jani... Andheray mein boi hui umeedain pehle andar jadh pakarti hain, phir bahar nikalti hain.",
    element: "Earth & Starlight",
    glowColor: "from-amber-500/20 via-yellow-500/10 to-transparent",
  },
  {
    id: 2,
    title: "The Nebula of Stillness",
    archetype: "Rest & Sanctuary",
    affirmation: "You do not owe the world constant performance. Tonight, it is enough simply to breathe and exist.",
    reflection: "Even constellations take turns sleeping behind the rim of the earth. Set down the heavy armor; you are safe here.",
    romanUrduSummary: "Har waqt mazboot banne ki zaroorat nahi hai. Aaj raat sirf saans lena aur thehar jana hi kafi hai.",
    element: "Cosmic Breath",
    glowColor: "from-indigo-500/20 via-purple-500/10 to-transparent",
  },
  {
    id: 3,
    title: "The Sister Star",
    archetype: "Empathy & Connection",
    affirmation: "Whatever ache you carry, remember that grief is simply love with nowhere left to go. Honor it, then let it rest.",
    reflection: "Your tears are not weakness; they are sacred rain honoring what meant something real to your heart.",
    romanUrduSummary: "Gham asal mein wahi pyar hai jo zaban par na aa saka. Is dard ka ahtaram karo, aur isay sakoon do.",
    element: "Celestial Waters",
    glowColor: "from-sky-500/20 via-blue-500/10 to-transparent",
  },
  {
    id: 4,
    title: "The Weaver of Dawns",
    archetype: "Hope & Renewal",
    affirmation: "Every night comes to an end, no matter how endless the dark felt at 3 AM. Light is already finding its way back to you.",
    reflection: "The darkest hour is merely the sky preparing its canvas for the morning. Hold on a little longer.",
    romanUrduSummary: "Chahe raat kitni bhi lambi kyun na ho, subah ki roshni hamesha rasta dhoond leti hai. Umeed mat haro.",
    element: "Solar Flame",
    glowColor: "from-amber-400/25 via-rose-500/10 to-transparent",
  },
  {
    id: 5,
    title: "The Sacred Flame",
    archetype: "Self-Compassion",
    affirmation: "You are not broken; you are merely tender. Treat yourself with the same gentle forgiveness you would offer a tired child.",
    reflection: "Forgive yourself for not knowing earlier what you only learned through the ache. You did the best you could.",
    romanUrduSummary: "Tum toote hue nahi ho, bas thake hue ho. Apne aap ko maaf kar do aur khud par reham karo.",
    element: "Living Fire",
    glowColor: "from-orange-500/20 via-amber-500/10 to-transparent",
  },
  {
    id: 6,
    title: "The Celestial Tide",
    archetype: "Surrender & Release",
    affirmation: "Let go of what you cannot steer. Some things are meant to be carried by the tide, not rowed against the current.",
    reflection: "Surrender is not defeat; it is placing your exhausted hands back onto your heart and letting the cosmos guide the way.",
    romanUrduSummary: "Har cheez par kaboo pane ki koshish chhor do. Jo tumhare bas mein nahi, usay rab aur aasmaan par chhor do.",
    element: "Tidal Drift",
    glowColor: "from-cyan-500/20 via-teal-500/10 to-transparent",
  },
  {
    id: 7,
    title: "The Unspoken Lantern",
    archetype: "Courage & Truth",
    affirmation: "Your truth does not lose value simply because they refused to hear it. It remains pure and luminous inside you.",
    reflection: "What you withheld to keep the peace can now be released into the sky. You no longer have to carry it alone.",
    romanUrduSummary: "Agar kisi ne tumhari sachai nahi suni, to iska matlab ye nahi ke tum galat the. Tumhara sach abhi bhi noorani hai.",
    element: "Ethereal Flame",
    glowColor: "from-rose-500/20 via-amber-500/10 to-transparent",
  },
  {
    id: 8,
    title: "The Anchor of Midnight",
    archetype: "Grounding & Presence",
    affirmation: "You survived all of the days you thought would defeat you. You are still here, standing beneath an infinite sky.",
    reflection: "Look at the distance you have walked in secret. Count every silent victory that nobody else was awake to applaud.",
    romanUrduSummary: "Tum wo sab din guzar kar yahan tak pohanche ho jin me lagta tha ke sab khatam ho gaya. Tum bohot bahadur ho.",
    element: "Deep Granite & Starlight",
    glowColor: "from-emerald-500/20 via-sky-500/10 to-transparent",
  },
];

export default function DailyOracleModal({
  isOpen,
  onClose,
  onOpenReleaseModal,
}: DailyOracleModalProps) {
  const [selectedCard, setSelectedCard] = useState<OracleCard | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // Load or pick today's seed-based oracle card
  useEffect(() => {
    if (!isOpen) return;

    try {
      const todayKey = `solas_oracle_${new Date().toISOString().split("T")[0]}`;
      const savedCardId = localStorage.getItem(todayKey);
      if (savedCardId) {
        const found = ORACLE_DECK.find((c) => String(c.id) === savedCardId);
        if (found) {
          setSelectedCard(found);
          setIsRevealed(true);
          return;
        }
      }
    } catch {}

    // Default daily deterministic card based on date
    const dayOfYear = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
    );
    const card = ORACLE_DECK[dayOfYear % ORACLE_DECK.length];
    setSelectedCard(card);
    setIsRevealed(false);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleReveal = () => {
    if (!selectedCard) return;
    soundEngine.playPrayerAscensionChime();
    setIsRevealed(true);
    try {
      const todayKey = `solas_oracle_${new Date().toISOString().split("T")[0]}`;
      localStorage.setItem(todayKey, String(selectedCard.id));
    } catch {}
  };

  const handleDrawAnother = () => {
    soundEngine.playLightShimmer();
    setIsRevealed(false);
    setTimeout(() => {
      const pool = ORACLE_DECK.filter((c) => c.id !== selectedCard?.id);
      const nextCard = pool[Math.floor(Math.random() * pool.length)] || ORACLE_DECK[0];
      setSelectedCard(nextCard);
      setTimeout(() => {
        handleReveal();
      }, 150);
    }, 200);
  };

  const handleCopy = () => {
    if (!selectedCard) return;
    const text = `✦ Solas Haven Daily Oracle: ${selectedCard.title} ✦\n"${selectedCard.affirmation}"\n— ${selectedCard.reflection}\n\nSolasHaven.com`;
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    soundEngine.playLightShimmer();
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleAscend = () => {
    if (!selectedCard) return;
    onClose();
    if (onOpenReleaseModal) {
      onOpenReleaseModal(
        `[Cosmic Affirmation: ${selectedCard.title}]\n"${selectedCard.affirmation}"\n\nI release this intention into the cosmos tonight.`
      );
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-2xl animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg rounded-3xl border border-amber-400/25 bg-gradient-to-b from-[#0d101d] via-[#080912] to-black p-5 sm:p-7 shadow-2xl shadow-amber-950/40 flex flex-col items-center overflow-hidden"
      >
        {/* Glow Auras */}
        <div className="pointer-events-none absolute -top-32 -left-20 w-80 h-80 rounded-full bg-amber-400/10 blur-[90px]" />
        <div className="pointer-events-none absolute -bottom-32 -right-20 w-80 h-80 rounded-full bg-indigo-600/15 blur-[90px]" />

        {/* Header */}
        <div className="w-full flex items-center justify-between pb-3 border-b border-white/10 z-10">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white transition-all text-xs font-medium cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-amber-300" />
              <span>Back</span>
            </button>
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <h2 className="text-sm font-serif font-semibold text-white/95">
                Daily Midnight Oracle
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/5 border border-white/10 text-white/50 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Oracle Card Body */}
        <div className="w-full my-5 flex flex-col items-center z-10">
          {!isRevealed ? (
            // Card Back (Waiting to be drawn)
            <div
              onClick={handleReveal}
              className="group relative w-full max-w-sm aspect-[3/4] max-h-[380px] rounded-3xl border-2 border-dashed border-amber-400/40 bg-gradient-to-br from-amber-400/10 via-white/[0.02] to-indigo-900/20 p-6 flex flex-col items-center justify-center text-center cursor-pointer shadow-xl hover:border-amber-400/70 hover:scale-[1.01] active:scale-[0.99] transition-all duration-300"
            >
              <div className="w-16 h-16 rounded-full bg-amber-400/15 border border-amber-400/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Moon className="w-8 h-8 text-amber-300 animate-pulse" />
              </div>
              <span className="text-xs font-mono uppercase tracking-widest text-amber-300/80 mb-1">
                ✦ Sanctuary Starlight Deck ✦
              </span>
              <h3 className="text-lg font-serif font-semibold text-white/95 mb-2">
                Touch to Draw Today&apos;s Oracle
              </h3>
              <p className="text-xs text-white/60 font-light max-w-xs leading-relaxed">
                Receive an intimate starlight affirmation to ground your soul in this quiet hour.
              </p>
            </div>
          ) : (
            // Revealed Card
            selectedCard && (
              <div
                className={`relative w-full max-w-sm aspect-[3/4.2] max-h-[420px] rounded-3xl border border-amber-400/40 bg-gradient-to-b ${selectedCard.glowColor} to-black/80 p-6 flex flex-col justify-between shadow-2xl animate-fade-in text-center`}
              >
                {/* Top Card Label */}
                <div>
                  <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-amber-300/80 border-b border-amber-400/20 pb-2 mb-3">
                    <span>✦ {selectedCard.archetype}</span>
                    <span>{selectedCard.element}</span>
                  </div>
                  <h3 className="text-xl font-serif font-bold text-white tracking-wide">
                    {selectedCard.title}
                  </h3>
                </div>

                {/* Main Affirmation */}
                <div className="my-auto py-2">
                  <p className="text-base sm:text-lg font-serif italic text-amber-100 leading-relaxed drop-shadow">
                    &ldquo;{selectedCard.affirmation}&rdquo;
                  </p>
                  <p className="text-xs text-neutral-300 font-light mt-3 leading-relaxed">
                    {selectedCard.reflection}
                  </p>
                  <div className="mt-3 pt-2 border-t border-white/10 text-[11px] font-serif text-amber-200/75 italic">
                    {selectedCard.romanUrduSummary}
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-all text-xs cursor-pointer"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleAscend}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-amber-400/20 hover:bg-amber-400/30 border border-amber-400/40 text-amber-200 hover:text-white transition-all text-xs font-medium cursor-pointer"
                  >
                    <Feather className="w-3.5 h-3.5 text-amber-300" />
                    <span>Ascend as Star</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDrawAnother}
                    title="Draw another card"
                    className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/50 hover:text-amber-300 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )
          )}
        </div>

        {/* Modal Bottom Note */}
        <p className="text-[11px] text-white/40 font-mono text-center z-10">
          Drawn once daily beneath the starlight skies of Solas Haven.
        </p>
      </div>
    </div>
  );
}
