import { apiClient } from '@/services/axios';
import type { SharePostPayload, SharePostResponse, ShareStreamEvent } from '@/types';

export const shareApi = {
  sharePost: (postId: string, payload: SharePostPayload): Promise<SharePostResponse> => {
    return apiClient
      .post<SharePostResponse>(`/posts/${postId}/shares`, payload)
      .then((res) => res.data);
  },

  subscribeToShareStream: (postId: string, onEvent: (event: ShareStreamEvent) => void, onError?: (error: Error) => void): (() => void) => {
    const eventSource = new EventSource(`/api/posts/${postId}/shares/stream`);

    eventSource.addEventListener('share', (event: Event) => {
      try {
        if (event instanceof MessageEvent) {
          const data = JSON.parse(event.data) as ShareStreamEvent;
          onEvent(data);
        }
      } catch (error) {
        console.error('Failed to parse share event:', error);
        onError?.(error instanceof Error ? error : new Error('Unknown error'));
      }
    });

    eventSource.onerror = () => {
      console.warn('SSE connection lost, will auto-reconnect...');
      onError?.(new Error('SSE connection lost'));
    };

    return () => {
      eventSource.close();
    };
  },
};
