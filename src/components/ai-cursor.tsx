'use client';

import React, { useEffect, useRef } from 'react';

// AI cursor: glowing dot + reactive ring that expands over interactive elements
export function AICursor() {
  const dotRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    let targetX = 0;
    let targetY = 0;
    let ringX = 0;
    let ringY = 0;
    let raf = 0;

    const onMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      dot.style.left = `${e.clientX}px`;
      dot.style.top = `${e.clientY}px`;

      // Detect interactive element
      const el = e.target as HTMLElement;
      const interactive = el.closest('a, button, input, textarea, [role="button"]');
      ring.classList.toggle('is-hovering', !!interactive);
    };

    const loop = () => {
      ringX += (targetX - ringX) * 0.18;
      ringY += (targetY - ringY) * 0.18;
      ring.style.left = `${ringX}px`;
      ring.style.top = `${ringY}px`;
      raf = requestAnimationFrame(loop);
    };

    window.addEventListener('mousemove', onMove);
    raf = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <div ref={dotRef} className="cursor-dot hidden md:block" />
      <div ref={ringRef} className="cursor-ring hidden md:block" />
    </>
  );
}
