'use client';

/**
 * Create Blog Page
 * 
 * Features:
 * - Uses BlogForm component
 * - Handles blog creation with image upload
 * - Success redirect to dashboard
 * - Error handling
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBlog } from '@/lib/services/blog.service';
import { BlogFormData } from '@/lib/types/blog.types';
import BlogForm from '@/components/BlogForm';
import { logout } from '@/lib/services/auth.service';

export default function CreateBlogPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  /**
   * Handle form submission
   */
  const handleSubmit = async (data: BlogFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Create blog via API
      // Note: Do NOT include status for creation - API auto-sets to UNPUBLISHED
      await createBlog({
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt,
        content: data.content,
        coverImageUrl: data.coverImageUrl,
        additionalImages: data.additionalImages,
      });

      // Success - redirect to dashboard
      router.push('/admin/dashboard');
    } catch (error: any) {
      console.error('Failed to create blog:', error);

      // Handle 401 Unauthorized
      if (error.name === 'UnauthorizedError') {
        logout();
        router.push('/admin/login');
        return;
      }

      // Handle other errors
      setSubmitError(error.message || 'เกิดข้อผิดพลาดในการสร้างบทความ');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-black">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Create New Blog</h1>
              <p className="mt-1 text-sm text-gray-500">
                Fill in the details to create a new blog post
              </p>
            </div>
            <button
              onClick={() => router.push('/admin/dashboard')}
              className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 transition-colors"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8">
          <BlogForm
            mode="create"
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            submitError={submitError}
          />
        </div>
      </div>
    </div>
  );
}
