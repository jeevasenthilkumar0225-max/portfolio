'use client';

import React, { useEffect, useRef } from 'react';
import { useTheme } from './theme-provider';

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  pulse: number;
}

interface AnimatedBackgroundProps {
  active?: string;
}

export function AnimatedBackground({ active = 'home' }: AnimatedBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let W = (canvas.width = window.innerWidth);
    let H = (canvas.height = window.innerHeight);

    const resize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);

    const nodeCount = Math.min(45, Math.floor((W * H) / 24000));
    const nodes: Node[] = Array.from({ length: nodeCount }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 1.5 + 1,
      pulse: Math.random() * Math.PI * 2,
    }));

    const render = () => {
      ctx.clearRect(0, 0, W, H);

      // Node constellation mesh
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        n.x += n.vx;
        n.y += n.vy;

        if (n.x < 0 || n.x > W) n.vx *= -1;
        if (n.y < 0 || n.y > H) n.vy *= -1;

        n.pulse += 0.02;
        const opacity = isDark ? 0.35 + Math.sin(n.pulse) * 0.15 : 0.2 + Math.sin(n.pulse) * 0.1;

        ctx.fillStyle = isDark ? `rgba(244, 180, 0, ${opacity})` : `rgba(184, 134, 11, ${opacity})`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();

        for (let j = i + 1; j < nodes.length; j++) {
          const n2 = nodes[j];
          const dist = Math.hypot(n.x - n2.x, n.y - n2.y);
          if (dist < 120) {
            const lineAlpha = (1 - dist / 120) * (isDark ? 0.12 : 0.08);
            ctx.strokeStyle = isDark ? `rgba(244, 180, 0, ${lineAlpha})` : `rgba(184, 134, 11, ${lineAlpha})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(n.x, n.y);
            ctx.lineTo(n2.x, n2.y);
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isDark]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden transition-colors duration-500">
      {/* Dynamic Luxury Ambient Lighting */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[450px] rounded-full blur-3xl opacity-70 transition-all duration-700 pointer-events-none"
        style={{
          background: isDark
            ? 'radial-gradient(circle at 50% 0%, rgba(244, 180, 0, 0.14) 0%, rgba(10, 10, 14, 0) 70%)'
            : 'radial-gradient(circle at 50% 0%, rgba(212, 175, 55, 0.09) 0%, rgba(250, 250, 250, 0) 70%)',
        }}
      />

      <div
        className="absolute bottom-0 right-0 w-[600px] h-[400px] rounded-full blur-3xl opacity-50 transition-all duration-700 pointer-events-none"
        style={{
          background: isDark
            ? 'radial-gradient(circle at 100% 100%, rgba(255, 140, 0, 0.10) 0%, rgba(10, 10, 14, 0) 65%)'
            : 'radial-gradient(circle at 100% 100%, rgba(184, 134, 11, 0.06) 0%, rgba(250, 250, 250, 0) 65%)',
        }}
      />

      {/* Micro Architectural Dot Grid */}
      <div
        className="absolute inset-0 opacity-40 dark:opacity-30 pointer-events-none"
        style={{
          backgroundImage: isDark
            ? 'radial-gradient(rgba(244, 180, 0, 0.15) 1px, transparent 1px)'
            : 'radial-gradient(rgba(184, 134, 11, 0.18) 1px, transparent 1px)',
          backgroundSize: '36px 36px',
          maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, #000 70%, transparent 100%)',
        }}
      />

      {/* Interactive Constellation Mesh Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
}
