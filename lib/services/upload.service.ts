/**
 * Upload Service - Image Upload to Cloud Storage (Cloudinary)
 * API Endpoint: POST /upload
 * Authentication: JWT Token required (from cookies)
 */

import Cookies from 'js-cookie';
import { UploadResponse, UploadError } from '../types/upload.types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const UPLOAD_ENDPOINT = `${API_BASE_URL}/upload`;
const TOKEN_COOKIE_NAME = 'access_token';

/**
 * ข้อความแสดงข้อผิดพลาดภาษาไทย
 */
const ERROR_MESSAGES: Record<number, string> = {
  400: 'กรุณาเลือกไฟล์รูปภาพ',
  401: 'กรุณาเข้าสู่ระบบก่อนอัปโหลด',
  415: 'ไฟล์ต้องเป็น JPEG, PNG หรือ WebP และไม่เกิน 5MB',
  500: 'เกิดข้อผิดพลาดในการอัปโหลด กรุณาลองใหม่อีกครั้ง',
};

/**
 * ดึง JWT Token จาก cookies
 * @returns JWT Token หรือ null ถ้าไม่พบ
 */
function getAuthToken(): string | null {
  return Cookies.get(TOKEN_COOKIE_NAME) || null;
}

/**
 * อัปโหลดรูปภาพไปยัง Cloud Storage
 * 
 * @param file - ไฟล์รูปภาพที่ต้องการอัปโหลด
 * @returns Promise<UploadResponse> - URL รูปภาพที่อัปโหลดสำเร็จ
 * @throws Error - ข้อความแสดงข้อผิดพลาดภาษาไทย
 * 
 * @example
 * ```typescript
 * try {
 *   const result = await uploadImage(file);
 *   console.log('Image URL:', result.imageUrl);
 * } catch (error) {
 *   console.error('Upload failed:', error.message);
 * }
 * ```
 */
export async function uploadImage(file: File): Promise<UploadResponse> {
  // ตรวจสอบ JWT Token
  const token = getAuthToken();
  if (!token) {
    throw new Error(ERROR_MESSAGES[401]);
  }

  // สร้าง FormData และใส่ไฟล์
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch(UPLOAD_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    // จัดการกรณี Response ไม่สำเร็จ
    if (!response.ok) {
      let errorMessage = ERROR_MESSAGES[response.status] || 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ';

      try {
        const errorData: UploadError = await response.json();
        
        // กรณีพิเศษ: แสดง error message เฉพาะเจาะจงจาก backend
        if (response.status === 415) {
          if (errorData.message.includes('size')) {
            errorMessage = 'ไฟล์มีขนาดใหญ่เกิน 5MB กรุณาลดขนาดไฟล์';
          } else if (errorData.message.includes('type')) {
            errorMessage = 'รองรับเฉพาะไฟล์ JPEG, PNG และ WebP เท่านั้น';
          }
        } else if (response.status === 401) {
          if (errorData.message.includes('expired')) {
            errorMessage = 'Session หมดอายุ กรุณาเข้าสู่ระบบอีกครั้ง';
          }
        }
      } catch (e) {
        // ใช้ error message ตาม status code หาก parse JSON ไม่ได้
      }

      throw new Error(errorMessage);
    }

    // Parse และ return response ที่สำเร็จ
    const data: UploadResponse = await response.json();
    return data;

  } catch (error) {
    // กรณี Network error หรือ error อื่นๆ
    if (error instanceof Error) {
      // ถ้าเป็น error ที่เรา throw เองแล้ว ให้ throw ต่อไป
      if (error.message in Object.values(ERROR_MESSAGES) || 
          error.message.includes('ไฟล์') || 
          error.message.includes('Session')) {
        throw error;
      }
    }

    // Network error หรือ error ที่ไม่คาดคิด
    throw new Error('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต');
  }
}

/**
 * ตรวจสอบว่ามี JWT Token หรือไม่
 * @returns boolean - true ถ้ามี token
 */
export function hasAuthToken(): boolean {
  return getAuthToken() !== null;
}

/**
 * ลบ JWT Token (ใช้เมื่อ logout)
 */
export function clearAuthToken(): void {
  Cookies.remove(TOKEN_COOKIE_NAME, { path: '/' });
}
