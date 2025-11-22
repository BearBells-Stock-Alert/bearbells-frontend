
'use client';

import { useState, useEffect } from 'react';
import { FaSearch, FaTimes, FaExchangeAlt } from 'react-icons/fa';
import { useStockStore } from '../store/stockStore';
import { useAuthStore } from '../store/authStore';
import { useTheme } from '../contexts/ThemeContext';
import { Stock } from '../types';
import toast from 'react-hot-toast';
import { appThemes } from '../utils/themes';

interface AddPortfolioFormProps {
  onClose: () => void;
}

export default function AddPortfolioForm({ onClose }: AddPortfolioFormProps) {
  const { currentTheme } = useTheme();
  const theme = appThemes[currentTheme];
  const { user } = useAuthStore();
  const { selectedStock, addPortfolioItem, searchStocks, setSelectedStock } = useStockStore();
  const [quantity, setQuantity] = useState('');
  const [buyingPrice, setBuyingPrice] = useState('');
  const [alertPrice, setAlertPrice] = useState('');
  const [note, setNote] = useState('');
  const [enabled, setEnabled] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Search functionality
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Stock[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showSearchBox, setShowSearchBox] = useState(false);

  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    const searchTimeout = setTimeout(async () => {
      setIsSearching(true);
      const results = await searchStocks(searchQuery);      
      setSearchResults(results);
      setIsSearching(false);
      setShowResults(true);
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [searchQuery, searchStocks]);

  const handleStockSelect = (stock: Stock) => {
    setSelectedStock(stock);
    setSearchQuery('');
    setShowResults(false);
    setShowSearchBox(false);
    // Pre-fill buying price with current price
    if (stock.last_price) {
      setBuyingPrice(stock.last_price.toString());
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedStock || !user) {
      toast.error('Please select a stock first and ensure you are logged in');
      return;
    }

    setSubmitting(true);
    try {
      await addPortfolioItem({
        user_id: parseInt(user.id),
        stock_id: selectedStock.id,
        stock_symbol: selectedStock.symbol,
        buying_price: parseFloat(buyingPrice),
        alert_price: parseFloat(alertPrice),
        quantity: parseFloat(quantity),
        note: note,
        enabled: enabled,
      });
      toast.success("Successfully added to portfolio!");
      onClose();
    } catch (error) {
      console.error('Error adding to portfolio:', error);
      toast.error('Failed to add to portfolio. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className={`bg-gradient-to-r ${theme.buttonGradient} px-4 md:px-6 py-4 md:py-5 flex items-center justify-between flex-shrink-0`}>
          <div className="flex items-center space-x-2 md:space-x-3">
            <div className="bg-white/20 p-1.5 md:p-2 rounded-lg">
              <svg className="w-4 h-4 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <h2 className="text-lg md:text-2xl font-bold text-white">Add to Portfolio</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white hover:bg-white/20 p-1.5 md:p-2 rounded-lg transition-all duration-200"
          >
            <FaTimes className="h-4 w-4 md:h-5 md:w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-4 md:space-y-5 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-slate-400 scrollbar-track-slate-100">
          {/* Stock Selection */}
          <div>
            <label className={`block text-sm font-semibold ${theme.textPrimary} mb-2`}>
              Selected Stock
            </label>
            {!showSearchBox ? (
              <div className={`p-3 md:p-4 bg-gradient-to-br ${theme.cardBg} rounded-xl border-2 ${theme.cardBorder} hover:${theme.textAccent}/30 transition-colors`}>
                {selectedStock ? (
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                    <div className="flex items-center space-x-2 md:space-x-3">
                      <div className={`w-10 h-10 md:w-12 md:h-12 rounded-lg bg-gradient-to-br ${theme.buttonGradient} flex items-center justify-center text-white font-bold text-base md:text-lg flex-shrink-0`}>
                        {selectedStock.symbol.substring(0, 2)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className={`font-bold ${theme.textPrimary} text-sm md:text-base`}>{selectedStock.symbol}</div>
                        <div className={`text-xs md:text-sm ${theme.textSecondary} truncate`}>{selectedStock.name}</div>
                        {selectedStock.last_price && (
                          <div className={`text-xs ${theme.textSecondary} mt-1`}>
                            Current: <span className={`font-semibold ${theme.textPrimary}`}>₹{selectedStock.last_price}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowSearchBox(true)}
                      className={`flex items-center justify-center space-x-1.5 md:space-x-2 px-3 md:px-4 py-2 bg-gradient-to-r ${theme.buttonGradient} text-white rounded-lg hover:${theme.buttonHoverGradient} transition-all duration-200 text-xs md:text-sm font-medium w-full sm:w-auto`}
                    >
                      <FaExchangeAlt className="h-2.5 w-2.5 md:h-3 md:w-3" />
                      <span>Change</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                    <span className={theme.textSecondary}>No stock selected</span>
                    <button
                      type="button"
                      onClick={() => setShowSearchBox(true)}
                      className={`flex items-center justify-center space-x-1.5 md:space-x-2 px-3 md:px-4 py-2 bg-gradient-to-r ${theme.buttonGradient} text-white rounded-lg hover:${theme.buttonHoverGradient} transition-all duration-200 text-xs md:text-sm font-medium w-full sm:w-auto`}
                    >
                      <FaSearch className="h-2.5 w-2.5 md:h-3 md:w-3" />
                      <span>Search Stock</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="relative">
                <div className="relative">
                  <FaSearch className="absolute left-3 md:left-4 top-3 md:top-4 h-4 w-4 md:h-5 md:w-5 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => searchQuery.length >= 2 && setShowResults(true)}
                    placeholder="Search stocks... (e.g., INFY, NIFTY, etc.)"
                    className="w-full pl-10 md:pl-12 pr-10 md:pr-12 py-2.5 md:py-3.5 text-sm border-2 border-blue-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setShowSearchBox(false);
                      setSearchQuery('');
                      setShowResults(false);
                    }}
                    className="absolute right-2 md:right-3 top-2 md:top-3 text-slate-400 hover:text-slate-600 p-1"
                  >
                    <FaTimes className="h-3 w-3 md:h-4 md:w-4" />
                  </button>
                </div>
                
                {/* Search Results Dropdown */}
                {showResults && searchResults.length > 0 && (
                  <div className="absolute w-full mt-2 bg-white border-2 border-slate-200 rounded-xl shadow-2xl max-h-60 md:max-h-80 overflow-y-auto z-50 scrollbar-thin scrollbar-thumb-slate-400 scrollbar-track-slate-100">
                    {searchResults.map((stock) => (
                      <button
                        key={stock.id}
                        type="button"
                        onClick={() => handleStockSelect(stock)}
                        className="w-full px-3 md:px-4 py-2.5 md:py-3 text-left hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 border-b border-slate-100 last:border-b-0 transition-all group"
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-2 md:space-x-3 flex-1 min-w-0">
                            <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg bg-gradient-to-br ${theme.buttonGradient} flex items-center justify-center text-white font-bold text-xs md:text-sm group-hover:scale-110 transition-transform flex-shrink-0`}>
                              {stock.symbol.substring(0, 2)}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className={`font-bold ${theme.textPrimary} text-xs md:text-sm`}>{stock.symbol}</div>
                              <div className={`text-xs ${theme.textSecondary} line-clamp-1`}>{stock.name}</div>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0 ml-2">
                            <div className={`text-xs md:text-sm font-bold ${theme.textPrimary}`}>
                              ₹{stock.last_price}
                            </div>
                            {stock.change && (
                              <div className={`text-xs font-semibold ${
                                stock.change >= 0 ? 'text-emerald-600' : 'text-red-600'
                              }`}>
                                {stock.change >= 0 ? '+' : ''}
                                {stock.change_percent}%
                              </div>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                
                {isSearching && (
                  <div className="absolute w-full mt-2 bg-white border-2 border-slate-200 rounded-xl shadow-lg p-3 md:p-4 text-center text-xs md:text-sm text-slate-500">
                    <div className="inline-block animate-spin rounded-full h-4 w-4 md:h-5 md:w-5 border-t-2 border-b-2 border-blue-600 mr-2"></div>
                    Searching...
                  </div>
                )}

                {showResults && searchResults.length === 0 && !isSearching && searchQuery.length >= 2 && (
                  <div className="absolute w-full mt-2 bg-white border-2 border-slate-200 rounded-xl shadow-lg p-3 md:p-4 text-center text-xs md:text-sm text-slate-500">
                    No stocks found for "{searchQuery}"
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
            {/* Quantity */}
            <div>
              <label htmlFor="quantity" className={`block text-sm font-semibold ${theme.textPrimary} mb-2`}>
                Quantity <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="quantity"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full px-3 md:px-4 py-2 md:py-3 border-2 text-slate-900 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm md:text-base"
                placeholder="Enter quantity"
                step="0.01"
                min="0"
                required
              />
            </div>

            {/* Buying Price */}
            <div>
              <label htmlFor="buyingPrice" className={`block text-sm font-semibold ${theme.textPrimary} mb-2`}>
                Buying Price (₹) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="buyingPrice"
                value={buyingPrice}
                onChange={(e) => setBuyingPrice(e.target.value)}
                className="w-full px-3 md:px-4 py-2 md:py-3 border-2 border-slate-200 text-slate-900 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm md:text-base"
                placeholder="Enter buying price"
                step="0.01"
                min="0"
                required
              />
            </div>
          </div>

          {/* Alert Price */}
          <div>
            <label htmlFor="alertPrice" className={`block text-sm font-semibold ${theme.textPrimary} mb-2`}>
              Alert Price (₹) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="alertPrice"
              value={alertPrice}
              onChange={(e) => setAlertPrice(e.target.value)}
              className="w-full px-3 md:px-4 py-2 md:py-3 border-2 border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm md:text-base"
              placeholder="Set alert price"
              step="0.01"
              min="0"
              required
            />
          </div>

          {/* Note */}
          <div>
            <label htmlFor="note" className={`block text-sm font-semibold ${theme.textPrimary} mb-2`}>
              Note (Optional)
            </label>
            <textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3 md:px-4 py-2 md:py-3 border-2 border-slate-200 text-slate-900 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none text-sm md:text-base"
              placeholder="Add a note about this investment..."
              rows={3}
            />
          </div>

          {/* Enable Alerts Checkbox */}
          <div className={`flex items-center p-3 md:p-4 bg-gradient-to-br ${theme.cardBg} rounded-xl border-2 ${theme.cardBorder}`}>
            <input
              type="checkbox"
              id="enabled"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              className="h-4 w-4 md:h-5 md:w-5 text-blue-600 focus:ring-blue-500 border-slate-300 rounded cursor-pointer flex-shrink-0"
            />
            <label htmlFor="enabled" className="ml-3 flex items-center cursor-pointer">
              <svg className={`w-4 h-4 md:w-5 md:h-5 ${theme.textAccent} mr-2 flex-shrink-0`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className={`text-xs md:text-sm font-medium ${theme.textPrimary}`}>Enable price alerts for this stock</span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-3 md:pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className={`w-full sm:w-auto px-4 md:px-6 py-2 md:py-3 ${theme.textPrimary} font-semibold border-2 border-slate-300 rounded-xl hover:bg-slate-50 disabled:opacity-50 transition-all duration-200 text-sm md:text-base`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !selectedStock}
              className={`w-full sm:w-auto px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r ${theme.buttonGradient} text-white font-semibold rounded-xl hover:${theme.buttonHoverGradient} disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm md:text-base`}
            >
              {submitting ? (
                <span className="flex items-center justify-center">
                  <div className="inline-block animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  Adding...
                </span>
              ) : (
                'Add to Portfolio'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}