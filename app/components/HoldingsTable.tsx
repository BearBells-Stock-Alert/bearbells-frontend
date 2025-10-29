'use client';

import { useState } from 'react';
import { FaPlus, FaTrash } from 'react-icons/fa';
import { HiTrendingUp, HiTrendingDown } from 'react-icons/hi';
import { useStockStore } from '../store/stockStore';
import { useTheme } from '../contexts/ThemeContext';
import ConfirmationModal from './shared/ConfirmationModal';
import toast from 'react-hot-toast';
import { appThemes } from '../utils/themes';

interface HoldingsTableProps {
  onAddClick: () => void;
}

export default function HoldingsTable({ onAddClick }: HoldingsTableProps) {
  const { currentTheme } = useTheme();
  const theme = appThemes[currentTheme];
  const { portfolio, removePortfolioItem } = useStockStore();
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    itemId: string | null;
    itemSymbol: string;
  }>({
    isOpen: false,
    itemId: null,
    itemSymbol: '',
  });

  const handleDeleteClick = (itemId: any, itemSymbol: string) => {
    setDeleteModal({
      isOpen: true,
      itemId,
      itemSymbol,
    });
  };

  const handleConfirmDelete = async () => {
    if (deleteModal.itemId) {
      try {
        await removePortfolioItem(deleteModal.itemId);
        toast.success(`Successfully deleted ${deleteModal.itemSymbol}`)
      } catch (error) {
        console.error('Failed to delete portfolio item:', error);
      }
    }
  };

  const totalInvestment = portfolio.reduce(
    (sum, item) => sum + item.quantity * item.buying_price,
    0
  );
  const totalCurrentValue = portfolio.reduce(
    (sum, item) => sum + (item.current_value || 0),
    0
  );
  const totalProfitLoss = portfolio.reduce(
    (sum, item) => sum + (item.profit_loss || 0),
    0
  );
  const profitLossPercent =
    totalInvestment > 0
      ? ((totalProfitLoss / totalInvestment) * 100).toFixed(2)
      : "0.00";

  if (portfolio.length === 0) {
    return (
      <div className={`${theme.cardBg} backdrop-blur-lg rounded-xl border ${theme.cardBorder} shadow-lg overflow-hidden`}>
        <div className="p-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <div className={`bg-gradient-to-br ${theme.buttonGradient} p-1.5 rounded-lg`}>
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h2 className={`text-base font-bold ${theme.textPrimary}`}>Holdings</h2>
                <span className={`text-xs ${theme.textSecondary}`}>0 positions</span>
              </div>
            </div>
            <button
              onClick={onAddClick}
              className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold bg-gradient-to-r ${theme.buttonGradient} text-white rounded-lg hover:${theme.buttonHoverGradient} transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5`}
            >
              <FaPlus className="h-3 w-3" />
              <span>Add Position</span>
            </button>
          </div>
          
          <div className="text-center py-12">
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${theme.cardBg} mb-4`}>
              <svg className={`w-8 h-8 ${theme.textSecondary}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h3 className={`text-base font-semibold ${theme.textPrimary} mb-1.5`}>No Holdings Yet</h3>
            <p className={`text-sm ${theme.textSecondary} mb-4 max-w-md mx-auto`}>Start building your portfolio</p>
            <button
              onClick={onAddClick}
              className={`inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r ${theme.buttonGradient} text-white rounded-lg hover:${theme.buttonHoverGradient} transition-all duration-200 shadow-md hover:shadow-lg text-sm font-medium`}
            >
              <FaPlus className="h-3 w-3" />
              <span>Add Your First Stock</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={`${theme.cardBg} backdrop-blur-lg rounded-xl border ${theme.cardBorder} shadow-lg overflow-hidden`}>
  

{/* Header */}
<div className={`p-4 border-b ${theme.cardBorder} bg-gradient-to-r ${theme.sectionBg}`}>
  <div className="flex items-center justify-between">
    <div className="flex items-center space-x-2">
      <div className={`bg-gradient-to-br ${theme.buttonGradient} p-1.5 rounded-lg`}>
        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      </div>
      <div>
        <h2 className={`text-base font-bold ${theme.textPrimary}`}>Holdings</h2>
        <span className={`text-xs ${theme.textSecondary}`}>{portfolio.length} {portfolio.length === 1 ? 'position' : 'positions'}</span>
      </div>
    </div>
    <button
      onClick={onAddClick}
      className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold bg-gradient-to-r ${theme.buttonGradient} text-white rounded-lg hover:${theme.buttonHoverGradient} transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5`}
    >
      <FaPlus className="h-3 w-3" />
      <span>Add Position</span>
    </button>
  </div>
</div>


{/* Holdings Summary */}
<div className={`p-4 bg-gradient-to-br ${theme.sectionBg} border-b ${theme.cardBorder}`}>
  <div className="grid grid-cols-3 gap-3">
    {/* Current Value Card */}
    <div className={`${theme.cardBg} rounded-lg p-3 border ${theme.cardBorder} shadow-sm`}>
      <div className="flex items-center justify-between mb-2">
        <span className={`text-xs font-medium ${theme.textSecondary}`}>Current Value</span>
        <div className={`${theme.buttonBg} p-1 rounded`}>
          <svg className="w-3 h-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>
      <div className={`text-lg font-bold ${theme.textPrimary}`}>
        ₹{(totalCurrentValue / 1000).toFixed(2)}k
      </div>
    </div>

    {/* Investment Card */}
    <div className={`${theme.cardBg} rounded-lg p-3 border ${theme.cardBorder} shadow-sm`}>
      <div className="flex items-center justify-between mb-2">
        <span className={`text-xs font-medium ${theme.textSecondary}`}>Investment</span>
        <div className={`${theme.buttonBg} p-1 rounded`}>
          <svg className="w-3 h-3 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
      </div>
      <div className={`text-lg font-bold ${theme.textPrimary}`}>
        ₹{(totalInvestment / 1000).toFixed(2)}k
      </div>
    </div>

    {/* P&L Card */}
    <div className={`rounded-lg p-3 border shadow-sm ${
      totalProfitLoss >= 0 
        ? `${theme.cardBg} border-emerald-200/50` 
        : `${theme.cardBg} border-red-200/50`
    }`}>
      <div className="flex items-center justify-between mb-2">
        <span className={`text-xs font-medium ${theme.textSecondary}`}>Total P&L</span>
        <div className={`p-1 rounded ${
          totalProfitLoss >= 0 ? 'bg-emerald-100' : 'bg-red-100'
        }`}>
          {totalProfitLoss >= 0 ? (
            <HiTrendingUp className="w-3 h-3 text-emerald-600" />
          ) : (
            <HiTrendingDown className="w-3 h-3 text-red-600" />
          )}
        </div>
      </div>
      <div className="flex items-baseline space-x-1.5">
        <div className={`text-lg font-bold ${
          totalProfitLoss >= 0 ? 'text-emerald-600' : 'text-red-600'
        }`}>
          ₹{Math.abs(totalProfitLoss).toFixed(2)}
        </div>
        <div className={`text-sm font-semibold ${
          totalProfitLoss >= 0 ? 'text-emerald-600' : 'text-red-600'
        }`}>
          {totalProfitLoss >= 0 ? '+' : '-'}{profitLossPercent}%
        </div>
      </div>
    </div>
  </div>
</div>

        {/* Portfolio Table - Compact Version */}
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-slate-50/50 border-b border-slate-200/50">
              <tr>
                <th className={`text-left py-2 px-3 text-xs font-bold ${theme.textPrimary} uppercase tracking-wider`}>
                  Stock
                </th>
                <th className={`text-right py-2 px-3 text-xs font-bold ${theme.textPrimary} uppercase tracking-wider`}>
                  Qty
                </th>
                <th className={`text-right py-2 px-3 text-xs font-bold ${theme.textPrimary} uppercase tracking-wider`}>
                  Avg
                </th>
                <th className={`text-right py-2 px-3 text-xs font-bold ${theme.textPrimary} uppercase tracking-wider`}>
                  LTP
                </th>
                <th className={`text-right py-2 px-3 text-xs font-bold ${theme.textPrimary} uppercase tracking-wider`}>
                  Value
                </th>
                <th className={`text-right py-2 px-3 text-xs font-bold ${theme.textPrimary} uppercase tracking-wider`}>
                  P&L
                </th>
                <th className={`text-right py-2 px-3 text-xs font-bold ${theme.textPrimary} uppercase tracking-wider`}>
                  %
                </th>
                <th className={`text-right py-2 px-3 text-xs font-bold ${theme.textPrimary} uppercase tracking-wider`}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {portfolio.map((item, index) => {
                const currentPrice =
                  item.current_value && item.quantity
                    ? item.current_value / item.quantity
                    : 0;
                const netChange = item.buying_price
                  ? ((currentPrice - item.buying_price) / item.buying_price) * 100
                  : 0;

                return (
                  <tr 
                    key={item.id} 
                    className="hover:bg-slate-50/50 transition-colors duration-150 group"
                  >
                    <td className="py-2 px-3">
                      <div className="flex items-center space-x-2">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-xs ${
                          index % 5 === 0 ? 'bg-gradient-to-br from-blue-500 to-blue-600' :
                          index % 5 === 1 ? 'bg-gradient-to-br from-purple-500 to-purple-600' :
                          index % 5 === 2 ? 'bg-gradient-to-br from-emerald-500 to-emerald-600' :
                          index % 5 === 3 ? 'bg-gradient-to-br from-orange-500 to-orange-600' :
                          'bg-gradient-to-br from-pink-500 to-pink-600'
                        }`}>
                          {item.stock?.symbol.substring(0, 2)}
                        </div>
                        <div>
                          <div className={`text-xs font-bold ${theme.textPrimary}`}>
                            {item.stock?.symbol}
                          </div>
                          {item.note && (
                            <div className={`text-xs ${theme.textSecondary}`}>{item.note}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="text-right py-2 px-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded bg-slate-100 text-xs font-semibold text-slate-700">
                        {item.quantity}
                      </span>
                    </td>
                    <td className={`text-right py-2 px-3 text-xs font-medium ${theme.textPrimary}`}>
                      ₹{item.buying_price.toFixed(2)}
                    </td>
                    <td className={`text-right py-2 px-3 text-xs font-medium ${theme.textPrimary}`}>
                      ₹{currentPrice.toFixed(2)}
                    </td>
                    <td className={`text-right py-2 px-3 text-xs font-bold ${theme.textPrimary}`}>
                      ₹{(item.current_value || 0).toFixed(2)}
                    </td>
                    <td className="text-right py-2 px-3">
                      <div className={`inline-flex items-center space-x-0.5 px-2 py-0.5 rounded font-semibold text-xs ${
                        (item.profit_loss || 0) >= 0
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-red-100 text-red-700"
                      }`}>
                        {(item.profit_loss || 0) >= 0 ? (
                          <HiTrendingUp className="h-3 w-3" />
                        ) : (
                          <HiTrendingDown className="h-3 w-3" />
                        )}
                        <span>₹{Math.abs(item.profit_loss || 0).toFixed(2)}</span>
                      </div>
                    </td>
                    <td className="text-right py-2 px-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded font-semibold text-xs ${
                        netChange >= 0 
                          ? "bg-emerald-100 text-emerald-700" 
                          : "bg-red-100 text-red-700"
                      }`}>
                        {netChange >= 0 ? "+" : ""}{netChange.toFixed(2)}%
                      </span>
                    </td>
                    <td className="text-right py-2 px-3">
                      <button
                        onClick={() => handleDeleteClick(item.id, item.stock_symbol)}
                        className="text-red-600 hover:text-white hover:bg-red-600 transition-all duration-200 p-1.5 rounded hover:shadow-lg transform hover:scale-110 opacity-0 group-hover:opacity-100"
                        title="Delete holding"
                      >
                        <FaTrash className="h-3 w-3" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, itemId: null, itemSymbol: '' })}
        onConfirm={handleConfirmDelete}
        title="Delete Holding"
        message={`Are you sure you want to delete ${deleteModal.itemSymbol} from your portfolio? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </>
  );
}