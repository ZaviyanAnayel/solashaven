import { ChronicleArticle } from "./chronicles/types";
import { SEO_GENERATED_STORIES } from "./chronicles/seoGeneratedStories";
import { GRIEF_STORIES } from "./chronicles/griefStories";
import { LOVE_STORIES } from "./chronicles/loveStories";
import { PRAYER_STORIES } from "./chronicles/prayerStories";
import { FORGIVENESS_STORIES } from "./chronicles/forgivenessStories";
import { FAMILY_STORIES } from "./chronicles/familyStories";
import { FUTURE_STORIES } from "./chronicles/futureStories";
import { ENCOUNTER_STORIES } from "./chronicles/encounterStories";
import { REGRETS_STORIES } from "./chronicles/regretsStories";
import { DAILY_STORIES } from "./chronicles/dailyStories";

export type { ChronicleArticle };

export const CHRONICLES: ChronicleArticle[] = [
  ...SEO_GENERATED_STORIES,
  ...GRIEF_STORIES,
  ...LOVE_STORIES,
  ...PRAYER_STORIES,
  ...FORGIVENESS_STORIES,
  ...FAMILY_STORIES,
  ...FUTURE_STORIES,
  ...ENCOUNTER_STORIES,
  ...REGRETS_STORIES,
  ...DAILY_STORIES,
];

export function getChronicleBySlug(slug: string): ChronicleArticle | undefined {
  return CHRONICLES.find((article) => article.slug === slug);
}

export function getRelatedChronicles(currentSlug: string, limit = 3): ChronicleArticle[] {
  const current = getChronicleBySlug(currentSlug);
  if (!current) return CHRONICLES.slice(0, limit);

  // Prefer same category, then fallback to others
  const sameCategory = CHRONICLES.filter(
    (a) => a.category === current.category && a.slug !== currentSlug
  );
  if (sameCategory.length >= limit) {
    return sameCategory.slice(0, limit);
  }
  const others = CHRONICLES.filter(
    (a) => a.category !== current.category && a.slug !== currentSlug
  );
  return [...sameCategory, ...others].slice(0, limit);
}