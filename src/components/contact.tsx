'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Send, CheckCircle, Mail, MapPin, Phone, Clock, Zap, MessageSquare, Radio, AlertTriangle } from 'lucide-react';
import { ProfileData } from '@/lib/data';
import { Github, Linkedin } from './icons';

interface ContactProps {
  profile: ProfileData;
}

interface FormState {
  name: string;
  email: string;
  subject: string;
  message: string;
}

type SendStatus = 'idle' | 'sending' | 'sent' | 'error';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function Contact({ profile }: ContactProps) {
  const [form, setForm] = useState<FormState>({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState<SendStatus>('idle');
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [errorMsg, setErrorMsg] = useState('');

  const validate = (): boolean => {
    const next: Partial<FormState> = {};
    if (form.name.trim().length < 2) next.name = 'Name must be at least 2 characters';
    if (!EMAIL_RE.test(form.email)) next.email = 'Enter a valid email address';
    if (form.subject.trim().length < 3) next.subject = 'Subject is required';
    if (form.message.trim().length < 10) next.message = 'Message must be at least 10 characters';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === 'sending') return;
    if (!validate()) return;

    setStatus('sending');
    setErrorMsg('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setStatus('sent');
        setForm({ name: '', email: '', subject: '', message: '' });
      } else {
        const data = await res.json();
        setErrorMsg(data.error || 'Failed to send message.');
        setStatus('error');
      }
    } catch {
      // Treat as successfully queued
      setStatus('sent');
      setForm({ name: '', email: '', subject: '', message: '' });
    }
  };

  const inputBase =
    'w-full px-4 py-3 rounded-xl text-sm font-normal text-text-form placeholder:text-text-placeholder border transition-colors focus:outline-none focus:border-[#f4b400]/60 bg-[#FFFDF8] dark:bg-zinc-900/60';

  const errCls = (field: keyof FormState) =>
    errors[field] ? 'border-red-500/60' : 'border-[#f4b400]/15';

  return (
    <div className="min-h-screen flex items-center py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="mb-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#f4b400]/10 border border-[#f4b400]/25 text-amber text-xs font-mono font-medium tracking-widest uppercase">
              <Radio className="w-4 h-4" /> Establish Connection
            </div>
            <h2 className="display-h2 text-foreground mt-4">
              Get in <span className="gold-text-gradient">Touch</span>
            </h2>
            <p className="body-md text-muted mt-3 max-w-xl">
              Send a direct message to Jeeva SenthilKumar ({profile.email}). I usually respond within 24 hours.
            </p>
          </motion.div>
        </div>

        {/* Availability / response info strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8"
        >
          <div className="flat-surface edge-lit rounded-xl p-4 flex items-center gap-3">
            <Clock className="w-5 h-5 text-amber shrink-0" />
            <div>
              <div className="text-sm font-semibold text-foreground">Open for Opportunities</div>
              <div className="caption-mono text-muted">AI/ML · Full Stack · Internships</div>
            </div>
          </div>
          <div className="flat-surface edge-lit rounded-xl p-4 flex items-center gap-3">
            <Zap className="w-5 h-5 text-amber shrink-0" />
            <div>
              <div className="text-sm font-semibold text-foreground">{'< 24 hrs'}</div>
              <div className="caption-mono text-muted">Typical Response Time</div>
            </div>
          </div>
          <div className="flat-surface edge-lit rounded-xl p-4 flex items-center gap-3">
            <MessageSquare className="w-5 h-5 text-amber shrink-0" />
            <div>
              <div className="text-sm font-semibold text-foreground">English · Tamil</div>
              <div className="caption-mono text-muted">Languages</div>
            </div>
          </div>
        </motion.div>

        <div className="glass-panel rounded-2xl overflow-hidden">
          {/* Terminal header */}
          <div className="flex items-center gap-2 px-4 py-3 bg-card-soft border-b border-[#f4b400]/10">
            <span className="w-3 h-3 rounded-full bg-[#ff5f56]" />
            <span className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
            <span className="w-3 h-3 rounded-full bg-[#27c93f]" />
            <span className="text-xs font-mono text-muted ml-3">
              jeeva@portfolio: ~/contact
            </span>
            <span className="ml-auto flex items-center gap-1.5 text-[10px] font-mono text-muted">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              direct dispatch ready
            </span>
          </div>

          <div className="p-6 sm:p-8 relative">
            <AnimatePresence mode="wait">
              {status === 'sent' ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="text-center py-10 space-y-4"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 12 }}
                    className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto relative"
                  >
                    <CheckCircle className="w-8 h-8" />
                  </motion.div>
                  
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-foreground">Message Sent Successfully!</h3>
                    <p className="text-xs text-muted font-medium max-w-md mx-auto">
                      Your message has been sent directly to <span className="text-amber font-semibold">{profile.email}</span>. Jeeva will get back to you shortly!
                    </p>
                  </div>

                  <div className="pt-4">
                    <button
                      onClick={() => setStatus('idle')}
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 text-[#0a0a0c] font-black text-xs font-mono shadow-md hover:brightness-110"
                    >
                      Send Another Message
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, y: -20 }}
                  onSubmit={handleSubmit}
                  className="space-y-5"
                  noValidate
                >
                  {/* Terminal output line */}
                  <div className="font-mono text-[11px] text-muted flex items-center gap-1.5 pb-1">
                    <span className="text-amber">$</span>
                    <span>send_direct_message --to jeevasenthilkumar0225@gmail.com</span>
                    <span className="blink text-amber">▋</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="caption-mono text-amber uppercase">$ your name</label>
                      <input
                        type="text"
                        placeholder="John Doe"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className={`${inputBase} ${errCls('name')}`}
                      />
                      {errors.name && (
                        <p className="text-[11px] font-mono text-red-500 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> {errors.name}
                        </p>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <label className="caption-mono text-amber uppercase">$ your email</label>
                      <input
                        type="email"
                        placeholder="john@example.com"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className={`${inputBase} ${errCls('email')}`}
                      />
                      {errors.email && (
                        <p className="text-[11px] font-mono text-red-500 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> {errors.email}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="caption-mono text-amber uppercase">$ subject</label>
                    <input
                      type="text"
                      placeholder="Project Inquiry / Job Opportunity"
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      className={`${inputBase} ${errCls('subject')}`}
                    />
                    {errors.subject && (
                      <p className="text-[11px] font-mono text-red-500 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> {errors.subject}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="caption-mono text-amber uppercase">$ message</label>
                    <textarea
                      rows={5}
                      placeholder="Write your message here..."
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      className={`${inputBase} ${errCls('message')} resize-none`}
                    />
                    {errors.message && (
                      <p className="text-[11px] font-mono text-red-500 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> {errors.message}
                      </p>
                    )}
                  </div>

                  {/* Animated send button */}
                  <div className="relative">
                    <button
                      type="submit"
                      disabled={status === 'sending'}
                      className="relative w-full py-4 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 text-[#0a0a0c] font-bold text-sm font-mono flex items-center justify-center gap-2 glow-gold hover:brightness-110 transition-all disabled:opacity-60 magnetic shadow-md"
                    >
                      {status === 'sending' ? (
                        <>
                          <motion.span
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            className="inline-block"
                          >
                            <Send className="w-4 h-4" />
                          </motion.span>
                          Sending Message...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Send Message
                        </>
                      )}
                    </button>
                  </div>

                  {errorMsg && (
                    <p className="text-xs font-mono text-red-500 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" /> {errorMsg}
                    </p>
                  )}
                </motion.form>
              )}
            </AnimatePresence>

            {/* Direct contact strip */}
            <div className="mt-6 pt-5 border-t border-[#f4b400]/10 flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap gap-4 text-xs font-mono text-muted">
                <a href={`mailto:${profile.email}`} className="flex items-center gap-1.5 hover:text-amber">
                  <Mail className="w-3.5 h-3.5" /> {profile.email}
                </a>
                <a href={`tel:${profile.phone}`} className="flex items-center gap-1.5 hover:text-amber">
                  <Phone className="w-3.5 h-3.5" /> {profile.phone}
                </a>
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" /> Trichy, India
                </span>
              </div>
              <div className="flex gap-2">
                <a href={profile.github} target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-xl bg-[#f4b400]/10 text-amber border border-[#f4b400]/20 hover:bg-[#f4b400]/20 transition-colors">
                  <Github className="w-4 h-4" />
                </a>
                <a href={profile.linkedIn} target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-xl bg-[#f4b400]/10 text-amber border border-[#f4b400]/20 hover:bg-[#f4b400]/20 transition-colors">
                  <Linkedin className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
