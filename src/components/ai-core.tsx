'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface Orb {
  x: number;
  y: number;
  z: number;
  r: number;
  pulse: number;
}

// Technology capsules positioned around the core, connected by neural lines
const TECH = [
  { label: 'Python', angle: 0 },
  { label: 'TensorFlow', angle: 55 },
  { label: 'OpenCV', angle: 112 },
  { label: 'YOLO', angle: 168 },
  { label: 'React', angle: 224 },
  { label: 'Node.js', angle: 282 },
  { label: 'MongoDB', angle: 338 },
];

const BINARY = '0101101011010010';

export function AICore() {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / rect.width;
      const dy = (e.clientY - cy) / rect.height;
      setTilt({ x: dy * 16, y: dx * 16 });
    };
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

// Deterministic neural sphere points (Fibonacci sphere distribution — pure, stable & hydration-safe)
const ORB_POINTS: Orb[] = Array.from({ length: 38 }, (_, i) => {
  const phi = Math.acos(1 - (2 * (i + 0.5)) / 38);
  const goldenRatio = 1.618033988749895;
  const theta = (2 * Math.PI * i) / goldenRatio;
  const r = 0.85 + (i % 5) * 0.03;
  return {
    x: r * Math.sin(phi) * Math.cos(theta),
    y: r * Math.sin(phi) * Math.sin(theta),
    z: r * Math.cos(phi),
    r: 1.5 + (i % 3) * 0.5,
    pulse: (i * 0.6) % (Math.PI * 2),
  };
});

  const orbs = ORB_POINTS;

  // Rotating neural-sphere canvas (projected 3D point cloud with connections)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let raf = 0;
    let W = 0;
    let H = 0;
    let angleX = 0.4;
    let angleY = 0.6;

    const points = Array.from({ length: 64 }, () => {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 0.72 + Math.random() * 0.28;
      return {
        x: r * Math.sin(phi) * Math.cos(theta),
        y: r * Math.sin(phi) * Math.sin(theta),
        z: r * Math.cos(phi),
      };
    });

    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      W = rect?.width || 400;
      H = rect?.height || 400;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const project = (p: { x: number; y: number; z: number }) => {
      // rotate Y
      const cosY = Math.cos(angleY);
      const sinY = Math.sin(angleY);
      const x1 = p.x * cosY + p.z * sinY;
      const z1 = -p.x * sinY + p.z * cosY;
      // rotate X
      const cosX = Math.cos(angleX);
      const sinX = Math.sin(angleX);
      const y1 = p.y * cosX - z1 * sinX;
      const z2 = p.y * sinX + z1 * cosX;
      const scale = W / 2.6;
      return {
        sx: W / 2 + x1 * scale,
        sy: H / 2 + y1 * scale,
        z: z2,
      };
    };

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      if (!reduceMotion) {
        angleX += 0.004;
        angleY += 0.006;
      }
const projected = points.map((p) => ({ p, ...project(p) }));

      // wires (connections between nearby projected points) — capped for perf
      ctx.lineWidth = 0.5;
      const maxConn = 40;
      let conn = 0;
      for (let i = 0; i < projected.length && conn < maxConn; i++) {
        for (let j = i + 1; j < projected.length && conn < maxConn; j++) {
          const a = projected[i];
          const b = projected[j];
          const d = Math.hypot(a.sx - b.sx, a.sy - b.sy);
          if (d < W * 0.16) {
            const alpha = (1 - d / (W * 0.16)) * 0.16;
            ctx.strokeStyle = `rgba(244,180,0,${alpha})`;
            ctx.beginPath();
            ctx.moveTo(a.sx, a.sy);
            ctx.lineTo(b.sx, b.sy);
            ctx.stroke();
            conn++;
          }
        }
      }

      // dots (depth-cued) — no shadowBlur for 60fps
      for (const pt of projected) {
        const depthCue = 0.35 + (pt.z + 1) * 0.3;
        ctx.fillStyle = `rgba(255,200,80,${depthCue})`;
        ctx.beginPath();
        ctx.arc(pt.sx, pt.sy, 1.6, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
className="relative w-[420px] h-[420px] sm:w-[580px] sm:h-[580px] mx-auto group cursor-pointer breathe"
      style={{ perspective: 1200 }}
    >
      {/* Volumetric golden light behind */}
      <motion.div
        animate={{ opacity: hovered ? 1 : 0.85, scale: hovered ? 1.18 : 1 }}
        transition={{ duration: 0.6 }}
        className="absolute inset-[-15%] -z-10 rounded-full bg-[radial-gradient(circle,rgba(244,180,0,0.32)_0%,rgba(244,180,0,0.08)_45%,transparent_70%)] blur-2xl energy-pulse"
      />

      {/* Holographic globe wireframe mesh */}
      <div className="absolute inset-6 rounded-full border border-[#f4b400]/15 spin-slowest">
        <div className="absolute inset-0 rounded-full border border-[#f4b400]/10" />
        <div className="absolute inset-0 rounded-full border border-[#f4b400]/10" style={{ transform: 'rotateX(60deg)' }} />
        <div className="absolute inset-0 rounded-full border border-[#f4b400]/10" style={{ transform: 'rotateY(60deg)' }} />
        {/* latitude lines */}
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="absolute inset-0 rounded-full border border-[#f4b400]/10"
            style={{ transform: `rotateX(${i * 30}deg)` }}
          />
        ))}
      </div>

      {/* Rotating 3D tilt group */}
      <motion.div
        animate={{ rotateX: tilt.x, rotateY: tilt.y, scale: hovered ? 1.05 : 1 }}
        transition={{ type: 'spring', stiffness: 60, damping: 15 }}
        className="relative w-full h-full"
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* HUD rotating rings */}
        <div className="absolute inset-0 rounded-full border border-[#f4b400]/40 spin-slow" />
        <div className="absolute inset-7 rounded-full border border-dashed border-[#f4b400]/30 spin-slower" />
        <div
          className="absolute inset-14 rounded-full border border-[#f4b400]/40 spin-slow"
          style={{ borderTopColor: 'transparent', borderBottomColor: 'transparent' }}
        />
        <div
          className="absolute inset-20 rounded-full border border-dotted border-[#f4b400]/25 spin-slower"
          style={{ borderLeftColor: 'transparent', borderRightColor: 'transparent' }}
        />

        {/* HUD tick marks */}
        {Array.from({ length: 48 }).map((_, i) => {
          const angle = (i / 48) * Math.PI * 2;
          const outer = 295;
          return (
            <div
              key={i}
              className="absolute left-1/2 top-1/2 w-px h-2 bg-[#f4b400]/60"
              style={{
                transform: `translate(-50%,-50%) rotate(${angle}rad) translateY(${-outer}px)`,
                height: i % 4 === 0 ? 14 : 8,
              }}
            />
          );
        })}

        {/* Neural sphere canvas */}
        <canvas
          ref={canvasRef}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] h-[70%] rounded-full"
        />

        {/* Center AI chip */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <motion.div
            animate={{ scale: hovered ? 1.12 : 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 12 }}
            className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-3xl bg-card border border-[#f4b400]/60 glow-gold flex items-center justify-center code-chip"
          >
            <div className="absolute inset-2 rounded-2xl border border-[#f4b400]/25" />
            <div className="absolute inset-4 rounded-xl border border-[#f4b400]/10" />
            {/* chip circuit traces */}
            <svg className="absolute inset-3 w-[calc(100%-24px)] h-[calc(100%-24px)]" width="100%" height="100%">
              <line x1="50%" y1="0" x2="50%" y2="100%" stroke="rgba(244,180,0,0.35)" strokeWidth="1" className="circuit-flow" />
              <line x1="0" y1="50%" x2="100%" y2="50%" stroke="rgba(244,180,0,0.35)" strokeWidth="1" className="circuit-flow" />
              <line x1="25%" y1="0" x2="25%" y2="100%" stroke="rgba(244,180,0,0.2)" strokeWidth="1" />
              <line x1="75%" y1="0" x2="75%" y2="100%" stroke="rgba(244,180,0,0.2)" strokeWidth="1" />
            </svg>
            <div className="text-center">
              <div className="text-amber font-black text-3xl sm:text-4xl font-mono text-glow-gold">AI</div>
              <div className="text-muted text-[10px] font-mono tracking-[0.3em]">CORE</div>
            </div>
            {/* Pins */}
            {Array.from({ length: 16 }).map((_, i) => {
              const onTop = i < 4;
              const onBottom = i >= 4 && i < 8;
              const onLeft = i >= 8 && i < 12;
              const left = `${15 + (i % 4) * 23}%`;
              const top = `${15 + (i % 4) * 23}%`;
              return (
                <div
                  key={i}
                  className="absolute w-1.5 h-1.5 bg-[#f4b400]/80"
                  style={
                    onTop
                      ? { top: -7, left }
                      : onBottom
                      ? { bottom: -7, left }
                      : onLeft
                      ? { left: -7, top }
                      : { right: -7, top }
                  }
                />
              );
            })}
          </motion.div>
        </div>

        {/* Static neural points (extra sparkle) */}
        {orbs.map((o, i) => (
          <motion.div
            key={i}
            className="absolute left-1/2 top-1/2 rounded-full bg-[#f4b400]"
            style={{
              width: o.r,
              height: o.r,
              transform: `translate(-50%,-50%) translate3d(${o.x * 190}px, ${o.y * 190}px, ${o.z * 190}px)`,
              boxShadow: '0 0 8px rgba(244,180,0,0.8)',
            }}
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 3 + (i % 3), repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}
      </motion.div>

      {/* Computer-vision scan sweep */}
      <div className="scan-sweep" />

      {/* Binary streams */}
      {[8, 22, 36, 64, 78, 92].map((left, i) => (
        <div
          key={i}
          className="binary-stream"
          style={{ left: `${left}%`, animationDuration: `${6 + i * 1.5}s`, animationDelay: `${i * 0.7}s` }}
        >
          {BINARY}
        </div>
      ))}

      {/* Energy emission rings */}
      <div className="emit-ring" style={{ animationDelay: '0s' }} />
      <div className="emit-ring" style={{ animationDelay: '1.6s' }} />

      {/* Orbiting technology capsules + neural lines */}
      {TECH.map((t, i) => {
        const angle = (t.angle * Math.PI) / 180;
        const radius = 58;
        const x = 50 + radius * Math.cos(angle);
        const y = 50 + radius * Math.sin(angle);
        const cx = 50;
        const cy = 50;
        return (
          <React.Fragment key={t.label}>
            {/* glowing neural line from center-ish to capsule */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              style={{ zIndex: -1 }}
            >
              <line
                x1={`${cx}%`}
                y1={`${cy}%`}
                x2={`${x}%`}
                y2={`${y}%`}
                stroke="rgba(244,180,0,0.35)"
                strokeWidth="1"
                className="synapse-line"
              />
            </svg>
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 + i * 0.12, type: 'spring', stiffness: 150 }}
              className="absolute -translate-x-1/2 -translate-y-1/2 orbit-float"
              style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${i * 0.4}s` }}
            >
              <div className="glass-panel rounded-full px-3 py-1.5 border border-[#f4b400]/40 flex items-center gap-1.5 whitespace-nowrap hover:border-[#f4b400] transition-colors">
                <span className="w-1.5 h-1.5 rounded-full bg-[#f4b400] animate-pulse" />
                <span className="text-[10px] sm:text-[11px] font-mono font-black text-amber">
                  {t.label}
                </span>
              </div>
            </motion.div>
          </React.Fragment>
        );
      })}

      {/* Ambient glow behind core */}
      <motion.div
        animate={{ opacity: hovered ? 1 : 0.8, scale: hovered ? 1.15 : 1 }}
        transition={{ duration: 0.6 }}
        className="absolute inset-[-10%] -z-10 rounded-full bg-[radial-gradient(circle,rgba(244,180,0,0.28)_0%,transparent_65%)] blur-2xl"
      />
    </div>
  );
}
