import React, { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MoreVertical, Grid, ShoppingBag, Plus } from 'lucide-react';
import { usePublicProfile } from '@/hooks/usePublicProfile';
import { PostFeedList, ConfirmationDialog } from '@/components';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store';
import { FollowListModal } from '@/components/social/FollowListModal';
import { useFollowUser, useMyPostActions, useSocialPostActions } from '@/hooks';
import { EditPostModal } from '@/features/profile/components/EditPostModal';
import { CreatePostModal } from '@/features/social/components/socialFeed/CreatePostModal';
import type { SocialPost } from '@/types';

export const PublicProfilePage: React.FC = () => {
    const { userId } = useParams<{ userId: string }>();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { profile, posts, isLoadingProfile, isError } = usePublicProfile(userId || '');
    const currentUser = useAuthStore((state) => state.user);
    const isOwnProfile = currentUser?.id === userId;

    const [editingPostId, setEditingPostId] = useState<string | null>(null);
    const [deletingPostId, setDeletingPostId] = useState<string | null>(null);
    const [isUnfollowDialogOpen, setIsUnfollowDialogOpen] = useState(false);
    const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);

    const { updateMyPost, deleteMyPost, isUpdating, isDeleting } = useMyPostActions(userId || '');
    const { likePost, isLiking: isLikingPost } = useSocialPostActions();
    const [activeTab, setActiveTab] = useState<'posts' | 'products'>('posts');
    const [followListModal, setFollowListModal] = useState<{ isOpen: boolean; type: 'followers' | 'following' }>({
        isOpen: false,
        type: 'followers'
    });

    const { isFollowing, isFollower, isPending: isFollowPending, followUser, unfollowUser } = useFollowUser(userId || '');

    React.useEffect(() => {
        window.scrollTo(0, 0);
    }, [userId]);

    const editingPost = useMemo<SocialPost | null>(
        () => posts.find((item) => item.id === editingPostId) ?? null,
        [editingPostId, posts]
    );

    const handleEditPost = (postId: string) => {
        if (isUpdating || isDeleting) return;
        setEditingPostId(postId);
    };

    const handleDeletePost = (postId: string) => {
        if (isUpdating || isDeleting) return;
        setDeletingPostId(postId);
    };

    const handleSubmitEdit = async (postId: string, payload: any) => {
        await updateMyPost(postId, payload);
    };

    const handleConfirmDelete = async () => {
        if (!deletingPostId) return;
        await deleteMyPost(deletingPostId);
        setDeletingPostId(null);
    };

    const handleLikePost = async (postId: string) => {
        try {
            await likePost(postId);
        } catch (error) {
            console.error('Failed to like post:', error);
        }
    };

    const handleFollowClick = async () => {
        if (!userId) return;

        if (!currentUser) {
            navigate(`/login?redirect=${encodeURIComponent(`/profile/${userId}`)}`);
            return;
        }

        if (isFollowing) {
            setIsUnfollowDialogOpen(true);
            return;
        }

        try {
            await followUser();
        } catch (error) {
            console.error('Failed to toggle follow state:', error);
        }
    };

    const handleConfirmUnfollow = async () => {
        try {
            await unfollowUser();
            setIsUnfollowDialogOpen(false);
        } catch (error) {
            console.error('Failed to unfollow user:', error);
        }
    };

    if (isLoadingProfile) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
        );
    }

    if (isError || !profile) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4 text-center">
                <div className="mb-4 rounded-full bg-red-50 p-4">
                    <ArrowLeft className="h-8 w-8 text-red-500" />
                </div>
                <h1 className="text-xl font-bold text-gray-900">{t('profile.public.error')}</h1>
                <p className="mt-2 text-gray-600">{t('profile.public.error')}</p>
                <button
                    onClick={() => navigate(-1)}
                    className="mt-6 rounded-xl bg-primary px-6 py-2 font-semibold text-white shadow-lg transition-transform hover:scale-105"
                >
                    {t('common.back')}
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="sticky top-0 z-20 w-full border-b border-gray-100 bg-background/95 backdrop-blur-sm">
                <div className="mx-auto flex max-w-4xl items-center px-4 py-3">
                    <div className="flex w-12 justify-start">
                        <button
                            onClick={() => navigate(-1)}
                            className="rounded-full p-2 transition-colors hover:bg-gray-100/50"
                        >
                            <ArrowLeft className="h-6 w-6 text-gray-800" />
                        </button>
                    </div>

                    <div className="flex-1 text-center">
                        <h2 className="text-[17px] font-medium text-gray-900 leading-tight">
                            {t('profile.public.profileTitle')}
                        </h2>
                    </div>

                    <div className="flex w-12 justify-end">
                        {isOwnProfile ? (
                            <button 
                                onClick={() => setIsCreatePostModalOpen(true)}
                                className="rounded-full p-2 transition-colors hover:bg-gray-100/50"
                                title={t('social.feed.createModal.title')}
                            >
                                <Plus className="h-6 w-6 text-gray-800" />
                            </button>
                        ) : (
                            <button className="rounded-full p-2 transition-colors hover:bg-gray-100/50">
                                <MoreVertical className="h-6 w-6 text-gray-800" />
                            </button>
                        )}
                    </div>
                </div>
            </div>
            <div className="mx-auto max-w-4xl border-t border-gray-100" />
            <div className="mx-auto max-w-4xl px-4 pt-4 sm:px-12">
                <div className="flex items-center gap-3 sm:gap-8">
                    <div className="h-16 w-16 shrink-0 rounded-full bg-gray-200 sm:h-32 sm:w-32 overflow-hidden">
                        {profile.avatarUrl && (
                            <img
                                src={profile.avatarUrl}
                                alt={profile.name}
                                className="h-full w-full object-cover"
                            />
                        )}
                    </div>

                    <div className="flex flex-1 flex-col gap-1">
                        <div className="flex items-center gap-2">
                            <h1 className="text-lg font-bold text-gray-900 sm:text-2xl">{profile.name}</h1>
                            {profile.roles?.some(role => role.toLowerCase() === 'admin') && (
                                <span className="bg-red-50 text-red-600 text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-md border border-red-100 uppercase tracking-wider font-extrabold flex items-center">
                                    Admin
                                </span>
                            )}
                            {profile.isLocalPartner && (
                                <span className="bg-primary/5 text-primary text-[12px] sm:text-[12px] px-1.5 py-0.5 rounded-md border border-primary/10 font-bold flex items-center">
                                    {t('common.localPartner', { defaultValue: 'Local Partner' })}
                                </span>
                            )}
                        </div>

                        <div className="flex items-center justify-between sm:justify-start sm:gap-x-8">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-1.5">
                                <span className="font-bold text-gray-900 text-sm sm:text-[15px]">{profile.postsCount || 0}</span>
                                <span className="text-[11px] text-gray-600 sm:text-[15px]">{t('profile.public.posts').toLowerCase()}</span>
                            </div>
                            <div
                                className="flex flex-col sm:flex-row sm:items-center sm:gap-1.5 cursor-pointer hover:opacity-70 transition-opacity"
                                onClick={() => setFollowListModal({ isOpen: true, type: 'followers' })}
                            >
                                <span className="font-bold text-gray-900 text-sm sm:text-[15px]">
                                    {profile.followersCount ? (profile.followersCount >= 1000 ? `${(profile.followersCount / 1000).toFixed(1)}k` : profile.followersCount) : 0}
                                </span>
                                <span className="text-[11px] text-gray-600 sm:text-[15px]">{t('profile.public.followers').toLowerCase()}</span>
                            </div>
                            <div
                                className="flex flex-col sm:flex-row sm:items-center sm:gap-1.5 cursor-pointer hover:opacity-70 transition-opacity"
                                onClick={() => setFollowListModal({ isOpen: true, type: 'following' })}
                            >
                                <span className="font-bold text-gray-900 text-sm sm:text-[15px] sm:order-2">{profile.followingCount || 0}</span>
                                <span className="text-[11px] text-gray-600 sm:text-[15px] sm:order-1">
                                    <span className="sm:hidden">{t('profile.public.following').toLowerCase()}</span>
                                    <span className="hidden sm:inline">{t('profile.public.following')} </span>
                                </span>
                                <span className="hidden sm:inline text-[11px] text-gray-600 sm:text-[15px] sm:order-3">
                                    {t('profile.public.users').toLowerCase()}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {profile.bio && (
                    <div className="mt-4 px-1">
                        <p className="text-[15px] text-gray-600 leading-relaxed">{profile.bio}</p>
                    </div>
                )}

                <div className="mt-6 flex gap-3">
                    {isOwnProfile ? (
                        <button
                            onClick={() => navigate('/profile')}
                            className="flex-1 rounded-2xl bg-[#F0F2F5] py-3 text-center font-medium text-[#1C1E21] transition-all hover:bg-gray-200 active:scale-95"
                        >
                            {t('profile.public.editProfile')}
                        </button>
                    ) : (
                        <>
                            <button
                                onClick={() => void handleFollowClick()}
                                disabled={isFollowPending}
                                className={`flex-1 rounded-2xl py-3 text-center font-medium transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-70 ${isFollowing ? 'bg-[#F0F2F5] text-[#1C1E21] hover:bg-gray-200' : 'bg-[#3B6363] text-white hover:bg-[#2F4F4F]'}`}
                            >
                                {isFollowing
                                    ? (t('profile.public.following') || 'Đang theo dõi')
                                    : (isFollower ? (t('profile.public.followBack') || 'Theo dõi lại') : (t('profile.public.follow') || 'Theo dõi'))
                                }
                            </button>
                            <button className="flex-1 rounded-2xl bg-[#F0F2F5] py-3 text-center font-medium text-[#1C1E21] transition-all hover:bg-gray-200 active:scale-95">
                                {t('profile.public.message')}
                            </button>
                        </>
                    )}
                    {isOwnProfile && (
                        <CreatePostModal 
                            isOpen={isCreatePostModalOpen}
                            onClose={() => setIsCreatePostModalOpen(false)}
                        />
                    )}
                </div>

                <ConfirmationDialog
                    isOpen={isUnfollowDialogOpen}
                    title={t('profile.public.unfollowDialog.title', 'Bỏ theo dõi?')}
                    message={t('profile.public.unfollowDialog.message', 'Bạn có chắc muốn bỏ theo dõi người dùng này không?')}
                    cancelLabel={t('profile.public.unfollowDialog.cancel', 'Hủy')}
                    confirmLabel={t('profile.public.unfollowDialog.confirm', 'Bỏ theo dõi')}
                    loadingLabel={t('profile.public.unfollowDialog.loading', 'Đang bỏ theo dõi...')}
                    isLoading={isFollowPending}
                    onCancel={() => setIsUnfollowDialogOpen(false)}
                    onConfirm={() => void handleConfirmUnfollow()}
                />


            </div>
            {profile?.isLocalPartner && (
                <div className="mx-auto max-w-4xl border-t border-gray-100 bg-background">
                    <div className="flex justify-center">
                        <button
                            onClick={() => setActiveTab('posts')}
                            className={`relative flex flex-1 items-center justify-center py-3.5 transition-all ${activeTab === 'posts' ? 'text-primary' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <Grid className={`h-5 w-5 ${activeTab === 'posts' ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                            {activeTab === 'posts' && (
                                <div className="absolute bottom-0 h-[2px] w-full bg-primary animate-in fade-in slide-in-from-bottom-1 duration-300" />
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab('products')}
                            className={`relative flex flex-1 items-center justify-center py-3.5 transition-all ${activeTab === 'products' ? 'text-primary' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <ShoppingBag className={`h-5 w-5 ${activeTab === 'products' ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                            {activeTab === 'products' && (
                                <div className="absolute bottom-0 h-[2px] w-full bg-primary animate-in fade-in slide-in-from-bottom-1 duration-300" />
                            )}
                        </button>
                    </div>
                </div>
            )}

            {!profile?.isLocalPartner && (
                <div className="mx-auto mt-8 max-w-4xl border-t border-gray-200" />
            )}

            <div className="mx-auto max-w-4xl bg-background pt-2">
                <div className="space-y-6 p-4 md:p-6">
                    <div className="mx-auto max-w-xl">
                        {activeTab === 'posts' ? (
                            <PostFeedList
                                posts={posts}
                                emptyState={(
                                    <div className="flex flex-col items-center justify-center py-20 text-center">
                                        <div className="mb-4 rounded-full bg-gray-100 p-6">
                                            <Grid className="h-12 w-12 text-gray-300" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-900">{t('profile.public.noPosts')}</h3>
                                    </div>
                                )}
                                onEditPost={isOwnProfile ? handleEditPost : undefined}
                                onDeletePost={isOwnProfile ? handleDeletePost : undefined}
                                onLikePost={handleLikePost}
                                isLiking={isLikingPost}
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in duration-500">
                                <div className="mb-4 rounded-full bg-gray-100 p-6">
                                    <ShoppingBag className="h-12 w-12 text-gray-300" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">{t('profile.public.noProducts')}</h3>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {isOwnProfile && (
                <>
                    <EditPostModal
                        isOpen={Boolean(editingPost)}
                        post={editingPost}
                        isSubmitting={isUpdating}
                        onClose={() => setEditingPostId(null)}
                        onSubmit={handleSubmitEdit}
                    />

                    <ConfirmationDialog
                        isOpen={Boolean(deletingPostId)}
                        title={t('profile.user.posts.deleteDialog.title')}
                        message={t('profile.user.posts.deleteDialog.message')}
                        cancelLabel={t('profile.user.posts.deleteDialog.cancel')}
                        confirmLabel={t('profile.user.posts.deleteDialog.confirm')}
                        loadingLabel={t('profile.user.posts.deleteDialog.deleting')}
                        isLoading={isDeleting}
                        onCancel={() => setDeletingPostId(null)}
                        onConfirm={() => void handleConfirmDelete()}
                    />
                </>
            )}
            <FollowListModal
                isOpen={followListModal.isOpen}
                onClose={() => setFollowListModal({ ...followListModal, isOpen: false })}
                userId={userId || ''}
                type={followListModal.type}
                title={followListModal.type === 'followers' ? t('profile.public.followers') : t('profile.public.following')}
            />
        </div>
    );
};
