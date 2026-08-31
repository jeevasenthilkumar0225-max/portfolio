'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Home, User, Code2, Briefcase, FolderGit2, Award, MessageSquare, Cpu, GitBranch } from 'lucide-react';
import { Github as GithubIcon } from './icons';

interface DockProps {
  active: string;
  onNavigate: (screen: string) => void;
}

const ITEMS = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'about', label: 'About', icon: User },
  { id: 'skills', label: 'Skills', icon: Code2 },
  { id: 'experience', label: 'Experience', icon: Briefcase },
  { id: 'projects', label: 'Projects', icon: FolderGit2 },
  { id: 'github', label: 'GitHub', icon: GithubIcon },
  { id: 'certificates', label: 'Certificates', icon: Award },
  { id: 'contact', label: 'Contact', icon: MessageSquare },
];

export function Dock({ active, onNavigate }: DockProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="ai-dock-wrap">
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.4, ease: 'easeOut' }}
        className="ai-dock"
      >
        <div
          onMouseEnter={() => setExpanded(true)}
          onMouseLeave={() => setExpanded(false)}
          className="glass-panel rounded-[2rem] px-2 sm:px-3 py-2.5 flex items-center gap-0.5 sm:gap-1 border border-[#f4b400]/25 relative overflow-hidden w-fit mx-auto"
        >
          {/* Glass reflection sweep */}
          <div className="glass-sheen" />

          {ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.id;
            return (
              <motion.button
                key={item.id}
                whileHover={{ scale: 1.15, y: -6 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onNavigate(item.id)}
                title={item.label}
                aria-label={item.label}
                aria-current={isActive ? 'page' : undefined}
                className={`dock-btn relative flex items-center justify-center gap-1.5 rounded-full transition-all duration-300 ${
                  isActive
                    ? 'bg-[#f4b400]/20 text-amber'
                    : 'text-foreground/55 hover:text-amber'
                }`}
              >
                <Icon className="dock-icon shrink-0" />
                {/* Expanding label — hidden on small screens to prevent overflow */}
                <motion.span
                  initial={false}
                  animate={{
                    width: expanded ? 'auto' : 0,
                    opacity: expanded ? 1 : 0,
                    marginLeft: expanded ? 6 : 0,
                  }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                  className="hidden md:inline-block text-[9px] font-mono font-medium tracking-wide whitespace-nowrap overflow-hidden"
                >
                  {item.label}
                </motion.span>
                {/* Morphing active indicator */}
                {isActive && (
                  <motion.div
                    layoutId="dock-active"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="absolute -bottom-0.5 w-1.5 h-1.5 rounded-full bg-amber glow-gold"
                  />
                )}
              </motion.button>
            );
          })}

          {/* Central glowing AI orb (brand mark) — compact on mobile so it never overlaps */}
          <motion.div
            whileHover={{ scale: 1.1 }}
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="relative shrink-0 ml-1 dock-orb rounded-full bg-gradient-to-br from-yellow-300 to-amber-600 flex items-center justify-center text-[#0a0a0c] font-semibold font-mono glow-gold cursor-pointer group/dock"
            onClick={() => onNavigate('home')}
            title="AI Core"
            aria-label="Home"
          >
            <Cpu className="dock-orb-icon" />
            {/* Orbiting ring */}
            <div className="absolute inset-0 rounded-full border border-[#f4b400]/40 spin-slow" />
            <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#ffd76a] animate-pulse" />
            {/* Hover tooltip */}
            <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-card border border-[#f4b400]/30 text-[9px] font-mono text-amber whitespace-nowrap opacity-0 group-hover/dock:opacity-100 transition-opacity">
              AI Core
            </span>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
