"use client";

import React, { useState, useEffect, useRef } from "react";
import ConstellationCanvas from "../components/ConstellationCanvas";
import Header from "../components/Header";
import ReleaseModal from "../components/ReleaseModal";
import LetterReaderModal from "../components/LetterReaderModal";
import ResonanceToast from "../components/ResonanceToast";
import PrivacyModal from "../components/PrivacyModal";
import CelestialBlessingModal from "../components/CelestialBlessingModal";
import WhisperNotificationToast from "../components/WhisperNotificationToast";
import GlobalVigilOverlay from "../components/GlobalVigilOverlay";
import SacredBreathOverlay from "../components/SacredBreathOverlay";
import SacredStreakBanner from "../components/SacredStreakBanner";
import UserProfileModal from "../components/UserProfileModal";
import WhisperingWellModal from "../components/WhisperingWellModal";
import AiFloatingOrb from "../components/AiFloatingOrb";
import LibraryFloatingOrb from "../components/LibraryFloatingOrb";
import CandleSanctuaryModal from "../components/CandleSanctuaryModal";
import SanctuaryIntro from "../components/SanctuaryIntro";
import CreatorIntelPulse from "../components/CreatorIntelPulse";
import { useSoulProfile } from "../lib/useSoulProfile";
import { INITIAL_LETTERS } from "../lib/initialStars";
import { Letter, LetterCategory, Whisper } from "../lib/types";
import { soundEngine } from "../lib/audio";
import {
  loadPersistedStars,
  persistNewStar,
  syncStarsToAllTiers,
} from "../lib/starPersistence";

const STORAGE_KEY = "letters_to_eternity_v1";
const MY_STARS_KEY = "letters_to_eternity_my_stars_v1";

export default function HomePage() {
  const [letters, setLetters] = useState<Letter[]>(INITIAL_LETTERS);
  const [userStarIds, setUserStarIds] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<LetterCategory | "all">("all");
  const [searchLocation, setSearchLocation] = useState<string>("");
  const [selectedLetter, setSelectedLetter] = useState<Letter | null>(null);
  const [focusedStarId, setFocusedStarId] = useState<string | null>(null);
  const [isReleaseModalOpen, setIsReleaseModalOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [resonanceCategory, setResonanceCategory] = useState<LetterCategory | null>(null);
  const [newAscendingStar, setNewAscendingStar] = useState<Letter | null>(null);
  const [blessingLetter, setBlessingLetter] = useState<Letter | null>(null);

  // Iconic Features State: Global Vigil, Sacred Breath, Whispering Well & Profile
  const [isVigilOpen, setIsVigilOpen] = useState(false);
  const [vigilProgress, setVigilProgress] = useState(0);
  const [isBreathOpen, setIsBreathOpen] = useState(false);
  const [breathScale, setBreathScale] = useState(1.0);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isWellOpen, setIsWellOpen] = useState(false);
  const [isCandleSanctuaryOpen, setIsCandleSanctuaryOpen] = useState(false);
  const [prefilledReleaseText, setPrefilledReleaseText] = useState("");

  const {
    profile,
    updateProfile,
    recordStarRelease,
    recordVigil,
    recordBreath,
  } = useSoulProfile();

  // Whisper Notification State
  const [whisperNotification, setWhisperNotification] = useState<{
    starId: string;
    recipient: string;
    whisperText: string;
    fromLocation: string;
  } | null>(null);

  // Load and recover custom stars across all storage tiers on mount
  useEffect(() => {
    loadPersistedStars(INITIAL_LETTERS)
      .then(({ allStars, myStarIds }) => {
        setLetters(allStars);
        setUserStarIds(myStarIds);
      })
      .catch((err) => {
        console.warn("Could not load persisted stars:", err);
      });
  }, []);

  const hasShownWhisperNotificationRef = useRef(false);

  // Simulated live heavenly prayer received on user's star (runs ONLY ONCE per session after 25s)
  useEffect(() => {
    if (userStarIds.length > 0 && !hasShownWhisperNotificationRef.current) {
      hasShownWhisperNotificationRef.current = true;
      const timer = setTimeout(() => {
        const myStar = letters.find((l) => l.id === userStarIds[0]);
        if (myStar) {
          soundEngine.playLightShimmer();
          setWhisperNotification({
            starId: myStar.id,
            recipient: myStar.recipient,
            whisperText: "🕊️ May light wrap around your deepest wounds. You are loved.",
            fromLocation: "Kyoto, Japan"
          });

          // Auto-dismiss after 7 seconds so it never lingers or annoys the user
          setTimeout(() => {
            setWhisperNotification(null);
          }, 7000);
        }
      }, 25000);
      return () => clearTimeout(timer);
    }
  }, [userStarIds]);

  const handleToggleAudio = () => {
    const isPlaying = soundEngine.toggleAmbient();
    setIsAudioPlaying(isPlaying);
  };

  // Wander / Teleport: Flies camera to a random star and reveals it
  const handleWander = () => {
    if (letters.length === 0) return;
    soundEngine.playLightShimmer();

    const available = letters.filter((l) => l.id !== focusedStarId);
    const chosen = available[Math.floor(Math.random() * available.length)] || letters[0];

    setFocusedStarId(chosen.id);

    setTimeout(() => {
      setSelectedLetter(chosen);
    }, 850);
  };

  const handleLetterReleased = (newLetter: Letter) => {
    setNewAscendingStar(newLetter);

    const updatedUserStars = [newLetter.id, ...userStarIds];
    setUserStarIds(updatedUserStars);
    setLetters((prev) => [newLetter, ...prev.filter((l) => l.id !== newLetter.id)]);
    recordStarRelease();

    // Multi-tier persistence shield (localStorage mirrors + IndexedDB)
    persistNewStar(newLetter, true);

    // Open Celestial Blessing & Affirmation modal after star ascends
    setTimeout(() => {
      setBlessingLetter(newLetter);
    }, 1200);

    // Trigger Resonance Synapse toast
    setTimeout(() => {
      setResonanceCategory(newLetter.category);
    }, 3800);
  };

  const handleSendLight = (id: string) => {
    setLetters((prev) => {
      const updated = prev.map((l) =>
        l.id === id ? { ...l, lightCount: l.lightCount + 1 } : l
      );
      syncStarsToAllTiers(updated);
      return updated;
    });

    if (selectedLetter && selectedLetter.id === id) {
      setSelectedLetter((prev) =>
        prev ? { ...prev, lightCount: prev.lightCount + 1 } : null
      );
    }
  };

  const handleAddWhisper = (letterId: string, whisper: Whisper) => {
    setLetters((prev) => {
      const updated = prev.map((l) => {
        if (l.id === letterId) {
          const whispers = l.whispers ? [whisper, ...l.whispers] : [whisper];
          return { ...l, whispers };
        }
        return l;
      });

      syncStarsToAllTiers(updated);
      return updated;
    });

    if (selectedLetter && selectedLetter.id === letterId) {
      setSelectedLetter((prev) => {
        if (!prev) return null;
        const whispers = prev.whispers ? [whisper, ...prev.whispers] : [whisper];
        return { ...prev, whispers };
      });
    }
  };

  const handleFocusMyStar = () => {
    if (userStarIds.length === 0) return;
    const currentIndex = userStarIds.findIndex((id) => id === focusedStarId);
    const nextIndex = (currentIndex + 1) % userStarIds.length;
    const targetId = userStarIds[nextIndex];
    setFocusedStarId(targetId);
  };

  const handleAscensionComplete = () => {
    setNewAscendingStar(null);
  };

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-black select-none">
      {/* Top Luxury Header & Earth Search */}
      <Header
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        searchLocation={searchLocation}
        onSearchLocationChange={setSearchLocation}
        onOpenReleaseModal={() => setIsReleaseModalOpen(true)}
        onOpenPrivacyModal={() => setIsPrivacyModalOpen(true)}
        onWander={handleWander}
        isAudioPlaying={isAudioPlaying}
        onToggleAudio={handleToggleAudio}
        totalStarsCount={letters.length * 184 + 14200}
        userStarsCount={userStarIds.length}
        onFocusMyStar={handleFocusMyStar}
        onOpenVigil={() => setIsVigilOpen(true)}
        onOpenBreath={() => setIsBreathOpen(true)}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onOpenWell={() => setIsWellOpen(true)}
        onOpenCandles={() => setIsCandleSanctuaryOpen(true)}
      />

      {/* Poetic homepage intro — visible h1 + sanctuary pathways (SEO) */}
      <SanctuaryIntro />

      {/* Daily Presence Streak Capsule (Floating Bottom-Left) */}
      <SacredStreakBanner
        profile={profile}
        onOpenRelease={() => setIsReleaseModalOpen(true)}
        onOpenProfile={() => setIsProfileModalOpen(true)}
      />

      {/* Floating Starlight AI Companion Orb (Floating Bottom-Right with Circular Star Motion) */}
      <AiFloatingOrb onOpenAi={() => setIsWellOpen(true)} />

      {/* Floating Sanctuary Library & Light a Candle Orb (Floating Bottom-Left) */}
      <LibraryFloatingOrb onOpenCandles={() => setIsCandleSanctuaryOpen(true)} />

      {/* Living 3D/Canvas Constellation with Earth Search, Depth Drift, Breath Scaling & Shooting Stars */}
      <ConstellationCanvas
        letters={letters}
        selectedCategory={selectedCategory}
        searchLocation={searchLocation}
        userStarIds={userStarIds}
        focusedStarId={focusedStarId}
        onSelectLetter={setSelectedLetter}
        newAscendingStar={newAscendingStar}
        onAscensionComplete={handleAscensionComplete}
        breathScale={breathScale}
        vigilProgress={vigilProgress}
      />

      {/* Modals & Overlays */}
      <ReleaseModal
        isOpen={isReleaseModalOpen}
        onClose={() => {
          setIsReleaseModalOpen(false);
          setPrefilledReleaseText("");
        }}
        onLetterReleased={handleLetterReleased}
        prefilledContent={prefilledReleaseText}
      />

      {/* Celestial Spiritual Blessing Affirmation (Opens after releasing a star) */}
      <CelestialBlessingModal
        letter={blessingLetter}
        onClose={() => setBlessingLetter(null)}
      />

      <LetterReaderModal
        letter={selectedLetter}
        onClose={() => setSelectedLetter(null)}
        onSendLight={handleSendLight}
        onAddWhisper={handleAddWhisper}
        isUserStar={selectedLetter ? userStarIds.includes(selectedLetter.id) : false}
        allLetters={letters}
        onFocusResonantStar={(sisterId) => {
          setFocusedStarId(sisterId);
          soundEngine.playLightShimmer();
        }}
      />

      {/* Global Silent Vigil Overlay */}
      <GlobalVigilOverlay
        isOpen={isVigilOpen}
        onClose={() => setIsVigilOpen(false)}
        onVigilProgress={setVigilProgress}
      />

      {/* Sacred 4-7-8 Somatic Breathing Overlay */}
      <SacredBreathOverlay
        isOpen={isBreathOpen}
        onClose={() => setIsBreathOpen(false)}
        onBreathScale={setBreathScale}
      />

      {/* Whisper Received Notification */}
      <WhisperNotificationToast
        notification={whisperNotification}
        onClose={() => setWhisperNotification(null)}
        onViewStar={(id) => {
          const star = letters.find((l) => l.id === id);
          if (star) {
            setFocusedStarId(id);
            setSelectedLetter(star);
          }
        }}
      />

      {/* Sacred Privacy Modal */}
      <PrivacyModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
      />

      {/* Resonance Synapse Alert */}
      <ResonanceToast
        category={resonanceCategory}
        onClose={() => setResonanceCategory(null)}
      />

      {/* Soul Profile & Milestones Modal */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profile={profile}
        onSaveProfile={updateProfile}
      />

      {/* The Whispering Well (Midnight Confidential Sanctuary) */}
      <WhisperingWellModal
        isOpen={isWellOpen}
        onClose={() => setIsWellOpen(false)}
        onOpenReleaseModal={(text) => {
          setPrefilledReleaseText(text);
          setIsReleaseModalOpen(true);
        }}
      />

      {/* The Eternal Candle Sanctuary (Dark Environment with Click-to-Light & Persistent Flames) */}
      <CandleSanctuaryModal
        isOpen={isCandleSanctuaryOpen}
        onClose={() => setIsCandleSanctuaryOpen(false)}
      />

      {/* Creator Intelligence Hub (Sanctuary Sentinel) */}
      <CreatorIntelPulse />
    </main>
  );
}