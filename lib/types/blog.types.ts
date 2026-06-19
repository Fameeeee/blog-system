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
 * Blog Entity from API
 */
export interface Blog {
  id: number;
  title: string;
  content: string;
  featuredImage?: string;
  status: BlogStatus;
  views: number;
  authorId: number;
  createdAt: string;
  updatedAt: string;
  author?: {
    id: number;
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
  content: string;
  featuredImage?: string;
  status?: BlogStatus;
  authorId: number;
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
