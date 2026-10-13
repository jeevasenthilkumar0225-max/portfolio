'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark'); // default dark mode for futuristic initial impact
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const applyTheme = (newTheme: Theme) => {
      const root = document.documentElement;
      if (newTheme === 'dark') {
        root.classList.add('dark');
        root.style.colorScheme = 'dark';
      } else {
        root.classList.remove('dark');
        root.style.colorScheme = 'light';
      }
    };

    const savedTheme = localStorage.getItem('portfolio_theme') as Theme | null;
    const active = savedTheme || 'dark';
    applyTheme(active);
    if (savedTheme && savedTheme !== 'dark') {
      React.startTransition(() => {
        setThemeState(savedTheme);
      });
    }
    setMounted(true);
  }, []);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('portfolio_theme', newTheme);
    const root = document.documentElement;
    if (newTheme === 'dark') {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }
    // Animated theme transition flash
    const flash = document.createElement('div');
    flash.className = 'theme-flash';
    flash.style.background =
      newTheme === 'dark'
        ? 'radial-gradient(circle at center, rgba(5,5,5,0.9) 0%, rgba(244,180,0,0.25) 100%)'
        : 'radial-gradient(circle at center, rgba(255,255,255,0.9) 0%, rgba(244,180,0,0.3) 100%)';
    document.body.appendChild(flash);
    setTimeout(() => flash.remove(), 700);
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      <div style={{ visibility: mounted ? 'visible' : 'hidden' }}>{children}</div>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
