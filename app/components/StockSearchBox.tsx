
'use client';

import { useState, useEffect } from 'react';
import { FaSearch } from 'react-icons/fa';
import { useStockStore } from '../store/stockStore';
import { Stock } from '../types';

interface StockSearchBoxProps {
  onSelect: (stock: Stock) => void;
  textColor?: string;
}

export default function StockSearchBox({ onSelect, textColor }: StockSearchBoxProps) {
  const { searchStocks } = useStockStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Stock[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

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

  const handleSelect = (stock: Stock) => {
    onSelect(stock);
    setSearchQuery('');
    setShowResults(false);
  };

  return (
    <div className="relative">
      <div className="relative">
        <FaSearch className="absolute left-2.5 md:left-3 top-2.5 md:top-3 h-3 w-3 md:h-4 md:w-4 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => searchQuery.length >= 2 && setShowResults(true)}
          placeholder="Search eg: infy, nifty..."
          className={`w-full pl-8 md:pl-10 pr-3 md:pr-4 py-1.5 md:py-2 text-xs md:text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
            textColor || 'text-white'
          }`}
        />
      </div>
      
      {/* Search Results Dropdown */}
      {showResults && searchResults.length > 0 && (
        <div className="absolute w-full mt-1 bg-white border border-gray-200 rounded shadow-lg max-h-60 md:max-h-96 overflow-y-auto z-50 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
          {searchResults.map((stock) => (
            <button
              key={stock.id}
              onClick={() => handleSelect(stock)}
              className="w-full px-3 md:px-4 py-2 md:py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0 mr-2">
                  <div className="font-medium text-gray-900 text-xs md:text-sm truncate">{stock.symbol}</div>
                  <div className="text-[10px] md:text-xs text-gray-500 truncate">{stock.name}</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-xs md:text-sm font-medium text-gray-900">
                    ₹{stock.last_price}
                  </div>
                  {stock.change && (
                    <div
                      className={`text-[10px] md:text-xs ${
                        stock.change >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
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
        <div className="absolute w-full mt-1 bg-white border border-gray-200 rounded shadow-lg p-3 md:p-4 text-center text-xs md:text-sm text-gray-500">
          Searching...
        </div>
      )}
    </div>
  );
}