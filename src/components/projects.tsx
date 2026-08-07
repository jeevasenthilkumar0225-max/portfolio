'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FolderGit2, ExternalLink, Star, ArrowUpRight, X, Layers } from 'lucide-react';
import { ProjectItem } from '@/lib/data';
import { Github } from './icons';

interface ProjectsProps {
  projects: ProjectItem[];
}

function HoloCard({ proj, onOpen }: { proj: ProjectItem; onOpen: () => void }) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width - 0.5;
        const py = (e.clientY - rect.top) / rect.height - 0.5;
        setTilt({ x: py * -10, y: px * 10 });
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        setTilt({ x: 0, y: 0 });
      }}
      style={{ perspective: 1000 }}
      className="h-full group"
    >
      <motion.div
        animate={{ rotateX: tilt.x, rotateY: tilt.y, scale: hovered ? 1.02 : 1 }}
        transition={{ type: 'spring', stiffness: 150, damping: 15 }}
        className="flat-surface edge-lit rounded-2xl p-6 h-full flex flex-col justify-between relative overflow-hidden transform-gpu"
      >
        {/* Holographic sheen */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-[linear-gradient(120deg,transparent_30%,rgba(255,176,0,0.08)_50%,transparent_70%)] pointer-events-none" />

        {/* Glow-follow: radial glow anchored to this card */}
        <div
          className="absolute -top-10 -left-10 w-40 h-40 rounded-full bg-[#f4b400]/10 blur-2xl pointer-events-none transition-opacity duration-500"
          style={{ opacity: hovered ? 1 : 0 }}
        />

        {/* Animated top border reveal */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#f4b400]/60 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-center" />

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-1 rounded-lg bg-[#f4b400]/10 border border-[#f4b400]/25 text-amber font-mono font-medium text-[10px] uppercase">
              {proj.category}
            </span>
            {proj.featured && (
              <span className="flex items-center gap-1 text-[10px] font-mono font-medium text-amber">
                <Star className="w-3.5 h-3.5 fill-current" /> FEATURED
              </span>
            )}
          </div>

          <h3 className="text-xl font-semibold text-foreground group-hover:text-amber transition-colors">
            {proj.title}
          </h3>

          <p className="text-xs text-muted font-normal leading-relaxed line-clamp-3">
            {proj.description}
          </p>

          {/* Technology stack — animated reveal on hover */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {proj.techStack?.slice(0, 5).map((tech, i) => (
              <motion.span
                key={tech}
                initial={{ opacity: 0, y: 8, scale: 0.8 }}
                animate={{
                  opacity: hovered ? 1 : 0.7,
                  y: hovered ? 0 : 4,
                  scale: hovered ? 1 : 1,
                }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
                className="px-2 py-0.5 rounded bg-card-soft border border-[#f4b400]/15 text-[10px] font-mono font-medium text-muted group-hover:text-amber"
              >
                {tech}
              </motion.span>
            ))}
            {proj.techStack && proj.techStack.length > 5 && (
              <span className="px-2 py-0.5 rounded bg-[#f4b400]/10 text-[10px] font-mono text-amber">
                +{proj.techStack.length - 5}
              </span>
            )}
          </div>
        </div>

        <div className="pt-4 mt-4 border-t border-[#f4b400]/10 flex items-center justify-between">
          <a
            href={proj.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-mono font-medium text-muted hover:text-amber transition-colors"
          >
            <Github className="w-4 h-4" /> Source
          </a>
          {proj.liveUrl && (
            <a
              href={proj.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs font-mono font-medium text-muted hover:text-amber transition-colors"
            >
              <ExternalLink className="w-4 h-4" /> Live
            </a>
          )}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onOpen}
            className="p-2 rounded-xl bg-[#f4b400]/10 text-amber border border-[#f4b400]/20 hover:bg-[#f4b400]/20 transition-colors"
          >
            <ArrowUpRight className="w-4 h-4" />
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function Projects({ projects }: ProjectsProps) {
  const [selected, setSelected] = useState<ProjectItem | null>(null);

  return (
    <div className="min-h-screen flex items-center py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-10"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#f4b400]/10 border border-[#f4b400]/25 text-amber text-xs font-mono font-medium tracking-widest uppercase">
            <FolderGit2 className="w-4 h-4" /> Engineering Directory
          </div>
          <h2 className="display-h2 text-foreground mt-4">
            Holographic <span className="gold-text-gradient">Workspace</span>
          </h2>
        </motion.div>

        {/* Summary intro + stats strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-10"
        >
          <p className="body-md text-foreground/70 max-w-3xl">
            A portfolio of applied AI, computer-vision, and full-stack systems — from
            assistive mobility tech and smart glasses for the visually impaired to
            deepfake detection and career guidance platforms.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
            <div className="flat-surface edge-lit rounded-xl p-4 text-center">
              <div className="text-2xl font-semibold text-amber counter-value">{projects?.length ?? 0}</div>
              <div className="caption-mono text-muted">Projects</div>
            </div>
            <div className="flat-surface edge-lit rounded-xl p-4 text-center">
              <div className="text-2xl font-semibold text-amber counter-value">
                {projects?.filter((p) => p.featured).length ?? 0}
              </div>
              <div className="caption-mono text-muted">Featured</div>
            </div>
            <div className="flat-surface edge-lit rounded-xl p-4 text-center">
              <div className="text-2xl font-semibold text-amber counter-value">
                {new Set(projects?.flatMap((p) => p.techStack ?? [])).size ?? 0}
              </div>
              <div className="caption-mono text-muted">Technologies</div>
            </div>
            <div className="flat-surface edge-lit rounded-xl p-4 text-center">
              <div className="text-2xl font-semibold text-amber counter-value">
                {new Set(projects?.map((p) => p.category)).size ?? 0}
              </div>
              <div className="caption-mono text-muted">Domains</div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects?.map((proj) => (
            <HoloCard key={proj.id} proj={proj} onOpen={() => setSelected(proj)} />
          ))}
        </div>

        {/* Modal */}
        {selected && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="glass-panel rounded-3xl max-w-xl w-full p-6 space-y-4 relative"
            >
              <button
                onClick={() => setSelected(null)}
                className="absolute top-4 right-4 p-2 rounded-xl bg-[#f4b400]/10 text-amber"
              >
                <X className="w-5 h-5" />
              </button>
              <span className="px-3 py-1 rounded-lg bg-[#f4b400]/10 border border-[#f4b400]/25 text-amber font-mono font-medium text-xs uppercase">
                {selected.category}
              </span>
              <h3 className="text-2xl font-semibold text-foreground">{selected.title}</h3>
              <p className="text-xs text-foreground/80 font-normal leading-relaxed">
                {selected.longDescription || selected.description}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {selected.techStack?.map((t) => (
                  <span key={t} className="px-2.5 py-1 rounded-lg bg-card-soft border border-[#f4b400]/15 text-xs font-mono font-medium text-foreground/80">
                    {t}
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap gap-3 pt-2">
                <a
                  href={selected.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 text-[#0a0a0c] font-semibold text-xs font-mono flex items-center justify-center gap-2"
                >
                  <Github className="w-4 h-4" /> View Repository
                </a>
                {selected.liveUrl && (
                  <a
                    href={selected.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-3 rounded-xl bg-card border border-[#f4b400]/30 text-amber font-semibold text-xs font-mono flex items-center justify-center gap-2"
                  >
                    <Layers className="w-4 h-4" /> Live Demo
                  </a>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
