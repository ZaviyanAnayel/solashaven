export type LetterCategory = "grief" | "love" | "confession" | "prayer" | "forgiveness" | "unsent";

export interface Whisper {
  id: string;
  text: string;
  createdAt: string;
  locationName?: string;
}

export type ReleaseRitual = "star" | "lantern" | "crane";

export interface Letter {
  id: string;
  recipient: string;
  content: string;
  category: LetterCategory;
  createdAt: string;
  locationName: string;
  lightCount: number;
  whispers?: Whisper[];
  language?: string;
  resonantLetterId?: string;
  resonanceNote?: string;
  releaseRitual?: ReleaseRitual;
  isTimeCapsule?: boolean;
  igniteDate?: string;
  x: number;
  y: number;
  size: number;
  color: string;
  glowColor: string;
  pulseSpeed: number;
  pulsePhase: number;
  isNew?: boolean;
}

export interface CategoryInfo {
  id: LetterCategory | "all";
  label: string;
  description: string;
  color: string;
  glowColor: string;
  icon: string;
}

export const CATEGORIES: CategoryInfo[] = [
  {
    id: "all",
    label: "All Constellations",
    description: "Every silent prayer, goodbye, and unsaid truth across the cosmos",
    color: "#ffffff",
    glowColor: "rgba(255, 255, 255, 0.4)",
    icon: "✨"
  },
  {
    id: "grief",
    label: "Grief & Goodbyes",
    description: "For those who crossed the veil, and the hearts left behind",
    color: "#38bdf8",
    glowColor: "rgba(56, 189, 248, 0.5)",
    icon: "🕊️"
  },
  {
    id: "love",
    label: "Unspoken Love",
    description: "Words buried under fear, lost chances, and enduring devotion",
    color: "#f43f5e",
    glowColor: "rgba(244, 63, 94, 0.5)",
    icon: "🌹"
  },
  {
    id: "confession",
    label: "My Confession",
    description: "Deep anonymous confessions, secret burdens, and hidden truths released into starlight",
    color: "#e879f9",
    glowColor: "rgba(232, 121, 249, 0.55)",
    icon: "🗝️"
  },
  {
    id: "prayer",
    label: "Silent Prayers",
    description: "Whispers sent directly to the Divine and the Universe in quiet hours",
    color: "#fbbf24",
    glowColor: "rgba(251, 191, 36, 0.5)",
    icon: "🕯️"
  },
  {
    id: "forgiveness",
    label: "Forgiveness & Healing",
    description: "Letting go of anger, unburdening guilt, and forgiving oneself",
    color: "#34d399",
    glowColor: "rgba(52, 211, 153, 0.5)",
    icon: "🍃"
  },
  {
    id: "unsent",
    label: "Secret Truths",
    description: "What you could never say out loud to parents, friends, or the world",
    color: "#c084fc",
    glowColor: "rgba(192, 132, 252, 0.5)",
    icon: "🌌"
  }
];