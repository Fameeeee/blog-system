/**
 * Blog Detail Page
 * 
 * Server Component for displaying individual blog posts
 * Features:
 * - SEO optimized (metadata generated from blog data)
 * - Displays blog content with cover image
 * - Shows additional images in grid layout
 * - Integrated comments section
 * - View count tracking (non-blocking via ViewCountTracker)
 */

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { fetchBlogBySlug } from '@/lib/services/blog.service';
import ViewCountTracker from '@/components/ViewCountTracker';
import CommentsSection from '@/components/CommentsSection';

interface BlogDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: BlogDetailPageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const blog = await fetchBlogBySlug(slug);

    return {
      title: blog.title,
      description: blog.excerpt || blog.content.substring(0, 160),
      openGraph: {
        title: blog.title,
        description: blog.excerpt || blog.content.substring(0, 160),
        type: 'article',
        images: blog.coverImageUrl ? [{ url: blog.coverImageUrl }] : [],
      },
      alternates: {
        canonical: `/blog/${blog.slug || slug}`,
      },
    };
  } catch (error) {
    return {
      title: 'Blog Post',
      description: 'Read this blog post',
    };
  }
}

export default async function BlogDetailPage({
  params,
}: BlogDetailPageProps) {
  const { slug } = await params;

  try {
    const blog = await fetchBlogBySlug(slug);
    
    console.log('Blog detail page:', { 
      id: blog.id, 
      title: blog.title, 
      views: blog.viewCount,
      viewsType: typeof blog.viewCount
    });

    return (
      <div className="min-h-screen bg-gray-50 text-black">
        {/* View Count Tracker (non-blocking) */}
        <ViewCountTracker blogId={blog.id} />

        {/* Header with Back Button */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <Link
              href="/"
              className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
            >
              ← กลับไปหน้าบล็อก
            </Link>
          </div>
        </div>

        {/* Cover Image */}
        {(blog.coverImageUrl || blog.featuredImage) && (
          <div className="w-full h-96 bg-gray-200 overflow-hidden">
            <img
              src={blog.coverImageUrl || blog.featuredImage}
              alt={blog.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Article Content */}
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Title and Meta */}
          <header className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {blog.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 pb-6 border-b border-gray-200">
              <span>📅 {new Date(blog.createdAt).toLocaleDateString('th-TH')}</span>
                <span>👁️ {(blog.viewCount ?? 0).toLocaleString()} views</span>
              {blog.author && (
                <span>✍️ โดย {blog.author.name}</span>
              )}
            </div>
          </header>

          {/* Excerpt */}
          {blog.excerpt && (
            <div className="mb-8 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
              <p className="text-lg text-gray-700 italic">
                {blog.excerpt}
              </p>
            </div>
          )}

          {/* Content */}
          <div className="prose prose-lg max-w-none mb-12 text-gray-700 leading-relaxed">
            {blog.content.split('\n').map((paragraph, index) => (
              <p key={index} className="mb-4">
                {paragraph}
              </p>
            ))}
          </div>

          {/* Additional Images Gallery */}
          {blog.images && blog.images.length > 0 && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                📸 แกลลอรี่
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {blog.images.slice(0, 6).map((image, index) => (
                  <div
                    key={image.id}
                    className="relative w-full h-64 bg-gray-200 rounded-lg overflow-hidden group cursor-pointer"
                  >
                    <img
                      src={image.imageUrl}
                      alt={`Gallery ${index + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Divider */}
          <hr className="my-12 border-gray-200" />

          {/* Comments Section */}
          <CommentsSection blogId={blog.id} />
        </article>
      </div>
    );
  } catch (error) {
    console.error('Failed to fetch blog:', error);

    // Return 404 if blog not found
    if (error instanceof Error && error.message.includes('Not Found')) {
      notFound();
    }

    // Return error page for other errors
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
            กลับไปหน้าบล็อก
          </Link>
        </div>
      </div>
    );
  }
}
