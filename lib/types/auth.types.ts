/**
 * Authentication Types
 * 
 * Type definitions for authentication flow
 */

/**
 * Login Request Payload
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Login Response from Backend API
 */
export interface LoginResponse {
  access_token: string;
  user?: {
    id: number;
    email: string;
    name?: string;
  };
}

/**
 * Auth Error Response
 */
export interface AuthError {
  statusCode: number;
  message: string;
  error?: string;
}

/**
 * User Session Data
 */
export interface UserSession {
  id: number;
  email: string;
  name?: string;
}
