import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { shareApi } from '@/services/social';
import type { SharePostPayload } from '@/types';

export const useSharePost = () => {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async ({ postId, payload }: { postId: string; payload: SharePostPayload }) => {
      return shareApi.sharePost(postId, payload);
    },
    onSuccess: () => {
      setError(null);
      queryClient.invalidateQueries({ queryKey: ['socialPosts'] });
      queryClient.invalidateQueries({ queryKey: ['user-posts'] });
    },
    onError: (err: Error) => {
      const errorMessage = err.message || 'Failed to share post';
      setError(errorMessage);
      console.error('Share post error:', err);
    },
  });

  return {
    sharePost: mutation.mutate,
    sharePostAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error,
    data: mutation.data,
    isSuccess: mutation.isSuccess,
  };
};
