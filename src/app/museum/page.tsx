"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  Bookmark,
  Landmark,
  Feather,
  Sparkles,
  Flame,
  Search,
  Globe2,
  Copy,
  Check,
  X,
  Share2,
  ChevronRight,
  ShieldCheck,
  Compass,
  Volume2,
  VolumeX,
  Plus
} from "lucide-react";

interface Adoption {
  id: string;
  adopter: string;
  adopterCity?: string;
  adoptedYear?: string;
  role: string;
  completionNote?: string;
  completedContent: string;
}

interface Exhibit {
  id: string;
  title: string;
  wing: "words" | "canvases" | "echoes" | "engines" | "relics";
  wingLabel: string;
  categoryIcon: string;
  creator: string;
  originCity: string;
  originYear: string;
  originalLang: string;
  candles: number;
  surrenderNote: string;
  seedSnippet: string;
  status: "awaiting-guardian" | "partially-adopted";
  adoptions: Adoption[];
}

const DEFAULT_SOLAS_EXHIBITS: Exhibit[] = [
  {
    id: "ex-001",
    title: "The Last Bookstore at the Edge of Jupiter",
    wing: "words",
    wingLabel: "Wing of Unwritten Words",
    categoryIcon: "📜",
    creator: "Julian Vane",
    originCity: "New York, USA",
    originYear: "2020",
    originalLang: "English",
    candles: 342,
    status: "partially-adopted",
    surrenderNote: "I wrote 4 chapters during the 2020 lockdowns in my tiny Astoria apartment. When the world reopened, rent doubled, and I took two jobs. The ending has been trapped in my head for six years. Please let these characters see the light of day.",
    seedSnippet: "Chapter 1: The Pressurized Reading Room\n\nThe gravity was dialed to one-third Terran standard, which made the leather-bound copies of Shakespeare drift slightly off their walnut shelves whenever the outer atmospheric shuttles docked...\n\nOld man Keith wiped the frosted viewport with a sleeve of his pressure suit. Outside, the red storm of Jupiter boiled in silence, an angry crimson eye three times the size of the forgotten Earth. In his trembling hands, he held the last physical copy of Gabriel García Márquez's *One Hundred Years of Solitude* that had survived the Europa Exodus.\n\n'Keith,' whispered the AI terminal from the brass speaker. 'A vessel is signaling on an obsolete radio frequency. They don't have fuel. They only have books to trade.'",
    adoptions: [
      {
        id: "ad-001-1",
        adopter: "Elena Rostova",
        adopterCity: "Prague, Czech Republic",
        adoptedYear: "2026",
        role: "Completed Climax & Ending",
        completionNote: "I stumbled upon Keith's story and wept. I spent two weeks finishing the remaining 5 chapters. The vessel that docked carried poems written on dried palm leaves.",
        completedContent: "Chapter 5 (The Exchange):\n\nThe airlock hissed open, venting a mist of cold nitrogen. Keith lowered his visor. Through the vapor walked a girl no older than nineteen, her magnetic boots clacking against the rusted steel grating. She did not ask for water or oxygen. In her canvas satchel, wrapped in thermal foil, lay a hand-bound diary with words penned in blue ink that had survived eighty million miles of void.\n\n'We found this drifting near Io,' she said softly. 'Teach me how to read it.'"
      }
    ]
  },
  {
    id: "ex-002",
    title: "Shikwa-e-Khaak (Lament of the Ancient Dust)",
    wing: "words",
    wingLabel: "Wing of Unwritten Words",
    categoryIcon: "📜",
    creator: "Mirza Daniyal",
    originCity: "Lahore, Pakistan",
    originYear: "2022",
    originalLang: "Urdu",
    candles: 519,
    status: "awaiting-guardian",
    surrenderNote: "I wanted to write an epic 12-stanza poem about the dying calligraphy masters inside the Walled City of Lahore. At stanza 5, my hands began shaking from arthritis. I could not finish. Adopt it; let your own language carry my rhythm.",
    seedSnippet: "یہ شہر جو خاموش کہانی کا نگیں ہے\nہر اینٹ کے سینے میں کوئی خواب دفیں ہے\n\nقلم کا نوک پہ صدیوں کی تھکن بولتی ہے\nپرانی گلیوں کی ہوا راز کوئی کھولتی ہے\n\nوہ کاتب جو راتوں کو چراغ جلاتا تھا\nحروف کے پردے میں زمانے کو سکھاتا تھا\n\nاب ہاتھ لرزتے ہیں، سیاہی بھی خفا ہے\nکوئی تو بتائے کہ قلم کا درد کیا ہے؟\n\n(Translation:\nThis ancient city, a jewel of silent lore,\nBeneath each brick lies a dream buried evermore.\nUpon the reed pen's tip speaks the fatigue of centuries,\nThe breeze through narrow alleys whispers forgotten mysteries...\nMy hands now tremble, the black ink turns cold in the stone;\nWho will stand up and make this unwritten sorrow their own?)",
    adoptions: []
  },
  {
    id: "ex-003",
    title: "Solar Leviathan (Whale of the Chromosphere)",
    wing: "canvases",
    wingLabel: "Wing of Unfinished Canvases",
    categoryIcon: "🎨",
    creator: "Kenji Takahashi",
    originCity: "Kyoto, Japan",
    originYear: "2021",
    originalLang: "Japanese",
    candles: 488,
    status: "awaiting-guardian",
    surrenderNote: "I spent three months drafting the anatomy and solar dorsal fins of a mechanical space leviathan swimming through solar flares. Then my studio burnt down. I only had this digital sketch saved on a thumb drive. I lost the courage to color it. Take it and breathe fire into its skin.",
    seedSnippet: "ARCHITECTURAL BLUEPRINT & ARTIST NOTES:\n- Creature: Cetus Helios Type-9\n- Dorsal Spines: Photovoltaic sails harvesting hydrogen fusion waves from the Sun's coronal loops.\n- Eye: Deep obsidian camera lens with golden aperture rings.\n- Missing Layers: Coronal glow gradients, nebular dust particles, scale textures, and deep-space background.",
    adoptions: []
  },
  {
    id: "ex-004",
    title: "Midnight on 4th & Broadway (Acoustic Memo)",
    wing: "echoes",
    wingLabel: "Wing of Unheard Echoes",
    categoryIcon: "🎵",
    creator: "Maeve Callahan",
    originCity: "Nashville, TN, USA",
    originYear: "2019",
    originalLang: "English",
    candles: 612,
    status: "partially-adopted",
    surrenderNote: "Recorded on an iPhone 7 in 2019 at 2:40 AM outside an empty honky-tonk in pouring rain. 4 acoustic chords and a chorus melody that gave me chills. I tried writing the second verse for 3 years, but I moved to Texas and sold my guitar. Someone finish my song.",
    seedSnippet: "Tempo: 74 BPM • Key: D Major (Capo 2nd Fret)\nChords: D - Gmaj7 - Bm11 - Aadd9\n\n[Chorus Recorded Audio Clip]:\n'And the neon signs are bleeding in the puddle on the floor,\nYou said you loved me yesterday, but who are you tonight?\nThe rain don't wash away the things we said behind that door,\nWe're almost home, we're almost free, we're almost out of sight...'\n\n[Status]: Needs Verse 2, Bridge, and Outro Harmonies.",
    adoptions: [
      {
        id: "ad-004-1",
        adopter: "Liam O'Connor",
        adopterCity: "Dublin, Ireland",
        adoptedYear: "2026",
        role: "Wrote Verse 2 & Cello Accompaniment",
        completionNote: "Maeve's voice memo felt like an old friend calling across the ocean. I added an Irish bouzouki and wrote Verse 2 about walking the morning fog.",
        completedContent: "[Verse 2]:\n'The street sweepers are waking up the ghosts along the lane,\nThe diner serves cold coffee to the ones who missed the train,\nI kept your broken locket in the pocket of my coat,\nIt never had your picture, just a five-word pencil note...'"
      }
    ]
  },
  {
    id: "ex-005",
    title: "ZeroGrav: Asteroid Courier (Canvas Engine)",
    wing: "engines",
    wingLabel: "Wing of Abandoned Engines",
    categoryIcon: "💻",
    creator: "Marcus Thorne",
    originCity: "Seattle, WA, USA",
    originYear: "2023",
    originalLang: "English",
    candles: 295,
    status: "awaiting-guardian",
    surrenderNote: "I built the entire Newton-inertia flight physics and thruster mechanics in vanilla JavaScript. It felt so satisfying to drift between space rocks. But when I got promoted at my corporate job, I ran out of time to build the delivery stations and enemy pirate AI. The code is yours.",
    seedSnippet: "// ZeroGrav Courier - Core Inertia Loop\nclass CourierShip {\n  constructor(x, y) {\n    this.pos = { x, y };\n    this.vel = { x: 0, y: 0 };\n    this.angle = -Math.PI / 2;\n    this.thrustPower = 0.15;\n  }\n  applyThrust() {\n    this.vel.x += Math.cos(this.angle) * this.thrustPower;\n    this.vel.y += Math.sin(this.angle) * this.thrustPower;\n  }\n  update() {\n    this.pos.x += this.vel.x;\n    this.pos.y += this.vel.y;\n  }\n}",
    adoptions: []
  },
  {
    id: "ex-006",
    title: "O Coração da Floresta (Heart of the Rainforest)",
    wing: "canvases",
    wingLabel: "Wing of Unfinished Canvases",
    categoryIcon: "🎨",
    creator: "Iara Silva",
    originCity: "Manaus, Brazil",
    originYear: "2022",
    originalLang: "Portuguese",
    candles: 387,
    status: "awaiting-guardian",
    surrenderNote: "I sketched the emerald water serpent rising from the Rio Negro mist. I wanted to symbolize the resilience of indigenous spirits. But when floods ruined our home workshop, my watercolor palette was destroyed. The serpent is waiting for its jungle.",
    seedSnippet: "Artist Concept Brief:\n- Medium: Ink & Watercolor on raw cotton paper.\n- Subject: 'Boitatá' — The fire-eyed serpent that protects the forest from flames.\n- Foreground: Incomplete ink scales with glowing bioluminescent yellow spots.\n- Background: A vast canopy untouched by axes, shrouded in midnight rain.",
    adoptions: []
  },
  {
    id: "ex-007",
    title: "The Solitary Observatory of Saint Jude",
    wing: "relics",
    wingLabel: "Wing of Unspun Relics",
    categoryIcon: "🧵",
    creator: "Dr. Arthur Pendelton",
    originCity: "Galway, Ireland",
    originYear: "2018",
    originalLang: "English",
    candles: 421,
    status: "awaiting-guardian",
    surrenderNote: "Architectural blueprint for an off-grid cliffside library and star-observatory built entirely of dry-stacked granite and recycled stained glass. I drafted the basement and dome gears before my eyes deteriorated. May an architect somewhere build it, or write its story.",
    seedSnippet: "SPECIFICATION SHEET 18-B:\n- Location: Cliffs of Moher, facing the gale-force Atlantic westerlies.\n- Foundation: Deep granite anchors drilled 14 meters into coastal slate.\n- Telescope Mount: German equatorial mount counterbalanced by seawater cisterns.\n- Unfinished Section: The wind-deflecting roof petals and glass spiral staircase.",
    adoptions: []
  }
];

export default function AlmostMuseumPage() {
  const [exhibits, setExhibits] = useState<Exhibit[]>(DEFAULT_SOLAS_EXHIBITS);
  const [selectedWing, setSelectedWing] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modals state
  const [activeAdoptionExhibit, setActiveAdoptionExhibit] = useState<Exhibit | null>(null);
  const [activeLineageExhibit, setActiveLineageExhibit] = useState<Exhibit | null>(null);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Adoption Form State
  const [adopterName, setAdopterName] = useState("");
  const [adopterCity, setAdopterCity] = useState("");
  const [adoptRole, setAdoptRole] = useState("Completed Climax & Ending");
  const [completionNote, setCompletionNote] = useState("");
  const [completedContent, setCompletedContent] = useState("");

  // Deposit Form State
  const [depTitle, setDepTitle] = useState("");
  const [depCreator, setDepCreator] = useState("");
  const [depCity, setDepCity] = useState("");
  const [depYear, setDepYear] = useState(new Date().getFullYear().toString());
  const [depLang, setDepLang] = useState("English");
  const [depWing, setDepWing] = useState<Exhibit["wing"]>("words");
  const [depSurrender, setDepSurrender] = useState("");
  const [depSeed, setDepSeed] = useState("");

  // Audio state
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [audioCtx, setAudioCtx] = useState<AudioContext | null>(null);

  // Translation cache map
  const [translatedMap, setTranslatedMap] = useState<Record<string, { surrenderNote: string; seedSnippet: string }>>({});

  useEffect(() => {
    try {
      const stored = localStorage.getItem("solas_almost_museum_relics");
      if (stored) {
        setExhibits(JSON.parse(stored));
      }
    } catch (e) {
      console.warn("Storage load error", e);
    }
  }, []);

  const saveExhibits = (newExhibits: Exhibit[]) => {
    setExhibits(newExhibits);
    try {
      localStorage.setItem("solas_almost_museum_relics", JSON.stringify(newExhibits));
    } catch (e) {
      console.error(e);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  const playChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3); // A5
      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 2.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 2.6);
    } catch (e) {}
  };

  const toggleAmbiance = () => {
    try {
      if (isAudioPlaying && audioCtx) {
        audioCtx.close();
        setAudioCtx(null);
        setIsAudioPlaying(false);
        return;
      }

      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const master = ctx.createGain();
      master.gain.setValueAtTime(0.06, ctx.currentTime);
      master.connect(ctx.destination);

      [55.0, 82.4, 110.0].forEach((freq) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        g.gain.setValueAtTime(0.03, ctx.currentTime);
        osc.connect(g);
        g.connect(master);
        osc.start();
      });

      setAudioCtx(ctx);
      setIsAudioPlaying(true);
    } catch (e) {}
  };

  const handleLightCandle = (id: string) => {
    playChime();
    const updated = exhibits.map((ex) => {
      if (ex.id === id) {
        return { ...ex, candles: (ex.candles || 0) + 1 };
      }
      return ex;
    });
    saveExhibits(updated);
    showToast("🕯️ You lit a sacred candle for this dream.");
  };

  const handleCopySeed = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast("📋 Seed material copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleTranslateCard = async (ex: Exhibit) => {
    if (translatedMap[ex.id]) {
      const next = { ...translatedMap };
      delete next[ex.id];
      setTranslatedMap(next);
      return;
    }

    showToast("🌐 Translating confession into English...");
    try {
      const res = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
          ex.surrenderNote.substring(0, 400)
        )}&langpair=auto|en`
      );
      const data = await res.json();
      if (data?.responseData?.translatedText) {
        setTranslatedMap((prev) => ({
          ...prev,
          [ex.id]: {
            surrenderNote: data.responseData.translatedText,
            seedSnippet: ex.seedSnippet
          }
        }));
        showToast("Translated into English!");
      }
    } catch (e) {
      showToast("Original text retained.");
    }
  };

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!depTitle || !depSurrender || !depSeed) {
      alert("Please provide the title, surrender confession, and seed snippet.");
      return;
    }

    const wingLabels: Record<Exhibit["wing"], string> = {
      words: "Wing of Unwritten Words",
      canvases: "Wing of Unfinished Canvases",
      echoes: "Wing of Unheard Echoes",
      engines: "Wing of Abandoned Engines",
      relics: "Wing of Unspun Relics"
    };

    const icons: Record<Exhibit["wing"], string> = {
      words: "📜",
      canvases: "🎨",
      echoes: "🎵",
      engines: "💻",
      relics: "🧵"
    };

    const newExhibit: Exhibit = {
      id: "ex-" + Date.now().toString(36),
      title: depTitle,
      creator: depCreator || "Anonymous Dreamer",
      originCity: depCity || "Earth Coordinates",
      originYear: depYear || new Date().getFullYear().toString(),
      originalLang: depLang || "English",
      wing: depWing,
      wingLabel: wingLabels[depWing] || "Sacred Wing",
      categoryIcon: icons[depWing] || "🏛️",
      candles: 1,
      status: "awaiting-guardian",
      surrenderNote: depSurrender,
      seedSnippet: depSeed,
      adoptions: []
    };

    const updated = [newExhibit, ...exhibits];
    saveExhibits(updated);
    setIsDepositModalOpen(false);
    setDepTitle("");
    setDepSurrender("");
    setDepSeed("");
    showToast("🏛️ Your unfinished dream is enshrined in The Almost Museum forever.");
  };

  const handleAdoptionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAdoptionExhibit || !adopterName || !completedContent) {
      alert("Please provide your name and the completed continuation.");
      return;
    }

    const newAdoption: Adoption = {
      id: "ad-" + Date.now().toString(36),
      adopter: adopterName,
      adopterCity: adopterCity || "Citizen of Earth",
      adoptedYear: new Date().getFullYear().toString(),
      role: adoptRole,
      completionNote,
      completedContent
    };

    const updated = exhibits.map((ex) => {
      if (ex.id === activeAdoptionExhibit.id) {
        return {
          ...ex,
          status: "partially-adopted" as const,
          adoptions: [newAdoption, ...ex.adoptions]
        };
      }
      return ex;
    });

    saveExhibits(updated);
    setActiveAdoptionExhibit(null);
    setAdopterName("");
    setAdopterCity("");
    setCompletionNote("");
    setCompletedContent("");
    showToast("🌿 Adoption Bound! Lineage Tree updated.");
  };

  const handleDownloadCertificate = (exhibit: Exhibit, adoption: Adoption) => {
    const canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 800;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Background
    const bgGrad = ctx.createLinearGradient(0, 0, 1200, 800);
    bgGrad.addColorStop(0, "#08080c");
    bgGrad.addColorStop(0.5, "#10111a");
    bgGrad.addColorStop(1, "#050608");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1200, 800);

    // Border
    ctx.strokeStyle = "#e8b05c";
    ctx.lineWidth = 4;
    ctx.strokeRect(30, 30, 1140, 740);

    ctx.strokeStyle = "rgba(232, 176, 92, 0.3)";
    ctx.lineWidth = 1;
    ctx.strokeRect(42, 42, 1116, 716);

    // Header
    ctx.fillStyle = "#e8b05c";
    ctx.font = "italic 22px Georgia, serif";
    ctx.textAlign = "center";
    ctx.fillText("T H E   A L M O S T   M U S E U M", 600, 95);

    ctx.font = "14px sans-serif";
    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    ctx.fillText("CERTIFICATE OF OPEN PROVENANCE & DUAL GUARDIANSHIP", 600, 125);

    // Title
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 38px Georgia, serif";
    ctx.fillText(`“${exhibit.title}”`, 600, 220);

    ctx.font = "16px sans-serif";
    ctx.fillStyle = "#e8b05c";
    ctx.fillText(exhibit.wingLabel.toUpperCase(), 600, 255);

    // Columns
    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
    ctx.font = "12px sans-serif";
    ctx.fillText("GENESIS SEED CREATOR", 350, 340);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 26px Georgia, serif";
    ctx.fillText(exhibit.creator, 350, 380);

    ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
    ctx.font = "14px sans-serif";
    ctx.fillText(`${exhibit.originCity} • Circa ${exhibit.originYear}`, 350, 410);

    ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
    ctx.font = "12px sans-serif";
    ctx.fillText("ADOPTED & COMPLETED BY", 850, 340);

    ctx.fillStyle = "#e8b05c";
    ctx.font = "bold 26px Georgia, serif";
    ctx.fillText(adoption.adopter, 850, 380);

    ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
    ctx.font = "14px sans-serif";
    ctx.fillText(`${adoption.adopterCity || "Citizen of Earth"} • ${adoption.adoptedYear || "2026"}`, 850, 410);

    // Quote
    ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
    ctx.fillRect(150, 490, 900, 140);
    ctx.strokeStyle = "rgba(232, 176, 92, 0.2)";
    ctx.strokeRect(150, 490, 900, 140);

    ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
    ctx.font = "italic 16px Georgia, serif";
    ctx.fillText("“What one hand began in sorrow, another has fulfilled in hope.”", 600, 550);

    ctx.font = "12px sans-serif";
    ctx.fillStyle = "rgba(232, 176, 92, 0.7)";
    ctx.fillText("STEWARDED BY ZAVIYAN • SOLAS HAVEN SANCTUARY", 600, 715);

    const link = document.createElement("a");
    link.download = `TheAlmostMuseum-${exhibit.title.replace(/\s+/g, "_")}-Plaque.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
    showToast("📜 Dual-Provenance Certificate Downloaded!");
  };

  const filteredExhibits = useMemo(() => {
    return exhibits.filter((ex) => {
      const matchWing = selectedWing === "all" || ex.wing === selectedWing;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        ex.title.toLowerCase().includes(q) ||
        ex.creator.toLowerCase().includes(q) ||
        ex.originCity.toLowerCase().includes(q) ||
        ex.surrenderNote.toLowerCase().includes(q);
      return matchWing && matchSearch;
    });
  }, [exhibits, selectedWing, searchQuery]);

  const totalCandles = useMemo(() => {
    return exhibits.reduce((acc, curr) => acc + (curr.candles || 0), 0);
  }, [exhibits]);

  const totalAdoptions = useMemo(() => {
    return exhibits.reduce((acc, curr) => acc + (curr.adoptions ? curr.adoptions.length : 0), 0);
  }, [exhibits]);

  return (
    <div className="min-h-screen bg-[#020204] text-white selection:bg-amber-400/30 selection:text-amber-100 font-sans relative overflow-x-hidden">
      {/* Top Navigation Bar */}
      <header className="border-b border-white/10 bg-black/60 backdrop-blur-2xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 flex-wrap">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-xs text-white/70 hover:text-white transition-colors px-3 py-1.5 rounded-full bg-white/5 border border-white/10"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Constellation</span>
            </Link>

            <Link
              href="/library"
              className="flex items-center gap-1.5 text-xs text-white/70 hover:text-amber-300 transition-colors px-3 py-1.5 rounded-full bg-white/5 border border-white/10"
            >
              <Bookmark className="w-3.5 h-3.5 text-amber-400" />
              <span>Library</span>
            </Link>

            <Link
              href="/chronicles"
              className="hidden sm:flex items-center gap-1.5 text-xs text-white/70 hover:text-amber-300 transition-colors px-3 py-1.5 rounded-full bg-white/5 border border-white/10"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-300" />
              <span>Chronicles</span>
            </Link>

            <div className="flex items-center gap-1.5 text-xs text-amber-200 px-3 py-1.5 rounded-full bg-amber-400/15 border border-amber-400/30 font-medium">
              <Landmark className="w-3.5 h-3.5 text-amber-300" />
              <span>The Almost Museum</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleAmbiance}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                isAudioPlaying
                  ? "bg-amber-400/20 border-amber-400/50 text-amber-300"
                  : "bg-white/5 border-white/10 text-white/70 hover:text-white"
              }`}
            >
              {isAudioPlaying ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              <span>{isAudioPlaying ? "Ambiance: On" : "Ambiance: Mute"}</span>
            </button>

            <button
              onClick={() => setIsDepositModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-amber-400 to-amber-600 text-neutral-950 shadow-md shadow-amber-400/20 hover:scale-[1.02] transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Deposit Relic</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Header */}
      <section className="relative px-4 py-16 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-serif uppercase tracking-widest mb-4">
          <Landmark className="w-3.5 h-3.5" />
          <span>Sanctuary of the Unfinished</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-bold tracking-tight text-white mb-4 leading-tight">
          Where abandoned dreams are not buried, <em className="text-amber-300 not-italic">but adopted.</em>
        </h1>

        <p className="text-sm sm:text-base text-white/70 font-serif leading-relaxed max-w-2xl mx-auto mb-8">
          Across the Earth, millions of novels stall at chapter four. Melodies fade inside voice memos. Canvases gather dust in attics. Surrender what you could not finish—or become the guardian who brings another soul&apos;s vision into the light.
        </p>

        {/* Live Counters */}
        <div className="grid grid-cols-3 gap-3 max-w-md mx-auto p-3 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-xl">
          <div>
            <div className="text-xl sm:text-2xl font-serif font-bold text-amber-300">{exhibits.length}</div>
            <div className="text-[10px] uppercase tracking-wider text-white/50">Relics Preserved</div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-serif font-bold text-emerald-400">{totalAdoptions}</div>
            <div className="text-[10px] uppercase tracking-wider text-white/50">Adoptions Bound</div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-serif font-bold text-amber-400">{totalCandles.toLocaleString()}</div>
            <div className="text-[10px] uppercase tracking-wider text-white/50">Candles Lit</div>
          </div>
        </div>
      </section>

      {/* Wings Filter Bar & Search */}
      <section className="max-w-7xl mx-auto px-4 mb-10">
        <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {[
            { id: "all", label: "All Wings", icon: "🏛️" },
            { id: "words", label: "Unwritten Words", icon: "📜" },
            { id: "canvases", label: "Unfinished Canvases", icon: "🎨" },
            { id: "echoes", label: "Unheard Echoes", icon: "🎵" },
            { id: "engines", label: "Abandoned Engines", icon: "💻" },
            { id: "relics", label: "Unspun Relics", icon: "🧵" }
          ].map((w) => (
            <button
              key={w.id}
              onClick={() => setSelectedWing(w.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                selectedWing === w.id
                  ? "bg-amber-400/20 border-amber-400/50 text-amber-200 shadow-md shadow-amber-400/10"
                  : "bg-white/[0.03] border-white/10 text-white/60 hover:text-white hover:bg-white/[0.07]"
              } border`}
            >
              <span>{w.icon}</span>
              <span>{w.label}</span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="max-w-xl mx-auto mt-4 relative">
          <Search className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search relics by title, creator, city, or keywords in confession..."
            className="w-full pl-10 pr-4 py-2.5 rounded-full bg-white/[0.04] border border-white/10 text-xs text-white placeholder-white/40 focus:outline-none focus:border-amber-400/50"
          />
        </div>
      </section>

      {/* The Exhibits Grid */}
      <main className="max-w-7xl mx-auto px-4 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExhibits.map((ex) => {
            const isTranslated = !!translatedMap[ex.id];
            const surrenderText = isTranslated ? translatedMap[ex.id].surrenderNote : ex.surrenderNote;

            return (
              <article
                key={ex.id}
                className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 flex flex-col justify-between hover:border-amber-400/30 transition-all shadow-xl shadow-black/40 group relative"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[11px] font-mono text-white/50 bg-white/5 px-2.5 py-0.5 rounded-full border border-white/5">
                      {ex.categoryIcon} {ex.wingLabel}
                    </span>
                    {ex.adoptions.length > 0 ? (
                      <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                        🌿 {ex.adoptions.length} Adoption{ex.adoptions.length > 1 ? "s" : ""}
                      </span>
                    ) : (
                      <span className="text-[11px] font-mono text-amber-300 bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/20">
                        ⏳ Awaiting Guardian
                      </span>
                    )}
                  </div>

                  <div className="text-[11px] text-white/40 mb-1">
                    📍 {ex.originCity} • Circa {ex.originYear} • <span className="text-amber-300/80">{ex.originalLang}</span>
                  </div>

                  <h3 className="text-lg font-serif font-bold text-white group-hover:text-amber-200 transition-colors mb-1">
                    “{ex.title}”
                  </h3>
                  <p className="text-xs text-white/60 mb-4">
                    Conceived by <strong className="text-amber-300 font-semibold">{ex.creator}</strong>
                  </p>

                  {/* Confession Box */}
                  <div className="rounded-xl bg-amber-400/[0.04] border-l-2 border-amber-400 p-3.5 mb-4">
                    <div className="flex items-center justify-between text-[10px] uppercase font-mono text-amber-300 mb-1.5">
                      <span>The Surrender Confession:</span>
                      <button
                        onClick={() => handleTranslateCard(ex)}
                        className="hover:text-white transition-colors underline"
                      >
                        {isTranslated ? "↺ Original" : "🌐 Translate to EN"}
                      </button>
                    </div>
                    <p className="text-xs font-serif italic text-white/80 leading-relaxed">
                      “{surrenderText}”
                    </p>
                  </div>

                  {/* Seed Excerpt */}
                  <div className="rounded-xl bg-black/40 border border-white/5 p-3 mb-4">
                    <div className="flex items-center justify-between text-[10px] font-mono text-white/40 mb-1.5">
                      <span>SEED MATERIAL</span>
                      <button
                        onClick={() => handleCopySeed(ex.id, ex.seedSnippet)}
                        className="flex items-center gap-1 hover:text-amber-300 transition-colors"
                      >
                        {copiedId === ex.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedId === ex.id ? "Copied" : "Copy"}</span>
                      </button>
                    </div>
                    <pre className="text-[11px] font-mono text-white/70 max-h-28 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                      {ex.seedSnippet}
                    </pre>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-2 mt-auto">
                  <button
                    onClick={() => handleLightCandle(ex.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-amber-400/10 border border-white/10 text-xs text-white/80 hover:text-amber-300 transition-all cursor-pointer"
                    title="Light a candle for this dream"
                  >
                    <span>🕯️</span>
                    <span className="font-mono">{ex.candles}</span>
                  </button>

                  <div className="flex items-center gap-2">
                    {ex.adoptions.length > 0 && (
                      <button
                        onClick={() => setActiveLineageExhibit(ex)}
                        className="px-3 py-1.5 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-medium transition-all"
                      >
                        🌿 Lineage ({ex.adoptions.length})
                      </button>
                    )}

                    <button
                      onClick={() => setActiveAdoptionExhibit(ex)}
                      className="px-3.5 py-1.5 rounded-full bg-amber-400 hover:bg-amber-300 text-neutral-950 text-xs font-semibold shadow-md shadow-amber-400/20 transition-all cursor-pointer"
                    >
                      Adopt Seed ➔
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </main>

      {/* ==========================================================================
          MODAL 1: Deposit Relic
          ========================================================================== */}
      {isDepositModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="bg-[#0b0c11] border border-amber-400/30 rounded-2xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl">
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-serif font-bold text-white">The Surrender Chamber</h3>
                <p className="text-xs text-amber-300 font-serif italic">Entrust your unfinished work to the sanctuary</p>
              </div>
              <button
                onClick={() => setIsDepositModalOpen(false)}
                className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleDepositSubmit} className="p-5 overflow-y-auto space-y-4">
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-amber-300 font-mono mb-1">
                  Title of Relic *
                </label>
                <input
                  type="text"
                  required
                  value={depTitle}
                  onChange={(e) => setDepTitle(e.target.value)}
                  placeholder="e.g. The Clockmaker's Unfinished Daughter"
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-amber-300 font-mono mb-1">
                    Your Name / Pseudonym
                  </label>
                  <input
                    type="text"
                    value={depCreator}
                    onChange={(e) => setDepCreator(e.target.value)}
                    placeholder="e.g. Maya Chen"
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-amber-300 font-mono mb-1">
                    City / Country
                  </label>
                  <input
                    type="text"
                    value={depCity}
                    onChange={(e) => setDepCity(e.target.value)}
                    placeholder="e.g. Austin, Texas, USA"
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-amber-300 font-mono mb-1">
                    Year Conceived
                  </label>
                  <input
                    type="text"
                    value={depYear}
                    onChange={(e) => setDepYear(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-amber-300 font-mono mb-1">
                    Museum Wing *
                  </label>
                  <select
                    value={depWing}
                    onChange={(e) => setDepWing(e.target.value as Exhibit["wing"])}
                    className="w-full px-3 py-2 rounded-xl bg-[#12131a] border border-white/10 text-xs text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="words">📜 Wing of Unwritten Words</option>
                    <option value="canvases">🎨 Wing of Unfinished Canvases</option>
                    <option value="echoes">🎵 Wing of Unheard Echoes</option>
                    <option value="engines">💻 Wing of Abandoned Engines</option>
                    <option value="relics">🧵 Wing of Unspun Relics</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-amber-300 font-mono mb-1">
                  The Surrender Confession (Why did you stop?) *
                </label>
                <textarea
                  required
                  rows={3}
                  value={depSurrender}
                  onChange={(e) => setDepSurrender(e.target.value)}
                  placeholder="Tell future guardians why this was abandoned. What broke your momentum?"
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white font-serif italic focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-amber-300 font-mono mb-1">
                  The Unfinished Seed Material *
                </label>
                <textarea
                  required
                  rows={5}
                  value={depSeed}
                  onChange={(e) => setDepSeed(e.target.value)}
                  placeholder="Paste chapters, paragraphs, lyrics, chords, or code here..."
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="p-4 rounded-xl bg-amber-400/5 border border-amber-400/20 text-[11px] text-white/70">
                <span className="text-amber-300 font-semibold block mb-0.5">Perpetual Open Provenance:</span>
                Depositing this work grants humanity the right to adopt and finish it under Creative Commons (CC-BY 4.0). You retain lifelong recognition as the Genesis Creator.
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsDepositModalOpen(false)}
                  className="px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 text-xs text-white/70"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 text-neutral-950 font-semibold text-xs shadow-lg shadow-amber-400/20"
                >
                  Enshrine in Museum ➔
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==========================================================================
          MODAL 2: Adopt Seed
          ========================================================================== */}
      {activeAdoptionExhibit && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="bg-[#0b0c11] border border-amber-400/30 rounded-2xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl">
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-serif font-bold text-white">The Adoption Chamber</h3>
                <p className="text-xs text-amber-300 font-serif italic">
                  Adopting “{activeAdoptionExhibit.title}”
                </p>
              </div>
              <button
                onClick={() => setActiveAdoptionExhibit(null)}
                className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAdoptionSubmit} className="p-5 overflow-y-auto space-y-4">
              <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-[11px] font-mono text-white/60 max-h-24 overflow-y-auto">
                <div className="text-[10px] text-amber-300 uppercase mb-1">Seed Snippet:</div>
                {activeAdoptionExhibit.seedSnippet}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-amber-300 font-mono mb-1">
                    Your Guardian Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={adopterName}
                    onChange={(e) => setAdopterName(e.target.value)}
                    placeholder="e.g. Elena Rostova"
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-amber-300 font-mono mb-1">
                    Your City / Country
                  </label>
                  <input
                    type="text"
                    value={adopterCity}
                    onChange={(e) => setAdopterCity(e.target.value)}
                    placeholder="e.g. Prague, Czech Republic"
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-amber-300 font-mono mb-1">
                  Your Contribution Role *
                </label>
                <select
                  value={adoptRole}
                  onChange={(e) => setAdoptRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#12131a] border border-white/10 text-xs text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="Completed Climax & Ending">🌿 Completed Climax & Ending</option>
                  <option value="Wrote Alternate Ending">🔀 Wrote Alternate Ending</option>
                  <option value="Full Orchestration & Second Verse">🎵 Full Orchestration & Second Verse</option>
                  <option value="Built Working Prototype">💻 Built Working Prototype</option>
                  <option value="Painted Background & Color">🎨 Painted Background & Color</option>
                  <option value="Continuation / Chapter 2">📖 Continuation / Next Chapter</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-amber-300 font-mono mb-1">
                  Guardian&apos;s Reflection Note
                </label>
                <input
                  type="text"
                  value={completionNote}
                  onChange={(e) => setCompletionNote(e.target.value)}
                  placeholder="What drew you to this seed? How did it feel to finish it?"
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-amber-300 font-mono mb-1">
                  Your Completed Work *
                </label>
                <textarea
                  required
                  rows={6}
                  value={completedContent}
                  onChange={(e) => setCompletedContent(e.target.value)}
                  placeholder="Write or paste your completion, ending, or continuation here..."
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveAdoptionExhibit(null)}
                  className="px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 text-xs text-white/70"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 text-neutral-950 font-semibold text-xs shadow-lg shadow-amber-400/20"
                >
                  Bind Adoption to Lineage ➔
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==========================================================================
          MODAL 3: Lineage Tree
          ========================================================================== */}
      {activeLineageExhibit && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="bg-[#0b0c11] border border-amber-400/30 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl">
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-serif font-bold text-white">The Lineage Tree</h3>
                <p className="text-xs text-amber-300 font-serif italic">The genealogy of hands that touched this creation</p>
              </div>
              <button
                onClick={() => setActiveLineageExhibit(null)}
                className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-6">
              {/* Root Genesis */}
              <div className="p-4 rounded-xl bg-amber-400/10 border border-amber-400/30 text-center">
                <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-950 bg-amber-300 px-2.5 py-0.5 rounded-full font-bold">
                  Genesis Seed
                </span>
                <h4 className="text-xl font-serif font-bold text-white mt-2">“{activeLineageExhibit.title}”</h4>
                <p className="text-xs text-white/60">
                  Begun by <strong>{activeLineageExhibit.creator}</strong> ({activeLineageExhibit.originCity}, {activeLineageExhibit.originYear})
                </p>
                <p className="text-xs font-serif italic text-white/80 mt-2">“{activeLineageExhibit.surrenderNote}”</p>
              </div>

              {/* Trunk */}
              <div className="flex flex-col items-center">
                <div className="w-0.5 h-6 bg-gradient-to-b from-amber-400 to-emerald-400" />
                <span className="text-[10px] uppercase font-mono tracking-widest text-emerald-400">
                  Branches of Adoption ({activeLineageExhibit.adoptions.length})
                </span>
              </div>

              {/* Adoption Branches */}
              <div className="space-y-4">
                {activeLineageExhibit.adoptions.map((ad) => (
                  <div key={ad.id} className="p-4 rounded-xl bg-emerald-500/[0.04] border border-emerald-500/20 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase tracking-wider font-mono text-emerald-400 font-semibold">
                        🌿 {ad.role}
                      </span>
                      <span className="text-[11px] text-white/40 font-mono">
                        {ad.adopterCity} • {ad.adoptedYear}
                      </span>
                    </div>

                    <h5 className="text-sm font-serif font-bold text-white">{ad.adopter}</h5>

                    {ad.completionNote && (
                      <p className="text-xs font-serif italic text-white/70">“{ad.completionNote}”</p>
                    )}

                    <pre className="p-3 rounded-lg bg-black/40 text-[11px] font-mono text-white/70 max-h-28 overflow-y-auto whitespace-pre-wrap">
                      {ad.completedContent}
                    </pre>

                    <button
                      onClick={() => handleDownloadCertificate(activeLineageExhibit, ad)}
                      className="w-full mt-2 py-2 rounded-xl bg-amber-400/10 hover:bg-amber-400 border border-amber-400/30 hover:border-amber-400 text-amber-300 hover:text-neutral-950 text-xs font-semibold transition-all"
                    >
                      📜 Download Dual-Provenance Plaque (PNG)
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 border-t border-white/10 flex justify-end">
              <button
                onClick={() => setActiveLineageExhibit(null)}
                className="px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 text-xs text-white/70"
              >
                Close Chamber
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-full bg-[#141622] border border-amber-400/50 text-white text-xs shadow-2xl shadow-amber-400/20 animate-fade-in">
          {toastMessage}
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black/60 py-10 px-4 text-center">
        <div className="max-w-4xl mx-auto space-y-3">
          <div className="text-xs font-serif uppercase tracking-widest text-amber-300">The Almost Museum</div>
          <p className="text-xs font-serif italic text-white/60">
            “Nothing truly begun in beauty is ever wasted; it is merely waiting for the hands of another soul.”
          </p>

          <div className="flex items-center justify-center gap-3 text-xs text-white/40 pt-2 font-mono">
            <span>Zaviyan:</span>
            <a href="https://webdevworker.com" target="_blank" rel="noopener noreferrer" className="hover:text-amber-300 transition-colors">
              WebDevWorker
            </a>
            <span>•</span>
            <a href="https://calcworker.com" target="_blank" rel="noopener noreferrer" className="hover:text-amber-300 transition-colors">
              CalcWorker
            </a>
            <span>•</span>
            <Link href="/" className="hover:text-amber-300 transition-colors">
              Solas Haven
            </Link>
          </div>
          <div className="text-[10px] text-white/30 pt-1">
            Operated by Zaviyan • Open Provenance CC-BY 4.0
          </div>
        </div>
      </footer>
    </div>
  );
}
