export interface User {
    id: number;
    email: string;
    name: string;
    google_id?: string;
  }
  
  export interface Stock {
    id: number;
    symbol: string;
    name: string;
    current_price: number;
    change: number;
    change_percent: number;
    sector?: string;
    marketCap?: number;
    last_price?: number;
  }
  
  export interface StockHolding {
    id: string;
    stockId: string;
    symbol: string;
    quantity: number;
    averagePrice: number;
    totalInvestment: number;
    currentValue: number;
    profitLoss: number;
  }

  export interface PortfolioItem {
    id: number;
    user_id: number;
    stock_id: number;
    stock_symbol: string;
    buying_price: number;
    alert_price: number;
    quantity: number;
    note: string;
    enabled: boolean;
    current_price?: number;
    current_value?: number;
    profit_loss?: number;
    stock?:Stock;
  }

  export interface AuthResponse {
    access_token: string;
    token_type: string;
    user: User;
  }
  
  export interface LoginUrlResponse {
    login_url: string;
  }
  
  export interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    setAuth: (user: User, token: string) => void;
    clearAuth: () => void;
    login: (code: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => void;
    fetchUser: () => Promise<{ success: boolean; error?: string }>;
  }

  // Add to your types.ts
export interface WatchlistItem {
  id: number;
  user_id: number;
  stock_id: number;
  created_at: string;
  stock?: Stock;
}

export interface WatchlistCreate {
  stock_id: number;
  user_id: number;
}

