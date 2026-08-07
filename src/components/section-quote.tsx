'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';

interface SectionQuoteProps {
  text: string;
  author?: string;
  align?: 'left' | 'center' | 'right';
  className?: string;
  delay?: number;
}

export function SectionQuote({
  text,
  author,
  align = 'left',
  className = '',
  delay = 0,
}: SectionQuoteProps) {
  const alignCls =
    align === 'center'
      ? 'text-center items-center'
      : align === 'right'
      ? 'text-right items-end ml-auto'
      : 'text-left items-start';

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.7, delay, ease: 'easeOut' }}
      whileHover={{ y: -3 }}
      className={`glass-panel rounded-2xl p-5 sm:p-6 relative overflow-hidden border border-[#f4b400]/20 max-w-md flex flex-col gap-3 ${alignCls} ${className}`}
    >
      {/* Golden corner glow */}
      <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-[#f4b400]/10 blur-2xl pointer-events-none" />

      {/* Animated quote mark */}
      <div className="relative">
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="w-10 h-10 rounded-xl bg-[#f4b400]/10 text-amber border border-[#f4b400]/25 flex items-center justify-center"
        >
          <Quote className="w-5 h-5 fill-current" />
        </motion.div>
      </div>

<p className="text-sm sm:text-base font-medium leading-relaxed text-text-quote italic">
        &ldquo;{text}&rdquo;
      </p>

      {author && (
        <div className="font-mono text-[11px] font-medium uppercase tracking-widest text-amber flex items-center gap-2">
          <span className="w-6 h-px bg-[#f4b400]/40" />
          {author}
        </div>
      )}
    </motion.div>
  );
}
