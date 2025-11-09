"use client";

import Image from "next/image";
import { useState } from "react";
import axios from "axios";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/login-url`);
      
      if (response.data.login_url) {
        window.location.href = response.data.login_url;
      }
    } catch (err) {
      console.error("Login error", err);
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      {/* Animated background elements */}
      <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-r from-blue-50 to-red-50 opacity-50"></div>
      
      {/* Logo with subtle animation */}
      <div className="mb-10 relative z-10 transform transition-transform duration-500 hover:scale-105">
        <Image
          src="/bearbells-transparent-logo.png"
          alt="Bearbells Logo"
          width={180}
          height={180}
          priority
          className="drop-shadow-md"
        />
      </div>

      {/* Card with Google-style design */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 flex flex-col items-center gap-6 w-full max-w-md relative z-10 transform transition-all duration-300 hover:shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-normal text-gray-800 mb-2 tracking-tight">Welcome to Bearbells</h1>
          <p className="text-sm text-gray-500">
            Sign in to manage your stock alerts
          </p>
        </div>

        <div className="w-full h-px bg-gray-100 my-2"></div>

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center cursor-pointer justify-center gap-3 bg-white text-gray-700 font-medium py-3 px-4 rounded-xl border border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-500 mr-2"></div>
              Redirecting...
            </div>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign in with Google
            </>
          )}
        </button>
        
        <p className="text-xs text-gray-400 mt-4 text-center max-w-xs">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center text-xs text-gray-400 relative z-10">
        © {new Date().getFullYear()} Bearbells. All rights reserved.
      </div>
    </main>
  );
}