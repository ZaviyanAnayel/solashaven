"use client";

import React, { useState, useRef, useEffect } from "react";
import { Flame, X, Heart, Globe, Sparkles } from "lucide-react";
import { soundEngine } from "../lib/audio";

interface GlobalVigilOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onVigilProgress: (progress: number) => void;
}

export default function GlobalVigilOverlay({
  isOpen,
  onClose,
  onVigilProgress,
}: GlobalVigilOverlayProps) {
  const [isHolding, setIsHolding] = useState(false);
  const [progress, setProgress] = useState(0); // 0 to 100
  const [hasCompleted, setHasCompleted] = useState(false);
  // Honest counter: real vigils THIS soul has held (localStorage). Never fake live users.
  const [vigilsHeld, setVigilsHeld] = useState(0);

  const holdIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load this soul's real vigil count
  useEffect(() => {
    try {
      const n = parseInt(localStorage.getItem("solashaven-vigils-held") || "0", 10);
      if (!isNaN(n) && n > 0) setVigilsHeld(n);
    } catch {}
  }, []);

  // Update canvas progress
  useEffect(() => {
    onVigilProgress(progress / 100);
  }, [progress, onVigilProgress]);

  // Clean up on close
  useEffect(() => {
    if (!isOpen) {
      setIsHolding(false);
      setProgress(0);
      setHasCompleted(false);
      onVigilProgress(0);
      if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
    }
  }, [isOpen, onVigilProgress]);

  const startHolding = () => {
    if (hasCompleted) return;
    setIsHolding(true);
    soundEngine.playVigilHarmonic(0.8);

    if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);

    holdIntervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
          setHasCompleted(true);
          setVigilsHeld((c) => {
            const next = c + 1;
            try {
              localStorage.setItem("solashaven-vigils-held", String(next));
            } catch {}
            return next;
          });
          soundEngine.playVigilHarmonic(1.5);
          soundEngine.playPrayerAscensionChime();
          return 100;
        }
        return prev + 2.5; // ~1.5 - 2.0s hold duration
      });
    }, 30);
  };

  const stopHolding = () => {
    if (hasCompleted) return;
    setIsHolding(false);
    if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);

    // Smooth release decay
    const decayInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev <= 0) {
          clearInterval(decayInterval);
          return 0;
        }
        return prev - 8;
      });
    }, 20);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-2xl animate-fade-in">
      <div className="relative w-full max-w-md rounded-3xl border border-amber-400/30 bg-gradient-to-b from-neutral-950/95 via-neutral-900/90 to-black p-6 sm:p-8 shadow-2xl shadow-amber-500/20 text-white text-center overflow-hidden">
        {/* Background Ambient Glow */}
        <div
          className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full bg-amber-400/15 blur-3xl transition-opacity duration-700"
          style={{ opacity: 0.4 + (progress / 100) * 0.6 }}
        />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/25 text-amber-300 text-[11px] font-mono uppercase tracking-widest mb-3">
          <Flame className="w-3.5 h-3.5" />
          <span>The Global Silent Vigil</span>
        </div>

        <h3 className="text-xl sm:text-2xl font-serif font-semibold text-white/95 mb-2">
          {hasCompleted ? "✦ Sacred Vigil Completed" : "Hold Vigil in Solitude"}
        </h3>

        <p className="text-xs text-neutral-300/80 mb-6 max-w-xs mx-auto leading-relaxed">
          {hasCompleted
            ? "Your warmth has rippled across the 3D constellation, blessing every solitary soul awake tonight."
            : "Press and hold to channel your warmth into the cosmos. You are never as alone as the darkness tells you."}
        </p>

        {/* Interactive Hold Button Circle */}
        <div className="my-6 flex flex-col items-center justify-center">
          <div className="relative w-36 h-36 flex items-center justify-center">
            {/* SVG Circular Progress Ring */}
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="44"
                className="stroke-white/10"
                strokeWidth="4"
                fill="none"
              />
              <circle
                cx="50"
                cy="50"
                r="44"
                className="stroke-amber-300 transition-all duration-75 ease-out"
                strokeWidth="4"
                strokeDasharray={276}
                strokeDashoffset={276 - (276 * progress) / 100}
                strokeLinecap="round"
                fill="none"
              />
            </svg>

            {/* Central Press/Hold Action Button */}
            <button
              onMouseDown={startHolding}
              onMouseUp={stopHolding}
              onMouseLeave={stopHolding}
              onTouchStart={startHolding}
              onTouchEnd={stopHolding}
              disabled={hasCompleted}
              className={`absolute inset-3 rounded-full flex flex-col items-center justify-center transition-all duration-300 select-none ${
                hasCompleted
                  ? "bg-amber-400 text-neutral-950 shadow-xl shadow-amber-400/40"
                  : isHolding
                  ? "scale-95 bg-amber-400/30 border-2 border-amber-300 text-amber-200 shadow-2xl shadow-amber-400/30"
                  : "bg-white/[0.05] border border-white/15 text-white/80 hover:bg-white/10 hover:border-amber-300/40"
              }`}
            >
              <Flame
                className={`w-8 h-8 transition-transform duration-300 ${
                  isHolding ? "scale-125 text-amber-300 animate-pulse" : hasCompleted ? "scale-110 text-neutral-950" : "text-amber-300/70"
                }`}
              />
              <span className="text-[10px] font-mono uppercase tracking-widest mt-1">
                {hasCompleted ? "Vigil Held" : isHolding ? "Holding..." : "Press & Hold"}
              </span>
            </button>
          </div>

          <span className="text-[11px] font-mono text-white/40 mt-3">
            {hasCompleted ? "✦ Starlight Energized" : `${Math.round(progress)}% Focused`}
          </span>
        </div>

        {/* Vigil Counter — honest: this soul's own held vigils */}
        <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between text-xs text-white/70 font-mono">
          <span className="flex items-center gap-1.5 text-amber-300">
            <span className="w-2 h-2 rounded-full bg-amber-400/80" />
            <Globe className="w-3.5 h-3.5" />
            <span>Sacred Vigil</span>
          </span>
          <span className="text-white/90 font-semibold">
            {vigilsHeld === 0
              ? "Your first vigil awaits"
              : `${vigilsHeld} silent vigil${vigilsHeld === 1 ? "" : "s"} held by you`}
          </span>
        </div>

        {hasCompleted && (
          <button
            onClick={onClose}
            className="w-full mt-5 py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-medium text-xs tracking-wider transition-all"
          >
            Breathe & Return to Sanctuary
          </button>
        )}
      </div>
    </div>
  );
}
