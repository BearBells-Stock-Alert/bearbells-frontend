'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useTheme } from '../contexts/ThemeContext';
import { appThemes, getLogoGradient } from '../utils/themes';
import type { ThemeKey } from '../utils/themes';

export default function AboutPage() {
  const { currentTheme } = useTheme();
  const theme = appThemes[currentTheme as ThemeKey];

  const fadeInUp = {
    initial: { y: 60, opacity: 0 },
    animate: { 
      y: 0, 
      opacity: 1, 
      transition: { 
        duration: 0.6, 
        ease: [0.25, 0.46, 0.45, 0.94] as const
      } 
    }
  };

  const stagger = {
    animate: { 
      transition: { staggerChildren: 0.1 } 
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${theme.bgGradient}`}>
      {/* Main Content */}
      <motion.div 
        initial="initial"
        animate="animate"
        variants={stagger}
        className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16"
      >
        {/* Header Section */}
        <motion.div variants={fadeInUp} className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className={`w-28 h-28 bg-gradient-to-r ${getLogoGradient(currentTheme as ThemeKey)} rounded-2xl flex items-center justify-center shadow-2xl overflow-hidden`}>
              <Image
                src="/bearbells-transparent-logo.png"
                alt="BearBells Logo"
                width={80}
                height={80}
                className="drop-shadow-lg filter brightness-110"
              />
            </div>
          </div>
          <h1 className={`text-5xl md:text-6xl font-bold bg-gradient-to-r ${theme.textGradient} bg-clip-text text-transparent mb-6`}>
            BearBells
          </h1>
          <p className={`text-xl ${theme.textSecondary} max-w-3xl mx-auto leading-relaxed`}>
            Intelligent stock alert system that keeps you informed with real-time notifications, 
            helping you make smarter investment decisions without the constant monitoring.
          </p>
        </motion.div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
          {/* Mission Section */}
          <motion.div variants={fadeInUp}>
            <div className={`rounded-2xl p-8 border-2 ${theme.sectionBorder}`}>
              <h2 className="text-3xl font-bold text-white mb-6">Our Mission</h2>
              <div className="space-y-4">
                <p className={`${theme.textPrimary} leading-relaxed`}>
                  At BearBells, we believe that investing should be accessible and stress-free. 
                  Our platform eliminates the need for constant market monitoring by providing 
                  intelligent, real-time alerts tailored to your investment strategy.
                </p>
                <p className={`${theme.textPrimary} leading-relaxed`}>
                  We combine cutting-edge technology with user-centric design to deliver a 
                  seamless experience that empowers both novice and experienced investors.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Features Section */}
          <motion.div variants={fadeInUp}>
            <div className={`rounded-2xl p-8 border-2 ${theme.sectionBorder}`}>
              <h2 className="text-3xl font-bold text-white mb-6">Key Features</h2>
              <div className="grid grid-cols-1 gap-4">
                {[
                  'Real-time stock price monitoring',
                  'Customizable alert thresholds',
                  'Multi-platform notifications (Telegram & Email)',
                  'Secure Google OAuth integration',
                  'Portfolio performance tracking',
                  '5-minute interval price updates'
                ].map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className={`w-2 h-2 ${theme.bulletColor} rounded-full flex-shrink-0`}></div>
                    <span className={theme.textPrimary}>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Founder Section */}
        <motion.div variants={fadeInUp} className={`${theme.cardBg} rounded-2xl p-8 backdrop-blur-sm border ${theme.cardBorder} max-w-2xl mx-auto`}>
          <div className="text-center">
            <div className={`w-28 h-28 bg-gradient-to-r ${getLogoGradient(currentTheme as ThemeKey)} rounded-full mx-auto mb-6 flex items-center justify-center shadow-2xl overflow-hidden`}>
              <Image
                src="/bearbells-transparent-logo.png"
                alt="BearBells Logo"
                width={86}
                height={86}
                className="drop-shadow-lg filter brightness-110"
              />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Prithvi Manoj</h3>
            <p className={`${theme.textAccent} font-medium mb-4`}>Founder & CEO</p>
            <p className={`${theme.textPrimary} leading-relaxed mb-6`}>
              Prithvi leads BearBells with a vision to democratize intelligent investing tools. 
              With expertise in full-stack development and financial technology, he's committed 
              to building products that make complex financial monitoring simple and accessible.
            </p>
            <div className="flex justify-center space-x-4">
              <a 
                href="mailto:bearbellsstockalert@gmail.com"
                className={`inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r ${theme.buttonGradient} text-white font-medium rounded-lg hover:from-emerald-700 hover:to-teal-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>Contact Us</span>
              </a>
            </div>
          </div>
        </motion.div>

        {/* Contact Info */}
        <motion.div variants={fadeInUp} className="text-center mt-12">
          <p className={`${theme.textSecondary} mb-2`}>Have questions or need support?</p>
          <a 
            href="mailto:bearbellsstockalert@gmail.com"
            className={`${theme.textAccent} hover:${theme.textSecondary} font-medium transition-colors duration-200`}
          >
            bearbellsstockalert@gmail.com
          </a>
        </motion.div>
      </motion.div>

      {/* Footer */}
      <footer className={`border-t ${theme.footerBorder} py-8`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className={theme.textSecondary}>
            © {new Date().getFullYear()} BearBells Stock Alert System. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}