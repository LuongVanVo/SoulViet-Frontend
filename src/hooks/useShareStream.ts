import { useEffect, useState } from 'react';
import { shareApi } from '@/services/social';
import type { ShareStreamEvent } from '@/types';

export const useShareStream = (postId: string | null) => {
  const [shareCount, setShareCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!postId) {
      return;
    }

    setIsConnected(true);
    setError(null);

    const handleShareEvent = (event: ShareStreamEvent) => {
      setShareCount(event.sharesCount);
    };

    const handleError = (err: Error) => {
      setError(err);
      console.error('Share stream error:', err);
      // Auto-reconnect after 5 seconds
      setTimeout(() => {
        if (postId) {
          // Recreate the connection
          const unsubscribe = shareApi.subscribeToShareStream(postId, handleShareEvent, handleError);
          return unsubscribe;
        }
      }, 5000);
    };

    const unsubscribe = shareApi.subscribeToShareStream(postId, handleShareEvent, handleError);

    return () => {
      setIsConnected(false);
      unsubscribe();
    };
  }, [postId]);

  return {
    shareCount,
    isConnected,
    error,
  };
};
