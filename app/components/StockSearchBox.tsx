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

    console.log("Result is:",searchResults);
    

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
        <FaSearch className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => searchQuery.length >= 2 && setShowResults(true)}
          placeholder="Search eg: infy, nifty fut, index fund, etc"
          className={`w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
            textColor || 'text-white'
          }`}
        />
      </div>
      
      {/* Search Results Dropdown */}
      {showResults && searchResults.length > 0 && (
        <div className="absolute w-full mt-1 bg-white border border-gray-200 rounded shadow-lg max-h-96 overflow-y-auto z-50">
          {searchResults.map((stock) => (
            <button
              key={stock.id}
              onClick={() => handleSelect(stock)}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium text-gray-900">{stock.symbol}</div>
                  <div className="text-xs text-gray-500">{stock.name}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    ₹{stock.last_price}
                  </div>
                  {stock.change && (
                    <div
                    className={`text-xs ${
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
        <div className="absolute w-full mt-1 bg-white border border-gray-200 rounded shadow-lg p-4 text-center text-sm text-gray-500">
          Searching...
        </div>
      )}
    </div>
  );
}