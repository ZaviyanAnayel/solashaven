"use client";

import React, { useState, useEffect } from "react";
import { CATEGORIES, Letter, LetterCategory, ReleaseRitual } from "../lib/types";
import { X, Sparkles, Send, Globe2, AlertCircle, Compass, ShieldCheck, Loader2, BookOpen } from "lucide-react";
import { soundEngine } from "../lib/audio";
import { validateSanctuaryContent } from "../lib/moderation";
import confetti from "canvas-confetti";
import { WORLD_LANGUAGES } from "../lib/languages";
import { useGuardianInspection } from "../lib/useGuardianInspection";
import SanctuaryGuardianModal from "./SanctuaryGuardianModal";

interface ReleaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLetterReleased: (letter: Letter) => void;
  prefilledContent?: string;
}

export default function ReleaseModal({
  isOpen,
  onClose,
  onLetterReleased,
  prefilledContent = "",
}: ReleaseModalProps) {
  const [recipient, setRecipient] = useState("");
  const [content, setContent] = useState(prefilledContent);
  const [category, setCategory] = useState<LetterCategory>("unsent");
  const [releaseRitual, setReleaseRitual] = useState<ReleaseRitual>("star");
  const [locationName, setLocationName] = useState("");
  const [language, setLanguage] = useState("en");
  const [isLongLetterMode, setIsLongLetterMode] = useState(false);
  const [isTimeCapsule, setIsTimeCapsule] = useState(false);
  const [timeCapsuleDuration, setTimeCapsuleDuration] = useState<"1month" | "6months" | "1year">("1year");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isWeaving, setIsWeaving] = useState(false);
  const [previousContent, setPreviousContent] = useState<string | null>(null);
  const [weaveError, setWeaveError] = useState<string | null>(null);

  const {
    inspect,
    guardianModalState,
    closeGuardianModal,
  } = useGuardianInspection();

  useEffect(() => {
    if (isOpen && prefilledContent) {
      setContent(prefilledContent);
    }
  }, [isOpen, prefilledContent]);

  if (!isOpen) return null;

  // Real Worldwide Geolocation via IP resolver with Timezone fallback
  const handleAutoDetect = async () => {
    setIsDetectingLocation(true);
    try {
      // 1. Try internal Geo API (zero CORS errors)
      const res = await fetch("/api/geo");
      if (res.ok) {
        const data = await res.json();
        if (data.city && data.country && data.country !== "Earth") {
          setLocationName(`${data.city}, ${data.country}`);
          setIsDetectingLocation(false);
          return;
        }
      }
    } catch {
      // Fallback
    }



    // 3. Fallback to device timezone
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const parts = tz.split("/");
      const city = parts[parts.length - 1]?.replace(/_/g, " ") || tz;
      setLocationName(`Somewhere near ${city}`);
    } catch {
      setLocationName("An Anonymous Corner of Earth");
    } finally {
      setIsDetectingLocation(false);
    }
  };

  // AI Ghostwriter: Refine raw feelings into starlight poetry
  const handleWeaveStarlight = async () => {
    if (!content.trim() || isWeaving) return;
    setIsWeaving(true);
    setWeaveError(null);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "weave",
          rawText: content,
          recipient,
          category,
        }),
      });
      const data = await res.json();
      if (data.success && data.text) {
        soundEngine.playLightShimmer();
        setPreviousContent(content);
        setContent(data.text);
      } else {
        setWeaveError(data.error || "Could not connect with starlight. Try again.");
      }
    } catch {
      setWeaveError("Cosmic connection timed out. Please try again.");
    } finally {
      setIsWeaving(false);
    }
  };

  const handleUndoWeave = () => {
    if (previousContent !== null) {
      setContent(previousContent);
      setPreviousContent(null);
    }
  };

  const executeReleaseStar = () => {
    setIsSubmitting(true);

    if (releaseRitual === "lantern") {
      soundEngine.playPrayerAscensionChime();
    } else {
      soundEngine.playCelestialAscension();
    }

    const ritualColors: Record<ReleaseRitual, string[]> = {
      star: ["#fbbf24", "#ffffff", "#38bdf8", "#f43f5e"],
      lantern: ["#f59e0b", "#d97706", "#fbbf24", "#ffffff"],
      crane: ["#ffffff", "#e0f2fe", "#f1f5f9", "#cbd5e1"],
    };

    confetti({
      particleCount: 50,
      spread: 75,
      origin: { y: 0.8 },
      colors: ritualColors[releaseRitual],
      disableForReducedMotion: true
    });

    const selectedCatInfo = CATEGORIES.find((c) => c.id === category) || CATEGORIES[1];

    const sectorAngles: Record<LetterCategory, number> = {
      grief: (Math.PI * 5) / 4,
      love: (Math.PI * 7) / 4,
      confession: (Math.PI * 3) / 4,
      prayer: Math.PI / 2,
      forgiveness: 0,
      unsent: Math.PI
    };

    const angle = sectorAngles[category] + (Math.random() - 0.5) * 0.8;
    const distance = 250 + Math.random() * 450;
    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance;

    let igniteDate: string | undefined = undefined;
    if (isTimeCapsule) {
      const targetDate = new Date();
      if (timeCapsuleDuration === "1month") {
        targetDate.setMonth(targetDate.getMonth() + 1);
      } else if (timeCapsuleDuration === "6months") {
        targetDate.setMonth(targetDate.getMonth() + 6);
      } else {
        targetDate.setFullYear(targetDate.getFullYear() + 1);
      }
      igniteDate = targetDate.toISOString().split("T")[0];
    }

    const newLetter: Letter = {
      id: "star-" + Date.now(),
      recipient: recipient.trim(),
      content: content.trim(),
      category: category,
      createdAt: isTimeCapsule ? "Time-Locked Orbit" : "Just now",
      locationName: locationName.trim() || "An Anonymous Corner of Earth",
      language,
      lightCount: 1,
      whispers: [],
      isTimeCapsule,
      igniteDate,
      releaseRitual,
      x,
      y,
      size: 5.0 + Math.random() * 1.5,
      color: selectedCatInfo.color,
      glowColor: selectedCatInfo.glowColor,
      pulseSpeed: 1.5 + Math.random() * 0.8,
      pulsePhase: Math.random() * Math.PI * 2,
      isNew: true
    };

    setTimeout(() => {
      onLetterReleased(newLetter);
      setIsSubmitting(false);
      onClose();
      setRecipient("");
      setContent("");
      setLocationName("");
      setErrorMessage(null);
    }, 600);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validate recipient
    const recipientValidation = validateSanctuaryContent(recipient, true);
    if (!recipientValidation.isClean) {
      setErrorMessage(recipientValidation.error || "Please provide a valid recipient.");
      return;
    }

    // Validate content with moderation filter
    const contentValidation = validateSanctuaryContent(content, false);
    if (!contentValidation.isClean) {
      setErrorMessage(contentValidation.error || "Please write words suitable for this sanctuary.");
      return;
    }

    // AI Guardian inspection
    setIsSubmitting(true);
    const result = await inspect(
      content,
      "letter",
      recipient || "Unknown Recipient",
      locationName || "Unknown Location"
    );
    setIsSubmitting(false);

    if (!result.passed) {
      return;
    }

    executeReleaseStar();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-2xl animate-fade-in">
      <div className="relative w-full max-w-xl rounded-3xl border border-white/15 bg-neutral-950/90 p-5 sm:p-8 shadow-2xl shadow-amber-500/10 text-white overflow-hidden max-h-[90dvh] overflow-y-auto scrollbar-none">
        <div className="pointer-events-none absolute -top-32 -left-32 w-72 h-72 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -right-32 w-72 h-72 rounded-full bg-sky-500/10 blur-3xl" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 rounded-full bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-5 sm:mb-6 pr-8 sm:pr-0">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-300 text-xs font-mono mb-2.5 sm:mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>THE ALTAR OF RELEASING</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-serif tracking-tight text-white/95">
            Leave a Star in Eternity
          </h2>
          <p className="text-xs sm:text-sm text-white/60 mt-1">
            Write what was never said. Once released, your words will ascend as a permanent star in the living cosmos.
          </p>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-start gap-2.5 text-xs text-rose-200 animate-fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-white/70 mb-1.5 tracking-wide">
              WHO IS THIS FOR?
            </label>
            <input
              type="text"
              required
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="e.g. To Mama in Heaven, To The One Who Left, To God, To My 16yo Self..."
              className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-sm text-white placeholder-white/30 focus:outline-none focus:border-amber-400/50 focus:ring-1 focus:ring-amber-400/50 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-white/70 mb-1.5 tracking-wide">
              CONSTELLATION SECTOR
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CATEGORIES.filter((c) => c.id !== "all").map((cat) => (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => setCategory(cat.id as LetterCategory)}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs text-left transition-all ${
                    category === cat.id
                      ? "bg-white/15 border-white/40 text-white shadow-sm"
                      : "bg-white/[0.03] border-white/10 text-white/60 hover:bg-white/[0.07] hover:text-white"
                  }`}
                  style={
                    category === cat.id
                      ? {
                          borderColor: `${cat.color}80`,
                          backgroundColor: `${cat.color}18`
                        }
                      : {}
                  }
                >
                  <span className="text-sm">{cat.icon}</span>
                  <span className="font-medium truncate">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Worldwide Location & Mother Tongue Language System */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-white/70 tracking-wide flex items-center gap-1.5">
                  <Globe2 className="w-3.5 h-3.5 text-amber-300" />
                  <span>YOUR LOCATION</span>
                </label>
                <button
                  type="button"
                  onClick={handleAutoDetect}
                  disabled={isDetectingLocation}
                  className="text-[11px] text-amber-300/80 hover:text-amber-300 underline underline-offset-2 flex items-center gap-1 disabled:opacity-50"
                >
                  {isDetectingLocation ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>Detecting...</span>
                    </>
                  ) : (
                    <>
                      <Compass className="w-3 h-3" />
                      <span>Detect City</span>
                    </>
                  )}
                </button>
              </div>
              <input
                type="text"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                placeholder="e.g. A quiet balcony at night, Pacific Ocean, Kyoto..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white placeholder-white/30 focus:outline-none focus:border-amber-400/50 transition-all"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-white/70 tracking-wide flex items-center gap-1.5">
                  <span className="text-amber-300 text-xs">🌐</span>
                  <span>LANGUAGE OF LETTER</span>
                </label>
                <span className="text-[10px] text-amber-300/80 font-mono">All Languages Welcome</span>
              </div>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-neutral-900 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-400/50"
              >
                {WORLD_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.name} ({lang.nativeName})
                  </option>
                ))}
              </select>
            </div>
          </div>
            {/* Quick Inspiration Pills for Remote Corners of Earth */}
            <div className="flex items-center gap-1.5 overflow-x-auto pt-2 scrollbar-none">
              <span className="text-[10px] text-white/40 shrink-0">Inspire:</span>
              {[
                "Amazon Rainforest, Brazil",
                "Pacific Ocean (On a ship)",
                "Faroe Islands",
                "High Himalayas",
                "Sahara Desert Camp",
                "Antarctica Research Base",
                "A Small Island in Aegean Sea"
              ].map((preset) => (
                <button
                  type="button"
                  key={preset}
                  onClick={() => setLocationName(preset)}
                  className="shrink-0 px-2.5 py-0.5 rounded-full bg-white/[0.03] hover:bg-white/10 border border-white/5 text-[10px] text-white/50 hover:text-white transition-colors"
                >
                  {preset}
                </button>
              ))}
            </div>

          {/* The Letter Text with Long Letter Memoir Toggle & AI Ghostwriter */}
          <div>
            <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1.5">
              <label className="text-xs font-medium text-white/70 tracking-wide flex items-center gap-1.5">
                <span>YOUR UNSPOKEN WORDS</span>
                {previousContent !== null && (
                  <button
                    type="button"
                    onClick={handleUndoWeave}
                    className="text-[10px] text-amber-300/80 hover:text-amber-200 underline decoration-dotted transition-colors cursor-pointer"
                  >
                    (Undo AI Weave)
                  </button>
                )}
              </label>

              <div className="flex items-center gap-2">
                {/* AI Ghostwriter Button */}
                <button
                  type="button"
                  onClick={handleWeaveStarlight}
                  disabled={isWeaving || !content.trim()}
                  title="Weave raw thoughts into moving, authentic starlight poetry"
                  className={`px-2.5 py-1 rounded-full text-[11px] font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                    isWeaving
                      ? "bg-amber-500/20 text-amber-300 border border-amber-400/40 animate-pulse cursor-wait"
                      : !content.trim()
                      ? "bg-white/[0.03] text-white/30 border border-white/5 cursor-not-allowed"
                      : "bg-gradient-to-r from-amber-500/20 via-rose-500/20 to-purple-500/20 hover:from-amber-500/30 hover:via-rose-500/30 hover:to-purple-500/30 text-amber-200 border border-amber-400/30 shadow-[0_0_12px_rgba(251,191,36,0.15)] hover:shadow-[0_0_18px_rgba(251,191,36,0.25)]"
                  }`}
                >
                  {isWeaving ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin text-amber-300" />
                      <span>Weaving Soul...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3 h-3 text-amber-300" />
                      <span>✦ Weave into Starlight</span>
                    </>
                  )}
                </button>

                {/* Long Letter Toggle */}
                <button
                  type="button"
                  onClick={() => setIsLongLetterMode(!isLongLetterMode)}
                  className="text-[11px] text-white/50 hover:text-white/80 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <BookOpen className="w-3 h-3" />
                  <span>{isLongLetterMode ? "Compact" : "Long Story"}</span>
                </button>
              </div>
            </div>

            <textarea
              required
              rows={isLongLetterMode ? 12 : 5}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={
                isLongLetterMode
                  ? "Write your full chronicle, story, or memoir with as many paragraphs as you need. No one is rushing you..."
                  : "Speak from the marrow of your bones. Write freely—even rough fragments work. You can tap '✦ Weave into Starlight' above to weave them into heartfelt poetry..."
              }
              className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-sm text-white placeholder-white/30 focus:outline-none focus:border-amber-400/50 focus:ring-1 focus:ring-amber-400/50 transition-all leading-relaxed resize-y"
            />
            {weaveError && (
              <p className="text-[11px] text-rose-400/80 mt-1 flex items-center gap-1">
                <span>⚠</span> {weaveError}
              </p>
            )}
            {previousContent && (
              <p className="text-[10px] text-amber-300/60 mt-1">
                ✦ Your original draft is preserved. Click &ldquo;Undo AI Weave&rdquo; above anytime to restore it.
              </p>
            )}
            {isLongLetterMode && (
              <p className="text-[10px] text-amber-300/60 mt-1">
                ✦ Long letters become permanent editorial chronicles, indexed in the sacred archive.
              </p>
            )}
          </div>

          {/* Time Capsule Toggle Option */}
          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-base select-none">⏳</span>
                <div>
                  <label className="text-xs font-medium text-white/90 block">
                    Ignite in the Future (Time-Capsule Nebula)
                  </label>
                  <span className="text-[10px] text-white/50 block">
                    Lock this star in a dormant cosmic nebula until its appointed date
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsTimeCapsule(!isTimeCapsule)}
                className={`w-10 h-5 rounded-full transition-colors relative p-0.5 shrink-0 ${
                  isTimeCapsule ? "bg-sky-400" : "bg-white/15"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    isTimeCapsule ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {isTimeCapsule && (
              <div className="pt-2.5 border-t border-white/10 flex items-center justify-between text-xs">
                <span className="text-[11px] text-white/50 font-mono">Ignition Horizon:</span>
                <div className="flex items-center gap-1.5">
                  {(["1month", "6months", "1year"] as const).map((dur) => (
                    <button
                      type="button"
                      key={dur}
                      onClick={() => setTimeCapsuleDuration(dur)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-mono transition-all ${
                        timeCapsuleDuration === dur
                          ? "bg-sky-400/25 text-sky-200 border border-sky-400/50 shadow-sm shadow-sky-500/20"
                          : "bg-white/5 text-white/50 hover:text-white border border-transparent"
                      }`}
                    >
                      {dur === "1month" ? "1 Month" : dur === "6months" ? "6 Months" : "1 Year"}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sacred Release Ritual Choice */}
          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-white/90 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>SACRED RELEASE VESSEL</span>
              </label>
              <span className="text-[10px] text-amber-300/80 font-mono">Choose Ritual</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "star" as const, label: "Eternal Star", icon: "✦", desc: "Ascends into starlight" },
                { id: "lantern" as const, label: "Sky Lantern", icon: "🏮", desc: "Floats on warm embers" },
                { id: "crane" as const, label: "Origami Crane", icon: "🕊", desc: "Wings of quiet peace" },
              ].map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setReleaseRitual(r.id)}
                  className={`p-2 sm:p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    releaseRitual === r.id
                      ? "bg-amber-400/20 border-amber-400/60 text-white shadow-sm shadow-amber-400/20"
                      : "bg-white/[0.02] border-white/10 text-white/50 hover:text-white hover:bg-white/[0.05]"
                  }`}
                >
                  <div className="text-base sm:text-lg mb-0.5">{r.icon}</div>
                  <div className="text-[11px] font-semibold text-white/90 truncate">{r.label}</div>
                  <div className="text-[9px] text-white/40 leading-tight hidden sm:block">{r.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting || !recipient.trim() || !content.trim()}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-amber-300 via-amber-200 to-amber-400 text-neutral-950 font-medium text-sm tracking-wide shadow-xl shadow-amber-400/20 hover:shadow-amber-400/35 hover:brightness-105 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span>Ascending to the Stars...</span>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Release to the Stars</span>
                </>
              )}
            </button>

            {/* Sacred WhatsApp-Style Privacy Guarantee Badge */}
            <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5 text-[10px] sm:text-[11px] text-emerald-400/80 font-mono tracking-tight text-center">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>100% Anonymous • Zero Data Stored • End-to-End Detached</span>
            </div>
          </div>
        </form>
      </div>

      {/* Sanctuary Guardian Strike Modal */}
      <SanctuaryGuardianModal
        isOpen={guardianModalState.isOpen}
        onClose={closeGuardianModal}
        strikeLevel={guardianModalState.strikeLevel}
        guidanceMessage={guardianModalState.guidanceMessage}
        reason={guardianModalState.reason}
        remainingMs={guardianModalState.remainingMs}
      />
    </div>
  );
}