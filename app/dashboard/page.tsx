'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useStockStore } from '../store/stockStore';
import { useTheme } from '../contexts/ThemeContext';
import { Stock } from '../types';
import DashboardSidebar from '../components/DashboardSidebar';
import HoldingsTable from '../components/HoldingsTable';
import AddPortfolioForm from '../components/AddPortfolioForm';
import ProtectedRoute from '../components/ProtectedRoute';
import TelegramIntegration from '../components/TelegramIntegration';
import { appThemes } from '../utils/themes';
import toast from 'react-hot-toast';
import { exportHoldingsToExcel } from '../utils/exportToExcel';

export default function Dashboard() {
  const { user } = useAuthStore();
  const { currentTheme } = useTheme();
  const theme = appThemes[currentTheme];
  const {
    loading,
    error,
    fetchStocks,
    fetchPortfolio,
    setSelectedStock,
    portfolio,
  } = useStockStore();

  const [showAddForm, setShowAddForm] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false); // Mobile sidebar toggle

  useEffect(() => {
    fetchStocks();
    if (user?.id) {
      fetchPortfolio(parseInt(user.id));
    }
  }, [fetchStocks, fetchPortfolio, user]);

  const handleStockSelect = (stock: Stock) => {
    setSelectedStock(stock);
    setShowAddForm(true);
    setShowSidebar(false); // Close sidebar on mobile after selection
  };

  const handleExport = async () => {
    if (portfolio.length === 0) {
      toast.error('No holdings to export');
      return;
    }

    setExportLoading(true);
    try {
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `portfolio_holdings_${timestamp}.xlsx`;
      
      exportHoldingsToExcel(portfolio, filename);
      toast.success('Portfolio exported successfully!');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export portfolio');
    } finally {
      setExportLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen bg-gradient-to-br ${theme.bgGradient} flex items-center justify-center p-4`}>
        <div className="text-center">
          <div className={`inline-block animate-spin rounded-full h-12 w-12 md:h-16 md:w-16 border-t-4 border-b-4 ${theme.textAccent} mb-4`}></div>
          <div className={`text-lg md:text-xl ${theme.textPrimary} font-medium`}>Loading your portfolio...</div>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className={`flex h-screen bg-gradient-to-br ${theme.bgGradient} overflow-hidden`}>
        {/* Mobile Overlay */}
        {showSidebar && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setShowSidebar(false)}
          />
        )}

        {/* Left Sidebar - Responsive */}
        <div className={`
          fixed lg:relative inset-y-0 left-0 z-50
          transform ${showSidebar ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 transition-transform duration-300 ease-in-out
        `}>
          <DashboardSidebar onStockSelect={handleStockSelect} />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden w-full">
          {/* Top Navigation Bar */}
          <div className={`bg-gradient-to-r ${theme.navGradient} backdrop-blur-md border-b ${theme.navBorder} shadow-sm`}>
            <div className="px-4 md:px-8 py-3 flex items-center justify-between">
              <div className="flex items-center space-x-2 md:space-x-3">
                {/* Mobile Menu Button - Sidebar Icon */}
                <button
                  onClick={() => setShowSidebar(!showSidebar)}
                  className={`lg:hidden p-2 rounded-lg hover:bg-white/10 transition-all duration-200 ${showSidebar ? 'bg-white/10' : ''}`}
                  aria-label="Toggle sidebar"
                >
                  <svg 
                    className={`w-6 h-6 ${theme.textPrimary} transition-transform duration-200 ${showSidebar ? 'scale-110' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" 
                    />
                  </svg>
                </button>

                <div>
                  <h1 className={`text-base md:text-xl font-bold bg-gradient-to-r ${theme.textGradient} bg-clip-text text-transparent`}>
                    Portfolio Dashboard
                  </h1>
                  <p className={`text-xs ${theme.textSecondary} mt-0.5 hidden md:block`}>
                    Welcome back, <span className={`font-semibold ${theme.textPrimary}`}>{user?.name}</span>
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 md:space-x-3">
                <button 
                  onClick={handleExport}
                  disabled={exportLoading || portfolio.length === 0}
                  className={`flex items-center space-x-1.5 md:space-x-2 px-2 md:px-4 py-1.5 md:py-2 rounded-lg bg-gradient-to-r ${
                    exportLoading || portfolio.length === 0 
                      ? 'from-gray-400 to-gray-500 cursor-not-allowed' 
                      : theme.buttonGradient
                  } text-white text-xs md:text-sm font-medium hover:${
                    exportLoading || portfolio.length === 0 
                      ? 'from-gray-400 to-gray-500' 
                      : theme.buttonHoverGradient
                  } transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none disabled:hover:shadow-lg`}
                >
                  {exportLoading ? (
                    <>
                      <div className="w-3 h-3 md:w-4 md:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span className="hidden md:inline">Exporting...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="hidden md:inline">Export Data</span>
                      <span className="md:hidden">Export</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Dashboard Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-3 md:p-6">
              {/* Error Display */}
              {error && (
                <div className="bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-500 rounded-lg p-3 mb-4 shadow-md">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 md:w-5 md:h-5 text-red-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-red-800 text-xs md:text-sm font-medium">{error}</p>
                  </div>
                </div>
              )}

              {/* Two Column Layout - Stacks on mobile */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-6 mb-4 md:mb-6">
                {/* Holdings Section */}
                <div className="xl:col-span-2">
                  <HoldingsTable onAddClick={() => setShowAddForm(true)} />
                </div>

                {/* Telegram Integration */}
                <div className="xl:col-span-1">
                  <TelegramIntegration />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Portfolio Modal */}
      {showAddForm && (
        <AddPortfolioForm onClose={() => setShowAddForm(false)} />
      )}
    </ProtectedRoute>
  );
}