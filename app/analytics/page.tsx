"use client";

import { useState, useEffect, useRef } from "react";
import { useTheme } from "../contexts/ThemeContext";
import { appThemes } from "../utils/themes";

interface Stock {
  id: string;
  symbol: string;
  name: string;
  exchange: string;
  current_price?: number;
}

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

export default function StockAnalytics() {
  const { currentTheme } = useTheme();
  const theme = appThemes[currentTheme];

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Stock[]>([]);
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "overview" | "analysis" | "detailed" | "ai"
  >("overview");
  const [report, setReport] = useState<StockReport | null>(null);
  const [loadingReport, setLoadingReport] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);

  const searchRef = useRef<HTMLDivElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Search stocks with debounce
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    debounceTimer.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await fetch(
          `/api/stocks/search?query=${encodeURIComponent(searchQuery)}&limit=10`
        );
        if (response.ok) {
          const stocks = await response.json();
          setSearchResults(stocks);
          setShowDropdown(true);
        }
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [searchQuery]);

  // Fetch report when stock is selected
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
        throw new Error(errorData.error || "Failed to fetch report");
      }

      const data = await response.json();
      setReport(data);
    } catch (err) {
      setReportError(
        err instanceof Error ? err.message : "Failed to fetch report"
      );
    } finally {
      setLoadingReport(false);
    }
  };

  const handleStockSelect = (stock: Stock) => {
    setSelectedStock(stock);
    setSearchQuery(stock.symbol);
    setShowDropdown(false);
    setActiveTab("overview");
  };

  const clearSelection = () => {
    setSelectedStock(null);
    setReport(null);
    setSearchQuery("");
    setActiveTab("overview");
  };

  const renderScoreBadge = (score: number) => {
    const getColor = (score: number) => {
      if (score >= 70)
        return "bg-emerald-100 text-emerald-700 border-emerald-300";
      if (score >= 50) return "bg-yellow-100 text-yellow-700 border-yellow-300";
      if (score >= 30) return "bg-orange-100 text-orange-700 border-orange-300";
      return "bg-red-100 text-red-700 border-red-300";
    };

    return (
      <div
        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border ${getColor(
          score
        )}`}
      >
        {score}/100
      </div>
    );
  };

  const getRatingColor = (rating: string) => {
    if (rating.includes("BUY"))
      return "bg-emerald-100 text-emerald-700 border-emerald-300";
    if (rating.includes("HOLD"))
      return "bg-yellow-100 text-yellow-700 border-yellow-300";
    return "bg-red-100 text-red-700 border-red-300";
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${theme.bgGradient} p-6`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1
            className={`text-4xl font-bold bg-gradient-to-r ${theme.textGradient} bg-clip-text text-transparent mb-2`}
          >
            Stock Analytics
          </h1>
          <p className={`text-sm ${theme.textSecondary}`}>
            Search and analyze stocks with AI-powered insights
          </p>
        </div>

        {/* Search Bar */}
        <div ref={searchRef} className="relative mb-8">
          <div
            className={`${theme.cardBg} backdrop-blur-lg rounded-2xl border ${theme.cardBorder} shadow-xl overflow-hidden`}
          >
            <div className="p-6">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg
                    className={`h-5 w-5 ${theme.textSecondary}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search stocks by symbol or name (e.g., RELIANCE, TCS, INFY)"
                  className={`w-full pl-12 pr-12 py-4 border ${
                    theme.cardBorder
                  } rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all
  ${
    currentTheme === "light"
      ? "bg-white text-black"
      : "bg-white/50 dark:bg-gray-800/50 " + theme.textPrimary
  }
`}
                />
                {selectedStock && (
                  <button
                    onClick={clearSelection}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  >
                    <svg
                      className={`h-5 w-5 ${theme.textSecondary} hover:text-red-500 transition-colors`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
                {isSearching && (
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                    <div
                      className={`animate-spin h-5 w-5 border-2 border-t-transparent rounded-full ${theme.textAccent}`}
                    ></div>
                  </div>
                )}
              </div>

              {/* Search Results Dropdown */}
              {showDropdown && searchResults.length > 0 && (
                <div
                  className={`mt-3 max-h-80 overflow-y-auto rounded-xl border ${
                    theme.cardBorder
                  } shadow-lg ${
                    currentTheme === "light"
                      ? "bg-white text-black"
                      : "bg-white/30 dark:bg-gray-800/80 " + theme.textPrimary
                  }`}
                >
                  {searchResults.map((stock) => (
                    <button
                      key={stock.id}
                      onClick={() => handleStockSelect(stock)}
                      className={`w-full px-4 py-3 text-left transition-colors border-b ${
                        theme.cardBorder
                      } last:border-b-0 ${
                        currentTheme === "light"
                          ? "hover:bg-gray-100 text-black"
                          : "hover:bg-gray-700 " + theme.textPrimary
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div
                            className={`font-semibold ${
                              currentTheme === "light"
                                ? "text-black"
                                : theme.textPrimary
                            }`}
                          >
                            {stock.symbol}
                          </div>
                          <div
                            className={`text-sm ${
                              currentTheme === "light"
                                ? "text-gray-600"
                                : theme.textSecondary
                            } truncate max-w-md`}
                          >
                            {stock.name}
                          </div>
                        </div>
                        <div
                          className={`text-xs px-2 py-1 rounded ${
                            currentTheme === "light"
                              ? "bg-gray-100 text-gray-700"
                              : "bg-gray-700 " + theme.textSecondary
                          }`}
                        >
                          {stock.exchange}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {showDropdown &&
                searchQuery.length >= 2 &&
                searchResults.length === 0 &&
                !isSearching && (
                  <div
                    className={`mt-3 p-4 text-center ${theme.textSecondary} rounded-xl border ${theme.cardBorder} bg-white/50 dark:bg-gray-800/50`}
                  >
                    No stocks found matching "{searchQuery}"
                  </div>
                )}
            </div>
          </div>
        </div>

        {/* Stock Details Card */}
        {selectedStock && (
          <div
            className={`${theme.cardBg} backdrop-blur-lg rounded-2xl border ${theme.cardBorder} shadow-2xl overflow-hidden`}
          >
            {/* Stock Header */}
            <div
              className={`p-6 bg-gradient-to-r ${theme.sectionBg} border-b ${theme.cardBorder}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h2 className={`text-3xl font-bold ${theme.textPrimary}`}>
                      {selectedStock.symbol}
                    </h2>
                    {report && (
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold border ${getRatingColor(
                          report.json.rating
                        )}`}
                      >
                        {report.json.rating}
                      </span>
                    )}
                  </div>
                  <p className={`text-sm ${theme.textSecondary} mb-1`}>
                    {selectedStock.name}
                  </p>
                  <div className="flex items-center space-x-4">
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        currentTheme === "light"
                          ? "text-gray-600 bg-transparent"
                          : "bg-gray-700 " + theme.textSecondary
                      }`}
                    >
                      {selectedStock.exchange}
                    </span>

                    {report && (
                      <span
                        className={`text-2xl font-bold ${theme.textPrimary}`}
                      >
                        ₹{report.json.current_price.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>

                {report && (
                  <div className="flex flex-col items-end space-y-2">
                    <div className="text-right">
                      <div className={`text-xs ${theme.textSecondary} mb-1`}>
                        Quality Score
                      </div>
                      {renderScoreBadge(report.json.quality_score)}
                    </div>
                    <div className="text-right">
                      <div className={`text-xs ${theme.textSecondary} mb-1`}>
                        Valuation Score
                      </div>
                      {renderScoreBadge(report.json.valuation_score)}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Tabs */}
            <div
              className={`border-b ${theme.cardBorder} bg-white/30 dark:bg-gray-800/30`}
            >
              <div className="flex space-x-1 px-6">
                {["overview", "analysis", "detailed", "ai"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`px-6 py-4 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
                      activeTab === tab
                        ? `${theme.textAccent} border-blue-500`
                        : `${theme.textSecondary} border-transparent hover:${theme.textPrimary}`
                    }`}
                  >
                    {tab === "overview" && "📊 Overview"}
                    {tab === "analysis" && "📈 Analysis"}
                    {tab === "detailed" && "📋 Detailed Report"}
                    {tab === "ai" && "🤖 AI Insights"}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {loadingReport && (
                <div className="text-center py-16">
                  <div
                    className={`inline-block animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 ${theme.textAccent} mb-4`}
                  ></div>
                  <p className={`${theme.textPrimary} font-medium mb-2`}>
                    Generating comprehensive analysis...
                  </p>
                  <p className={`text-sm ${theme.textSecondary}`}>
                    This may take a few moments
                  </p>
                </div>
              )}

              {reportError && (
                <div className="text-center py-16">
                  <svg
                    className="w-16 h-16 text-red-500 mx-auto mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                  <p className={`${theme.textPrimary} font-medium mb-2`}>
                    Failed to load report
                  </p>
                  <p className={`text-sm ${theme.textSecondary} mb-4`}>
                    {reportError}
                  </p>
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
                  {activeTab === "overview" && (
                    <div className="space-y-6">
                      {/* Key Metrics Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                          {
                            label: "P/E Ratio",
                            value: report.json.pe_ratio?.toFixed(2),
                            icon: "📊",
                          },
                          {
                            label: "P/B Ratio",
                            value: report.json.pb_ratio?.toFixed(2),
                            icon: "📈",
                          },
                          {
                            label: "ROE",
                            value: `${report.json.roe?.toFixed(2)}%`,
                            icon: "💰",
                          },
                          {
                            label: "Dividend Yield",
                            value: `${report.json.dividend_yield?.toFixed(2)}%`,
                            icon: "💵",
                          },
                        ].map((metric) => (
                          <div
                            key={metric.label}
                            className={`p-5 rounded-xl border ${theme.cardBorder} bg-gradient-to-br from-white/50 to-white/30 dark:from-gray-800/50 dark:to-gray-800/30 hover:shadow-lg transition-shadow`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span
                                className={`text-sm font-medium ${theme.textSecondary}`}
                              >
                                {metric.label}
                              </span>
                              <span className="text-2xl">{metric.icon}</span>
                            </div>
                            <div
                              className={`text-2xl font-bold ${theme.textPrimary}`}
                            >
                              {metric.value}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Trading Zones */}
                      {report.json.entry_zones && (
                        <div
                          className={`p-6 rounded-xl border ${theme.cardBorder} bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-900/20 dark:to-indigo-900/20`}
                        >
                          <h3
                            className={`text-lg font-bold ${theme.textPrimary} mb-4 flex items-center`}
                          >
                            <span className="mr-2">🎯</span> Trading Zones
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="text-center p-4 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                              <div className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-1">
                                Aggressive Entry
                              </div>
                              <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                                ₹{report.json.entry_zones.aggressive_entry}
                              </div>
                            </div>
                            <div className="text-center p-4 rounded-lg bg-green-100 dark:bg-green-900/30">
                              <div className="text-sm text-green-600 dark:text-green-400 font-medium mb-1">
                                Conservative Entry
                              </div>
                              <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                                ₹{report.json.entry_zones.conservative_entry}
                              </div>
                            </div>
                            <div className="text-center p-4 rounded-lg bg-red-100 dark:bg-red-900/30">
                              <div className="text-sm text-red-600 dark:text-red-400 font-medium mb-1">
                                Stop Loss
                              </div>
                              <div className="text-2xl font-bold text-red-700 dark:text-red-300">
                                ₹{report.json.entry_zones.stop_loss}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Rationale */}
                      <div
                        className={`p-6 rounded-xl border ${theme.cardBorder} bg-white/50 dark:bg-gray-800/50`}
                      >
                        <h3
                          className={`text-lg font-bold ${theme.textPrimary} mb-3 flex items-center`}
                        >
                          <span className="mr-2">💡</span> Investment Rationale
                        </h3>
                        <p className={`${theme.textPrimary} leading-relaxed`}>
                          {report.json.rationale}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Analysis Tab */}
                  {activeTab === "analysis" && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Quality Breakdown */}
                        <div
                          className={`p-6 rounded-xl border ${theme.cardBorder} bg-gradient-to-br from-emerald-50/50 to-green-50/50 dark:from-emerald-900/20 dark:to-green-900/20`}
                        >
                          <div className="flex items-center justify-between mb-4">
                            <h3
                              className={`text-lg font-bold ${theme.textPrimary}`}
                            >
                              Quality Analysis
                            </h3>
                            {renderScoreBadge(report.json.quality_score)}
                          </div>
                          <div className="space-y-3">
                            {Object.entries(report.json.quality_breakdown).map(
                              ([key, value]) => (
                                <div
                                  key={key}
                                  className={`flex justify-between items-center p-3 rounded-lg bg-white/50 dark:bg-gray-800/50`}
                                >
                                  <span
                                    className={`text-sm font-medium ${theme.textSecondary} capitalize`}
                                  >
                                    {key.replace(/_/g, " ")}
                                  </span>
                                  <span
                                    className={`text-sm font-bold ${theme.textPrimary}`}
                                  >
                                    {String(value)}
                                  </span>
                                </div>
                              )
                            )}
                          </div>
                        </div>

                        {/* Valuation Breakdown */}
                        <div
                          className={`p-6 rounded-xl border ${theme.cardBorder} bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-900/20 dark:to-pink-900/20`}
                        >
                          <div className="flex items-center justify-between mb-4">
                            <h3
                              className={`text-lg font-bold ${theme.textPrimary}`}
                            >
                              Valuation Analysis
                            </h3>
                            {renderScoreBadge(report.json.valuation_score)}
                          </div>
                          <div className="space-y-3">
                            {Object.entries(
                              report.json.valuation_breakdown
                            ).map(([key, value]) => (
                              <div
                                key={key}
                                className={`flex justify-between items-center p-3 rounded-lg bg-white/50 dark:bg-gray-800/50`}
                              >
                                <span
                                  className={`text-sm font-medium ${theme.textSecondary} capitalize`}
                                >
                                  {key.replace(/_/g, " ")}
                                </span>
                                <span
                                  className={`text-sm font-bold ${theme.textPrimary}`}
                                >
                                  {String(value)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Detailed Tab */}
                  {activeTab === "detailed" && (
                    <div
                    className={`p-6 rounded-xl border ${theme.cardBorder} ${
                      currentTheme === 'light'
                        ? 'bg-rose-200 text-black'
                        : 'bg-white/50 dark:bg-gray-800/50 ' + theme.textPrimary
                    }`}
                    
                    >
                      <pre
                        className={`text-sm whitespace-pre-wrap font-sans ${theme.textPrimary} leading-relaxed`}
                      >
                        {report.text_summary}
                      </pre>
                    </div>
                  )}

                  {/* AI Insights Tab */}
                  {activeTab === "ai" && (
                    <div
                      className={`p-6 rounded-xl border ${theme.cardBorder} bg-gradient-to-br from-indigo-50/50 to-blue-50/50 dark:from-indigo-900/20 dark:to-blue-900/20`}
                    >
                      <div
                        className={`text-sm leading-relaxed ${theme.textPrimary} space-y-4`}
                      >
                        {report.ai_summary
                          .split("\n\n")
                          .map((paragraph, index) => (
                            <p key={index} className="text-justify">
                              {paragraph}
                            </p>
                          ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            {report && (
              <div
                className={`p-4 border-t ${theme.cardBorder} bg-gradient-to-r ${theme.sectionBg}`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs ${theme.textSecondary}`}>
                    Report generated on {new Date().toLocaleString()}
                  </span>
                  <button
                    onClick={() => fetchStockReport(selectedStock.symbol)}
                    className={`text-xs px-4 py-2 bg-gradient-to-r ${theme.buttonGradient} text-white rounded-lg hover:${theme.buttonHoverGradient} transition-all font-medium`}
                  >
                    Refresh Report
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {!selectedStock && (
          <div
            className={`${theme.cardBg} backdrop-blur-lg rounded-2xl border ${theme.cardBorder} shadow-xl p-16 text-center`}
          >
            <div className="max-w-md mx-auto">
              <div className="text-6xl mb-4">📊</div>
              <h3 className={`text-2xl font-bold ${theme.textPrimary} mb-3`}>
                Start Your Stock Analysis
              </h3>
              <p className={`${theme.textSecondary} mb-6`}>
                Search for any stock symbol to view comprehensive AI-powered
                analysis, quality scores, valuation metrics, and trading
                recommendations.
              </p>
              <div
                className={`inline-flex items-center space-x-4 text-sm ${theme.textSecondary}`}
              >
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
  );
}
