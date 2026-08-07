'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, GitBranch, ChevronRight, Building2, Clock, Layers, GitCommit } from 'lucide-react';
import { ExperienceItem } from '@/lib/data';

interface ExperienceProps {
  experiences: ExperienceItem[];
}

export function Experience({ experiences }: ExperienceProps) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="min-h-screen flex items-center py-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#f4b400]/10 border border-[#f4b400]/25 text-amber text-xs font-mono font-medium tracking-widest uppercase">
              <GitBranch className="w-4 h-4" /> AI Commit Log
            </div>
            <h2 className="display-h2 text-foreground mt-4">
              Experience <span className="gold-text-gradient">Timeline</span>
            </h2>
            <p className="body-md text-muted mt-3 max-w-2xl">
              Hands-on engineering experience across AI/ML and full-stack development —
              building predictive models, computer-vision systems, and scalable web applications.
            </p>
          </motion.div>
        </div>

        {/* Stats strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-10"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flat-surface edge-lit rounded-xl p-4 flex items-center gap-3">
              <Building2 className="w-5 h-5 text-amber shrink-0" />
              <div>
                <div className="text-lg font-semibold text-amber counter-value">{experiences?.length ?? 0}</div>
                <div className="caption-mono text-muted">Companies</div>
              </div>
            </div>
            <div className="flat-surface edge-lit rounded-xl p-4 flex items-center gap-3">
              <Layers className="w-5 h-5 text-amber shrink-0" />
              <div>
                <div className="text-lg font-semibold text-amber counter-value">
                  {experiences?.reduce((acc, e) => acc + (e.responsibilities?.length ?? 0), 0) ?? 0}
                </div>
                <div className="caption-mono text-muted">Key Deliverables</div>
              </div>
            </div>
            <div className="flat-surface edge-lit rounded-xl p-4 flex items-center gap-3">
              <Clock className="w-5 h-5 text-amber shrink-0" />
              <div>
                <div className="text-lg font-semibold text-amber">3 Domains</div>
                <div className="caption-mono text-muted">AI · ML · Web</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Git-commit style timeline */}
        <div className="relative space-y-8 pl-8">
          {/* Animated connecting line */}
          <div className="absolute left-[7px] top-2 bottom-2 w-px bg-[#f4b400]/20" />
          <motion.div
            className="absolute left-[7px] top-2 w-px bg-gradient-to-b from-[#ffb000] to-transparent"
            initial={{ height: 0 }}
            animate={{ height: '100%' }}
            transition={{ duration: 2, ease: 'easeInOut' }}
          />

          {experiences?.map((exp, i) => {
            const isOpen = expanded === exp.id;
            return (
              <motion.div
                key={exp.id}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                className="relative"
              >
                {/* Commit node — pulsing */}
                <div className="absolute -left-8 top-5 w-4 h-4 rounded-full bg-amber glow-gold border-2 border-background">
                  <motion.div
                    animate={{ scale: [1, 1.8, 1], opacity: [0.6, 0, 0.6] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute inset-0 rounded-full bg-amber"
                  />
                </div>

                <motion.div
                  initial={{ height: 'auto' }}
                  animate={{ height: isOpen ? 'auto' : 'auto' }}
                  onClick={() => setExpanded(isOpen ? null : exp.id)}
                  className="flat-surface edge-lit rounded-2xl p-6 cursor-pointer transition-all hover:border-[#f4b400]/40 relative overflow-hidden group"
                >
                  {/* Glow trail on hover */}
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#f4b400]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#f4b400]/10 pb-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <GitCommit className="w-4 h-4 text-amber" />
                        <span className="caption-mono text-amber uppercase">{exp.company}</span>
                      </div>
                      <h3 className="text-xl font-semibold text-foreground">{exp.role}</h3>
                    </div>
                    <span className="px-3 py-1.5 rounded-xl bg-[#f4b400]/10 border border-[#f4b400]/25 text-amber text-xs font-mono font-medium w-fit">
                      {exp.duration}
                    </span>
                  </div>

                  <div className="space-y-2 pt-3">
                    <div className="caption-mono text-muted">
                      commit: {exp.project}
                    </div>
                    <ul className="space-y-2 pt-1">
                      {(isOpen ? exp.responsibilities : exp.responsibilities?.slice(0, 2))?.map((resp, rIdx) => (
                        <li key={rIdx} className="flex items-start gap-2.5 text-xs text-foreground/80 font-normal leading-relaxed">
                          <ChevronRight className="w-4 h-4 text-amber shrink-0 mt-0.5" />
                          <span>{resp}</span>
                        </li>
                      ))}
                    </ul>
                    {!isOpen && exp.responsibilities && exp.responsibilities.length > 2 && (
                      <div className="caption-mono text-muted/70 pt-1">
                        • {exp.responsibilities.length - 2} more — click to expand
                      </div>
                    )}
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
