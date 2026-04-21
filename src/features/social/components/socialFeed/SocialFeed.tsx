import { useState } from 'react';
import { useSocialPosts } from '@/hooks';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store';
import { CoinBanner } from './CoinBanner';
import { CreatePost } from './CreatePost';
import { CreatePostModal } from './CreatePostModal';
import { PostFeedList } from './PostFeedList';

export const SocialFeed = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const { data: posts = [] } = useSocialPosts();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleCreatePostClick = () => {
    if (!isLoggedIn) {
      const redirect = encodeURIComponent(`${location.pathname}${location.search}${location.hash}`);
      navigate(`/login?redirect=${redirect}`);
      return;
    }

    setIsCreateModalOpen(true);
  };

  return (
    <>
      <div className="mx-auto w-full max-w-2xl space-y-4">
        <CoinBanner coinBalance={1247} />
        <CreatePost onClick={handleCreatePostClick} />
        <PostFeedList posts={posts} />
      </div>

      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </>
  );
};