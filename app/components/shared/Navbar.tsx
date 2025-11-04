'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiChevronDown } from 'react-icons/fi';
import { FaPalette } from 'react-icons/fa';
import { useTheme, ThemeKey } from '../../contexts/ThemeContext';
import { appThemes } from '../../utils/themes';

export default function Navbar() {
  const [isThemeDropdownOpen, setIsThemeDropdownOpen] = useState(false);
  const { currentTheme, setCurrentTheme } = useTheme();
  const theme = appThemes[currentTheme];

  // Define your nav items and their routes
  const navLinks = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Portfolio', href: '/portfolio' },
    { name: 'Watchlist', href: '/watchlist' },
    { name: 'Analytics', href: '/analytics' },
    // { name: 'Settings', href: '/settings' },
    { name: 'About Us', href: '/about' },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 bg-gradient-to-r ${theme.navGradient} backdrop-blur-md border-b ${theme.navBorder} shadow-lg`}>
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center space-x-3 group">
          <div className={`w-10 h-10 bg-gradient-to-r ${theme.logoGradient} rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-lg transition-all duration-300 overflow-hidden`}>
            <Image
              src="/bearbells-transparent-logo.png"
              alt="Bearbells Logo"
              width={32}
              height={32}
              className="drop-shadow-lg filter brightness-110"
            />
          </div>
          <span className={`text-lg font-bold tracking-wide ${currentTheme === 'light' ? 'text-gray-900' : 'text-white'}`}>
            Bear Bells
          </span>
        </Link>

        {/* Nav Links */}
        <div className="hidden md:flex space-x-8">
          {navLinks.map((item) => (
            <Link key={item.name} href={item.href} passHref>
              <motion.span
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className={`relative cursor-pointer text-sm font-medium tracking-wide transition-all duration-200 ${theme.navTextColor} ${theme.navHoverColor}`}
              >
                {item.name}
                <span className={`absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r ${theme.underlineGradient} transition-all duration-300 hover:w-full`} />
              </motion.span>
            </Link>
          ))}
        </div>

        {/* Right Controls */}
        <div className="flex items-center space-x-4">
          {/* Live Indicator */}
          <div className="hidden sm:flex items-center space-x-2">
            <div className={`w-2.5 h-2.5 rounded-full ${theme.liveIndicator} animate-pulse`} />
            <span className={`text-xs font-semibold ${theme.liveText}`}>Live</span>
          </div>

          {/* Theme Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsThemeDropdownOpen(!isThemeDropdownOpen)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${theme.buttonBg} ${theme.buttonHover} border ${theme.buttonBorder} transition-all duration-200`}
            >
              <FaPalette className={theme.themeIcon} />
              <span className={`text-sm font-medium ${theme.navTextColor}`}>
                {theme.name}
              </span>
              <FiChevronDown className={`${theme.navTextColor} transition-transform duration-200 ${isThemeDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Theme Dropdown Menu */}
            {isThemeDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute right-0 top-12 w-48 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md rounded-lg shadow-xl border border-gray-200 dark:border-slate-700 py-2 z-50"
              >
                {Object.entries(appThemes).map(([key, themeOption]) => (
                  <button
                    key={key}
                    onClick={() => {
                      setCurrentTheme(key as ThemeKey);
                      setIsThemeDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm transition-all duration-200 flex items-center space-x-3 ${
                      currentTheme === key
                        ? 'bg-blue-50 dark:bg-slate-700 text-blue-600 dark:text-blue-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-600'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${themeOption.logoGradient}`} />
                    <span>{themeOption.name}</span>
                    {currentTheme === key && (
                      <div className="ml-auto w-2 h-2 bg-blue-500 rounded-full" />
                    )}
                  </button>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Overlay to close dropdown when clicking outside */}
      {isThemeDropdownOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsThemeDropdownOpen(false)}
        />
      )}
    </nav>
  );
}