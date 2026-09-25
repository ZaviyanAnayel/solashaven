"use client";

import React, { useState } from "react";
import { Letter, CATEGORIES, Whisper } from "../lib/types";
import {
  X,
  Heart,
  Share2,
  Sparkles,
  MapPin,
  Calendar,
  Check,
  MessageCircle,
  Send,
  Star,
  AlertCircle,
  Flame,
  Feather
} from "lucide-react";
import { soundEngine } from "../lib/audio";
import { validateSanctuaryContent } from "../lib/moderation";
import { SACRED_EMOJIS, PRESET_PRAYERS } from "../lib/sacredPrayers";
import { useGuardianInspection } from "../lib/useGuardianInspection";
import SanctuaryGuardianModal from "./SanctuaryGuardianModal";

interface LetterReaderModalProps {
  letter: Letter | null;
  onClose: () => void;
  onSendLight: (id: string) => void;
  onAddWhisper: (letterId: string, whisper: Whisper) => void;
  isUserStar: boolean;
  allLetters?: Letter[];
  onFocusResonantStar?: (starId: string) => void;
}

export default function LetterReaderModal({
  letter,
  onClose,
  onSendLight,
  onAddWhisper,
  isUserStar,
  allLetters = [],
  onFocusResonantStar,
}: LetterReaderModalProps) {
  const [hasSentLight, setHasSentLight] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);
  const [whisperText, setWhisperText] = useState("");
  const [whisperLocation, setWhisperLocation] = useState("");
  const [selectedEmoji, setSelectedEmoji] = useState("🕊️");
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<"solace" | "memory" | "hope">("solace");
  const [whisperError, setWhisperError] = useState<string | null>(null);
  const [isWeavingWhisper, setIsWeavingWhisper] = useState(false);
  const [previousWhisperDraft, setPreviousWhisperDraft] = useState<string | null>(null);
  const [prayerDelivered, setPrayerDelivered] = useState<{
    text: string;
    recipient: string;
    emoji: string;
    locationName: string;
  } | null>(null);

  const {
    inspect,
    guardianModalState,
    closeGuardianModal,
  } = useGuardianInspection();

  const handleAiCraftWhisper = async () => {
    if (isWeavingWhisper || !letter) return;
    setIsWeavingWhisper(true);
    setWhisperError(null);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "craft_whisper",
          starLetter: letter.content,
          recipient: letter.recipient,
          userDraft: whisperText,
        }),
      });
      const data = await res.json();
      let craftedText = "";
      if (data && data.text) {
        craftedText = data.text;
      } else {
        craftedText = letter.category === "grief"
          ? "May light wrap around your deepest wounds and bring your heart quiet peace tonight."
          : letter.category === "love"
          ? "Unspoken love still shines with eternal warmth. May your heart feel heard across this starlight."
          : letter.category === "confession"
          ? "You are not a failure for feeling weary. May gentleness find your soul tonight."
          : "May peace surround your spirit and whisper reassurance into your quiet hours.";
      }
      soundEngine.playLightShimmer();
      setPreviousWhisperDraft(whisperText);
      setWhisperText(`${selectedEmoji} ${craftedText}`);
    } catch {
      soundEngine.playLightShimmer();
      setPreviousWhisperDraft(whisperText);
      const fallback = letter.category === "grief"
        ? "May light wrap around your deepest wounds and bring your heart quiet peace tonight."
        : letter.category === "love"
        ? "Unspoken love still shines with eternal warmth. May your heart feel heard across this starlight."
        : letter.category === "confession"
        ? "You are not a failure for feeling weary. May gentleness find your soul tonight."
        : "May peace surround your spirit and whisper reassurance into your quiet hours.";
      setWhisperText(`${selectedEmoji} ${fallback}`);
    } finally {
      setIsWeavingWhisper(false);
    }
  };

  const handleUndoWhisper = () => {
    if (previousWhisperDraft !== null) {
      setWhisperText(previousWhisperDraft);
      setPreviousWhisperDraft(null);
    }
  };

  if (!letter) return null;

  const categoryInfo = CATEGORIES.find((c) => c.id === letter.category) || CATEGORIES[1];
  const whispers = letter.whispers || [];

  const handleLightClick = () => {
    if (hasSentLight) return;
    setHasSentLight(true);
    soundEngine.playLightShimmer();
    onSendLight(letter.id);
  };

  const handleCopyLink = async () => {
    const url = typeof window !== "undefined" ? `${window.location.origin}/letter/${letter.id}` : "";
    const { copyToClipboard } = await import("@/utils/clipboard");
    await copyToClipboard(url);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2000);
  };

  const handleSelectPresetPrayer = (prayerText: string, emoji: string) => {
    setWhisperText(`${emoji} ${prayerText}`);
    setSelectedEmoji(emoji);
  };

  const handleWhisperSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setWhisperError(null);

    const validation = validateSanctuaryContent(whisperText, true);
    if (!validation.isClean) {
      setWhisperError(validation.error || "Please choose or write a sacred prayer.");
      return;
    }

    // AI Guardian inspection
    const result = await inspect(
      whisperText,
      "whisper",
      "Anonymous Whisperer",
      whisperLocation || "Unknown Location"
    );

    if (!result.passed) {
      return;
    }

    const newWhisper: Whisper = {
      id: "w-" + Date.now(),
      text: whisperText.trim(),
      createdAt: "Just now",
      locationName: whisperLocation.trim() || "Compassionate Soul"
    };

    // Play Sacred 528Hz Solfeggio Prayer Ascension Chime
    soundEngine.playPrayerAscensionChime();
    onAddWhisper(letter.id, newWhisper);

    // Trigger transcendent emotional confirmation
    setPrayerDelivered({
      text: whisperText.trim(),
      recipient: letter.recipient,
      emoji: selectedEmoji,
      locationName: whisperLocation.trim() || "Compassionate Soul"
    });

    setWhisperText("");
    setWhisperLocation("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-2xl animate-fade-in">
      <div className="relative w-full max-w-xl rounded-3xl border border-white/15 bg-gradient-to-b from-neutral-900/95 via-neutral-950/95 to-black p-5 sm:p-8 shadow-2xl shadow-black text-white overflow-hidden max-h-[92dvh] overflow-y-auto scrollbar-none">
        {/* Constellation Hue */}
        <div
          className="pointer-events-none absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl opacity-20"
          style={{ backgroundColor: letter.color }}
        />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 sm:top-6 sm:right-6 p-2 rounded-full bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Badges */}
        <div className="flex flex-wrap items-center gap-2 mb-3.5 pr-10">
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border"
            style={{
              backgroundColor: `${letter.color}15`,
              borderColor: `${letter.color}40`,
              color: letter.color
            }}
          >
            <span>{categoryInfo.icon}</span>
            <span>{categoryInfo.label.toUpperCase()}</span>
          </span>

          {isUserStar && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-amber-400/20 border border-amber-400/40 text-amber-300 animate-pulse">
              <Star className="w-3 h-3 fill-amber-300" />
              <span>YOUR STAR</span>
            </span>
          )}

          <div className="flex items-center gap-1 text-xs text-white/40 font-mono">
            <MapPin className="w-3 h-3" />
            <span>{letter.locationName}</span>
          </div>

          <div className="flex items-center gap-1 text-xs text-white/40 font-mono">
            <Calendar className="w-3 h-3" />
            <span>{letter.createdAt}</span>
          </div>
        </div>

        {/* Recipient Title */}
        <h3 className="text-xl sm:text-2xl font-serif font-semibold text-white/95 mb-3.5 tracking-tight">
          {letter.recipient}
        </h3>

        {/* Letter Body */}
        <div className="relative my-3 px-5 py-4 rounded-2xl bg-white/[0.03] border border-white/10">
          <p className="text-sm sm:text-base text-neutral-200/90 leading-relaxed font-serif italic whitespace-pre-line selection:bg-amber-400/30">
            "{letter.content}"
          </p>
        </div>

        {/* Time-Capsule Nebula Indicator */}
        {letter.isTimeCapsule && (
          <div className="my-3 p-4 rounded-2xl bg-gradient-to-r from-sky-500/15 via-indigo-500/10 to-transparent border border-sky-400/30 flex items-start gap-3">
            <span className="text-2xl select-none">⏳</span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-sky-300">
                  Time-Locked Nebula
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-400/20 text-sky-200 border border-sky-400/30 font-mono">
                  Ignition Date: {letter.igniteDate}
                </span>
              </div>
              <p className="text-xs text-white/70 mt-1 leading-relaxed">
                This star is sealed in cosmic orbit. It will ignite into full radiant starlight on its appointed date. Prayers and comfort left today will greet the sender upon arrival.
              </p>
            </div>
          </div>
        )}

        {/* Resonant Sister Star Bridge */}
        {letter.resonantLetterId && (() => {
          const sister = allLetters.find((l) => l.id === letter.resonantLetterId);
          if (!sister) return null;
          return (
            <div className="my-3 p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-neutral-900/80 to-amber-500/5 border border-amber-400/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-amber-300 shrink-0 mt-0.5 animate-pulse" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-semibold uppercase tracking-wider text-amber-300">
                      Resonant Sister Star
                    </span>
                    <span className="text-[10px] text-white/50 font-mono">📍 {sister.locationName}</span>
                  </div>
                  <p className="text-xs text-neutral-300/85 mt-0.5 leading-relaxed">
                    {letter.resonanceNote || `Connected by an invisible thread of light to "${sister.recipient}"`}
                  </p>
                </div>
              </div>
              {onFocusResonantStar && (
                <button
                  onClick={() => {
                    onClose();
                    onFocusResonantStar(sister.id);
                  }}
                  className="shrink-0 px-3.5 py-1.5 rounded-full bg-amber-400/20 hover:bg-amber-400/30 border border-amber-300/40 text-amber-200 text-xs font-medium transition-all active:scale-95 flex items-center gap-1.5"
                >
                  <span>✦ Glide to Sister Star</span>
                </button>
              )}
            </div>
          );
        })()}

        {/* Action Buttons */}
        <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-2.5 py-3 border-y border-white/10 my-4">
          <div className="flex items-center gap-2">
            <button
              onClick={handleLightClick}
              className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-300 text-xs font-medium cursor-pointer ${
                hasSentLight
                  ? "bg-rose-500/20 border-rose-400/50 text-rose-300 shadow-lg shadow-rose-500/20 scale-105"
                  : "bg-white/5 border-white/10 text-white/80 hover:bg-white/10 hover:text-white active:scale-95"
              }`}
            >
              <Heart
                className={`w-4 h-4 transition-transform ${
                  hasSentLight ? "fill-rose-400 text-rose-400 scale-110" : ""
                }`}
              />
              <span>{hasSentLight ? "Light Delivered 🤍" : "Send Light"}</span>
              <span className="ml-1 text-[11px] opacity-60">
                ({letter.lightCount.toLocaleString()})
              </span>
            </button>
            {hasSentLight && (
              <span className="text-[10px] text-rose-300/90 font-mono animate-fade-in hidden sm:inline">
                ✦ Peace sent to this soul
              </span>
            )}
          </div>

          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 text-xs font-medium transition-all"
          >
            {hasCopied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Star Link Copied</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span>Share Star</span>
              </>
            )}
          </button>
        </div>

        {/* Existing Whispers */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2.5">
            <h4 className="text-xs font-mono tracking-wider text-white/60 uppercase flex items-center gap-1.5">
              <MessageCircle className="w-3.5 h-3.5 text-amber-300" />
              <span>Prayers & Whispers ({whispers.length})</span>
            </h4>
            <span className="text-[10px] text-amber-300/80 font-mono">Heavenly Solace</span>
          </div>

          {whispers.length > 0 ? (
            <div className="space-y-2 mb-4 max-h-36 overflow-y-auto pr-1">
              {whispers.map((w) => (
                <div
                  key={w.id}
                  className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.07] text-xs text-white/85 leading-relaxed"
                >
                  <p className="italic">{w.text}</p>
                  <div className="flex items-center justify-between text-[10px] text-white/40 mt-1">
                    <span>{w.locationName || "Anonymous"}</span>
                    <span>{w.createdAt}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-white/30 italic mb-3">
              No prayers left yet. Send the first blessing to this soul.
            </p>
          )}

          {whisperError && (
            <div className="mb-3 p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center gap-2 text-[11px] text-rose-200">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-400" />
              <span>{whisperError}</span>
            </div>
          )}

          {/* Sacred Heavenly Offerings & Ascension System */}
          {prayerDelivered ? (
            <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-b from-amber-500/15 via-neutral-900/90 to-black border border-amber-400/40 text-center animate-fade-in relative overflow-hidden shadow-2xl shadow-amber-500/10">
              {/* Ethereal Sacred Aura Glow */}
              <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-48 bg-amber-400/20 rounded-full blur-2xl pointer-events-none" />

              {/* Animated Ascending Icon */}
              <div className="relative mx-auto w-16 h-16 mb-3 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-amber-400/25 animate-ping opacity-75" />
                <div className="relative w-14 h-14 rounded-full bg-gradient-to-tr from-amber-500/30 to-amber-300/20 border border-amber-400/50 flex items-center justify-center text-2xl shadow-lg shadow-amber-500/30">
                  {prayerDelivered.emoji || "🕊️"}
                </div>
              </div>

              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-widest bg-amber-400/20 border border-amber-400/40 text-amber-300 mb-2">
                <Sparkles className="w-3 h-3" />
                <span>Sacred Prayer Ascended & Delivered</span>
              </span>

              <h3 className="text-lg sm:text-xl font-serif font-bold text-white mb-0.5 tracking-tight">
                ✦ Your Prayer Has Reached This Soul
              </h3>
              <p className="text-[11px] font-mono text-amber-300/80 mb-2">
                Your blessing has ascended and delivered into the cosmos
              </p>

              <p className="text-xs text-neutral-300/90 max-w-md mx-auto mb-4 leading-relaxed font-serif italic">
                "Somewhere in this quiet universe, a heavy heart just felt a wave of peace. Your kindness is now a permanent gentle light surrounding <span className="text-amber-300 font-semibold">{prayerDelivered.recipient}'s</span> star."
              </p>

              {/* Delivered Prayer Box */}
              <div className="max-w-md mx-auto p-3.5 rounded-xl bg-white/[0.04] border border-amber-400/25 mb-4 text-left relative">
                <div className="text-[10px] font-mono text-amber-300/70 mb-1 flex items-center justify-between">
                  <span>Sacred Offering</span>
                  <span>Delivered Just Now</span>
                </div>
                <p className="text-xs sm:text-sm text-neutral-200 italic font-serif leading-relaxed">
                  "{prayerDelivered.text}"
                </p>
                <div className="text-[10px] text-white/40 mt-2 font-mono flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-amber-400/60" />
                  <span>Sent from {prayerDelivered.locationName}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setPrayerDelivered(null)}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-300 to-amber-400 text-neutral-950 font-medium text-xs hover:brightness-110 transition-all shadow-md shadow-amber-400/20 flex items-center gap-1.5"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Offer Another Prayer</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-3">
              {/* Category Tabs: Solace, Memory, Hope */}
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-2">
                <span className="text-[11px] text-amber-300 font-mono uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span>Send a Sacred Blessing</span>
                </span>
                <div className="flex items-center gap-1">
                  {[
                    { id: "solace", label: "🕊️ Solace" },
                    { id: "memory", label: "🌸 Memory" },
                    { id: "hope", label: "🌿 Hope" }
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setSelectedCategoryTab(t.id as "solace" | "memory" | "hope")}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-mono transition-all ${
                        selectedCategoryTab === t.id
                          ? "bg-amber-400/20 border border-amber-400/40 text-amber-300"
                          : "text-white/40 hover:text-white"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sacred Pure Emojis (No funny/angry emojis) */}
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
                <span className="text-[10px] text-white/40 shrink-0">Offer:</span>
                {SACRED_EMOJIS.filter(
                  (e) => e.category === selectedCategoryTab || selectedCategoryTab === "solace"
                ).map((em) => (
                  <button
                    type="button"
                    key={em.name}
                    onClick={() => {
                      setSelectedEmoji(em.emoji);
                      if (!whisperText.startsWith(em.emoji)) {
                        setWhisperText(`${em.emoji} ${whisperText.replace(/^[^\s]+\s*/, "")}`);
                      }
                    }}
                    className={`px-2 py-1 rounded-xl text-sm border transition-all ${
                      selectedEmoji === em.emoji
                        ? "bg-amber-400/20 border-amber-400/50 scale-110 shadow-md shadow-amber-400/20"
                        : "bg-white/5 border-white/10 hover:bg-white/10"
                    }`}
                    title={em.name}
                  >
                    {em.emoji}
                  </button>
                ))}
              </div>

              {/* 1-Tap Pre-written Sacred Prayers */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] text-white/40 block">1-Tap Sacred Prayers:</span>
                <div className="grid grid-cols-1 gap-1.5 max-h-24 overflow-y-auto pr-1">
                  {PRESET_PRAYERS.filter((p) => p.category === selectedCategoryTab).map((pr) => (
                    <button
                      type="button"
                      key={pr.id}
                      onClick={() => handleSelectPresetPrayer(pr.text, pr.emoji)}
                      className="text-left text-[11px] p-2 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.06] hover:border-amber-400/30 text-white/80 transition-all truncate"
                    >
                      <span>{pr.emoji} {pr.text}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Whisper Submission Form with AI Helper */}
              <form onSubmit={handleWhisperSubmit} className="space-y-2 pt-2 border-t border-white/[0.06]">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-white/50 uppercase font-mono tracking-wider">
                    Your Unspoken Whisper
                  </span>

                  <div className="flex items-center gap-2">
                    {previousWhisperDraft !== null && (
                      <button
                        type="button"
                        onClick={handleUndoWhisper}
                        className="text-[10px] text-amber-300/80 hover:text-amber-200 underline cursor-pointer"
                      >
                        (Undo AI)
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleAiCraftWhisper}
                      disabled={isWeavingWhisper}
                      className={`text-[11px] px-2.5 py-0.5 rounded-full flex items-center gap-1 font-medium transition-all cursor-pointer ${
                        isWeavingWhisper
                          ? "bg-amber-400/20 text-amber-300 border border-amber-400/40 animate-pulse"
                          : "bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 border border-amber-400/30 shadow-sm"
                      }`}
                      title="Let AI craft or polish a touching whisper for this star"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>{isWeavingWhisper ? "Crafting Whisper..." : "✦ AI Craft Whisper"}</span>
                    </button>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={whisperText}
                    onChange={(e) => setWhisperText(e.target.value)}
                    placeholder="Type words, or tap '✦ AI Craft Whisper' above for instant solace..."
                    maxLength={180}
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white placeholder-white/30 focus:outline-none focus:border-amber-400/50"
                  />
                  <button
                    type="submit"
                    disabled={!whisperText.trim() || isWeavingWhisper}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 text-neutral-950 font-semibold text-xs flex items-center justify-center gap-1.5 hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md shadow-amber-400/20 shrink-0 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Prayer 🕊️</span>
                  </button>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <input
                    type="text"
                    value={whisperLocation}
                    onChange={(e) => setWhisperLocation(e.target.value)}
                    placeholder="Your city (optional, e.g. London, Tokyo)"
                    className="flex-1 px-3 py-1 rounded-lg bg-transparent border border-white/5 text-[11px] text-white/60 placeholder-white/20 focus:outline-none focus:border-white/20"
                  />
                  <span className="text-[10px] text-amber-300/70 font-mono shrink-0 hidden sm:inline">
                    ✦ 100% Anonymous & Sacred
                  </span>
                </div>
              </form>
            </div>
          )}
        </div>
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