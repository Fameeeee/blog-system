/**
 * Comment Types
 * 
 * Type definitions for blog comments
 */

/**
 * Comment Status Enum
 */
export enum CommentStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

/**
 * Comment Entity from API
 */
export interface Comment {
  id: string; // UUID
  blogId: string; // UUID
  senderName: string;
  content: string;
  status: CommentStatus;
  createdAt: string;
  updatedAt: string;
}

/**
 * Paginated Comments Response
 */
export interface PaginatedCommentsResponse {
  data: Comment[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * Comment Create Payload
 */
export interface CommentFormData {
  senderName: string;
  content: string;
}

/**
 * Comment Query Parameters
 */
export interface CommentQueryParams {
  page?: number;
  limit?: number;
  status?: CommentStatus;
}
