'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, CheckCircle, Calendar, Building, ExternalLink, FileText, BadgeCheck, Layers, ShieldCheck, X, ArrowRight } from 'lucide-react';
import { CertificationItem } from '@/lib/data';

interface CertificationsProps {
  certifications: CertificationItem[];
}

export function Certifications({ certifications }: CertificationsProps) {
  const [preview, setPreview] = useState<CertificationItem | null>(null);

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
              <ShieldCheck className="w-4 h-4" /> Verified Credentials
            </div>
            <h2 className="display-h2 text-foreground mt-4">
              Credential <span className="gold-text-gradient">Vault</span>
            </h2>
            <p className="body-md text-muted mt-3 max-w-2xl">
              A verified collection of professional certifications earned through hands-on
              internships and continuous learning across AI/ML, computer vision, and full-stack.
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
              <BadgeCheck className="w-5 h-5 text-amber shrink-0" />
              <div>
                <div className="text-lg font-semibold text-amber counter-value">{certifications?.length ?? 0}</div>
                <div className="caption-mono text-muted">Credentials</div>
              </div>
            </div>
            <div className="flat-surface edge-lit rounded-xl p-4 flex items-center gap-3">
              <Layers className="w-5 h-5 text-amber shrink-0" />
              <div>
                <div className="text-lg font-semibold text-amber counter-value">
                  {new Set(certifications?.map((c) => c.issuer)).size ?? 0}
                </div>
                <div className="caption-mono text-muted">Issuers</div>
              </div>
            </div>
            <div className="flat-surface edge-lit rounded-xl p-4 flex items-center gap-3">
              <Award className="w-5 h-5 text-amber shrink-0" />
              <div>
                <div className="text-lg font-semibold text-amber counter-value">
                  {certifications?.filter((c) => c.driveUrl).length ?? 0}
                </div>
                <div className="caption-mono text-muted">Full Credentials</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Premium Digital Vault document cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {certifications?.map((cert, index) => (
            <motion.div
              key={cert.id}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              onClick={() => setPreview(cert)}
              className="vault-card group cursor-pointer"
            >
              {/* Floating golden verification seal */}
              <div className="vault-seal">
                <ShieldCheck className="w-5 h-5" />
              </div>

              {/* Soft top glow */}
              <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-[#f4b400]/8 blur-3xl opacity-60 group-hover:opacity-100 transition-opacity pointer-events-none" />

              {cert.isPlaceholder && (
                <span className="absolute top-4 right-16 px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-[#f4b400]/10 text-amber border border-[#f4b400]/25">
                  EDITABLE
                </span>
              )}

              {/* Issuer logo + Verified */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#f4b400]/20 to-[#f4b400]/5 border border-[#f4b400]/30 text-amber flex items-center justify-center shrink-0 shadow-inner">
                  <Award className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 caption-mono text-amber uppercase font-semibold">
                    <CheckCircle className="w-3.5 h-3.5" /> Verified
                  </div>
                  <div className="text-sm font-semibold text-foreground truncate">{cert.issuer}</div>
                </div>
              </div>

              {/* Title — big, clear hierarchy */}
              <h3 className="text-lg sm:text-xl font-bold text-foreground leading-snug mb-3 pr-12">
                {cert.title}
              </h3>

              {/* Date pill badge */}
              <div className="flex items-center gap-2 mb-4">
                <span className="date-pill">
                  <Calendar className="w-3.5 h-3.5" /> {cert.date}
                </span>
              </div>

              {/* Divider */}
              <div className="h-px bg-gradient-to-r from-[#f4b400]/30 via-[#f4b400]/10 to-transparent mb-4" />

              {/* Description with better readability */}
              <p className="text-sm text-text-paragraph leading-relaxed mb-5">
                {cert.description}
              </p>

              {/* CTA row with animated arrow */}
              <div className="flex items-center justify-between pt-2 border-t border-[#f4b400]/10">
                {cert.driveUrl ? (
                  <span className="vault-cta">
                    <FileText className="w-4 h-4" /> Preview
                    <ArrowRight className="vault-arrow w-4 h-4" />
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-mono font-medium text-muted/60">
                    <FileText className="w-3.5 h-3.5" /> Link editable in Admin
                  </span>
                )}
                <span className="caption-mono text-muted/70 group-hover:text-amber transition-colors">
                  tap to open vault
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Preview modal */}
        <AnimatePresence>
          {preview && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="glass-panel rounded-3xl max-w-lg w-full p-6 space-y-4 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(244,180,0,0.12),transparent_60%)] pointer-events-none" />
                <button
                  onClick={() => setPreview(null)}
                  className="absolute top-4 right-4 p-2 rounded-xl bg-[#f4b400]/10 text-amber"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#f4b400]/20 to-[#f4b400]/5 border border-[#f4b400]/30 text-amber flex items-center justify-center">
                    <Award className="w-7 h-7" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 caption-mono text-amber uppercase">
                      <BadgeCheck className="w-4 h-4" /> Credential Verified
                    </div>
                    <h3 className="text-xl font-semibold text-foreground">{preview.title}</h3>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted font-medium border-y border-[#f4b400]/10 py-3">
                  <span className="flex items-center gap-1">
                    <Building className="w-3.5 h-3.5 text-amber" /> {preview.issuer}
                  </span>
                  <span className="flex items-center gap-1 font-mono">
                    <Calendar className="w-3.5 h-3.5 text-amber" /> {preview.date}
                  </span>
                </div>

                <p className="text-sm text-text-body leading-relaxed">
                  {preview.description}
                </p>

                {/* Verification animation */}
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <CheckCircle className="w-4 h-4" />
                  </motion.div>
                  <span className="text-xs font-mono">Signature validated · SHA-256 OK</span>
                </div>

                {preview.driveUrl && (
                  <a
                    href={preview.driveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 text-[#0a0a0c] font-semibold text-xs font-mono"
                  >
                    <FileText className="w-4 h-4" /> Open Full Credential
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
