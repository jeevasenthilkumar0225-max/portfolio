'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from './theme-provider';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <motion.button
      whileHover={{ scale: 1.12, rotate: 8 }}
      whileTap={{ scale: 0.88 }}
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className={`relative flex items-center justify-center p-2.5 rounded-full transition-all duration-300 border cursor-pointer ${
        isDark
          ? 'bg-zinc-900/90 text-amber-400 border-amber-400/30 hover:border-amber-400 hover:shadow-[0_0_20px_rgba(255,215,0,0.4)]'
          : 'bg-white text-amber-700 border-amber-300 hover:border-amber-500 hover:shadow-[0_0_20px_rgba(217,154,0,0.35)] shadow-md'
      }`}
    >
      <motion.div
        key={theme}
        initial={{ rotate: -90, scale: 0, opacity: 0 }}
        animate={{ rotate: 0, scale: 1, opacity: 1 }}
        exit={{ rotate: 90, scale: 0, opacity: 0 }}
        transition={{ duration: 0.35, ease: 'backOut' }}
        className="flex items-center gap-1.5 font-medium text-xs tracking-wider"
      >
        {isDark ? (
          <>
            <Moon className="w-4 h-4 text-amber-400 fill-amber-400/20" />
            <span className="hidden md:inline font-mono uppercase text-[10px]">Dark</span>
          </>
        ) : (
          <>
            <Sun className="w-4 h-4 text-amber-600 fill-amber-500/20" />
            <span className="hidden md:inline font-mono uppercase text-[10px]">Light</span>
          </>
        )}
      </motion.div>
    </motion.button>
  );
}
