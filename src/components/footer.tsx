'use client';

import React from 'react';

interface FooterProps {
  name: string;
}

export function Footer({ name }: FooterProps) {
  return (
    <footer className="py-8 border-t border-slate-300 dark:border-zinc-900 bg-slate-100/90 dark:bg-zinc-950/80 backdrop-blur-sm text-xs text-black dark:text-slate-300 font-extrabold relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="font-black text-black dark:text-white">{name || 'Jeeva SenthilKumar'}</span>
          <span>© {new Date().getFullYear()} • AI & Full Stack Portfolio</span>
        </div>

        <div className="flex items-center gap-6">
          <a href="#about" className="hover:text-amber-800 dark:hover:text-amber-400 transition-colors">About</a>
          <a href="#projects" className="hover:text-amber-800 dark:hover:text-amber-400 transition-colors">Projects</a>
          <a href="#skills" className="hover:text-amber-800 dark:hover:text-amber-400 transition-colors">Skills</a>
          <a href="#contact" className="hover:text-amber-800 dark:hover:text-amber-400 transition-colors">Contact</a>
        </div>
      </div>
    </footer>
  );
}

