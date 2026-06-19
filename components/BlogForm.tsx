'use client';

/**
 * BlogForm Component
 * 
 * Reusable form for creating and editing blogs
 * Features:
 * - React Hook Form + Zod validation
 * - Image upload integration (cover + additional images)
 * - Auto-generate slug from title
 * - Slug edit warning for existing blogs
 * - 409 conflict handling for duplicate slugs
 */

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import ImageUploader from './ImageUploader';
import { BlogFormData, BlogStatus } from '@/lib/types/blog.types';

/**
 * Zod validation schema with English messages
 */
const blogSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  slug: z.string().optional(),
  excerpt: z.string().min(10, 'Excerpt must be at least 10 characters').max(500, 'Excerpt must be less than 500 characters'),
  content: z.string().min(20, 'Content must be at least 20 characters'),
  coverImageUrl: z.string().url('Please upload a cover image'),
  additionalImages: z.array(z.string().url()).max(6, 'Maximum 6 images allowed').optional(),
  status: z.nativeEnum(BlogStatus).optional(),
});

type BlogFormValues = z.infer<typeof blogSchema>;

interface BlogFormProps {
  mode: 'create' | 'edit';
  defaultValues?: Partial<BlogFormValues>;
  originalSlug?: string;
  onSubmit: (data: BlogFormData) => Promise<void>;
  isSubmitting: boolean;
  submitError?: string | null;
}

export default function BlogForm({
  mode,
  defaultValues,
  originalSlug,
  onSubmit,
  isSubmitting,
  submitError,
}: BlogFormProps) {
  const [showSlugWarning, setShowSlugWarning] = useState(false);
  const [additionalImages, setAdditionalImages] = useState<string[]>(
    defaultValues?.additionalImages || []
  );
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingAdditional, setUploadingAdditional] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    setError,
  } = useForm<BlogFormValues>({
    resolver: zodResolver(blogSchema),
    defaultValues: {
      title: defaultValues?.title || '',
      slug: defaultValues?.slug || '',
      excerpt: defaultValues?.excerpt || '',
      content: defaultValues?.content || '',
      coverImageUrl: defaultValues?.coverImageUrl || '',
      additionalImages: defaultValues?.additionalImages || [],
      status: defaultValues?.status || BlogStatus.UNPUBLISHED,
    },
  });

  const titleValue = watch('title');
  const slugValue = watch('slug');
  const excerptValue = watch('excerpt');
  const contentValue = watch('content');
  const coverImageUrl = watch('coverImageUrl');

  /**
   * Auto-generate slug from title
   */
  useEffect(() => {
    if (mode === 'create' && titleValue && !slugValue) {
      const autoSlug = titleValue
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      setValue('slug', autoSlug);
    }
  }, [titleValue, slugValue, mode, setValue]);

  /**
   * Show warning if slug is edited on edit mode
   */
  useEffect(() => {
    if (mode === 'edit' && originalSlug && slugValue !== originalSlug) {
      setShowSlugWarning(true);
    } else {
      setShowSlugWarning(false);
    }
  }, [mode, originalSlug, slugValue]);

  /**
   * Handle form submission
   */
  const onFormSubmit = async (data: BlogFormValues) => {
    try {
      await onSubmit({
        ...data,
        additionalImages,
      });
    } catch (error: any) {
      // Handle 409 Conflict (slug already exists)
      if (error.message?.includes('409') || error.message?.includes('slug')) {
        setError('slug', {
          type: 'manual',
          message: 'This slug is already in use. Please choose another one.',
        });
      }
      
      // Extract field-specific errors from validation message
      if (error.details && Array.isArray(error.details)) {
        error.details.forEach((detail: string) => {
          // Parse field name from error message
          if (detail.includes('property') && detail.includes('should not exist')) {
            const fieldMatch = detail.match(/property (\w+)/);
            if (fieldMatch) {
              setError(fieldMatch[1] as any, {
                type: 'manual',
                message: detail,
              });
            }
          }
        });
      }
    }
  };

  /**
   * Handle cover image upload success
   */
  const handleCoverUploadSuccess = (imageUrl: string) => {
    setValue('coverImageUrl', imageUrl);
    setUploadingCover(false);
  };

  /**
   * Handle additional image upload success
   */
  const handleAdditionalUploadSuccess = (imageUrl: string) => {
    const newImages = [...additionalImages, imageUrl];
    setAdditionalImages(newImages);
    setValue('additionalImages', newImages);
    setUploadingAdditional(false);
  };

  /**
   * Remove additional image
   */
  const removeAdditionalImage = (index: number) => {
    const newImages = additionalImages.filter((_, i) => i !== index);
    setAdditionalImages(newImages);
    setValue('additionalImages', newImages);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-8">
      {/* Slug Warning Banner */}
      {showSlugWarning && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg animate-pulse">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-yellow-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                ⚠️ URL Slug Change Warning
              </h3>
              <p className="mt-1 text-sm text-yellow-700">
                Changing the URL slug will break old shared links (404 Not Found) and negatively impact SEO.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Global Submit Error */}
      {submitError && (
        <div className="bg-red-50 border-2 border-red-300 rounded-lg p-5 shadow-sm">
          <div className="flex">
            <svg
              className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <div className="ml-4 flex-1">
              <h3 className="text-sm font-semibold text-red-900">⚠️ Error</h3>
              <p className="text-sm text-red-800 mt-2 font-medium">{submitError}</p>
            </div>
          </div>
        </div>
      )}

      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          id="title"
          type="text"
          {...register('title')}
          className={`block w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors ${
            errors.title ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Example: Getting Started with Next.js"
          disabled={isSubmitting}
        />
        <p className="text-xs text-gray-500 mt-1">Minimum 1 letter, maximum 200 letters</p>
        {errors.title && (
          <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
        )}
      </div>

      {/* Slug */}
      <div>
        <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-2">
          URL Slug
        </label>
        <input
          id="slug"
          type="text"
          {...register('slug')}
          className={`block w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors font-mono text-sm ${
            errors.slug ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="auto-generated from title"
          disabled={isSubmitting}
        />
        <p className="text-xs text-gray-500 mt-1">Auto-generated from title (lowercase, hyphens only)</p>
        {errors.slug && (
          <p className="text-red-500 text-sm mt-1">{errors.slug.message}</p>
        )}
      </div>

      {/* Excerpt */}
      <div>
        <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-2">
          Excerpt <span className="text-red-500">*</span>
        </label>
        <textarea
          id="excerpt"
          {...register('excerpt')}
          className={`block w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors ${
            errors.excerpt ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Brief summary of your blog post (max 500 characters)"
          rows={3}
          disabled={isSubmitting}
        />
        <div className="flex justify-between items-center mt-1">
          <p className="text-xs text-gray-500">Minimum 10 letters, maximum 500 letters</p>
          <p className="text-xs text-gray-500">{excerptValue.length}/500</p>
        </div>
        {errors.excerpt && (
          <p className="text-red-500 text-sm mt-1">{errors.excerpt.message}</p>
        )}
      </div>

      {/* Content */}
      <div>
        <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
          Content <span className="text-red-500">*</span>
        </label>
        <textarea
          id="content"
          {...register('content')}
          className={`block w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors font-mono text-sm ${
            errors.content ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Write your blog content here (minimum 20 characters, supports Markdown)"
          rows={12}
          disabled={isSubmitting}
        />
        <div className="flex justify-between items-center mt-1">
          <p className="text-xs text-gray-500">Minimum 20 letters</p>
          <p className="text-xs text-gray-500">{contentValue.length} letters</p>
        </div>
        {errors.content && (
          <p className="text-red-500 text-sm mt-1">{errors.content.message}</p>
        )}
      </div>

      {/* Cover Image */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Cover Image</h3>
        
        <ImageUploader
          onUploadSuccess={handleCoverUploadSuccess}
        />

        {coverImageUrl && (
          <div className="mt-4 relative">
            <img
              src={coverImageUrl}
              alt="Cover preview"
              className="w-full h-48 object-cover rounded-lg border border-gray-200"
            />
            <button
              type="button"
              onClick={() => setValue('coverImageUrl', '')}
              className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Remove
            </button>
          </div>
        )}

        {errors.coverImageUrl && (
          <p className="text-red-500 text-sm mt-2">{errors.coverImageUrl.message}</p>
        )}
      </div>

      {/* Additional Images */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Gallery
        </h3>

        {additionalImages.length < 6 && (
          <ImageUploader
            onUploadSuccess={handleAdditionalUploadSuccess}
            className="w-full"
          />
        )}

        {additionalImages.length > 0 && (
          <div className="mt-4">
            <p className="text-sm text-gray-600 mb-3">
              {additionalImages.length} image(s) added
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {additionalImages.map((imageUrl, index) => (
                <div key={index} className="relative group">
                  <img
                    src={imageUrl}
                    alt={`Gallery ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg border border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => removeAdditionalImage(index)}
                    className="absolute inset-0 bg-black bg-opacity-50 rounded-lg opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                  >
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Status */}
      <div className="border-t border-gray-200 pt-6">
        <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
          Status
        </label>
        <select
          id="status"
          {...register('status')}
          className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
          disabled={isSubmitting}
        >
          <option value={BlogStatus.UNPUBLISHED}>Unpublished (Draft)</option>
          <option value={BlogStatus.PUBLISHED}>Published</option>
        </select>
      </div>

      {/* Submit Buttons */}
      <div className="border-t border-gray-200 pt-6 flex gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
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
          {isSubmitting ? 'Saving...' : 'Save Blog'}
        </button>
      </div>
    </form>
  );
}
