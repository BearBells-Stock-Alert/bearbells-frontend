import * as XLSX from 'xlsx';
import { PortfolioItem } from '../types';

export const exportHoldingsToExcel = (portfolio: PortfolioItem[], filename: string = 'portfolio_holdings.xlsx') => {
  // Prepare data for Excel
  const excelData = portfolio.map((item, index) => ({
    'S.No': index + 1,
    'Stock Symbol': item.stock_symbol,
    'Company Name': item.stock?.name || 'N/A',
    'Quantity': item.quantity,
    'Average Price': `₹${item.buying_price.toFixed(2)}`,
    'Current Price': `₹${((item.current_value || 0) / item.quantity).toFixed(2)}`,
    'Investment Value': `₹${(item.quantity * item.buying_price).toFixed(2)}`,
    'Current Value': `₹${(item.current_value || 0).toFixed(2)}`,
    'P&L (₹)': `₹${Math.abs(item.profit_loss || 0).toFixed(2)}`,
    'P&L (%)': `${(((item.profit_loss || 0) / (item.quantity * item.buying_price)) * 100).toFixed(2)}%`,
    'Status': (item.profit_loss || 0) >= 0 ? 'Profit' : 'Loss',
    'Note': item.note || ''
  }));

  // Add summary row
  const totalInvestment = portfolio.reduce((sum, item) => sum + item.quantity * item.buying_price, 0);
  const totalCurrentValue = portfolio.reduce((sum, item) => sum + (item.current_value || 0), 0);
  const totalProfitLoss = portfolio.reduce((sum, item) => sum + (item.profit_loss || 0), 0);
  const totalProfitLossPercent = totalInvestment > 0 ? (totalProfitLoss / totalInvestment) * 100 : 0;

  const summaryData = [
    {},
    {
      'S.No': 'SUMMARY',
      'Stock Symbol': 'TOTAL',
      'Investment Value': `₹${totalInvestment.toFixed(2)}`,
      'Current Value': `₹${totalCurrentValue.toFixed(2)}`,
      'P&L (₹)': `₹${Math.abs(totalProfitLoss).toFixed(2)}`,
      'P&L (%)': `${totalProfitLossPercent.toFixed(2)}%`,
      'Status': totalProfitLoss >= 0 ? 'Profit' : 'Loss'
    }
  ];

  // Combine data and summary
  const allData = [...excelData, ...summaryData];

  // Create worksheet
  const worksheet = XLSX.utils.json_to_sheet(allData);

  // Create workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Portfolio Holdings');

  // Set column widths
  const colWidths = [
    { wch: 5 },   // S.No
    { wch: 12 },  // Stock Symbol
    { wch: 20 },  // Company Name
    { wch: 8 },   // Quantity
    { wch: 12 },  // Average Price
    { wch: 12 },  // Current Price
    { wch: 15 },  // Investment Value
    { wch: 15 },  // Current Value
    { wch: 12 },  // P&L (₹)
    { wch: 10 },  // P&L (%)
    { wch: 8 },   // Status
    { wch: 20 }   // Note
  ];
  worksheet['!cols'] = colWidths;

  // Generate Excel file and trigger download
  XLSX.writeFile(workbook, filename);
};