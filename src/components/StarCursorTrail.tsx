"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  hue: number; // 40-55 gold range, occasional cool white
  twinklePhase: number;
}

/**
 * StarCursorTrail — an Antigravity-style celestial cursor.
 * A soft golden comet-glow follows the pointer while tiny stars
 * burst, drift and fade in its wake. Respects reduced-motion
 * and touch devices (renders nothing there).
 */
export default function StarCursorTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Only on devices with a fine pointer, and never for reduced motion.
    if (
      typeof window === "undefined" ||
      !window.matchMedia("(pointer: fine)").matches ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let width = 0;
    let height = 0;
    const particles: Particle[] = [];
    const MAX_PARTICLES = 140;
    let lastSpawn = 0;
    let mouseX = -100;
    let mouseY = -100;
    let glowPulse = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      const now = performance.now();
      // Throttle spawns so fast movement stays a trail, not a flood.
      if (now - lastSpawn < 28) return;
      lastSpawn = now;

      for (let i = 0; i < 3; i++) {
        if (particles.length >= MAX_PARTICLES) particles.shift();
        const angle = Math.random() * Math.PI * 2;
        const speed = 0.25 + Math.random() * 0.9;
        const gold = Math.random() > 0.22;
        particles.push({
          x: mouseX + (Math.random() - 0.5) * 10,
          y: mouseY + (Math.random() - 0.5) * 10,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 0.35, // gentle upward drift
          life: 0,
          maxLife: 550 + Math.random() * 650,
          size: 0.8 + Math.random() * 2.2,
          hue: gold ? 42 + Math.random() * 12 : 210,
          twinklePhase: Math.random() * Math.PI * 2,
        });
      }
    };
    window.addEventListener("mousemove", onMove, { passive: true });

    const drawStar = (p: Particle) => {
      const t = p.life / p.maxLife; // 0 -> 1
      const fade = t < 0.15 ? t / 0.15 : 1 - (t - 0.15) / 0.85;
      const twinkle = 0.55 + 0.45 * Math.sin(p.twinklePhase + p.life / 90);
      const alpha = Math.max(0, fade * twinkle);
      const r = p.size * (1 - t * 0.5);

      // Core glow
      const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 4);
      grad.addColorStop(0, `hsla(${p.hue}, 95%, 78%, ${0.85 * alpha})`);
      grad.addColorStop(0.4, `hsla(${p.hue}, 90%, 62%, ${0.35 * alpha})`);
      grad.addColorStop(1, `hsla(${p.hue}, 90%, 60%, 0)`);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(p.x, p.y, r * 4, 0, Math.PI * 2);
      ctx.fill();

      // Sparkle cross for larger stars
      if (p.size > 1.8) {
        ctx.strokeStyle = `hsla(${p.hue}, 95%, 85%, ${0.7 * alpha})`;
        ctx.lineWidth = 0.8;
        const len = r * 3.2;
        ctx.beginPath();
        ctx.moveTo(p.x - len, p.y);
        ctx.lineTo(p.x + len, p.y);
        ctx.moveTo(p.x, p.y - len);
        ctx.lineTo(p.x, p.y + len);
        ctx.stroke();
      }
    };

    const tick = (now: number) => {
      ctx.clearRect(0, 0, width, height);
      glowPulse += 0.03;

      // Soft comet glow hugging the cursor
      if (mouseX >= 0) {
        const pulse = 1 + Math.sin(glowPulse) * 0.12;
        const g = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, 26 * pulse);
        g.addColorStop(0, "hsla(46, 100%, 80%, 0.28)");
        g.addColorStop(0.5, "hsla(44, 95%, 65%, 0.10)");
        g.addColorStop(1, "hsla(44, 95%, 60%, 0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(mouseX, mouseY, 26 * pulse, 0, Math.PI * 2);
        ctx.fill();
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life += 16.7;
        if (p.life >= p.maxLife) {
          particles.splice(i, 1);
          continue;
        }
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.985;
        p.vy *= 0.985;
        drawStar(p);
      }

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-50"
    />
  );
}
