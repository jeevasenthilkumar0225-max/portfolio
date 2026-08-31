'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  GraduationCap, Trophy, Sparkles, MapPin, Cpu, User, Award,
  Database, Gauge, Zap, Brain, Fingerprint, Mail, Globe, Languages
} from 'lucide-react';
import { ProfileData } from '@/lib/data';

interface AboutProps {
  profile: ProfileData;
}

export function About({ profile }: AboutProps) {
  // Animation presets
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 25 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1.0] }
    }
  };

  return (
    <div className="min-h-screen py-24 flex items-center relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
        
        {/* Asymmetric Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-14 text-center lg:text-left"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#f4b400]/10 border border-[#f4b400]/25 text-amber text-xs font-mono font-medium uppercase tracking-widest">
            <Fingerprint className="w-3.5 h-3.5" /> Identity Decrypted
          </div>
          <h2 className="display-h2 text-foreground mt-4">
            About <span className="gold-text-gradient font-black">Myself</span>
          </h2>
          <div className="w-16 h-1 bg-amber mt-4 mx-auto lg:mx-0 rounded-full" />
        </motion.div>

        {/* Unified Premium 2-Column Split Layout */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
        >
          
          {/* LEFT SIDE (Span 5): Developer Persona & Education */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Developer Persona Card */}
            <motion.div
              variants={itemVariants}
              whileHover={{ y: -4 }}
              className="glass-card p-6 rounded-2xl relative overflow-hidden group transition-all duration-300"
            >
              {/* Decorative Subtle Gold Radial Glow */}
              <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-amber/10 blur-2xl group-hover:bg-amber/15 transition-all duration-300" />
              
              <div className="flex items-center gap-4 mb-5">
                <div className="w-12 h-12 rounded-2xl bg-[#f4b400]/10 border border-[#f4b400]/20 flex items-center justify-center text-amber">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground tracking-tight">{profile.name}</h3>
                  <p className="text-xs text-amber font-mono mt-0.5">Final-Year B.Tech IT (Hons)</p>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed mb-6 font-medium">
                {profile.summary || "I build real-world AI applications, computer vision models, and premium full-stack software products."}
              </p>

              {/* Persona Metadata Grid */}
              <div className="space-y-3 pt-4 border-t border-border/50">
                <div className="flex items-center gap-3 text-xs text-text-secondary">
                  <MapPin className="w-4 h-4 text-amber shrink-0" />
                  <span>Trichy, Tamil Nadu, India</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-text-secondary">
                  <Mail className="w-4 h-4 text-amber shrink-0" />
                  <a href={`mailto:${profile.email}`} className="hover:underline font-mono">{profile.email}</a>
                </div>
                <div className="flex items-center gap-3 text-xs text-text-secondary">
                  <Languages className="w-4 h-4 text-amber shrink-0" />
                  <span className="font-mono">{profile.languages?.join(' / ') || 'English / Tamil'}</span>
                </div>
              </div>
            </motion.div>

            {/* Academic Learning Track */}
            <motion.div
              variants={itemVariants}
              className="glass-card p-6 rounded-2xl transition-all duration-300"
            >
              <h4 className="text-xs font-mono font-bold tracking-widest text-amber uppercase mb-5 flex items-center gap-2">
                <GraduationCap className="w-4 h-4" /> Academic Timeline
              </h4>

              <div className="relative border-l border-[#f4b400]/20 pl-4 ml-2 space-y-6">
                {profile.education?.map((edu) => (
                  <div key={edu.id} className="relative">
                    {/* Circle Node Indicator */}
                    <div className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-amber border-2 border-background ring-4 ring-amber/10" />
                    
                    <div className="space-y-1">
                      <div className="flex justify-between items-baseline gap-2">
                        <h5 className="text-xs sm:text-sm font-bold text-foreground leading-tight">{edu.degree}</h5>
                        <span className="text-[10px] font-mono text-amber shrink-0">{edu.duration}</span>
                      </div>
                      <p className="text-xs text-text-secondary">{edu.institution}</p>
                      <div className="inline-block px-2 py-0.5 mt-1 rounded bg-[#f4b400]/10 border border-[#f4b400]/20 text-[10px] font-mono font-bold text-amber">
                        {edu.score}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

          </div>

          {/* RIGHT SIDE (Span 7): Achievements, Research & Strengths */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Achievements & Hackathons */}
            <motion.div
              variants={itemVariants}
              className="glass-card p-6 rounded-2xl transition-all duration-300"
            >
              <h4 className="text-xs font-mono font-bold tracking-widest text-amber uppercase mb-5 flex items-center gap-2">
                <Trophy className="w-4 h-4" /> Achievements & Hackathons
              </h4>

              <div className="space-y-4">
                {profile.hackathons?.map((h) => (
                  <div key={h.id} className="flat-surface p-4 rounded-xl border border-border/40 hover:border-amber/35 transition-all duration-300">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h5 className="text-sm font-bold text-foreground">{h.title}</h5>
                        <span className="caption-mono text-amber text-[10px] block mt-0.5">{h.location}</span>
                      </div>
                      <Trophy className="w-4 h-4 text-amber shrink-0" />
                    </div>
                    <p className="text-xs text-text-secondary mt-2 leading-relaxed">
                      {h.description}
                    </p>
                  </div>
                ))}

                {/* General Awards & Honors list */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {profile.achievements?.map((a) => (
                    <div key={a.id} className="flex items-start gap-2.5 p-3 rounded-xl border border-border/40 bg-card-soft">
                      <Award className="w-4 h-4 text-amber shrink-0 mt-0.5" />
                      <span className="text-xs text-foreground/80 font-semibold leading-tight">{a.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Technical Focus & Research Areas */}
            <motion.div
              variants={itemVariants}
              className="glass-card p-6 rounded-2xl transition-all duration-300"
            >
              <h4 className="text-xs font-mono font-bold tracking-widest text-amber uppercase mb-5 flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> Areas of Expertise
              </h4>

              <div className="flex flex-wrap gap-2">
                {profile.areasOfInterest?.map((area) => (
                  <span
                    key={area}
                    className="px-3.5 py-1.5 rounded-xl bg-[#f4b400]/10 border border-[#f4b400]/25 text-xs font-mono font-bold text-amber hover:bg-[#f4b400]/20 transition-colors"
                  >
                    {area}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* Core Strengths */}
            <motion.div
              variants={itemVariants}
              className="glass-card p-6 rounded-2xl transition-all duration-300"
            >
              <h4 className="text-xs font-mono font-bold tracking-widest text-amber uppercase mb-5 flex items-center gap-2">
                <Zap className="w-4 h-4" /> Core Strengths
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {profile.strengths?.map((strength) => (
                  <div key={strength} className="flex items-center gap-3 p-3 rounded-xl border border-border/40 bg-card-soft">
                    <div className="w-7 h-7 rounded-lg bg-[#f4b400]/10 flex items-center justify-center text-amber shrink-0">
                      <Zap className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-semibold text-text-primary">{strength}</span>
                  </div>
                ))}
              </div>
            </motion.div>

          </div>

        </motion.div>
      </div>
    </div>
  );
}
