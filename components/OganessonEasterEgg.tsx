"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  color: string;
  life: number;
  maxLife: number;
}

const COLORS = ["#a855f7", "#6366f1", "#06b6d4", "#f43f5e", "#eab308", "#22d3ee"];

function createBurst(cx: number, cy: number): Particle[] {
  const particles: Particle[] = [];
  for (let i = 0; i < 80; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 2 + Math.random() * 6;
    const maxLife = 40 + Math.random() * 60;
    particles.push({
      x: cx,
      y: cy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: 1 + Math.random() * 3,
      opacity: 1,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      life: 0,
      maxLife,
    });
  }
  return particles;
}

export function OganessonEasterEgg({ elementId }: { elementId: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [triggered, setTriggered] = useState(false);
  const particlesRef = useRef<Particle[]>([]);
  const animRef = useRef<number>(0);
  const ctxRef = useRef<AudioContext | null>(null);

  const playSubBass = useCallback(() => {
    try {
      const ctx = ctxRef.current || new AudioContext();
      ctxRef.current = ctx;
      if (ctx.state === "suspended") ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = 30;

      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 3);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 3);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = "sine";
      osc2.frequency.value = 45;
      gain2.gain.setValueAtTime(0, ctx.currentTime + 0.1);
      gain2.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.15);
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.5);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(ctx.currentTime + 0.1);
      osc2.stop(ctx.currentTime + 2.6);
    } catch {}
  }, []);

  useEffect(() => {
    if (elementId === 118 && !triggered) {
      setTriggered(true);
      playSubBass();
      const canvas = canvasRef.current;
      if (canvas) {
        particlesRef.current = createBurst(canvas.width / 2, canvas.height / 2);
      }
    }
    if (elementId !== 118) {
      setTriggered(false);
      particlesRef.current = [];
    }
  }, [elementId, triggered, playSubBass]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener("resize", resize);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
      const particles = particlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.02;
        p.vx *= 0.99;
        p.vy *= 0.99;
        p.life++;
        p.opacity = 1 - p.life / p.maxLife;
        if (p.life >= p.maxLife) {
          particles.splice(i, 1);
          continue;
        }
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      animRef.current = requestAnimationFrame(animate);
    };

    if (triggered) {
      animate();
    }

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animRef.current);
    };
  }, [triggered]);

  if (elementId !== 118) return null;

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-[60]"
      style={{ opacity: triggered ? 1 : 0 }}
    />
  );
}
