// theme/ThemeContext.jsx — Refined
import React, { createContext, useContext, useState } from 'react';

const LIGHT_THEME = {
  mode: 'light',
  bg: '#FAFAFA',
  surface: '#FFFFFF',
  surfaceAlt: '#F2F2F2',
  text: '#111111',
  textMute: '#666666',
  textBody: '#333333',
  border: '#E0E0E0',
  borderLight: '#EEEEEE',
  accent: '#8B0000',
  success: '#2E7D32',
  // === LANDSCAPE TOKENS ===
  overlayBadge: 'rgba(250,250,250,0.82)',
  hoverTint: 'rgba(166,124,0,0.08)',
  roofTint: '#6E0F1A',
  groundTint: '#C4B08A',
};

const DARK_THEME = {
  mode: 'dark',
  bg: '#0A0A0A',
  surface: '#141414',
  surfaceAlt: '#1F1F1F',
  text: '#FAFAFA',
  textMute: '#888888',
  textBody: '#CCCCCC',
  border: '#2A2A2A',
  borderLight: '#1F1F1F',
  accent: '#E53935',
  success: '#4CAF50',
  // === LANDSCAPE TOKENS ===
  overlayBadge: 'rgba(10,10,10,0.78)',
  hoverTint: 'rgba(255,255,255,0.06)',   // monokrom: putih tipis, bukan gold
  roofTint: '#5A0F1A',
  groundTint: '#050505',
};

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(LIGHT_THEME);
  const toggleTheme = () =>
    setTheme((prev) => (prev.mode === 'light' ? DARK_THEME : LIGHT_THEME));
  return (
    <ThemeContext.Provider value={{ theme, mode: theme.mode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) return { theme: LIGHT_THEME, mode: 'light', toggleTheme: () => {} };
  return ctx;
}