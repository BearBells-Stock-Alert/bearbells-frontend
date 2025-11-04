// components/StockReportModal.tsx
'use client';

import { useEffect, useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { appThemes } from '../utils/themes';

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
    quality_breakdown: any;
    valuation_breakdown: any;
    entry_zones: any;
  };
  text_summary: string;
  ai_summary: string;
}

interface StockReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  stockSymbol: any;
}

export default function StockReportModal({ isOpen, onClose, stockSymbol }: StockReportModalProps) {
  const { currentTheme } = useTheme();
  const theme = appThemes[currentTheme];
  const [report, setReport] = useState<StockReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'summary' | 'detailed' | 'ai'>('summary');

  useEffect(() => {
    if (isOpen && stockSymbol) {
      fetchReport();
    }
  }, [isOpen, stockSymbol]);

  const fetchReport = async () => {
    setLoading(true);
    setError(null);
    setReport(null);
    
    try {
      const response = await fetch(`/api/stocks/${stockSymbol}/report`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch report');
      }
      
      const data = await response.json();
      setReport(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch report');
      console.error('Error fetching report:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const renderScoreBadge = (score: number, type: 'quality' | 'valuation') => {
    const getColor = (score: number) => {
      if (score >= 70) return 'text-emerald-600 bg-emerald-100';
      if (score >= 50) return 'text-yellow-600 bg-yellow-100';
      if (score >= 30) return 'text-orange-600 bg-orange-100';
      return 'text-red-600 bg-red-100';
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getColor(score)}`}>
        {score}/100
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
      <div className={`${theme.cardBg} backdrop-blur-lg rounded-2xl border ${theme.cardBorder} shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden`}>
        {/* Header */}
        <div className={`p-6 border-b ${theme.cardBorder} bg-gradient-to-r ${theme.sectionBg}`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className={`text-xl font-bold ${theme.textPrimary} mb-1`}>
                {stockSymbol} - Stock Analysis Report
              </h2>
              {report && (
                <div className="flex items-center space-x-3">
                  <span className={`text-sm font-semibold px-3 py-1 rounded-full ${
                    report.json.rating.includes('BUY') 
                      ? 'bg-emerald-100 text-emerald-700'
                      : report.json.rating.includes('HOLD')
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {report.json.rating}
                  </span>
                  <span className={`text-sm ${theme.textSecondary}`}>
                    ₹{report.json.current_price}
                  </span>
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${theme.textSecondary}`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Tabs */}
        {report && (
          <div className={`border-b ${theme.cardBorder}`}>
            <div className="flex space-x-1 px-6">
              {['summary', 'detailed', 'ai'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab
                      ? `${theme.textAccent} border-blue-500`
                      : `${theme.textSecondary} border-transparent hover:${theme.textPrimary}`
                  }`}
                >
                  {tab === 'summary' && 'Quick Summary'}
                  {tab === 'detailed' && 'Detailed Analysis'}
                  {tab === 'ai' && 'AI Insights'}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {loading && (
            <div className="text-center py-8">
              <div className={`inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 ${theme.textAccent}`}></div>
              <p className={`mt-2 ${theme.textSecondary}`}>Generating report for {stockSymbol}...</p>
              <p className={`text-xs ${theme.textSecondary} mt-1`}>This may take a few seconds</p>
            </div>
          )}

          {error && (
            <div className={`text-center py-8 ${theme.textSecondary}`}>
              <div className="mb-4">
                <svg className="w-12 h-12 text-red-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <p className="text-red-600 font-medium">Failed to generate report</p>
                <p className="text-sm mt-1">{error}</p>
              </div>
              <button
                onClick={fetchReport}
                className={`px-4 py-2 bg-gradient-to-r ${theme.buttonGradient} text-white rounded-lg hover:${theme.buttonHoverGradient} transition-all`}
              >
                Try Again
              </button>
            </div>
          )}

          {report && !loading && (
            <>
              {/* Summary Tab */}
              {activeTab === 'summary' && (
                <div className="space-y-6">
                  {/* Score Cards */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className={`p-4 rounded-lg border ${theme.cardBorder}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-sm font-medium ${theme.textSecondary}`}>Quality Score</span>
                        {renderScoreBadge(report.json.quality_score, 'quality')}
                      </div>
                      <div className="space-y-2">
                        {Object.entries(report.json.quality_breakdown).map(([key, value]) => (
                          <div key={key} className="flex justify-between text-xs">
                            <span className={theme.textSecondary}>{key}:</span>
                            <span className={theme.textPrimary}>{String(value)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className={`p-4 rounded-lg border ${theme.cardBorder}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-sm font-medium ${theme.textSecondary}`}>Valuation Score</span>
                        {renderScoreBadge(report.json.valuation_score, 'valuation')}
                      </div>
                      <div className="space-y-2">
                        {Object.entries(report.json.valuation_breakdown).map(([key, value]) => (
                          <div key={key} className="flex justify-between text-xs">
                            <span className={theme.textSecondary}>{key}:</span>
                            <span className={theme.textPrimary}>{String(value)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Key Metrics */}
                  <div className={`p-4 rounded-lg border ${theme.cardBorder}`}>
                    <h3 className={`text-sm font-semibold ${theme.textPrimary} mb-3`}>Key Metrics</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex justify-between">
                        <span className={theme.textSecondary}>P/E Ratio:</span>
                        <span className={theme.textPrimary}>{report.json.pe_ratio?.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={theme.textSecondary}>P/B Ratio:</span>
                        <span className={theme.textPrimary}>{report.json.pb_ratio?.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={theme.textSecondary}>Dividend Yield:</span>
                        <span className={theme.textPrimary}>{report.json.dividend_yield?.toFixed(2)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={theme.textSecondary}>ROE:</span>
                        <span className={theme.textPrimary}>{report.json.roe?.toFixed(2)}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Entry Zones */}
                  {report.json.entry_zones && (
                    <div className={`p-4 rounded-lg border ${theme.cardBorder}`}>
                      <h3 className={`text-sm font-semibold ${theme.textPrimary} mb-3`}>Trading Zones</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className={theme.textSecondary}>Aggressive Entry:</span>
                          <span className="text-blue-600 font-medium">₹{report.json.entry_zones.aggressive_entry}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className={theme.textSecondary}>Conservative Entry:</span>
                          <span className="text-green-600 font-medium">₹{report.json.entry_zones.conservative_entry}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className={theme.textSecondary}>Stop Loss:</span>
                          <span className="text-red-600 font-medium">₹{report.json.entry_zones.stop_loss}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Detailed Tab */}
              {activeTab === 'detailed' && (
                <div className={`p-4 rounded-lg border ${theme.cardBorder} bg-white/50 dark:bg-gray-800/50`}>
                  <pre className={`text-sm whitespace-pre-wrap font-sans ${theme.textPrimary}`}>
                    {report.text_summary}
                  </pre>
                </div>
              )}

              {/* AI Insights Tab */}
              {activeTab === 'ai' && (
                <div className={`p-4 rounded-lg border ${theme.cardBorder} bg-white/50 dark:bg-gray-800/50`}>
                  <div className={`text-sm leading-relaxed ${theme.textPrimary} space-y-3`}>
                    {report.ai_summary.split('\n').map((line, index) => (
                      <p key={index}>{line}</p>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className={`p-4 border-t ${theme.cardBorder} bg-gradient-to-r ${theme.sectionBg}`}>
          <div className="flex justify-between items-center">
            <span className={`text-xs ${theme.textSecondary}`}>
              Report generated {new Date().toLocaleString()}
            </span>
            <button
              onClick={onClose}
              className={`px-4 py-2 bg-gradient-to-r ${theme.buttonGradient} text-white rounded-lg hover:${theme.buttonHoverGradient} transition-all text-sm font-medium`}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}