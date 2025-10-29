'use client';

import { useState, useEffect } from 'react';
import { useStockStore } from '../store/stockStore';
import { Stock } from '../types';

export default function StockSelector() {
  const { stocks, selectedStock, setSelectedStock, searchStocks } = useStockStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Stock[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Debounced search
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    const searchTimeout = setTimeout(async () => {
      setIsSearching(true);
      const results = await searchStocks(searchQuery);
      setSearchResults(results);
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [searchQuery, searchStocks]);

  const displayStocks = searchQuery.trim().length >= 2 ? searchResults : stocks.slice(0, 10);

  return (
    <div className="space-y-4 text-black">
      {/* Search Input */}
      <div>
        <label htmlFor="stockSearch" className="block text-sm font-medium text-gray-700 mb-1">
          Search Stocks
        </label>
        <input
          type="text"
          id="stockSearch"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by symbol or company name..."
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        {isSearching && (
          <p className="text-sm text-gray-500 mt-1">Searching...</p>
        )}
      </div>

      {/* Stock Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Select Stock
        </label>
        <select
          value={selectedStock?.id?.toString() || ''} /* Convert number to string */
          onChange={(e) => {
            const selectedId = e.target.value;
            if (selectedId === '') {
              setSelectedStock(null);
            } else {
              const stockId = parseInt(selectedId);
              const stock = displayStocks.find(s => s.id === stockId);
              setSelectedStock(stock || null);
            }
          }}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Select a stock...</option>
          {displayStocks.map((stock) => (
            <option key={stock.id} value={stock.id.toString()}> {/* Convert number to string */}
              {stock.symbol} - {stock.name} (₹{stock.current_price})
            </option>
          ))}
        </select>
      </div>

      {/* Selected Stock Details */}
      {selectedStock && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-900">{selectedStock.name}</h3>
          <div className="grid grid-cols-2 gap-4 mt-2 text-sm">
            <div>
              <span className="text-gray-600">Symbol:</span>
              <span className="ml-2 font-medium">{selectedStock.symbol}</span>
            </div>
            <div>
              <span className="text-gray-600">Current Price:</span>
              <span className="ml-2 font-medium">₹{selectedStock.current_price}</span>
            </div>
            <div>
              <span className="text-gray-600">Change:</span>
              <span className={`ml-2 font-medium ${
                selectedStock.change >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {selectedStock.change >= 0 ? '+' : ''}{selectedStock.change} 
                ({selectedStock.change_percent}%)
              </span>
            </div>
            {selectedStock.sector && (
              <div>
                <span className="text-gray-600">Sector:</span>
                <span className="ml-2 font-medium">{selectedStock.sector}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}