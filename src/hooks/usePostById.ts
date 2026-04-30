import { useQuery } from '@tanstack/react-query';
import { socialFeedApi } from '@/services/social';

export const usePostById = (postId: string | undefined) => {
    return useQuery({
        queryKey: ['post', postId],
        queryFn: () => (postId ? socialFeedApi.getPostById(postId) : Promise.reject('No post ID')),
        enabled: !!postId,
    });
};
