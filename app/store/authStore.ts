import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  token: string | null;
  user: { id: string; email: string; name: string } | null;
  setAuth: (token: string, user: AuthState["user"]) => void;
  clearAuth: () => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      setAuth: (token, user) => {
        localStorage.setItem("auth_token", token);
        localStorage.setItem("auth_user", JSON.stringify(user));
        set({ token, user });
      },
      clearAuth: () => {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_user");
        set({ token: null, user: null });
      },
      hydrate: () => {
        // This function can be called to manually hydrate from localStorage
        const token = localStorage.getItem("auth_token");
        const userStr = localStorage.getItem("auth_user");
        
        if (token && userStr) {
          try {
            const user = JSON.parse(userStr);
            set({ token, user });
          } catch (error) {
            console.error("Error parsing stored user data:", error);
            get().clearAuth();
          }
        }
      },
    }),
    {
      name: "auth-storage", // name of the item in the storage
    }
  )
);