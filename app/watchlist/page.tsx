// app/watchlist/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useStockStore } from '../store/stockStore';
import { useTheme } from '../contexts/ThemeContext';
import { Stock, WatchlistItem } from '../types';
import ProtectedRoute from '../components/ProtectedRoute';
import { appThemes } from '../utils/themes';
import { FaTrash, FaSearch, FaPlus, FaTimes, FaChartLine, FaEye } from 'react-icons/fa';
import toast from 'react-hot-toast';
import ConfirmationModal from '../components/shared/ConfirmationModal';

interface StockReport {
  json: {
    symbol: string;
    current_price: number;
    rating: string;
    rationale: string;
    quality_score: number;
    valuation_score: number;
    pe_ratio: number;
    pb_ratio: number;
    dividend_yield: number;
    roe: number;
    roce: number;
    quality_breakdown: Record<string, any>;
    valuation_breakdown: Record<string, any>;
    entry_zones: {
      aggressive_entry: number;
      conservative_entry: number;
      stop_loss: number;
    };
  };
  text_summary: string;
  ai_summary: string;
}

export default function WatchlistPage() {
  const { user } = useAuthStore();
  const { currentTheme } = useTheme();
  const theme = appThemes[currentTheme];
  const {
    watchlist,
    watchlistLoading,
    stocks,
    fetchStocks,
    fetchWatchlist,
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist,
    searchStocks
  } = useStockStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  const [searchResults, setSearchResults] = useState<Stock[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'analysis' | 'detailed' | 'ai'>('overview');
  const [report, setReport] = useState<StockReport | null>(null);
  const [loadingReport, setLoadingReport] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);
  
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    stockId: number | null;
    stockSymbol: string;
  }>({
    isOpen: false,
    stockId: null,
    stockSymbol: '',
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      fetchStocks();
      if (user?.id) {
        fetchWatchlist(user.id);
      }
    }
  }, [fetchStocks, fetchWatchlist, user, isMounted]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.trim().length > 0) {
        setIsSearching(true);
        try {
          const results = await searchStocks(searchQuery, 20);
          setSearchResults(results);
        } catch (error) {
          console.error('Search error:', error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, searchStocks]);

  useEffect(() => {
    if (selectedStock) {
      fetchStockReport(selectedStock.symbol);
    }
  }, [selectedStock]);

  const fetchStockReport = async (symbol: string) => {
    setLoadingReport(true);
    setReportError(null);
    setReport(null);
    
    try {
      const response = await fetch(`/api/stocks/${symbol}/report`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch report');
      }
      
      const data = await response.json();
      setReport(data);
    } catch (err) {
      setReportError(err instanceof Error ? err.message : 'Failed to fetch report');
    } finally {
      setLoadingReport(false);
    }
  };

  const handleAddToWatchlist = async (stock: Stock) => {
    try {
      await addToWatchlist(stock.id.toString());
      toast.success(`${stock.symbol} added to watchlist`);
      setSearchQuery('');
      setSearchResults([]);
      setShowAddModal(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to add to watchlist');
    }
  };

  const handleRemoveFromWatchlist = async (stockId: string, stockSymbol: string) => {
    try {
      await removeFromWatchlist(stockId);
      toast.success(`${stockSymbol} removed from watchlist`);
    } catch (error) {
      toast.error('Failed to remove from watchlist');
    }
  };

  const handleDeleteClick = (stockId: number, stockSymbol: string) => {
    setDeleteModal({
      isOpen: true,
      stockId,
      stockSymbol,
    });
  };

  const handleConfirmDelete = async () => {
    if (deleteModal.stockId) {
      await handleRemoveFromWatchlist(deleteModal.stockId.toString(), deleteModal.stockSymbol);
      setDeleteModal({ isOpen: false, stockId: null, stockSymbol: '' });
    }
  };

  const handleStockSelect = (stock: Stock) => {
    setSelectedStock(stock);
    setActiveTab('overview');
  };

  const clearSelection = () => {
    setSelectedStock(null);
    setReport(null);
  };

  const formatPrice = (price: number | undefined | null): string => {
    if (price === undefined || price === null) return '₹0.00';
    return `₹${price.toFixed(2)}`;
  };

  const formatMarketCap = (cap: number | undefined | null): string => {
    if (!cap) return 'N/A';
    if (cap >= 10000000) return `₹${(cap / 10000000).toFixed(2)}Cr`;
    if (cap >= 100000) return `₹${(cap / 100000).toFixed(2)}L`;
    return `₹${cap.toFixed(2)}`;
  };

  const getStockDisplayName = (stock: Stock) => {
    return stock.name || stock.symbol;
  };

  const renderScoreBadge = (score: number) => {
    const getColor = (score: number) => {
      if (score >= 70) return 'bg-emerald-100 text-emerald-700 border-emerald-300';
      if (score >= 50) return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      if (score >= 30) return 'bg-orange-100 text-orange-700 border-orange-300';
      return 'bg-red-100 text-red-700 border-red-300';
    };

    return (
      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border ${getColor(score)}`}>
        {score}/100
      </div>
    );
  };

  const getRatingColor = (rating: string) => {
    if (rating.includes('BUY')) return 'bg-emerald-100 text-emerald-700 border-emerald-300';
    if (rating.includes('HOLD')) return 'bg-yellow-100 text-yellow-700 border-yellow-300';
    return 'bg-red-100 text-red-700 border-red-300';
  };

  if (!isMounted || watchlistLoading) {
    return (
      <ProtectedRoute>
        <div className={`min-h-screen bg-gradient-to-br ${theme.bgGradient} flex items-center justify-center`}>
          <div className="text-center">
            <div className={`inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 ${theme.textAccent}`}></div>
            <div className={`text-sm ${theme.textSecondary} mt-3`}>
              {!isMounted ? 'Initializing...' : 'Loading watchlist...'}
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className={`min-h-screen bg-gradient-to-br ${theme.bgGradient} p-6`}>
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className={`text-4xl font-bold bg-gradient-to-r ${theme.textGradient} bg-clip-text text-transparent mb-2`}>
              Watchlist
            </h1>
            <p className={`text-sm ${theme.textSecondary}`}>
              Track and analyze your favorite stocks
            </p>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Watchlist Cards Column */}
            <div className="xl:col-span-1">
  {/* Stats and Add Button */}
  <div className={`${theme.cardBg} backdrop-blur-lg rounded-xl border ${theme.cardBorder} shadow-lg p-4 mb-4`}>
  <div className="flex items-center justify-between mb-3">
    <div className="flex items-center space-x-4">
      <div>
        <h2 className={`text-lg font-semibold ${theme.textPrimary}`}>Your Watchlist</h2>
        <p className={`text-xs ${theme.textSecondary} mt-0.5`}>
          {watchlist.length} stocks tracked
        </p>
      </div>
    </div>
  </div>
  
  <div className="flex items-center justify-between">
    {/* Stats */}
    <div className="flex items-center space-x-4">
      <div className="flex items-center space-x-1.5">
        <div className={`w-6 h-6 rounded-md bg-gradient-to-br ${theme.buttonGradient} flex items-center justify-center`}>
          <FaEye className="h-3 w-3 text-white" />
        </div>
        <div>
          <div className={`text-sm font-bold ${theme.textPrimary}`}>{watchlist.length}</div>
          <div className={`text-xs ${theme.textSecondary}`}>Tracked</div>
        </div>
      </div>
      <div className="flex items-center space-x-1.5">
        <div className="w-6 h-6 rounded-md bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
          <FaChartLine className="h-3 w-3 text-white" />
        </div>
        <div>
          <div className="text-sm font-bold text-green-500">
            {watchlist.filter(item => {
              const stock = item.stock || stocks.find(s => s.id === item.stock_id);
              return stock && (stock.last_price || 0) > 0;
            }).length}
          </div>
          <div className={`text-xs ${theme.textSecondary}`}>Active</div>
        </div>
      </div>
    </div>
    
    <button
      onClick={() => setShowAddModal(true)}
      className={`px-3 py-1.5 bg-gradient-to-r ${theme.buttonGradient} text-white rounded-md font-medium shadow hover:shadow-md transition-all duration-200 flex items-center space-x-1.5 text-xs`}
    >
      <FaPlus className="h-3 w-3" />
      <span>Add Stock</span>
    </button>
  </div>
</div>

  {/* Watchlist Cards */}
  {watchlist.length === 0 ? (
    <div className={`${theme.cardBg} backdrop-blur-lg rounded-xl border ${theme.cardBorder} shadow-lg p-8 text-center`}>
      <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${theme.buttonGradient} mb-3`}>
        <FaChartLine className="w-6 h-6 text-white" />
      </div>
      <h3 className={`text-lg font-semibold ${theme.textPrimary} mb-1.5`}>No stocks in watchlist</h3>
      <p className={`text-xs ${theme.textSecondary} mb-4 max-w-md mx-auto`}>
        Add stocks to track their performance and stay updated with market trends
      </p>
      <button
        onClick={() => setShowAddModal(true)}
        className={`px-4 py-2 bg-gradient-to-r ${theme.buttonGradient} text-white rounded-md font-medium shadow hover:shadow-md transition-all duration-200 inline-flex items-center space-x-1.5 text-sm`}
      >
        <FaPlus className="h-3 w-3" />
        <span>Add Your First Stock</span>
      </button>
    </div>
  ) : (
    <div className="space-y-3 max-h-[calc(100vh-180px)] overflow-y-auto">
      {watchlist.map((item: WatchlistItem) => {
        const stock = item.stock || stocks.find(s => s.id === item.stock_id);
        if (!stock) return null;

        const isSelected = selectedStock?.id === stock.id;

        return (
          <div
            key={item.id}
            onClick={() => handleStockSelect(stock)}
            className={`${theme.cardBg} backdrop-blur-lg rounded-lg border ${theme.cardBorder} shadow-sm hover:shadow transition-all duration-200 overflow-hidden cursor-pointer group ${
              isSelected ? `ring-1 ring-blue-500 ${theme.cardBorder}` : ''
            }`}
          >
            {/* Card Header */}
            <div className={`bg-gradient-to-r ${theme.buttonGradient} px-3 py-2`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 flex-1 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-md flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                    {stock.symbol.substring(0, 2)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-white font-semibold text-sm truncate">{stock.symbol}</div>
                    <div className="text-white/80 text-xs truncate">
                      {getStockDisplayName(stock)}
                    </div>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteClick(stock.id, stock.symbol);
                  }}
                  className="text-white/60 hover:text-white hover:bg-white/20 transition-all duration-200 p-1 rounded-md opacity-0 group-hover:opacity-100 flex-shrink-0 ml-1"
                  title="Remove"
                >
                  <FaTrash className="h-3 w-3" />
                </button>
              </div>
            </div>

            {/* Card Body */}
            <div className="p-3 space-y-2">
              {/* Price */}
              <div>
                <div className={`text-xs ${theme.textSecondary} mb-0.5`}>Current Price</div>
                <div className={`text-xl font-bold ${theme.textPrimary}`}>
                  {formatPrice(stock.last_price)}
                </div>
              </div>

              {/* Details */}
              <div className="space-y-1.5 pt-2 border-t border-white/10">
                {stock.sector && (
                  <div className="flex justify-between items-center">
                    <span className={`text-xs ${theme.textSecondary}`}>Sector</span>
                    <span className={`text-xs font-medium ${theme.textAccent} truncate max-w-[100px]`}>
                      {stock.sector}
                    </span>
                  </div>
                )}
                
                {stock.marketCap && (
                  <div className="flex justify-between items-center">
                    <span className={`text-xs ${theme.textSecondary}`}>Market Cap</span>
                    <span className={`text-xs font-semibold ${theme.textPrimary}`}>
                      {formatMarketCap(stock.marketCap)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  )}
</div>

            {/* Stock Details Column */}
            <div className="xl:col-span-2">
              {selectedStock ? (
                <div className={`${theme.cardBg} backdrop-blur-lg rounded-2xl border ${theme.cardBorder} shadow-2xl overflow-hidden`}>
                  {/* Stock Header */}
                  <div className={`p-6 bg-gradient-to-r ${theme.sectionBg} border-b ${theme.cardBorder}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h2 className={`text-3xl font-bold ${theme.textPrimary}`}>{selectedStock.symbol}</h2>
                          {report && (
                            <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getRatingColor(report.json.rating)}`}>
                              {report.json.rating}
                            </span>
                          )}
                        </div>
                        <p className={`text-sm ${theme.textSecondary} mb-1`}>{getStockDisplayName(selectedStock)}</p>
                        <div className="flex items-center space-x-4">
                          {report && (
                            <span className={`text-2xl font-bold ${theme.textPrimary}`}>
                              {formatPrice(report.json.current_price)}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {report && (
                        <div className="flex flex-col items-end space-y-2">
                          <div className="text-right">
                            <div className={`text-xs ${theme.textSecondary} mb-1`}>Quality Score</div>
                            {renderScoreBadge(report.json.quality_score)}
                          </div>
                          <div className="text-right">
                            <div className={`text-xs ${theme.textSecondary} mb-1`}>Valuation Score</div>
                            {renderScoreBadge(report.json.valuation_score)}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Tabs */}
                  <div className={`border-b ${theme.cardBorder} bg-white/30 dark:bg-gray-800/30`}>
                    <div className="flex space-x-1 px-6">
                      {['overview', 'analysis', 'detailed', 'ai'].map((tab) => (
                        <button
                          key={tab}
                          onClick={() => setActiveTab(tab as any)}
                          className={`px-6 py-4 text-sm font-semibold border-b-2 transition-all ${
                            activeTab === tab
                              ? `${theme.textAccent} border-blue-500`
                              : `${theme.textSecondary} border-transparent hover:${theme.textPrimary}`
                          }`}
                        >
                          {tab === 'overview' && '📊 Overview'}
                          {tab === 'analysis' && '📈 Analysis'}
                          {tab === 'detailed' && '📋 Detailed Report'}
                          {tab === 'ai' && '🤖 AI Insights'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Tab Content */}
                  <div className="p-6">
                    {loadingReport && (
                      <div className="text-center py-16">
                        <div className={`inline-block animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 ${theme.textAccent} mb-4`}></div>
                        <p className={`${theme.textPrimary} font-medium mb-2`}>Generating comprehensive analysis...</p>
                        <p className={`text-sm ${theme.textSecondary}`}>This may take a few moments</p>
                      </div>
                    )}

                    {reportError && (
                      <div className="text-center py-16">
                        <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        <p className={`${theme.textPrimary} font-medium mb-2`}>Failed to load report</p>
                        <p className={`text-sm ${theme.textSecondary} mb-4`}>{reportError}</p>
                        <button
                          onClick={() => fetchStockReport(selectedStock.symbol)}
                          className={`px-6 py-2 bg-gradient-to-r ${theme.buttonGradient} text-white rounded-lg hover:${theme.buttonHoverGradient} transition-all font-medium`}
                        >
                          Retry
                        </button>
                      </div>
                    )}

                    {report && !loadingReport && (
                      <>
                        {/* Overview Tab */}
                        {activeTab === 'overview' && (
                          <div className="space-y-6">
                            {/* Key Metrics Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                              {[
                                { label: 'P/E Ratio', value: report.json.pe_ratio?.toFixed(2), icon: '📊' },
                                { label: 'P/B Ratio', value: report.json.pb_ratio?.toFixed(2), icon: '📈' },
                                { label: 'ROE', value: `${report.json.roe?.toFixed(2)}%`, icon: '💰' },
                                { label: 'Dividend Yield', value: `${report.json.dividend_yield?.toFixed(2)}%`, icon: '💵' },
                              ].map((metric) => (
                                <div key={metric.label} className={`p-5 rounded-xl border ${theme.cardBorder} bg-gradient-to-br from-white/50 to-white/30 dark:from-gray-800/50 dark:to-gray-800/30 hover:shadow-lg transition-shadow`}>
                                  <div className="flex items-center justify-between mb-2">
                                    <span className={`text-sm font-medium ${theme.textSecondary}`}>{metric.label}</span>
                                    <span className="text-2xl">{metric.icon}</span>
                                  </div>
                                  <div className={`text-2xl font-bold ${theme.textPrimary}`}>{metric.value}</div>
                                </div>
                              ))}
                            </div>

                            {/* Trading Zones */}
                            {report.json.entry_zones && (
                              <div className={`p-6 rounded-xl border ${theme.cardBorder} bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-900/20 dark:to-indigo-900/20`}>
                                <h3 className={`text-lg font-bold ${theme.textPrimary} mb-4 flex items-center`}>
                                  <span className="mr-2">🎯</span> Trading Zones
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  <div className="text-center p-4 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                                    <div className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-1">Aggressive Entry</div>
                                    <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">₹{report.json.entry_zones.aggressive_entry}</div>
                                  </div>
                                  <div className="text-center p-4 rounded-lg bg-green-100 dark:bg-green-900/30">
                                    <div className="text-sm text-green-600 dark:text-green-400 font-medium mb-1">Conservative Entry</div>
                                    <div className="text-2xl font-bold text-green-700 dark:text-green-300">₹{report.json.entry_zones.conservative_entry}</div>
                                  </div>
                                  <div className="text-center p-4 rounded-lg bg-red-100 dark:bg-red-900/30">
                                    <div className="text-sm text-red-600 dark:text-red-400 font-medium mb-1">Stop Loss</div>
                                    <div className="text-2xl font-bold text-red-700 dark:text-red-300">₹{report.json.entry_zones.stop_loss}</div>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Rationale */}
                            <div className={`p-6 rounded-xl border ${theme.cardBorder} bg-white/50 dark:bg-gray-800/50`}>
                              <h3 className={`text-lg font-bold ${theme.textPrimary} mb-3 flex items-center`}>
                                <span className="mr-2">💡</span> Investment Rationale
                              </h3>
                              <p className={`${theme.textPrimary} leading-relaxed`}>{report.json.rationale}</p>
                            </div>
                          </div>
                        )}

                        {/* Analysis Tab */}
                        {activeTab === 'analysis' && (
                          <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {/* Quality Breakdown */}
                              <div className={`p-6 rounded-xl border ${theme.cardBorder} bg-gradient-to-br from-emerald-50/50 to-green-50/50 dark:from-emerald-900/20 dark:to-green-900/20`}>
                                <div className="flex items-center justify-between mb-4">
                                  <h3 className={`text-lg font-bold ${theme.textPrimary}`}>Quality Analysis</h3>
                                  {renderScoreBadge(report.json.quality_score)}
                                </div>
                                <div className="space-y-3">
                                  {Object.entries(report.json.quality_breakdown).map(([key, value]) => (
                                    <div key={key} className={`flex justify-between items-center p-3 rounded-lg bg-white/50 dark:bg-gray-800/50`}>
                                      <span className={`text-sm font-medium ${theme.textSecondary} capitalize`}>
                                        {key.replace(/_/g, ' ')}
                                      </span>
                                      <span className={`text-sm font-bold ${theme.textPrimary}`}>{String(value)}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Valuation Breakdown */}
                              <div className={`p-6 rounded-xl border ${theme.cardBorder} bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-900/20 dark:to-pink-900/20`}>
                                <div className="flex items-center justify-between mb-4">
                                  <h3 className={`text-lg font-bold ${theme.textPrimary}`}>Valuation Analysis</h3>
                                  {renderScoreBadge(report.json.valuation_score)}
                                </div>
                                <div className="space-y-3">
                                  {Object.entries(report.json.valuation_breakdown).map(([key, value]) => (
                                    <div key={key} className={`flex justify-between items-center p-3 rounded-lg bg-white/50 dark:bg-gray-800/50`}>
                                      <span className={`text-sm font-medium ${theme.textSecondary} capitalize`}>
                                        {key.replace(/_/g, ' ')}
                                      </span>
                                      <span className={`text-sm font-bold ${theme.textPrimary}`}>{String(value)}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Detailed Tab */}
                        {activeTab === 'detailed' && (
                          <div className={`p-6 rounded-xl border ${theme.cardBorder} bg-white/50 dark:bg-gray-800/50`}>
                            <pre className={`text-sm whitespace-pre-wrap font-sans ${theme.textPrimary} leading-relaxed`}>
                              {report.text_summary}
                            </pre>
                          </div>
                        )}

                        {/* AI Insights Tab */}
                        {activeTab === 'ai' && (
                          <div className={`p-6 rounded-xl border ${theme.cardBorder} bg-gradient-to-br from-indigo-50/50 to-blue-50/50 dark:from-indigo-900/20 dark:to-blue-900/20`}>
                            <div className={`text-sm leading-relaxed ${theme.textPrimary} space-y-4`}>
                              {report.ai_summary.split('\n\n').map((paragraph, index) => (
                                <p key={index} className="text-justify">{paragraph}</p>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* Footer */}
                  {report && (
                    <div className={`p-4 border-t ${theme.cardBorder} bg-gradient-to-r ${theme.sectionBg}`}>
                      <div className="flex items-center justify-between">
                        <span className={`text-xs ${theme.textSecondary}`}>
                          Report generated on {new Date().toLocaleString()}
                        </span>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={clearSelection}
                            className={`text-xs px-4 py-2 border ${theme.cardBorder} rounded-lg hover:bg-white/10 transition-all font-medium`}
                          >
                            Close
                          </button>
                          <button
                            onClick={() => fetchStockReport(selectedStock.symbol)}
                            className={`text-xs px-4 py-2 bg-gradient-to-r ${theme.buttonGradient} text-white rounded-lg hover:${theme.buttonHoverGradient} transition-all font-medium`}
                          >
                            Refresh Report
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Empty State for Details Panel */
                <div className={`${theme.cardBg} backdrop-blur-lg rounded-2xl border ${theme.cardBorder} shadow-xl p-16 text-center h-full flex items-center justify-center`}>
                  <div className="max-w-md mx-auto">
                    <div className="text-6xl mb-4">📊</div>
                    <h3 className={`text-2xl font-bold ${theme.textPrimary} mb-3`}>
                      Select a Stock
                    </h3>
                    <p className={`${theme.textSecondary} mb-6`}>
                      Click on any stock from your watchlist to view comprehensive AI-powered analysis, quality scores, valuation metrics, and trading recommendations.
                    </p>
                    <div className={`inline-flex items-center space-x-4 text-sm ${theme.textSecondary}`}>
                      <span className="flex items-center">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                        Quality Analysis
                      </span>
                      <span className="flex items-center">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                        Valuation Metrics
                      </span>
                      <span className="flex items-center">
                        <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                        AI Insights
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Add Stock Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className={`${theme.cardBg} backdrop-blur-xl rounded-2xl border ${theme.cardBorder} shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col`}>
              {/* Modal Header */}
              <div className={`bg-gradient-to-r ${theme.buttonGradient} px-6 py-4 flex items-center justify-between flex-shrink-0`}>
                <div>
                  <h2 className="text-xl font-semibold text-white">Add to Watchlist</h2>
                  <p className="text-white/70 text-xs mt-0.5">Search and select stocks to track</p>
                </div>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setSearchQuery('');
                    setSearchResults([]);
                  }}
                  className="text-white/60 hover:text-white hover:bg-white/20 transition-all duration-200 p-2 rounded-lg"
                >
                  <FaTimes className="h-5 w-5" />
                </button>
              </div>

              {/* Search Bar */}
              <div className="px-6 py-4 border-b border-white/10 flex-shrink-0">
                <div className="relative">
                  <FaSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${theme.textSecondary}`} />
                  <input
                    type="text"
                    placeholder="Search by symbol or company name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 rounded-lg ${theme.cardBg} border ${theme.cardBorder} focus:outline-none focus:ring-2 ${theme.textAccent} ${theme.textPrimary} text-sm`}
                    autoFocus
                  />
                </div>
              </div>

              {/* Search Results */}
              <div className="overflow-y-auto flex-1 p-6">
                {isSearching ? (
                  <div className="text-center py-8">
                    <div className={`inline-block animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 ${theme.textAccent} mb-3`}></div>
                    <div className={`text-sm ${theme.textSecondary}`}>Searching...</div>
                  </div>
                ) : searchQuery.trim().length === 0 ? (
                  <div className="text-center py-8">
                    <FaSearch className={`h-12 w-12 ${theme.textSecondary} mx-auto mb-3 opacity-40`} />
                    <p className={`text-sm ${theme.textSecondary}`}>Type to search stocks</p>
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="text-center py-8">
                    <p className={`text-sm ${theme.textSecondary}`}>No results for "{searchQuery}"</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {searchResults.map((stock) => {
                      const alreadyInWatchlist = isInWatchlist(stock.id.toString());
                      
                      return (
                        <div
                          key={stock.id}
                          className={`${theme.cardBg} backdrop-blur-lg rounded-xl border ${theme.cardBorder} p-4 hover:shadow-md transition-all duration-200 ${
                            alreadyInWatchlist ? 'opacity-40' : ''
                          }`}
                        >
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center space-x-4 flex-1 min-w-0">
                              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${theme.buttonGradient} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                                {stock.symbol.substring(0, 2)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className={`font-semibold ${theme.textPrimary} text-base truncate`}>{stock.symbol}</div>
                                <div className={`text-sm ${theme.textSecondary} truncate`}>
                                  {getStockDisplayName(stock)}
                                </div>
                                <div className="flex items-center gap-3 mt-1">
                                  {stock.sector && (
                                    <span className={`text-xs ${theme.textAccent} font-medium`}>{stock.sector}</span>
                                  )}
                                  <span className={`text-sm font-semibold ${theme.textPrimary}`}>
                                    {formatPrice(stock.last_price)}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => handleAddToWatchlist(stock)}
                              disabled={alreadyInWatchlist}
                              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 text-sm flex-shrink-0 ${
                                alreadyInWatchlist
                                  ? `${theme.textSecondary} cursor-not-allowed`
                                  : `bg-gradient-to-r ${theme.buttonGradient} text-white hover:shadow-md`
                              }`}
                            >
                              {alreadyInWatchlist ? (
                                <span>Added</span>
                              ) : (
                                <>
                                  <FaPlus className="h-3 w-3" />
                                  <span>Add</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <ConfirmationModal
          isOpen={deleteModal.isOpen}
          onClose={() => setDeleteModal({ isOpen: false, stockId: null, stockSymbol: '' })}
          onConfirm={handleConfirmDelete}
          title="Remove from Watchlist"
          message={`Remove ${deleteModal.stockSymbol} from your watchlist?`}
          confirmText="Remove"
          cancelText="Cancel"
          type="danger"
        />
      </div>
    </ProtectedRoute>
  );
}