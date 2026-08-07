'use client';

import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  color: string;
  decay: number;
}

export function GoldenCursorSpark() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    let isMouseDown = false;
    let lastTime = 0;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Fire Red & Radiant Gold Color Palette (Vibrant in Light & Dark Mode)
    const fireGoldColors = [
      '#FF4500', // Orange Red Fire
      '#EF4444', // Flame Red
      '#F97316', // Deep Orange
      '#FFD700', // Gold
      '#F59E0B', // Vibrant Amber
      '#FFF5F5', // Flame White Core
    ];

    const addSparks = (x: number, y: number, count = 2, speedMultiplier = 1) => {
      // Limit active particle count to 40 for 60FPS ultra-smooth performance
      if (particles.length > 40) return;

      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = (Math.random() * 2 + 0.6) * speedMultiplier;
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 0.4,
          size: Math.random() * 3.5 + 2,
          alpha: 1,
          color: fireGoldColors[Math.floor(Math.random() * fireGoldColors.length)],
          decay: Math.random() * 0.035 + 0.02,
        });
      }
    };

    let lastMoveTime = 0;
    const handleMouseMove = (e: MouseEvent) => {
      const now = performance.now();
      if (now - lastMoveTime > 25) { // Throttle mousemove spark spawning for zero lag
        addSparks(e.clientX, e.clientY, isMouseDown ? 4 : 2, isMouseDown ? 1.8 : 1);
        lastMoveTime = now;
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      isMouseDown = true;
      // Click burst of red-gold fire sparks
      addSparks(e.clientX, e.clientY, 12, 2.5);
    };

    const handleMouseUp = () => {
      isMouseDown = false;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        addSparks(touch.clientX, touch.clientY, 2, 1);
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mousedown', handleMouseDown, { passive: true });
    window.addEventListener('mouseup', handleMouseUp, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    const render = (time: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;
        p.size *= 0.96;

        if (p.alpha <= 0 || p.size <= 0.3) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle = p.color;

        // Subtle glow effect
        ctx.shadowBlur = 6;
        ctx.shadowColor = p.color;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
    />
  );
}

