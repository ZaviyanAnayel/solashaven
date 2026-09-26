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
    </>
  );
}
