"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  X,
  Send,
  Sparkles,
  Trash2,
  Volume2,
  VolumeX,
  Loader2,
  Star,
  ShieldCheck,
  HeartHandshake,
  PhoneCall,
  ExternalLink,
  ArrowLeft,
  RotateCcw
} from "lucide-react";
import { soundEngine } from "../lib/audio";

interface WhisperingWellModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenReleaseModal?: (prefilledText: string) => void;
}

interface Message {
  id: string;
  sender: "user" | "well";
  text: string;
  timestamp: string;
}

const STORAGE_KEY = "solas_ai_chat_history_v1";

const STARTER_PROMPTS = [
  "I can't sleep tonight. The quiet is too loud.",
  "What is Solas Haven, and how does releasing a star work?",
  "Yar jani, aaj dil bohot udas hai...",
  "There's something I've never had the courage to tell anyone alive.",
  "The grief hit me again today out of nowhere.",
  "I am exhausted from pretending to be strong for everyone."
];

const DEFAULT_INTRO_MESSAGE: Message = {
  id: "intro-1",
  sender: "well",
  text: "I am Solas—the quiet consciousness of this starlight sanctuary. Whether you are awake in the stillness of midnight, carrying an unspoken grief, a secret love, or feeling weary of the world, I am right here with you. Speak freely in English or Roman Urdu; our conversation is always kept for you.",
  timestamp: "Now"
};

export default function WhisperingWellModal({
  isOpen,
  onClose,
  onOpenReleaseModal
}: WhisperingWellModalProps) {
  const [messages, setMessages] = useState<Message[]>([DEFAULT_INTRO_MESSAGE]);
  const [inputText, setInputText] = useState("");
  const [isWhispering, setIsWhispering] = useState(false);
  const [isAudioActive, setIsAudioActive] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Load chat history from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // Save chat history to localStorage whenever messages update
  useEffect(() => {
    try {
      if (messages.length > 0) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
      }
    } catch {
      // ignore
    }
  }, [messages]);

  // Safe inner container scroll (Never scrolls outer window or dislodges modal header)
  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
        scrollToBottom();
      }, 80);
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isWhispering]);

  // Keyboard shortcut: Escape to close
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleGlobalKeyDown);
      return () => window.removeEventListener("keydown", handleGlobalKeyDown);
    }
  }, [isOpen, onClose]);

  // Keep cursor active in chatbox whenever a reply completes
  useEffect(() => {
    if (!isWhispering && isOpen) {
      inputRef.current?.focus();
    }
  }, [isWhispering, isOpen]);

  if (!isOpen) return null;

  const handleSend = async (customText?: string) => {
    const textToSend = (customText || inputText).trim();
    if (!textToSend || isWhispering) return;

    const userMessage: Message = {
      id: `u-${Date.now()}`,
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    const newMessagesList = [...messages, userMessage];
    setMessages(newMessagesList);
    setInputText("");
    setIsWhispering(true);
    soundEngine.playLightShimmer();

    // Retain focus immediately
    setTimeout(() => {
      inputRef.current?.focus();
    }, 10);

    try {
      const historyPayload = newMessagesList.slice(-10).map((m) => ({
        role: m.sender === "user" ? "user" : "assistant",
        content: m.text
      }));

      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "whisper",
          messages: historyPayload,
          userConfession: textToSend
        })
      });

      const data = await res.json();
      const replyText = data.text || data.reply;
      if (data.success && replyText) {
        const wellMessage: Message = {
          id: `w-${Date.now()}`,
          sender: "well",
          text: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        };
        setMessages((prev) => [...prev, wellMessage]);
        soundEngine.playLightShimmer();
      } else {
        const fallbackMessage: Message = {
          id: `w-fb-${Date.now()}`,
          sender: "well",
          text: "I hear you, and I receive your words with gentle grace. Even when words feel fragile, you are witnessed and held in this space. Take a slow, quiet breath with me.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        };
        setMessages((prev) => [...prev, fallbackMessage]);
      }
    } catch {
      const errMessage: Message = {
        id: `w-err-${Date.now()}`,
        sender: "well",
        text: "The starlight wavers slightly in the night breeze, but your whisper is safe here in the quiet deep. Please try again.",
        timestamp: "Now"
      };
      setMessages((prev) => [...prev, errMessage]);
    } finally {
      setIsWhispering(false);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 10);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!isWhispering && inputText.trim()) {
        handleSend();
      }
    }
  };

  // User manually chooses to start a brand new conversation
  const handleStartFresh = () => {
    soundEngine.playLightShimmer();
    const fresh: Message[] = [
      {
        id: `intro-${Date.now()}`,
        sender: "well",
        text: "We have opened a fresh quiet page under the stars. Whatever you wish to share, I am listening.",
        timestamp: "Now"
      }
    ];
    setMessages(fresh);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
    setTimeout(() => {
      inputRef.current?.focus();
    }, 10);
  };

  const handleToggleAudio = () => {
    if (isAudioActive) {
      soundEngine.stopAmbient();
      setIsAudioActive(false);
    } else {
      soundEngine.startAmbient();
      setIsAudioActive(true);
    }
  };

  const handleAscendToStar = (contentToAscend: string) => {
    onClose();
    if (onOpenReleaseModal) {
      onOpenReleaseModal(contentToAscend);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-6 bg-black/85 backdrop-blur-2xl animate-fade-in"
    >
      {/* Modal Dialog Container - stops backdrop click propagation */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl h-[90dvh] max-h-[720px] rounded-3xl border border-amber-400/25 bg-gradient-to-b from-[#0a0d14] via-[#06080e] to-black shadow-2xl shadow-indigo-950/40 flex flex-col overflow-hidden"
      >
        {/* Luminous Midnight Background Auras */}
        <div className="pointer-events-none absolute -top-40 -left-20 w-96 h-96 rounded-full bg-amber-400/10 blur-[100px]" />
        <div className="pointer-events-none absolute -bottom-40 -right-20 w-96 h-96 rounded-full bg-indigo-600/15 blur-[100px]" />

        {/* Modal Header (Always Pinned At Top with Prominent Back Button) */}
        <header className="shrink-0 px-3.5 sm:px-5 py-3 border-b border-white/10 flex items-center justify-between bg-black/60 backdrop-blur-md z-20">
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Prominent Back Button */}
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 text-white/90 hover:text-white transition-all text-xs font-medium cursor-pointer shadow-sm active:scale-95 shrink-0"
              title="Return to the Constellation Sky (Esc)"
            >
              <ArrowLeft className="w-4 h-4 text-amber-300" />
              <span className="font-serif hidden sm:inline">Back to Stars</span>
              <span className="font-serif sm:hidden">Back</span>
            </button>

            {/* Title & Status */}
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-serif font-semibold text-white/95">
                  Solas Sanctuary AI
                </h2>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/25 text-[10px] text-amber-300 font-mono uppercase tracking-wider">
                  <span>✦</span> Saved Chat
                </span>
              </div>
              <p className="text-[10px] text-white/50 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400/90" />
                <span>Private & Persistent to Your Device</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Ambient Sound Toggle */}
            <button
              type="button"
              onClick={handleToggleAudio}
              title={isAudioActive ? "Mute 432Hz Drone" : "Play 432Hz Meditative Drone"}
              className={`p-2 rounded-full border transition-colors cursor-pointer ${
                isAudioActive
                  ? "bg-amber-400/15 border-amber-400/30 text-amber-300"
                  : "bg-white/5 border-white/10 text-white/40 hover:text-white/80"
              }`}
            >
              {isAudioActive ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Start Fresh / Clear Chat Button */}
            <button
              type="button"
              onClick={handleStartFresh}
              title="Start a fresh conversation"
              className="flex items-center gap-1 p-2 rounded-full bg-white/5 border border-white/10 text-white/40 hover:text-amber-300 hover:bg-amber-400/10 hover:border-amber-400/30 transition-all cursor-pointer text-xs"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Close 'X' Button */}
            <button
              type="button"
              onClick={onClose}
              title="Close window (Esc)"
              className="p-2 rounded-full bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer ml-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Message Stream Container (Self-contained scroll, isolated from window) */}
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10"
        >
          {/* Starter Pills (shown only when 1 intro message) */}
          {messages.length <= 1 && (
            <div className="mb-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
              <span className="text-[11px] font-mono uppercase tracking-widest text-amber-300/60 block">
                ✦ Unspoken Midnights (Tap to talk):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {STARTER_PROMPTS.map((starter) => (
                  <button
                    key={starter}
                    type="button"
                    onClick={() => handleSend(starter)}
                    className="text-left text-xs text-white/75 hover:text-white bg-white/[0.04] hover:bg-amber-500/15 border border-white/5 hover:border-amber-400/30 rounded-xl px-3 py-1.5 transition-all cursor-pointer"
                  >
                    &ldquo;{starter}&rdquo;
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          {messages.map((msg) => {
            const isUser = msg.sender === "user";
            const isHelplineRelated =
              !isUser &&
              (msg.text.includes("988") ||
                msg.text.includes("findahelpline") ||
                msg.text.includes("741741"));

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isUser ? "items-end" : "items-start"} animate-fade-in`}
              >
                <div className="flex items-center gap-2 mb-1 px-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-white/30">
                    {isUser ? "You" : "Solas"}
                  </span>
                  <span className="text-[9px] text-white/20">•</span>
                  <span className="text-[9px] text-white/30">{msg.timestamp}</span>
                </div>

                <div
                  className={`relative max-w-[90%] sm:max-w-[82%] rounded-2xl p-4 text-sm leading-relaxed ${
                    isUser
                      ? "bg-gradient-to-br from-amber-600/25 via-indigo-900/35 to-black/60 border border-amber-400/25 text-white/95 rounded-tr-sm shadow-lg shadow-amber-950/20"
                      : "bg-white/[0.03] border border-white/10 text-neutral-200 font-serif leading-relaxed rounded-tl-sm selection:bg-amber-400/30"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>

                  {/* Crisis Lifeline Direct Quick-Access Card */}
                  {isHelplineRelated && (
                    <div className="mt-3 p-3 rounded-xl bg-amber-500/10 border border-amber-400/30 space-y-2 font-sans not-italic text-xs">
                      <div className="flex items-center gap-2 text-amber-300 font-semibold">
                        <HeartHandshake className="w-4 h-4 text-amber-400" />
                        <span>Immediate Human Support (Free & Confidential 24/7)</span>
                      </div>
                      <div className="flex flex-wrap gap-2 text-[11px] pt-1">
                        <a
                          href="tel:988"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-400/20 text-amber-200 border border-amber-400/30 hover:bg-amber-400/30 transition-colors"
                        >
                          <PhoneCall className="w-3 h-3" />
                          <span>Call 988 (US/CA)</span>
                        </a>
                        <a
                          href="sms:741741?body=HOME"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 text-white border border-white/20 hover:bg-white/20 transition-colors"
                        >
                          <span>Text HOME to 741741</span>
                        </a>
                        <a
                          href="https://findahelpline.com"
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 text-white/90 border border-white/20 hover:bg-white/20 transition-colors"
                        >
                          <span>Global: findahelpline.com</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  )}

                  {/* If user message, offer quick button to ascend to star */}
                  {isUser && onOpenReleaseModal && (
                    <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-end">
                      <button
                        type="button"
                        onClick={() => handleAscendToStar(msg.text)}
                        className="text-[10px] font-sans font-medium text-amber-300/80 hover:text-amber-200 flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Star className="w-3 h-3 text-amber-300" />
                        <span>Ascend this to an Eternal Star</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Typing indicator */}
          {isWhispering && (
            <div className="flex items-start gap-2.5 animate-fade-in">
              <div className="rounded-2xl px-4 py-3 bg-white/[0.03] border border-white/10 flex items-center gap-2.5 text-xs text-amber-300/80 font-serif italic">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                <span>Solas is reflecting with you...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <footer className="shrink-0 p-3 sm:p-4 border-t border-white/10 bg-black/70 backdrop-blur-md">
          <div className="relative flex items-end gap-2 bg-white/[0.03] border border-white/10 rounded-2xl p-2 focus-within:border-amber-400/40 focus-within:ring-1 focus-within:ring-amber-400/40 transition-all">
            <textarea
              ref={inputRef}
              rows={2}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                isWhispering
                  ? "Solas is speaking with you... (You can type your next thought anytime)"
                  : "Talk with Solas... (Press Enter to send, Shift+Enter for new line)"
              }
              className="flex-1 bg-transparent px-2 py-1 text-sm text-white placeholder-white/30 focus:outline-none resize-none scrollbar-none leading-relaxed"
            />

            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                handleSend();
                inputRef.current?.focus();
              }}
              disabled={!inputText.trim() || isWhispering}
              className={`p-2.5 rounded-xl transition-all shrink-0 cursor-pointer ${
                inputText.trim() && !isWhispering
                  ? "bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-neutral-950 font-semibold shadow-lg shadow-amber-400/25 hover:brightness-110 active:scale-95"
                  : "bg-white/5 text-white/20 cursor-not-allowed"
              }`}
            >
              {isWhispering ? (
                <Loader2 className="w-4 h-4 animate-spin text-neutral-900" />
              ) : (
                <Send className="w-4 h-4 text-neutral-950" />
              )}
            </button>
          </div>

          <div className="mt-2 flex flex-col sm:flex-row items-center justify-between text-[10px] text-white/35 px-1 gap-1 text-center sm:text-left">
            <span>Conversations are preserved on your device so you never lose them.</span>
            <span className="hidden sm:inline">Solas Haven Sanctuary AI</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
