'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useStockStore } from '../store/stockStore';
import { useAuthStore } from '../store/authStore';
import { useTheme } from '../contexts/ThemeContext';
import StockSearchBox from './StockSearchBox';
import { Stock, WatchlistItem } from '../types';
import { appThemes } from '../utils/themes';
import { FaStar, FaTrash } from 'react-icons/fa';
import toast from 'react-hot-toast';

interface DashboardSidebarProps {
  onStockSelect: (stock: Stock) => void;
}

export default function DashboardSidebar({ onStockSelect }: DashboardSidebarProps) {
  const { user } = useAuthStore();
  const { currentTheme } = useTheme();
  const theme = appThemes[currentTheme];
  const {
    watchlist,
    watchlistLoading,
    stocks,
    fetchWatchlist,
    removeFromWatchlist,
  } = useStockStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && user?.id) {
      fetchWatchlist(user.id);
    }
  }, [mounted, user, fetchWatchlist]);

  const handleStockSearch = (stock: Stock) => {
    onStockSelect(stock);
  };

  const handleRemoveFromWatchlist = async (stockId: string, stockSymbol: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await removeFromWatchlist(stockId);
      toast.success(`Removed ${stockSymbol} from watchlist`);
    } catch (error) {
      toast.error('Failed to remove from watchlist');
    }
  };

  const handleWatchlistItemClick = (item: WatchlistItem) => {
    const stock = item.stock || stocks.find(s => s.id === item.stock_id);
    if (stock) {
      onStockSelect(stock);
    }
  };

  const formatPrice = (price: number | undefined | null): string => {
    if (price === undefined || price === null) {
      return '₹0.00';
    }
    return `₹${price.toFixed(2)}`;
  };

  if (!mounted) {
    return (
      <div className={`w-80 bg-gradient-to-b ${theme.navGradient} flex flex-col h-screen shadow-2xl`}>
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
      </div>
    );
  }

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
        <StockSearchBox 
          onSelect={handleStockSearch} 
          textColor={currentTheme === "light" ? "text-black" : theme.textPrimary}
        />
      </div>

      {/* Watchlist Section */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FaStar className={`w-4 h-4 ${theme.textAccent}`} />
            <span className={`text-xs ${theme.navTextColor} font-semibold tracking-wider uppercase`}>
              My Watchlist
            </span>
          </div>
          <span className={`text-xs ${theme.textAccent} font-medium`}>
            {watchlist.length}
          </span>
        </div>
        
        {watchlistLoading ? (
          <div className="px-4 py-12 text-center">
            <div className={`inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 ${theme.textAccent} mb-4`}></div>
            <p className={`text-sm ${theme.textSecondary}`}>Loading watchlist...</p>
          </div>
        ) : watchlist.length === 0 ? (
          <div className="px-4 py-12 text-center">
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${theme.cardBg} mb-4`}>
              <FaStar className={`w-8 h-8 ${theme.textSecondary}`} />
            </div>
            <p className={`text-sm ${theme.textSecondary} mb-2`}>No stocks in watchlist</p>
            <p className={`text-xs ${theme.textSecondary} opacity-75`}>Search and add stocks to track</p>
          </div>
        ) : (
          <div className="space-y-1 px-2 pb-4">
            {watchlist.map((item: WatchlistItem) => {
              const stock = item.stock || stocks.find(s => s.id === item.stock_id);
              if (!stock) return null;

              return (
                <button
                  key={item.id}
                  onClick={() => handleWatchlistItemClick(item)}
                  className="w-full group relative overflow-hidden rounded-lg transition-all duration-200 hover:scale-[1.02]"
                >
                  <div className={`absolute inset-0 bg-gradient-to-r ${theme.textAccent}/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200`} />
                  <div className={`relative px-4 py-3 ${theme.cardBg} backdrop-blur-sm border ${theme.cardBorder} group-hover:border-${theme.textAccent}/30 transition-all duration-200`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className={`text-sm font-bold ${theme.textPrimary} truncate`}>
                            {stock.symbol}
                          </span>
                          {stock.sector && (
                            <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-${theme.textAccent}/10 ${theme.textAccent} border border-${theme.textAccent}/20`}>
                              {stock.sector}
                            </span>
                          )}
                        </div>
                        <p className={`text-xs ${theme.textSecondary} truncate mb-2`}>
                          {stock.name}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className={`text-xs ${theme.textSecondary}`}>Price</span>
                          <span className={`text-sm font-bold ${theme.textPrimary}`}>
                            {formatPrice(stock.last_price)}
                          </span>
                        </div>
                      </div>
                      
                      <button
                        onClick={(e) => handleRemoveFromWatchlist(stock.id.toString(), stock.symbol, e)}
                        className="ml-2 p-1.5 rounded-md opacity-0 group-hover:opacity-100 hover:bg-red-500/20 transition-all duration-200"
                        aria-label="Remove from watchlist"
                        title="Remove from watchlist"
                      >
                        <FaTrash className="w-3 h-3 text-red-400" />
                      </button>
                    </div>
                  </div>
                </button>
              );
            })}
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