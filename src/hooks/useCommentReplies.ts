import { useQuery } from '@tanstack/react-query';
import { commentApi } from '@/services';
import { useMemo } from 'react';

export const useCommentReplies = (commentId: string, enabled: boolean = false) => {
    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ['comment-replies', commentId],
        queryFn: () => commentApi.getCommentReplies(commentId),
        enabled: enabled && !!commentId,
    });

    const replies = useMemo(() => {
        if (!data) return [];

        console.log(`[useCommentReplies] Raw data for comment ${commentId}:`, data);

        const res = data as any;

        const findReplies = (obj: any): any[] | null => {
            if (!obj) return null;
            if (Array.isArray(obj)) return obj;
            if (obj.edges && Array.isArray(obj.edges)) return obj.edges.map((e: any) => e.node);
            if (obj.data) return findReplies(obj.data);
            if (obj.items) return findReplies(obj.items);
            return null;
        };

        const result = findReplies(res);
        if (result) {
            console.log(`[useCommentReplies] Found ${result.length} replies for ${commentId}`);
            return result;
        }

        console.warn(`[useCommentReplies] No replies found in data structure for ${commentId}`);
        return [];
    }, [data, commentId]);

    return {
        replies,
        isLoading,
        isError,
        refetch,
        totalCount: (data as any)?.totalCount || replies.length,
    };
};
