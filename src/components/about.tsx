'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  GraduationCap, Trophy, Sparkles, MapPin, Cpu, User, Award,
  Database, Gauge, Zap, Brain, Fingerprint, ScanLine,
} from 'lucide-react';
import { ProfileData } from '@/lib/data';

interface AboutProps {
  profile: ProfileData;
}

function RevealBlock({
  icon: Icon,
  title,
  mono,
  children,
  index = 0,
  className = '',
}: {
  icon: React.ElementType;
  title: string;
  mono: string;
  children: React.ReactNode;
  index?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      whileHover={{ y: -3 }}
      className={`scanline relative overflow-hidden ${className}`}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-[#f4b400]/10 text-amber flex items-center justify-center border border-[#f4b400]/20">
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          <div className="caption-mono text-amber">{mono}</div>
        </div>
      </div>
      {children}
    </motion.div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5 border-b border-border/60 last:border-0">
      <span className="caption-mono text-muted">{label}</span>
      <span className="text-xs font-medium text-foreground/90 text-right">{value}</span>
    </div>
  );
}

export function About({ profile }: AboutProps) {
  return (
    <div className="min-h-screen flex items-center py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Header — asymmetric: title left, identity scan visual right */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#f4b400]/10 border border-[#f4b400]/25 text-amber text-xs font-mono font-medium tracking-widest uppercase">
              <Fingerprint className="w-4 h-4" /> AI Identity Database
            </div>
            <h2 className="display-h2 text-foreground mt-4">
              System Profile <span className="gold-text-gradient">Decrypted</span>
            </h2>
            <p className="body-md text-muted mt-3 max-w-md">
              {profile.summary}
            </p>
          </motion.div>

          {/* Identity scan visual — unique to About */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative w-full max-w-sm scanline rounded-2xl flat-surface edge-lit p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-full bg-[#f4b400]/10 text-amber border border-[#f4b400]/30 flex items-center justify-center">
                <Brain className="w-5 h-5" />
              </div>
              <div>
                <div className="caption-mono text-amber">Neural Summary</div>
                <div className="text-sm font-semibold text-foreground">{profile.name}</div>
              </div>
            </div>
            <div className="space-y-2">
              {profile.softSkills?.slice(0, 4).map((skill) => (
                <div key={skill} className="flex items-center gap-2">
                  <ScanLine className="w-3.5 h-3.5 text-amber shrink-0" />
                  <div className="flex-1 h-1 rounded-full bg-card-soft overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${70 + (skill.length % 3) * 10}%` }}
                      transition={{ duration: 1, delay: 0.4 }}
                      className="h-full rounded-full bg-gradient-to-r from-yellow-400 to-amber-500"
                    />
                  </div>
                  <span className="caption-mono text-muted">{skill}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between">
              <span className="caption-mono text-muted flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-amber" /> Identity Verified
              </span>
              <span className="text-[10px] font-mono text-amber">ENCRYPTED ✓</span>
            </div>
          </motion.div>
        </div>

        {/* Core metrics strip — counters, asymmetric 3-col layout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10"
        >
          {[
            { label: 'CGPA', value: '8.03', sub: '/ 10' },
            { label: 'Internships', value: '3', sub: 'Completed' },
            { label: 'Projects', value: '5+', sub: 'Built' },
            { label: 'Hackathons', value: '1', sub: 'National' },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 + i * 0.08 }}
              className="flat-surface edge-lit rounded-xl p-4"
            >
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-semibold text-amber counter-value">{s.value}</span>
                <span className="text-[10px] font-mono text-muted">{s.sub}</span>
              </div>
              <div className="caption-mono text-muted mt-1">{s.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Asymmetric content: education (wide) + identity modules */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left column (span 2) — Education as a timeline */}
          <div className="lg:col-span-2 space-y-5">
            <RevealBlock icon={GraduationCap} title="Learning Record" mono="edu_track.json" index={0}>
              <div className="space-y-3">
                {profile.education?.map((edu, i) => (
                  <motion.div
                    key={edu.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + i * 0.1 }}
                    className="flat-surface edge-lit rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#f4b400]/10 text-amber flex items-center justify-center border border-[#f4b400]/20 shrink-0">
                        {i === 0 ? <Brain className="w-4 h-4" /> : <Cpu className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-foreground">{edu.degree}</div>
                        <div className="text-xs text-muted">{edu.institution}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="caption-mono text-muted">{edu.duration}</span>
                      <span className="caption-mono text-amber">{edu.score}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </RevealBlock>

            {/* Internships + Achievements combined asymmetric */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <RevealBlock icon={Cpu} title="Field Internships" mono="intern.log" index={1}>
                <div className="space-y-2.5">
                  {profile.hackathons?.concat(
                    [
                      { id: 'int-1', title: 'Cybernaut Edu-Tech LLP', location: 'AI & ML', role: '', description: 'Student Performance Prediction' },
                      { id: 'int-2', title: 'Viruzverse Solutions', location: 'AI & ML', role: '', description: 'Face Mask Detection' },
                      { id: 'int-3', title: 'SVASTI Tech Solutions', location: 'Full Stack', role: '', description: 'Course Management System' },
                    ].slice(0, 3)
                  ).map((item) => (
                    <motion.div key={item.id} className="flat-surface rounded-xl p-3 flex items-center justify-between gap-2 hover:border-transparent">
                      <div>
                        <div className="text-xs font-semibold text-foreground">{item.title}</div>
                        <div className="caption-mono text-muted">{item.description}</div>
                      </div>
                      <span className="caption-mono text-amber px-2 py-0.5 rounded bg-[#f4b400]/10 shrink-0">
                        {item.location}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </RevealBlock>

              <RevealBlock icon={Trophy} title="Achievements" mono="awards.json" index={2}>
                <div className="space-y-2">
                  {profile.hackathons?.map((h) => (
                    <div key={h.id} className="flat-surface rounded-xl p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-amber">{h.title}</span>
                        <span className="caption-mono text-muted">{h.location}</span>
                      </div>
                      <p className="text-[11px] text-muted mt-1">{h.description}</p>
                    </div>
                  ))}
                  <div className="space-y-1.5 pt-1">
                    {profile.achievements?.map((a) => (
                      <div key={a.id} className="flex items-start gap-2 text-xs">
                        <Award className="w-3.5 h-3.5 text-amber shrink-0 mt-0.5" />
                        <span className="text-foreground/80 font-medium">{a.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </RevealBlock>
            </div>
          </div>

          {/* Right column (span 1) — identity stack */}
          <div className="space-y-5">
            <RevealBlock icon={Gauge} title="Core Metrics" mono="metrics" index={0}>
              <Row label="CGPA" value="8.03 / 10" />
              <Row label="Honours" value="B.Tech IT (Hons)" />
              <Row label="Internships" value="3 Completed" />
              <Row label="Projects" value="5+ Built" />
              <Row label="Hackathons" value="1 National" />
            </RevealBlock>

            <RevealBlock icon={MapPin} title="Origin" mono="node.js" index={1}>
              <div className="flex items-center gap-2 text-sm text-foreground/90 font-medium">
                <MapPin className="w-4 h-4 text-amber" />
                Trichy, Tamil Nadu, India
              </div>
              <div className="mt-3 p-3 rounded-xl flat-surface text-xs text-muted font-mono leading-relaxed">
                {profile.languages.join(' / ')} • {profile.softSkills.slice(0, 3).join(' • ')}
              </div>
            </RevealBlock>

            <RevealBlock icon={Sparkles} title="Research Areas" mono="interests" index={2}>
              <div className="flex flex-wrap gap-1.5">
                {profile.areasOfInterest?.map((a) => (
                  <span key={a} className="px-2 py-1 rounded-md bg-[#f4b400]/10 border border-[#f4b400]/20 text-[10px] font-mono font-medium text-amber">
                    {a}
                  </span>
                ))}
              </div>
            </RevealBlock>

            <RevealBlock icon={Zap} title="Core Strengths" mono="kernel" index={3}>
              <div className="space-y-2">
                {profile.strengths?.map((s) => (
                  <div key={s} className="flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5 text-amber shrink-0" />
                    <span className="text-xs font-medium text-foreground/80">{s}</span>
                  </div>
                ))}
              </div>
              <div className="pt-3 border-t border-border/60 mt-3">
                <div className="caption-mono text-muted mb-2">Languages</div>
                <div className="flex flex-wrap gap-1.5">
                  {profile.languages?.map((l) => (
                    <span key={l} className="px-2 py-0.5 rounded bg-[#f4b400]/10 border border-[#f4b400]/20 text-[10px] font-mono font-medium text-amber">
                      {l}
                    </span>
                  ))}
                </div>
              </div>
            </RevealBlock>

            <RevealBlock icon={Database} title="Identity Ledger" mono="ledger.db" index={4}>
              <div className="flex items-center gap-2 text-xs text-muted font-mono">
                <Database className="w-4 h-4 text-amber" />
                {profile.email}
              </div>
            </RevealBlock>
          </div>
        </div>
      </div>
    </div>
  );
}
