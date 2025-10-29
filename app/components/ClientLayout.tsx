'use client';

import { usePathname } from 'next/navigation';
import Navbar from './shared/Navbar';
import { useTheme } from '../contexts/ThemeContext';

// Theme configurations for the layout background
const layoutThemes = {
    emerald: 'bg-gradient-to-br from-slate-50 via-white to-slate-100 text-slate-900',
    blue: 'bg-gradient-to-br from-blue-50 via-white to-indigo-50 text-slate-900',
    purple: 'bg-gradient-to-br from-purple-50 via-white to-pink-50 text-slate-900',
    // amber: 'bg-gradient-to-br from-amber-50 via-white to-orange-50 text-slate-900',
    cyan: 'bg-gradient-to-br from-cyan-50 via-white to-teal-50 text-slate-900', // 👈 Add
    rose: 'bg-gradient-to-br from-rose-50 via-white to-fuchsia-50 text-slate-900', // 👈 Add
    dark: 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white',
    light: 'bg-gradient-to-br from-gray-50 via-white to-gray-100 text-slate-900'
  };
  
  const loginThemes = {
    emerald: 'bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 text-slate-900',
    blue: 'bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-100 text-slate-900',
    purple: 'bg-gradient-to-br from-purple-50 via-purple-100 to-pink-100 text-slate-900',
    amber: 'bg-gradient-to-br from-amber-50 via-amber-100 to-orange-100 text-slate-900',
    cyan: 'bg-gradient-to-br from-cyan-50 via-cyan-100 to-teal-100 text-slate-900', // 👈 Add
    rose: 'bg-gradient-to-br from-rose-50 via-rose-100 to-fuchsia-100 text-slate-900', // 👈 Add
    dark: 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white',
    light: 'bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 text-slate-900'
  };

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const hideNavbar = pathname === '/login';
  const { currentTheme } = useTheme();

  // Get the appropriate background based on route and theme
  const getBackgroundClass = () => {
    if (hideNavbar) {
      return loginThemes[currentTheme];
    }
    return layoutThemes[currentTheme];
  };

  return (
    <>
      {!hideNavbar && <Navbar />}
      <main className={`min-h-screen w-full transition-colors duration-300 ${getBackgroundClass()} ${!hideNavbar ? 'pt-16' : ''}`}>
        {children}
      </main>
    </>
  );
}