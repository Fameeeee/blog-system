'use client';

/**
 * CommentsSection Component
 * 
 * Client component to display approved comments and comment form
 * Gracefully handles missing comment endpoints on the backend
 */

import { useState, useEffect } from 'react';
import { fetchApprovedComments } from '@/lib/services/comment.service';
import { Comment } from '@/lib/types/comment.types';
import CommentForm from './CommentForm';

interface CommentsSectionProps {
  blogId: string;
}

export default function CommentsSection({ blogId }: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadComments = async () => {
      try {
        const response = await fetchApprovedComments(blogId, { limit: 50 });
        setComments(response.data);
      } catch (err) {
        console.error('Failed to load comments:', err);
        setError(err instanceof Error ? err.message : 'Failed to load comments');
      } finally {
        setLoading(false);
      }
    };

    loadComments();
  }, [blogId]);

  const handleCommentSubmitted = () => {
    // Reload comments when a new comment is submitted
    const loadComments = async () => {
      try {
        const response = await fetchApprovedComments(blogId, { limit: 50 });
        setComments(response.data);
      } catch (err) {
        console.error('Failed to reload comments:', err);
      }
    };

    loadComments();
  };

  return (
    <div className="space-y-8">
      {/* Comment Form */}
      <CommentForm blogId={blogId} onSuccess={handleCommentSubmitted} />

      {/* Comments List */}
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-6">
          💬 ความเห็นจากผู้อ่าน ({comments.length})
        </h3>

        {loading && (
          <div className="text-center py-8">
            <svg
              className="animate-spin h-8 w-8 text-blue-600 mx-auto"
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
            <p className="text-gray-600 mt-2">กำลังโหลดความเห็น...</p>
          </div>
        )}

        {error && !loading && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-amber-800 text-sm">
              ⚠️ ไม่สามารถโหลดความเห็น (บริการอาจยังไม่พร้อม)
            </p>
          </div>
        )}

        {!loading && comments.length === 0 && !error && (
          <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-gray-600">ยังไม่มีความเห็นที่ได้รับการอนุมัติ</p>
          </div>
        )}

        {comments.length > 0 && (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div
                key={comment.id}
                className="bg-white rounded-lg border border-gray-200 p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-900">
                    {comment.senderName}
                  </h4>
                  <p className="text-xs text-gray-500">
                    {new Date(comment.createdAt).toLocaleDateString('th-TH')}
                  </p>
                </div>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {comment.content}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
