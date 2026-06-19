'use client';

/**
 * Admin Dashboard Page
 * 
 * Features:
 * - SWR for data fetching with caching
 * - Responsive data table with blog management
 * - Pagination controls
 * - Toggle status (PUBLISHED/UNPUBLISHED)
 * - Edit and Delete actions
 * - Custom confirmation modal
 * - 401 error handling with auto-redirect
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import useSWR from 'swr';
import { logout } from '@/lib/services/auth.service';
import {
  fetchBlogs,
  toggleBlogStatus,
  deleteBlog,
  UnauthorizedError,
} from '@/lib/services/blog.service';
import { Blog, BlogStatus } from '@/lib/types/blog.types';
import ConfirmationModal from '@/components/ConfirmationModal';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [blogToDelete, setBlogToDelete] = useState<Blog | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const limit = 10;

  // SWR for data fetching with automatic caching and revalidation
  const {
    data: blogsData,
    error,
    isLoading,
    mutate,
  } = useSWR(
    [`/blogs`, { page: currentPage, limit }],
    ([_, params]) => fetchBlogs(params),
    {
      revalidateOnFocus: false,
      onError: (err) => {
        // Handle 401 Unauthorized - clear token and redirect to login
        if (err instanceof UnauthorizedError) {
          logout();
          router.push('/admin/login');
        }
      },
    }
  );

  const blogs = blogsData?.data || [];
  const meta = blogsData?.meta;

  /**
   * Handle logout
   */
  const handleLogout = () => {
    logout();
    router.push('/admin/login');
  };

  /**
   * Handle status toggle with optimistic update
   */
  const handleToggleStatus = async (blog: Blog) => {
    try {
      // Optimistic update
      const optimisticData = {
        ...blogsData,
        data: blogs.map((b) =>
          b.id === blog.id
            ? {
                ...b,
                status:
                  b.status === BlogStatus.PUBLISHED
                    ? BlogStatus.UNPUBLISHED
                    : BlogStatus.PUBLISHED,
              }
            : b
        ),
      };

      // Update UI immediately
      mutate(optimisticData, false);

      // Make API call
      await toggleBlogStatus(blog.id, blog.status);

      // Revalidate data
      mutate();
    } catch (err) {
      // Revert on error
      mutate();

      if (err instanceof UnauthorizedError) {
        logout();
        router.push('/admin/login');
      } else {
        alert(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด');
      }
    }
  };

  /**
   * Open delete confirmation modal
   */
  const openDeleteModal = (blog: Blog) => {
    setBlogToDelete(blog);
    setDeleteModalOpen(true);
  };

  /**
   * Handle blog deletion
   */
  const handleDelete = async () => {
    if (!blogToDelete) return;

    setIsDeleting(true);

    try {
      await deleteBlog(blogToDelete.id);

      // Close modal
      setDeleteModalOpen(false);
      setBlogToDelete(null);

      // Refresh data
      mutate();
    } catch (err) {
      if (err instanceof UnauthorizedError) {
        logout();
        router.push('/admin/login');
      } else {
        alert(err instanceof Error ? err.message : 'ไม่สามารถลบบทความได้');
      }
    } finally {
      setIsDeleting(false);
    }
  };

  /**
   * Format date to Thai format
   */
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Blog Admin
              </h1>
              <nav className="flex space-x-4">
                <Link
                  href="/admin/dashboard"
                  className="px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg"
                >
                  บทความ
                </Link>
              </nav>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Admin</span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
              >
                ออกจากระบบ
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">จัดการบทความ</h2>
              <p className="text-gray-600 mt-1">
                {meta ? `ทั้งหมด ${meta.total} บทความ` : 'กำลังโหลด...'}
              </p>
            </div>
            <Link
              href="/admin/blogs/create"
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center space-x-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span>สร้างบทความใหม่</span>
            </Link>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center">
                <svg
                  className="animate-spin h-10 w-10 text-blue-600"
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
                <p className="mt-4 text-gray-600">กำลังโหลดข้อมูล...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <svg
                  className="mx-auto h-12 w-12 text-red-500"
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
                <h3 className="mt-2 text-lg font-medium text-gray-900">
                  เกิดข้อผิดพลาด
                </h3>
                <p className="mt-1 text-sm text-gray-600">
                  {error.message || 'ไม่สามารถโหลดข้อมูลได้'}
                </p>
                <button
                  onClick={() => mutate()}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  ลองอีกครั้ง
                </button>
              </div>
            </div>
          ) : blogs.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <h3 className="mt-2 text-lg font-medium text-gray-900">
                  ยังไม่มีบทความ
                </h3>
                <p className="mt-1 text-sm text-gray-600">
                  เริ่มต้นสร้างบทความแรกของคุณ
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        รูปภาพ
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        หัวข้อ
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        สถานะ
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        จำนวนผู้เข้าชม
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        วันที่
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        การจัดการ
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {blogs.map((blog) => (
                      <tr key={blog.id} className="hover:bg-gray-50">
                        {/* Cover Image */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          {blog.featuredImage ? (
                            <img
                              src={blog.featuredImage}
                              alt={blog.title}
                              className="h-12 w-12 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center">
                              <svg
                                className="h-6 w-6 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                              </svg>
                            </div>
                          )}
                        </td>

                        {/* Title */}
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {blog.title}
                          </div>
                          <div className="text-sm text-gray-500 truncate max-w-md">
                            {blog.content.substring(0, 60)}...
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleToggleStatus(blog)}
                            className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              blog.status === BlogStatus.PUBLISHED
                                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                            } transition-colors`}
                          >
                            {blog.status === BlogStatus.PUBLISHED
                              ? 'เผยแพร่แล้ว'
                              : 'ยังไม่เผยแพร่'}
                          </button>
                        </td>

                        {/* Views */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center">
                            <svg
                              className="h-4 w-4 mr-1 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                            {blog.views.toLocaleString()}
                          </div>
                        </td>

                        {/* Date */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(blog.createdAt)}
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            {/* Edit Button */}
                            <Link
                              href={`/admin/blogs/${blog.id}/edit`}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="แก้ไข"
                            >
                              <svg
                                className="h-5 w-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                />
                              </svg>
                            </Link>

                            {/* Delete Button */}
                            <button
                              onClick={() => openDeleteModal(blog)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="ลบ"
                            >
                              <svg
                                className="h-5 w-5"
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
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {meta && meta.totalPages > 1 && (
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      แสดง {(currentPage - 1) * limit + 1} -{' '}
                      {Math.min(currentPage * limit, meta.total)} จากทั้งหมด{' '}
                      {meta.total} รายการ
                    </div>

                    <div className="flex items-center space-x-2">
                      {/* Previous Button */}
                      <button
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        ← ก่อนหน้า
                      </button>

                      {/* Page Numbers */}
                      <div className="flex items-center space-x-1">
                        {Array.from({ length: meta.totalPages }, (_, i) => i + 1)
                          .filter((page) => {
                            // Show first, last, current, and adjacent pages
                            return (
                              page === 1 ||
                              page === meta.totalPages ||
                              Math.abs(page - currentPage) <= 1
                            );
                          })
                          .map((page, index, array) => {
                            // Add ellipsis
                            const showEllipsisBefore =
                              index > 0 && page - array[index - 1] > 1;

                            return (
                              <div key={page} className="flex items-center">
                                {showEllipsisBefore && (
                                  <span className="px-2 text-gray-400">...</span>
                                )}
                                <button
                                  onClick={() => setCurrentPage(page)}
                                  className={`px-3 py-1 text-sm font-medium rounded-lg transition-colors ${
                                    currentPage === page
                                      ? 'bg-blue-600 text-white'
                                      : 'text-gray-700 hover:bg-gray-100'
                                  }`}
                                >
                                  {page}
                                </button>
                              </div>
                            );
                          })}
                      </div>

                      {/* Next Button */}
                      <button
                        onClick={() =>
                          setCurrentPage((p) => Math.min(meta.totalPages, p + 1))
                        }
                        disabled={currentPage === meta.totalPages}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        ถัดไป →
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        title="ยืนยันการลบบทความ"
        message={`คุณแน่ใจหรือไม่ที่จะลบบทความ "${blogToDelete?.title}"? การลบนี้ไม่สามารถย้อนกลับได้`}
        confirmLabel="ลบบทความ"
        cancelLabel="ยกเลิก"
        onConfirm={handleDelete}
        onCancel={() => {
          setDeleteModalOpen(false);
          setBlogToDelete(null);
        }}
        isDangerous={true}
        isLoading={isDeleting}
      />
    </div>
  );
}
