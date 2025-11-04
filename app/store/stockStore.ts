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
  watchlist: any[];
  watchlistLoading: boolean;
  // Actions
  setStocks: (stocks: Stock[]) => void;
  setPortfolio: (portfolio: PortfolioItem[]) => void;
  setSelectedStock: (stock: Stock | null) => void;
  addPortfolioItem: (item: Omit<PortfolioItem, 'id'>) => Promise<void>;
  updatePortfolioItem: (id: number, updates: Partial<PortfolioItem>) => Promise<void>;
  removePortfolioItem: (id: any) => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  fetchWatchlist: (userId: string) => Promise<void>;
  addToWatchlist: (stockId: string) => Promise<void>;
  removeFromWatchlist: (stockId: string) => Promise<void>;
  isInWatchlist: (stockId: string) => boolean;
  
  // API calls
  fetchStocks: (skip?: number, limit?: number) => Promise<void>;
  searchStocks: (query: string, limit?: number) => Promise<Stock[]>;
  fetchPortfolio: (userId: any) => Promise<void>;
  addToPortfolio: (portfolioData: any) => Promise<void>;
}

// Create axios instance with default config
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const useStockStore = create<StockState>((set, get) => ({
  stocks: [],
  portfolio: [],
  selectedStock: null,
  loading: false,
  error: null,
  watchlist: [],
  watchlistLoading: false,

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
      console.log("Error in adding portfolio item:", error);
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
  
      const response = await api.delete(`/portfolio`, {
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

  fetchWatchlist: async (userId: string) => {
    set({ watchlistLoading: true, error: null });
    try {
      // No need to pass user_id - backend gets it from JWT token
      const { data } = await api.get('/watchlist');
      set({ watchlist: data, watchlistLoading: false });
    } catch (error) {
      const errorMessage = axios.isAxiosError(error) 
        ? error.response?.data?.detail || error.message 
        : 'Failed to fetch watchlist';
      set({ error: errorMessage, watchlistLoading: false });
      throw error;
    }
  },

  addToWatchlist: async (stockId: string) => {
    const { user } = useAuthStore.getState();
    if (!user) throw new Error('User not authenticated');

    try {
      // Backend doesn't need user_id - gets it from JWT token
      const { data } = await api.post('/watchlist', {
        stock_id: stockId
      });
      
      // Refresh watchlist
      await get().fetchWatchlist(user.id);
      return data;
    } catch (error) {
      const errorMessage = axios.isAxiosError(error) 
        ? error.response?.data?.detail || error.message 
        : 'Failed to add to watchlist';
      set({ error: errorMessage });
      throw new Error(errorMessage);
    }
  },

  removeFromWatchlist: async (stockId: string) => {
    const { user } = useAuthStore.getState();
    if (!user) throw new Error('User not authenticated');

    try {
      // Pass stock_id as query param to Next.js route
      // Next.js will then call FastAPI's DELETE /watchlist/{stock_id}
      await api.delete(`/watchlist`, {
        params: { stock_id: stockId }
      });
      
      // Refresh watchlist
      await get().fetchWatchlist(user.id);
    } catch (error) {
      const errorMessage = axios.isAxiosError(error) 
        ? error.response?.data?.detail || error.message 
        : 'Failed to remove from watchlist';
      set({ error: errorMessage });
      throw new Error(errorMessage);
    }
  },

  isInWatchlist: (stockId: string) => {
    const { watchlist } = get();
    return watchlist.some(item => item.stock_id === stockId || item.stock?.id === stockId);
  },
}));