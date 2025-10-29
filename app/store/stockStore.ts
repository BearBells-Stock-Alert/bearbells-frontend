import { create } from 'zustand';
import axios from 'axios';
import { Stock, PortfolioItem } from '../types';
import { useAuthStore } from './authStore';

interface StockState {
  stocks: Stock[];
  portfolio: PortfolioItem[];
  selectedStock: Stock | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  setStocks: (stocks: Stock[]) => void;
  setPortfolio: (portfolio: PortfolioItem[]) => void;
  setSelectedStock: (stock: Stock | null) => void;
  addPortfolioItem: (item: Omit<PortfolioItem, 'id'>) => Promise<void>;
  updatePortfolioItem: (id: number, updates: Partial<PortfolioItem>) => Promise<void>;
  removePortfolioItem: (id: any) => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // API calls
  fetchStocks: (skip?: number, limit?: number) => Promise<void>;
  searchStocks: (query: string, limit?: number) => Promise<Stock[]>;
  fetchPortfolio: (userId: any) => Promise<void>;
  addToPortfolio: (portfolioData: any) => Promise<void>;
}

// const API_BASE_URL = 'http://127.0.0.1:8000';

// Create axios instance with default config
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const useStockStore = create<StockState>((set, get) => ({
  stocks: [],
  portfolio: [],
  selectedStock: null,
  loading: false,
  error: null,

  setStocks: (stocks) => set({ stocks }),
  setPortfolio: (portfolio) => set({ portfolio }),
  setSelectedStock: (selectedStock) => set({ selectedStock }),
  
  addPortfolioItem: async (portfolioData) => {
    const { addToPortfolio, fetchPortfolio } = get();
    try {
      await addToPortfolio(portfolioData);
      // Refresh portfolio after adding
      if (portfolioData.user_id) {
        await fetchPortfolio(portfolioData.user_id);
      }
    } catch (error) {
      console.log("Error in adding portfolio item:",error);
      
      throw error;
    }
  },
  
  updatePortfolioItem: async (id, updates) => {
    // Implementation for updating portfolio item
    // You'll need to create an update endpoint in your API
    console.log('Update portfolio item:', id, updates);
  },
  
  removePortfolioItem: async (id) => {
    const { fetchPortfolio } = get();
    const user = useAuthStore.getState().user;
  
    if (!user) throw new Error('User not authenticated');
  
    try {
      set((state) => ({
        portfolio: state.portfolio.filter((item) => item.id !== id),
      }));
  
      const response = await axios.delete(`/api/portfolio`, {
        params: { user_id: user.id, id },
        headers: { Accept: 'application/json' },
      });
  
      await fetchPortfolio(user.id);
      return response.data;
    } catch (error) {
      console.error('Error deleting portfolio item:', error);
      await fetchPortfolio(user.id);
      throw error;
    }
  },
  
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  fetchStocks: async (skip = 0, limit = 100) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.get('/stocks', {
        params: { skip, limit }
      });
      set({ stocks: data, loading: false });
    } catch (error) {
      const errorMessage = axios.isAxiosError(error) 
        ? error.response?.data?.detail || error.message 
        : 'Failed to fetch stocks';
      set({ error: errorMessage, loading: false });
    }
  },

  searchStocks: async (query: string, limit = 50) => {
    try {
      const { data } = await api.get('/stocks/search', {
        params: { query, limit }
      });
      return data;
    } catch (error) {
      const errorMessage = axios.isAxiosError(error) 
        ? error.response?.data?.detail || error.message 
        : 'Failed to search stocks';
      set({ error: errorMessage });
      return [];
    }
  },

  fetchPortfolio: async (userId: number) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.get('/portfolio', {
        params: { user_id: userId }
      });
      
      // Calculate current values and profit/loss
      const portfolioWithCalculations = data.map((item: PortfolioItem) => {
        // const currentValue = item.quantity * (item.current_price || 0);
        const currentValue = item.current_value || 0;
        const totalInvestment = item.quantity * item.buying_price;
        const profitLoss = currentValue - totalInvestment;
        
        return {
          ...item,
          current_value: currentValue,
          profit_loss: profitLoss,
          total_investment: totalInvestment
        };
      });
      
      set({ portfolio: portfolioWithCalculations, loading: false });
    } catch (error) {
      const errorMessage = axios.isAxiosError(error) 
        ? error.response?.data?.detail || error.message 
        : 'Failed to fetch portfolio';
      set({ error: errorMessage, loading: false });
    }
  },

  addToPortfolio: async (portfolioData) => {
    try {
      const { data } = await api.post('/portfolio', portfolioData);
      return data;
    } catch (error) {
      const errorMessage = axios.isAxiosError(error) 
        ? error.response?.data?.detail || error.message 
        : 'Failed to add to portfolio';
      set({ error: errorMessage });
      throw new Error(errorMessage);
    }
  },
}));