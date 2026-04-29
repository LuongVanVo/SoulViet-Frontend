import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { commentApi } from '@/services';

const eventSourceManager: Record<string, {
    es: EventSource;
    refCount: number;
    handlers: Set<(event: MessageEvent) => void>;
}> = {};

export const usePostCommentStream = (postId: string) => {
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!postId) return;

        if (!eventSourceManager[postId]) {
            const url = commentApi.getCommentStreamUrl(postId);
            console.log('[SSE] Creating NEW connection for post:', postId);

            const es = new EventSource(url);
            const handlers = new Set<(event: MessageEvent) => void>();

            const masterHandler = (event: MessageEvent) => {
                handlers.forEach(h => h(event));
            };

            es.addEventListener('comment', masterHandler);

            es.onopen = () => console.log('[SSE] Connection opened:', postId);
            es.onerror = (err) => {
                console.error('[SSE] Connection error:', postId, err);
            };

            eventSourceManager[postId] = { es, refCount: 0, handlers };
        }

        const connection = eventSourceManager[postId];
        connection.refCount++;

        const handleCommentEvent = (event: MessageEvent) => {
            console.log('[SSE] Received event for post:', postId);
            try {
                queryClient.invalidateQueries({ queryKey: ['post-comments', postId] });
                const data = JSON.parse(event.data);
                if (data.commentsCount !== undefined) {
                    queryClient.setQueriesData({ queryKey: ['socialPosts'] }, (old: any) => {
                        if (!old) return old;

                        const updateNode = (node: any) =>
                            node.id === postId ? { ...node, commentsCount: data.commentsCount } : node;

                        if (old.edges) {
                            return { ...old, edges: old.edges.map((e: any) => ({ ...e, node: updateNode(e.node) })) };
                        }
                        if (old.pages) {
                            return {
                                ...old,
                                pages: old.pages.map((p: any) => ({
                                    ...p,
                                    edges: p.edges.map((e: any) => ({ ...e, node: updateNode(e.node) }))
                                }))
                            };
                        }
                        return old;
                    });
                }
            } catch (error) {
                console.error('[SSE] Failed to process event:', error);
            }
        };

        connection.handlers.add(handleCommentEvent);

        return () => {
            connection.refCount--;
            connection.handlers.delete(handleCommentEvent);

            if (connection.refCount <= 0) {
                console.log('[SSE] Closing connection (last user left):', postId);
                connection.es.close();
                delete eventSourceManager[postId];
            }
        };
    }, [postId, queryClient]);
};
