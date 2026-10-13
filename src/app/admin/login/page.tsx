'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, KeyRound, ArrowRight, ShieldAlert, Sparkles, User, AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AdminLoginPage() {
  const [authMode, setAuthMode] = useState<'passcode' | 'credentials'>('passcode');
  const [secretCode, setSecretCode] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const payload = authMode === 'passcode'
        ? { secretCode: secretCode.trim() }
        : { username: username.trim(), password };

      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        // Full navigation ensures cookie is attached and RSC cache is fresh
        window.location.href = '/admin';
      } else {
        setErrorMsg(data.error || 'Invalid credentials or access code');
      }
    } catch {
      setErrorMsg('An unexpected authentication network error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-zinc-950 text-zinc-100 relative overflow-hidden font-sans">
      {/* Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md p-8 rounded-3xl bg-zinc-900/90 border border-amber-500/30 backdrop-blur-xl shadow-2xl space-y-6 relative z-10"
      >
        {/* Back Link */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="text-xs font-mono text-zinc-400 hover:text-amber-400 flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Return to Portfolio
          </Link>
          <span className="text-[10px] font-mono text-amber-400/80 uppercase tracking-widest">
            v0.1.0 CMS
          </span>
        </div>

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-zinc-950 flex items-center justify-center mx-auto font-extrabold text-2xl shadow-lg">
            <Lock className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">Admin CMS Portal</h1>
          <p className="text-xs text-amber-400 font-mono flex items-center justify-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> Protected Content Management
          </p>
        </div>

        {/* Auth Mode Toggle */}
        <div className="flex rounded-xl bg-zinc-950 p-1 border border-zinc-800 text-xs font-mono">
          <button
            type="button"
            onClick={() => { setAuthMode('passcode'); setErrorMsg(''); }}
            className={`flex-1 py-2 rounded-lg font-bold transition-all ${
              authMode === 'passcode'
                ? 'bg-amber-400 text-zinc-950 shadow'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Passcode Access
          </button>
          <button
            type="button"
            onClick={() => { setAuthMode('credentials'); setErrorMsg(''); }}
            className={`flex-1 py-2 rounded-lg font-bold transition-all ${
              authMode === 'credentials'
                ? 'bg-amber-400 text-zinc-950 shadow'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Username & Password
          </button>
        </div>

        {/* Info Banner */}
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 space-y-1">
          <span className="font-bold flex items-center gap-1.5 font-mono text-amber-400">
            <ShieldAlert className="w-4 h-4" /> Restricted Access
          </span>
          <p className="text-zinc-400 text-[11px]">
            {authMode === 'passcode'
              ? 'Enter your master security passcode to access the administrative dashboard.'
              : 'Enter your administrative username and password credentials.'}
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* ACCESS FORM */}
        <form onSubmit={handleLogin} className="space-y-4">
          {authMode === 'passcode' ? (
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold text-zinc-300 uppercase flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-amber-400" /> Security Passcode
              </label>
              <input
                type="password"
                required
                placeholder="Enter passcode"
                value={secretCode}
                onChange={(e) => setSecretCode(e.target.value)}
                autoFocus
                className="w-full px-4 py-3 rounded-xl bg-zinc-800/80 border border-amber-500/40 text-sm text-white focus:border-amber-400 focus:outline-none transition-colors font-mono"
              />
            </div>
          ) : (
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-mono font-bold text-zinc-300 uppercase flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-amber-400" /> Username
                </label>
                <input
                  type="text"
                  required
                  placeholder="admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-zinc-800/80 border border-amber-500/40 text-sm text-white focus:border-amber-400 focus:outline-none transition-colors font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-mono font-bold text-zinc-300 uppercase flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-amber-400" /> Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-zinc-800/80 border border-amber-500/40 text-sm text-white focus:border-amber-400 focus:outline-none transition-colors font-mono"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-zinc-950 font-black text-sm hover:from-amber-300 hover:to-amber-400 flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Enter Admin Dashboard'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </motion.div>
    </div>
  );
}
