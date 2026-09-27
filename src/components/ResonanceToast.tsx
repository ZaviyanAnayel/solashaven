"use client";

import React, { useEffect } from "react";
import { Sparkles, X, HeartHandshake } from "lucide-react";
import { LetterCategory } from "../lib/types";

interface ResonanceToastProps {
  category: LetterCategory | null;
  onClose: () => void;
}

export default function ResonanceToast({ category, onClose }: ResonanceToastProps) {
  useEffect(() => {
    if (category) {
      const timer = setTimeout(() => {
        onClose();
      }, 9000);
      return () => clearTimeout(timer);
    }
  }, [category, onClose]);

  if (!category) return null;

  return (
    <div className="fixed bottom-24 sm:bottom-8 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-md animate-fade-in pointer-events-auto">
      <div className="relative rounded-2xl border border-amber-400/30 bg-black/90 backdrop-blur-2xl p-4 sm:p-5 shadow-2xl shadow-amber-500/20 text-white overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1 rounded-full text-white/40 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-3.5">
          <div className="shrink-0 flex items-center justify-center w-9 h-9 rounded-xl bg-amber-400/15 border border-amber-400/30 text-amber-300">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-amber-300 uppercase tracking-wider mb-1">
              <Sparkles className="w-3 h-3" />
              <span>Resonance Synapse</span>
            </div>
            <h5 className="text-sm font-semibold text-white/95 mb-1">
              You are not alone in the dark.
            </h5>
            <p className="text-xs text-white/70 leading-relaxed font-serif italic">
              "Your unspoken letter now drifts in the same constellation as every letter ever released here. Your stars share the same celestial horizon."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
