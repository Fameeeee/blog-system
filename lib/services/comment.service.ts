/**
 * Comment Service
 * 
 * Handles all comment-related API calls
 */

import {
  Comment,
  PaginatedCommentsResponse,
  CommentFormData,
  CommentQueryParams,
  CommentStatus,
} from '../types/comment.types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const COMMENTS_ENDPOINT = `${API_BASE_URL}/comments`;

/**
 * Fetch approved comments for a blog
 * 
 * Fetches only APPROVED comments for a specific blog
 * Public endpoint - no authentication required
 * 
 * Note: This endpoint may not be available on all backends
 * Gracefully handles 404 errors from missing endpoints
 * 
 * @param blogId - Blog ID (UUID string)
 * @param params - Query parameters (page, limit, etc.)
 * @returns Promise<PaginatedCommentsResponse>
 */
export async function fetchApprovedComments(
  blogId: string,
  params?: Partial<CommentQueryParams>
): Promise<PaginatedCommentsResponse> {
  const searchParams = new URLSearchParams();
  searchParams.append('status', CommentStatus.APPROVED);
  
  if (params?.page) searchParams.append('page', params.page.toString());
  if (params?.limit) searchParams.append('limit', params.limit.toString());

  try {
    const response = await fetch(
      `${API_BASE_URL}/comments/blog/${blogId}?${searchParams.toString()}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      // Return empty comments if endpoint not available (404)
      if (response.status === 404) {
        console.debug('Comments endpoint not available (404) - returning empty list');
        return {
          data: [],
          meta: {
            total: 0,
            page: 1,
            limit: params?.limit || 50,
            totalPages: 0,
          },
        };
      }

      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to fetch comments (${response.status})`);
    }

    return response.json();
  } catch (error) {
    // If it's a 404, return empty comments list gracefully
    if (error instanceof Error && error.message.includes('404')) {
      console.debug('Comments endpoint not available - returning empty list');
      return {
        data: [],
        meta: {
          total: 0,
          page: 1,
          limit: params?.limit || 50,
          totalPages: 0,
        },
      };
    }

    // For other errors, throw them
    throw error;
  }
}

/**
 * Create new comment
 * 
 * IMPORTANT: blogId goes in the URL path ONLY, not in the request body
 * 
 * @param blogId - Blog ID (UUID string) - goes in URL path
 * @param data - Comment form data - only senderName and content in body
 * @returns Promise<Comment>
 */
export async function createComment(
  blogId: string,
  data: CommentFormData
): Promise<Comment> {
  // Build request body with ONLY senderName and content
  const requestBody = {
    senderName: data.senderName,
    content: data.content,
  };

  // Ensure NO extra properties
  if (Object.keys(requestBody).length !== 2 || !('senderName' in requestBody) || !('content' in requestBody)) {
    throw new Error('Request body must contain ONLY senderName and content');
  }

  const url = `${API_BASE_URL}/comments/blog/${blogId}`;
  
  console.log('=== Creating Comment ===');
  console.log('URL:', url);
  console.log('Request Body:', requestBody);
  console.log('Body Keys:', Object.keys(requestBody));
  console.log('Body JSON:', JSON.stringify(requestBody));
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error('=== Comment Creation Failed ===');
    console.error('Status:', response.status);
    console.error('Error:', errorData);
    console.error('Request body was:', requestBody);
    
    throw new Error(
      Array.isArray(errorData.message) 
        ? errorData.message.join(', ') 
        : errorData.message || 'Failed to create comment'
    );
  }

  const result = await response.json();
  console.log('=== Comment Created Successfully ===');
  console.log('Response:', result);
  return result;
}

/**
 * Track blog view
 * 
 * Increments the view count for a blog post
 * Non-blocking - failures are silently logged and don't affect user experience
 * 
 * @param blogId - Blog ID (UUID string)
 * @returns Promise<void>
 */
export async function trackBlogView(blogId: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/blogs/${blogId}/view`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      // Log but don't throw - this is a non-critical operation
      console.debug(`View tracking failed: ${response.status}`, {
        blogId,
        status: response.status,
      });
    }
  } catch (error) {
    // Silently fail - network issues or endpoint not implemented
    console.debug('View tracking error (non-blocking):', error);
  }
}

/**
 * Fetch all comments (admin only)
 * 
 * Protected endpoint - requires JWT authentication
 * Supports filtering by status and pagination
 * 
 * @param params - Query parameters (page, limit, status)
 * @param token - JWT token
 * @returns Promise<PaginatedCommentsResponse>
 */
export async function fetchAllComments(
  params?: Partial<CommentQueryParams>,
  token?: string
): Promise<PaginatedCommentsResponse> {
  const searchParams = new URLSearchParams();
  
  if (params?.page) searchParams.append('page', params.page.toString());
  if (params?.limit) searchParams.append('limit', params.limit.toString());
  if (params?.status) searchParams.append('status', params.status);

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(
    `${COMMENTS_ENDPOINT}?${searchParams.toString()}`,
    {
      method: 'GET',
      headers,
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to fetch comments (${response.status})`);
  }

  return response.json();
}

/**
 * Update comment status (admin only)
 * 
 * Protected endpoint - requires JWT authentication
 * Allows transitioning between PENDING, APPROVED, REJECTED statuses
 * 
 * @param commentId - Comment ID (UUID string)
 * @param status - New status (PENDING, APPROVED, REJECTED)
 * @param token - JWT token
 * @returns Promise<Comment>
 */
export async function updateCommentStatus(
  commentId: string,
  status: CommentStatus,
  token?: string
): Promise<Comment> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(
    `${COMMENTS_ENDPOINT}/${commentId}/status`,
    {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ status }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to update comment status (${response.status})`);
  }

  return response.json();
}
