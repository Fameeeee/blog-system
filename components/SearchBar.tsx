'use client';

/**
 * SearchBar Component
 * 
 * Client component for searching blogs
 * Updates URL query parameters on search
 */

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('search') || '');

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Update URL with search query
    const params = new URLSearchParams();
    if (query.trim()) {
      params.set('search', query.trim());
    }
    params.set('page', '1'); // Reset to first page on search

    router.push(`/?${params.toString()}`);
  };

  const handleClear = () => {
    setQuery('');
    router.push('/');
  };

  return (
    <form onSubmit={handleSearch} className="w-full max-w-2xl mx-auto">
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ค้นหาบทความ..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          />
        </div>
        <button
          type="submit"
          className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          🔍 ค้นหา
        </button>
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="px-4 py-3 bg-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-400 transition-colors"
          >
            ❌
          </button>
        )}
      </div>
    </form>
  );
}
