"use client";

import React, { useState, useEffect } from "react";
import {
  Flame,
  Sparkles,
  X,
  Volume2,
  VolumeX,
  Feather,
  RefreshCw,
  Edit3,
  Check,
  Heart
} from "lucide-react";
import { soundEngine } from "../lib/audio";

const SACRED_SENTENCES = [
  "May this gentle flame bring warmth to your heart, comfort to your longing, and peace to your spirit.",
  "In the quiet stillness, no love is ever forgotten and no silent prayer goes unheard.",
  "For all that remains unspoken: may light soften the grief and wrap you in gentle solace.",
  "Even in the deepest darkness, this flame reminds you that hope never truly fades.",
  "Dedicated to the souls who became our eternal starlight — burning forever in our memories.",
  "Breathe in the quiet peace of this moment. You are safe, you are held, and you are loved."
];

const STORAGE_LIT_KEY = "solashaven_single_candle_lit_v1";
const STORAGE_CUSTOM_PRAYER_KEY = "solashaven_single_candle_prayer_v1";

interface CandleSanctuaryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CandleSanctuaryModal({
  isOpen,
  onClose
}: CandleSanctuaryModalProps) {
  // Candle state: starts unlit unless previously left lit by user
  const [isLit, setIsLit] = useState(false);
  const [isIgniting, setIsIgniting] = useState(false);
  const [sentenceIndex, setSentenceIndex] = useState(0);
  const [customPrayer, setCustomPrayer] = useState("");
  const [isEditingPrayer, setIsEditingPrayer] = useState(false);
  const [tempPrayerInput, setTempPrayerInput] = useState("");
  const [isSmokeVisible, setIsSmokeVisible] = useState(false);

  // Load persistence from localStorage
  useEffect(() => {
    try {
      const storedLit = localStorage.getItem(STORAGE_LIT_KEY);
      if (storedLit === "true") {
        setIsLit(true);
      }
      const storedPrayer = localStorage.getItem(STORAGE_CUSTOM_PRAYER_KEY);
      if (storedPrayer) {
        setCustomPrayer(storedPrayer);
      }
    } catch {}
  }, []);

  // Play subtle entrance sound
  useEffect(() => {
    if (isOpen) {
      soundEngine.playLightShimmer();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Toggle Candle on click (Slowly light or blow out)
  const handleToggleCandle = () => {
    if (!isLit) {
      // SLOWLY LIGHT THE CANDLE
      setIsIgniting(true);
      soundEngine.playLightShimmer();

      setTimeout(() => {
        setIsLit(true);
        setIsIgniting(false);
        try {
          localStorage.setItem(STORAGE_LIT_KEY, "true");
        } catch {}
      }, 400);
    } else {
      // BLOW OUT / EXTINGUISH THE CANDLE
      setIsSmokeVisible(true);
      setIsLit(false);
      try {
        localStorage.setItem(STORAGE_LIT_KEY, "false");
      } catch {}

      setTimeout(() => {
        setIsSmokeVisible(false);
      }, 1600);
    }
  };

  // Cycle to next sacred sentence
  const handleNextSentence = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundEngine.playLightShimmer();
    setSentenceIndex((prev) => (prev + 1) % SACRED_SENTENCES.length);
  };

  // Save customized prayer
  const handleSaveCustomPrayer = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const clean = tempPrayerInput.trim();
    setCustomPrayer(clean);
    setIsEditingPrayer(false);
    try {
      if (clean) {
        localStorage.setItem(STORAGE_CUSTOM_PRAYER_KEY, clean);
      } else {
        localStorage.removeItem(STORAGE_CUSTOM_PRAYER_KEY);
      }
    } catch {}
    soundEngine.playLightShimmer();
  };

  const activeSentence = customPrayer || SACRED_SENTENCES[sentenceIndex];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="The Quiet Candle Sanctuary"
      className="fixed inset-0 z-50 flex flex-col items-center justify-between overflow-hidden bg-[#020203] text-white selection:bg-amber-400/30 selection:text-amber-100 select-none"
    >
      {/* Dynamic Ambient Background Illumination (Expands when candle is lit) */}
      <div
        className={`absolute inset-0 pointer-events-none transition-all duration-1000 ease-out ${
          isLit
            ? "bg-[radial-gradient(circle_at_50%_52%,_rgba(245,158,11,0.18)_0%,_rgba(180,83,9,0.06)_40%,_rgba(2,2,3,0.98)_80%)] opacity-100"
            : "bg-[radial-gradient(circle_at_50%_52%,_rgba(255,255,255,0.02)_0%,_rgba(2,2,3,1)_70%)] opacity-80"
        }`}
      />

      {/* Floating subtle ember particles when lit */}
      {isLit && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden animate-fade-in">
          <div className="absolute top-[42%] left-[48%] w-1.5 h-1.5 rounded-full bg-amber-300/40 blur-[0.5px] animate-ping" />
          <div className="absolute top-[38%] left-[53%] w-1 h-1 rounded-full bg-amber-400/30 blur-[0.5px] animate-pulse" />
        </div>
      )}

      {/* TOP MINIMAL BAR */}
      <header className="relative z-30 w-full px-4 sm:px-8 py-4 sm:py-6 flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-2 sm:gap-3">
          <div
            className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all duration-700 ${
              isLit
                ? "bg-amber-500/20 border-amber-400/50 text-amber-300 shadow-lg shadow-amber-500/30"
                : "bg-white/5 border-white/10 text-white/40"
            }`}
          >
            <Flame className={`w-4 h-4 ${isLit ? "fill-amber-400/50 animate-pulse" : ""}`} />
          </div>
          <div>
            <h1 className="text-xs sm:text-sm font-serif font-semibold tracking-wider text-amber-100/90">
              The Sacred Flame
            </h1>
            <p className="text-[10px] text-white/40">
              {isLit ? "Burning in the quiet stillness" : "Resting in darkness • Tap to ignite"}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white flex items-center justify-center transition-all cursor-pointer"
          title="Return to Haven"
        >
          <X className="w-4 h-4" />
        </button>
      </header>

      {/* CENTER INTERACTIVE CANDLE AREA (CLICK TO SLOWLY LIGHT OR BLOW OUT) */}
      <main
        onClick={handleToggleCandle}
        className="relative z-20 flex-1 w-full flex flex-col items-center justify-center cursor-pointer group"
      >
        {/* Soft Radial Light Halo on Floor Altar */}
        <div
          className={`absolute w-72 h-72 sm:w-96 sm:h-96 rounded-full pointer-events-none transition-all duration-1000 ease-out ${
            isLit
              ? "bg-gradient-to-t from-amber-500/20 via-amber-400/10 to-transparent scale-100 blur-2xl opacity-100 animate-pulse"
              : "scale-75 opacity-0 blur-xl"
          }`}
        />

        {/* CANDLE ASSEMBLY */}
        <div className="relative flex flex-col items-center transition-transform duration-500 group-hover:scale-[1.03]">
          {/* ================= FLAME / SMOKE ZONE ================= */}
          <div className="relative h-16 w-16 flex items-center justify-center">
            {/* Wisp of Smoke when extinguished */}
            {isSmokeVisible && (
              <div className="absolute -top-6 flex flex-col items-center pointer-events-none animate-fade-in transition-opacity duration-1000">
                <div className="w-1.5 h-6 rounded-full bg-white/20 blur-[2px] animate-pulse" />
                <div className="w-3 h-8 -mt-2 rounded-full bg-white/10 blur-[3px]" />
              </div>
            )}

            {/* Glowing Flame (Slowly transitions in / out) */}
            <div
              className={`relative flex items-center justify-center transition-all duration-700 ease-out ${
                isLit
                  ? "scale-100 opacity-100"
                  : isIgniting
                  ? "scale-50 opacity-60 blur-[1px]"
                  : "scale-0 opacity-0 pointer-events-none"
              }`}
            >
              {/* Outer Golden Aura Pulse */}
              <div className="absolute -top-4 w-10 h-14 rounded-full bg-gradient-to-t from-amber-500/80 via-amber-400/50 to-yellow-200/20 blur-md animate-[pulse_2s_ease-in-out_infinite]" />

              {/* Main Flame Teardrop */}
              <div className="relative -top-2 w-5 h-9 rounded-full bg-gradient-to-t from-orange-500 via-amber-300 to-yellow-100 shadow-[0_0_20px_#f59e0b] animate-[bounce_2s_infinite]" />

              {/* Inner White-Hot Core */}
              <div className="absolute -top-1 w-2.5 h-5 rounded-full bg-gradient-to-t from-amber-200 to-white shadow-[0_0_8px_#ffffff]" />
            </div>

            {/* Candle Wick (Black tip) */}
            <div
              className={`absolute bottom-0 w-[2px] h-3 rounded-full transition-colors duration-500 ${
                isLit ? "bg-amber-900" : "bg-neutral-600"
              }`}
            />
          </div>

          {/* ================= WAX PILLAR ================= */}
          <div className="relative w-12 sm:w-14 h-28 sm:h-32 rounded-t-sm rounded-b-lg bg-gradient-to-b from-amber-100/90 via-amber-200/70 to-amber-300/40 border-t border-amber-100/50 shadow-2xl shadow-black flex flex-col justify-between p-1.5 overflow-hidden">
            {/* Wax Highlight Sheen */}
            <div className="absolute inset-y-0 left-1 w-1 bg-white/30 rounded-full blur-[0.5px]" />
            <div className="w-full h-1.5 bg-amber-400/20 rounded-full" />
            <div className="w-full h-1 bg-amber-500/10 rounded-full" />
          </div>

          {/* ================= PEDESTAL BASE ================= */}
          <div className="w-20 sm:w-24 h-3.5 -mt-1 rounded-full bg-gradient-to-r from-stone-900 via-neutral-800 to-stone-950 border border-white/10 shadow-xl flex items-center justify-center">
            <div className="w-16 h-1 rounded-full bg-black/60" />
          </div>

          {/* Subtle click guide prompt */}
          <div className="mt-4 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-[11px] font-mono text-white/50 tracking-wider transition-all group-hover:text-amber-200 group-hover:border-amber-400/30">
            {isLit ? "Click candle to blow out" : "Click candle to light"}
          </div>
        </div>
      </main>

      {/* ========================================================================= */}
      {/* POPUP PIYARA SA NEECHAY (PRAYER / SENTENCE FLOATING CARD AT THE BOTTOM)    */}
      {/* ========================================================================= */}
      <footer className="relative z-30 w-full max-w-xl px-4 pb-5 sm:pb-7 flex flex-col items-center pointer-events-auto">
        <div
          className={`w-full p-4 sm:p-5 rounded-2xl bg-neutral-950/80 border border-amber-400/30 shadow-2xl shadow-black/90 backdrop-blur-2xl transition-all duration-700 ease-out ${
            isLit
              ? "translate-y-0 opacity-100 pointer-events-auto"
              : "translate-y-4 opacity-40 pointer-events-none"
          }`}
        >
          {isEditingPrayer ? (
            /* Custom Prayer / Sentence Typing View */
            <form onSubmit={handleSaveCustomPrayer} className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase tracking-wider text-amber-300/80 flex items-center gap-1.5">
                  <Feather className="w-3 h-3 text-amber-400" />
                  <span>Type Your Prayer / Silent Sentence</span>
                </span>
                <button
                  type="button"
                  onClick={() => setIsEditingPrayer(false)}
                  className="text-white/40 hover:text-white text-xs"
                >
                  Cancel
                </button>
              </div>

              <textarea
                value={tempPrayerInput}
                onChange={(e) => setTempPrayerInput(e.target.value)}
                placeholder="Type a prayer, memory, or words for someone special..."
                rows={2}
                maxLength={200}
                className="w-full px-3 py-2 rounded-xl bg-white/[0.05] border border-white/15 focus:border-amber-400/70 focus:outline-none text-xs sm:text-sm text-white placeholder-white/30 font-serif resize-none"
                autoFocus
              />

              <div className="flex items-center justify-end gap-2">
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg text-xs font-serif font-medium bg-amber-500 hover:bg-amber-400 text-neutral-950 transition-colors flex items-center gap-1.5 cursor-pointer shadow-md shadow-amber-500/20"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Keep Prayer with Flame</span>
                </button>
              </div>
            </form>
          ) : (
            /* Displayed Peaceful Prayer / Sentence View */
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  <span className="text-[10px] font-mono uppercase tracking-wider text-amber-300/80">
                    {customPrayer ? "Your Silent Dedication" : "Sacred Affirmation"}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Edit / Type sentence button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setTempPrayerInput(customPrayer);
                      setIsEditingPrayer(true);
                    }}
                    className="p-1 rounded-md text-white/40 hover:text-amber-300 hover:bg-white/5 transition-colors text-xs flex items-center gap-1"
                    title="Type your own sentence"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span className="hidden sm:inline text-[10px]">Type sentence</span>
                  </button>

                  {/* Shuffle to next sentence (if not custom) */}
                  {!customPrayer && (
                    <button
                      type="button"
                      onClick={handleNextSentence}
                      className="p-1 rounded-md text-white/40 hover:text-amber-300 hover:bg-white/5 transition-colors"
                      title="Next sentence"
                    >
                      <RefreshCw className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* The Sacred English Sentence */}
              <p className="text-xs sm:text-sm font-serif italic text-amber-100/90 leading-relaxed text-center py-1">
                &ldquo;{activeSentence}&rdquo;
              </p>

              <div className="mt-2 text-center text-[10px] text-white/40 font-mono">
                {isLit
                  ? "This candle will remain burning faithfully whenever you return."
                  : "Tap the candle above to ignite this prayer."}
              </div>
            </div>
          )}
        </div>
      </footer>
    </div>
  );
}
