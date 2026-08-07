'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, X, Sparkles, User, RefreshCw } from 'lucide-react';
import { PortfolioData } from '@/lib/data';

interface AdminAIChatbotProps {
  portfolioData: PortfolioData;
}

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
}

export function AdminAIChatbot({ portfolioData }: AdminAIChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'ai',
      text: `Hello ${portfolioData.profile.name}! I am your AI Assistant for content management. Ask me to generate project descriptions, write bio updates, format skills, or suggest achievements!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSendMessage = (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    // Simulate intelligent response tailored to portfolio
    setTimeout(() => {
      let aiResponseText = '';
      const q = query.toLowerCase();

      if (q.includes('bio') || q.includes('summary')) {
        aiResponseText = `Here is a suggested bio update:\n\n"Driven Final-Year B.Tech IT Honours student (CGPA: 8.03) specializing in Artificial Intelligence, Computer Vision, and Full Stack Web Systems. Passionate about engineering real-time assistive devices and scalable cloud applications."`;
      } else if (q.includes('project') || q.includes('ai vision')) {
        aiResponseText = `Suggested Project Highlights:\n• Integrated YOLOv8 object detection on Raspberry Pi with ESP32-CAM.\n• Built automated Text-to-Speech voice warnings for visually impaired accessibility.`;
      } else if (q.includes('skill') || q.includes('tech')) {
        aiResponseText = `Skill Group Suggestion:\n• Programming: Python, Java, C\n• AI/ML: OpenCV, YOLOv8, TensorFlow, Scikit-learn, OCR\n• Web Systems: React.js, Node.js, Express.js, MongoDB`;
      } else if (q.includes('hackathon') || q.includes('inceptia')) {
        aiResponseText = `Hackathon Highlights for INCEPTIA (Pune):\n"Participated in national-level innovation hackathon presenting Smart Mobility AI Assistive systems, collaborating with engineering peers."`;
      } else {
        aiResponseText = `I have analyzed your query about "${query}". You can update this section directly using the tabs above in your Admin Dashboard and click "Save & Publish All"!`;
      }

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: aiResponseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
      setLoading(false);
    }, 800);
  };

  return (
    <div className="fixed bottom-6 left-6 z-50">
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-zinc-950 font-black font-mono text-xs shadow-2xl shadow-amber-500/30 border border-amber-300"
          >
            <div className="w-6 h-6 rounded-full bg-zinc-950 text-amber-400 flex items-center justify-center">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <span>Admin AI Assistant</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="w-[360px] sm:w-[420px] h-[520px] rounded-3xl bg-zinc-900 border border-amber-500/40 shadow-2xl flex flex-col overflow-hidden text-white relative backdrop-blur-xl"
          >
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 flex items-center justify-between font-bold">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-zinc-950 text-amber-400 flex items-center justify-center shadow">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm leading-tight text-zinc-950">Admin AI Assistant</h3>
                  <p className="text-[10px] font-mono text-zinc-900 flex items-center gap-1 font-bold">
                    <Sparkles className="w-2.5 h-2.5" /> CMS Co-Pilot
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-zinc-950 hover:bg-black/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Suggestion Chips */}
            <div className="px-3 py-2 bg-zinc-950/80 border-b border-zinc-800 flex items-center gap-1.5 overflow-x-auto text-[10px] font-mono">
              <button
                onClick={() => handleSendMessage('Suggest Bio Update')}
                className="px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 whitespace-nowrap hover:bg-amber-500/20"
              >
                + Bio Idea
              </button>
              <button
                onClick={() => handleSendMessage('Suggest AI Vision project highlights')}
                className="px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 whitespace-nowrap hover:bg-amber-500/20"
              >
                + Project Highlights
              </button>
              <button
                onClick={() => handleSendMessage('Suggest INCEPTIA hackathon details')}
                className="px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 whitespace-nowrap hover:bg-amber-500/20"
              >
                + Hackathon Tip
              </button>
            </div>

            {/* Messages Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-zinc-950/40">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                      msg.sender === 'user' ? 'bg-amber-400 text-zinc-950' : 'bg-zinc-800 text-amber-400'
                    }`}
                  >
                    {msg.sender === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                  </div>

                  <div
                    className={`max-w-[80%] p-3 rounded-2xl text-xs leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-amber-500 text-zinc-950 font-bold rounded-tr-none'
                        : 'bg-zinc-800 text-zinc-200 border border-zinc-700/80 rounded-tl-none whitespace-pre-wrap'
                    }`}
                  >
                    {msg.text}
                    <span className="block text-[9px] font-mono opacity-60 text-right mt-1">
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex items-center gap-2 text-xs text-amber-400 font-mono">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Thinking...
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-3 bg-zinc-900 border-t border-zinc-800 flex items-center gap-2">
              <input
                type="text"
                placeholder="Ask AI to generate bio, skills, or projects..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1 px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-xs text-white focus:border-amber-400 focus:outline-none"
              />
              <button
                onClick={() => handleSendMessage()}
                className="p-2 rounded-xl bg-amber-400 text-zinc-950 font-bold hover:bg-amber-300 transition-colors"
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

