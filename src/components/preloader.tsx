'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  life: number;
}

interface FlowParticle {
  x: number;
  y: number;
  tx: number;
  ty: number;
  speed: number;
  size: number;
  alpha: number;
}

const QUOTES = [
  'Every breakthrough begins with a single line of code.',
  'Building systems that think, learn, and evolve.',
  'Where Machine Learning meets Human Imagination.',
  'Engineering tomorrow through Artificial Intelligence.',
];

type Stage = 'quote' | 'init' | 'activating' | 'core' | 'zoom' | 'done';

// Precomputed connection pairs (static between runs) — avoids O(n²) per frame
interface Conn {
  a: number;
  b: number;
  d: number;
}

export function Preloader({ onComplete }: { onComplete: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [stage, setStage] = useState<Stage>('quote');
  const [quote] = useState(() => QUOTES[Math.floor(Math.random() * QUOTES.length)]);
  const [quoteWords] = useState<string[]>(() => quote.split(' '));
  const [wordCount, setWordCount] = useState(0);
  const [showInit, setShowInit] = useState(false);
  const stageRef = useRef<Stage>('quote');
  const particlesRef = useRef<Particle[]>([]);
  const flowRef = useRef<FlowParticle[]>([]);
  const bootStartRef = useRef(0);

  // Sync stage ref for canvas loop
  useEffect(() => {
    stageRef.current = stage;
  }, [stage]);

  // Word-by-word quote reveal (fast, 30ms/word)
  useEffect(() => {
setWordCount(0);
    const interval = setInterval(() => {
      setWordCount((c) => {
        if (c >= quoteWords.length) {
          clearInterval(interval);
          return c;
        }
        return c + 1;
      });
    }, 55);
    return () => clearInterval(interval);
  }, [quoteWords]);

  // After quote completes, hold it on screen so it's readable, then show initialize
  useEffect(() => {
    if (wordCount >= quoteWords.length && quoteWords.length > 0) {
      const t = setTimeout(() => {
        setStage('init');
        setShowInit(true);
      }, 1800);
      return () => clearTimeout(t);
    }
  }, [wordCount, quoteWords.length]);

  const handleInitialize = () => {
    setStage('activating');
    bootStartRef.current = performance.now();
    setTimeout(() => setStage('core'), 1200);
    setTimeout(() => setStage('zoom'), 3000);
    setTimeout(() => {
      setStage('done');
      onComplete();
    }, 5000);
  };

  // Main canvas: ambient dust + activation burst + core assembly + camera zoom
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    let W = 0;
    let H = 0;

    const resize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W;
      canvas.height = H;
    };
    resize();
    window.addEventListener('resize', resize);

    // Soft golden dust particles (mysterious black screen atmosphere)
    const dust: { x: number; y: number; r: number; a: number; vy: number }[] = [];
    for (let i = 0; i < 45; i++) {
      dust.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.5 + 0.4,
        a: Math.random() * 0.35 + 0.1,
        vy: -(Math.random() * 0.15 + 0.03),
      });
    }

    // Neural nodes
    const nodes: { x: number; y: number }[] = [];
    for (let i = 0; i < 34; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * Math.min(W, H) * 0.42;
      nodes.push({
        x: W / 2 + Math.cos(angle) * dist,
        y: H / 2 + Math.sin(angle) * dist,
      });
    }

    // Precompute connections once (pair index + distance), capped for perf
    const conns: Conn[] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const d = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y);
        if (d < 90) conns.push({ a: i, b: j, d });
      }
    }

    const draw = () => {
      const s = stageRef.current;
      const cx = W / 2;
      const cy = H / 2;
      const now = performance.now();

      ctx.clearRect(0, 0, W, H);

      // Ambient dust — only animate positions during quote/init (minimal motion)
      if (s === 'quote' || s === 'init') {
        for (const d of dust) {
          d.y += d.vy;
          if (d.y < -10) { d.y = H + 10; d.x = Math.random() * W; }
          ctx.globalAlpha = d.a;
          ctx.fillStyle = '#e8b64c';
          ctx.beginPath();
          ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      }

      // Activation burst
      if (s === 'activating') {
        const elapsed = now - bootStartRef.current;
        // Expanding rings
        for (let i = 0; i < 3; i++) {
          const p = (elapsed / 900 - i * 0.18) % 1;
          if (p >= 0 && p <= 1) {
            ctx.strokeStyle = `rgba(244,180,0,${(1 - p) * 0.7})`;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(cx, cy, 20 + p * 260, 0, Math.PI * 2);
            ctx.stroke();
          }
        }
        // Particle explosion
        if (particlesRef.current.length < 90 && Math.random() < 0.4) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 2 + Math.random() * 5;
          particlesRef.current.push({
            x: cx, y: cy,
            vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
            size: Math.random() * 2.2 + 0.8, alpha: 1, life: 1,
          });
        }
        // Neural node connections (precomputed pairs)
        if (elapsed > 300) {
          const fade = Math.min(1, (elapsed - 300) / 700);
          ctx.lineWidth = 0.7;
          for (const c of conns) {
            ctx.strokeStyle = `rgba(244,180,0,${(0.5 - (c.d / 90) * 0.4) * fade})`;
            ctx.beginPath();
            ctx.moveTo(nodes[c.a].x, nodes[c.a].y);
            ctx.lineTo(nodes[c.b].x, nodes[c.b].y);
            ctx.stroke();
          }
          // nodes
          ctx.fillStyle = `rgba(255,200,80,${0.7 * fade})`;
          for (const n of nodes) {
            ctx.beginPath();
            ctx.arc(n.x, n.y, 1.6, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      // Core formation stage
      if (s === 'core') {
        const elapsed = now - bootStartRef.current - 1200;
        const grow = Math.max(0, Math.min(1, elapsed / 800));
        const rad = 120 * grow;
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(1, rad * 2.2));
        g.addColorStop(0, `rgba(244,180,0,${0.5 * grow})`);
        g.addColorStop(0.4, `rgba(244,180,0,${0.16 * grow})`);
        g.addColorStop(1, 'rgba(244,180,0,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(cx, cy, Math.max(1, rad * 2.2), 0, Math.PI * 2);
        ctx.fill();

        // Rotating holographic rings + dots
        for (let i = 0; i < 3; i++) {
          const r = Math.max(1, (100 + i * 34) * grow + Math.sin(now / 500 + i) * 4);
          ctx.strokeStyle = `rgba(255,176,0,${(0.3 - i * 0.06) * grow})`;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.stroke();
          const a = now / 420 + i * 2.1;
          ctx.fillStyle = `rgba(255,220,120,${0.9 * grow})`;
          ctx.beginPath();
          ctx.arc(cx + Math.cos(a) * r, cy + Math.sin(a) * r, 2.4, 0, Math.PI * 2);
          ctx.fill();
        }

        // Data fragments flowing inward (assembly)
        if (flowRef.current.length < 30 && Math.random() < 0.3) {
          const angle = Math.random() * Math.PI * 2;
          const dist = Math.min(W, H) * 0.5;
          flowRef.current.push({
            x: cx + Math.cos(angle) * dist, y: cy + Math.sin(angle) * dist,
            tx: cx, ty: cy,
            speed: 0.03 + Math.random() * 0.03,
            size: Math.random() * 2 + 1, alpha: 1,
          });
        }
        for (let i = flowRef.current.length - 1; i >= 0; i--) {
          const p = flowRef.current[i];
          p.x += (p.tx - p.x) * p.speed;
          p.y += (p.ty - p.y) * p.speed;
          p.alpha *= 0.985;
          if (Math.hypot(p.tx - p.x, p.ty - p.y) < 6 || p.alpha < 0.05) {
            flowRef.current.splice(i, 1);
            continue;
          }
          ctx.globalAlpha = p.alpha;
          ctx.fillStyle = '#ffd76a';
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;
        }
      }

      // Camera zoom stage
      if (s === 'zoom') {
        const elapsed = now - bootStartRef.current - 3000;
        const p = Math.min(1, elapsed / 1800);
        const scale = 1 + p * 14;
        for (let i = 0; i < 4; i++) {
          const r = (60 + i * 42) * scale;
          ctx.strokeStyle = `rgba(244,180,0,${(0.35 - i * 0.05) * (1 - p * 0.6)})`;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.stroke();
        }
        const glowR = Math.min(Math.max(W, H) * 1.4, 100 * scale);
        const gg = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
        gg.addColorStop(0, `rgba(255,220,120,${0.85 * p})`);
        gg.addColorStop(0.3, `rgba(244,180,0,${0.4 * p})`);
        gg.addColorStop(1, 'rgba(244,180,0,0)');
        ctx.fillStyle = gg;
        ctx.beginPath();
        ctx.arc(cx, cy, glowR, 0, Math.PI * 2);
        ctx.fill();
        for (let i = 0; i < 8; i++) {
          const a = (i / 8) * Math.PI * 2 + now * 0.0004;
          const len = (120 + i * 20) * scale;
          ctx.strokeStyle = `rgba(244,180,0,${0.3 * (1 - p * 0.5)})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(cx + Math.cos(a) * len, cy + Math.sin(a) * len);
          ctx.stroke();
        }
      }

      // Update explosion particles (always, cheap)
      const ps = particlesRef.current;
      for (let i = ps.length - 1; i >= 0; i--) {
        const p = ps[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.98;
        p.vy *= 0.98;
        p.life -= 0.02;
        p.alpha = Math.max(0, p.life);
        if (p.life <= 0) { ps.splice(i, 1); continue; }
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = '#ffb000';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
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
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: 'easeInOut' }}
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black overflow-hidden"
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* STEP 2 — QUOTE (word by word, rendered statically once revealed) */}
      <AnimatePresence>
        {stage === 'quote' && (
          <motion.div
            key="quote"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.6 } }}
            className="absolute inset-0 flex items-center justify-center px-6"
          >
            <div className="text-center max-w-3xl">
              <p className="caption-mono text-[#f4b400]/70 mb-6 tracking-[0.4em] uppercase">
                AI Operating System
              </p>
              <h2 className="display-hero text-white/90 leading-tight">
                {quoteWords.slice(0, wordCount).concat(wordCount < quoteWords.length ? [''] : []).map((w, i) => (
                  <span
                    key={i}
                    className="inline-block mr-2"
                    style={{
                      opacity: i < wordCount ? 1 : 0,
                      filter: i < wordCount ? 'blur(0px)' : 'blur(6px)',
                      transition: 'opacity 0.25s ease, filter 0.25s ease',
                    }}
                  >
                    {w}
                  </span>
                ))}
                <span className="blink text-[#f4b400]">_</span>
              </h2>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* STEP 3 — INITIALIZE BUTTON */}
      <AnimatePresence>
        {stage === 'init' && showInit && (
          <motion.div
            key="init"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6, transition: { duration: 0.4 } }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <motion.button
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const ripple = document.createElement('span');
                const size = Math.max(rect.width, rect.height) * 2;
                ripple.className = 'ripple';
                ripple.style.width = ripple.style.height = `${size}px`;
                ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
                ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
                e.currentTarget.appendChild(ripple);
                setTimeout(() => ripple.remove(), 700);
                handleInitialize();
              }}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.96 }}
              className="ripple-container relative px-10 py-4 rounded-2xl glass-panel border border-[#f4b400]/50 text-[#ffd76a] font-mono font-bold tracking-[0.3em] uppercase text-sm glow-gold breathe"
            >
              <span className="relative z-10">Initialize System</span>
              <span className="absolute inset-0 rounded-2xl border border-[#f4b400]/30 animate-ping" style={{ animationDuration: '2.4s' }} />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* STEP 5 — CORE FORMATION caption */}
      <AnimatePresence>
        {(stage === 'core' || stage === 'activating') && (
          <motion.div
            key="core-caption"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-16 left-0 right-0 text-center pointer-events-none"
          >
            <p className="caption-mono text-[#f4b400]/70 tracking-[0.35em] uppercase">
              {stage === 'activating' ? 'Neural Network Formation' : 'Energy Core Creation'}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
