/**
 * Blog Service
 * 
 * Handles all blog-related API calls
 * All requests include Authorization header with Bearer token from cookies
 */

import Cookies from 'js-cookie';
import {
  Blog,
  PaginatedBlogsResponse,
  BlogFormData,
  BlogQueryParams,
  BlogStatus,
  ApiError,
} from '../types/blog.types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const BLOGS_ENDPOINT = `${API_BASE_URL}/blogs`;
const TOKEN_COOKIE_NAME = 'access_token';

/**
 * Thai error messages
 */
const ERROR_MESSAGES: Record<number, string> = {
  400: 'ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง',
  401: 'กรุณาเข้าสู่ระบบใหม่',
  403: 'ไม่มีสิทธิ์เข้าถึง',
  404: 'ไม่พบข้อมูลที่ค้นหา',
  500: 'เกิดข้อผิดพลาดของระบบ กรุณาลองใหม่อีกครั้ง',
};

/**
 * Custom error class for 401 Unauthorized
 * Used to trigger logout and redirect
 */
export class UnauthorizedError extends Error {
  constructor(message: string = 'Unauthorized') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

/**
 * Get authorization headers with Bearer token
 */
function getAuthHeaders(): HeadersInit {
  const token = Cookies.get(TOKEN_COOKIE_NAME);
  
  if (!token) {
    throw new UnauthorizedError('No access token found');
  }

  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

/**
 * Get headers with optional Bearer token
 * Does not throw if token is missing (for public endpoints)
 */
function getOptionalAuthHeaders(): HeadersInit {
  const token = Cookies.get(TOKEN_COOKIE_NAME);
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}

/**
 * Handle API response and errors
 */
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    // Handle 401 Unauthorized
    if (response.status === 401) {
      throw new UnauthorizedError('Session expired');
    }

    // Try to parse error response
    let errorMessage = ERROR_MESSAGES[response.status] || 'เกิดข้อผิดพลาด';
    let errorDetails: string[] = [];
    
    try {
      const errorData: any = await response.json();
      
      // Handle message array (e.g., validation errors)
      if (Array.isArray(errorData.message)) {
        errorDetails = errorData.message;
        errorMessage = errorData.message.join(', ');
      }
      // Handle message string
      else if (typeof errorData.message === 'string') {
        errorMessage = errorData.message;
      }
    } catch (e) {
      // Use default error message
    }

    const error = new Error(errorMessage);
    (error as any).details = errorDetails;
    throw error;
  }

  return await response.json();
}

/**
 * Fetch paginated blogs
 * 
 * Supports both public (PUBLISHED) and authenticated (admin) blog fetching
 * Authentication is optional - required only for non-PUBLISHED blogs
 * 
 * @param params - Query parameters for pagination and filtering
 * @returns Promise<PaginatedBlogsResponse>
 * 
 * @example
 * ```typescript
 * // Public - fetch published blogs (no auth needed)
 * const blogs = await fetchBlogs({ page: 1, limit: 10, status: BlogStatus.PUBLISHED });
 * 
 * // Admin - fetch all blogs including unpublished (auth required)
 * const allBlogs = await fetchBlogs({ page: 1, limit: 10 });
 * ```
 */
export async function fetchBlogs(
  params: BlogQueryParams = {}
): Promise<PaginatedBlogsResponse> {
  const { page = 1, limit = 10, status, search } = params;
  
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (status) {
    queryParams.append('status', status);
  }

  if (search) {
    queryParams.append('search', search);
  }

  const response = await fetch(`${BLOGS_ENDPOINT}?${queryParams.toString()}`, {
    method: 'GET',
    headers: getOptionalAuthHeaders(),
  });

  return handleResponse<PaginatedBlogsResponse>(response);
}

/**
 * Fetch single blog by ID (authenticated)
 * 
 * @param id - Blog ID
 * @returns Promise<Blog>
 */
export async function fetchBlogById(id: string): Promise<Blog> {
  const response = await fetch(`${BLOGS_ENDPOINT}/${id}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  return handleResponse<Blog>(response);
}

/**
 * Fetch single blog by slug (public)
 * 
 * @param slug - Blog slug
 * @returns Promise<Blog>
 */
export async function fetchBlogBySlug(slug: string): Promise<Blog> {
  const response = await fetch(`${BLOGS_ENDPOINT}/${slug}`, {
    method: 'GET',
  });

  return handleResponse<Blog>(response);
}

/**
 * Create new blog
 * 
 * @param data - Blog form data
 * @returns Promise<Blog>
 */
export async function createBlog(data: BlogFormData): Promise<Blog> {
  const response = await fetch(BLOGS_ENDPOINT, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  return handleResponse<Blog>(response);
}

/**
 * Update existing blog
 * 
 * @param id - Blog ID
 * @param data - Blog form data
 * @returns Promise<Blog>
 */
export async function updateBlog(id: string, data: Partial<BlogFormData>): Promise<Blog> {
  const response = await fetch(`${BLOGS_ENDPOINT}/${id}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  return handleResponse<Blog>(response);
}

/**
 * Toggle blog status (PUBLISHED <-> UNPUBLISHED)
 * 
 * @param id - Blog ID
 * @param currentStatus - Current status
 * @returns Promise<Blog>
 */
export async function toggleBlogStatus(
  id: string,
  currentStatus: BlogStatus
): Promise<Blog> {
  const newStatus =
    currentStatus === BlogStatus.PUBLISHED
      ? BlogStatus.UNPUBLISHED
      : BlogStatus.PUBLISHED;

  return updateBlog(id, { status: newStatus });
}

/**
 * Delete blog
 * 
 * @param id - Blog ID
 * @returns Promise<void>
 */
export async function deleteBlog(id: string): Promise<void> {
  const response = await fetch(`${BLOGS_ENDPOINT}/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new UnauthorizedError('Session expired');
    }

    const errorMessage = ERROR_MESSAGES[response.status] || 'ไม่สามารถลบบทความได้';
    throw new Error(errorMessage);
  }

  // DELETE might return 204 No Content or 200 with message
  if (response.status !== 204) {
    await response.json();
  }
}

/**
 * SWR fetcher function for blogs
 * Usage with SWR: useSWR(['/blogs', params], ([_, params]) => fetchBlogs(params))
 */
export const blogsFetcher = async (
  _url: string,
  params?: BlogQueryParams
): Promise<PaginatedBlogsResponse> => {
  return fetchBlogs(params);
};
