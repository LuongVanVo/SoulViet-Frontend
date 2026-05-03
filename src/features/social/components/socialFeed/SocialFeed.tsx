import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSocialPostActions, useSocialPosts } from '@/hooks';
import { useLocation, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store';
import { CreatePost } from './CreatePost';
import { CreatePostModal } from './CreatePostModal';
import { PostFeedList } from './PostFeedList';
import { SocialFeedHeader } from './SocialFeedHeader';
import { Skeleton } from '@/components/ui';
import { cn } from '@/utils/cn';

export const SocialFeed = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const { data: posts = [], isLoading, isError, refetch } = useSocialPosts();
  const { likePost, isLiking } = useSocialPostActions();

  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [startY, setStartY] = useState(0);
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
    try {
      await likePost(postId);
    } catch (error) {
      console.error('Like error:', error);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.scrollY === 0) {
      setStartY(e.touches[0].pageY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (startY === 0 || isRefreshing) return;
    const currentY = e.touches[0].pageY;
    const diff = currentY - startY;
    if (diff > 0 && window.scrollY === 0) {
      setPullDistance(Math.min(diff / 2.5, 80));
    }
  };

  const handleTouchEnd = async () => {
    if (isRefreshing) return;
    if (pullDistance > 60) {
      setIsRefreshing(true);
      setPullDistance(40);
      try {
        await refetch();
      } finally {
        setIsRefreshing(false);
        setPullDistance(0);
      }
    } else {
      setPullDistance(0);
    }
    setStartY(0);
  };

  return (
    <>
      <div
        className="mx-auto w-full max-w-2xl space-y-4"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: pullDistance > 0 ? `translateY(${pullDistance}px)` : 'none',
          transition: pullDistance === 0 ? 'transform 0.3s cubic-bezier(0.17, 0.67, 0.83, 0.67)' : 'none'
        }}
      >
        <div
          className="pointer-events-none absolute left-0 right-0 flex items-center justify-center transition-all"
          style={{
            height: pullDistance,
            opacity: pullDistance / 60,
            top: -pullDistance
          }}
        >
          <Loader2 className={cn("h-6 w-6 text-brand", isRefreshing && "animate-spin")} />
        </div>

        <SocialFeedHeader />
        <CreatePost
          onClick={() => handleCreatePostAction()}
          onPhotoClick={() => handleCreatePostAction('photo')}
          onLocationClick={() => handleCreatePostAction('location')}
          onVibeClick={() => handleCreatePostAction('vibe')}
        />
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-3xl border border-dashed border-[#D8DEE6] bg-white p-4 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-40 mb-2" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <Skeleton className="h-48 w-full rounded-lg" />
                <div className="mt-3 flex gap-3">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
            ))}
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