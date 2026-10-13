'use client';

import React, { useState, useEffect } from 'react';
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
  Reply,
  X,
  Download,
  Upload,
  Image as ImageIcon,
  HardDrive,
  Star,
  Tag,
  Calendar,
  Building,
} from 'lucide-react';
import {
  PortfolioData,
  ProjectItem,
  ExperienceItem,
  CertificationItem,
  EducationItem,
} from '@/lib/data';
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
  createdAt?: string;
  date?: string;
  timestamp: number;
  read: boolean;
  isRead?: boolean;
  notificationSent?: boolean;
}

export function AdminDashboard({ initialData }: AdminDashboardProps) {
  const [data, setData] = useState<PortfolioData>(initialData);
  const [activeTab, setActiveTab] = useState<
    'inbox' | 'profile' | 'projects' | 'experience' | 'education' | 'skills' | 'certifications' | 'backup'
  >('profile');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Messages state
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [msgFilter, setMsgFilter] = useState<'all' | 'unread'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [editingProject, setEditingProject] = useState<ProjectItem | null>(null);
  const [isNewProject, setIsNewProject] = useState(false);

  const [editingExp, setEditingExp] = useState<ExperienceItem | null>(null);
  const [isNewExp, setIsNewExp] = useState(false);

  const [editingEdu, setEditingEdu] = useState<EducationItem | null>(null);
  const [isNewEdu, setIsNewEdu] = useState(false);

  const [editingCert, setEditingCert] = useState<CertificationItem | null>(null);
  const [isNewCert, setIsNewCert] = useState(false);

  const [skillModalOpen, setSkillModalOpen] = useState(false);
  const [targetCategory, setTargetCategory] = useState<string>('');
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillLevel, setNewSkillLevel] = useState('Proficient');

  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const [importJsonText, setImportJsonText] = useState('');
  const [importModalOpen, setImportModalOpen] = useState(false);

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

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

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
          showToast('Message deleted');
        } else if (id) {
          const updatedSelected = updatedMsgs.find((m: ContactMessage) => m.id === id);
          if (updatedSelected) {
            setSelectedMessage(updatedSelected);
          }
        }
      } else {
        showToast(resData.error || 'Failed to update message', 'error');
      }
    } catch {
      showToast('Network error updating messages', 'error');
    }
  };

  // Sync modifications immediately to server / database
  const syncToServer = async (payload: PortfolioData, successMsg: string) => {
    try {
      const res = await fetch('/api/admin/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const resData = await res.json();
      if (res.ok && resData.success) {
        showToast(successMsg, 'success');
      } else {
        showToast(resData.error || 'Failed to sync with server', 'error');
      }
    } catch {
      showToast('Network error syncing with server', 'error');
    }
  };

  // Save all modifications via API (Manual Save & Publish button)
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
        showToast(resData.message || 'Portfolio changes saved successfully!', 'success');
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
    window.location.href = '/admin/login';
  };

  // One-click JSON export
  const handleExportJSON = () => {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `portfolio-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Downloaded portfolio.json backup!');
  };

  // Import JSON handler
  const handleImportJSON = () => {
    try {
      const parsed = JSON.parse(importJsonText);
      if (!parsed.profile || !parsed.projects || !parsed.skills || !parsed.experience) {
        showToast('Invalid JSON structure: Missing required portfolio sections', 'error');
        return;
      }
      setData(parsed);
      syncToServer(parsed, 'Successfully imported & saved portfolio data!');
      setImportModalOpen(false);
      setImportJsonText('');
    } catch {
      showToast('Invalid JSON syntax: Please check for formatting errors', 'error');
    }
  };

  // -------------------------------------------------------------
  // CRUD Handlers for Projects
  // -------------------------------------------------------------
  const handleSaveProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;
    if (!editingProject.title.trim()) {
      showToast('Project title is required', 'error');
      return;
    }

    let updatedProjects: ProjectItem[];
    if (isNewProject) {
      updatedProjects = [editingProject, ...data.projects];
    } else {
      updatedProjects = data.projects.map((p) => (p.id === editingProject.id ? editingProject : p));
    }
    const updatedData = { ...data, projects: updatedProjects };
    setData(updatedData);
    syncToServer(updatedData, isNewProject ? `Added & saved project: ${editingProject.title}` : `Updated & saved project: ${editingProject.title}`);
    setEditingProject(null);
  };

  const handleDeleteProject = (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      const updatedData = { ...data, projects: data.projects.filter((p) => p.id !== id) };
      setData(updatedData);
      syncToServer(updatedData, `Deleted project: "${title}"`);
    }
  };

  // -------------------------------------------------------------
  // CRUD Handlers for Experience
  // -------------------------------------------------------------
  const handleSaveExp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExp) return;
    if (!editingExp.role.trim() || !editingExp.company.trim()) {
      showToast('Role and Company are required', 'error');
      return;
    }

    let updatedExp: ExperienceItem[];
    if (isNewExp) {
      updatedExp = [editingExp, ...data.experience];
    } else {
      updatedExp = data.experience.map((exp) => (exp.id === editingExp.id ? editingExp : exp));
    }
    const updatedData = { ...data, experience: updatedExp };
    setData(updatedData);
    syncToServer(updatedData, isNewExp ? `Added & saved experience: ${editingExp.role}` : `Updated & saved experience: ${editingExp.role}`);
    setEditingExp(null);
  };

  const handleDeleteExp = (id: string, role: string) => {
    if (confirm(`Are you sure you want to delete experience "${role}"?`)) {
      const updatedData = { ...data, experience: data.experience.filter((e) => e.id !== id) };
      setData(updatedData);
      syncToServer(updatedData, `Deleted experience record: "${role}"`);
    }
  };

  // -------------------------------------------------------------
  // CRUD Handlers for Education
  // -------------------------------------------------------------
  const handleSaveEdu = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEdu) return;
    if (!editingEdu.degree.trim() || !editingEdu.institution.trim()) {
      showToast('Degree and Institution are required', 'error');
      return;
    }

    const currentEduList = data.profile.education || [];
    let updatedEdu: EducationItem[];
    if (isNewEdu) {
      updatedEdu = [editingEdu, ...currentEduList];
    } else {
      updatedEdu = currentEduList.map((ed) => (ed.id === editingEdu.id ? editingEdu : ed));
    }
    const updatedData = { ...data, profile: { ...data.profile, education: updatedEdu } };
    setData(updatedData);
    syncToServer(updatedData, isNewEdu ? `Added & saved education: ${editingEdu.degree}` : `Updated & saved education: ${editingEdu.degree}`);
    setEditingEdu(null);
  };

  const handleDeleteEdu = (id: string, degree: string) => {
    if (confirm(`Are you sure you want to delete education "${degree}"?`)) {
      const currentEduList = data.profile.education || [];
      const updatedEdu = currentEduList.filter((ed) => ed.id !== id);
      const updatedData = { ...data, profile: { ...data.profile, education: updatedEdu } };
      setData(updatedData);
      syncToServer(updatedData, `Deleted education: "${degree}"`);
    }
  };

  // -------------------------------------------------------------
  // CRUD Handlers for Certifications
  // -------------------------------------------------------------
  const handleSaveCert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCert) return;
    if (!editingCert.title.trim()) {
      showToast('Certification title is required', 'error');
      return;
    }

    let updatedCerts: CertificationItem[];
    if (isNewCert) {
      updatedCerts = [editingCert, ...data.certifications];
    } else {
      updatedCerts = data.certifications.map((c) => (c.id === editingCert.id ? editingCert : c));
    }
    const updatedData = { ...data, certifications: updatedCerts };
    setData(updatedData);
    syncToServer(updatedData, isNewCert ? `Added & saved certification: ${editingCert.title}` : `Updated & saved certification: ${editingCert.title}`);
    setEditingCert(null);
  };

  const handleDeleteCert = (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete certification "${title}"?`)) {
      const updatedCerts = data.certifications.filter((c) => c.id !== id);
      const updatedData = { ...data, certifications: updatedCerts };
      setData(updatedData);
      syncToServer(updatedData, `Deleted certification: "${title}"`);
    }
  };

  // -------------------------------------------------------------
  // CRUD Handlers for Skills
  // -------------------------------------------------------------
  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim() || !targetCategory) return;

    const updatedSkills = data.skills.map((cat) => {
      if (cat.category === targetCategory) {
        return {
          ...cat,
          items: [...cat.items, { name: newSkillName.trim(), level: newSkillLevel }],
        };
      }
      return cat;
    });

    const updatedData = { ...data, skills: updatedSkills };
    setData(updatedData);
    syncToServer(updatedData, `Added "${newSkillName.trim()}" to ${targetCategory}`);
    setNewSkillName('');
    setSkillModalOpen(false);
  };

  const handleDeleteSkill = (categoryName: string, skillName: string) => {
    const updatedSkills = data.skills.map((cat) => {
      if (cat.category === categoryName) {
        return {
          ...cat,
          items: cat.items.filter((s) => s.name !== skillName),
        };
      }
      return cat;
    });
    const updatedData = { ...data, skills: updatedSkills };
    setData(updatedData);
    syncToServer(updatedData, `Removed skill: "${skillName}"`);
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    if (data.skills.some((c) => c.category.toLowerCase() === newCategoryName.trim().toLowerCase())) {
      showToast('Category already exists', 'error');
      return;
    }

    const updatedSkills = [...data.skills, { category: newCategoryName.trim(), items: [] }];
    const updatedData = { ...data, skills: updatedSkills };
    setData(updatedData);
    syncToServer(updatedData, `Created category: ${newCategoryName.trim()}`);
    setNewCategoryName('');
    setCategoryModalOpen(false);
  };

  const handleDeleteCategory = (categoryName: string) => {
    if (confirm(`Are you sure you want to delete the category "${categoryName}" and all its skills?`)) {
      const updatedSkills = data.skills.filter((c) => c.category !== categoryName);
      const updatedData = { ...data, skills: updatedSkills };
      setData(updatedData);
      syncToServer(updatedData, `Deleted category: "${categoryName}"`);
    }
  };

  const filteredMessages = messages.filter((m) => {
    if (msgFilter === 'unread' && (m.read || m.isRead)) return false;
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
      <header className="sticky top-0 z-40 bg-zinc-900/90 backdrop-blur-md border-b border-zinc-800 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <Link
            href="/"
            className="p-2 rounded-xl bg-zinc-800 text-zinc-400 hover:text-white transition-colors border border-zinc-700/60"
            title="View Live Site"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="font-extrabold text-base sm:text-lg text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" /> Admin Content CMS
            </h1>
            <p className="text-[11px] text-zinc-400 font-mono">
              Managing Portfolio for <span className="text-amber-400 font-semibold">{data.profile.name}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportJSON}
            className="px-3.5 py-2 rounded-xl bg-zinc-800 text-zinc-300 hover:text-white font-mono text-xs font-semibold border border-zinc-700 flex items-center gap-1.5 transition-colors"
            title="Download JSON Backup"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Export JSON</span>
          </button>

          <button
            onClick={handleSaveAll}
            disabled={saving}
            className="px-4 sm:px-5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-zinc-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 hover:from-amber-300 hover:to-amber-400 transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Publishing...' : 'Save & Publish All'}
          </button>

          <button
            onClick={handleLogout}
            className="p-2 rounded-xl bg-zinc-800/80 text-zinc-400 hover:text-red-400 border border-zinc-700 hover:border-red-500/50 transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-6 border-b border-zinc-800 pb-3">
          {[
            { id: 'inbox', label: `Inbox (${messages.length})`, icon: Inbox, badge: unreadCount },
            { id: 'profile', label: 'Profile & Bio', icon: User },
            { id: 'projects', label: `Projects (${data.projects.length})`, icon: FolderGit2 },
            { id: 'experience', label: `Experience (${data.experience.length})`, icon: Briefcase },
            { id: 'education', label: `Education (${(data.profile.education || []).length})`, icon: GraduationCap },
            { id: 'skills', label: 'Skills Grid', icon: Code2 },
            { id: 'certifications', label: `Certifications (${data.certifications.length})`, icon: Award },
            { id: 'backup', label: 'Data & Backup', icon: HardDrive },
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
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
                  isActive
                    ? 'bg-amber-400 text-zinc-950 shadow-md'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.badge && tab.badge > 0 ? (
                  <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black bg-red-500 text-white animate-pulse">
                    {tab.badge}
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
                  Private visitor inquiries submitted via your website contact form.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  onClick={() => handleMessageAction('markAllRead')}
                  className="px-3 py-1.5 rounded-xl bg-zinc-800 text-zinc-300 hover:text-white text-xs font-mono font-semibold border border-zinc-700"
                >
                  Mark All Read
                </button>
                <button
                  onClick={fetchMessages}
                  className="px-3 py-1.5 rounded-xl bg-amber-400/10 text-amber-300 text-xs font-mono font-semibold border border-amber-400/20"
                >
                  Refresh
                </button>
              </div>
            </div>

            {/* Inbox Stats KPI */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-zinc-400 block uppercase">Unread</span>
                  <span className="text-lg font-bold text-red-400">🔴 {unreadCount} Pending</span>
                </div>
                <Inbox className="w-5 h-5 text-red-400" />
              </div>
              <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-zinc-400 block uppercase">Read</span>
                  <span className="text-lg font-bold text-zinc-300">{messages.length - unreadCount} Processed</span>
                </div>
                <Check className="w-5 h-5 text-zinc-500" />
              </div>
              <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-zinc-400 block uppercase">Total Messages</span>
                  <span className="text-lg font-bold text-white">{messages.length} Messages</span>
                </div>
                <Mail className="w-5 h-5 text-amber-400" />
              </div>
            </div>

            {/* Filter and Search */}
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

            {/* Split View */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-5 space-y-3 max-h-[600px] overflow-y-auto pr-1">
                {filteredMessages.length === 0 ? (
                  <div className="p-8 text-center bg-zinc-900/40 rounded-2xl border border-zinc-800 text-zinc-500 text-xs font-mono">
                    No contact messages found.
                  </div>
                ) : (
                  filteredMessages.map((msg) => {
                    const isSelected = selectedMessage?.id === msg.id;
                    const isRead = msg.isRead || msg.read;
                    return (
                      <div
                        key={msg.id}
                        onClick={() => {
                          setSelectedMessage(msg);
                          if (!isRead) handleMessageAction('toggleRead', msg.id);
                        }}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-1.5 relative ${
                          isSelected
                            ? 'bg-zinc-800 border-amber-400 shadow-md'
                            : isRead
                            ? 'bg-zinc-900/50 border-zinc-800/80 hover:border-zinc-700'
                            : 'bg-amber-950/20 border-amber-500/40 hover:border-amber-400'
                        }`}
                      >
                        {!isRead && <span className="w-2.5 h-2.5 rounded-full bg-amber-400 absolute top-4 right-4" />}
                        <div className="flex justify-between items-start pr-4">
                          <h4 className="font-bold text-sm text-white truncate">{msg.name}</h4>
                          <span className="text-[10px] font-mono text-zinc-400">{msg.date || msg.createdAt}</span>
                        </div>
                        <p className="text-xs text-amber-300 font-mono font-medium truncate">{msg.subject}</p>
                        <p className="text-xs text-zinc-400 line-clamp-2">{msg.message}</p>
                      </div>
                    );
                  })
                )}
              </div>

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
                          <Clock className="w-3 h-3" /> Received: {selectedMessage.date || selectedMessage.createdAt}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleMessageAction('toggleRead', selectedMessage.id)}
                          className="p-2 rounded-xl bg-zinc-800 text-zinc-400 hover:text-white"
                          title={selectedMessage.isRead || selectedMessage.read ? 'Mark Unread' : 'Mark Read'}
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
                        className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-200 hover:text-white font-mono text-xs font-semibold border border-zinc-700 flex items-center gap-2"
                      >
                        <Mail className="w-3.5 h-3.5 text-amber-400" /> Copy Email
                      </button>

                      <a
                        href={`mailto:${selectedMessage.email}?subject=${encodeURIComponent(`Re: ${selectedMessage.subject}`)}`}
                        className="px-4 py-2 rounded-xl bg-amber-400 text-zinc-950 font-bold text-xs font-mono flex items-center gap-2 shadow hover:bg-amber-300"
                      >
                        <Reply className="w-4 h-4" /> Reply to Sender
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="p-12 text-center bg-zinc-900/30 rounded-2xl border border-zinc-800 text-zinc-500 text-xs font-mono">
                    Select a contact message from the list on the left to read its full contents.
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
            <div className="p-6 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-5">
              <h2 className="text-lg font-bold text-amber-400 flex items-center gap-2">
                <User className="w-5 h-5" /> Personal Details & Contact Links
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-mono text-zinc-400 block mb-1">Full Name</label>
                  <input
                    type="text"
                    value={data.profile.name}
                    onChange={(e) => setData({ ...data, profile: { ...data.profile, name: e.target.value } })}
                    className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono text-zinc-400 block mb-1">Email Address</label>
                  <input
                    type="email"
                    value={data.profile.email}
                    onChange={(e) => setData({ ...data, profile: { ...data.profile, email: e.target.value } })}
                    className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono text-zinc-400 block mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={data.profile.phone}
                    onChange={(e) => setData({ ...data, profile: { ...data.profile, phone: e.target.value } })}
                    className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono text-zinc-400 block mb-1">LinkedIn Profile URL</label>
                  <input
                    type="text"
                    value={data.profile.linkedIn}
                    onChange={(e) => setData({ ...data, profile: { ...data.profile, linkedIn: e.target.value } })}
                    className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-mono text-zinc-400 block mb-1">GitHub Profile URL</label>
                  <input
                    type="text"
                    value={data.profile.github}
                    onChange={(e) => setData({ ...data, profile: { ...data.profile, github: e.target.value } })}
                    className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-mono text-zinc-400 block mb-1">Target Job Roles (comma separated)</label>
                <input
                  type="text"
                  value={(data.profile.targetRoles || []).join(', ')}
                  onChange={(e) =>
                    setData({
                      ...data,
                      profile: {
                        ...data.profile,
                        targetRoles: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                      },
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-zinc-400 block mb-1">Professional Bio Summary</label>
                <textarea
                  rows={4}
                  value={data.profile.summary}
                  onChange={(e) => setData({ ...data, profile: { ...data.profile, summary: e.target.value } })}
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white resize-none focus:border-amber-400 focus:outline-none leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="text-xs font-mono text-zinc-400 block mb-1">Soft Skills (comma separated)</label>
                  <input
                    type="text"
                    value={(data.profile.softSkills || []).join(', ')}
                    onChange={(e) =>
                      setData({
                        ...data,
                        profile: {
                          ...data.profile,
                          softSkills: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                        },
                      })
                    }
                    className="w-full px-4 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono text-zinc-400 block mb-1">Languages (comma separated)</label>
                  <input
                    type="text"
                    value={(data.profile.languages || []).join(', ')}
                    onChange={(e) =>
                      setData({
                        ...data,
                        profile: {
                          ...data.profile,
                          languages: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                        },
                      })
                    }
                    className="w-full px-4 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>
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
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <FolderGit2 className="w-5 h-5 text-amber-400" /> Engineering Projects ({data.projects.length})
                </h2>
                <p className="text-xs text-zinc-400 font-mono mt-0.5">
                  Manage projects featured on the public portfolio.
                </p>
              </div>

              <button
                onClick={() => {
                  setIsNewProject(true);
                  setEditingProject({
                    id: `proj-${Date.now()}`,
                    title: '',
                    category: 'AI / Vision',
                    techStack: ['Python', 'OpenCV'],
                    description: '',
                    longDescription: '',
                    githubUrl: 'https://github.com/jeevasenthilkumar0225-max',
                    liveUrl: '',
                    imageUrl: '',
                    featured: true,
                  });
                }}
                className="px-4 py-2 rounded-xl bg-amber-400 text-zinc-950 font-bold text-xs flex items-center gap-2 hover:bg-amber-300 transition-colors shadow"
              >
                <Plus className="w-4 h-4" /> Add New Project
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.projects.map((proj) => (
                <div
                  key={proj.id}
                  className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3 relative hover:border-zinc-700 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-mono bg-amber-400/10 text-amber-400 border border-amber-400/20 font-bold">
                        {proj.category}
                      </span>
                      {proj.featured && (
                        <span className="flex items-center gap-1 text-[10px] font-mono text-amber-300">
                          <Star className="w-3 h-3 fill-current" /> Featured
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setIsNewProject(false);
                          setEditingProject({ ...proj });
                        }}
                        className="p-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white"
                        title="Edit Project"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteProject(proj.id, proj.title)}
                        className="p-1.5 rounded-lg bg-zinc-800 text-red-400 hover:bg-red-500/20"
                        title="Delete Project"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {proj.imageUrl && (
                    <div className="h-32 rounded-xl overflow-hidden bg-zinc-950 border border-zinc-800">
                      <img
                        src={proj.imageUrl}
                        alt={proj.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}

                  <h3 className="font-bold text-base text-white">{proj.title}</h3>
                  <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">{proj.description}</p>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {proj.techStack?.map((t) => (
                      <span key={t} className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-950 border border-zinc-800 text-zinc-300">
                        {t}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-3 pt-2 text-[11px] font-mono text-zinc-400 border-t border-zinc-800/80">
                    {proj.githubUrl && (
                      <a href={proj.githubUrl} target="_blank" rel="noopener noreferrer" className="hover:text-amber-400 truncate flex items-center gap-1">
                        <FolderGit2 className="w-3 h-3" /> Code Repo
                      </a>
                    )}
                    {proj.liveUrl && (
                      <a href={proj.liveUrl} target="_blank" rel="noopener noreferrer" className="hover:text-amber-400 truncate flex items-center gap-1">
                        <ExternalLink className="w-3 h-3" /> Live Demo
                      </a>
                    )}
                  </div>
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
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-amber-400" /> Work & Internship Records ({data.experience.length})
                </h2>
                <p className="text-xs text-zinc-400 font-mono mt-0.5">
                  Manage professional experience and responsibilities.
                </p>
              </div>

              <button
                onClick={() => {
                  setIsNewExp(true);
                  setEditingExp({
                    id: `exp-${Date.now()}`,
                    company: '',
                    role: '',
                    duration: '2024 - Present',
                    project: '',
                    responsibilities: ['Developed and integrated engineering modules.'],
                  });
                }}
                className="px-4 py-2 rounded-xl bg-amber-400 text-zinc-950 font-bold text-xs flex items-center gap-2 hover:bg-amber-300 transition-colors shadow"
              >
                <Plus className="w-4 h-4" /> Add Experience Record
              </button>
            </div>

            <div className="space-y-4">
              {data.experience.map((exp) => (
                <div key={exp.id} className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-white text-base">{exp.role}</h3>
                      <p className="text-xs text-amber-400 font-mono">
                        {exp.company} • {exp.duration}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setIsNewExp(false);
                          setEditingExp({ ...exp });
                        }}
                        className="p-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white"
                        title="Edit Experience"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteExp(exp.id, exp.role)}
                        className="p-1.5 rounded-lg bg-zinc-800 text-red-400 hover:bg-red-500/20"
                        title="Delete Experience"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {exp.project && (
                    <p className="text-xs text-zinc-300 font-mono">
                      <span className="text-zinc-500">Project:</span> {exp.project}
                    </p>
                  )}

                  <ul className="space-y-1.5 text-xs text-zinc-400 list-disc list-inside">
                    {exp.responsibilities?.map((r, i) => (
                      <li key={i} className="leading-relaxed">
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* TAB 4: EDUCATION MANAGEMENT */}
        {/* ----------------------------------------------------------------- */}
        {activeTab === 'education' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-zinc-900/60 p-4 rounded-2xl border border-zinc-800">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-amber-400" /> Academic Qualifications ({(data.profile.education || []).length})
                </h2>
                <p className="text-xs text-zinc-400 font-mono mt-0.5">
                  Manage degrees, institutions, and scores displayed on your profile.
                </p>
              </div>

              <button
                onClick={() => {
                  setIsNewEdu(true);
                  setEditingEdu({
                    id: `edu-${Date.now()}`,
                    degree: '',
                    institution: '',
                    board: '',
                    duration: '2023 - 2027',
                    score: '',
                    details: '',
                  });
                }}
                className="px-4 py-2 rounded-xl bg-amber-400 text-zinc-950 font-bold text-xs flex items-center gap-2 hover:bg-amber-300 transition-colors shadow"
              >
                <Plus className="w-4 h-4" /> Add Education
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(data.profile.education || []).map((edu) => (
                <div key={edu.id} className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2.5">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-sm text-white">{edu.degree}</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setIsNewEdu(false);
                          setEditingEdu({ ...edu });
                        }}
                        className="p-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white"
                        title="Edit Education"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteEdu(edu.id, edu.degree)}
                        className="p-1.5 rounded-lg bg-zinc-800 text-red-400 hover:bg-red-500/20"
                        title="Delete Education"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-amber-400 font-mono">{edu.institution}</p>
                  <p className="text-xs text-zinc-400 font-mono">
                    {edu.duration} {edu.score ? `• ${edu.score}` : ''}
                  </p>
                  {edu.details && <p className="text-xs text-zinc-400 leading-relaxed">{edu.details}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* TAB 5: SKILLS GRID */}
        {/* ----------------------------------------------------------------- */}
        {activeTab === 'skills' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-zinc-900/60 p-4 rounded-2xl border border-zinc-800">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Code2 className="w-5 h-5 text-amber-400" /> Technical Capabilities Matrix ({data.skills.length} Categories)
                </h2>
                <p className="text-xs text-zinc-400 font-mono mt-0.5">
                  Add, update, or remove technical skills across categories.
                </p>
              </div>

              <button
                onClick={() => setCategoryModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-amber-400 text-zinc-950 font-bold text-xs flex items-center gap-2 hover:bg-amber-300 transition-colors shadow"
              >
                <Plus className="w-4 h-4" /> Add Category
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {data.skills.map((cat) => (
                <div key={cat.category} className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
                  <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
                    <h3 className="font-bold text-sm text-amber-400">{cat.category}</h3>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setTargetCategory(cat.category);
                          setNewSkillName('');
                          setNewSkillLevel('Proficient');
                          setSkillModalOpen(true);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-zinc-800 text-amber-400 hover:text-white text-xs font-mono font-bold flex items-center gap-1 border border-zinc-700"
                      >
                        <Plus className="w-3 h-3" /> Add Skill
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(cat.category)}
                        className="p-1 rounded-lg text-zinc-500 hover:text-red-400"
                        title="Delete Category"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {cat.items.length === 0 ? (
                      <p className="text-xs text-zinc-500 font-mono italic">No skills in this category yet.</p>
                    ) : (
                      cat.items.map((s) => (
                        <span
                          key={s.name}
                          className="px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-xs font-mono flex items-center gap-2"
                        >
                          <span className="text-white font-medium">{s.name}</span>
                          <span className="text-amber-400 text-[10px]">({s.level})</span>
                          <button
                            onClick={() => handleDeleteSkill(cat.category, s.name)}
                            className="text-zinc-500 hover:text-red-400 ml-1 font-bold text-sm leading-none"
                            title={`Remove ${s.name}`}
                          >
                            ×
                          </button>
                        </span>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* TAB 6: CERTIFICATIONS VAULT */}
        {/* ----------------------------------------------------------------- */}
        {activeTab === 'certifications' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-zinc-900/60 p-4 rounded-2xl border border-zinc-800">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-400" /> Verified Certifications ({data.certifications.length})
                </h2>
                <p className="text-xs text-zinc-400 font-mono mt-0.5">
                  Manage certified credentials, verification links, and issuers.
                </p>
              </div>

              <button
                onClick={() => {
                  setIsNewCert(true);
                  setEditingCert({
                    id: `cert-${Date.now()}`,
                    title: '',
                    issuer: '',
                    date: new Date().getFullYear().toString(),
                    description: '',
                    driveUrl: '',
                    imageUrl: '',
                  });
                }}
                className="px-4 py-2 rounded-xl bg-amber-400 text-zinc-950 font-bold text-xs flex items-center gap-2 hover:bg-amber-300 transition-colors shadow"
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
                          setEditingCert({ ...cert });
                        }}
                        className="p-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white"
                        title="Edit Certification"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteCert(cert.id, cert.title)}
                        className="p-1.5 rounded-lg bg-zinc-800 text-red-400 hover:bg-red-500/20"
                        title="Delete Certification"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-amber-400 font-mono">
                    {cert.issuer} • {cert.date}
                  </p>

                  {cert.description && <p className="text-xs text-zinc-400 leading-relaxed">{cert.description}</p>}

                  {cert.driveUrl && (
                    <a
                      href={cert.driveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-[11px] font-mono text-amber-300 hover:underline pt-1"
                    >
                      <FileText className="w-3.5 h-3.5" /> View Credential Link
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* TAB 7: DATA MANAGEMENT & BACKUP */}
        {/* ----------------------------------------------------------------- */}
        {activeTab === 'backup' && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-4">
              <h2 className="text-lg font-bold text-amber-400 flex items-center gap-2">
                <HardDrive className="w-5 h-5" /> Data Persistence & Vercel Deployment Safety
              </h2>
              <p className="text-xs text-zinc-300 leading-relaxed">
                On Vercel, the serverless filesystem is read-only. Your updates are safely cached in runtime memory and temporary storage. You can download your full portfolio data as a JSON file anytime to commit directly to your GitHub repository or restore it.
              </p>

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  onClick={handleExportJSON}
                  className="px-5 py-3 rounded-xl bg-amber-400 text-zinc-950 font-bold text-xs flex items-center gap-2 shadow hover:bg-amber-300"
                >
                  <Download className="w-4 h-4" /> Download portfolio.json Backup
                </button>

                <button
                  onClick={() => setImportModalOpen(true)}
                  className="px-5 py-3 rounded-xl bg-zinc-800 text-zinc-200 hover:text-white font-mono text-xs font-semibold border border-zinc-700 flex items-center gap-2"
                >
                  <Upload className="w-4 h-4 text-amber-400" /> Import / Restore JSON Data
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ================================================================= */}
      {/* MODAL 1: PROJECT MODAL */}
      {/* ================================================================= */}
      <AnimatePresence>
        {editingProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-2xl bg-zinc-900 border border-amber-500/40 rounded-3xl p-6 sm:p-8 space-y-5 text-white shadow-2xl my-8"
            >
              <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <FolderGit2 className="w-5 h-5 text-amber-400" />
                  {isNewProject ? 'Add New Project' : 'Edit Project Details'}
                </h3>
                <button onClick={() => setEditingProject(null)} className="p-1 rounded-lg text-zinc-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveProject} className="space-y-4 text-xs font-sans">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-mono text-zinc-400 block font-semibold">Project Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Smart Mobility Wheelchair"
                      value={editingProject.title}
                      onChange={(e) => setEditingProject({ ...editingProject, title: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:border-amber-400 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-mono text-zinc-400 block font-semibold">Category</label>
                    <input
                      type="text"
                      placeholder="AI / Vision, Full Stack, IoT..."
                      value={editingProject.category}
                      onChange={(e) => setEditingProject({ ...editingProject, category: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-mono text-zinc-400 block font-semibold">
                    Tech Stack (comma separated)
                  </label>
                  <input
                    type="text"
                    placeholder="Python, OpenCV, YOLOv8, React.js..."
                    value={editingProject.techStack?.join(', ') || ''}
                    onChange={(e) =>
                      setEditingProject({
                        ...editingProject,
                        techStack: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                      })
                    }
                    className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-mono text-zinc-400 block font-semibold">Short Summary</label>
                  <textarea
                    rows={2}
                    placeholder="Brief 1-2 sentence overview shown on project card"
                    value={editingProject.description}
                    onChange={(e) => setEditingProject({ ...editingProject, description: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:border-amber-400 focus:outline-none resize-none leading-relaxed"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-mono text-zinc-400 block font-semibold">Detailed Description</label>
                  <textarea
                    rows={3}
                    placeholder="In-depth explanation displayed when visitor clicks View Details"
                    value={editingProject.longDescription || ''}
                    onChange={(e) => setEditingProject({ ...editingProject, longDescription: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:border-amber-400 focus:outline-none resize-none leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-mono text-zinc-400 block font-semibold">GitHub Repository URL</label>
                    <input
                      type="url"
                      placeholder="https://github.com/..."
                      value={editingProject.githubUrl}
                      onChange={(e) => setEditingProject({ ...editingProject, githubUrl: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:border-amber-400 focus:outline-none font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-mono text-zinc-400 block font-semibold">Live Demo URL (Optional)</label>
                    <input
                      type="url"
                      placeholder="https://..."
                      value={editingProject.liveUrl || ''}
                      onChange={(e) => setEditingProject({ ...editingProject, liveUrl: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:border-amber-400 focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-mono text-zinc-400 block font-semibold">
                    Project Image / Banner URL (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="https://example.com/image.png or /images/proj.png"
                    value={editingProject.imageUrl || ''}
                    onChange={(e) => setEditingProject({ ...editingProject, imageUrl: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:border-amber-400 focus:outline-none font-mono"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="projFeatured"
                    checked={editingProject.featured || false}
                    onChange={(e) => setEditingProject({ ...editingProject, featured: e.target.checked })}
                    className="w-4 h-4 accent-amber-400 rounded"
                  />
                  <label htmlFor="projFeatured" className="text-xs text-zinc-300 font-mono font-medium cursor-pointer">
                    Highlight as Featured Project
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setEditingProject(null)}
                    className="px-4 py-2.5 rounded-xl bg-zinc-800 text-zinc-300 hover:text-white font-mono font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-amber-400 text-zinc-950 font-bold hover:bg-amber-300 font-mono shadow"
                  >
                    {isNewProject ? 'Add Project' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================================================================= */}
      {/* MODAL 2: EXPERIENCE MODAL */}
      {/* ================================================================= */}
      <AnimatePresence>
        {editingExp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-xl bg-zinc-900 border border-amber-500/40 rounded-3xl p-6 sm:p-8 space-y-5 text-white shadow-2xl my-8"
            >
              <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-amber-400" />
                  {isNewExp ? 'Add Experience Record' : 'Edit Experience Record'}
                </h3>
                <button onClick={() => setEditingExp(null)} className="p-1 rounded-lg text-zinc-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveExp} className="space-y-4 text-xs font-sans">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-mono text-zinc-400 block font-semibold">Job / Internship Role *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. AI & ML Engineer Intern"
                      value={editingExp.role}
                      onChange={(e) => setEditingExp({ ...editingExp, role: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:border-amber-400 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-mono text-zinc-400 block font-semibold">Company / Organization *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. TechCorp Solutions"
                      value={editingExp.company}
                      onChange={(e) => setEditingExp({ ...editingExp, company: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-mono text-zinc-400 block font-semibold">Duration Period</label>
                    <input
                      type="text"
                      placeholder="e.g. Jan 2024 – Apr 2024"
                      value={editingExp.duration}
                      onChange={(e) => setEditingExp({ ...editingExp, duration: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:border-amber-400 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-mono text-zinc-400 block font-semibold">Key Project / Focus Area</label>
                    <input
                      type="text"
                      placeholder="e.g. Vision-Based Assistive AI"
                      value={editingExp.project}
                      onChange={(e) => setEditingExp({ ...editingExp, project: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-mono text-zinc-400 block font-semibold">
                    Responsibilities (one per line)
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Enter each responsibility or achievement on a new line"
                    value={editingExp.responsibilities?.join('\n') || ''}
                    onChange={(e) =>
                      setEditingExp({
                        ...editingExp,
                        responsibilities: e.target.value.split('\n').filter(Boolean),
                      })
                    }
                    className="w-full px-4 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:border-amber-400 focus:outline-none resize-none leading-relaxed"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setEditingExp(null)}
                    className="px-4 py-2.5 rounded-xl bg-zinc-800 text-zinc-300 hover:text-white font-mono font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-amber-400 text-zinc-950 font-bold hover:bg-amber-300 font-mono shadow"
                  >
                    {isNewExp ? 'Add Record' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================================================================= */}
      {/* MODAL 3: EDUCATION MODAL */}
      {/* ================================================================= */}
      <AnimatePresence>
        {editingEdu && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-xl bg-zinc-900 border border-amber-500/40 rounded-3xl p-6 sm:p-8 space-y-5 text-white shadow-2xl my-8"
            >
              <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-amber-400" />
                  {isNewEdu ? 'Add Academic Qualification' : 'Edit Academic Qualification'}
                </h3>
                <button onClick={() => setEditingEdu(null)} className="p-1 rounded-lg text-zinc-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveEdu} className="space-y-4 text-xs font-sans">
                <div className="space-y-1">
                  <label className="font-mono text-zinc-400 block font-semibold">Degree / Certificate Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. B.Tech (Honours) Information Technology"
                    value={editingEdu.degree}
                    onChange={(e) => setEditingEdu({ ...editingEdu, degree: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-mono text-zinc-400 block font-semibold">Institution / University *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Anna University"
                    value={editingEdu.institution}
                    onChange={(e) => setEditingEdu({ ...editingEdu, institution: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-mono text-zinc-400 block font-semibold">Duration Period</label>
                    <input
                      type="text"
                      placeholder="e.g. 2023 – 2027"
                      value={editingEdu.duration}
                      onChange={(e) => setEditingEdu({ ...editingEdu, duration: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:border-amber-400 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-mono text-zinc-400 block font-semibold">Score / CGPA / Grade</label>
                    <input
                      type="text"
                      placeholder="e.g. CGPA: 8.03 or 88.6%"
                      value={editingEdu.score}
                      onChange={(e) => setEditingEdu({ ...editingEdu, score: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-mono text-zinc-400 block font-semibold">Specialization / Focus Details</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Specializing in AI, Computer Vision, and Deep Learning"
                    value={editingEdu.details || ''}
                    onChange={(e) => setEditingEdu({ ...editingEdu, details: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:border-amber-400 focus:outline-none resize-none leading-relaxed"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setEditingEdu(null)}
                    className="px-4 py-2.5 rounded-xl bg-zinc-800 text-zinc-300 hover:text-white font-mono font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-amber-400 text-zinc-950 font-bold hover:bg-amber-300 font-mono shadow"
                  >
                    {isNewEdu ? 'Add Qualification' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================================================================= */}
      {/* MODAL 4: CERTIFICATION MODAL */}
      {/* ================================================================= */}
      <AnimatePresence>
        {editingCert && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-xl bg-zinc-900 border border-amber-500/40 rounded-3xl p-6 sm:p-8 space-y-5 text-white shadow-2xl my-8"
            >
              <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-400" />
                  {isNewCert ? 'Add Verified Certification' : 'Edit Certification Details'}
                </h3>
                <button onClick={() => setEditingCert(null)} className="p-1 rounded-lg text-zinc-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveCert} className="space-y-4 text-xs font-sans">
                <div className="space-y-1">
                  <label className="font-mono text-zinc-400 block font-semibold">Certification Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Deep Learning Specialization"
                    value={editingCert.title}
                    onChange={(e) => setEditingCert({ ...editingCert, title: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-mono text-zinc-400 block font-semibold">Issuing Organization</label>
                    <input
                      type="text"
                      placeholder="e.g. Coursera / Stanford Online"
                      value={editingCert.issuer}
                      onChange={(e) => setEditingCert({ ...editingCert, issuer: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:border-amber-400 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-mono text-zinc-400 block font-semibold">Date / Year</label>
                    <input
                      type="text"
                      placeholder="e.g. 2024"
                      value={editingCert.date}
                      onChange={(e) => setEditingCert({ ...editingCert, date: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-mono text-zinc-400 block font-semibold">Description / Key Topics</label>
                  <textarea
                    rows={2}
                    placeholder="Key concepts or practical modules mastered"
                    value={editingCert.description}
                    onChange={(e) => setEditingCert({ ...editingCert, description: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:border-amber-400 focus:outline-none resize-none leading-relaxed"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-mono text-zinc-400 block font-semibold">Verification / Drive Link URL</label>
                  <input
                    type="url"
                    placeholder="https://drive.google.com/... or credential URL"
                    value={editingCert.driveUrl || ''}
                    onChange={(e) => setEditingCert({ ...editingCert, driveUrl: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:border-amber-400 focus:outline-none font-mono"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setEditingCert(null)}
                    className="px-4 py-2.5 rounded-xl bg-zinc-800 text-zinc-300 hover:text-white font-mono font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-amber-400 text-zinc-950 font-bold hover:bg-amber-300 font-mono shadow"
                  >
                    {isNewCert ? 'Add Certificate' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================================================================= */}
      {/* MODAL 5: ADD SKILL MODAL */}
      {/* ================================================================= */}
      <AnimatePresence>
        {skillModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-zinc-900 border border-amber-500/40 rounded-3xl p-6 space-y-4 text-white shadow-2xl"
            >
              <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-amber-400" />
                  Add Skill to {targetCategory}
                </h3>
                <button onClick={() => setSkillModalOpen(false)} className="text-zinc-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAddSkill} className="space-y-3 text-xs font-sans">
                <div className="space-y-1">
                  <label className="font-mono text-zinc-400 block font-semibold">Skill Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Next.js, PyTorch, Docker"
                    value={newSkillName}
                    onChange={(e) => setNewSkillName(e.target.value)}
                    autoFocus
                    className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-mono text-zinc-400 block font-semibold">Proficiency Level</label>
                  <select
                    value={newSkillLevel}
                    onChange={(e) => setNewSkillLevel(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:border-amber-400 focus:outline-none"
                  >
                    <option value="Proficient">Proficient</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Familiar">Familiar</option>
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setSkillModalOpen(false)}
                    className="px-3.5 py-2 rounded-xl bg-zinc-800 text-zinc-300 font-mono"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-amber-400 text-zinc-950 font-bold hover:bg-amber-300 font-mono shadow"
                  >
                    Add Skill
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================================================================= */}
      {/* MODAL 6: ADD CATEGORY MODAL */}
      {/* ================================================================= */}
      <AnimatePresence>
        {categoryModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-zinc-900 border border-amber-500/40 rounded-3xl p-6 space-y-4 text-white shadow-2xl"
            >
              <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Plus className="w-4 h-4 text-amber-400" />
                  Create New Skill Category
                </h3>
                <button onClick={() => setCategoryModalOpen(false)} className="text-zinc-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAddCategory} className="space-y-3 text-xs font-sans">
                <div className="space-y-1">
                  <label className="font-mono text-zinc-400 block font-semibold">Category Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Cloud & DevOps, Mobile Development"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    autoFocus
                    className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setCategoryModalOpen(false)}
                    className="px-3.5 py-2 rounded-xl bg-zinc-800 text-zinc-300 font-mono"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-amber-400 text-zinc-950 font-bold hover:bg-amber-300 font-mono shadow"
                  >
                    Create Category
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================================================================= */}
      {/* MODAL 7: IMPORT JSON MODAL */}
      {/* ================================================================= */}
      <AnimatePresence>
        {importModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl bg-zinc-900 border border-amber-500/40 rounded-3xl p-6 space-y-4 text-white shadow-2xl"
            >
              <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Upload className="w-4 h-4 text-amber-400" />
                  Import / Restore Portfolio Data (JSON)
                </h3>
                <button onClick={() => setImportModalOpen(false)} className="text-zinc-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2 text-xs font-sans">
                <p className="text-zinc-400">
                  Paste valid <code className="text-amber-400 font-mono">portfolio.json</code> contents below to restore or overwrite your portfolio data.
                </p>
                <textarea
                  rows={10}
                  placeholder="Paste JSON here..."
                  value={importJsonText}
                  onChange={(e) => setImportJsonText(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white font-mono text-[11px] focus:border-amber-400 focus:outline-none resize-none leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setImportModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 font-mono text-xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleImportJSON}
                  className="px-5 py-2 rounded-xl bg-amber-400 text-zinc-950 font-bold hover:bg-amber-300 font-mono text-xs shadow"
                >
                  Validate & Import
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-amber-400" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400" />
            )}
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
