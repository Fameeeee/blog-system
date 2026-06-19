/**
 * Authentication Types
 * 
 * Type definitions for authentication flow
 */

/**
 * Login Request Payload
 */
export interface LoginCredentials {
  username: string;
  password: string;
}

/**
 * Register Request Payload
 */
export interface RegisterCredentials {
  username: string;
  password: string;
}

/**
 * Login Response from Backend API
 */
export interface LoginResponse {
  access_token: string;
  username?: string;
}

/**
 * Register Response from Backend API
 */
export interface RegisterResponse {
  access_token: string;
  username: string;
}

/**
 * Auth Error Response
 */
export interface AuthError {
  statusCode: number;
  message: string | string[];
  error?: string;
}

/**
 * User Session Data
 */
export interface UserSession {
  id: number;
  username: string;
}
