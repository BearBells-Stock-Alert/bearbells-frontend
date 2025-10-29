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
  
  const isAuthenticated = !!(token && user);
  
  return {
    token,
    user,
    setAuth,
    logout,
    isAuthenticated,
  };
}