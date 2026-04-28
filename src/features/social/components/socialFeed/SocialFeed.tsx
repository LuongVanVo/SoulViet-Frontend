import { useState } from 'react';
import { useSocialPosts } from '@/hooks';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store';
import { CreatePost } from './CreatePost';
import { CreatePostModal } from './CreatePostModal';
import { PostFeedList } from './PostFeedList';
import { SocialFeedHeader } from './SocialFeedHeader';

export const SocialFeed = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const { data: posts = [] } = useSocialPosts();
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
        <PostFeedList posts={posts} />
      </div>

      <CreatePostModal
        isOpen={isCreateModalOpen}
        initialAction={createPostAction}
        onClose={handleCreateModalClose}
      />
    </>
  );
};