import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSocialPostActions, useSocialPosts } from '@/hooks';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store';
import { CreatePost } from './CreatePost';
import { CreatePostModal } from './CreatePostModal';
import { PostFeedList } from './PostFeedList';
import { SocialFeedHeader } from './SocialFeedHeader';

export const SocialFeed = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const { data: posts = [], isLoading, isError } = useSocialPosts();
  const { likePost, isLiking } = useSocialPostActions();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createPostAction, setCreatePostAction] = useState<'photo' | 'location' | 'vibe' | null>(null);

  const handleCreatePostAction = (action: 'photo' | 'location' | 'vibe' | null = null) => {
    if (!isLoggedIn) {
      const redirect = encodeURIComponent(`${location.pathname}${location.search}${location.hash}`);
      navigate(`/login?redirect=${redirect}`);
      return;
    }

    setCreatePostAction(action);
    setIsCreateModalOpen(true);
  };

  const handleCreateModalClose = () => {
    setIsCreateModalOpen(false);
    setCreatePostAction(null);
  };

  const handleLikePost = async (postId: string) => {
    if (!isLoggedIn) {
      const redirect = encodeURIComponent(`${location.pathname}${location.search}${location.hash}`);
      navigate(`/login?redirect=${redirect}`);
      return;
    }

    try {
      await likePost(postId);
    } catch (error) {
      console.error('Like error:', error);
    }
  };

  return (
    <>
      <div className="mx-auto w-full max-w-2xl space-y-4">
        <SocialFeedHeader />
        <CreatePost
          onClick={() => handleCreatePostAction()}
          onPhotoClick={() => handleCreatePostAction('photo')}
          onLocationClick={() => handleCreatePostAction('location')}
          onVibeClick={() => handleCreatePostAction('vibe')}
        />
        {isLoading ? (
          <div className="rounded-3xl border border-dashed border-[#D8DEE6] bg-white px-4 py-10 text-center text-sm text-[#6B7280] shadow-sm">
            {t('social.feed.loading', { defaultValue: 'Đang tải social feed...' })}
          </div>
        ) : isError ? (
          <div className="rounded-3xl border border-dashed border-[#FBCACA] bg-white px-4 py-10 text-center text-sm text-[#B42318] shadow-sm">
            {t('social.feed.error', { defaultValue: 'Không thể tải social feed. Vui lòng thử lại.' })}
          </div>
        ) : (
          <PostFeedList
            posts={posts}
            onLikePost={(postId) => {
              void handleLikePost(postId);
            }}
            isLiking={isLiking}
            emptyState={(
              <div className="rounded-3xl border border-dashed border-[#D8DEE6] bg-white px-4 py-10 text-center text-sm text-[#6B7280] shadow-sm">
                {t('social.feed.empty', { defaultValue: 'Chưa có bài viết nào.' })}
              </div>
            )}
          />
        )}
      </div>

      <CreatePostModal
        isOpen={isCreateModalOpen}
        initialAction={createPostAction}
        onClose={handleCreateModalClose}
      />
    </>
  );
};