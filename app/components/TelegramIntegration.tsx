'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useTheme } from '../contexts/ThemeContext';
import { API_BASE_URL } from '../utils/config';
import { appThemes } from '../utils/themes';

interface TelegramStatus {
  has_linked_account: boolean;
  is_verified: boolean;
  has_pending_verification: boolean;
  chat_id: string | null;
}

export default function TelegramIntegration() {
  const { currentTheme } = useTheme();
  const theme = appThemes[currentTheme];
  const { user } = useAuthStore();
  const [status, setStatus] = useState<TelegramStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');

  const fetchTelegramStatus = async () => {
    if (!user?.id) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/telegram/status?user_id=${user.id}`);
      const data = await response.json();
      setStatus(data);
    } catch (error) {
      console.error('Error fetching Telegram status:', error);
    }
  };

  useEffect(() => {
    fetchTelegramStatus();
  }, [user]);

  const startTelegramLinking = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      // This will trigger the Telegram bot to send a verification code
      // You might need to call your backend to initiate the process
      alert('Please open Telegram and send /start to @BearBellsBot to get a verification code.');
    } catch (error) {
      console.error('Error starting Telegram linking:', error);
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async () => {
    if (!user?.id || !verificationCode) return;
    
    setLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/telegram/verify-code?user_id=${user.id}&code=${verificationCode}`,
        { method: 'POST' }
      );
      
      if (response.ok) {
        const result = await response.json();
        alert('Telegram account linked successfully!');
        setVerificationCode('');
        fetchTelegramStatus();
      } else {
        alert('Invalid verification code. Please try again.');
      }
    } catch (error) {
      console.error('Error verifying code:', error);
      alert('Error verifying code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const unlinkTelegram = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/telegram/account?user_id=${user.id}`,
        { method: 'DELETE' }
      );
      
      if (response.ok) {
        alert('Telegram account unlinked successfully!');
        fetchTelegramStatus();
      }
    } catch (error) {
      console.error('Error unlinking Telegram:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendTestMessage = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/telegram/test-message?user_id=${user.id}`,
        { method: 'POST' }
      );
      
      if (response.ok) {
        alert('Test message sent successfully!');
      } else {
        alert('Failed to send test message.');
      }
    } catch (error) {
      console.error('Error sending test message:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className={`${theme.cardBg} backdrop-blur-sm rounded-lg p-4 border ${theme.cardBorder} shadow-sm`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className={`text-sm font-semibold ${theme.textPrimary} flex items-center`}>
          <svg className="w-4 h-4 mr-1.5 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.78 5.42-.9 6.8-.06.67-.36.89-.89.56-2.45-1.83-3.57-2.98-5.79-4.78-.54-.45-.92-.68-.89-1.07.03-.38.43-.54.78-.39 2.68 1.23 4.52 2.07 7.13 3.22.34.15.58.07.67-.31.31-1.14 1.11-4.56 1.4-5.84.08-.38-.12-.54-.45-.4-1.83.89-5.18 2.14-6.3 2.5-.54.17-.92.25-1.12.24-.92-.04-1.62-.56-1.62-1.09 0-.34.23-.68.7-1.03 2.45-1.67 5.34-3.14 7.68-4.36.67-.34 1.33-.17 1.11.45z"/>
          </svg>
          Telegram
        </h3>
        {status?.is_verified && (
          <span className={`px-2 py-0.5 ${theme.textAccent} bg-opacity-20 text-xs font-medium rounded-full border ${theme.cardBorder}`}>
            Active
          </span>
        )}
      </div>

      {status ? (
        <div className="space-y-2.5">
          {/* Status Display */}
          <div className={`p-2.5 rounded-lg text-sm border ${
            status.is_verified 
              ? `${theme.cardBorder} bg-gradient-to-r ${theme.sectionBg}` 
              : `${theme.cardBorder} bg-gradient-to-r ${theme.sectionBg}`
          }`}>
            <p className={`font-medium ${theme.textPrimary} text-xs`}>
              {status.is_verified ? '✅ Connected' : '🔗 Not Connected'}
            </p>
            <p className={`text-xs ${theme.textSecondary} mt-0.5`}>
              {status.is_verified 
                ? 'Receiving real-time alerts'
                : 'Connect for instant notifications'
              }
            </p>
          </div>

          {/* Action Buttons */}
          <div>
            {!status.is_verified ? (
              <div className="space-y-2">
                <button
                  onClick={startTelegramLinking}
                  disabled={loading}
                  className={`w-full bg-gradient-to-r ${theme.buttonGradient} text-white py-1.5 px-3 rounded-lg text-sm font-medium hover:${theme.buttonHoverGradient} transition-all duration-200 disabled:opacity-50 shadow-md hover:shadow-lg`}
                >
                  {loading ? 'Connecting...' : 'Connect Telegram'}
                </button>
                
                {status.has_pending_verification && (
                  <div className="space-y-1.5">
                    <input
                      type="text"
                      placeholder="Enter 6-digit code"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      className={`w-full px-2.5 py-1.5 text-sm border ${theme.cardBorder} rounded-lg focus:outline-none focus:ring-2 ${theme.textAccent} bg-opacity-10 ${theme.textPrimary}`}
                      maxLength={6}
                    />
                    <button
                      onClick={verifyCode}
                      disabled={loading || verificationCode.length !== 6}
                      className={`w-full bg-gradient-to-r ${theme.buttonGradient} text-white py-1.5 px-3 rounded-lg text-sm font-medium hover:${theme.buttonHoverGradient} transition-all duration-200 disabled:opacity-50 shadow-md hover:shadow-lg`}
                    >
                      {loading ? 'Verifying...' : 'Verify Code'}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={sendTestMessage}
                  disabled={loading}
                  className={`flex-1 bg-gradient-to-r ${theme.buttonGradient} text-white py-1.5 px-3 rounded-lg text-sm font-medium hover:${theme.buttonHoverGradient} transition-all duration-200 disabled:opacity-50 shadow-md hover:shadow-lg`}
                >
                  {loading ? 'Sending...' : 'Test'}
                </button>
                <button
                  onClick={unlinkTelegram}
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white py-1.5 px-3 rounded-lg text-sm font-medium hover:from-red-600 hover:to-red-700 transition-all duration-200 disabled:opacity-50 shadow-md hover:shadow-lg"
                >
                  {loading ? 'Disconnecting...' : 'Disconnect'}
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-3">
          <div className={`inline-block animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 ${theme.textAccent}`}></div>
          <p className={`${theme.textSecondary} text-xs mt-1.5`}>Loading...</p>
        </div>
      )}
    </div>
  );
}