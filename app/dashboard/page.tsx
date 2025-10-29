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
import { appThemes, layoutThemes } from '../utils/themes';

export default function Dashboard() {
  const { user } = useAuthStore();
  const { currentTheme } = useTheme();
  const theme = appThemes[currentTheme];
  const {
    loading,
    error,
    fetchStocks,
    fetchPortfolio,
    setSelectedStock
  } = useStockStore();

  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    fetchStocks();
    if (user?.id) {
      fetchPortfolio(parseInt(user.id));
    }
  }, [fetchStocks, fetchPortfolio, user]);

  const handleStockSelect = (stock: Stock) => {
    setSelectedStock(stock);
    setShowAddForm(true);
  };

  if (loading) {
    return (
      <div className={`min-h-screen bg-gradient-to-br ${theme.bgGradient} flex items-center justify-center`}>
        <div className="text-center">
          <div className={`inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 ${theme.textAccent} mb-4`}></div>
          <div className={`text-xl ${theme.textPrimary} font-medium`}>Loading your portfolio...</div>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className={`flex h-screen bg-gradient-to-br ${theme.bgGradient}`}>
        {/* Left Sidebar */}
        <DashboardSidebar onStockSelect={handleStockSelect} />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Navigation Bar */}
          <div className={`bg-gradient-to-r ${theme.navGradient} backdrop-blur-md border-b ${theme.navBorder} shadow-sm`}>
            <div className="px-8 py-3 flex items-center justify-between">
              <div>
                <h1 className={`text-xl font-bold bg-gradient-to-r ${theme.textGradient} bg-clip-text text-transparent`}>
                  Portfolio Dashboard
                </h1>
                <p className={`text-xs ${theme.textSecondary} mt-0.5`}>
                  Welcome back, <span className={`font-semibold ${theme.textPrimary}`}>{user?.name}</span>
                </p>
              </div>
              
              <div className="flex items-center space-x-3">
                <button className={`px-3 py-1.5 rounded-lg bg-gradient-to-r ${theme.buttonGradient} text-white text-sm font-medium hover:${theme.buttonHoverGradient} transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5`}>
                  Export Data
                </button>
              </div>
            </div>
          </div>

          {/* Dashboard Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              {/* Error Display */}
              {error && (
                <div className="bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-500 rounded-lg p-3 mb-4 shadow-md">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-red-800 text-sm font-medium">{error}</p>
                  </div>
                </div>
              )}

              {/* Two Column Layout */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
                {/* Holdings Section - Takes 2/3 width on large screens */}
                <div className="xl:col-span-2">
                  <HoldingsTable onAddClick={() => setShowAddForm(true)} />
                </div>

                {/* Telegram Integration - Takes 1/3 width on large screens */}
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