'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Briefcase,
  FolderGit2,
  Code2,
  Award,
  Save,
  LogOut,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  GraduationCap,
  Sparkles,
  ArrowLeft,
  FileText,
  Inbox,
  Mail,
  Check,
  Search,
  Clock,
  Reply
} from 'lucide-react';
import { PortfolioData, ProjectItem, ExperienceItem, SkillCategory, CertificationItem } from '@/lib/data';
import { PortihelpAI } from '@/components/portihelp-ai';
import Link from 'next/link';

interface AdminDashboardProps {
  initialData: PortfolioData;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  date: string;
  timestamp: number;
  read: boolean;
  isRead?: boolean;
  notificationSent?: boolean;
}

export function AdminDashboard({ initialData }: AdminDashboardProps) {
  const router = useRouter();
  const [data, setData] = useState<PortfolioData>(initialData);
  const [activeTab, setActiveTab] = useState<'profile' | 'projects' | 'experience' | 'skills' | 'certifications' | 'inbox'>('profile');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Messages state
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [msgFilter, setMsgFilter] = useState<'all' | 'unread'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch received messages
  const fetchMessages = async () => {
    try {
      const res = await fetch('/api/admin/messages');
      const resData = await res.json();
      if (res.ok && resData.success) {
        setMessages(resData.messages || []);
      }
    } catch {
      // Ignore network errors
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const unreadCount = messages.filter((m) => !m.isRead && !m.read).length;

  const handleMessageAction = async (action: 'delete' | 'toggleRead' | 'markAllRead', id?: string) => {
    try {
      const res = await fetch('/api/admin/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, id }),
      });
      const resData = await res.json();
      if (res.ok && resData.success) {
        const updatedMsgs = resData.messages || [];
        setMessages(updatedMsgs);
        
        if (action === 'delete' && selectedMessage?.id === id) {
          setSelectedMessage(null);
        } else if (id) {
          const updatedSelected = updatedMsgs.find((m: any) => m.id === id);
          if (updatedSelected) {
            setSelectedMessage(updatedSelected);
          }
        }
      }
    } catch {
      // Ignore errors
    }
  };

  // Helper Toast trigger
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Save all modifications to disk via API
  const handleSaveAll = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const resData = await res.json();
      if (res.ok && resData.success) {
        showToast('Portfolio changes saved & published successfully!', 'success');
        router.refresh();
      } else {
        showToast(resData.error || 'Failed to save changes', 'error');
      }
    } catch {
      showToast('Server error while saving portfolio data', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  };

  // -------------------------------------------------------------
  // CRUD Handlers for Projects
  // -------------------------------------------------------------
  const [editingProject, setEditingProject] = useState<ProjectItem | null>(null);
  const [isNewProject, setIsNewProject] = useState(false);

  const saveProjectModal = (project: ProjectItem) => {
    if (isNewProject) {
      setData({ ...data, projects: [...data.projects, project] });
      showToast('Added new project');
    } else {
      setData({
        ...data,
        projects: data.projects.map((p) => (p.id === project.id ? project : p)),
      });
      showToast('Updated project details');
    }
    setEditingProject(null);
  };

  const deleteProject = (id: string) => {
    if (confirm('Are you sure you want to delete this project?')) {
      setData({ ...data, projects: data.projects.filter((p) => p.id !== id) });
      showToast('Project deleted');
    }
  };

  // -------------------------------------------------------------
  // CRUD Handlers for Experience
  // -------------------------------------------------------------
  const [editingExp, setEditingExp] = useState<ExperienceItem | null>(null);
  const [isNewExp, setIsNewExp] = useState(false);

  const saveExpModal = (exp: ExperienceItem) => {
    if (isNewExp) {
      setData({ ...data, experience: [...data.experience, exp] });
      showToast('Added new internship experience');
    } else {
      setData({
        ...data,
        experience: data.experience.map((e) => (e.id === exp.id ? exp : e)),
      });
      showToast('Updated experience');
    }
    setEditingExp(null);
  };

  const deleteExp = (id: string) => {
    if (confirm('Are you sure you want to delete this experience record?')) {
      setData({ ...data, experience: data.experience.filter((e) => e.id !== id) });
      showToast('Experience deleted');
    }
  };

  // -------------------------------------------------------------
  // CRUD Handlers for Certifications
  // -------------------------------------------------------------
  const [editingCert, setEditingCert] = useState<CertificationItem | null>(null);
  const [isNewCert, setIsNewCert] = useState(false);

  const saveCertModal = (cert: CertificationItem) => {
    if (isNewCert) {
      setData({ ...data, certifications: [...data.certifications, cert] });
      showToast('Added new certification');
    } else {
      setData({
        ...data,
        certifications: data.certifications.map((c) => (c.id === cert.id ? cert : c)),
      });
      showToast('Updated certification');
    }
    setEditingCert(null);
  };

  const deleteCert = (id: string) => {
    if (confirm('Are you sure you want to delete this certification?')) {
      setData({ ...data, certifications: data.certifications.filter((c) => c.id !== id) });
      showToast('Certification deleted');
    }
  };

  // -------------------------------------------------------------
  // CRUD Handlers for Skills
  // -------------------------------------------------------------
  const addSkillToCategory = (categoryName: string, name: string, level: string) => {
    if (!name.trim()) return;
    const updatedSkills = data.skills.map((cat) => {
      if (cat.category === categoryName) {
        return { ...cat, items: [...cat.items, { name, level }] };
      }
      return cat;
    });
    setData({ ...data, skills: updatedSkills });
    showToast(`Added ${name} to ${categoryName}`);
  };

  const deleteSkillFromCategory = (categoryName: string, skillName: string) => {
    const updatedSkills = data.skills.map((cat) => {
      if (cat.category === categoryName) {
        return { ...cat, items: cat.items.filter((s) => s.name !== skillName) };
      }
      return cat;
    });
    setData({ ...data, skills: updatedSkills });
    showToast(`Removed ${skillName}`);
  };

  const filteredMessages = messages.filter((m) => {
    if (msgFilter === 'unread' && m.read) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.subject.toLowerCase().includes(q) ||
        m.message.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans pb-24">
      
      {/* Admin Top Navigation */}
      <header className="sticky top-0 z-40 bg-zinc-900/90 backdrop-blur-md border-b border-zinc-800 px-4 sm:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="p-2 rounded-xl bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
            title="View Live Site"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-extrabold text-lg text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" /> Admin Content CMS
            </h1>
            <p className="text-xs text-zinc-400 font-mono">Managing Portfolio for {data.profile.name}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSaveAll}
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-zinc-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 hover:from-amber-300 hover:to-amber-400 transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Publishing...' : 'Save & Publish All'}
          </button>

          <button
            onClick={handleLogout}
            className="p-2.5 rounded-xl bg-zinc-800/80 text-zinc-400 hover:text-red-400 border border-zinc-700 hover:border-red-500/50 transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Admin Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 border-b border-zinc-800 pb-4">
          {[
            { id: 'inbox', label: `Contact Inbox (${messages.length})`, icon: Inbox, badge: unreadCount },
            { id: 'profile', label: 'Profile & Bio', icon: User },
            { id: 'projects', label: `Projects (${data.projects.length})`, icon: FolderGit2 },
            { id: 'experience', label: `Experience (${data.experience.length})`, icon: Briefcase },
            { id: 'skills', label: 'Skills Grid', icon: Code2 },
            { id: 'certifications', label: `Certifications (${data.certifications.length})`, icon: Award },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  if (tab.id === 'inbox') fetchMessages();
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono font-bold transition-all relative ${
                  isActive
                    ? 'bg-amber-400 text-zinc-950 shadow-md'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.badge && tab.badge > 0 ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-red-500 text-white animate-pulse">
                    {tab.badge} NEW
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>

        {/* ----------------------------------------------------------------- */}
        {/* TAB 0: CONTACT INBOX */}
        {/* ----------------------------------------------------------------- */}
        {activeTab === 'inbox' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-zinc-900/60 p-5 rounded-2xl border border-zinc-800">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Inbox className="w-5 h-5 text-amber-400" /> Received Contact Messages
                </h2>
                <p className="text-xs text-zinc-400 font-mono mt-1">
                  View and respond to messages submitted by visitors on your website contact form.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <a
                  href={`https://mail.google.com/mail/?view=cm&fs=1&to=jeevasenthilkumar0225@gmail.com&su=${encodeURIComponent(`🔔 PENDING INBOX ALERT: ${unreadCount} Unread Messages Pending`)}&body=${encodeURIComponent(`Hi Jeeva,\n\nYou have ${unreadCount} unread contact message(s) pending in your Portfolio Admin Inbox!\n\nOpen Admin Inbox: http://localhost:3000/admin\n`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 rounded-xl bg-amber-400 text-zinc-950 hover:bg-amber-300 text-xs font-mono font-bold border border-amber-400/30 flex items-center gap-1.5 shadow-sm"
                >
                  <Mail className="w-3.5 h-3.5" /> Alert My Gmail ({unreadCount} Pending)
                </a>
                <button
                  onClick={() => handleMessageAction('markAllRead')}
                  className="px-3.5 py-2 rounded-xl bg-zinc-800 text-zinc-300 hover:text-white text-xs font-mono font-semibold border border-zinc-700"
                >
                  Mark All Read
                </button>
                <button
                  onClick={fetchMessages}
                  className="px-3.5 py-2 rounded-xl bg-amber-400/10 text-amber-300 text-xs font-mono font-semibold border border-amber-400/20"
                >
                  Refresh Inbox
                </button>
              </div>
            </div>

            {/* Inbox Stats KPI Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-zinc-400 block uppercase">Unread Messages</span>
                  <span className="text-xl font-bold text-red-400">🔴 {unreadCount} New</span>
                </div>
                <Inbox className="w-5 h-5 text-red-400" />
              </div>
              <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-zinc-400 block uppercase">Read Messages</span>
                  <span className="text-xl font-bold text-zinc-300">{messages.length - unreadCount} Processed</span>
                </div>
                <Check className="w-5 h-5 text-zinc-500" />
              </div>
              <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-zinc-400 block uppercase">Total Messages</span>
                  <span className="text-xl font-bold text-white">{messages.length} Total</span>
                </div>
                <Mail className="w-5 h-5 text-amber-400" />
              </div>
            </div>

            {/* Filter and Search controls */}
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="flex gap-2">
                <button
                  onClick={() => setMsgFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold ${
                    msgFilter === 'all' ? 'bg-amber-400 text-zinc-950' : 'bg-zinc-900 text-zinc-400'
                  }`}
                >
                  All ({messages.length})
                </button>
                <button
                  onClick={() => setMsgFilter('unread')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold ${
                    msgFilter === 'unread' ? 'bg-amber-400 text-zinc-950' : 'bg-zinc-900 text-zinc-400'
                  }`}
                >
                  Unread ({unreadCount})
                </button>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search sender, subject..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* Messages List & Preview Split View */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Messages Sidebar */}
              <div className="lg:col-span-5 space-y-3 max-h-[600px] overflow-y-auto pr-1">
                {filteredMessages.length === 0 ? (
                  <div className="p-8 text-center bg-zinc-900/40 rounded-2xl border border-zinc-800 text-zinc-500 text-xs font-mono">
                    No contact messages received yet.
                  </div>
                ) : (
                  filteredMessages.map((msg) => {
                    const isSelected = selectedMessage?.id === msg.id;
                    return (
                      <div
                        key={msg.id}
                        onClick={() => {
                          setSelectedMessage(msg);
                          if (!msg.isRead && !msg.read) handleMessageAction('toggleRead', msg.id);
                        }}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 relative ${
                          isSelected
                            ? 'bg-zinc-800 border-amber-400 shadow-md'
                            : (msg.isRead || msg.read)
                            ? 'bg-zinc-900/50 border-zinc-800/80 hover:border-zinc-700'
                            : 'bg-amber-950/20 border-amber-500/40 hover:border-amber-400'
                        }`}
                      >
                        {(!msg.isRead && !msg.read) && (
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 absolute top-4 right-4" />
                        )}

                        <div className="flex justify-between items-start pr-4">
                          <h4 className="font-bold text-sm text-white truncate">{msg.name}</h4>
                          <span className="text-[10px] font-mono text-zinc-400">{msg.date}</span>
                        </div>

                        <p className="text-xs text-amber-300 font-mono font-medium truncate">{msg.subject}</p>
                        <p className="text-xs text-zinc-400 line-clamp-2">{msg.message}</p>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Selected Message Detail View */}
              <div className="lg:col-span-7">
                {selectedMessage ? (
                  <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-6">
                    <div className="flex items-start justify-between border-b border-zinc-800 pb-4">
                      <div className="space-y-1">
                        <span className="text-[11px] font-mono text-amber-400 font-bold uppercase">
                          Message from Visitor
                        </span>
                        <h3 className="text-xl font-bold text-white">{selectedMessage.subject}</h3>
                        <p className="text-xs text-zinc-400 font-mono">
                          Sender: <span className="text-white font-semibold">{selectedMessage.name}</span> ({selectedMessage.email})
                        </p>
                        <p className="text-[11px] text-zinc-500 font-mono flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Received: {selectedMessage.date}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleMessageAction('toggleRead', selectedMessage.id)}
                          className="p-2 rounded-xl bg-zinc-800 text-zinc-400 hover:text-white"
                          title={(selectedMessage.isRead || selectedMessage.read) ? 'Mark as Unread' : 'Mark as Read'}
                        >
                          <Check className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleMessageAction('delete', selectedMessage.id)}
                          className="p-2 rounded-xl bg-zinc-800 text-red-400 hover:bg-red-500/20"
                          title="Delete Message"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 font-mono text-xs text-zinc-200 leading-relaxed whitespace-pre-wrap">
                      {selectedMessage.message}
                    </div>

                    <div className="pt-2 flex flex-wrap items-center justify-end gap-3">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(selectedMessage.email);
                          showToast(`Copied ${selectedMessage.email} to clipboard!`);
                        }}
                        className="px-4 py-2.5 rounded-xl bg-zinc-800 text-zinc-200 hover:text-white font-mono text-xs font-semibold border border-zinc-700 flex items-center gap-2"
                      >
                        <Mail className="w-3.5 h-3.5 text-amber-400" /> Copy Email ({selectedMessage.email})
                      </button>

                      <a
                        href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(selectedMessage.email)}&su=${encodeURIComponent(`Re: ${selectedMessage.subject}`)}&body=${encodeURIComponent(`Hi ${selectedMessage.name},\n\nThank you for getting in touch!\n\n`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-5 py-2.5 rounded-xl bg-amber-400 text-zinc-950 font-bold text-xs font-mono flex items-center gap-2 shadow-md hover:bg-amber-300"
                      >
                        <Reply className="w-4 h-4" /> Reply via Web Gmail <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="p-12 text-center bg-zinc-900/30 rounded-2xl border border-zinc-800 text-zinc-500 text-xs font-mono">
                    Select a contact message from the left list to read details.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* TAB 1: PROFILE & BIO EDITING */}
        {/* ----------------------------------------------------------------- */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-4">
              <h2 className="text-lg font-bold text-amber-400 flex items-center gap-2">
                <User className="w-5 h-5" /> Personal Information & Target Roles
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-mono text-zinc-400 block mb-1">Full Name</label>
                  <input
                    type="text"
                    value={data.profile.name}
                    onChange={(e) => setData({ ...data, profile: { ...data.profile, name: e.target.value } })}
                    className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono text-zinc-400 block mb-1">Email Address</label>
                  <input
                    type="email"
                    value={data.profile.email}
                    onChange={(e) => setData({ ...data, profile: { ...data.profile, email: e.target.value } })}
                    className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono text-zinc-400 block mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={data.profile.phone}
                    onChange={(e) => setData({ ...data, profile: { ...data.profile, phone: e.target.value } })}
                    className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono text-zinc-400 block mb-1">LinkedIn Profile URL</label>
                  <input
                    type="text"
                    value={data.profile.linkedIn}
                    onChange={(e) => setData({ ...data, profile: { ...data.profile, linkedIn: e.target.value } })}
                    className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono text-zinc-400 block mb-1">GitHub Profile URL</label>
                  <input
                    type="text"
                    value={data.profile.github}
                    onChange={(e) => setData({ ...data, profile: { ...data.profile, github: e.target.value } })}
                    className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-mono text-zinc-400 block mb-1">Professional Bio Summary</label>
                <textarea
                  rows={3}
                  value={data.profile.summary}
                  onChange={(e) => setData({ ...data, profile: { ...data.profile, summary: e.target.value } })}
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white resize-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* TAB 2: PROJECTS MANAGEMENT */}
        {/* ----------------------------------------------------------------- */}
        {activeTab === 'projects' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-zinc-900/60 p-4 rounded-2xl border border-zinc-800">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <FolderGit2 className="w-5 h-5 text-amber-400" /> Featured Engineering Projects ({data.projects.length})
              </h2>
              <button
                onClick={() => {
                  setIsNewProject(true);
                  setEditingProject({
                    id: `proj-${Date.now()}`,
                    title: '',
                    category: 'AI / Vision',
                    techStack: [],
                    description: '',
                    githubUrl: '',
                    featured: true,
                  });
                }}
                className="px-4 py-2 rounded-xl bg-amber-400 text-zinc-950 font-bold text-xs flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add New Project
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.projects.map((proj) => (
                <div key={proj.id} className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3 relative">
                  <div className="flex justify-between items-start">
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-mono bg-amber-400/10 text-amber-400 border border-amber-400/20">
                      {proj.category}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setIsNewProject(false);
                          setEditingProject(proj);
                        }}
                        className="p-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteProject(proj.id)}
                        className="p-1.5 rounded-lg bg-zinc-800 text-red-400 hover:bg-red-500/20"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="font-bold text-base text-white">{proj.title}</h3>
                  <p className="text-xs text-zinc-400 line-clamp-2">{proj.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* TAB 3: EXPERIENCE MANAGEMENT */}
        {/* ----------------------------------------------------------------- */}
        {activeTab === 'experience' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-zinc-900/60 p-4 rounded-2xl border border-zinc-800">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-amber-400" /> Internship Records ({data.experience.length})
              </h2>
              <button
                onClick={() => {
                  setIsNewExp(true);
                  setEditingExp({
                    id: `exp-${Date.now()}`,
                    company: '',
                    role: 'AI & ML Intern',
                    duration: '',
                    project: '',
                    responsibilities: ['Developed machine learning modules.'],
                  });
                }}
                className="px-4 py-2 rounded-xl bg-amber-400 text-zinc-950 font-bold text-xs flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add Experience Record
              </button>
            </div>

            <div className="space-y-4">
              {data.experience.map((exp) => (
                <div key={exp.id} className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 flex justify-between items-start">
                  <div className="space-y-1">
                    <h3 className="font-bold text-white text-base">{exp.role} @ {exp.company}</h3>
                    <p className="text-xs text-amber-400 font-mono">{exp.duration} | Project: {exp.project}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setIsNewExp(false);
                        setEditingExp(exp);
                      }}
                      className="p-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteExp(exp.id)}
                      className="p-1.5 rounded-lg bg-zinc-800 text-red-400 hover:bg-red-500/20"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* TAB 4: SKILLS GRID */}
        {/* ----------------------------------------------------------------- */}
        {activeTab === 'skills' && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Code2 className="w-5 h-5 text-amber-400" /> Technical Capabilities Matrix
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {data.skills.map((cat) => (
                <div key={cat.category} className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
                  <h3 className="font-bold text-sm text-amber-400 border-b border-zinc-800 pb-2">
                    {cat.category}
                  </h3>

                  <div className="flex flex-wrap gap-2">
                    {cat.items.map((s) => (
                      <span
                        key={s.name}
                        className="px-3 py-1 rounded-lg bg-zinc-950 border border-zinc-800 text-xs font-mono flex items-center gap-2"
                      >
                        <span className="text-white">{s.name}</span>
                        <span className="text-amber-400 text-[10px]">({s.level})</span>
                        <button
                          onClick={() => deleteSkillFromCategory(cat.category, s.name)}
                          className="text-zinc-500 hover:text-red-400 ml-1"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* TAB 5: CERTIFICATIONS VAULT */}
        {/* ----------------------------------------------------------------- */}
        {activeTab === 'certifications' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-zinc-900/60 p-4 rounded-2xl border border-zinc-800">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" /> Verified Certifications ({data.certifications.length})
              </h2>
              <button
                onClick={() => {
                  setIsNewCert(true);
                  setEditingCert({
                    id: `cert-${Date.now()}`,
                    title: '',
                    issuer: '',
                    date: '',
                    description: '',
                    driveUrl: '',
                  });
                }}
                className="px-4 py-2 rounded-xl bg-amber-400 text-zinc-950 font-bold text-xs flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add Certification
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.certifications.map((cert) => (
                <div key={cert.id} className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-white text-sm">{cert.title}</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setIsNewCert(false);
                          setEditingCert(cert);
                        }}
                        className="p-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteCert(cert.id)}
                        className="p-1.5 rounded-lg bg-zinc-800 text-red-400 hover:bg-red-500/20"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-amber-400 font-mono">{cert.issuer} • {cert.date}</p>
                  {cert.driveUrl && (
                    <a
                      href={cert.driveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-[11px] font-mono text-amber-300 hover:underline"
                    >
                      <FileText className="w-3.5 h-3.5" /> View Drive Link
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Floating Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl font-mono text-xs font-bold flex items-center gap-2.5 shadow-2xl border ${
              toast.type === 'success'
                ? 'bg-zinc-900 border-amber-400 text-amber-300'
                : 'bg-zinc-900 border-red-500 text-red-400'
            }`}
          >
            {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-amber-400" /> : <AlertCircle className="w-4 h-4 text-red-400" />}
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Portihelp AI Assistant inside Admin */}
      <PortihelpAI portfolioData={data} />
    </div>
  );
}
