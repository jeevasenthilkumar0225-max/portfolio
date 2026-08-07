'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, Download, Sparkles, Code, Cpu, Eye, CheckCircle2 } from 'lucide-react';
import { ProfileData } from '@/lib/data';
import { Github as GithubIcon, Linkedin as LinkedinIcon } from './icons';

interface HeroProps {
  profile: ProfileData;
}

export function Hero({ profile }: HeroProps) {
  const roles = profile.targetRoles.length > 0 ? profile.targetRoles : ['AI/ML Engineer', 'Full Stack Developer'];
  const [currentRoleIndex, setCurrentRoleIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentRoleIndex((prev) => (prev + 1) % roles.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [roles.length]);

  return (
    <section className="relative min-h-screen pt-28 pb-16 flex items-center justify-center overflow-hidden">
      {/* Dynamic Background Glow Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-amber-500/10 via-yellow-400/5 to-transparent dark:from-amber-400/15 dark:via-yellow-300/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[350px] h-[350px] bg-cyan-500/5 dark:bg-cyan-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Main Content (Left 7 Cols) */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="lg:col-span-7 space-y-6 text-left"
          >
            {/* Status Pill */}
            <div className="flex flex-wrap items-center gap-2">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100 dark:bg-amber-400/10 border border-amber-800/30 dark:border-amber-400/20 text-amber-950 dark:text-amber-300 text-xs font-black tracking-wide uppercase font-mono"
              >
                <span className="w-2 h-2 rounded-full bg-amber-600 dark:bg-amber-400 animate-pulse" />
                Final-Year B.Tech IT Honours • CGPA: 8.03
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-950 dark:text-emerald-300 text-xs font-mono font-bold"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                AI & Computer Vision Innovator
              </motion.div>
            </div>

            {/* Name Heading */}
            <div className="space-y-2">
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-black dark:text-white">
                Hi, I'm{' '}
                <span className="gold-text-gradient block sm:inline">
                  {profile.name || 'Jeeva SenthilKumar'}
                </span>
              </h1>
              
              {/* Dynamic Animated Role Flipper */}
              <div className="h-12 sm:h-14 flex items-center text-xl sm:text-3xl font-black text-slate-900 dark:text-slate-100">
                <span className="mr-3 font-mono text-amber-800 dark:text-amber-400">{'>'}</span>
                <motion.span
                  key={currentRoleIndex}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                  className="font-mono text-black dark:text-white border-b-2 border-amber-700 dark:border-amber-400"
                >
                  {roles[currentRoleIndex]}
                </motion.span>
              </div>
            </div>

            {/* Summary Text */}
            <p className="text-base sm:text-lg text-slate-900 dark:text-slate-200 font-bold leading-relaxed max-w-2xl">
              {profile.summary}
            </p>

            {/* AI Motivational Quote */}
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs font-mono font-bold text-amber-950 dark:text-amber-300 flex items-center gap-2 max-w-xl">
              <Cpu className="w-4 h-4 text-amber-800 dark:text-amber-400 shrink-0 animate-pulse" />
              <span>"Building intelligent neural models & vision systems to transform accessibility and software automation."</span>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4 pt-2">
              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href="#projects"
                className="px-6 py-3.5 rounded-xl bg-amber-800 dark:bg-gradient-to-r dark:from-yellow-400 dark:to-amber-500 text-white dark:text-zinc-950 font-black text-sm shadow-lg hover:shadow-amber-700/30 flex items-center gap-2 transition-all font-mono"
              >
                View Academic Projects
                <ArrowRight className="w-4 h-4" />
              </motion.a>

              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href="#contact"
                className="px-6 py-3.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-400 dark:border-amber-400/30 text-black dark:text-white font-extrabold text-sm hover:border-amber-700 shadow-md flex items-center gap-2 transition-all font-mono"
              >
                <Mail className="w-4 h-4 text-amber-800 dark:text-amber-400" />
                Contact Me
              </motion.a>

              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href={`mailto:${profile.email}`}
                className="px-4 py-3.5 rounded-xl border border-slate-400 dark:border-zinc-800 text-slate-950 dark:text-slate-200 hover:text-amber-800 font-extrabold text-sm flex items-center gap-2 font-mono"
                title="Get Resume via Email"
              >
                <Download className="w-4 h-4" />
                Resume Request
              </motion.a>
            </div>

            {/* Social & Contact Bar */}
            <div className="pt-4 flex items-center gap-4 text-sm text-black dark:text-slate-300 font-black">
              <span className="font-mono text-xs uppercase tracking-wider text-black dark:text-slate-300">Connect:</span>
              <a
                href={profile.linkedIn.startsWith('http') ? profile.linkedIn : `https://${profile.linkedIn}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-400/10 text-amber-950 dark:text-amber-300 border border-amber-800/30 hover:scale-110 transition-transform"
                title="LinkedIn Profile"
              >
                <LinkedinIcon className="w-5 h-5" />
              </a>
              {profile.github && (
                <a
                  href={profile.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl bg-slate-200 dark:bg-zinc-800 text-black dark:text-white border border-slate-400 dark:border-zinc-700 hover:scale-110 transition-transform"
                  title="GitHub Profile"
                >
                  <GithubIcon className="w-5 h-5" />
                </a>
              )}
            </div>
          </motion.div>

          {/* Right Visual Glass Graphic & Quick Stats (Right 5 Cols) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-5 relative"
          >
            <div className="relative mx-auto max-w-md p-6 rounded-3xl glass-card border border-slate-300 dark:border-amber-500/20 space-y-6">
              
              {/* Profile Avatar Decorative Badge */}
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-amber-50 dark:bg-amber-400/5 border border-amber-800/20">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-700 to-amber-900 dark:from-yellow-300 dark:to-amber-500 flex items-center justify-center text-white dark:text-zinc-950 font-black text-2xl shadow-inner font-mono">
                  JS
                </div>
                <div>
                  <h3 className="font-black text-lg text-black dark:text-white">{profile.name}</h3>
                  <p className="text-xs text-amber-900 dark:text-amber-400 font-mono font-extrabold">M.A.M. College of Engg & Tech</p>
                  <p className="text-[11px] text-slate-900 dark:text-slate-300 font-bold">Anna University • Trichy</p>
                </div>
              </div>

              {/* Stat Highlights Cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900/80 border border-slate-300 dark:border-zinc-800 shadow-sm">
                  <div className="text-2xl font-black font-mono text-amber-900 dark:text-amber-400">8.03</div>
                  <div className="text-xs text-black dark:text-slate-300 font-extrabold">B.Tech CGPA (Honours)</div>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900/80 border border-slate-300 dark:border-zinc-800 shadow-sm">
                  <div className="text-2xl font-black font-mono text-amber-900 dark:text-amber-400">3</div>
                  <div className="text-xs text-black dark:text-slate-300 font-extrabold">Internships Completed</div>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900/80 border border-slate-300 dark:border-zinc-800 shadow-sm">
                  <div className="text-2xl font-black font-mono text-amber-900 dark:text-amber-400">5+</div>
                  <div className="text-xs text-black dark:text-slate-300 font-extrabold">AI & Web Projects</div>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900/80 border border-slate-300 dark:border-zinc-800 shadow-sm">
                  <div className="text-2xl font-black font-mono text-amber-900 dark:text-amber-400">INCEPTIA</div>
                  <div className="text-xs text-black dark:text-slate-300 font-extrabold">Pune Hackathon</div>
                </div>
              </div>

              {/* Core Skill Badges */}
              <div className="space-y-2">
                <span className="text-xs font-mono text-black dark:text-slate-300 font-black uppercase tracking-wider block">Key Technologies</span>
                <div className="flex flex-wrap gap-2">
                  {['Python', 'React.js', 'OpenCV', 'YOLOv8', 'Node.js', 'MongoDB', 'TensorFlow'].map((tech) => (
                    <span
                      key={tech}
                      className="px-2.5 py-1 rounded-md bg-amber-100 dark:bg-amber-400/10 text-amber-950 dark:text-amber-300 text-xs font-extrabold font-mono border border-amber-800/30"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}

