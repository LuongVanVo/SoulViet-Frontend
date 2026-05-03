import { useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { commentApi } from '@/services';
import type { CreateCommentPayload, PostComment } from '@/types';
import { useAuthStore } from '@/store';

export const usePostComments = (postId: string, includeReplies: boolean = false) => {
    const queryClient = useQueryClient();
    const currentUser = useAuthStore((state) => state.user);

    const { data, isLoading, isError } = useQuery({
        queryKey: ['post-comments', postId, includeReplies],
        queryFn: () => commentApi.getPostComments(postId, {
            includeReplies,
            IncludeReplies: includeReplies
        }),
        enabled: !!postId,
        refetchInterval: 30000,
        refetchOnWindowFocus: true,
    });

    useEffect(() => {
    }, [data, postId]);

    const createCommentMutation = useMutation({
        mutationFn: (payload: CreateCommentPayload) => commentApi.createComment(payload),
        onSuccess: (createdComment: PostComment) => {
            if (createdComment.parentCommentId) {
                queryClient.setQueryData(['post-comments', postId, includeReplies], (old: any) => {
                    const isPaginated = old && !Array.isArray(old) && (old.edges || old.totalCount !== undefined);

                    const mergeReplies = (comments: any[]): any[] => {
                        return comments.map(c => {
                            if (c.id === createdComment.parentCommentId) {
                                const existingReplies = (c.replies || []).filter((r: any) => !r.id.toString().startsWith('temp-'));
                                return {
                                    ...c,
                                    repliesCount: (c.repliesCount || 0) + 1,
                                    replies: [createdComment, ...existingReplies]
                                };
                            }
                            if (c.replies && c.replies.length > 0) {
                                return { ...c, replies: mergeReplies(c.replies) };
                            }
                            return c;
                        });
                    };

                    if (isPaginated) {
                        return {
                            ...old,
                            edges: old.edges.map((edge: any) => ({
                                ...edge,
                                node: mergeReplies([edge.node])[0]
                            }))
                        };
                    }

                    return mergeReplies(Array.isArray(old) ? old : []);
                });

                queryClient.setQueryData(['comment-replies', createdComment.parentCommentId], (old: any) => {
                    if (!old) return { edges: [{ node: createdComment, cursor: createdComment.id }], pageInfo: { hasNextPage: false }, totalCount: 1 };

                    const isPaginated = old.edges !== undefined;
                    if (isPaginated) {
                        const existingEdges = old.edges.filter((e: any) => !e.node.id.toString().startsWith('temp-'));
                        return {
                            ...old,
                            edges: [{ node: createdComment, cursor: createdComment.id }, ...existingEdges],
                            totalCount: (old.totalCount || 0) + 1
                        };
                    }

                    const existingArray = (Array.isArray(old) ? old : []).filter((r: any) => !r.id.toString().startsWith('temp-'));
                    return [createdComment, ...existingArray];
                });

                return;
            }

            queryClient.setQueryData(['post-comments', postId, includeReplies], (old: any) => {
                const isPaginated = old && !Array.isArray(old) && (old.edges || old.totalCount !== undefined);

                if (isPaginated) {
                    const existingEdges = (old.edges || []).filter((e: any) => !e.node.id.toString().startsWith('temp-'));
                    return {
                        ...old,
                        edges: [{ node: createdComment, cursor: createdComment.id }, ...existingEdges],
                        totalCount: (old.totalCount || 0) + 1,
                    };
                }

                const existingArray = (Array.isArray(old) ? old : []).filter((c: any) => !c.id.toString().startsWith('temp-'));
                return [createdComment, ...existingArray];
            });

            queryClient.invalidateQueries({ queryKey: ['post', postId] });
            queryClient.invalidateQueries({ queryKey: ['socialPosts'] });
            queryClient.invalidateQueries({ queryKey: ['user-posts'] });
            queryClient.invalidateQueries({ queryKey: ['userPosts'] });
        },
        onMutate: async (newCommentPayload) => {
            await queryClient.cancelQueries({ queryKey: ['post-comments', postId, includeReplies] });
            const previousComments = queryClient.getQueryData(['post-comments', postId, includeReplies]);

            const optimisticComment: PostComment = {
                id: `temp-${Date.now()}`,
                postId,
                userId: currentUser?.id || '',
                content: newCommentPayload.content,
                fullName: currentUser?.name || 'User',
                avatarUrl: currentUser?.avatarUrl,
                createdAt: new Date().toISOString(),
                repliesCount: 0,
            };

            queryClient.setQueryData(['post-comments', postId, includeReplies], (old: any) => {
                const isPaginated = old && !Array.isArray(old) && (old.edges || old.totalCount !== undefined);

                if (newCommentPayload.parentCommentId) {
                    const updateReplies = (comments: any[]): any[] => {
                        return comments.map(c => {
                            if (c.id === newCommentPayload.parentCommentId) {
                                return {
                                    ...c,
                                    repliesCount: (c.repliesCount || 0) + 1,
                                    replies: [optimisticComment, ...(c.replies || [])]
                                };
                            }
                            if (c.replies && c.replies.length > 0) {
                                return { ...c, replies: updateReplies(c.replies) };
                            }
                            return c;
                        });
                    };

                    if (isPaginated) {
                        return {
                            ...old,
                            edges: old.edges.map((edge: any) => ({
                                ...edge,
                                node: updateReplies([edge.node])[0]
                            }))
                        };
                    }
                    return updateReplies(Array.isArray(old) ? old : []);
                }

                if (isPaginated) {
                    return {
                        ...old,
                        edges: [{ node: optimisticComment, cursor: optimisticComment.id }, ...(old.edges || [])],
                        totalCount: (old.totalCount || 0) + 1,
                    };
                }

                return [optimisticComment, ...(Array.isArray(old) ? old : [])];
            });

            if (newCommentPayload.parentCommentId) {
                queryClient.setQueryData(['comment-replies', newCommentPayload.parentCommentId], (old: any) => {
                    if (!old) return { edges: [{ node: optimisticComment, cursor: optimisticComment.id }], pageInfo: { hasNextPage: false }, totalCount: 1 };

                    const isPaginated = old.edges !== undefined;
                    if (isPaginated) {
                        return {
                            ...old,
                            edges: [{ node: optimisticComment, cursor: optimisticComment.id }, ...old.edges],
                            totalCount: (old.totalCount || 0) + 1
                        };
                    }
                    return [optimisticComment, ...(Array.isArray(old) ? old : [])];
                });
            }

            return { previousComments };
        },
        onError: (_err, _newComment, context) => {
            queryClient.setQueryData(['post-comments', postId, includeReplies], context?.previousComments);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['post-comments', postId, includeReplies] });
            queryClient.invalidateQueries({ queryKey: ['post', postId] });
            queryClient.invalidateQueries({ queryKey: ['socialPosts'] });
            queryClient.invalidateQueries({ queryKey: ['user-posts'] });
            queryClient.invalidateQueries({ queryKey: ['userPosts'] });
        },
    });

    const deleteCommentMutation = useMutation({
        mutationFn: (commentId: string) => commentApi.deleteComment(commentId),
        onMutate: async (commentId) => {
            await queryClient.cancelQueries({ queryKey: ['post-comments', postId, includeReplies] });
            const previousComments = queryClient.getQueryData(['post-comments', postId, includeReplies]);

            queryClient.setQueryData(['post-comments', postId, includeReplies], (old: any) => {
                const isPaginated = old && !Array.isArray(old) && (old.edges || old.totalCount !== undefined);

                const filterOut = (comments: any[]): any[] => {
                    return comments
                        .filter((c: any) => c.id !== commentId && c.parentCommentId !== commentId)
                        .map((c: any) => ({
                            ...c,
                            replies: c.replies ? filterOut(c.replies) : []
                        }));
                };

                if (isPaginated) {
                    const filteredEdges = old.edges.filter((edge: any) =>
                        edge.node.id !== commentId && edge.node.parentCommentId !== commentId
                    );
                    return {
                        ...old,
                        edges: filteredEdges,
                        totalCount: Math.max(0, (old.totalCount || 0) - (old.edges.length - filteredEdges.length)),
                    };
                }

                return filterOut(Array.isArray(old) ? old : []);
            });

            return { previousComments };
        },
        onError: (_err, _commentId, context) => {
            queryClient.setQueryData(['post-comments', postId, includeReplies], context?.previousComments);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['post-comments', postId, includeReplies] });
            queryClient.invalidateQueries({ queryKey: ['post', postId] });
            queryClient.invalidateQueries({ queryKey: ['socialPosts'] });
            queryClient.invalidateQueries({ queryKey: ['user-posts'] });
            queryClient.invalidateQueries({ queryKey: ['userPosts'] });
        },
    });

    const updateCommentMutation = useMutation({
        mutationFn: ({ commentId, content }: { commentId: string; content: string }) =>
            commentApi.updateComment(commentId, { id: commentId, postId, content }),
        onMutate: async ({ commentId, content }) => {
            await queryClient.cancelQueries({ queryKey: ['post-comments', postId, includeReplies] });
            const previousComments = queryClient.getQueryData(['post-comments', postId, includeReplies]);

            queryClient.setQueryData(['post-comments', postId, includeReplies], (old: any) => {
                const isPaginated = old && !Array.isArray(old) && (old.edges || old.totalCount !== undefined);
                if (isPaginated) {
                    return {
                        ...old,
                        edges: old.edges.map((edge: any) =>
                            edge.node.id === commentId ? { ...edge, node: { ...edge.node, content } } : edge
                        ),
                    };
                }
                return Array.isArray(old)
                    ? old.map((c: any) => c.id === commentId ? { ...c, content } : c)
                    : old;
            });

            return { previousComments };
        },
        onError: (_err, _variables, context) => {
            queryClient.setQueryData(['post-comments', postId, includeReplies], context?.previousComments);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['post-comments', postId, includeReplies] });
        },
    });

    const comments = useMemo(() => {
        const flatComments = Array.isArray(data)
            ? data
            : (data?.edges?.map((edge: any) => edge.node) || []);

        if (flatComments.length === 0) return [];

        const commentMap = new Map<string, PostComment>();
        flatComments.forEach((c: PostComment) => {
            const existingReplies = Array.isArray(c.replies) ? c.replies : [];
            const count = c.repliesCount !== undefined ? c.repliesCount : existingReplies.length;

            commentMap.set(c.id, {
                ...c,
                replies: existingReplies,
                repliesCount: count
            });
        });

        const rootComments: PostComment[] = [];
        commentMap.forEach((comment) => {
            if (!comment.parentCommentId) {
                rootComments.push(comment);
            } else {
                const parent = commentMap.get(comment.parentCommentId);
                if (parent) {
                    parent.replies = parent.replies || [];
                    if (!parent.replies.some(r => r.id === comment.id)) {
                        parent.replies.push(comment);
                    }
                    parent.repliesCount = Math.max(parent.repliesCount || 0, parent.replies.length);
                }
            }
        });

        commentMap.forEach(c => {
            if (c.replies && c.replies.length > 0) {
                c.repliesCount = Math.max(c.repliesCount || 0, c.replies.length);
            }
        });

        return rootComments;
    }, [data]);

    const totalCount = Array.isArray(data)
        ? data.length
        : (data?.totalCount || comments.length);

    return {
        comments,
        totalCount,
        isLoading,
        isError,
        addComment: createCommentMutation.mutateAsync,
        deleteComment: deleteCommentMutation.mutate,
        updateComment: updateCommentMutation.mutateAsync,
        isSubmitting: createCommentMutation.isPending,
        isUpdating: updateCommentMutation.isPending,
    };
};
