'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, X, Sparkles, User, RefreshCw, Mic, Square, Loader2, ArrowUpRight, GraduationCap, Award, Briefcase, FolderGit2, Code2, Home, Mail, Phone, MapPin, Github as GithubIcon, Linkedin as LinkedinIcon, Cpu, Zap } from 'lucide-react';
import { PortfolioData } from '@/lib/data';
import { Github } from './icons';

interface PortihelpAIProps {
  portfolioData: PortfolioData;
  isAdminView?: boolean;
  onNavigate?: (screen: string) => void;
}

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  isSecretResponse?: boolean;
  rich?: React.ReactNode;
}

// Web Speech API typing (webkit prefixed)
declare global {
  interface Window {
    SpeechRecognition?: any;
    webkitSpeechRecognition?: any;
  }
}

// ---------- Fuzzy / keyword matching ----------
function normalize(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
}

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (!m) return n;
  if (!n) return m;
  const dp: number[] = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= n; j++) {
      const tmp = dp[j];
      dp[j] = Math.min(dp[j] + 1, dp[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = tmp;
    }
  }
  return dp[n];
}

function fuzzyMatch(query: string, candidates: string[]): string[] {
  const q = normalize(query);
  if (!q) return [];
  const scored = candidates
    .map((c) => {
      const cn = normalize(c);
      const contained = cn.includes(q) || q.includes(cn);
      const dist = levenshtein(q, cn);
      return { c, cn, score: contained ? 0 : dist };
    })
    .filter((s) => s.score <= 2 || s.cn.includes(q) || q.includes(s.cn))
    .sort((a, b) => a.score - b.score);
  return scored.slice(0, 5).map((s) => s.cn);
}

export function PortihelpAI({ portfolioData, isAdminView = false, onNavigate }: PortihelpAIProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [listening, setListening] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [suggestIndex, setSuggestIndex] = useState(-1);
  const [history, setHistory] = useState<string[]>([]);
  const recognitionRef = useRef<any>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'ai',
      text: isAdminView
        ? `Welcome to Admin CMS! I am portihelp AI. Ask about bio, skills, or projects.`
        : `Hi! I am portihelp AI, Jeeva's intelligent portfolio assistant. Ask me anything — skills, projects, certificates, experience, contact, or just tap a suggestion below.`,
      timestamp: 'Just now',
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ---------- Search index over portfolio ----------
  const index = useMemo(() => {
    const d = portfolioData;
    const terms: { term: string; type: string; label: string; screen: string }[] = [];
    const push = (term: string[], type: string, label: string, screen: string) =>
      term.forEach((t) => terms.push({ term: t.toLowerCase(), type, label, screen }));

    d.profile.targetRoles.forEach((r) => push([r], 'role', r, 'home'));
    push(['about', 'me', 'bio', 'profile', 'who', 'jeeva'], 'about', 'About / Bio', 'about');
    push(['education', 'degree', 'college', 'btech', 'university', 'cgpa'], 'education', 'Education', 'about');
    push(['cgpa', 'grade', 'score'], 'education', 'CGPA 8.03', 'about');
    push(['hackathon', 'inceptia', 'competition'], 'hackathon', 'INCEPTIA Hackathon', 'about');
    push(['achievement', 'award', 'honour'], 'achievement', 'Achievements', 'about');
    push(['language', 'english', 'tamil'], 'language', 'Languages', 'about');
    push(['career', 'goal', 'objective'], 'goal', 'AI/ML Engineer', 'home');
    push(['research', 'interest', 'area'], 'research', 'Research Areas', 'about');

    d.skills.forEach((cat) => {
      cat.items.forEach((it) =>
        push([it.name, it.name.replace('.js', ''), it.name.replace('(v8)', ''), it.name.replace('(v8)', 'yolo')], 'skill', `${it.name} (${it.level})`, 'skills')
      );
    });
    push(['skills', 'skill', 'technologies', 'tech', 'stack', 'tools'], 'skills', 'Skills', 'skills');
    push(['python', 'react', 'react.js', 'node', 'node.js', 'mongo', 'mongodb', 'yolo', 'opencv', 'tensorflow', 'ml', 'machine learning', 'ai', 'deep learning', 'cnn', 'full stack', 'vision', 'nlp', 'ocr', 'git', 'docker', 'javascript', 'express', 'html', 'css'], 'tech', 'Technology', 'skills');

    d.projects.forEach((p) =>
      push([p.title, ...p.title.split(' '), ...(p.category.split(' '))], 'project', p.title, 'projects')
    );
    d.projects.forEach((p) =>
      p.techStack.forEach((t) => push([`${t} project`, `${t} projects`], 'projecttech', p.title, 'projects'))
    );
    push(['projects', 'project', 'portfolio', 'work', 'case study'], 'projects', 'Projects', 'projects');
    push(['smart glasses', 'glasses', 'smart glass'], 'project', 'AI Smart Glass Navigation Assistant', 'projects');
    push(['wheelchair', 'mobility', 'smart wheelchair'], 'project', 'Smart Mobility Wheelchair', 'projects');
    push(['deepfake', 'ai detects', 'media detection', 'ai generated'], 'project', 'AI Detects — AI Generated Media Detection', 'projects');
    push(['career compass', 'career guidance'], 'project', 'Career Compass', 'projects');
    push(['project management', 'management system'], 'project', 'Project Management System', 'projects');

d.experience.forEach((e) =>
      push([e.company, ...e.company.split(' '), ...e.role.split(' ')], 'experience', `${e.role} @ ${e.company}`, 'experience')
    );
    push(['experience', 'intern', 'internship'], 'experience', 'Experience / Internships', 'experience');

    d.certifications.forEach((c) =>
      push([c.issuer, ...c.issuer.split(' '), ...c.title.split(' ')], 'certificate', c.title, 'certificates')
    );
    push(['certificate', 'certification', 'credentials', 'vault', 'award'], 'certificate', 'Certificates', 'certificates');

    push(['contact', 'reach', 'message', 'talk', 'connect'], 'contact', 'Contact', 'contact');
    push(['email', 'mail', 'gmail'], 'email', d.profile.email, 'contact');
    push(['phone', 'call', 'number', 'mobile'], 'phone', d.profile.phone, 'contact');
    push(['location', 'address', 'where', 'trichy', 'india'], 'location', 'Trichy, Tamil Nadu, India', 'contact');
    push(['github', 'git', 'repository', 'repo'], 'github', d.profile.github, 'contact');
    push(['linkedin', 'linked'], 'linkedin', d.profile.linkedIn, 'contact');
    push(['resume', 'cv', 'download'], 'resume', 'Resume', 'contact');

    return terms;
  }, [portfolioData]);

  // ---------- Autocomplete suggestions ----------
  useEffect(() => {
    const q = input.trim();
    if (!q || q.length < 1) {
      setSuggestions([]);
      setSuggestIndex(-1);
      return;
    }
    const matches = fuzzyMatch(q, Array.from(new Set(index.map((t) => t.label))).slice(0, 60));
    setSuggestions(matches.slice(0, 5));
    setSuggestIndex(-1);
  }, [input, index]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, streaming]);

  // ---------- Navigation helper ----------
  const goTo = (screen: string) => {
    setIsOpen(false);
    if (onNavigate) onNavigate(screen);
  };

  // ---------- Streaming text ----------
  const streamText = (msgId: string, full: string) => {
    setStreaming(true);
    let i = 0;
    const step = () => {
      i += 2;
      setMessages((prev) =>
        prev.map((m) => (m.id === msgId ? { ...m, text: full.slice(0, i) } : m))
      );
      if (i < full.length) {
        setTimeout(step, 12);
      } else {
        setStreaming(false);
      }
    };
    step();
  };

  // ---------- Rich card renderer ----------
  const renderRich = (type: string, label: string): React.ReactNode | null => {
    const d = portfolioData;
    switch (type) {
      case 'skill': {
        const parts = label.split(' (');
        const name = parts[0];
        const level = parts[1]?.replace(')', '') || '';
        const cat = d.skills.find((c) => c.items.some((i) => i.name.toLowerCase() === name.toLowerCase()));
        const projs = d.projects.filter((p) => p.techStack.some((t) => t.toLowerCase().includes(name.toLowerCase())));
        return (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber">{name}</span>
              {level && <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber/20 text-amber">{level}</span>}
            </div>
            <div className="text-[10px] text-muted">Category: {cat?.category || 'General'}</div>
            {projs.length > 0 && (
              <div className="text-[11px] text-muted">
                <span className="text-amber font-semibold">Projects:</span> {projs.map((p) => p.title).join(' · ')}
              </div>
            )}
          </div>
        );
      }
      case 'project': {
        const p = d.projects.find((x) => x.title.toLowerCase() === label.toLowerCase()) || d.projects.find((x) => x.title.toLowerCase().includes(label.toLowerCase()));
        if (!p) return <span>{label}</span>;
        return (
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="font-bold text-amber">{p.title}</span>
            </div>
            <div className="text-[11px] text-muted">{p.description}</div>
            <div className="flex flex-wrap gap-1">
              {p.techStack.map((t) => (
                <span key={t} className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-amber-300">{t}</span>
              ))}
            </div>
            <button
              onClick={() => goTo('projects')}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber hover:underline"
            >
              Open project <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        );
      }
      case 'experience': {
        const e = d.experience.find((x) => label.includes(x.role) || label.includes(x.company));
        if (!e) return <span>{label}</span>;
        return (
          <div className="space-y-1.5">
            <div className="font-bold text-amber">{e.role}</div>
            <div className="text-[11px] text-muted">{e.company} · {e.duration}</div>
            <div className="text-[11px] text-muted">{e.project}</div>
            <button onClick={() => goTo('experience')} className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber hover:underline">
              View timeline <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        );
      }
      case 'certificate': {
        const c = d.certifications.find((x) => x.title === label);
        if (!c) return <span>{label}</span>;
        return (
          <div className="space-y-1.5">
            <div className="font-bold text-amber flex items-center gap-1.5"><Award className="w-3.5 h-3.5" /> {c.title}</div>
            <div className="text-[11px] text-muted">{c.issuer} · {c.date}</div>
            <div className="text-[11px] text-muted">{c.description}</div>
            <button onClick={() => goTo('certificates')} className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber hover:underline">
              View vault <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        );
      }
      case 'education': {
        const edu = d.profile.education[0];
        return (
          <div className="space-y-1.5">
            <div className="font-bold text-amber flex items-center gap-1.5"><GraduationCap className="w-3.5 h-3.5" /> {edu?.degree}</div>
            <div className="text-[11px] text-muted">{edu?.institution}</div>
            <div className="text-[11px] text-amber">{edu?.score}</div>
            <button onClick={() => goTo('about')} className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber hover:underline">
              View profile <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        );
      }
      case 'hackathon': {
        const h = d.profile.hackathons[0];
        return (
          <div className="space-y-1.5">
            <div className="font-bold text-amber flex items-center gap-1.5"><Zap className="w-3.5 h-3.5" /> {h?.title}</div>
            <div className="text-[11px] text-muted">{h?.location}</div>
            <div className="text-[11px] text-muted">{h?.description}</div>
          </div>
        );
      }
      default:
        return null;
    }
  };

  // ---------- Intent resolution ----------
  const resolveIntent = (query: string): { reply: string; type: string; label: string; screen?: string } | null => {
    const q = normalize(query);
    if (!q) return null;

    // Resume
    if (q.includes('resume') || q.includes('cv') || q.includes('download')) {
      return { reply: `Here's Jeeva's resume — opening the contact channel to request/download it.`, type: 'resume', label: 'Resume', screen: 'contact' };
    }
    // email / phone
    if (q.includes('email') || q.includes('mail') || q.includes('gmail')) {
      return { reply: `Jeeva's email is ${portfolioData.profile.email}.`, type: 'email', label: portfolioData.profile.email, screen: 'contact' };
    }
    if (q.includes('phone') || q.includes('call') || q.includes('number') || q.includes('mobile')) {
      return { reply: `Jeeva's phone number is ${portfolioData.profile.phone}.`, type: 'phone', label: portfolioData.profile.phone, screen: 'contact' };
    }
    if (q.includes('location') || q.includes('address') || q.includes('where') || q.includes('trichy')) {
      return { reply: 'Jeeva is based in Trichy, Tamil Nadu, India.', type: 'location', label: 'Trichy, Tamil Nadu, India', screen: 'contact' };
    }
    if (q.includes('github')) {
      return { reply: portfolioData.profile.github, type: 'github', label: portfolioData.profile.github, screen: 'contact' };
    }
    if (q.includes('linkedin') || q.includes('linked')) {
      return { reply: portfolioData.profile.linkedIn, type: 'linkedin', label: portfolioData.profile.linkedIn, screen: 'contact' };
    }
    if (q.includes('contact') || q.includes('reach') || q.includes('message') || q.includes('talk') || q.includes('connect')) {
      return { reply: 'Opening the contact terminal — send Jeeva a message!', type: 'contact', label: 'Contact', screen: 'contact' };
    }

    // Hackathon
    if (q.includes('hackathon') || q.includes('inceptia') || q.includes('competition')) {
      return { reply: 'Jeeva participated in INCEPTIA, a national-level engineering hackathon in Pune.', type: 'hackathon', label: 'INCEPTIA', screen: 'about' };
    }
    // Achievements
    if (q.includes('achiev') || q.includes('award') || q.includes('honour')) {
      return { reply: 'Jeeva has B.Tech Honours selection and prototyped assistive AI vision systems.', type: 'about', label: 'Achievements', screen: 'about' };
    }
    // Languages
    if (q.includes('language') || q.includes('english') || q.includes('tamil')) {
      return { reply: 'Jeeva communicates in English and Tamil.', type: 'about', label: 'Languages', screen: 'about' };
    }
    // Education / CGPA
    if (q.includes('education') || q.includes('degree') || q.includes('college') || q.includes('btech') || q.includes('university')) {
      return { reply: 'Jeeva is pursuing B.Tech (Honours) IT at M.A.M. College of Engineering & Technology, Trichy.', type: 'education', label: 'Education', screen: 'about' };
    }
    if (q.includes('cgpa') || q.includes('grade') || q.includes('score')) {
      return { reply: 'Jeeva holds a CGPA of 8.03 in B.Tech IT (Honours).', type: 'education', label: 'CGPA 8.03', screen: 'about' };
    }
    // About / bio
    if (q.includes('about') || q.includes('bio') || q.includes('who is') || q.includes('who') || q.includes('jeeva') || q.includes('me')) {
      return { reply: 'Jeeva SenthilKumar is a final-year B.Tech IT (Honours) student passionate about AI, ML, Computer Vision, and Full Stack Development.', type: 'about', label: 'About', screen: 'about' };
    }
    // Career goal
    if (q.includes('career') || q.includes('goal') || q.includes('objective')) {
      return { reply: 'Jeeva aims to work as an AI/ML Engineer and Full Stack Developer, building intelligent automation and vision systems.', type: 'about', label: 'Career Goal', screen: 'home' };
    }

    // Certificates
    if (q.includes('certificate') || q.includes('certification') || q.includes('credential') || q.includes('vault')) {
      return { reply: `Jeeva holds ${portfolioData.certifications.length} verified credentials. Opening the Digital Vault.`, type: 'certificate', label: portfolioData.certifications[0]?.title || 'Certificates', screen: 'certificates' };
    }
    // Experience
    if (q.includes('experience') || q.includes('intern') || q.includes('internship')) {
      return { reply: 'Jeeva completed 3 internships: Cybernaut (AI/ML), Viruzverse (AI/ML CV), and SVASTI (Full Stack).', type: 'experience', label: 'Experience', screen: 'experience' };
    }
    // Projects
    if (q.includes('project') || q.includes('portfolio') || q.includes('work') || q.includes('case')) {
      return { reply: `Jeeva has built ${portfolioData.projects.length} projects. Opening the Holographic Workspace.`, type: 'project', label: portfolioData.projects[0]?.title || 'Projects', screen: 'projects' };
    }
    // Smart glasses / wheelchair specific
    if (q.includes('glasses') || q.includes('smart glass') || q.includes('navigation assistant')) {
      return { reply: 'AI Smart Glass Navigation Assistant — wearable CV glasses with YOLOv8 obstacle detection, OCR reading, and voice navigation.', type: 'project', label: 'AI Smart Glass Navigation Assistant', screen: 'projects' };
    }
    if (q.includes('wheelchair') || q.includes('mobility')) {
      return { reply: 'Smart Mobility Wheelchair — AI-powered assistive wheelchair with YOLOv8 obstacle detection and voice alerts.', type: 'project', label: 'Smart Mobility Wheelchair using AI Vision', screen: 'projects' };
    }
    if (q.includes('deepfake') || q.includes('ai generated') || q.includes('media detection')) {
      return { reply: 'AI Detects — a CNN-based system that detects AI-generated images and deepfakes.', type: 'project', label: 'AI Detects – AI Generated Media Detection', screen: 'projects' };
    }

    // Skills
    if (q.includes('skill') || q.includes('technolog') || q.includes('tech') || q.includes('stack') || q.includes('tool')) {
      return { reply: 'Jeeva is skilled in Python, React, Node, Express, MongoDB, OpenCV, YOLOv8, TensorFlow, and more. Opening the Neural Skill Network.', type: 'skill', label: 'Python (Proficient)', screen: 'skills' };
    }

    // Tech search (fuzzy over skill names)
    const techHits = index.filter((t) => t.type === 'skill' && fuzzyMatch(q, [t.term]).length > 0);
    if (techHits.length > 0) {
      const hit = techHits[0];
      return { reply: `Found skill match — ${hit.label}.`, type: 'skill', label: hit.label, screen: 'skills' };
    }
    const projectTechHits = index.filter((t) => t.type === 'projecttech');
    const techInProjects = projectTechHits.filter((t) => fuzzyMatch(q, [t.term]).length > 0);
    if (techInProjects.length > 0) {
      return { reply: `Found projects using that technology.`, type: 'project', label: techInProjects[0].label, screen: 'projects' };
    }

    // Generic navigation fallback
    if (q.includes('home') || q.includes('start')) return { reply: 'Taking you to the home screen.', type: 'about', label: 'Home', screen: 'home' };
    if (q.includes('about')) return { reply: 'Opening the Identity Module.', type: 'about', label: 'About', screen: 'about' };
    if (q.includes('skills')) return { reply: 'Opening the Neural Skill Network.', type: 'skill', label: 'Python (Proficient)', screen: 'skills' };
    if (q.includes('projects')) return { reply: 'Opening the Holographic Workspace.', type: 'project', label: 'Projects', screen: 'projects' };
    if (q.includes('certificate')) return { reply: 'Opening the Digital Vault.', type: 'certificate', label: 'Certificates', screen: 'certificates' };
    if (q.includes('experience') || q.includes('intern')) return { reply: 'Opening the AI Timeline.', type: 'experience', label: 'Experience', screen: 'experience' };
    if (q.includes('contact')) return { reply: 'Opening the Signal Terminal.', type: 'contact', label: 'Contact', screen: 'contact' };

    return null;
  };

  // ---------- Send handler ----------
  const handleSendMessage = async (textToSend?: string, keepOpen = true) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: Message = { id: Date.now().toString(), sender: 'user', text: query, timestamp: currentTime };
    setMessages((prev) => [...prev, userMsg]);
    setHistory((prev) => [query, ...prev.filter((h) => h !== query)].slice(0, 8));
    if (!textToSend) setInput('');
    setSuggestions([]);
    setSuggestIndex(-1);
    setLoading(true);

    const cleanQuery = query.trim();

    // Silent secret code
    if (cleanQuery === 'jeeva0225' || cleanQuery.toLowerCase() === 'jeeva0225') {
      try {
        const res = await fetch('/api/admin/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ secretCode: 'jeeva0225' }),
        });
        const authData = await res.json();
        if (res.ok && authData.success) {
          const secretMsg: Message = { id: (Date.now() + 1).toString(), sender: 'ai', text: '🔑 Access Granted! Redirecting to Admin Dashboard...', timestamp: currentTime, isSecretResponse: true };
          setMessages((prev) => [...prev, secretMsg]);
          setLoading(false);
          setTimeout(() => { router.push('/admin'); router.refresh(); }, 1000);
          return;
        }
      } catch (err) { console.error(err); }
    }

    // Resolve intent
    const resolved = resolveIntent(cleanQuery);
    const aiId = (Date.now() + 1).toString();

    if (resolved) {
      const properReply = resolved.type === 'skill' && resolved.screen === 'skills'
        ? resolved.reply
        : resolved.reply;
      const aiMsg: Message = { id: aiId, sender: 'ai', text: properReply || resolved.reply, timestamp: currentTime, rich: renderRich(resolved.type, resolved.label) };
      setMessages((prev) => [...prev, aiMsg]);
      if (resolved.screen && resolved.screen !== 'home') {
        setTimeout(() => { if (onNavigate) onNavigate(resolved.screen!); }, 900);
      }
      setLoading(false);
      streamText(aiId, properReply);
      return;
    }

    // Nothing found — polite fallback with suggestions
    const fallback = `I couldn't find an exact match for "${query}". Try asking about: skills, projects (smart glasses, wheelchair, deepfake), certificates, experience, contact, email, phone, GitHub, or LinkedIn.`;
    const aiMsg: Message = { id: aiId, sender: 'ai', text: fallback, timestamp: currentTime };
    setMessages((prev) => [...prev, aiMsg]);
    setLoading(false);
    streamText(aiId, fallback);
  };

  // ---------- Voice ----------
  const toggleVoice = () => {
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      const aiId = (Date.now() + 1).toString();
      const msg = 'Voice input is not supported in this browser. Try Chrome or Edge.';
      setMessages((prev) => [...prev, { id: aiId, sender: 'ai', text: msg, timestamp: 'Just now' }]);
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      setInput(transcript);
      handleSendMessage(transcript);
    };
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  };

  const quickActions = [
    { label: 'Projects', query: 'projects' },
    { label: 'Skills', query: 'skills' },
    { label: 'Certificates', query: 'certificates' },
    { label: 'Experience', query: 'experience' },
    { label: 'Contact', query: 'contact' },
    { label: 'Email', query: 'email' },
    { label: 'Resume', query: 'resume' },
    { label: 'Smart Glasses', query: 'smart glasses' },
  ];

  return (
    <div className="fixed bottom-[calc(max(8px,env(safe-area-inset-bottom))+5rem)] right-2 sm:right-6 z-50">
      {/* Launcher */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => setIsOpen(true)}
            aria-label="Open portihelp AI assistant"
            className="flex items-center justify-center rounded-full bg-gradient-to-r from-amber-500 to-amber-700 dark:from-yellow-400 dark:to-amber-500 text-white dark:text-zinc-950 font-black font-mono shadow-lg shadow-amber-500/30 border border-amber-400/40 w-10 h-10 sm:w-auto sm:h-12 sm:justify-start sm:gap-2.5 sm:px-4"
          >
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-zinc-950 text-amber-400 flex items-center justify-center shrink-0">
              <Bot className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </div>
            <span className="hidden sm:inline text-xs">portihelp AI</span>
            <span className="hidden sm:inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-[calc(max(10px,env(safe-area-inset-bottom))+1rem)] right-3 sm:right-6 w-[calc(100vw-1.5rem)] max-w-[360px] sm:w-[420px] h-[70vh] max-h-[520px] rounded-3xl bg-zinc-950 border border-amber-500/40 shadow-2xl flex flex-col overflow-hidden text-white relative backdrop-blur-xl"
          >
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-amber-600 to-amber-800 dark:from-yellow-400 dark:to-amber-500 text-white dark:text-zinc-950 flex items-center justify-between font-black">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-zinc-950 text-amber-400 flex items-center justify-center shadow">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm leading-tight">portihelp AI</h3>
                  <p className="text-[10px] font-mono text-amber-200 dark:text-zinc-900 flex items-center gap-1 font-bold">
                    <Sparkles className="w-2.5 h-2.5" /> Portfolio Assistant
                  </p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-1.5 rounded-lg text-white dark:text-zinc-950 hover:bg-black/20">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick actions */}
            <div className="px-3 py-2 bg-zinc-900 border-b border-zinc-800 flex items-center gap-1.5 overflow-x-auto text-[10px] font-mono">
              {quickActions.map((qa) => (
                <button
                  key={qa.label}
                  onClick={() => handleSendMessage(qa.query)}
                  className="px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20 whitespace-nowrap hover:bg-amber-500/20 transition-colors"
                >
                  {qa.label}
                </button>
              ))}
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-zinc-950">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex gap-2.5 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${msg.sender === 'user' ? 'bg-amber-400 text-zinc-950' : 'bg-zinc-800 text-amber-400'}`}>
                    {msg.sender === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                  </div>
                  <div className={`max-w-[80%] p-3 rounded-2xl text-xs leading-relaxed ${msg.isSecretResponse ? 'bg-emerald-500 text-zinc-950 font-black rounded-tl-none border border-emerald-300' : msg.sender === 'user' ? 'bg-amber-500 text-zinc-950 font-bold rounded-tr-none' : 'bg-zinc-900 text-zinc-100 border border-zinc-800 rounded-tl-none'}`}>
                    {msg.text}
                    {msg.text.endsWith('▍') && <span className="blink">_</span>}
                    {msg.rich && <div className="mt-2 pt-2 border-t border-zinc-800">{msg.rich}</div>}
                    <span className="block text-[9px] font-mono opacity-60 text-right mt-1" suppressHydrationWarning>{msg.timestamp}</span>
                  </div>
                </div>
              ))}

              {loading && !streaming && (
                <div className="flex items-center gap-2 text-xs text-amber-400 font-mono">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> portihelp AI thinking...
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Autocomplete dropdown */}
            {suggestions.length > 0 && (
              <div className="absolute bottom-[3.5rem] left-3 right-3 z-10 rounded-xl bg-zinc-900 border border-zinc-700 shadow-2xl overflow-hidden">
                {suggestions.map((s, i) => (
                  <button
                    key={s}
                    onMouseDown={(e) => { e.preventDefault(); setInput(s); setSuggestions([]); }}
                    className={`w-full text-left px-3 py-2 text-xs font-mono flex items-center gap-2 ${i === suggestIndex ? 'bg-amber-500/20 text-amber' : 'text-zinc-200 hover:bg-zinc-800'}`}
                  >
                    <Sparkles className="w-3 h-3 text-amber" /> {s}
                  </button>
                ))}
              </div>
            )}

            {/* Input bar */}
            <div className="p-3 bg-zinc-900 border-t border-zinc-800 flex items-center gap-2 relative">
              <button
                onClick={toggleVoice}
                className={`p-2.5 rounded-xl shrink-0 transition-colors ${listening ? 'bg-red-500 text-white animate-pulse' : 'bg-zinc-800 text-amber-400 hover:bg-zinc-700'}`}
                aria-label="Voice input"
              >
                {listening ? <Square className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
              <input
                type="text"
                placeholder={listening ? 'Listening...' : 'Ask portihelp AI anything...'}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && suggestions.length > 0 && suggestIndex >= 0) {
                    setInput(suggestions[suggestIndex]);
                    handleSendMessage(suggestions[suggestIndex]);
                  } else if (e.key === 'Enter') {
                    handleSendMessage();
                  } else if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    setSuggestIndex((i) => Math.min(i + 1, suggestions.length - 1));
                  } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    setSuggestIndex((i) => Math.max(i - 1, 0));
                  } else if (e.key === 'Escape') {
                    setSuggestions([]);
                    setSuggestIndex(-1);
                  }
                }}
                className="flex-1 px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-xs text-white focus:border-amber-400 focus:outline-none"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={loading}
                className="p-2.5 rounded-xl bg-amber-400 text-zinc-950 font-black hover:bg-amber-300 transition-colors disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
