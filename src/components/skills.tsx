'use client';

import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Code2, X, Network, Layers, Zap } from 'lucide-react';
import { SkillCategory } from '@/lib/data';

interface SkillsProps {
  skills: SkillCategory[];
}

// Node layout positions (x%, y%) — a dynamic neural topology, not a grid
const NODE_POS: Record<string, { x: number; y: number }> = {
  Python: { x: 50, y: 18 },
  TensorFlow: { x: 30, y: 38 },
  OpenCV: { x: 70, y: 38 },
  YOLO: { x: 50, y: 52 },
  PyTorch: { x: 22, y: 55 },
  React: { x: 18, y: 72 },
  'Node.js': { x: 40, y: 78 },
  MongoDB: { x: 62, y: 78 },
  Express: { x: 82, y: 72 },
  JavaScript: { x: 30, y: 90 },
  HTML: { x: 55, y: 90 },
  CSS: { x: 75, y: 90 },
  Git: { x: 8, y: 50 },
};

// Explicit neural connections between technologies
const CONNECTIONS: [string, string][] = [
  ['Python', 'TensorFlow'],
  ['Python', 'OpenCV'],
  ['Python', 'YOLO'],
  ['Python', 'PyTorch'],
  ['TensorFlow', 'YOLO'],
  ['OpenCV', 'YOLO'],
  ['React', 'JavaScript'],
  ['Node.js', 'JavaScript'],
  ['Node.js', 'Express'],
  ['Node.js', 'MongoDB'],
  ['Express', 'MongoDB'],
  ['JavaScript', 'HTML'],
  ['JavaScript', 'CSS'],
  ['React', 'Node.js'],
  ['React', 'CSS'],
  ['Git', 'Python'],
  ['Git', 'React'],
  ['TensorFlow', 'PyTorch'],
];

// Category descriptions for clicked node
const CATEGORY: Record<string, string> = {
  Python: 'Primary language for AI, ML & CV pipelines',
  TensorFlow: 'Deep learning model building & training',
  OpenCV: 'Computer vision & image processing',
  YOLO: 'Real-time object detection models',
  PyTorch: 'Dynamic deep learning research framework',
  React: 'Modern SPA & interactive UI development',
  'Node.js': 'Server-side JavaScript runtime',
  MongoDB: 'NoSQL document database',
  Express: 'Backend REST API framework',
  JavaScript: 'Core web scripting language',
  HTML: 'Semantic web structure',
  CSS: 'Responsive styling & animation',
  Git: 'Version control & collaboration',
};

const CATEGORY_ICON: Record<string, React.ElementType> = {
  Python: Code2,
  TensorFlow: Network,
  OpenCV: Code2,
  YOLO: Zap,
  PyTorch: Network,
  React: Code2,
  'Node.js': Code2,
  MongoDB: Layers,
  Express: Code2,
  JavaScript: Code2,
  HTML: Code2,
  CSS: Code2,
  Git: Code2,
};

export function Skills({ skills }: SkillsProps) {
  const [selected, setSelected] = useState<string | null>(null);

  // skills that are related to the selected node
  const related = useMemo(() => {
    if (!selected) return new Set<string>();
    const set = new Set<string>();
    CONNECTIONS.forEach(([a, b]) => {
      if (a === selected) set.add(b);
      if (b === selected) set.add(a);
    });
    return set;
  }, [selected]);

  const levelOf = (name: string) => {
    for (const cat of skills) {
      const found = cat.items.find(
        (i) => i.name.toLowerCase() === name.toLowerCase()
      );
      if (found) return found.level;
    }
    return 'Proficient';
  };

  const levelWidth = (level: string) => {
    switch (level.toLowerCase()) {
      case 'advanced':
        return '90%';
      case 'proficient':
        return '75%';
      case 'basics':
        return '50%';
      case 'familiar':
        return '55%';
      default:
        return '70%';
    }
  };

  const allSkills = useMemo(
    () => Object.keys(NODE_POS),
    []
  );

  return (
    <div className="min-h-screen flex items-center py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#f4b400]/10 border border-[#f4b400]/25 text-amber text-xs font-mono font-medium tracking-widest uppercase">
            <Network className="w-4 h-4" /> Neural Skill Graph
          </div>
          <h2 className="display-h2 text-foreground mt-4">
            Skill <span className="gold-text-gradient">Neural Network</span>
          </h2>
          <p className="body-md text-muted mt-2 max-w-2xl">
            Click a node to inspect its neural connection. Related technologies
            light up along the synaptic paths.
          </p>
        </motion.div>

        {/* Interactive Neural Graph */}
        <div className="glass-panel rounded-3xl p-6 relative overflow-hidden h-[560px]">
          {/* Connecting lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {CONNECTIONS.map(([a, b], i) => {
              const pa = NODE_POS[a];
              const pb = NODE_POS[b];
              const isActive =
                selected === a || selected === b || related.has(a) || related.has(b);
              const isDirect =
                selected && (selected === a || selected === b);
              return (
                <motion.line
                  key={`${a}-${b}`}
                  x1={`${pa.x}%`}
                  y1={`${pa.y}%`}
                  x2={`${pb.x}%`}
                  y2={`${pb.y}%`}
                  stroke="#f4b400"
                  strokeWidth={isDirect ? 1.6 : 0.7}
                  strokeOpacity={
                    selected
                      ? isDirect
                        ? 0.85
                        : isActive
                        ? 0.4
                        : 0.06
                      : 0.18
                  }
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.5, delay: i * 0.03 }}
                />
              );
            })}
          </svg>

          {/* Nodes */}
          {allSkills.map((name) => {
            const pos = NODE_POS[name];
            const isSelected = selected === name;
            const isRelated = related.has(name);
            const IconCmp = CATEGORY_ICON[name] || Code2;
            return (
              <motion.button
                key={name}
                onClick={() => setSelected(isSelected ? null : name)}
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  x: 0,
                  y: 0,
                }}
                transition={{ type: 'spring', stiffness: 200 }}
                whileHover={{ scale: 1.25 }}
                style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full border font-mono text-xs font-medium transition-all duration-300 flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-amber text-[#0a0a0c] glow-gold scale-110 px-3.5 py-2'
                    : isRelated
                    ? 'bg-[#f4b400]/25 text-amber border-[#f4b400]/70 px-3 py-1.5'
                    : 'bg-card text-foreground/80 border-[#f4b400]/25 hover:border-[#f4b400] px-3 py-1.5'
                }`}
              >
                <IconCmp className="w-3.5 h-3.5" />
                {name}
              </motion.button>
            );
          })}

          {/* Pulse ring on selected */}
          {selected && (
            <motion.div
              key={selected}
              initial={{ scale: 0.6, opacity: 0.7 }}
              animate={{ scale: 2.4, opacity: 0 }}
              transition={{ duration: 1.2, repeat: Infinity }}
              className="absolute w-16 h-16 rounded-full border border-[#ffb000] pointer-events-none"
              style={{
                left: `${NODE_POS[selected].x}%`,
                top: `${NODE_POS[selected].y}%`,
                transform: 'translate(-50%,-50%)',
              }}
            />
          )}
        </div>

        {/* Details panel */}
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: selected ? 1 : 0, height: selected ? 'auto' : 0 }}
          className="overflow-hidden"
        >
          {selected && (
            <div className="glass-panel rounded-2xl p-5 mt-4 flex items-center justify-between">
              <div>
                <div className="text-lg font-semibold text-amber">{selected}</div>
                <div className="text-sm text-foreground/80 font-medium mt-1">
                  {CATEGORY[selected]}
                </div>
                <div className="caption-mono text-muted mt-1">
                  Proficiency: <span className="text-amber">{levelOf(selected)}</span>
                  {' · '}Synapses: <span className="text-amber">{related.size}</span>
                </div>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="p-2 rounded-xl bg-[#f4b400]/10 text-amber border border-[#f4b400]/20"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </motion.div>

        {/* Category breakdown — restructured as a compact knowledge strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          {skills?.map((cat, idx) => (
            <motion.div
              key={cat.category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.08 }}
              className="flat-surface edge-lit rounded-2xl p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="caption-mono text-amber uppercase">
                  {cat.category}
                </span>
                <span className="caption-mono text-muted">
                  {cat.items.length} skills
                </span>
              </div>
              <div className="space-y-2.5">
                {cat.items.map((item) => (
                  <div key={item.name}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-medium text-foreground/80">{item.name}</span>
                      <span className="caption-mono text-amber">{item.level}</span>
                    </div>
                    <div className="h-1 rounded-full bg-card-soft overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: levelWidth(item.level) }}
                        transition={{ duration: 0.8, delay: idx * 0.1 }}
                        className="h-full rounded-full bg-gradient-to-r from-yellow-400 to-amber-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
