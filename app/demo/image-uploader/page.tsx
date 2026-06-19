'use client';

/**
 * Demo Page - ImageUploader Component
 * Navigate to: http://localhost:3000/demo/image-uploader
 */

import { useState } from 'react';
import ImageUploader from '@/components/ImageUploader';

export default function ImageUploaderDemo() {
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [currentImageUrl, setCurrentImageUrl] = useState<string>('');

  const handleUploadSuccess = (imageUrl: string) => {
    console.log('✅ Image uploaded successfully:', imageUrl);
    setCurrentImageUrl(imageUrl);
    setUploadedUrls(prev => [...prev, imageUrl]);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('คัดลอก URL แล้ว!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            📸 ImageUploader Component Demo
          </h1>
          <p className="text-gray-600">
            Production-ready image uploader with client-side validation
          </p>
        </div>

        {/* Main Demo Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            Upload Image
          </h2>
          
          <ImageUploader onUploadSuccess={handleUploadSuccess} />

          {/* Current Upload Result */}
          {currentImageUrl && (
            <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
              <h3 className="text-lg font-semibold text-green-900 mb-3">
                🎉 Latest Upload
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between bg-white p-3 rounded-lg">
                  <code className="text-sm text-gray-700 break-all flex-1">
                    {currentImageUrl}
                  </code>
                  <button
                    onClick={() => copyToClipboard(currentImageUrl)}
                    className="ml-3 px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                  >
                    📋 Copy
                  </button>
                </div>

                <div className="bg-white p-4 rounded-lg">
                  <img
                    src={currentImageUrl}
                    alt="Latest upload"
                    className="max-w-full max-h-96 mx-auto rounded-lg shadow-md"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Upload History */}
        {uploadedUrls.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              📚 Upload History ({uploadedUrls.length})
            </h2>
            
            <div className="space-y-4">
              {uploadedUrls.map((url, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-4 flex-1">
                    <span className="text-sm font-medium text-gray-500 bg-white px-3 py-1 rounded-full">
                      #{uploadedUrls.length - index}
                    </span>
                    <code className="text-sm text-gray-700 break-all">
                      {url}
                    </code>
                  </div>
                  <button
                    onClick={() => copyToClipboard(url)}
                    className="ml-3 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                  >
                    📋
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                setUploadedUrls([]);
                setCurrentImageUrl('');
              }}
              className="mt-6 w-full px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-medium"
            >
              🗑️ Clear History
            </button>
          </div>
        )}

        {/* Features List */}
        <div className="mt-8 bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            ✨ Features
          </h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-start space-x-3">
              <span className="text-2xl">🛡️</span>
              <div>
                <h3 className="font-semibold text-gray-900">Client-Side Validation</h3>
                <p className="text-sm text-gray-600">File size & MIME type checked before upload</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <span className="text-2xl">👁️</span>
              <div>
                <h3 className="font-semibold text-gray-900">Image Preview</h3>
                <p className="text-sm text-gray-600">Instant preview with memory cleanup</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <span className="text-2xl">⚡</span>
              <div>
                <h3 className="font-semibold text-gray-900">Loading States</h3>
                <p className="text-sm text-gray-600">Visual feedback during upload</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <span className="text-2xl">🚨</span>
              <div>
                <h3 className="font-semibold text-gray-900">Error Handling</h3>
                <p className="text-sm text-gray-600">Clear Thai error messages</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <span className="text-2xl">🔒</span>
              <div>
                <h3 className="font-semibold text-gray-900">JWT Authentication</h3>
                <p className="text-sm text-gray-600">Secure token-based uploads</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <span className="text-2xl">🎨</span>
              <div>
                <h3 className="font-semibold text-gray-900">Tailwind Styled</h3>
                <p className="text-sm text-gray-600">Beautiful, responsive design</p>
              </div>
            </div>
          </div>
        </div>

        {/* Technical Info */}
        <div className="mt-8 bg-gray-900 rounded-2xl shadow-xl p-8 text-white">
          <h2 className="text-2xl font-semibold mb-6">🔧 Technical Details</h2>
          
          <div className="space-y-4 font-mono text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-400 mb-1">Max File Size:</p>
                <p className="text-green-400">5 MB</p>
              </div>
              <div>
                <p className="text-gray-400 mb-1">Allowed Types:</p>
                <p className="text-green-400">JPEG, PNG, WebP</p>
              </div>
              <div>
                <p className="text-gray-400 mb-1">API Endpoint:</p>
                <p className="text-green-400">POST /upload</p>
              </div>
              <div>
                <p className="text-gray-400 mb-1">Authentication:</p>
                <p className="text-green-400">JWT Bearer Token</p>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-700">
              <p className="text-gray-400 mb-2">Component Location:</p>
              <code className="text-blue-400">components/ImageUploader.tsx</code>
            </div>

            <div>
              <p className="text-gray-400 mb-2">Service Location:</p>
              <code className="text-blue-400">lib/services/upload.service.ts</code>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-600 text-sm">
          <p>Built with Next.js 15, TypeScript, and Tailwind CSS</p>
          <p className="mt-2">
            📚 See{' '}
            <code className="bg-gray-200 px-2 py-1 rounded text-xs">
              components/IMAGE_UPLOADER_USAGE.md
            </code>
            {' '}for integration guide
          </p>
        </div>
      </div>
    </div>
  );
}
