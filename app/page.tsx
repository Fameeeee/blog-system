/**
 * Blog List Page
 * 
 * Server Component for displaying published blog posts
 * Features:
 * - SEO optimized
 * - Fetches published blogs from API
 * - Search and pagination support
 * - Responsive grid layout
 */

import { Metadata } from 'next';
import Link from 'next/link';
import { fetchBlogs } from '@/lib/services/blog.service';
import { BlogStatus } from '@/lib/types/blog.types';
import SearchBar from '@/components/SearchBar';

interface BlogListPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
  }>;
}

export const metadata: Metadata = {
  title: 'Blog - ยินดีต้อนรับสู่บล็อก',
  description: 'อ่านบทความและเรียนรู้เรื่องราวที่น่าสนใจต่าง ๆ',
  openGraph: {
    title: 'Blog - ยินดีต้อนรับสู่บล็อก',
    description: 'อ่านบทความและเรียนรู้เรื่องราวที่น่าสนใจต่าง ๆ',
    type: 'website',
  },
};

export default async function BlogListPage({ searchParams }: BlogListPageProps) {
  const params = await searchParams;
  const page = parseInt(params.page || '1', 10);
  const search = params.search || '';

  try {
    // Fetch published blogs from API
    const response = await fetchBlogs({
      page,
      limit: 10,
      status: BlogStatus.PUBLISHED,
      search: search || undefined,
    });

    const { data: blogsData, meta } = response;

    // Safety filter: ensure only PUBLISHED blogs are shown on public page
    const blogs = blogsData.filter(blog => blog.status === BlogStatus.PUBLISHED);

    // Calculate pagination info
    const pageNumbers = Array.from(
      { length: meta.totalPages },
      (_, i) => i + 1
    );

    return (
      <div className="min-h-screen bg-gray-50 text-black">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              📚 บล็อก
            </h1>
            <p className="text-gray-600">
              อ่านบทความและเรียนรู้เรื่องราวที่น่าสนใจต่าง ๆ
            </p>
          </div>
        </div>

        {/* Search Section */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <SearchBar />
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Results Info */}
          {search && (
            <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-900">
                ผลการค้นหาสำหรับ: <strong>{search}</strong> ({meta.total} บทความ)
              </p>
            </div>
          )}

          {/* Blog Grid */}
          {blogs.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {blogs.map((blog) => (
                  <Link
                    key={blog.id}
                    href={`/blog/${blog.slug || blog.id}`}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300"
                  >
                    {/* Cover Image */}
                    {(blog.coverImageUrl || blog.featuredImage) && (
                      <div className="relative w-full h-48 bg-gray-200">
                        <img
                          src={blog.coverImageUrl || blog.featuredImage}
                          alt={blog.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {/* Card Content */}
                    <div className="p-4">
                      {/* Title */}
                      <h3 className="text-lg font-bold text-gray-900 line-clamp-2 mb-2">
                        {blog.title}
                      </h3>

                      {/* Excerpt */}
                      <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                        {blog.excerpt}
                      </p>

                      {/* Meta Info */}
                      <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-200">
                        <span>
                          👁️ {(blog.viewCount ?? 0).toLocaleString()}
                        </span>
                        <span>
                          📅 {new Date(blog.createdAt).toLocaleDateString('th-TH')}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              <div className="flex justify-center items-center gap-2 flex-wrap">
                {/* Previous Button */}
                {page > 1 && (
                  <Link
                    href={`/?page=${page - 1}${search ? `&search=${search}` : ''}`}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    ← ก่อนหน้า
                  </Link>
                )}

                {/* Page Numbers */}
                {pageNumbers.map((pageNum) => (
                  <Link
                    key={pageNum}
                    href={`/?page=${pageNum}${search ? `&search=${search}` : ''}`}
                    className={`px-3 py-2 rounded-lg transition-colors ${
                      pageNum === page
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {pageNum}
                  </Link>
                ))}

                {/* Next Button */}
                {page < meta.totalPages && (
                  <Link
                    href={`/?page=${page + 1}${search ? `&search=${search}` : ''}`}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    ถัดไป →
                  </Link>
                )}
              </div>
            </>
          ) : (
            /* Empty State */
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">
                {search
                  ? `ไม่พบบทความที่ตรงกับการค้นหา "${search}"`
                  : 'ยังไม่มีบทความที่เผยแพร่'}
              </p>
              {search && (
                <Link
                  href="/"
                  className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  ดูบทความทั้งหมด
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    );
  } catch (error) {
    console.error('Failed to fetch blogs:', error);

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            ⚠️ เกิดข้อผิดพลาด
          </h2>
          <p className="text-gray-600 mb-6">
            ไม่สามารถโหลดบทความได้ กรุณาลองใหม่อีกครั้ง
          </p>
          <Link
            href="/"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            กลับไปหน้าแรก
          </Link>
        </div>
      </div>
    );
  }
}
