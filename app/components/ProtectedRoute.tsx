// components/ProtectedRoute.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../store/authStore";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token, hydrate } = useAuthStore();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Check if we have auth data in localStorage
    const checkAuth = async () => {
      const storedToken = localStorage.getItem("auth_token");
      const storedUser = localStorage.getItem("auth_user");
      
      if (!token && storedToken && storedUser) {
        // If we have stored auth but no store token, hydrate the store
        hydrate();
      }
      
      // Give a moment for the store to update
      setTimeout(() => {
        setIsChecking(false);
        
        // If still no token after hydration, redirect to login
        if (!token && !storedToken) {
          router.push("/login");
        }
      }, 100);
    };

    checkAuth();
  }, [token, router, hydrate]);

  if (isChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-emerald-500 mb-4"></div>
          <div className="text-xl text-white font-medium">Checking authentication...</div>
        </div>
      </div>
    );
  }

  if (!token) {
    return null; // Will redirect in useEffect
  }

  return <>{children}</>;
}