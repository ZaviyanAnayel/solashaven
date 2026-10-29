/**
 * SanctuaryIntro — poetic, always-visible homepage introduction.
 * Gives seekers (and search engines) a real <h1> plus a quiet
 * footer of sanctuary pathways, without breaking the immersive
 * full-screen constellation experience.
 *
 * Retention fix (2026-10-29): the hero now carries ONE primary
 * action directly under the tagline ("Release a Star", opening the
 * same ReleaseModal the header button opens), a secondary
 * "Read a Sample Star" action that opens a real existing initial
 * star through the same reader path as clicking a star on the
 * canvas, and a prominent hint pill explaining the interaction
 * (drag = explore, scroll = zoom — the page does not scroll down
 * to more sections, click a star = read it). The wrapper stays
 * pointer-events-none so the cosmos remains draggable; only the
 * buttons re-enable pointer events.
 */
interface SanctuaryIntroProps {
  onRelease: () => void;
  onReadSampleStar: () => void;
  sampleRecipient?: string;
}

export default function SanctuaryIntro({
  onRelease,
  onReadSampleStar,
  sampleRecipient,
}: SanctuaryIntroProps) {
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
          into a living cosmos shared with souls around the world.
        </p>

        {/* Single primary CTA + sample-star action — the only interactive hero elements */}
        <div className="pointer-events-auto mt-4 sm:mt-5 flex flex-col sm:flex-row items-center gap-2.5 sm:gap-3">
          <button
            type="button"
            onClick={onRelease}
            className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 rounded-full bg-gradient-to-r from-amber-200 via-amber-100 to-amber-300 text-neutral-950 font-bold text-sm sm:text-base tracking-wide shadow-xl shadow-amber-300/30 ring-2 ring-amber-100/60 hover:shadow-amber-300/50 hover:scale-[1.03] active:scale-[0.98] transition-all duration-200 cursor-pointer"
          >
            <span aria-hidden="true">✦</span>
            <span>Release a Star</span>
          </button>
          <button
            type="button"
            onClick={onReadSampleStar}
            className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-full bg-white/10 border border-white/25 text-white font-semibold text-xs sm:text-sm tracking-wide backdrop-blur-sm hover:bg-white/20 hover:border-white/40 active:scale-[0.98] transition-all duration-200 cursor-pointer"
          >
            <span aria-hidden="true">★</span>
            <span>Read a Sample Star</span>
          </button>
        </div>
        {sampleRecipient && (
          <p className="mt-2 text-xs text-white/50">
            Sample star: &ldquo;{sampleRecipient}&rdquo;
          </p>
        )}

        {/* Plain-English interaction hint — prominent, right under the hero actions */}
        <p className="mt-3 sm:mt-4 max-w-xl rounded-full bg-black/50 border border-white/15 px-4 py-2 text-[11px] sm:text-xs leading-relaxed text-white/80 backdrop-blur-sm">
          Drag to explore the cosmos &middot; Scroll to zoom in and out
          (this page does not scroll down to more sections) &middot; Click
          any star to read it
        </p>
      </div>
    </>
  );
}
