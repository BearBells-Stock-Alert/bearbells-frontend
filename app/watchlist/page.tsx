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
      <div className={`min-h-screen bg-gradient-to-br ${theme.bgGradient}`}>
        {/* Compact Header */}
        <div className={`sticky top-0 z-10 bg-gradient-to-r ${theme.navGradient} backdrop-blur-xl border-b ${theme.navBorder}`}>
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div>
                  <h1 className={`text-2xl font-semibold bg-gradient-to-r ${theme.textGradient} bg-clip-text text-transparent`}>
                    Watchlist
                  </h1>
                  <p className={`text-xs ${theme.textSecondary} mt-0.5`}>
                    {watchlist.length} stocks tracked
                  </p>
                </div>
                
                {/* Inline Stats */}
                <div className="hidden md:flex items-center space-x-4 pl-6 border-l border-white/10">
                  <div className="flex items-center space-x-2">
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${theme.buttonGradient} flex items-center justify-center`}>
                      <FaEye className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <div className={`text-lg font-bold ${theme.textPrimary}`}>{watchlist.length}</div>
                      <div className={`text-xs ${theme.textSecondary}`}>Tracked</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                      <FaChartLine className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <div className="text-lg font-bold text-green-500">
                        {watchlist.filter(item => {
                          const stock = item.stock || stocks.find(s => s.id === item.stock_id);
                          return stock && (stock.last_price || 0) > 0;
                        }).length}
                      </div>
                      <div className={`text-xs ${theme.textSecondary}`}>Active</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => setShowAddModal(true)}
                className={`px-5 py-2.5 bg-gradient-to-r ${theme.buttonGradient} text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200 flex items-center space-x-2 text-sm`}
              >
                <FaPlus className="h-3.5 w-3.5" />
                <span>Add Stock</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-6">
          {watchlist.length === 0 ? (
            <div className={`${theme.cardBg} backdrop-blur-lg rounded-xl border ${theme.cardBorder} shadow-lg p-12 text-center`}>
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${theme.buttonGradient} mb-4`}>
                <FaChartLine className="w-8 h-8 text-white" />
              </div>
              <h3 className={`text-xl font-semibold ${theme.textPrimary} mb-2`}>No stocks in watchlist</h3>
              <p className={`text-sm ${theme.textSecondary} mb-6 max-w-md mx-auto`}>
                Add stocks to track their performance and stay updated with market trends
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className={`px-6 py-2.5 bg-gradient-to-r ${theme.buttonGradient} text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200 inline-flex items-center space-x-2`}
              >
                <FaPlus className="h-3.5 w-3.5" />
                <span>Add Your First Stock</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {watchlist.map((item: WatchlistItem) => {
                const stock = item.stock || stocks.find(s => s.id === item.stock_id);
                if (!stock) return null;

                return (
                  <div
                    key={item.id}
                    className={`${theme.cardBg} backdrop-blur-lg rounded-lg border ${theme.cardBorder} shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group`}
                  >
                    {/* Compact Card Header */}
                    <div className={`bg-gradient-to-r ${theme.buttonGradient} px-3 py-2.5`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 flex-1 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-md flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                            {stock.symbol.substring(0, 2)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-white font-semibold text-sm truncate">{stock.symbol}</div>
                            <div className="text-white/70 text-xs truncate">
                              {getStockDisplayName(stock)}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteClick(stock.id, stock.symbol)}
                          className="text-white/50 hover:text-white hover:bg-white/20 transition-all duration-200 p-1.5 rounded-md opacity-0 group-hover:opacity-100 flex-shrink-0 ml-2"
                          title="Remove"
                        >
                          <FaTrash className="h-3 w-3" />
                        </button>
                      </div>
                    </div>

                    {/* Compact Card Body */}
                    <div className="p-3 space-y-2.5">
                      {/* Price */}
                      <div>
                        <div className={`text-xs ${theme.textSecondary} mb-0.5`}>Price</div>
                        <div className={`text-xl font-bold ${theme.textPrimary}`}>
                          {formatPrice(stock.last_price)}
                        </div>
                      </div>

                      {/* Details */}
                      <div className="space-y-1.5 pt-2 border-t border-white/10">
                        {stock.sector && (
                          <div className="flex justify-between items-center">
                            <span className={`text-xs ${theme.textSecondary}`}>Sector</span>
                            <span className={`text-xs font-medium ${theme.textAccent} truncate max-w-[140px]`}>
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

                        {/* {stock.industry && (
                          <div className="flex justify-between items-center">
                            <span className={`text-xs ${theme.textSecondary}`}>Industry</span>
                            <span className={`text-xs ${theme.textPrimary} truncate max-w-[140px]`}>
                              {stock.industry}
                            </span>
                          </div>
                        )} */}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Streamlined Add Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className={`${theme.cardBg} backdrop-blur-xl rounded-xl border ${theme.cardBorder} shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col`}>
              {/* Compact Modal Header */}
              <div className={`bg-gradient-to-r ${theme.buttonGradient} px-5 py-4 flex items-center justify-between flex-shrink-0`}>
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
              <div className="px-5 py-4 border-b border-white/10 flex-shrink-0">
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
              <div className="overflow-y-auto flex-1 p-5">
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
                  <div className="space-y-2">
                    {searchResults.map((stock) => {
                      const alreadyInWatchlist = isInWatchlist(stock.id.toString());
                      
                      return (
                        <div
                          key={stock.id}
                          className={`${theme.cardBg} backdrop-blur-lg rounded-lg border ${theme.cardBorder} p-3 hover:shadow-md transition-all duration-200 ${
                            alreadyInWatchlist ? 'opacity-40' : ''
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center space-x-3 flex-1 min-w-0">
                              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${theme.buttonGradient} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                                {stock.symbol.substring(0, 2)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className={`font-semibold ${theme.textPrimary} text-sm truncate`}>{stock.symbol}</div>
                                <div className={`text-xs ${theme.textSecondary} truncate`}>
                                  {getStockDisplayName(stock)}
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                  {stock.sector && (
                                    <span className={`text-xs ${theme.textAccent} font-medium`}>{stock.sector}</span>
                                  )}
                                  <span className={`text-xs font-semibold ${theme.textPrimary}`}>
                                    {formatPrice(stock.last_price)}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => handleAddToWatchlist(stock)}
                              disabled={alreadyInWatchlist}
                              className={`px-3 py-1.5 rounded-lg font-medium transition-all duration-200 flex items-center space-x-1.5 text-xs flex-shrink-0 ${
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