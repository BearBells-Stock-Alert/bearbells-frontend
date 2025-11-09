'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

// Include ALL theme keys
export type ThemeKey = 'emerald' | 'blue' | 'purple' | 'cyan' | 'rose' | 'dark' | 'light';

interface ThemeContextType {
  currentTheme: ThemeKey;
  setCurrentTheme: (theme: ThemeKey) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [currentTheme, setCurrentTheme] = useState<ThemeKey>('light');

  return (
    <ThemeContext.Provider value={{ currentTheme, setCurrentTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};