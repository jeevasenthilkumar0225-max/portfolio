'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Code2, Send, ChevronDown, Sparkles } from 'lucide-react';
import { ProfileData } from '@/lib/data';
import { AICore } from './ai-core';
import { Github as GithubIcon, Linkedin as LinkedinIcon } from './icons';

const ROLES = ['AI / ML Engineer', 'Full Stack Developer', 'Computer Vision Innovator'];

interface HomeProps {
  profile: ProfileData;
  onNavigate: (screen: string) => void;
}

export function Home({ profile, onNavigate }: HomeProps) {
  const [roleIndex, setRoleIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setRoleIndex((r) => (r + 1) % ROLES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-screen flex items-center overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-24 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          {/* Left: Clean Futuristic Typography */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
            className="space-y-7"
          >
{/* Status pill — single subtle element */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#f4b400]/30 bg-[#f4b400]/10 text-amber text-xs font-mono font-medium tracking-wide uppercase"
            >
              <span className="w-2 h-2 rounded-full bg-amber animate-pulse" />
              Final-Year B.Tech IT • CGPA 8.03
            </motion.div>

            {/* Name — the strongest element */}
            <div className="space-y-2">
              <div className="text-sm sm:text-base text-text-secondary font-mono font-medium tracking-widest uppercase">
                Hello, I&apos;m
              </div>
              <h1 className="display-hero gold-text-gradient drop-shadow-[0_0_35px_rgba(244,180,0,0.25)]">
                {profile.name || 'JEEVA'}
              </h1>
            </div>

            {/* Animated role */}
            <div className="flex items-center gap-3">
              <span className="font-mono text-amber text-2xl sm:text-3xl">{'>'}</span>
              <motion.span
                key={roleIndex}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -18 }}
                transition={{ duration: 0.35 }}
                className="text-lg sm:text-2xl font-semibold text-text-primary font-mono"
              >
                {ROLES[roleIndex]}
              </motion.span>
            </div>

            {/* Short description */}
            <p className="body-md text-text-body max-w-xl">
              {profile.summary}
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4 pt-1">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onNavigate('projects')}
                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 text-[#050505] font-semibold text-sm flex items-center gap-2 glow-gold"
              >
                <Code2 className="w-4 h-4" /> Projects
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onNavigate('github')}
                className="px-6 py-3.5 rounded-xl bg-card border border-border text-foreground font-semibold text-sm flex items-center gap-2 hover:border-[#f4b400]/60 transition-colors"
              >
                <GithubIcon className="w-4 h-4 text-amber" /> GitHub Dashboard
              </motion.button>

              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href={`mailto:${profile.email}`}
                className="px-6 py-3.5 rounded-xl bg-card border border-border text-foreground font-semibold text-sm flex items-center gap-2"
              >
                <Send className="w-4 h-4 text-amber" /> Resume
              </motion.a>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onNavigate('contact')}
                className="px-6 py-3.5 rounded-xl bg-card border border-border text-foreground font-semibold text-sm flex items-center gap-2"
              >
                Contact
              </motion.button>
            </div>

            {/* Social links & live stats */}
            <div className="space-y-6 pt-2">
              <div className="flex items-center gap-4">
                <span className="font-mono text-[11px] uppercase tracking-widest text-text-label font-medium">
                  <Sparkles className="inline w-3.5 h-3.5 mr-1 text-amber" /> Connect
                </span>
                <a
                  href={profile.linkedIn.startsWith('http') ? profile.linkedIn : `https://${profile.linkedIn}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl bg-card border border-border text-amber hover:border-[#f4b400] hover:scale-110 transition-all shadow-sm"
                >
                  <LinkedinIcon className="w-5 h-5" />
                </a>
                <a
                  href={profile.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl bg-card border border-border text-amber hover:border-[#f4b400] hover:scale-110 transition-all shadow-sm"
                >
                  <GithubIcon className="w-5 h-5" />
                </a>
              </div>

              {/* Stats Highlight Bar */}
              <div className="grid grid-cols-3 gap-3 pt-3 border-t border-border/50 max-w-lg">
                <div className="p-3 rounded-xl bg-card/60 border border-border/60 text-center">
                  <div className="text-xl font-bold font-mono text-amber">8.03</div>
                  <div className="text-[11px] text-text-label uppercase tracking-wider font-mono">CGPA (IT)</div>
                </div>
                <div className="p-3 rounded-xl bg-card/60 border border-border/60 text-center">
                  <div className="text-xl font-bold font-mono text-amber">10+</div>
                  <div className="text-[11px] text-text-label uppercase tracking-wider font-mono">Projects</div>
                </div>
                <div className="p-3 rounded-xl bg-card/60 border border-border/60 text-center">
                  <div className="text-xl font-bold font-mono text-amber">100%</div>
                  <div className="text-[11px] text-text-label uppercase tracking-wider font-mono">AI Focused</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right: Golden Neural Sun (AI Core) — signature brand element */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="hidden lg:flex items-center justify-center relative py-4"
          >
            {/* Outer decorative rings */}
            <div className="absolute w-[640px] h-[640px] rounded-full border border-dashed border-[#f4b400]/20 spin-slow" />
            <div
              className="absolute w-[720px] h-[720px] rounded-full border border-[#f4b400]/10 spin-slower"
              style={{ borderStyle: 'dotted' }}
            />
            <div className="absolute w-[520px] h-[520px] rounded-full bg-[radial-gradient(circle,rgba(244,180,0,0.14),transparent_70%)] blur-2xl energy-pulse" />

            <AICore />
          </motion.div>
        </div>
      </div>

      {/* Scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.8 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-amber"
      >
<span className="text-[10px] font-mono uppercase tracking-widest text-text-label">Explore</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </motion.div>
    </div>
  );
}
