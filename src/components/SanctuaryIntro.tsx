/**
 * SanctuaryIntro — poetic, always-visible homepage introduction.
 * Gives seekers (and search engines) a real <h1> plus a quiet
 * footer of sanctuary pathways, without breaking the immersive
 * full-screen constellation experience.
 */
export default function SanctuaryIntro() {
  return (
    <>
      {/* Whispered hero over the starfield — pointer-events-none so the cosmos stays touchable */}
      <div className="pointer-events-none absolute inset-x-0 top-20 sm:top-24 z-10 flex flex-col items-center px-6 text-center">
        <h1 className="font-serif text-2xl sm:text-4xl text-white/90 tracking-wide leading-snug">
          Solas Haven
        </h1>
        <p className="mt-2 max-w-xl font-serif text-sm sm:text-base text-white/55 leading-relaxed">
          The celestial sanctuary of unspoken words &amp; silent prayers —
          release grief, unsaid goodbyes and secret confessions as stars
          into a living cosmos shared across 195+ nations.
        </p>
      </div>

      {/* Quiet footer pathways */}
      <nav
        aria-label="Sanctuary pathways"
        className="absolute inset-x-0 bottom-3 z-10 flex justify-center pointer-events-none"
      >
        <div className="pointer-events-auto flex items-center gap-4 text-[11px] tracking-[0.2em] uppercase text-white/35">
          <a href="/about" className="hover:text-white/70 transition-colors">
            About
          </a>
          <span aria-hidden="true">✦</span>
          <a href="/chronicles" className="hover:text-white/70 transition-colors">
            Chronicles
          </a>
          <span aria-hidden="true">✦</span>
          <a href="/library" className="hover:text-white/70 transition-colors">
            Library
          </a>
          <span aria-hidden="true">✦</span>
          <a href="/faq" className="hover:text-white/70 transition-colors">
            FAQ
          </a>
        </div>
      </nav>
    </>
  );
}
