'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronDown, FiMenu, FiX } from 'react-icons/fi';
import { FaPalette } from 'react-icons/fa';
import { useTheme, ThemeKey } from '../../contexts/ThemeContext';
import { appThemes } from '../../utils/themes';

export default function Navbar() {
  const [isThemeDropdownOpen, setIsThemeDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { currentTheme, setCurrentTheme } = useTheme();
  const theme = appThemes[currentTheme];

  // Define your nav items and their routes
  const navLinks = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Watchlist', href: '/watchlist' },
    { name: 'Analytics', href: '/analytics' },
    { name: 'About Us', href: '/about' },
  ];

  const handleNavLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 bg-gradient-to-r ${theme.navGradient} backdrop-blur-md border-b ${theme.navBorder} shadow-lg`}>
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center space-x-2 md:space-x-3 group">
            <div className={`w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r ${theme.logoGradient} rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 overflow-hidden`}>
              <Image
                src="/bearbells-transparent-logo.png"
                alt="Bearbells Logo"
                width={32}
                height={32}
                className="drop-shadow-lg filter brightness-110"
              />
            </div>
            <span className={`text-base md:text-lg font-bold tracking-wide ${currentTheme === 'light' ? 'text-gray-900' : 'text-white'}`}>
              Bear Bells
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex space-x-6 xl:space-x-8">
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
          <div className="flex items-center space-x-2 md:space-x-4">
            {/* Live Indicator - Hidden on mobile */}
            <div className="hidden md:flex items-center space-x-2">
              <div className={`w-2 h-2 md:w-2.5 md:h-2.5 rounded-full ${theme.liveIndicator} animate-pulse`} />
              <span className={`text-xs font-semibold ${theme.liveText}`}>Live</span>
            </div>

            {/* Theme Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsThemeDropdownOpen(!isThemeDropdownOpen)}
                className={`flex items-center space-x-1.5 md:space-x-2 px-2 md:px-3 py-1.5 md:py-2 rounded-lg ${theme.buttonBg} ${theme.buttonHover} border ${theme.buttonBorder} transition-all duration-200`}
              >
                <FaPalette className={`${theme.themeIcon} text-sm md:text-base`} />
                <span className={`text-xs md:text-sm font-medium ${theme.navTextColor} hidden sm:inline`}>
                  {theme.name}
                </span>
                <FiChevronDown className={`${theme.navTextColor} transition-transform duration-200 text-sm md:text-base ${isThemeDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Theme Dropdown Menu */}
              {isThemeDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 top-12 w-44 md:w-48 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md rounded-lg shadow-xl border border-gray-200 dark:border-slate-700 py-2 z-50 max-h-[70vh] overflow-y-auto"
                >
                  {Object.entries(appThemes).map(([key, themeOption]) => (
                    <button
                      key={key}
                      onClick={() => {
                        setCurrentTheme(key as ThemeKey);
                        setIsThemeDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 md:px-4 py-2 text-xs md:text-sm transition-all duration-200 flex items-center space-x-2 md:space-x-3 ${
                        currentTheme === key
                          ? 'bg-blue-50 dark:bg-slate-700 text-blue-600 dark:text-blue-400'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-600'
                      }`}
                    >
                      <div className={`w-3 h-3 md:w-4 md:h-4 rounded-full bg-gradient-to-r ${themeOption.logoGradient} flex-shrink-0`} />
                      <span className="truncate flex-1">{themeOption.name}</span>
                      {currentTheme === key && (
                        <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-blue-500 rounded-full flex-shrink-0" />
                      )}
                    </button>
                  ))}
                </motion.div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`lg:hidden p-2 rounded-lg ${theme.buttonBg} ${theme.buttonHover} border ${theme.buttonBorder} transition-all duration-200`}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <FiX className={`${theme.navTextColor} text-xl`} />
              ) : (
                <FiMenu className={`${theme.navTextColor} text-xl`} />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className={`lg:hidden border-t ${theme.navBorder} bg-gradient-to-b ${theme.navGradient} backdrop-blur-md overflow-hidden`}
            >
              <div className="px-4 py-3 space-y-1">
                {navLinks.map((item) => (
                  <Link key={item.name} href={item.href} passHref>
                    <motion.div
                      whileTap={{ scale: 0.98 }}
                      onClick={handleNavLinkClick}
                      className={`block px-4 py-3 rounded-lg text-sm font-medium ${theme.navTextColor} hover:bg-white/10 dark:hover:bg-slate-700/50 transition-all duration-200 cursor-pointer`}
                    >
                      {item.name}
                    </motion.div>
                  </Link>
                ))}

                {/* Mobile Live Indicator */}
                <div className="flex items-center justify-center space-x-2 pt-2 pb-1">
                  <div className={`w-2 h-2 rounded-full ${theme.liveIndicator} animate-pulse`} />
                  <span className={`text-xs font-semibold ${theme.liveText}`}>Live</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Overlay to close dropdowns when clicking outside */}
      {(isThemeDropdownOpen || isMobileMenuOpen) && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => {
            setIsThemeDropdownOpen(false);
            setIsMobileMenuOpen(false);
          }}
        />
      )}
    </>
  );
}