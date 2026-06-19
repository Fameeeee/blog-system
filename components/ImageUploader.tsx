'use client';

/**
 * ImageUploader Component
 * 
 * Production-ready image uploader with:
 * - Client-side validation (file size, MIME type)
 * - Image preview with proper memory cleanup
 * - Loading states and error handling
 * - Thai error messages
 * - Responsive design with Tailwind CSS
 * 
 * @example
 * ```tsx
 * <ImageUploader 
 *   onUploadSuccess={(imageUrl) => {
 *     console.log('Image uploaded:', imageUrl);
 *     // Save imageUrl to your blog post
 *   }}
 * />
 * ```
 */

import { useState, useRef, useEffect, ChangeEvent } from 'react';
import { uploadImage } from '@/lib/services/upload.service';
import { 
  ImageUploaderProps, 
  ALLOWED_MIME_TYPES, 
  MAX_FILE_SIZE 
} from '@/lib/types/upload.types';

export default function ImageUploader({ 
  onUploadSuccess, 
  className = '' 
}: ImageUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Cleanup: ลบ preview URL เมื่อ component unmount หรือเมื่อเลือกไฟล์ใหม่
   * ป้องกัน memory leak
   */
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  /**
   * Client-side validation: ตรวจสอบไฟล์ก่อนอัปโหลด
   */
  const validateFile = (file: File): string | null => {
    // ตรวจสอบขนาดไฟล์
    if (file.size > MAX_FILE_SIZE) {
      return 'ไฟล์มีขนาดใหญ่เกิน 5MB กรุณาเลือกไฟล์ที่มีขนาดเล็กกว่า';
    }

    // ตรวจสอบประเภทไฟล์
    if (!ALLOWED_MIME_TYPES.includes(file.type as any)) {
      return 'รองรับเฉพาะไฟล์ JPEG, PNG และ WebP เท่านั้น';
    }

    return null;
  };

  /**
   * จัดการเมื่อมีการเลือกไฟล์
   */
  const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    
    // Reset states
    setError(null);
    setUploadedImageUrl(null);

    if (!file) {
      return;
    }

    // Validate file
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      setSelectedFile(null);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
      return;
    }

    // ลบ preview URL เดิม (ถ้ามี) เพื่อป้องกัน memory leak
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    // สร้าง preview URL ใหม่
    const newPreviewUrl = URL.createObjectURL(file);
    setSelectedFile(file);
    setPreviewUrl(newPreviewUrl);
  };

  /**
   * จัดการการอัปโหลดไฟล์
   */
  const handleUpload = async () => {
    if (!selectedFile) {
      setError('กรุณาเลือกไฟล์รูปภาพก่อน');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const result = await uploadImage(selectedFile);
      
      // อัปโหลดสำเร็จ
      setUploadedImageUrl(result.imageUrl);
      onUploadSuccess(result.imageUrl);

      // ล้างข้อมูล
      setSelectedFile(null);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการอัปโหลด');
    } finally {
      setUploading(false);
    }
  };

  /**
   * ยกเลิกการเลือกไฟล์
   */
  const handleCancel = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setError(null);
    setUploadedImageUrl(null);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  /**
   * แสดงขนาดไฟล์ในรูปแบบที่อ่านง่าย
   */
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className={`w-full max-w-md ${className}`}>
      <div className="space-y-4">
        {/* File Input Section */}
        <div className="flex flex-col space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            อัปโหลดรูปภาพ
            <span className="text-xs text-gray-500 ml-2">
              (JPEG, PNG, WebP - สูงสุด 5MB)
            </span>
          </label>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileSelect}
            disabled={uploading}
            className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        {/* Preview Section */}
        {previewUrl && selectedFile && (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
            <div className="flex flex-col items-center space-y-3">
              <img
                src={previewUrl}
                alt="Preview"
                className="max-w-full max-h-64 rounded-lg shadow-md object-contain"
              />
              
              <div className="text-sm text-gray-600 text-center">
                <p className="font-medium">{selectedFile.name}</p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 w-full">
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {uploading ? (
                    <span className="flex items-center justify-center">
                      <svg 
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" 
                        xmlns="http://www.w3.org/2000/svg" 
                        fill="none" 
                        viewBox="0 0 24 24"
                      >
                        <circle 
                          className="opacity-25" 
                          cx="12" 
                          cy="12" 
                          r="10" 
                          stroke="currentColor" 
                          strokeWidth="4"
                        />
                        <path 
                          className="opacity-75" 
                          fill="currentColor" 
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      กำลังอัปโหลด...
                    </span>
                  ) : (
                    '📤 อัปโหลด'
                  )}
                </button>
                
                <button
                  onClick={handleCancel}
                  disabled={uploading}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  ยกเลิก
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start">
              <svg 
                className="h-5 w-5 text-red-400 mt-0.5 mr-2" 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 20 20" 
                fill="currentColor"
              >
                <path 
                  fillRule="evenodd" 
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" 
                  clipRule="evenodd" 
                />
              </svg>
              <div>
                <p className="text-sm font-medium text-red-800">เกิดข้อผิดพลาด</p>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Success Message */}
        {uploadedImageUrl && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-start">
              <svg 
                className="h-5 w-5 text-green-400 mt-0.5 mr-2" 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 20 20" 
                fill="currentColor"
              >
                <path 
                  fillRule="evenodd" 
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" 
                  clipRule="evenodd" 
                />
              </svg>
              <div className="flex-1">
                <p className="text-sm font-medium text-green-800">
                  ✅ อัปโหลดสำเร็จ!
                </p>
                <p className="text-xs text-green-700 mt-1 break-all">
                  {uploadedImageUrl}
                </p>
              </div>
            </div>
            
            {/* Preview uploaded image */}
            <div className="mt-3">
              <img
                src={uploadedImageUrl}
                alt="Uploaded"
                className="max-w-full max-h-48 rounded-lg shadow-md object-contain mx-auto"
              />
            </div>
          </div>
        )}

        {/* Instructions */}
        {!selectedFile && !uploadedImageUrl && (
          <div className="text-xs text-gray-500 space-y-1 bg-blue-50 p-3 rounded-lg border border-blue-100">
            <p className="font-medium text-blue-900">💡 คำแนะนำ:</p>
            <ul className="list-disc list-inside space-y-1 text-blue-800">
              <li>รองรับไฟล์: JPEG, PNG, WebP</li>
              <li>ขนาดไฟล์สูงสุด: 5MB</li>
              <li>รูปภาพจะถูกอัปโหลดไปยัง Cloud Storage</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
