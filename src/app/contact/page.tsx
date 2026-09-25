"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, Check, Send, Sparkles, Shield, MessageSquare } from "lucide-react";

export default function ContactPage() {
  const [copied, setCopied] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("general");
  const [message, setMessage] = useState("");

  const handleCopyEmail = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText("business@zaviyanllc.com");
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !message.trim()) return;
    // Actually send: compose a prefilled email to the Zaviyan desk via the
    // visitor's own email client (no backend — never pretend a message was sent).
    const topicLabel =
      {
        general: "General Feedback / Inquiry",
        removal: "Content / Star Removal Request",
        partnership: "Partnership & Media",
        technical: "Bug / Technical Issue",
      }[subject] || subject;
    const mailto =
      `mailto:business@zaviyanllc.com` +
      `?subject=${encodeURIComponent(`[SolasHaven] ${topicLabel}`)}` +
      `&body=${encodeURIComponent(`From: ${email.trim()}\nTopic: ${topicLabel}\n\n${message.trim()}`)}`;
    window.location.href = mailto;
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#020204] text-white selection:bg-amber-400/30 selection:text-amber-100">
      {/* Top Header */}
      <header className="border-b border-white/10 bg-black/40 backdrop-blur-xl sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs text-white/60 hover:text-white transition-colors px-3 py-1.5 rounded-full bg-white/5 border border-white/10"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Sanctuary</span>
          </Link>
          <span className="text-xs text-amber-300/80 font-mono">ZAVIYAN</span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-300 text-xs font-mono mb-4">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>DIRECT SANCTUARY SUPPORT</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-semibold text-white/95 mb-3">
            Contact & Support
          </h1>
          <p className="text-sm text-neutral-400 max-w-md mx-auto leading-relaxed">
            Have a question, feedback, partnership inquiry, or need a letter removed from the cosmos? We are here to help.
          </p>
        </div>

        {/* Primary Contact Card */}
        <div className="p-6 sm:p-8 rounded-3xl border border-white/15 bg-white/[0.03] backdrop-blur-xl mb-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs text-amber-300/80 font-mono block mb-1">OFFICIAL EMAIL DESK</span>
            <h3 className="text-xl font-medium text-white">business@zaviyanllc.com</h3>
            <p className="text-xs text-white/50 mt-1">Direct inquiries to Zaviyan administration</p>
          </div>
          <button
            onClick={handleCopyEmail}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 text-xs text-white font-medium transition-all"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Email Copied!</span>
              </>
            ) : (
              <>
                <Mail className="w-3.5 h-3.5 text-amber-300" />
                <span>Copy Email Address</span>
              </>
            )}
          </button>
        </div>

        {/* Facebook Page Card */}
        <a
          href="https://www.facebook.com/solashavenweb/"
          target="_blank"
          rel="noopener"
          className="p-6 sm:p-8 rounded-3xl border border-white/15 bg-white/[0.03] backdrop-blur-xl mb-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-amber-300/40 transition-all no-underline"
        >
          <div>
            <span className="text-xs text-amber-300/80 font-mono block mb-1">FOLLOW THE SANCTUARY</span>
            <h3 className="text-xl font-medium text-white">Solas Haven on Facebook</h3>
            <p className="text-xs text-white/50 mt-1">Daily reflections, new library additions & sanctuary updates</p>
          </div>
          <span className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 text-xs text-white font-medium transition-all">
            <span className="text-amber-300">📘</span>
            <span>Follow Page</span>
          </span>
        </a>

        {/* Inquiries / Removal Form */}
        <div className="p-6 sm:p-8 rounded-3xl border border-white/10 bg-black/60">
          <h2 className="text-lg sm:text-xl font-serif font-medium text-white mb-2">
            Send a Direct Message
          </h2>
          <p className="text-xs text-white/50 mb-6">
            For content removal, please include the URL or exact title of the star.
          </p>

          {submitted ? (
            <div className="p-6 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-center animate-fade-in">
              <Sparkles className="w-6 h-6 text-emerald-300 mx-auto mb-2" />
              <h4 className="text-sm font-semibold text-emerald-200 mb-1">Message Ready to Send</h4>
              <p className="text-xs text-emerald-300/80 max-w-sm mx-auto">
                Your email app should now open with your message addressed to our team at Zaviyan. Just press send there.
                If nothing opened, email us directly at business@zaviyanllc.com.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-white/70 mb-1 tracking-wide">
                  YOUR EMAIL ADDRESS
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white placeholder-white/30 focus:outline-none focus:border-amber-400/50"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-white/70 mb-1 tracking-wide">
                  SUBJECT / TOPIC
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-neutral-900 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-400/50"
                >
                  <option value="general">General Feedback / Inquiry</option>
                  <option value="removal">Content / Star Removal Request</option>
                  <option value="partnership">Partnership & Media</option>
                  <option value="technical">Bug / Technical Issue</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-white/70 mb-1 tracking-wide">
                  MESSAGE DETAILS
                </label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="How can we assist you? Please be as specific as possible..."
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white placeholder-white/30 focus:outline-none focus:border-amber-400/50 resize-none leading-relaxed"
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-amber-300 to-amber-400 text-black font-medium text-xs hover:brightness-105 active:scale-[0.99] transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Inquiry to Zaviyan</span>
              </button>
            </form>
          )}
        </div>

        {/* Corporate Trust Badge */}
        <div className="mt-12 flex items-center justify-center gap-2 text-xs text-white/40 font-mono">
          <Shield className="w-3.5 h-3.5 text-amber-300" />
          <span>Operated by Zaviyan • Rapid Takedown Protocol Guaranteed</span>
        </div>
      </main>

      <footer className="border-t border-white/10 py-8 text-center text-xs text-white/30 tracking-widest font-mono uppercase">
        Solas Haven • Operated by Zaviyan • All Rights Reserved
      </footer>
    </div>
  );
}