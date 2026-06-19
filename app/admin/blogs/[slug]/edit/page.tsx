'use client';

/**
 * Edit Blog Page
 * 
 * Features:
 * - Fetches existing blog data by slug
 * - Uses BlogForm component with default values
 * - Shows slug warning when editing existing slug
 * - Handles blog update with image upload
 * - Success redirect to dashboard
 * - Error handling
 */

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { fetchBlogBySlug, updateBlog } from '@/lib/services/blog.service';
import { Blog, BlogFormData, BlogStatus } from '@/lib/types/blog.types';
import BlogForm from '@/components/BlogForm';
import { logout } from '@/lib/services/auth.service';

export default function EditBlogPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  /**
   * Fetch blog data on mount
   */
  useEffect(() => {
    const loadBlog = async () => {
      try {
        const data = await fetchBlogBySlug(slug);
        setBlog(data);
      } catch (error: any) {
        console.error('Failed to fetch blog:', error);

        // Handle 401 Unauthorized
        if (error.name === 'UnauthorizedError') {
          logout();
          router.push('/admin/login');
          return;
        }

        setFetchError(error.message || 'Failed to load blog data');
      } finally {
        setLoading(false);
      }
    };

    loadBlog();
  }, [slug, router]);

  /**
   * Handle form submission
   */
  const handleSubmit = async (data: BlogFormData) => {
    // Validate blog exists and has ID
    if (!blog || !blog.id) {
      setSubmitError('Blog data is missing or incomplete');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Update blog via API
      await updateBlog(blog.id, {
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt,
        content: data.content,
        coverImageUrl: data.coverImageUrl,
        additionalImages: data.additionalImages,
        status: data.status,
      });

      // Success - redirect to dashboard
      router.push('/admin/dashboard');
    } catch (error: any) {
      console.error('Failed to update blog:', error);

      // Handle 401 Unauthorized
      if (error.name === 'UnauthorizedError') {
        logout();
        router.push('/admin/login');
        return;
      }

      // Handle other errors
      setSubmitError(error.message || 'Failed to update blog');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <svg
            className="animate-spin h-12 w-12 text-blue-600 mx-auto"
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
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (fetchError || !blog) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <svg
            className="h-12 w-12 text-red-500 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h2 className="mt-4 text-xl font-semibold text-gray-900">
            Error
          </h2>
          <p className="mt-2 text-gray-600">
            {fetchError || 'Blog not found'}
          </p>
          <button
            onClick={() => router.push('/admin/dashboard')}
            className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-black">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Blog</h1>
              <p className="mt-1 text-sm text-gray-500">
                Editing: {blog.title}
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
            mode="edit"
            defaultValues={{
              title: blog.title,
              slug: blog.slug || '',
              excerpt: blog.excerpt || '',
              content: blog.content,
              coverImageUrl: blog.coverImageUrl || blog.featuredImage || '',
              additionalImages: blog.additionalImages || [],
              status: blog.status,
            }}
            originalSlug={blog.slug || ''}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            submitError={submitError}
          />
        </div>
      </div>
    </div>
  );
}
