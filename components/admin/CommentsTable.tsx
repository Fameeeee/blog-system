'use client';

/**
 * CommentsTable Component
 * 
 * Client component for displaying and managing comments
 * Features:
 * - Display comments in a responsive table
 * - Approve/reject comments with status buttons
 * - Show pagination controls
 * - Link to blog posts with view counts
 */

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import useSWR from 'swr';
import Cookies from 'js-cookie';
import { updateCommentStatus } from '@/lib/services/comment.service';
import { fetchBlogById } from '@/lib/services/blog.service';
import { Comment, CommentStatus, PaginatedCommentsResponse } from '@/lib/types/comment.types';

interface CommentsTableProps {
  comments: PaginatedCommentsResponse;
  currentPage: number;
  limit: number;
  statusFilter?: CommentStatus;
  onRefresh?: () => void;
}

export default function CommentsTable({
  comments,
  currentPage,
  limit,
  statusFilter,
  onRefresh,
}: CommentsTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = Cookies.get('access_token');
  
  const [loadingCommentId, setLoadingCommentId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleStatusChange = async (commentId: string, newStatus: CommentStatus) => {
    setLoadingCommentId(commentId);
    setError(null);

    try {
      await updateCommentStatus(commentId, newStatus, token || undefined);
      
      // Reload the page to refresh comments
      if (onRefresh) {
        onRefresh();
      } else {
        router.refresh();
      }
    } catch (err) {
      console.error('Failed to update comment status:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to update comment status'
      );
    } finally {
      setLoadingCommentId(null);
    }
  };

  const getStatusColor = (status: CommentStatus) => {
    switch (status) {
      case CommentStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800';
      case CommentStatus.APPROVED:
        return 'bg-green-100 text-green-800';
      case CommentStatus.REJECTED:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: CommentStatus) => {
    switch (status) {
      case CommentStatus.PENDING:
        return '⏳ รอการตรวจสอบ';
      case CommentStatus.APPROVED:
        return '✅ อนุมัติแล้ว';
      case CommentStatus.REJECTED:
        return '❌ ปฏิเสธ';
      default:
        return status;
    }
  };

  if (comments.data.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
        <p className="text-gray-600 text-lg">ไม่มีความเห็น</p>
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-lg border border-gray-200">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                ชื่อ
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                ความเห็น
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                บล็อก (View Count)
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                สถานะ
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                วันที่
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                ดำเนินการ
              </th>
            </tr>
          </thead>
          <tbody>
            {comments.data.map((comment: Comment) => (
              <tr
                key={comment.id}
                className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  {comment.senderName}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 max-w-xs">
                  <div className="truncate hover:text-clip" title={comment.content}>
                    {comment.content}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm">
                  <BlogLinkCell blogId={comment.blogId} />
                </td>
                <td className="px-6 py-4 text-sm">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                      comment.status
                    )}`}
                  >
                    {getStatusLabel(comment.status)}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {new Date(comment.createdAt).toLocaleDateString('th-TH')}
                </td>
                <td className="px-6 py-4 text-sm">
                  <div className="flex gap-2">
                    {comment.status !== CommentStatus.APPROVED && (
                      <button
                        onClick={() =>
                          handleStatusChange(
                            comment.id,
                            CommentStatus.APPROVED
                          )
                        }
                        disabled={loadingCommentId === comment.id}
                        className="px-3 py-1 text-xs font-medium text-green-700 bg-green-100 rounded hover:bg-green-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        ✅ อนุมัติ
                      </button>
                    )}
                    {comment.status !== CommentStatus.REJECTED && (
                      <button
                        onClick={() =>
                          handleStatusChange(
                            comment.id,
                            CommentStatus.REJECTED
                          )
                        }
                        disabled={loadingCommentId === comment.id}
                        className="px-3 py-1 text-xs font-medium text-red-700 bg-red-100 rounded hover:bg-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        ❌ ปฏิเสธ
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {comments.meta.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            หน้า {currentPage} จาก {comments.meta.totalPages} ({comments.meta.total}{' '}
            ความเห็น)
          </div>
          <div className="flex gap-2">
            {currentPage > 1 && (
              <Link
                href={`/admin/comments?page=${currentPage - 1}${
                  statusFilter ? `&status=${statusFilter}` : ''
                }`}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                ← ก่อนหน้า
              </Link>
            )}
            {Array.from({ length: comments.meta.totalPages }, (_, i) => i + 1).map(
              (pageNum) => (
                <Link
                  key={pageNum}
                  href={`/admin/comments?page=${pageNum}${
                    statusFilter ? `&status=${statusFilter}` : ''
                  }`}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    pageNum === currentPage
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </Link>
              )
            )}
            {currentPage < comments.meta.totalPages && (
              <Link
                href={`/admin/comments?page=${currentPage + 1}${
                  statusFilter ? `&status=${statusFilter}` : ''
                }`}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                ต่อไป →
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * BlogLinkCell Component
 * 
 * Fetches and displays blog information with view count
 * Shows loading state while fetching
 */
interface BlogLinkCellProps {
  blogId: string;
}

function BlogLinkCell({ blogId }: BlogLinkCellProps) {
  const { data: blog, isLoading, error } = useSWR(
    ['blog', blogId],
    () => fetchBlogById(blogId),
    { revalidateOnFocus: false }
  );

  if (isLoading) {
    return <div className="text-gray-500 text-sm">กำลังโหลด...</div>;
  }

  if (error) {
    console.error('Error fetching blog:', error);
    return <div className="text-red-600 text-sm">ไม่สามารถโหลดได้</div>;
  }

  if (!blog) {
    return <div className="text-gray-500 text-sm">ไม่พบบล็อก</div>;
  }

  console.log('Blog data:', { 
    id: blog.id, 
    title: blog.title, 
    views: blog.viewCount,
    viewsType: typeof blog.viewCount
  });

  return (
    <Link
      href={`/blog/${blog.slug || blog.id}`}
      className="text-blue-600 hover:text-blue-700 underline"
      target="_blank"
      rel="noopener noreferrer"
    >
      <div className="truncate max-w-xs" title={blog.title}>
        {blog.title}
      </div>
      <div className="text-xs text-gray-500 mt-1">
        👁️ {(blog.viewCount ?? 0).toLocaleString()} views
      </div>
    </Link>
  );
}
