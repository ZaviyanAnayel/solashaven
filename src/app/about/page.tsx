import React from "react";
import Link from "next/link";
import { Sparkles, ArrowLeft, Heart, ShieldCheck, Globe2, BookOpen, Feather } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About the Sanctuary | Solas Haven",
  description: "The architecture, psychology, and ethical mission behind Solas Haven, governed by Zaviyan.",
  alternates: {
    canonical: "https://www.solashaven.com/about",
  },
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#030408] text-white selection:bg-amber-400/30">
      {/* Background Ambience */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-amber-500/10 rounded-full blur-[140px]" />
      </div>

      <div className="relative max-w-3xl mx-auto px-5 py-12 sm:py-20">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-12">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs text-white/60 hover:text-white transition-colors px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Constellation</span>
          </Link>
          <div className="text-[11px] font-mono text-amber-300/80">
            Zaviyan • Sanctuary Architecture
          </div>
        </div>

        {/* Title */}
        <header className="mb-14 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-300 text-xs font-mono mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>FOUNDATIONAL MISSION & ETHICS</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-serif font-bold text-white tracking-tight leading-tight mb-4">
            About Solas Haven
          </h1>
          <p className="text-base sm:text-lg text-neutral-300/80 font-serif leading-relaxed">
            A digital sanctuary where unspoken grief, unconfessed love, and silent prayers across 195+ nations transcend the noise of the internet to become eternal stars.
          </p>
        </header>

        {/* Article Body */}
        <div className="space-y-12 text-sm sm:text-base text-neutral-300 leading-relaxed font-serif">
          {/* Section 1 */}
          <section className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-serif font-semibold text-white tracking-tight flex items-center gap-2.5">
              <Feather className="w-5 h-5 text-amber-300" />
              <span>1. The Origin & Philosophical Need</span>
            </h2>
            <p>
              In our hyper-connected contemporary world, humanity communicates more frequently than in any preceding era, yet we convey less of what truly matters. Social networks are optimized for performance, vanity, controversy, and rapid consumption. There exists scarcely any quiet corner of the digital sphere specifically engineered for vulnerability, reverence, and honest closure.
            </p>
            <p>
              <strong>Solas Haven</strong> was engineered by <strong>Zaviyan</strong> to fill this existential void. It operates as a global emotional archive where unaddressed messages—a letter to an estranged parent, an apology to a childhood friend, a prayer for an unborn child, or a silent grief for someone who passed away too soon—are cast into a 3D procedural cosmos.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-serif font-semibold text-white tracking-tight flex items-center gap-2.5">
              <BookOpen className="w-5 h-5 text-amber-300" />
              <span>2. The Psychological Science of Catharsis</span>
            </h2>
            <p>
              The architecture of this sanctuary is rooted in foundational clinical psychology. In the late 1980s, Dr. James W. Pennebaker at the University of Texas demonstrated that when individuals translate traumatic, unacknowledged, or emotionally overwhelming memories into structured language, profound neurobiological shifts occur.
            </p>
            <p>
              When a heavy thought is withheld inside the mind, the prefrontal cortex must continuously expend metabolic glucose to inhibit the emotional response. This biological repression elevates baseline cortisol and blood pressure. By typing these unspoken truths into the sanctuary, users trigger <strong>cognitive re-appraisal</strong>: the narrative moves from an ambiguous, tormenting internal loop into an external, observed artifact.
            </p>
          </section>

          {/* Section 3 */}
          <section className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-serif font-semibold text-white tracking-tight flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-amber-300" />
              <span>3. Zero-Knowledge Anonymity & Radical Privacy</span>
            </h2>
            <p>
              Authentic vulnerability requires absolute safety. Unlike conventional platforms, Solas Haven does not require email registration, passwords, social logins, or phone numbers.
            </p>
            <p>
              We operate under a strict <strong>Zero-Profiling Covenant</strong>. We do not sell user data, track individual identities across the web, or monetize personal disclosures through commercial profiling. Letters are stored anonymously and displayed as coordinates in our celestial sphere.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-serif font-semibold text-white tracking-tight flex items-center gap-2.5">
              <Globe2 className="w-5 h-5 text-amber-300" />
              <span>4. Solfeggio 432Hz Sound Architecture</span>
            </h2>
            <p>
              The interactive audio engine integrated into the sanctuary generates procedural acoustic tones in real-time via the Web Audio API. Centered on the harmonic <strong>432Hz tuning</strong> and filtered through low-pass nodes at 540Hz, the auditory backdrop stimulates parasympathetic nervous system activation.
            </p>
            <p>
              Ascension chimes—tuned to the Solfeggio 528Hz frequency—accompany letter releases and sacred prayers, creating a visceral sense of release and spiritual closure.
            </p>
          </section>

          {/* Section 5: Crisis Care */}
          <section className="p-6 rounded-3xl bg-amber-400/[0.04] border border-amber-400/20 space-y-3">
            <h2 className="text-lg font-serif font-semibold text-amber-300 flex items-center gap-2">
              <Heart className="w-4 h-4 text-amber-400" />
              <span>5. Mental Health Care & Crisis Resources</span>
            </h2>
            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
              While Solas Haven provides an expressive outlet, it is not a substitute for clinical psychiatric care or emergency intervention. If you or someone you know is in acute distress or experiencing thoughts of self-harm, please reach out to professional lifelines immediately:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs font-mono">
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
                <span className="text-amber-300 block font-semibold">USA & Canada:</span>
                <span className="text-white">Dial <strong>988</strong> (Lifeline)</span>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
                <span className="text-amber-300 block font-semibold">United Kingdom:</span>
                <span className="text-white">Call <strong>111</strong> or text <strong>85258</strong></span>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
                <span className="text-amber-300 block font-semibold">Australia:</span>
                <span className="text-white">Call <strong>13 11 14</strong> (Lifeline)</span>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
                <span className="text-amber-300 block font-semibold">Worldwide:</span>
                <span className="text-white">Visit <strong>befrienders.org</strong></span>
              </div>
            </div>
          </section>

          {/* Section 6: Governance */}
          <section className="space-y-4 pt-4 border-t border-white/10">
            <h2 className="text-xl sm:text-2xl font-serif font-semibold text-white tracking-tight">
              6. Governance & Contact
            </h2>
            <p>
              Solas Haven is published, maintained, and legally stewarded by <strong>Zaviyan</strong>. For editorial inquiries, academic research partnerships, or content removal requests, please contact our human desk at{" "}
              <a href="mailto:business@zaviyanllc.com" className="text-amber-300 underline underline-offset-4">
                business@zaviyanllc.com
              </a>.
            </p>
          </section>
          {/* Section 7: Zaviyan Platforms */}
          <section className="space-y-4 pt-6 border-t border-white/10">
            <h2 className="text-xl sm:text-2xl font-serif font-semibold text-white tracking-tight">
              7. Zaviyan Platforms
            </h2>
            <p className="text-sm text-white/70 leading-relaxed font-serif">
              Solas Haven is engineered under <strong>Zaviyan</strong>. Explore our sister digital platforms:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <a
                href="https://webdevworker.com"
                target="_blank"
                rel="noopener"
                className="p-5 rounded-2xl border border-white/10 bg-white/[0.02] hover:border-amber-300/40 hover:bg-white/[0.05] transition-all group block"
              >
                <div className="flex items-center justify-between text-amber-200 font-semibold text-sm">
                  <span>⚡ WebDevWorker</span>
                  <span className="text-xs text-white/40 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">↗</span>
                </div>
                <p className="text-xs text-white/60 font-sans mt-2 leading-relaxed">
                  100+ Free Client-Side Web Developer Utilities, CSS Generators, &amp; On-Demand AI Micro-App Builder.
                </p>
              </a>
              <a
                href="https://calcworker.com"
                target="_blank"
                rel="noopener"
                className="p-5 rounded-2xl border border-white/10 bg-white/[0.02] hover:border-amber-300/40 hover:bg-white/[0.05] transition-all group block"
              >
                <div className="flex items-center justify-between text-amber-200 font-semibold text-sm">
                  <span>🧮 CalcWorker</span>
                  <span className="text-xs text-white/40 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">↗</span>
                </div>
                <p className="text-xs text-white/60 font-sans mt-2 leading-relaxed">
                  High-Precision Computational Financial Workstation for IRS Taxes, LLC vs S-Corp, Real Estate &amp; Wealth.
                </p>
              </a>
            </div>
          </section>
        </div>

        {/* Footer Navigation */}
        <div className="mt-16 pt-8 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-white/50">
          <Link href="/faq" className="hover:text-amber-300 underline underline-offset-4">
            Frequently Asked Questions →
          </Link>
          <Link href="/privacy" className="hover:text-amber-300 underline underline-offset-4">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-amber-300 underline underline-offset-4">
            Terms of Sanctuary
          </Link>
        </div>
      </div>
    </main>
  );
}
