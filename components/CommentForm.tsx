'use client';

/**
 * CommentForm Component
 * 
 * Form for submitting new blog comments
 * Uses react-hook-form + zod for validation
 * Thai language validation for comment content
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createComment } from '@/lib/services/comment.service';
import { CommentFormData } from '@/lib/types/comment.types';

/**
 * Zod validation schema
 * Comment content must contain only Thai characters, numbers, and basic punctuation
 */
const commentSchema = z.object({
  senderName: z
    .string()
    .min(2, 'ชื่อต้องมีอย่างน้อย 2 ตัวอักษร')
    .max(100, 'ชื่อต้องไม่เกิน 100 ตัวอักษร'),
  content: z
    .string()
    .min(5, 'ความเห็นต้องมีอย่างน้อย 5 ตัวอักษร')
    .max(1000, 'ความเห็นต้องไม่เกิน 1000 ตัวอักษร')
    .refine(
      (value) => /^[ก-๙๐-๙0-9\s\r\n.,!?()''""]+$/.test(value),
      'กรุณาใช้ภาษาไทย ตัวเลข และเครื่องหมายวรรคตอนพื้นฐานเท่านั้น'
    ),
});

type CommentFormValues = z.infer<typeof commentSchema>;

interface CommentFormProps {
  blogId: string;
  onSuccess?: () => void;
}

export default function CommentForm({ blogId, onSuccess }: CommentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CommentFormValues>({
    resolver: zodResolver(commentSchema),
  });

  const onSubmit = async (data: CommentFormValues) => {
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      await createComment(blogId, {
        senderName: data.senderName,
        content: data.content,
      });

      // Show success message
      setSubmitSuccess(true);
      reset();

      // Clear success message after 5 seconds
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 5000);

      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการส่งความเห็น'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-6">
        💬 ส่งความเห็นของคุณ
      </h3>

      {/* Success Message */}
      {submitSuccess && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start">
            <svg
              className="h-5 w-5 text-green-400 mt-0.5 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-sm font-medium text-green-800">
              ✅ ส่งความคิดเห็นสำเร็จ รอการตรวจสอบจากผู้ดูแลระบบ
            </p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {submitError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start">
            <svg
              className="h-5 w-5 text-red-400 mt-0.5 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-sm font-medium text-red-800">{submitError}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Sender Name */}
        <div>
          <label htmlFor="senderName" className="block text-sm font-medium text-gray-700 mb-1">
            ชื่อของคุณ <span className="text-red-500">*</span>
          </label>
          <input
            id="senderName"
            type="text"
            placeholder="กรอกชื่อของคุณ"
            {...register('senderName')}
            disabled={isSubmitting}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors ${
              errors.senderName ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.senderName && (
            <p className="text-red-500 text-sm mt-1">{errors.senderName.message}</p>
          )}
        </div>

        {/* Comment Content */}
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
            ความเห็นของคุณ <span className="text-red-500">*</span>
          </label>
          <textarea
            id="content"
            placeholder="แสดงความเห็นของคุณ (ภาษาไทยเท่านั้น)"
            {...register('content')}
            disabled={isSubmitting}
            rows={4}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors ${
              errors.content ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.content && (
            <p className="text-red-500 text-sm mt-1">{errors.content.message}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            ห้ามใช้ตัวอักษรพิเศษหรือสัญลักษณ์ที่ไม่ได้รับการสนับสนุน
          </p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {isSubmitting && (
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
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
          )}
          {isSubmitting ? 'กำลังส่ง...' : 'ส่งความเห็น'}
        </button>
      </form>
    </div>
  );
}
