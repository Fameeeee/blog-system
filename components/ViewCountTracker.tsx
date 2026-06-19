'use client';

/**
 * ViewCountTracker Component
 * 
 * Client component that tracks blog views by making a POST request
 * on component mount. Does not block page render.
 * 
 * Silently fails if endpoint not available - designed to be non-blocking.
 */

import { useEffect } from 'react';
import { trackBlogView } from '@/lib/services/comment.service';

interface ViewCountTrackerProps {
  blogId: string;
}

export default function ViewCountTracker({ blogId }: ViewCountTrackerProps) {
  useEffect(() => {
    // Track view on component mount (non-blocking)
    const trackView = async () => {
      try {
        await trackBlogView(blogId);
      } catch (error) {
        // Silently fail - this component should never break the user experience
        // Common reasons for failure:
        // - Endpoint not implemented on backend
        // - Network issues
        // - Backend is down
        console.debug('View tracking not available or failed silently', error);
      }
    };

    // Use setTimeout to ensure this runs after page render completes
    const timeoutId = setTimeout(trackView, 100);
    
    return () => clearTimeout(timeoutId);
  }, [blogId]);

  // This component renders nothing
  return null;
}
