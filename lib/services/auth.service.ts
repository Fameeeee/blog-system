/**
 * Authentication Service
 * 
 * Handles login, logout, and token management
 * Uses js-cookie for secure cookie storage
 */

import Cookies from 'js-cookie';
import { LoginCredentials, LoginResponse, AuthError } from '../types/auth.types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const AUTH_ENDPOINT = `${API_BASE_URL}/auth/login`;

// Cookie configuration
const TOKEN_COOKIE_NAME = 'access_token';
const COOKIE_OPTIONS = {
  path: '/',
  expires: 1, // 1 day
  secure: process.env.NODE_ENV === 'production', // HTTPS only in production
  sameSite: 'lax' as const,
};

/**
 * Thai error messages for common authentication errors
 */
const ERROR_MESSAGES: Record<number, string> = {
  400: 'กรุณากรอกข้อมูลให้ครบถ้วน',
  401: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง',
  403: 'ไม่มีสิทธิ์เข้าถึงระบบ',
  404: 'ไม่พบบริการยืนยันตัวตน',
  500: 'เกิดข้อผิดพลาดของระบบ กรุณาลองใหม่อีกครั้ง',
  503: 'ระบบไม่พร้อมให้บริการ กรุณาลองใหม่ภายหลัง',
};

/**
 * Login to the system
 * 
 * @param credentials - User email and password
 * @returns Promise<LoginResponse> - Access token and user info
 * @throws Error with Thai error message
 * 
 * @example
 * ```typescript
 * try {
 *   const result = await login({ email: 'admin@example.com', password: 'password' });
 *   console.log('Login success:', result.access_token);
 * } catch (error) {
 *   console.error('Login failed:', error.message);
 * }
 * ```
 */
export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
  // Client-side validation
  if (!credentials.email || !credentials.password) {
    throw new Error('กรุณากรอกอีเมลและรหัสผ่าน');
  }

  // Basic email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(credentials.email)) {
    throw new Error('รูปแบบอีเมลไม่ถูกต้อง');
  }

  try {
    const response = await fetch(AUTH_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    // Handle non-OK responses
    if (!response.ok) {
      let errorMessage = ERROR_MESSAGES[response.status] || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ';

      try {
        const errorData: AuthError = await response.json();
        
        // Use backend error message if available and specific
        if (response.status === 401) {
          errorMessage = 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง';
        } else if (errorData.message && response.status !== 500) {
          // Use backend message for non-500 errors
          errorMessage = errorData.message;
        }
      } catch (e) {
        // If JSON parsing fails, use default error message
      }

      throw new Error(errorMessage);
    }

    // Parse successful response
    const data: LoginResponse = await response.json();

    // Validate response has access_token
    if (!data.access_token) {
      throw new Error('ไม่ได้รับ Token จากระบบ กรุณาติดต่อผู้ดูแลระบบ');
    }

    // Save token to cookie
    Cookies.set(TOKEN_COOKIE_NAME, data.access_token, COOKIE_OPTIONS);

    return data;

  } catch (error) {
    // Network error or other unexpected errors
    if (error instanceof Error) {
      // If it's an error we threw, re-throw it
      if (error.message.includes('กรุณา') || 
          error.message.includes('ไม่') || 
          error.message.includes('เกิด')) {
        throw error;
      }
    }

    // Network error
    throw new Error('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต');
  }
}

/**
 * Logout from the system
 * Removes the access token cookie
 */
export function logout(): void {
  Cookies.remove(TOKEN_COOKIE_NAME, { path: '/' });
}

/**
 * Get the current access token from cookie
 * @returns string | undefined - Access token if exists
 */
export function getAccessToken(): string | undefined {
  return Cookies.get(TOKEN_COOKIE_NAME);
}

/**
 * Check if user is authenticated (has valid token)
 * @returns boolean - true if token exists
 */
export function isAuthenticated(): boolean {
  return !!getAccessToken();
}

/**
 * Set access token manually (for testing or special cases)
 * @param token - Access token to set
 */
export function setAccessToken(token: string): void {
  Cookies.set(TOKEN_COOKIE_NAME, token, COOKIE_OPTIONS);
}
