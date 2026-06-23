'use client';

/**
 * Admin Login Page
 * 
 * Features:
 * - Responsive login form with Tailwind CSS
 * - Client-side loading states
 * - Error handling with Thai messages (no window.alert)
 * - Form validation
 * - Auto-redirect on success
 */

import { Suspense, useState, FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { login } from '@/lib/services/auth.service';

function AdminLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Clear previous errors
    setError(null);

    // Client-side validation
    if (!formData.username || !formData.password) {
      setError('กรุณากรอกชื่อผู้ใช้และรหัสผ่าน');
      return;
    }

    setLoading(true);

    try {
      // Call login API
      const result = await login({
        username: formData.username,
        password: formData.password,
      });

      console.log('Login successful:', result);

      // Get redirect URL from query params or default to dashboard
      const redirectUrl = searchParams.get('redirect') || '/admin/dashboard';
      
      // Navigate to dashboard
      router.push(redirectUrl);
      
    } catch (err) {
      // Display error message in UI (not alert)
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ';
      
      setError(errorMessage);
      console.error('Login error:', errorMessage);
      
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle input changes
   */
  const handleChange = (field: 'username' | 'password') => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value,
    }));
    
    // Clear error when user starts typing
    if (error) {
      setError(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center px-4 py-12">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAzIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20"></div>

      <div className="relative w-full max-w-md">
        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-10 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full mb-4">
              <svg 
                className="w-8 h-8 text-white" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" 
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Admin Panel</h1>
            <p className="text-blue-100">เข้าสู่ระบบเพื่อจัดการเว็บไซต์</p>
          </div>

          {/* Form */}
          <div className="px-8 py-10">
            {/* Credentials Hint */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
              <div className="flex items-start">
                <svg 
                  className="h-5 w-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                >
                  <path 
                    fillRule="evenodd" 
                    d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zm-11-1a1 1 0 11-2 0 1 1 0 012 0zM10 9a1 1 0 100-2 1 1 0 000 2zm3 1a1 1 0 11-2 0 1 1 0 012 0z" 
                    clipRule="evenodd" 
                  />
                </svg>
                <div>
                  <h3 className="text-sm font-medium text-blue-900">
                    💡 ข้อมูลการเข้าสู่ระบบ
                  </h3>
                  <p className="text-sm text-blue-800 mt-1">
                    <strong>ชื่อผู้ใช้:</strong> admin
                  </p>
                  <p className="text-sm text-blue-800">
                    <strong>รหัสผ่าน:</strong> admin123
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Alert */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 animate-shake">
                  <div className="flex items-start">
                    <svg 
                      className="h-5 w-5 text-red-400 mt-0.5 mr-3 flex-shrink-0" 
                      fill="currentColor" 
                      viewBox="0 0 20 20"
                    >
                      <path 
                        fillRule="evenodd" 
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" 
                        clipRule="evenodd" 
                      />
                    </svg>
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-red-800">
                        เกิดข้อผิดพลาด
                      </h3>
                      <p className="text-sm text-red-700 mt-1">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Username Field */}
              <div>
                <label 
                  htmlFor="username" 
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  ชื่อผู้ใช้
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg 
                      className="h-5 w-5 text-gray-400" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
                      />
                    </svg>
                  </div>
                  <input
                    id="username"
                    type="text"
                    value={formData.username}
                    onChange={handleChange('username')}
                    disabled={loading}
                    className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
                    placeholder="admin"
                    autoComplete="username"
                    minLength={3}
                    maxLength={50}
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label 
                  htmlFor="password" 
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  รหัสผ่าน
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg 
                      className="h-5 w-5 text-gray-400" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" 
                      />
                    </svg>
                  </div>
                  <input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange('password')}
                    disabled={loading}
                    className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
                    placeholder="••••••••"
                    autoComplete="current-password"
                    required
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {loading ? (
                  <>
                    <svg 
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" 
                      xmlns="http://www.w3.org/2000/svg" 
                      fill="none" 
                      viewBox="0 0 24 24"
                    >
                      <circle 
                        className="opacity-25" 
                        cx="12" 
                        cy="12" 
                        r="10" 
                        stroke="currentColor" 
                        strokeWidth="4"
                      />
                      <path 
                        className="opacity-75" 
                        fill="currentColor" 
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    กำลังเข้าสู่ระบบ...
                  </>
                ) : (
                  <>
                    <svg 
                      className="w-5 h-5 mr-2" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" 
                      />
                    </svg>
                    เข้าสู่ระบบ
                  </>
                )}
              </button>
            </form>

            {/* Register Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                ยังไม่มีบัญชี?{' '}
                <Link 
                  href="/admin/register" 
                  className="font-medium text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                >
                  ลงทะเบียนที่นี่
                </Link>
              </p>
            </div>

            {/* Additional Info */}
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">
                ระบบจัดการเนื้อหา Blog System
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-400">
            Protected by secure authentication
          </p>
        </div>
      </div>

      {/* Custom shake animation for error */}
      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-900 flex items-center justify-center">กำลังโหลด...</div>}>
      <AdminLoginContent />
    </Suspense>
  );
}
