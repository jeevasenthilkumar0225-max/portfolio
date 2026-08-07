'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { AnimatePresence, motion } from 'framer-motion';
import { PortfolioData } from '@/lib/data';
import { Preloader } from '@/components/preloader';
import { Home } from '@/components/home';
import { About } from '@/components/about';
import { Skills } from '@/components/skills';
import { Experience } from '@/components/experience';
import { Projects } from '@/components/projects';
import { Certifications } from '@/components/certifications';
import { Contact } from '@/components/contact';
import { Dock } from '@/components/dock';
import { AmbientControls } from '@/components/ambient-controls';

// Dynamically import heavy interactive overlays for code-splitting
const GoldenCursorSpark = dynamic(() => import('@/components/golden-cursor-spark').then((mod) => mod.GoldenCursorSpark), { ssr: false });
const AICursor = dynamic(() => import('@/components/ai-cursor').then((mod) => mod.AICursor), { ssr: false });
const PortihelpAI = dynamic(() => import('@/components/portihelp-ai').then((mod) => mod.PortihelpAI), { ssr: false });
const AnimatedBackground = dynamic(() => import('@/components/animated-background').then((mod) => mod.AnimatedBackground), { ssr: false });

interface PortfolioContentProps {
  data: PortfolioData;
}

export function PortfolioContent({ data }: PortfolioContentProps) {
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState('home');

  const navigate = (screen: string) => setActive(screen);

  const renderScreen = () => {
    switch (active) {
      case 'about':
        return <About profile={data.profile} />;
      case 'skills':
        return <Skills skills={data.skills} />;
      case 'experience':
        return <Experience experiences={data.experience} />;
      case 'projects':
        return <Projects projects={data.projects} />;
      case 'certificates':
        return <Certifications certifications={data.certifications} />;
      case 'contact':
        return <Contact profile={data.profile} />;
      default:
        return <Home profile={data.profile} onNavigate={navigate} />;
    }
  };

  return (
    <>
      <AnimatePresence mode="wait">
        {loading && (
          <Preloader key="preloader" onComplete={() => setLoading(false)} />
        )}
      </AnimatePresence>

      <GoldenCursorSpark />
      <AICursor />

      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: loading ? 0 : 1 }}
        transition={{ duration: 0.8 }}
        className="min-h-screen relative overflow-hidden bg-background text-foreground"
      >
        {!loading && <AnimatedBackground active={active} />}

        {/* Fullscreen + ambient music controls */}
        <AmbientControls startMusic={!loading} />

        {/* Screen content with cinematic transitions */}
        <div className="relative z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, scale: 0.98, filter: 'blur(8px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 1.02, filter: 'blur(8px)' }}
              transition={{ duration: 0.5, ease: [0.43, 0.13, 0.23, 0.96] }}
            >
              {renderScreen()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom navigation dock */}
        <Dock active={active} onNavigate={navigate} />

        {/* Floating portihelp AI chatbot */}
        <PortihelpAI portfolioData={data} onNavigate={navigate} />
      </motion.main>
    </>
  );
}
