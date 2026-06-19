/**
 * Upload API Response Types
 */

export interface UploadResponse {
  imageUrl: string;
  message: string;
}

export interface UploadError {
  statusCode: number;
  message: string;
}

export interface ImageUploaderProps {
  onUploadSuccess: (imageUrl: string) => void;
  className?: string;
}

export type AllowedMimeType = 'image/jpeg' | 'image/png' | 'image/webp';

export const ALLOWED_MIME_TYPES: AllowedMimeType[] = [
  'image/jpeg',
  'image/png',
  'image/webp',
];

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes
