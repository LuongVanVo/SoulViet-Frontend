import { useMutation, useQueryClient } from '@tanstack/react-query';
import { postApi } from '@/services';
import type { CreatePostPayload } from '@/types';

interface UpdatePostParams {
	postId: string;
	payload: Partial<CreatePostPayload>;
}

export const useMyPostActions = (userId: string) => {
	const queryClient = useQueryClient();

	const updateMutation = useMutation({
		mutationFn: ({ postId, payload }: UpdatePostParams) => postApi.updatePost(postId, payload),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ['user-posts', userId] });
			await queryClient.invalidateQueries({ queryKey: ['socialPosts'] });
		},
	});

	const deleteMutation = useMutation({
		mutationFn: (postId: string) => postApi.deletePost(postId),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ['user-posts', userId] });
			await queryClient.invalidateQueries({ queryKey: ['socialPosts'] });
		},
	});

	const updateMyPost = async (postId: string, payload: Partial<CreatePostPayload>) => {
		await updateMutation.mutateAsync({ postId, payload });
	};

	const deleteMyPost = async (postId: string) => {
		await deleteMutation.mutateAsync(postId);
	};

	return {
		updateMyPost,
		deleteMyPost,
		isUpdating: updateMutation.isPending,
		isDeleting: deleteMutation.isPending,
	};
};