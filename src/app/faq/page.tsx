import React from "react";
import Link from "next/link";
import { HelpCircle, ArrowLeft, Sparkles, Shield, Globe, Heart } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Frequently Asked Questions | Solas Haven",
  description: "Comprehensive guidance, privacy assurances, and scientific foundations of the Solas Haven emotional sanctuary.",
  alternates: {
    canonical: "https://www.solashaven.com/faq",
  },
};

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ_LIST: FAQItem[] = [
  {
    question: "Is my letter or confession completely anonymous?",
    answer:
      "Yes. Solas Haven requires no account registration, email address, password, or phone number. We do not track personal IP addresses or create behavioral profiles. When you release a letter, it exists only as an anonymous star in the celestial constellation."
  },
  {
    question: "What languages can I write in?",
    answer:
      "Every language on Earth is welcomed into this sanctuary. Whether you write in English, Spanish, French, Arabic, Urdu, Japanese, Hindi, German, or your regional mother tongue, human grief and love transcend linguistic barriers."
  },
  {
    question: "What happens to my letter once released?",
    answer:
      "Your letter is assigned 3D celestial coordinates based on its emotional constellation (Grief, Love, Silent Prayer, Forgiveness, or Unsent Words). It drifts gently in the obsidian starlight, where passersby can read it, send you light, or leave sacred prayers."
  },
  {
    question: "How does the 432Hz sound therapy work?",
    answer:
      "The sanctuary includes a procedural Web Audio acoustic bed tuned harmonically to 432Hz. Filtered through low-pass nodes, this frequency promotes parasympathetic activation (vagal relaxation), calming rapid heart rates and helping users reflect with deeper peace."
  },
  {
    question: "Can I delete or remove a letter I have posted?",
    answer:
      "Because letters are posted anonymously without accounts, you can request manual removal at any time by emailing business@zaviyanllc.com with the recipient name, exact text, and approximate release timestamp. Our human ethics desk will review and remove it within 24 hours."
  },
  {
    question: "What are 'Prayers & Whispers'?",
    answer:
      "When someone reads your star and feels touched by your story, they can offer a sacred prayer (such as a dove, candle, or white heart) or write gentle words of comfort. These prayers ascend directly into your star, increasing its celestial brightness."
  },
  {
    question: "How does content moderation protect the sanctuary?",
    answer:
      "Every letter and prayer passes through a multi-tiered ethical filter before ascending. We strictly prohibit harassment, hate speech, explicit profanity, commercial spam, and content promoting self-harm. The platform remains a peaceful sanctuary of solace."
  },
  {
    question: "Is Solas Haven free to use?",
    answer:
      "Yes, the sanctuary is 100% free and open to everyone worldwide. We believe emotional catharsis and silent prayers should never be behind a paywall."
  },
  {
    question: "How is the platform funded and maintained?",
    answer:
      "Solas Haven is maintained by Zaviyan and supported through non-intrusive, ethical contextual advertising (such as Google AdSense) and philanthropic donations, allowing the servers and audio streaming to remain completely free for individuals in need."
  },
  {
    question: "Is Solas Haven a substitute for professional mental healthcare?",
    answer:
      "No. While expressive writing provides documented emotional relief, it is not clinical psychotherapy. Anyone experiencing severe distress, acute depression, or crisis is encouraged to contact professional 24/7 lifelines (such as 988 in the US/Canada or 111 in the UK)."
  }
];

export default function FAQPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": FAQ_LIST.map((item) => ({
      "@type": "Question",
      "name": item.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.answer
      }
    }))
  };

  return (
    <main className="min-h-screen bg-[#030408] text-white selection:bg-amber-400/30">
      {/* Background Ambience */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-0 right-1/4 w-[700px] h-[500px] bg-amber-500/10 rounded-full blur-[140px]" />
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

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
            Zaviyan • Knowledge Sanctuary
          </div>
        </div>

        {/* Title */}
        <header className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-300 text-xs font-mono mb-4">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>SANCTUARY GUIDANCE & ETHICS</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-serif font-bold text-white tracking-tight mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-base text-neutral-300/80 font-serif leading-relaxed">
            Everything you need to know about releasing letters, zero-knowledge privacy, acoustic sound therapy, and sanctuary governance.
          </p>
        </header>

        {/* FAQ Accordion / Cards */}
        <div className="space-y-4">
          {FAQ_LIST.map((item, idx) => (
            <div
              key={idx}
              className="p-5 sm:p-6 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-amber-400/30 transition-colors"
            >
              <h2 className="text-base sm:text-lg font-serif font-semibold text-white/95 mb-2.5 flex items-start gap-2.5">
                <span className="text-amber-300 font-mono text-sm shrink-0 mt-0.5">
                  {(idx + 1).toString().padStart(2, "0")}.
                </span>
                <span>{item.question}</span>
              </h2>
              <p className="text-xs sm:text-sm text-neutral-300/85 leading-relaxed font-serif pl-7">
                {item.answer}
              </p>
            </div>
          ))}
        </div>

        {/* Footer Support Desk */}
        <div className="mt-14 p-6 rounded-3xl bg-amber-400/[0.04] border border-amber-400/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <h3 className="text-base font-serif font-semibold text-amber-300 mb-1">
              Have an Unanswered Question?
            </h3>
            <p className="text-xs text-neutral-300/80 font-serif">
              Our human desk responds to every inquiry with empathy and care.
            </p>
          </div>
          <a
            href="mailto:business@zaviyanllc.com"
            className="px-5 py-2.5 rounded-full bg-amber-300 text-black font-medium text-xs hover:brightness-110 transition-all shrink-0"
          >
            Contact Human Desk
          </a>
        </div>

        {/* Footer Navigation */}
        <div className="mt-12 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-white/50">
          <Link href="/about" className="hover:text-amber-300 underline underline-offset-4">
            ← About Sanctuary & Science
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
