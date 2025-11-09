// hooks/useAuth.ts
import { useRouter } from "next/navigation";
import { useAuthStore } from "../store/authStore";

export function useAuth() {
  const router = useRouter();
  const { token, user, setAuth, clearAuth } = useAuthStore();
  
  const logout = () => {
    clearAuth();
    router.push("/login");
  };
  // Add token refresh logic and better localStorage persistence
  const refreshToken = async () => {
  try {
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    setAuth(data.access_token, user);
  } catch (error) {
    logout();
  }
};
  
  const isAuthenticated = !!(token && user);
  
  return {
    token,
    user,
    setAuth,
    logout,
    isAuthenticated,
  };
}