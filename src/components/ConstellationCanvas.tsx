"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { Letter, LetterCategory } from "../lib/types";
import { Plus, Minus, RotateCcw } from "lucide-react";

interface ConstellationCanvasProps {
  letters: Letter[];
  selectedCategory: LetterCategory | "all";
  searchLocation?: string;
  userStarIds?: string[];
  focusedStarId: string | null;
  onSelectLetter: (letter: Letter) => void;
  newAscendingStar: Letter | null;
  onAscensionComplete: () => void;
  breathScale?: number;
  vigilProgress?: number;
}

interface BackgroundStar {
  x: number;
  y: number;
  z: number;
  size: number;
  alpha: number;
  speed: number;
  phase: number;
  colorRgb: string;
  hasDiffraction?: boolean;
}

interface ShootingStar {
  x: number;
  y: number;
  length: number;
  speed: number;
  angle: number;
  opacity: number;
  active: boolean;
}

export default function ConstellationCanvas({
  letters,
  selectedCategory,
  searchLocation = "",
  userStarIds = [],
  focusedStarId,
  onSelectLetter,
  newAscendingStar,
  onAscensionComplete,
  breathScale = 1.0,
  vigilProgress = 0
}: ConstellationCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [hoveredLetter, setHoveredLetter] = useState<Letter | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Pan & Zoom state
  const cameraRef = useRef({ x: 0, y: 0, zoom: 1 });
  const targetCamRef = useRef<{ x: number; y: number; zoom: number } | null>(null);
  const [zoomPercent, setZoomPercent] = useState<number>(100);
  const zoomPercentRef = useRef<number>(100);
  const breathScaleRef = useRef<number>(breathScale);

  useEffect(() => {
    breathScaleRef.current = breathScale;
  }, [breathScale]);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const touchStartPosRef = useRef<{ x: number; y: number } | null>(null);
  const touchStartDistRef = useRef<number | null>(null);
  const touchInitialZoomRef = useRef<number>(1);
  const hasTouchMovedRef = useRef<boolean>(false);
  const bgStarsRef = useRef<BackgroundStar[]>([]);
  const shootingStarsRef = useRef<ShootingStar[]>([]);
  const animFrameRef = useRef<number | null>(null);
  const ascensionProgressRef = useRef<number>(0);

  // Initialize 3D depth background stars with real stellar spectral classes
  useEffect(() => {
    const bg: BackgroundStar[] = [];
    for (let i = 0; i < 1150; i++) {
      const z = Math.random() * 3.4 + 0.35;
      const size = Math.random() * 1.9 + 0.3;

      // Realistic Stellar Spectral Classes (O, B, A, F, G, K, M)
      const roll = Math.random();
      let colorRgb = "245, 248, 255"; // Type A/F Pure Diamond White
      if (roll < 0.28) {
        colorRgb = "186, 230, 253"; // Type O/B Electric Ice Blue / Cyan
      } else if (roll < 0.52) {
        colorRgb = "255, 255, 255"; // Pure White
      } else if (roll < 0.74) {
        colorRgb = "254, 240, 138"; // Type G Warm Sun Yellow
      } else if (roll < 0.90) {
        colorRgb = "254, 215, 170"; // Type K Soft Amber Starlight
      } else {
        colorRgb = "254, 205, 211"; // Type M Pale Rose
      }

      // Bright foreground stars exhibit subtle 4-point cross diffraction spikes (Hubble/JWST aesthetic)
      const hasDiffraction = z < 1.05 && size > 1.35 && Math.random() < 0.42;

      bg.push({
        x: (Math.random() - 0.5) * 5000,
        y: (Math.random() - 0.5) * 5000,
        z,
        size,
        alpha: Math.random() * 0.78 + 0.22,
        speed: Math.random() * 0.014 + 0.003,
        phase: Math.random() * Math.PI * 2,
        colorRgb,
        hasDiffraction
      });
    }
    bgStarsRef.current = bg;
  }, []);

  // Spawn periodic spontaneous shooting stars (celestial release events)
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.3 && typeof window !== "undefined") {
        shootingStarsRef.current.push({
          x: Math.random() * window.innerWidth * 1.2 - 200,
          y: Math.random() * (window.innerHeight * 0.4),
          length: Math.random() * 120 + 80,
          speed: Math.random() * 6 + 4,
          angle: Math.PI / 4 + (Math.random() - 0.5) * 0.2,
          opacity: 0.9,
          active: true
        });
      }
    }, 9000);

    return () => clearInterval(interval);
  }, []);

  // Handle flying to focused star (Wander or My Stars)
  useEffect(() => {
    if (focusedStarId) {
      const target = letters.find((l) => l.id === focusedStarId);
      if (target) {
        targetCamRef.current = {
          x: -target.x,
          y: -target.y,
          zoom: 1.75
        };
      }
    }
  }, [focusedStarId, letters]);

  // When searchLocation changes, center on match
  useEffect(() => {
    if (searchLocation.trim()) {
      const query = searchLocation.toLowerCase().trim();
      const match = letters.find(
        (l) =>
          l.locationName.toLowerCase().includes(query) ||
          l.recipient.toLowerCase().includes(query)
      );
      if (match) {
        targetCamRef.current = {
          x: -match.x,
          y: -match.y,
          zoom: 1.45
        };
      }
    }
  }, [searchLocation, letters]);

  // Filter letters based on Category
  const filteredLetters = letters.filter(
    (l) =>
      selectedCategory === "all" ||
      l.category === selectedCategory ||
      (userStarIds || []).includes(l.id)
  );

  // Screen to World coords
  const screenToWorld = useCallback((sx: number, sy: number) => {
    const cam = cameraRef.current;
    const currentZoom = cam.zoom * breathScale;
    return {
      x: (sx - window.innerWidth / 2) / currentZoom - cam.x,
      y: (sy - window.innerHeight / 2) / currentZoom - cam.y
    };
  }, [breathScale]);

  // World to Screen coords
  const worldToScreen = useCallback((wx: number, wy: number) => {
    const cam = cameraRef.current;
    const currentZoom = cam.zoom * breathScale;
    return {
      x: (wx + cam.x) * currentZoom + window.innerWidth / 2,
      y: (wy + cam.y) * currentZoom + window.innerHeight / 2
    };
  }, [breathScale]);

  // Mouse handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    targetCamRef.current = null;
    isDraggingRef.current = true;
    dragStartRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });

    if (isDraggingRef.current) {
      const dx = (e.clientX - dragStartRef.current.x) / cameraRef.current.zoom;
      const dy = (e.clientY - dragStartRef.current.y) / cameraRef.current.zoom;
      cameraRef.current.x += dx;
      cameraRef.current.y += dy;
      dragStartRef.current = { x: e.clientX, y: e.clientY };
      return;
    }

    // Hit test on interactive stars
    const world = screenToWorld(e.clientX, e.clientY);
    let found: Letter | null = null;
    for (const letter of filteredLetters) {
      const dist = Math.hypot(world.x - letter.x, world.y - letter.y);
      if (dist < letter.size * 5 + 18 / cameraRef.current.zoom) {
        found = letter;
        break;
      }
    }
    setHoveredLetter(found);
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleClick = (e: React.MouseEvent) => {
    const world = screenToWorld(e.clientX, e.clientY);
    for (const letter of filteredLetters) {
      const dist = Math.hypot(world.x - letter.x, world.y - letter.y);
      if (dist < letter.size * 5 + 18 / cameraRef.current.zoom) {
        onSelectLetter(letter);
        return;
      }
    }
  };

  // Dashboard Zoom Controls & Actions
  const handleZoomIn = useCallback(() => {
    targetCamRef.current = null;
    const cam = cameraRef.current;
    const nextZoom = Math.min(cam.zoom * 1.25, 3.5);
    targetCamRef.current = {
      x: cam.x,
      y: cam.y,
      zoom: nextZoom,
    };
  }, []);

  const handleZoomOut = useCallback(() => {
    targetCamRef.current = null;
    const cam = cameraRef.current;
    const nextZoom = Math.max(cam.zoom * 0.8, 0.35);
    targetCamRef.current = {
      x: cam.x,
      y: cam.y,
      zoom: nextZoom,
    };
  }, []);

  const handleResetZoom = useCallback(() => {
    targetCamRef.current = null;
    const cam = cameraRef.current;
    targetCamRef.current = {
      x: cam.x,
      y: cam.y,
      zoom: 1.0,
    };
  }, []);

  const handleResetCamera = useCallback(() => {
    targetCamRef.current = null;
    targetCamRef.current = {
      x: 0,
      y: 0,
      zoom: 1.0,
    };
  }, []);

  // Native Non-Passive Wheel Event Listener: Ensures canvas scrolls & pinches smoothly without browser page zoom
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onNativeWheel = (e: WheelEvent) => {
      // Prevent browser document zooming and window scrolling
      e.preventDefault();
      e.stopPropagation();

      targetCamRef.current = null;

      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      // Handle trackpad pinch (ctrlKey) vs standard mouse wheel
      const isPinch = e.ctrlKey;
      const zoomFactor = isPinch
        ? Math.exp(-e.deltaY * 0.015)
        : e.deltaY < 0
        ? 1.10
        : 0.90;

      const oldZoom = cameraRef.current.zoom;
      const newZoom = Math.min(Math.max(oldZoom * zoomFactor, 0.35), 3.5);

      const currentBreath = breathScaleRef.current || 1.0;
      const worldMouseX =
        (mouseX - canvas.width / 2) / (oldZoom * currentBreath) - cameraRef.current.x;
      const worldMouseY =
        (mouseY - canvas.height / 2) / (oldZoom * currentBreath) - cameraRef.current.y;

      cameraRef.current.zoom = newZoom;
      cameraRef.current.x =
        (mouseX - canvas.width / 2) / (newZoom * currentBreath) - worldMouseX;
      cameraRef.current.y =
        (mouseY - canvas.height / 2) / (newZoom * currentBreath) - worldMouseY;

      const pct = Math.round(newZoom * 100);
      zoomPercentRef.current = pct;
      setZoomPercent(pct);
    };

    const onNativeTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault(); // Prevents browser viewport/HTML zoom so ONLY cosmos dashboard zooms
      }
    };

    canvas.addEventListener("wheel", onNativeWheel, { passive: false });
    canvas.addEventListener("touchmove", onNativeTouchMove, { passive: false });
    return () => {
      canvas.removeEventListener("wheel", onNativeWheel);
      canvas.removeEventListener("touchmove", onNativeTouchMove);
    };
  }, []);

  // Global Keyboard Controls for Dashboard Cosmos Zoom (+ / - / 0)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }

      if (e.key === "+" || e.key === "=") {
        e.preventDefault();
        handleZoomIn();
      } else if (e.key === "-" || e.key === "_") {
        e.preventDefault();
        handleZoomOut();
      } else if (e.key === "0") {
        e.preventDefault();
        handleResetCamera();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleZoomIn, handleZoomOut, handleResetCamera]);

  // Touch Handlers for Mobile Pan, Pinch-to-Zoom, and Tap
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    targetCamRef.current = null;
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      touchStartPosRef.current = { x: touch.clientX, y: touch.clientY };
      dragStartRef.current = { x: touch.clientX, y: touch.clientY };
      isDraggingRef.current = true;
      hasTouchMovedRef.current = false;
    } else if (e.touches.length === 2) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      touchStartDistRef.current = dist;
      touchInitialZoomRef.current = cameraRef.current.zoom;
      isDraggingRef.current = false;
      hasTouchMovedRef.current = true;
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 1 && isDraggingRef.current) {
      const touch = e.touches[0];
      const moveDist = touchStartPosRef.current
        ? Math.hypot(touch.clientX - touchStartPosRef.current.x, touch.clientY - touchStartPosRef.current.y)
        : 0;
      if (moveDist > 6) {
        hasTouchMovedRef.current = true;
      }

      const dx = (touch.clientX - dragStartRef.current.x) / cameraRef.current.zoom;
      const dy = (touch.clientY - dragStartRef.current.y) / cameraRef.current.zoom;
      cameraRef.current.x += dx;
      cameraRef.current.y += dy;
      dragStartRef.current = { x: touch.clientX, y: touch.clientY };
    } else if (e.touches.length === 2 && touchStartDistRef.current) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const currDist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      if (touchStartDistRef.current > 0) {
        const ratio = currDist / touchStartDistRef.current;
        const newZoom = Math.min(Math.max(touchInitialZoomRef.current * ratio, 0.35), 3.5);
        cameraRef.current.zoom = newZoom;
        const pct = Math.round(newZoom * 100);
        zoomPercentRef.current = pct;
        setZoomPercent(pct);
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLCanvasElement>) => {
    // If finger lifted without significant drag, treat as precision mobile tap
    if (!hasTouchMovedRef.current && touchStartPosRef.current) {
      const tapX = touchStartPosRef.current.x;
      const tapY = touchStartPosRef.current.y;
      const world = screenToWorld(tapX, tapY);

      // Generous 30px touch hit radius for mobile thumbs
      for (const letter of filteredLetters) {
        const dist = Math.hypot(world.x - letter.x, world.y - letter.y);
        if (dist < letter.size * 6 + 30 / cameraRef.current.zoom) {
          onSelectLetter(letter);
          break;
        }
      }
    }

    if (e.touches.length === 0) {
      isDraggingRef.current = false;
      touchStartPosRef.current = null;
      touchStartDistRef.current = null;
      hasTouchMovedRef.current = false;
    } else if (e.touches.length === 1) {
      const touch = e.touches[0];
      dragStartRef.current = { x: touch.clientX, y: touch.clientY };
      isDraggingRef.current = true;
      touchStartDistRef.current = null;
    }
  };

  // Main Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    let time = 0;
    const searchQuery = searchLocation.toLowerCase().trim();

    const render = () => {
      time += 0.015;

      // Smooth camera interpolation
      if (targetCamRef.current) {
        const cam = cameraRef.current;
        const target = targetCamRef.current;
        cam.x += (target.x - cam.x) * 0.08;
        cam.y += (target.y - cam.y) * 0.08;
        cam.zoom += (target.zoom - cam.zoom) * 0.08;

        if (
          Math.hypot(target.x - cam.x, target.y - cam.y) < 1 &&
          Math.abs(target.zoom - cam.zoom) < 0.005
        ) {
          targetCamRef.current = null;
        }
      }

      // Sync zoom display badge if changed
      const currentPct = Math.round(cameraRef.current.zoom * 100);
      if (currentPct !== zoomPercentRef.current) {
        zoomPercentRef.current = currentPct;
        setZoomPercent(currentPct);
      }

      ctx.clearRect(0, 0, width, height);

      // Deep Living Cosmic Gradient with Ethereal Stardust Pulses
      const grad = ctx.createRadialGradient(
        width / 2,
        height / 2,
        80,
        width / 2,
        height / 2,
        Math.max(width, height)
      );
      grad.addColorStop(0, "#070814");
      grad.addColorStop(0.45, "#03040a");
      grad.addColorStop(1, "#010103");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Multi-layered Interstellar Deep Space Cosmic Dust (Nebulae)
      const nebPulse1 = Math.sin(time * 0.3) * 0.015 + 0.05;
      const nebPulse2 = Math.cos(time * 0.22) * 0.012 + 0.04;

      // Cyan / Sapphire Nebula Cluster (Upper Left)
      const neb1 = ctx.createRadialGradient(width * 0.28, height * 0.32, 40, width * 0.28, height * 0.32, 520);
      neb1.addColorStop(0, `rgba(14, 165, 233, ${nebPulse1 * 0.85})`);
      neb1.addColorStop(0.5, `rgba(99, 102, 241, ${nebPulse1 * 0.45})`);
      neb1.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = neb1;
      ctx.fillRect(0, 0, width, height);

      // Deep Amethyst / Violet Dust Lane (Lower Right)
      const neb2 = ctx.createRadialGradient(width * 0.78, height * 0.72, 60, width * 0.78, height * 0.72, 580);
      neb2.addColorStop(0, `rgba(168, 85, 247, ${nebPulse2 * 0.75})`);
      neb2.addColorStop(0.5, `rgba(139, 92, 246, ${nebPulse2 * 0.35})`);
      neb2.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = neb2;
      ctx.fillRect(0, 0, width, height);

      // Warm Amber / Golden Stardust Ribbon (Subtle Center Drift)
      const neb3 = ctx.createRadialGradient(width * 0.52, height * 0.52, 30, width * 0.52, height * 0.52, 420);
      neb3.addColorStop(0, "rgba(245, 158, 11, 0.022)");
      neb3.addColorStop(0.7, "rgba(217, 119, 6, 0.008)");
      neb3.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = neb3;
      ctx.fillRect(0, 0, width, height);

      // Global Silent Vigil Wave Effect
      if (vigilProgress > 0) {
        ctx.save();
        const maxVigilR = Math.hypot(width, height) * 0.75;
        const currentR = maxVigilR * Math.min(vigilProgress * 1.4, 1);

        const vigilGrad = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, currentR);
        vigilGrad.addColorStop(0, `rgba(251, 191, 36, ${vigilProgress * 0.15})`);
        vigilGrad.addColorStop(0.7, `rgba(251, 191, 36, ${vigilProgress * 0.22})`);
        vigilGrad.addColorStop(1, "rgba(251, 191, 36, 0)");

        ctx.fillStyle = vigilGrad;
        ctx.beginPath();
        ctx.arc(width / 2, height / 2, currentR, 0, Math.PI * 2);
        ctx.fill();

        // Radiating pulse ring
        ctx.strokeStyle = `rgba(251, 191, 36, ${vigilProgress * 0.6})`;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(width / 2, height / 2, currentR * 0.95, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      const cam = cameraRef.current;

      // =========================================================================
      // DISTANT DEEP SPACE PLANETS (Realistic celestial bodies in the far distance)
      // =========================================================================

      // PLANET 1: Distant Ringed Ice Giant (Top-Right deep space)
      {
        const p1Parallax = 0.035;
        const p1WorldX = 1480;
        const p1WorldY = -940;
        const p1x = (p1WorldX + cam.x * p1Parallax) * cam.zoom + width / 2;
        const p1y = (p1WorldY + cam.y * p1Parallax) * cam.zoom + height / 2;
        const p1Radius = Math.max(26, 68 * Math.pow(cam.zoom, 0.45));

        if (p1x > -200 && p1x < width + 200 && p1y > -200 && p1y < height + 200) {
          ctx.save();

          // Atmospheric haze aura
          const p1Aura = ctx.createRadialGradient(p1x, p1y, p1Radius * 0.65, p1x, p1y, p1Radius * 2.3);
          p1Aura.addColorStop(0, "rgba(56, 189, 248, 0.11)");
          p1Aura.addColorStop(0.5, "rgba(14, 116, 144, 0.04)");
          p1Aura.addColorStop(1, "rgba(0, 0, 0, 0)");
          ctx.fillStyle = p1Aura;
          ctx.beginPath();
          ctx.arc(p1x, p1y, p1Radius * 2.3, 0, Math.PI * 2);
          ctx.fill();

          // 1. Back Half of Rings (behind planet sphere)
          ctx.save();
          ctx.translate(p1x, p1y);
          ctx.rotate(-0.36);
          ctx.scale(1, 0.32);

          ctx.beginPath();
          ctx.arc(0, 0, p1Radius * 2.15, Math.PI, 0, false);
          ctx.arc(0, 0, p1Radius * 1.35, 0, Math.PI, true);
          ctx.closePath();
          const ringBackGrad = ctx.createRadialGradient(0, 0, p1Radius * 1.35, 0, 0, p1Radius * 2.15);
          ringBackGrad.addColorStop(0, "rgba(186, 230, 253, 0.03)");
          ringBackGrad.addColorStop(0.5, "rgba(224, 242, 254, 0.20)");
          ringBackGrad.addColorStop(0.85, "rgba(125, 211, 252, 0.10)");
          ringBackGrad.addColorStop(1, "rgba(14, 116, 144, 0.01)");
          ctx.fillStyle = ringBackGrad;
          ctx.fill();
          ctx.restore();

          // 2. Planet Sphere Body
          ctx.save();
          ctx.beginPath();
          ctx.arc(p1x, p1y, p1Radius, 0, Math.PI * 2);
          ctx.clip();

          // Spherical gradient lit from top-left (starlight angle)
          const p1SphereGrad = ctx.createRadialGradient(
            p1x - p1Radius * 0.42,
            p1y - p1Radius * 0.42,
            p1Radius * 0.06,
            p1x,
            p1y,
            p1Radius
          );
          p1SphereGrad.addColorStop(0, "#bae6fd"); // bright icy limb
          p1SphereGrad.addColorStop(0.22, "#38bdf8"); // azure atmosphere
          p1SphereGrad.addColorStop(0.58, "#0369a1"); // deep sapphire
          p1SphereGrad.addColorStop(0.84, "#082f49"); // dark terminator transition
          p1SphereGrad.addColorStop(1, "#020617"); // midnight void shadow
          ctx.fillStyle = p1SphereGrad;
          ctx.fillRect(p1x - p1Radius, p1y - p1Radius, p1Radius * 2, p1Radius * 2);

          // Subtle cloud bands
          ctx.fillStyle = "rgba(224, 242, 254, 0.06)";
          ctx.fillRect(p1x - p1Radius, p1y - p1Radius * 0.3, p1Radius * 2, p1Radius * 0.14);
          ctx.fillStyle = "rgba(14, 116, 144, 0.1)";
          ctx.fillRect(p1x - p1Radius, p1y + p1Radius * 0.12, p1Radius * 2, p1Radius * 0.18);

          // Nightside shadow covering lower-right
          const p1Shadow = ctx.createRadialGradient(
            p1x + p1Radius * 0.45,
            p1y + p1Radius * 0.45,
            p1Radius * 0.15,
            p1x + p1Radius * 0.25,
            p1y + p1Radius * 0.25,
            p1Radius * 1.15
          );
          p1Shadow.addColorStop(0, "rgba(2, 6, 23, 0.96)");
          p1Shadow.addColorStop(0.65, "rgba(2, 6, 23, 0.6)");
          p1Shadow.addColorStop(1, "rgba(2, 6, 23, 0)");
          ctx.fillStyle = p1Shadow;
          ctx.fillRect(p1x - p1Radius, p1y - p1Radius, p1Radius * 2, p1Radius * 2);
          ctx.restore();

          // 3. Front Half of Rings (in front of planet sphere)
          ctx.save();
          ctx.translate(p1x, p1y);
          ctx.rotate(-0.36);
          ctx.scale(1, 0.32);

          ctx.beginPath();
          ctx.arc(0, 0, p1Radius * 2.15, 0, Math.PI, false);
          ctx.arc(0, 0, p1Radius * 1.35, Math.PI, 0, true);
          ctx.closePath();
          const ringFrontGrad = ctx.createRadialGradient(0, 0, p1Radius * 1.35, 0, 0, p1Radius * 2.15);
          ringFrontGrad.addColorStop(0, "rgba(186, 230, 253, 0.04)");
          ringFrontGrad.addColorStop(0.45, "rgba(224, 242, 254, 0.25)");
          ringFrontGrad.addColorStop(0.78, "rgba(147, 197, 253, 0.14)");
          ringFrontGrad.addColorStop(1, "rgba(14, 116, 144, 0.02)");
          ctx.fillStyle = ringFrontGrad;
          ctx.fill();

          // Planet shadow cast onto the ring
          ctx.fillStyle = "rgba(2, 6, 23, 0.6)";
          ctx.beginPath();
          ctx.ellipse(p1Radius * 0.28, 0, p1Radius * 0.55, p1Radius * 0.88, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();

          // 4. Subtle razor-thin Rayleigh limb arc along the sunlit edge
          ctx.beginPath();
          ctx.arc(p1x, p1y, p1Radius + 0.4, -Math.PI * 0.85, Math.PI * 0.12);
          ctx.strokeStyle = "rgba(186, 230, 253, 0.32)";
          ctx.lineWidth = 1.1;
          ctx.stroke();

          // 5. Distant tiny companion moon
          const moonAngle = time * 0.07 + 1.2;
          const mx = p1x + Math.cos(moonAngle) * p1Radius * 2.7;
          const my = p1y + Math.sin(moonAngle) * p1Radius * 0.9;
          ctx.fillStyle = "rgba(224, 242, 254, 0.85)";
          ctx.beginPath();
          ctx.arc(mx, my, 2.0, 0, Math.PI * 2);
          ctx.fill();

          ctx.restore();
        }
      }

      // PLANET 2: Distant Warm Terracotta Moon (Bottom-Left deep space)
      {
        const p2Parallax = 0.030;
        const p2WorldX = -1520;
        const p2WorldY = 1080;
        const p2x = (p2WorldX + cam.x * p2Parallax) * cam.zoom + width / 2;
        const p2y = (p2WorldY + cam.y * p2Parallax) * cam.zoom + height / 2;
        const p2Radius = Math.max(16, 44 * Math.pow(cam.zoom, 0.45));

        if (p2x > -150 && p2x < width + 150 && p2y > -150 && p2y < height + 150) {
          ctx.save();

          // Warm ambient aura
          const p2Aura = ctx.createRadialGradient(p2x, p2y, p2Radius * 0.55, p2x, p2y, p2Radius * 2.1);
          p2Aura.addColorStop(0, "rgba(245, 158, 11, 0.09)");
          p2Aura.addColorStop(0.6, "rgba(180, 83, 9, 0.03)");
          p2Aura.addColorStop(1, "rgba(0, 0, 0, 0)");
          ctx.fillStyle = p2Aura;
          ctx.beginPath();
          ctx.arc(p2x, p2y, p2Radius * 2.1, 0, Math.PI * 2);
          ctx.fill();

          // Planet Body Sphere
          ctx.save();
          ctx.beginPath();
          ctx.arc(p2x, p2y, p2Radius, 0, Math.PI * 2);
          ctx.clip();

          // Spherical gradient lit from top-right
          const p2SphereGrad = ctx.createRadialGradient(
            p2x + p2Radius * 0.42,
            p2y - p2Radius * 0.42,
            p2Radius * 0.06,
            p2x,
            p2y,
            p2Radius
          );
          p2SphereGrad.addColorStop(0, "#fef08a"); // warm starlight rim
          p2SphereGrad.addColorStop(0.24, "#f59e0b"); // amber crust
          p2SphereGrad.addColorStop(0.62, "#92400e"); // deep terracotta
          p2SphereGrad.addColorStop(0.86, "#451a03"); // shadow boundary
          p2SphereGrad.addColorStop(1, "#020101"); // black nightside
          ctx.fillStyle = p2SphereGrad;
          ctx.fillRect(p2x - p2Radius, p2y - p2Radius, p2Radius * 2, p2Radius * 2);

          // Subtle procedural maria/craters
          ctx.fillStyle = "rgba(69, 26, 3, 0.35)";
          ctx.beginPath();
          ctx.arc(p2x - p2Radius * 0.1, p2y - p2Radius * 0.15, p2Radius * 0.28, 0, Math.PI * 2);
          ctx.arc(p2x + p2Radius * 0.18, p2y + p2Radius * 0.22, p2Radius * 0.2, 0, Math.PI * 2);
          ctx.fill();

          // Nightside shadow covering lower-left
          const p2Shadow = ctx.createRadialGradient(
            p2x - p2Radius * 0.42,
            p2y + p2Radius * 0.42,
            p2Radius * 0.1,
            p2x - p2Radius * 0.2,
            p2y + p2Radius * 0.2,
            p2Radius * 1.05
          );
          p2Shadow.addColorStop(0, "rgba(2, 1, 1, 0.95)");
          p2Shadow.addColorStop(0.58, "rgba(2, 1, 1, 0.55)");
          p2Shadow.addColorStop(1, "rgba(2, 1, 1, 0)");
          ctx.fillStyle = p2Shadow;
          ctx.fillRect(p2x - p2Radius, p2y - p2Radius, p2Radius * 2, p2Radius * 2);
          ctx.restore();

          // Subtle sunlit rim arc
          ctx.beginPath();
          ctx.arc(p2x, p2y, p2Radius + 0.4, -Math.PI * 0.38, Math.PI * 0.48);
          ctx.strokeStyle = "rgba(254, 240, 138, 0.30)";
          ctx.lineWidth = 1.0;
          ctx.stroke();

          ctx.restore();
        }
      }

      // =========================================================================
      // 1. DRAW 3D DEPTH-DRIFTING BACKGROUND STARS (Real Space Colors & Diffraction)
      // =========================================================================
      for (const s of bgStarsRef.current) {
        // Slow organic cosmic drift
        s.y += s.speed * 0.03;
        s.x += Math.sin(time * 0.2 + s.phase) * 0.015;
        if (s.y > 2500) s.y = -2500;
        if (s.x > 2500) s.x = -2500;
        if (s.x < -2500) s.x = 2500;

        const parallaxFactor = 0.22 / s.z;
        const sx = (s.x + cam.x * parallaxFactor) * cam.zoom + width / 2;
        const sy = (s.y + cam.y * parallaxFactor) * cam.zoom + height / 2;

        if (sx < -25 || sx > width + 25 || sy < -25 || sy > height + 25) continue;

        // Multi-frequency organic scintillation
        const twinkle =
          Math.sin(time * s.speed * 26 + s.phase) * 0.28 +
          Math.cos(time * s.speed * 13 + s.phase * 2) * 0.12 +
          0.68;
        const starSize = Math.max(0.35, (s.size / s.z) * Math.pow(cam.zoom, 0.65));
        const alpha = Math.min(1, Math.max(0.08, (s.alpha / s.z) * twinkle));

        // 4-point cross diffraction spikes on bright stars (James Webb / Hubble style)
        if (s.hasDiffraction && cam.zoom > 0.6) {
          const spikeLen = starSize * 4.6 * twinkle;
          ctx.strokeStyle = `rgba(${s.colorRgb}, ${alpha * 0.35})`;
          ctx.lineWidth = 0.7;
          ctx.beginPath();
          ctx.moveTo(sx - spikeLen, sy);
          ctx.lineTo(sx + spikeLen, sy);
          ctx.moveTo(sx, sy - spikeLen);
          ctx.lineTo(sx, sy + spikeLen);
          ctx.stroke();

          // Soft stellar halo glow
          ctx.fillStyle = `rgba(${s.colorRgb}, ${alpha * 0.16})`;
          ctx.beginPath();
          ctx.arc(sx, sy, starSize * 2.2, 0, Math.PI * 2);
          ctx.fill();
        }

        // Star core
        ctx.fillStyle = `rgba(${s.colorRgb}, ${alpha})`;
        ctx.beginPath();
        ctx.arc(sx, sy, starSize, 0, Math.PI * 2);
        ctx.fill();
      }

      // 2. Draw Spontaneous Falling / Shooting Stars (Meteors)
      const activeShooting = shootingStarsRef.current;
      for (let idx = activeShooting.length - 1; idx >= 0; idx--) {
        const meteor = activeShooting[idx];
        if (!meteor.active) continue;

        meteor.x += Math.cos(meteor.angle) * meteor.speed;
        meteor.y += Math.sin(meteor.angle) * meteor.speed;
        meteor.opacity -= 0.015;

        const tailX = meteor.x - Math.cos(meteor.angle) * meteor.length;
        const tailY = meteor.y - Math.sin(meteor.angle) * meteor.length;

        const meteorGrad = ctx.createLinearGradient(tailX, tailY, meteor.x, meteor.y);
        meteorGrad.addColorStop(0, "rgba(255, 255, 255, 0)");
        meteorGrad.addColorStop(1, `rgba(251, 191, 36, ${Math.max(0, meteor.opacity)})`);

        ctx.strokeStyle = meteorGrad;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(meteor.x, meteor.y);
        ctx.stroke();

        // Glowing white head
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0, meteor.opacity)})`;
        ctx.shadowColor = "#fbbf24";
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(meteor.x, meteor.y, 1.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        if (meteor.opacity <= 0 || meteor.x > width + 200 || meteor.y > height + 200) {
          activeShooting.splice(idx, 1);
        }
      }

      // 3. Draw Constellation Filaments between neighboring letters in same category
      ctx.lineWidth = 0.8;
      for (let i = 0; i < filteredLetters.length; i++) {
        for (let j = i + 1; j < filteredLetters.length; j++) {
          const l1 = filteredLetters[i];
          const l2 = filteredLetters[j];
          if (l1.category === l2.category) {
            const d = Math.hypot(l1.x - l2.x, l1.y - l2.y);
            if (d < 380) {
              const p1 = worldToScreen(l1.x, l1.y);
              const p2 = worldToScreen(l2.x, l2.y);
              const alpha = (1 - d / 380) * 0.18;
              ctx.strokeStyle = l1.glowColor.replace(/[\d.]+\)$/g, `${alpha})`);
              ctx.beginPath();
              ctx.moveTo(p1.x, p1.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.stroke();
            }
          }
        }
      }

      // 3.b Draw Golden Resonance Filaments between Twin Resonant Stars
      for (const letter of filteredLetters) {
        if (letter.resonantLetterId && letter.id < letter.resonantLetterId) {
          const sister = letters.find((l) => l.id === letter.resonantLetterId);
          if (sister) {
            const p1 = worldToScreen(letter.x, letter.y);
            const p2 = worldToScreen(sister.x, sister.y);
            const isPairHovered = hoveredLetter?.id === letter.id || hoveredLetter?.id === sister.id;
            const isPairFocused = focusedStarId === letter.id || focusedStarId === sister.id;
            const isHighlighted = isPairHovered || isPairFocused;

            // Shimmering Golden Resonance Filament
            ctx.save();
            ctx.lineWidth = (isHighlighted ? 2.8 : 1.8) * cam.zoom;
            ctx.strokeStyle = isHighlighted ? "rgba(251, 191, 36, 0.85)" : "rgba(251, 191, 36, 0.45)";
            ctx.shadowColor = "#fbbf24";
            ctx.shadowBlur = isHighlighted ? 18 : 6;
            ctx.setLineDash([6, 6]);
            ctx.lineDashOffset = -time * (isHighlighted ? 45 : 30);
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
            ctx.setLineDash([]);

            // Flowing Light Energy Bead along the bridge
            const tEnergy = (time * (isHighlighted ? 0.5 : 0.35)) % 1;
            const bx = p1.x + (p2.x - p1.x) * tEnergy;
            const by = p1.y + (p2.y - p1.y) * tEnergy;

            ctx.fillStyle = "#ffffff";
            ctx.shadowColor = "#fbbf24";
            ctx.shadowBlur = isHighlighted ? 24 : 16;
            ctx.beginPath();
            ctx.arc(bx, by, (isHighlighted ? 4.5 : 3.2) * cam.zoom, 0, Math.PI * 2);
            ctx.fill();

            // Reverse energy bead
            const tEnergyRev = 1 - tEnergy;
            const rx = p1.x + (p2.x - p1.x) * tEnergyRev;
            const ry = p1.y + (p2.y - p1.y) * tEnergyRev;
            ctx.beginPath();
            ctx.arc(rx, ry, (isHighlighted ? 3.2 : 2.2) * cam.zoom, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }
        }
      }

      // 4. Draw Interactive Star Nodes
      for (const letter of filteredLetters) {
        const pos = worldToScreen(letter.x, letter.y);
        if (pos.x < -50 || pos.x > width + 50 || pos.y < -50 || pos.y > height + 50) continue;

        const isUserStar = (userStarIds || []).includes(letter.id);
        const isHovered = hoveredLetter?.id === letter.id;
        const isFocused = focusedStarId === letter.id;

        // Search highlight check
        const matchesSearch =
          !searchQuery ||
          letter.locationName.toLowerCase().includes(searchQuery) ||
          letter.recipient.toLowerCase().includes(searchQuery);

        const starAlpha = matchesSearch ? 1.0 : 0.18;
        const pulse = Math.sin(time * letter.pulseSpeed + letter.pulsePhase) * 0.25 + 0.75;
        const baseRadius = (letter.size + (isHovered || isFocused ? 3 : 0)) * cam.zoom;

        // Special golden beacon for USER STAR or FOCUSED STAR (Teleport)
        if (isUserStar || isFocused) {
          const beaconPulse = Math.sin(time * 3.5) * 0.3 + 1;
          ctx.strokeStyle = isUserStar ? "rgba(251, 191, 36, 0.85)" : "rgba(129, 140, 248, 0.85)";
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, baseRadius * 3.5 * beaconPulse, 0, Math.PI * 2);
          ctx.stroke();

          ctx.strokeStyle = isUserStar ? "rgba(251, 191, 36, 0.3)" : "rgba(129, 140, 248, 0.3)";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, baseRadius * 5.5 * beaconPulse, 0, Math.PI * 2);
          ctx.stroke();

          ctx.fillStyle = isUserStar ? "#fbbf24" : "#a5b4fc";
          ctx.font = `600 ${Math.max(10, 11 * cam.zoom)}px sans-serif`;
          ctx.textAlign = "center";
          ctx.fillText(
            isUserStar ? "★ YOUR STAR" : `✦ ${letter.locationName}`,
            pos.x,
            pos.y - baseRadius * 5.5
          );
        }

        // Outer Aura Halo
        const glowRadius = baseRadius * (isHovered ? 8 : 4.5) * pulse;
        const aura = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, glowRadius);
        aura.addColorStop(0, letter.glowColor.replace(/[\d.]+\)$/g, `${starAlpha * 0.8})`));
        aura.addColorStop(0.4, letter.glowColor.replace(/[\d.]+\)$/g, `${starAlpha * 0.2})`));
        aura.addColorStop(1, "rgba(0,0,0,0)");

        ctx.fillStyle = aura;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, glowRadius, 0, Math.PI * 2);
        ctx.fill();

        // Star Core
        ctx.globalAlpha = starAlpha;
        ctx.fillStyle = isHovered || isUserStar || isFocused ? "#ffffff" : letter.color;
        ctx.shadowColor = isUserStar ? "#fbbf24" : letter.color;
        ctx.shadowBlur = isHovered || isUserStar || isFocused ? 24 : 10;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, baseRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1.0;

        // Special Time-Capsule Nebula Rendering
        if (letter.isTimeCapsule) {
          ctx.save();
          const nebPulse = Math.sin(time * 1.5 + letter.pulsePhase) * 0.2 + 1.0;
          const nebRadius = baseRadius * 4.2 * nebPulse;

          // Multi-layer rotating nebula gas
          const gasGradient = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, nebRadius);
          gasGradient.addColorStop(0, "rgba(56, 189, 248, 0.85)");
          gasGradient.addColorStop(0.35, "rgba(168, 85, 247, 0.35)");
          gasGradient.addColorStop(0.7, "rgba(59, 130, 246, 0.12)");
          gasGradient.addColorStop(1, "rgba(0, 0, 0, 0)");

          ctx.fillStyle = gasGradient;
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, nebRadius, 0, Math.PI * 2);
          ctx.fill();

          // Swirling cosmic orbital ring
          ctx.strokeStyle = "rgba(56, 189, 248, 0.55)";
          ctx.lineWidth = 1.2 * cam.zoom;
          ctx.setLineDash([3, 4]);
          ctx.lineDashOffset = time * 15;
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, baseRadius * 2.8, 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]);

          // Locked Core Glyph
          ctx.fillStyle = "#ffffff";
          ctx.font = `600 ${Math.max(9, 10 * cam.zoom)}px sans-serif`;
          ctx.textAlign = "center";
          ctx.fillText("⏳", pos.x, pos.y + 3);

          ctx.fillStyle = "#38bdf8";
          ctx.font = `500 ${Math.max(8, 9 * cam.zoom)}px monospace`;
          ctx.fillText("TIME CAPSULE", pos.x, pos.y - baseRadius * 3.2);
          ctx.restore();
        }

        // Cross spikes on Hover
        if (isHovered) {
          ctx.strokeStyle = "rgba(255, 255, 255, 0.7)";
          ctx.lineWidth = 1;
          const spikeLen = baseRadius * 3.5;
          ctx.beginPath();
          ctx.moveTo(pos.x - spikeLen, pos.y);
          ctx.lineTo(pos.x + spikeLen, pos.y);
          ctx.moveTo(pos.x, pos.y - spikeLen);
          ctx.lineTo(pos.x, pos.y + spikeLen);
          ctx.stroke();
        }
      }

      // 5. Ascension Animation
      if (newAscendingStar) {
        ascensionProgressRef.current += 0.02;
        const prog = Math.min(ascensionProgressRef.current, 1);

        const targetScreen = worldToScreen(newAscendingStar.x, newAscendingStar.y);
        const startX = width / 2;
        const startY = height + 50;

        const currentX = startX + (targetScreen.x - startX) * prog;
        const currentY = startY + (targetScreen.y - startY) * Math.pow(prog, 0.7);

        const beamGrad = ctx.createLinearGradient(currentX, currentY + 80, currentX, currentY);
        beamGrad.addColorStop(0, "rgba(255, 255, 255, 0)");
        beamGrad.addColorStop(1, newAscendingStar.color);

        ctx.strokeStyle = beamGrad;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(currentX, currentY + 80);
        ctx.lineTo(currentX, currentY);
        ctx.stroke();

        ctx.fillStyle = "#ffffff";
        ctx.shadowColor = newAscendingStar.color;
        ctx.shadowBlur = 25;
        ctx.beginPath();
        ctx.arc(currentX, currentY, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        if (prog >= 1) {
          ascensionProgressRef.current = 0;
          onAscensionComplete();
        }
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [
    filteredLetters,
    hoveredLetter,
    userStarIds,
    focusedStarId,
    searchLocation,
    worldToScreen,
    newAscendingStar,
    onAscensionComplete,
    breathScale,
    vigilProgress
  ]);

  return (
    <div className="relative w-full h-full overflow-hidden select-none cursor-grab active:cursor-grabbing">
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onClick={handleClick}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        className="w-full h-full block touch-none"
        style={{ touchAction: "none" }}
      />

      {/* On-Canvas Dashboard Cosmos Zoom Controls (+ / - / Reset / % indicator) */}
      <aside
        aria-label="Cosmos Dashboard Zoom Controls"
        className="fixed right-3 sm:right-6 bottom-20 sm:bottom-24 z-30 pointer-events-auto flex flex-col items-center p-1 rounded-2xl bg-neutral-950/85 border border-amber-400/25 backdrop-blur-2xl shadow-2xl shadow-black/90 transition-all duration-300"
      >
        {/* Zoom In Button */}
        <button
          type="button"
          onClick={handleZoomIn}
          className="p-1.5 sm:p-2 rounded-xl text-white/75 hover:text-amber-200 hover:bg-amber-400/15 active:scale-90 transition-all cursor-pointer"
          title="Zoom In Celestial Map (+)"
        >
          <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-300" />
        </button>

        {/* Zoom Percentage / Quick 100% Reset Badge */}
        <button
          type="button"
          onClick={handleResetZoom}
          className="px-1.5 py-0.5 sm:py-1 text-[10px] font-mono font-medium text-amber-300/90 hover:text-amber-100 hover:bg-amber-400/20 rounded-lg transition-colors cursor-pointer"
          title="Reset Cosmos Zoom to 100%"
        >
          {zoomPercent}%
        </button>

        {/* Zoom Out Button */}
        <button
          type="button"
          onClick={handleZoomOut}
          className="p-1.5 sm:p-2 rounded-xl text-white/75 hover:text-amber-200 hover:bg-amber-400/15 active:scale-90 transition-all cursor-pointer"
          title="Zoom Out Celestial Map (-)"
        >
          <Minus className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-300" />
        </button>

        {/* Recenter Origin Button */}
        <div className="w-4 h-[1px] bg-white/10 my-0.5" />
        <button
          type="button"
          onClick={handleResetCamera}
          className="p-1.5 rounded-xl text-white/50 hover:text-amber-300 hover:bg-amber-400/15 active:scale-90 transition-all cursor-pointer"
          title="Recenter Sacred Map Coordinates"
        >
          <RotateCcw className="w-3 h-3 text-amber-400/80" />
        </button>
      </aside>

      {/* Floating Hover Whisper Tooltip */}
      {hoveredLetter && !isDraggingRef.current && (
        <div
          style={{
            left: Math.min(Math.max(mousePos.x + 20, 20), window.innerWidth - 320),
            top: Math.min(Math.max(mousePos.y - 40, 20), window.innerHeight - 180)
          }}
          className="pointer-events-none fixed z-30 w-72 rounded-2xl border border-white/15 bg-black/85 backdrop-blur-xl p-4 shadow-2xl shadow-black/80 transition-opacity duration-200"
        >
          <div className="flex items-center justify-between text-xs text-white/50 mb-1.5">
            <span
              className="inline-flex items-center gap-1.5 font-medium px-2 py-0.5 rounded-full text-[10px]"
              style={{
                backgroundColor: `${hoveredLetter.color}15`,
                color: hoveredLetter.color,
                border: `1px solid ${hoveredLetter.color}40`
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ backgroundColor: hoveredLetter.color }}
              />
              {hoveredLetter.category.toUpperCase()}
            </span>
            {(userStarIds || []).includes(hoveredLetter.id) ? (
              <span className="text-[10px] text-amber-300 font-semibold">★ YOUR STAR</span>
            ) : (
              <span className="text-[11px] text-white/60">📍 {hoveredLetter.locationName}</span>
            )}
          </div>

          {hoveredLetter.isTimeCapsule && (
            <div className="mb-1.5 px-2 py-0.5 rounded-md bg-sky-500/15 border border-sky-400/30 text-[10px] text-sky-300 font-mono flex items-center gap-1.5">
              <span>⏳</span>
              <span>Time-Locked • Ignites {hoveredLetter.igniteDate}</span>
            </div>
          )}

          {hoveredLetter.resonantLetterId && (
            <div className="mb-1.5 px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-400/30 text-[10px] text-amber-300 font-mono flex items-center gap-1.5">
              <span>✦</span>
              <span>Resonant Sister Star Linked</span>
            </div>
          )}

          <h4 className="text-sm font-semibold text-white/95 line-clamp-1 mb-1">
            {hoveredLetter.recipient}
          </h4>
          <p className="text-xs text-white/70 italic line-clamp-2 leading-relaxed">
            "{hoveredLetter.content}"
          </p>
          <div className="mt-2.5 flex items-center justify-between text-[11px] text-white/40 pt-2 border-t border-white/10">
            <span>✨ Click to open letter</span>
            <span>🤍 {hoveredLetter.lightCount.toLocaleString()}</span>
          </div>
        </div>
      )}

      {/* Bottom Subtle Navigation & Compliance */}
      <footer className="absolute bottom-2.5 sm:bottom-3.5 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 sm:gap-2 pointer-events-auto z-10 w-full max-w-3xl px-4 text-center">
        {/* Mobile Minimal Touch Gesture Hint */}
        <span className="sm:hidden pointer-events-none text-center text-[10px] tracking-widest text-white/35 font-mono">
          DRAG SKY • PINCH ZOOM • TAP STAR
        </span>

        {/* Desktop Detailed Hint */}
        <span className="hidden sm:inline-block pointer-events-none text-center text-[11px] tracking-wider text-white/35 font-light">
          DRAG TO EXPLORE COSMOS • SCROLL TO ZOOM • CLICK ANY STAR TO READ
        </span>

        {/* Quiet Sanctuary Pathways (Cleanly wrapped and spaced so names never collide) */}
        <nav
          aria-label="Sanctuary pathways"
          className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[10px] sm:text-[11px] text-white/40 font-mono tracking-widest uppercase max-w-2xl"
        >
          <a href="/about" className="hover:text-amber-300 transition-colors whitespace-nowrap">
            About
          </a>
          <span className="text-white/20 select-none">•</span>
          <a href="/chronicles" className="hover:text-amber-300 transition-colors whitespace-nowrap">
            Chronicles
          </a>
          <span className="text-white/20 select-none">•</span>
          <a href="/library" className="hover:text-amber-300 transition-colors whitespace-nowrap">
            Library
          </a>
          <span className="text-white/20 select-none">•</span>
          <a href="/faq" className="hover:text-amber-300 transition-colors whitespace-nowrap">
            FAQ
          </a>
          <span className="text-white/20 select-none">•</span>
          <a href="/privacy" className="hover:text-amber-300 transition-colors whitespace-nowrap">
            Privacy
          </a>
          <span className="text-white/20 select-none">•</span>
          <a href="/terms" className="hover:text-amber-300 transition-colors whitespace-nowrap">
            Terms
          </a>
          <span className="text-white/20 select-none">•</span>
          <a href="/contact" className="hover:text-amber-300 transition-colors whitespace-nowrap">
            Contact
          </a>
        </nav>
      </footer>
    </div>
  );
}