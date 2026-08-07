'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Maximize2, Minimize2, Volume2, VolumeX, Music, Sun, Moon } from 'lucide-react';
import { useTheme } from './theme-provider';

interface AmbientControlsProps {
  startMusic?: boolean;
}

export function AmbientControls({ startMusic = false }: AmbientControlsProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const audioRef = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);
  const timerRef = useRef<number | null>(null);
  const startedRef = useRef(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  const startMusicFn = () => {
    const Ctx = window.AudioContext || (window as any).webkitAudioContext;
    if (!Ctx) return;

    if (!audioRef.current) {
      const ctx = new Ctx();
      audioRef.current = ctx;

      const master = ctx.createGain();
      master.gain.value = 0.0;
      master.connect(ctx.destination);
      masterRef.current = master;

      const gain = ctx.createGain();
      gain.gain.value = 0.5;
      gain.connect(master);

      const notes = [110, 164.81, 220, 277.18, 329.63];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        osc.type = i % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.value = freq;
        osc.detune.value = (Math.random() - 0.5) * 8;

        const oGain = ctx.createGain();
        oGain.gain.value = 0.08;

        const lfo = ctx.createOscillator();
        lfo.frequency.value = 0.05 + Math.random() * 0.05;
        const lfoGain = ctx.createGain();
        lfoGain.gain.value = 0.05 + Math.random() * 0.03;
        lfo.connect(lfoGain);
        lfoGain.connect(oGain.gain);

        osc.connect(oGain);
        oGain.connect(gain);
        osc.start();
        lfo.start();
      });
    }

    if (audioRef.current.state === 'suspended') {
      audioRef.current.resume();
    }

    if (masterRef.current && audioRef.current) {
      masterRef.current.gain.cancelScheduledValues(audioRef.current.currentTime);
      masterRef.current.gain.linearRampToValueAtTime(
        isMuted ? 0 : 0.5,
        audioRef.current.currentTime + 1
      );
    }
    setIsPlaying(true);
  };

  const stopMusicFn = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (audioRef.current && masterRef.current) {
      masterRef.current.gain.cancelScheduledValues(audioRef.current.currentTime);
      masterRef.current.gain.linearRampToValueAtTime(
        0,
        audioRef.current.currentTime + 0.4
      );
    }
    setIsPlaying(false);
    const ctx = audioRef.current;
    timerRef.current = window.setTimeout(() => {
      ctx?.suspend();
    }, 500);
  };

  const toggleMusic = () => {
    if (isPlaying) {
      stopMusicFn();
    } else {
      startMusicFn();
    }
  };

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    if (masterRef.current && audioRef.current) {
      masterRef.current.gain.cancelScheduledValues(audioRef.current.currentTime);
      masterRef.current.gain.linearRampToValueAtTime(
        next ? 0 : 0.5,
        audioRef.current.currentTime + 0.3
      );
    }
  };

  // Start music automatically on the first user gesture after the preloader finishes
  useEffect(() => {
    if (!startMusic) return;

    const tryStart = () => {
      if (!startedRef.current) {
        startedRef.current = true;
        startMusicFn();
        cleanup();
      }
    };
    const cleanup = () => {
      window.removeEventListener('click', tryStart);
      window.removeEventListener('keydown', tryStart);
      window.removeEventListener('touchstart', tryStart);
    };
    window.addEventListener('click', tryStart);
    window.addEventListener('keydown', tryStart);
    window.addEventListener('touchstart', tryStart);
    return cleanup;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startMusic]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      audioRef.current?.close?.();
    };
  }, []);

  const btnBase =
    'flex items-center justify-center gap-1.5 p-2.5 rounded-full border transition-all duration-300 cursor-pointer';

  return (
    <div className="fixed top-4 right-4 z-[60] flex items-center gap-2">
      {/* Theme toggle */}
      <motion.button
        whileHover={{ scale: 1.1, rotate: 6 }}
        whileTap={{ scale: 0.9 }}
        onClick={toggleTheme}
        title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        aria-label="Toggle light / dark theme"
        className={`${btnBase} ${
          isDark
            ? 'bg-card border-border hover:border-amber text-amber'
            : 'bg-amber text-[#050505] border-amber glow-gold'
        }`}
      >
        {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      </motion.button>

      {/* Music toggle */}
      <motion.button
        whileHover={{ scale: 1.1, rotate: 6 }}
        whileTap={{ scale: 0.9 }}
        onClick={toggleMusic}
        title={isPlaying ? 'Pause ambient music' : 'Play ambient music'}
        aria-label="Toggle music"
        className={`${btnBase} ${
          isPlaying
            ? 'bg-amber text-[#050505] border-amber glow-gold'
            : 'bg-card border-border hover:border-amber text-amber'
        }`}
      >
        <Music className="w-4 h-4" />
        {isPlaying && (
          <span className="flex items-end gap-[2px] h-4">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                animate={{ scaleY: [0.3, 1, 0.3] }}
                transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                className="w-[3px] h-full bg-[#050505] rounded-full origin-bottom"
              />
            ))}
          </span>
        )}
      </motion.button>

      {/* Mute option */}
      {isPlaying && (
        <motion.button
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={toggleMute}
          title={isMuted ? 'Unmute' : 'Mute'}
          aria-label="Mute or unmute music"
          className={`${btnBase} ${
            isMuted
              ? 'bg-red-500/20 border-red-500/40 text-red-400'
              : 'bg-card border-border hover:border-amber text-amber'
          }`}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </motion.button>
      )}

      {/* Fullscreen toggle */}
      <motion.button
        whileHover={{ scale: 1.1, rotate: 6 }}
        whileTap={{ scale: 0.9 }}
        onClick={toggleFullscreen}
        title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
        aria-label="Toggle fullscreen"
        className={`${btnBase} ${
          isFullscreen
            ? 'bg-amber text-[#050505] border-amber glow-gold'
            : 'bg-card border-border hover:border-amber text-amber'
        }`}
      >
        {isFullscreen ? (
          <Minimize2 className="w-4 h-4" />
        ) : (
          <Maximize2 className="w-4 h-4" />
        )}
      </motion.button>
    </div>
  );
}

