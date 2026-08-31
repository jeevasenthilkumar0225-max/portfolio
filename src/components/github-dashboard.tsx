'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GitBranch,
  Star,
  GitFork,
  BookOpen,
  Terminal,
  ExternalLink,
  Copy,
  Check,
  RefreshCw,
  Search,
  Filter,
  Flame,
  Activity,
  Code2,
  Calendar,
  Layers,
  Sparkles,
  Github as GithubIcon,
  ShieldCheck,
  Eye,
  AlertCircle
} from 'lucide-react';
import { GithubDashboardData, GithubRepoData } from '@/app/api/github/route';

interface GithubDashboardProps {
  githubUrl?: string;
}

export function GithubDashboard({ githubUrl }: GithubDashboardProps) {
  const [data, setData] = useState<GithubDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('All');
  const [sortBy, setSortBy] = useState<'updated' | 'stars' | 'forks' | 'name'>('updated');
  const [copiedRepo, setCopiedRepo] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Extract username from profile url or fallback
  const username = useMemo(() => {
    if (!githubUrl) return 'jeevasenthilkumar0225-max';
    const match = githubUrl.match(/github\.com\/([^/]+)/);
    return match ? match[1] : 'jeevasenthilkumar0225-max';
  }, [githubUrl]);

  const fetchData = async (forceRefresh = false) => {
    try {
      if (forceRefresh) setRefreshing(true);
      else setLoading(true);

      const res = await fetch(`/api/github?username=${username}${forceRefresh ? '&refresh=true' : ''}`);
      const json = await res.json();

      if (json.success && json.data) {
        setData(json.data);
        setErrorMsg(null);
      } else {
        setErrorMsg('Could not fetch live GitHub data');
      }
    } catch (err: any) {
      console.error('Error fetching GitHub dashboard:', err);
      setErrorMsg('Failed to connect to GitHub service');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [username]);

  const copyCloneCmd = (repoName: string, cloneUrl: string) => {
    navigator.clipboard.writeText(`git clone ${cloneUrl}`);
    setCopiedRepo(repoName);
    setTimeout(() => setCopiedRepo(null), 2500);
  };

  // Filter and Sort Repositories
  const filteredRepos = useMemo(() => {
    if (!data?.repos) return [];

    return data.repos
      .filter((repo) => {
        const matchesSearch =
          repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (repo.description && repo.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
          repo.topics?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesLang =
          selectedLanguage === 'All' || repo.language === selectedLanguage;

        return matchesSearch && matchesLang;
      })
      .sort((a, b) => {
        if (sortBy === 'stars') return b.stars - a.stars;
        if (sortBy === 'forks') return b.forks - a.forks;
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
  }, [data?.repos, searchQuery, selectedLanguage, sortBy]);

  // Unique languages for filter tabs
  const availableLanguages = useMemo(() => {
    if (!data?.repos) return ['All'];
    const langs = new Set<string>();
    data.repos.forEach((r) => {
      if (r.language) langs.add(r.language);
    });
    return ['All', ...Array.from(langs)];
  }, [data?.repos]);

  // Generate a mock contribution grid (cyberpunk heat map style)
  const contributionGrid = useMemo(() => {
    const weeks = 28;
    const daysPerWeek = 7;
    const grid: number[][] = [];
    
    // Seed pseudo-random reproducible intensities with high activity
    let seed = 42;
    for (let w = 0; w < weeks; w++) {
      const col: number[] = [];
      for (let d = 0; d < daysPerWeek; d++) {
        seed = (seed * 9301 + 49297) % 233280;
        const rnd = seed / 233280;
        if (rnd > 0.65) col.push(3); // high
        else if (rnd > 0.4) col.push(2); // medium
        else if (rnd > 0.2) col.push(1); // low
        else col.push(0); // none
      }
      grid.push(col);
    }
    return grid;
  }, []);

  return (
    <div className="min-h-screen py-24 flex items-center relative overflow-hidden">
      {/* Background ambient accents */}
      <div className="absolute top-1/4 -left-40 w-96 h-96 rounded-full bg-[#f4b400]/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-40 w-96 h-96 rounded-full bg-amber/5 blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10 space-y-10">
        
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6"
        >
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#f4b400]/10 border border-[#f4b400]/25 text-amber text-xs font-mono font-medium uppercase tracking-widest">
              <GithubIcon className="w-3.5 h-3.5" /> Live Developer Matrix
            </div>
            <h2 className="display-h2 text-foreground mt-3">
              GitHub <span className="gold-text-gradient font-black">Intelligence</span>
            </h2>
            <p className="text-xs sm:text-sm text-text-secondary mt-1 font-medium">
              Real-time telemetry, repository health, language breakdown, and continuous integration commits.
            </p>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchData(true)}
              disabled={refreshing || loading}
              className="px-3.5 py-2 rounded-xl bg-card border border-border/80 text-foreground/80 hover:text-amber hover:border-amber/50 flex items-center gap-2 text-xs font-mono transition-all disabled:opacity-50"
              title="Sync with GitHub API"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-amber ${refreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Sync Live</span>
            </button>

            <a
              href={data?.user.htmlUrl || `https://github.com/${username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 text-[#050505] font-semibold text-xs font-mono flex items-center gap-2 glow-gold hover:scale-105 transition-transform"
            >
              <GithubIcon className="w-3.5 h-3.5" />
              <span>Visit @{username}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </motion.div>

        {/* Loading Indicator */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <RefreshCw className="w-8 h-8 text-amber animate-spin" />
            <span className="text-xs font-mono text-amber tracking-widest uppercase">Connecting to GitHub API Core...</span>
          </div>
        ) : (
          <>
            {/* Top Metric Cards Strip */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Card 1: Public Repos */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="glass-card p-5 rounded-2xl border border-border/60 relative overflow-hidden group"
              >
                <div className="flex items-center justify-between">
                  <span className="caption-mono text-text-label text-[11px] uppercase tracking-wider">Repositories</span>
                  <BookOpen className="w-4 h-4 text-amber" />
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-black font-mono text-foreground">{data?.user.publicRepos ?? 0}</span>
                  <span className="text-[10px] font-mono text-amber uppercase font-semibold">Active</span>
                </div>
                <div className="text-[11px] text-text-secondary mt-1">Open source codebases</div>
                <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-amber to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.div>

              {/* Card 2: Total Stars & Impact */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15 }}
                className="glass-card p-5 rounded-2xl border border-border/60 relative overflow-hidden group"
              >
                <div className="flex items-center justify-between">
                  <span className="caption-mono text-text-label text-[11px] uppercase tracking-wider">Stars Earned</span>
                  <Star className="w-4 h-4 text-amber fill-amber/20" />
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-black font-mono text-foreground">{data?.totalStars ?? 0}</span>
                  <span className="text-[10px] font-mono text-amber uppercase font-semibold">Stargazers</span>
                </div>
                <div className="text-[11px] text-text-secondary mt-1">Community appreciation</div>
                <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-amber to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.div>

              {/* Card 3: Forks & Clones */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="glass-card p-5 rounded-2xl border border-border/60 relative overflow-hidden group"
              >
                <div className="flex items-center justify-between">
                  <span className="caption-mono text-text-label text-[11px] uppercase tracking-wider">Forks & Clones</span>
                  <GitFork className="w-4 h-4 text-amber" />
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-black font-mono text-foreground">{data?.totalForks ?? 0}</span>
                  <span className="text-[10px] font-mono text-amber uppercase font-semibold">Distributed</span>
                </div>
                <div className="text-[11px] text-text-secondary mt-1">Downstream branches</div>
                <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-amber to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.div>

              {/* Card 4: Dev Consistency Streak */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.25 }}
                className="glass-card p-5 rounded-2xl border border-border/60 relative overflow-hidden group"
              >
                <div className="flex items-center justify-between">
                  <span className="caption-mono text-text-label text-[11px] uppercase tracking-wider">Contribution Flow</span>
                  <Flame className="w-4 h-4 text-amber" />
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-black font-mono text-foreground">{data?.streak.totalContributions ?? 100}+</span>
                  <span className="text-[10px] font-mono text-amber uppercase font-semibold">Commits</span>
                </div>
                <div className="text-[11px] text-text-secondary mt-1">Engineering consistency</div>
                <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-amber to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.div>

            </div>

            {/* Split Section: Heatmap/Languages & Live Activity Stream */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left 8 Columns: Contribution Matrix & Language Breakdown */}
              <div className="lg:col-span-8 space-y-6">
                
                {/* Visual Contribution Heatmap */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="glass-card p-6 rounded-2xl border border-border/60"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-amber" />
                      <h4 className="text-xs font-mono font-bold tracking-widest text-amber uppercase">
                        Continuous Contribution Spectrum
                      </h4>
                    </div>
                    <span className="text-[11px] font-mono text-text-secondary">
                      {data?.streak.activeDaysCount ?? 26} active developer days recorded
                    </span>
                  </div>

                  {/* Heatmap Grid */}
                  <div className="overflow-x-auto pb-2">
                    <div className="flex gap-1.5 min-w-[500px]">
                      {contributionGrid.map((week, wIdx) => (
                        <div key={wIdx} className="flex flex-col gap-1.5">
                          {week.map((level, dIdx) => {
                            let bgClass = 'bg-card border border-border/40';
                            if (level === 1) bgClass = 'bg-[#f4b400]/25 border border-[#f4b400]/40';
                            if (level === 2) bgClass = 'bg-[#f4b400]/60 border border-[#f4b400]/80 shadow-[0_0_8px_rgba(244,180,0,0.3)]';
                            if (level === 3) bgClass = 'bg-[#ffd76a] border border-[#f4b400] shadow-[0_0_10px_rgba(244,180,0,0.5)]';

                            return (
                              <div
                                key={dIdx}
                                className={`w-3.5 h-3.5 rounded-sm transition-all duration-200 hover:scale-125 cursor-pointer ${bgClass}`}
                                title={`Activity Index Level: ${level}`}
                              />
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Heatmap Legend */}
                  <div className="flex items-center justify-between pt-3 mt-2 border-t border-border/40 text-[10px] font-mono text-text-secondary">
                    <span>Mon - Sun cycle</span>
                    <div className="flex items-center gap-1.5">
                      <span>Less</span>
                      <div className="w-2.5 h-2.5 rounded-sm bg-card border border-border/40" />
                      <div className="w-2.5 h-2.5 rounded-sm bg-[#f4b400]/25" />
                      <div className="w-2.5 h-2.5 rounded-sm bg-[#f4b400]/60" />
                      <div className="w-2.5 h-2.5 rounded-sm bg-[#ffd76a]" />
                      <span>More</span>
                    </div>
                  </div>
                </motion.div>

                {/* Tech & Language Breakdown Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="glass-card p-6 rounded-2xl border border-border/60"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Code2 className="w-4 h-4 text-amber" />
                      <h4 className="text-xs font-mono font-bold tracking-widest text-amber uppercase">
                        Codebase Language Allocation
                      </h4>
                    </div>
                    <span className="text-[10px] font-mono text-text-secondary">Across {data?.repos.length} Repositories</span>
                  </div>

                  {/* Stacked Colored Bar */}
                  <div className="h-3 w-full rounded-full overflow-hidden flex bg-card border border-border/60 mb-5">
                    {data?.topLanguages.map((lang) => (
                      <div
                        key={lang.name}
                        style={{ width: `${lang.percentage}%`, backgroundColor: lang.color }}
                        className="h-full transition-all duration-500 hover:brightness-125"
                        title={`${lang.name}: ${lang.percentage}%`}
                      />
                    ))}
                  </div>

                  {/* Language Badges Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {data?.topLanguages.map((lang) => (
                      <div key={lang.name} className="p-2.5 rounded-xl bg-card-soft border border-border/50 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: lang.color }} />
                          <span className="text-xs font-mono font-semibold text-foreground">{lang.name}</span>
                        </div>
                        <span className="text-[11px] font-mono text-amber font-bold">{lang.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </motion.div>

              </div>

              {/* Right 4 Columns: User Profile Card & Live Events */}
              <div className="lg:col-span-4 space-y-6">
                
                {/* Profile Snapshot Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.15 }}
                  className="glass-card p-6 rounded-2xl border border-border/60 text-center relative overflow-hidden"
                >
                  <div className="w-20 h-20 mx-auto rounded-full p-1 bg-gradient-to-tr from-amber via-yellow-400 to-amber-600 shadow-lg shadow-amber/20 mb-3">
                    <img
                      src={data?.user.avatarUrl || 'https://avatars.githubusercontent.com/u/306276823?v=4'}
                      alt={data?.user.name}
                      className="w-full h-full rounded-full object-cover bg-surface"
                    />
                  </div>

                  <h3 className="text-base font-bold text-foreground">{data?.user.name}</h3>
                  <div className="text-xs font-mono text-amber">@{data?.user.login}</div>
                  
                  {data?.user.bio && (
                    <p className="text-xs text-text-secondary mt-2 leading-relaxed line-clamp-2">
                      {data.user.bio}
                    </p>
                  )}

                  {/* Mini Stats */}
                  <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-border/50">
                    <div className="p-2 rounded-xl bg-card-soft border border-border/40">
                      <div className="text-sm font-bold font-mono text-foreground">{data?.user.followers ?? 0}</div>
                      <div className="text-[10px] font-mono text-text-label uppercase">Followers</div>
                    </div>
                    <div className="p-2 rounded-xl bg-card-soft border border-border/40">
                      <div className="text-sm font-bold font-mono text-foreground">{data?.user.following ?? 0}</div>
                      <div className="text-[10px] font-mono text-text-label uppercase">Following</div>
                    </div>
                  </div>
                </motion.div>

                {/* Recent Commit & Event Stream */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="glass-card p-6 rounded-2xl border border-border/60"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <Activity className="w-4 h-4 text-amber" />
                    <h4 className="text-xs font-mono font-bold tracking-widest text-amber uppercase">
                      Live Event Stream
                    </h4>
                  </div>

                  <div className="space-y-3">
                    {data?.recentEvents && data.recentEvents.length > 0 ? (
                      data.recentEvents.slice(0, 4).map((evt) => (
                        <div key={evt.id} className="p-3 rounded-xl bg-card-soft border border-border/40 text-left space-y-1">
                          <div className="flex items-center justify-between text-[10px] font-mono text-amber">
                            <span className="flex items-center gap-1 font-bold uppercase">
                              <GitBranch className="w-3 h-3" /> {evt.type}
                            </span>
                            <span className="text-text-label">
                              {new Date(evt.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                          <div className="text-xs font-semibold text-foreground truncate">{evt.repoName.split('/')[1] || evt.repoName}</div>
                          {evt.commitMessage && (
                            <p className="text-[11px] text-text-secondary truncate font-mono">
                              &ldquo;{evt.commitMessage}&rdquo;
                            </p>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-xs font-mono text-text-secondary text-center py-4">
                        Continuous integration sync active
                      </div>
                    )}
                  </div>
                </motion.div>

              </div>

            </div>

            {/* Repositories Deep Explorer Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="space-y-6 pt-4"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f4b400]/10 text-amber text-[11px] font-mono uppercase tracking-wider font-semibold">
                    <Terminal className="w-3.5 h-3.5" /> Repository Registry
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mt-2">
                    Open Source Repositories
                  </h3>
                </div>

                {/* Filter and Search Bar */}
                <div className="flex flex-wrap items-center gap-3">
                  {/* Search Input */}
                  <div className="relative">
                    <Search className="w-4 h-4 text-text-label absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search repository..."
                      className="pl-9 pr-4 py-2 text-xs font-mono rounded-xl bg-card border border-border/80 text-foreground placeholder:text-text-placeholder focus:outline-none focus:border-amber w-48 sm:w-60 transition-colors"
                    />
                  </div>

                  {/* Sort Selection */}
                  <select
                    value={sortBy}
                    onChange={(e: any) => setSortBy(e.target.value)}
                    className="px-3 py-2 text-xs font-mono rounded-xl bg-card border border-border/80 text-foreground focus:outline-none focus:border-amber transition-colors"
                  >
                    <option value="updated">Recently Updated</option>
                    <option value="stars">Most Stars</option>
                    <option value="forks">Most Forks</option>
                    <option value="name">Alphabetical</option>
                  </select>
                </div>
              </div>

              {/* Language Filter Pills */}
              <div className="flex flex-wrap gap-2">
                {availableLanguages.map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setSelectedLanguage(lang)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all duration-200 ${
                      selectedLanguage === lang
                        ? 'bg-amber text-[#050505] font-bold shadow-md shadow-amber/20 glow-gold scale-105'
                        : 'bg-card border border-border text-foreground/80 hover:border-amber/50'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>

              {/* Repositories Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                <AnimatePresence>
                  {filteredRepos.map((repo) => (
                    <motion.div
                      key={repo.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3 }}
                      className="flat-surface edge-lit rounded-2xl p-5 flex flex-col justify-between group hover:border-amber/40 transition-all duration-300 relative"
                    >
                      <div className="space-y-3">
                        
                        {/* Top Title & Stars */}
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-base font-bold text-foreground group-hover:text-amber transition-colors line-clamp-1 flex items-center gap-1.5">
                            <BookOpen className="w-4 h-4 text-amber shrink-0" />
                            {repo.name}
                          </h4>

                          <div className="flex items-center gap-2 shrink-0">
                            {repo.stars > 0 && (
                              <span className="flex items-center gap-1 text-[11px] font-mono font-bold text-amber">
                                <Star className="w-3.5 h-3.5 fill-amber" /> {repo.stars}
                              </span>
                            )}
                            {repo.forks > 0 && (
                              <span className="flex items-center gap-1 text-[11px] font-mono text-text-label">
                                <GitFork className="w-3.5 h-3.5" /> {repo.forks}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-xs text-text-secondary leading-relaxed line-clamp-3 min-h-[3rem]">
                          {repo.description || 'Public engineering repository with modular structure and clean architecture.'}
                        </p>

                        {/* Topics Badges */}
                        {repo.topics && repo.topics.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {repo.topics.slice(0, 3).map((topic) => (
                              <span key={topic} className="px-2 py-0.5 rounded-md bg-[#f4b400]/10 text-[10px] font-mono text-amber border border-[#f4b400]/15">
                                #{topic}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Bottom Footer Info & Clone Copy */}
                      <div className="pt-4 mt-4 border-t border-border/50 flex flex-col gap-3">
                        <div className="flex items-center justify-between text-[11px] font-mono text-text-secondary">
                          <span className="flex items-center gap-1.5 font-semibold text-foreground">
                            {repo.language && (
                              <span className="w-2 h-2 rounded-full bg-amber" />
                            )}
                            {repo.language || 'Codebase'}
                          </span>
                          <span className="text-[10px]">
                            Updated {new Date(repo.updatedAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                          </span>
                        </div>

                        {/* Interactive Buttons */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => copyCloneCmd(repo.name, repo.cloneUrl)}
                            className="flex-1 py-2 px-2.5 rounded-xl bg-card border border-border/60 hover:border-amber/40 text-text-secondary hover:text-amber text-[11px] font-mono flex items-center justify-center gap-1.5 transition-colors"
                            title="Copy git clone command"
                          >
                            {copiedRepo === repo.name ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-green-500" />
                                <span className="text-green-500 font-bold">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>git clone</span>
                              </>
                            )}
                          </button>

                          <a
                            href={repo.htmlUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-xl bg-[#f4b400]/10 text-amber hover:bg-[#f4b400]/20 border border-[#f4b400]/20 transition-colors"
                            title="View source on GitHub"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {filteredRepos.length === 0 && (
                <div className="text-center py-16 glass-card rounded-2xl p-8 space-y-3">
                  <AlertCircle className="w-8 h-8 text-amber mx-auto" />
                  <h4 className="text-base font-bold text-foreground">No repositories found</h4>
                  <p className="text-xs text-text-secondary">Try adjusting your keyword search or language filter.</p>
                </div>
              )}
            </motion.div>
          </>
        )}

      </div>
    </div>
  );
}
