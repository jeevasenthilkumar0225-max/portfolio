'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Lock, Sparkles, Code2, Briefcase, GraduationCap, FolderGit2, Award, Mail } from 'lucide-react';
import { ThemeToggle } from './theme-toggle';
import Link from 'next/link';

interface NavbarProps {
  name: string;
}

export function Navbar({ name }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'About', href: '#about', icon: GraduationCap },
    { name: 'Skills', href: '#skills', icon: Code2 },
    { name: 'Experience', href: '#experience', icon: Briefcase },
    { name: 'Projects', href: '#projects', icon: FolderGit2 },
    { name: 'Certifications', href: '#certifications', icon: Award },
    { name: 'Contact', href: '#contact', icon: Mail },
  ];

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 dark:bg-zinc-950/90 backdrop-blur-md border-b border-slate-300 dark:border-amber-400/20 shadow-lg'
          : 'bg-transparent py-2'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Name */}
          <Link href="#" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-600 to-amber-800 dark:from-yellow-300 dark:to-amber-500 flex items-center justify-center text-white dark:text-zinc-950 font-black font-mono text-lg shadow-md group-hover:scale-105 transition-transform duration-300">
              JS
            </div>
            <div className="flex flex-col">
              <span className="font-black text-base tracking-tight gold-text-gradient group-hover:opacity-90 transition-opacity">
                {name || 'Jeeva SenthilKumar'}
              </span>
              <span className="text-[10px] text-slate-900 dark:text-slate-300 font-mono tracking-widest uppercase flex items-center gap-1 font-bold">
                <Sparkles className="w-2.5 h-2.5 text-amber-700 dark:text-amber-400" /> AI & Full Stack
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="px-3.5 py-2 text-sm font-extrabold text-black dark:text-white hover:text-amber-800 dark:hover:text-amber-300 hover:bg-slate-200/70 dark:hover:bg-amber-400/10 transition-all duration-200"
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* Right Action Bar */}
          <div className="flex items-center gap-3">
            <ThemeToggle />

            {/* Hidden Admin Access Button */}
            <Link
              href="/admin"
              title="Admin CMS Portal"
              className="p-2 text-slate-800 hover:text-amber-800 dark:text-slate-300 dark:hover:text-amber-300 rounded-lg hover:bg-slate-200 dark:hover:bg-amber-400/10 transition-colors"
            >
              <Lock className="w-4 h-4" />
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-black dark:text-white hover:bg-slate-200 dark:hover:bg-amber-500/10"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-white dark:bg-zinc-950/98 backdrop-blur-lg border-b border-slate-300 dark:border-amber-400/20 px-4 pt-2 pb-6 shadow-xl"
          >
            <div className="flex flex-col space-y-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <a
                    key={link.name}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-extrabold text-black dark:text-white hover:text-amber-800 dark:hover:text-amber-300 hover:bg-slate-100 dark:hover:bg-amber-500/10 transition-colors"
                  >
                    <Icon className="w-5 h-5 text-amber-700 dark:text-amber-400" />
                    {link.name}
                  </a>
                );
              })}
              <div className="pt-2 border-t border-slate-200 dark:border-zinc-800 flex justify-between items-center px-4">
                <span className="text-xs text-black dark:text-slate-300 font-mono font-bold">Private Admin Access</span>
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-100 dark:bg-amber-400/10 text-amber-900 dark:text-amber-300 border border-amber-800/30 flex items-center gap-1.5"
                >
                  <Lock className="w-3.5 h-3.5" /> Dashboard
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

