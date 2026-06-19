/**
 * Blog Types
 * 
 * Type definitions for blog management
 */

/**
 * Blog Status Enum
 */
export enum BlogStatus {
  PUBLISHED = 'PUBLISHED',
  UNPUBLISHED = 'UNPUBLISHED',
}

/**
 * Blog Image from API (gallery item)
 */
export interface BlogImage {
  id: string;
  blogId: string;
  imageUrl: string;
  createdAt: string;
}

/**
 * Blog Entity from API
 */
export interface Blog {
  id: string; // UUID from backend
  title: string;
  slug?: string;
  excerpt?: string;
  content: string;
  featuredImage?: string;
  coverImageUrl?: string;
  additionalImages?: string[]; // For form submission
  images?: BlogImage[]; // Gallery images from API
  status: BlogStatus;
  viewCount?: number;
  authorId?: string; // UUID from backend
  createdAt: string;
  updatedAt: string;
  publishedAt?: string | null;
  author?: {
    id: string; // UUID from backend
    name: string;
    email: string;
  };
}

/**
 * Paginated Blog Response
 */
export interface PaginatedBlogsResponse {
  data: Blog[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * Blog Create/Update Payload
 */
export interface BlogFormData {
  title: string;
  slug?: string;
  excerpt: string;
  content: string;
  coverImageUrl: string;
  additionalImages?: string[];
  status?: BlogStatus;
  authorId?: number;
}

/**
 * Blog Query Parameters
 */
export interface BlogQueryParams {
  page?: number;
  limit?: number;
  status?: BlogStatus;
  search?: string;
}

/**
 * API Error Response
 */
export interface ApiError {
  statusCode: number;
  message: string;
  error?: string;
}
