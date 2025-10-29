'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useStockStore } from '../store/stockStore';
import { useTheme } from '../contexts/ThemeContext';
import StockSearchBox from './StockSearchBox';
import { Stock } from '../types';
import { appThemes, getLogoGradient } from '../utils/themes';

interface DashboardSidebarProps {
  onStockSelect: (stock: Stock) => void;
}

export default function DashboardSidebar({ onStockSelect }: DashboardSidebarProps) {
  const { currentTheme } = useTheme();
  const theme = appThemes[currentTheme];
  const [searchedStocks, setSearchedStocks] = useState<Stock[]>([]);

  const handleStockSearch = (stock: Stock) => {
    setSearchedStocks(prev => {
      const exists = prev.find(s => s.id === stock.id);
      if (exists) return prev;
      return [stock, ...prev].slice(0, 20);
    });
    onStockSelect(stock);
  };

  const removeStock = (stockId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setSearchedStocks(prev => prev.filter(s => s.id !== stockId));
  };

  return (
    <div className={`w-80 bg-gradient-to-b ${theme.navGradient} flex flex-col h-screen shadow-2xl`}>
      {/* Logo Section */}
      <div className={`p-6 border-b ${theme.navBorder} backdrop-blur-sm`}>
        <Image
          src="/bearbells-transparent-logo.png"
          alt="Bearbells Logo"
          width={120}
          height={120}
          priority
          className="drop-shadow-2xl filter brightness-110"
        />
      </div>
      
      {/* Search Box */}
      <div className="p-4">
        <StockSearchBox onSelect={handleStockSearch} />
      </div>

      {/* Searched Stocks */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="px-4 py-3 flex items-center justify-between">
          <span className={`text-xs ${theme.navTextColor} font-semibold tracking-wider uppercase`}>
            Recent Searches
          </span>
          <span className={`text-xs ${theme.textAccent} font-medium`}>
            {searchedStocks.length} / 20
          </span>
        </div>
        
        {searchedStocks.length === 0 ? (
          <div className="px-4 py-12 text-center">
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${theme.cardBg} mb-4`}>
              <svg className={`w-8 h-8 ${theme.textSecondary}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <p className={`text-sm ${theme.textSecondary}`}>Search for stocks to get started</p>
          </div>
        ) : (
          <div className="space-y-1 px-2">
            {searchedStocks.map((stock) => (
              <button
                key={stock.id}
                onClick={() => onStockSelect(stock)}
                className="w-full group relative overflow-hidden rounded-lg transition-all duration-200 hover:scale-[1.02]"
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${theme.textAccent}/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200`} />
                <div className={`relative px-4 py-3 ${theme.cardBg} backdrop-blur-sm border ${theme.cardBorder} group-hover:${theme.textAccent}/30 transition-all duration-200`}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className={`text-sm font-bold ${theme.textPrimary} truncate`}>
                          {stock.symbol}
                        </span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${theme.textAccent}/20 ${theme.textAccent} border ${theme.textAccent}/30`}>
                          {stock.sector}
                        </span>
                      </div>
                      <p className={`text-xs ${theme.textSecondary} truncate mt-1`}>
                        {stock.name}
                      </p>
                    </div>
                    
                    <button
                      onClick={(e) => removeStock(stock.id, e)}
                      className="ml-2 p-1.5 rounded-md opacity-0 group-hover:opacity-100 hover:bg-red-500/20 transition-all duration-200"
                      aria-label="Remove stock"
                    >
                      <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className={`p-4 border-t ${theme.navBorder} ${theme.buttonBg} backdrop-blur-sm`}>
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>Powered by Bearbells</span>
          <div className="flex items-center space-x-1">
            <div className={`w-2 h-2 rounded-full ${theme.liveIndicator} animate-pulse`} />
            <span className={theme.liveText}>Live</span>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.3);
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(71, 85, 105, 0.5);
          border-radius: 3px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(71, 85, 105, 0.7);
        }
      `}</style>
    </div>
  );
}