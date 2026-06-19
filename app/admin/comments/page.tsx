/**
 * Admin Comments Management Page
 * 
 * Client Component for managing blog comments
 * Features:
 * - List all comments with pagination
 * - Filter by status (PENDING, APPROVED, REJECTED)
 * - View comment details with blog link
 * - Approve/reject comments
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import useSWR from 'swr';
import Cookies from 'js-cookie';
import { fetchAllComments } from '@/lib/services/comment.service';
import { CommentStatus } from '@/lib/types/comment.types';
import { logout } from '@/lib/services/auth.service';
import CommentsTable from '@/components/admin/CommentsTable';

export default function CommentsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '20', 10);
  const statusFilter = searchParams.get('status') as CommentStatus | null;

  // Get token from cookies and redirect if not authenticated
  useEffect(() => {
    const accessToken = Cookies.get('access_token');
    setToken(accessToken || null);
    setMounted(true);

    if (!accessToken) {
      logout();
      router.push('/admin/login');
    }
  }, [router]);

  // Fetch comments with SWR
  const {
    data: comments,
    error,
    isLoading,
    mutate,
  } = useSWR(
    token ? ['comments', { page, limit, status: statusFilter }] : null,
    () => fetchAllComments({ page, limit, status: statusFilter || undefined }, token || undefined),
    {
      revalidateOnFocus: false,
      onError: (err) => {
        if (err instanceof Error && err.message.includes('401')) {
          logout();
          router.push('/admin/login');
        }
      },
    }
  );

  if (!mounted || !token) {
    return <div>กำลังตรวจสอบการเข้าถึง...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 text-black">
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
                  className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  📝 บทความ
                </Link>
                <Link
                  href="/admin/comments"
                  className="px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg"
                >
                  💬 ความเห็น
                </Link>
              </nav>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Admin</span>
              <button
                onClick={() => {
                  logout();
                  router.push('/admin/login');
                }}
                className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
              >
                ออกจากระบบ
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">💬 ความเห็นของผู้อ่าน</h2>
          <p className="text-gray-600 mt-1">
            จัดการความเห็นและอนุมัติหรือปฏิเสธความเห็นใหม่
          </p>
        </div>

        {/* Status Filter Tabs */}
        <div className="mb-6 flex gap-2 flex-wrap">
          <Link
            href="/admin/comments"
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              !statusFilter
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            ทั้งหมด
          </Link>
          <Link
            href="/admin/comments?status=PENDING"
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              statusFilter === CommentStatus.PENDING
                ? 'bg-yellow-600 text-white'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            ⏳ รอการตรวจสอบ
          </Link>
          <Link
            href="/admin/comments?status=APPROVED"
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              statusFilter === CommentStatus.APPROVED
                ? 'bg-green-600 text-white'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            ✅ อนุมัติแล้ว
          </Link>
          <Link
            href="/admin/comments?status=REJECTED"
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              statusFilter === CommentStatus.REJECTED
                ? 'bg-red-600 text-white'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            ❌ ปฏิเสธ
          </Link>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block">
              <svg
                className="animate-spin h-8 w-8 text-blue-600"
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
              <p className="text-gray-600 mt-3">กำลังโหลดความเห็น...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 font-medium">⚠️ เกิดข้อผิดพลาด</p>
            <p className="text-red-700 text-sm mt-1">
              {error instanceof Error ? error.message : 'ไม่สามารถโหลดความเห็นได้'}
            </p>
          </div>
        )}

        {/* Comments Table */}
        {comments && !isLoading && (
          <CommentsTable
            comments={comments}
            currentPage={page}
            limit={limit}
            statusFilter={statusFilter}
            onRefresh={() => mutate()}
          />
        )}
      </div>
    </div>
  );
}
