import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, X, Heart, MessageCircle, Share2, MoreHorizontal } from 'lucide-react';
import { usePostById } from '@/hooks/usePostById';
import { CommentSection } from '@/features/social/components/comments/CommentSection';
import { CommentModal } from '@/features/social/components/comments/CommentModal';
import { LikersModal } from '@/components/social/LikersModal';
import { ShareModal } from '@/components/social/ShareModal';
import { useState, useRef, useMemo } from 'react';
import { toSocialPost } from '@/utils/socialMapper';
import { useAuthStore } from '@/store';
import { useTranslation } from 'react-i18next';
import { useVibeTags } from '@/hooks/useVibeTags';
import { useSocialPostActions, useFollowUser } from '@/hooks';

export const PostDetailPage = () => {
    const { t } = useTranslation();
    const { postId } = useParams<{ postId: string }>();
    const navigate = useNavigate();
    const { data: rawPost, isLoading, error } = usePostById(postId);
    const currentUser = useAuthStore((state) => state.user);
    const { data: vibeTagsData = [] } = useVibeTags();
    const { likePost, isLiking } = useSocialPostActions();

    const post = useMemo(() => {
        if (!rawPost) return null;
        const vibeTagMap = new Map(vibeTagsData.map((tag) => [tag.id, tag.name]));
        return toSocialPost(rawPost, vibeTagMap, currentUser);
    }, [rawPost, vibeTagsData, currentUser]);

    const originalAuthorId = post?.originalPost?.userId || (post?.originalPost as any)?.UserId || '';

    const {
        isFollowing: isFollowingOriginal,
        isFollower: isFollowerOriginal,
        isPending: isFollowPendingOriginal,
        followUser: followOriginal,
        unfollowUser: unfollowOriginal
    } = useFollowUser(originalAuthorId, {
        isFollowing: !!post?.originalPost?.isFollowingAuthor,
        isFollower: !!post?.originalPost?.isFollowerAuthor
    });

    const {
        isFollowing: isFollowingAuthor,
        isFollower: isFollowerAuthor,
        isPending: isFollowPendingAuthor,
        followUser: followAuthor,
        unfollowUser: unfollowAuthor
    } = useFollowUser(post?.userId || '', {
        isFollowing: !!post?.isFollowingAuthor,
        isFollower: !!post?.isFollowerAuthor
    });

    const [currentIndex, setCurrentIndex] = useState(0);
    const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
    const [isLikersModalOpen, setIsLikersModalOpen] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    const mediaList = useMemo(() => {
        if (!post) return [];
        if (post.media && post.media.length > 0) return post.media;
        if (post.originalPost?.media && post.originalPost.media.length > 0) return post.originalPost.media;
        return [];
    }, [post]);

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-black text-white">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-white border-t-transparent" />
            </div>
        );
    }

    if (error || !post) {
        return (
            <div className="flex h-screen flex-col items-center justify-center bg-black text-white p-4">
                <h1 className="text-2xl font-bold mb-4">Post not found</h1>
                <button
                    onClick={() => navigate('/social')}
                    className="px-6 py-2 bg-white text-black rounded-full font-semibold"
                >
                    Back to Feed
                </button>
            </div>
        );
    }

    const handleScroll = (direction: 'left' | 'right') => {
        if (!scrollRef.current) return;
        const scrollAmount = scrollRef.current.clientWidth;
        const newIndex = direction === 'left' ? currentIndex - 1 : currentIndex + 1;

        if (newIndex >= 0 && newIndex < mediaList.length) {
            scrollRef.current.scrollTo({
                left: newIndex * scrollAmount,
                behavior: 'smooth',
            });
            setCurrentIndex(newIndex);
        }
    };

    const handleLikeClick = async () => {
        if (!currentUser) {
            navigate(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
            return;
        }
        await likePost(post.id);
    };

    const handleLikersClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsLikersModalOpen(true);
    };

    const handleCommentClick = () => {
        if (!currentUser) {
            navigate(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
            return;
        }
        setIsCommentModalOpen(true);
    };

    const handleShareClick = () => {
        if (!currentUser) {
            navigate(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
            return;
        }
        setIsShareModalOpen(true);
    };

    const handleFollowOriginalClick = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!currentUser) {
            navigate(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
            return;
        }
        try {
            if (isFollowingOriginal) {
                await unfollowOriginal();
            } else {
                await followOriginal();
            }
        } catch (err) {
            console.error('Failed to toggle follow original:', err);
        }
    };

    const handleFollowAuthorClick = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!currentUser) {
            navigate(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
            return;
        }
        try {
            if (isFollowingAuthor) {
                await unfollowAuthor();
            } else {
                await followAuthor();
            }
        } catch (err) {
            console.error('Failed to toggle follow author:', err);
        }
    };

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black md:bg-black/95"
            onClick={() => navigate(-1)}
        >
            <button
                onClick={(e) => { e.stopPropagation(); navigate(-1); }}
                className="absolute top-4 left-4 z-50 hidden md:flex rounded-full p-2 text-white/70 hover:bg-white/10 hover:text-white transition-all"
            >
                <X className="h-8 w-8" />
            </button>

            <div
                className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between p-4 md:hidden"
                onClick={(e) => e.stopPropagation()}
            >
                <button onClick={() => navigate(-1)} className="text-white">
                    <X className="h-7 w-7" />
                </button>
                <button className="text-white">
                    <MoreHorizontal className="h-7 w-7" />
                </button>
            </div>

            <div
                className="flex h-full w-full overflow-hidden bg-black md:h-[90vh] md:w-[90vw] md:max-w-[1200px] md:flex-row md:rounded-lg"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="relative flex flex-1 items-center justify-center bg-black group h-full">
                    <div
                        ref={scrollRef}
                        className="flex h-full w-full overflow-hidden scroll-smooth scrollbar-hide"
                    >
                        {mediaList.length > 0 ? (
                            mediaList.map((item, index) => (
                                <div key={index} className="flex h-full w-full shrink-0 items-center justify-center">
                                    {item.type === 'video' ? (
                                        <video
                                            src={item.url}
                                            className="max-h-full max-w-full object-contain"
                                            controls
                                            autoPlay
                                            loop
                                        />
                                    ) : (
                                        <img
                                            src={item.url}
                                            alt=""
                                            className="max-h-full max-w-full object-contain shadow-2xl"
                                        />
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="flex h-full w-full items-center justify-center text-gray-500 italic">
                                No media content
                            </div>
                        )}
                    </div>

                    {mediaList.length > 1 && (
                        <>
                            {currentIndex > 0 && (
                                <button
                                    onClick={() => handleScroll('left')}
                                    className="absolute left-4 z-10 hidden md:flex rounded-full bg-black/40 p-2 text-white opacity-0 transition-opacity hover:bg-black/60 group-hover:opacity-100"
                                >
                                    <ChevronLeft className="h-6 w-6" />
                                </button>
                            )}
                            {currentIndex < mediaList.length - 1 && (
                                <button
                                    onClick={() => handleScroll('right')}
                                    className="absolute right-4 z-10 hidden md:flex rounded-full bg-black/40 p-2 text-white opacity-0 transition-opacity hover:bg-black/60 group-hover:opacity-100"
                                >
                                    <ChevronRight className="h-6 w-6" />
                                </button>
                            )}

                            <div className="absolute bottom-40 md:bottom-24 left-1/2 flex -translate-x-1/2 gap-1.5">
                                {mediaList.map((_, i) => (
                                    <div
                                        key={i}
                                        className={`h-1.5 w-1.5 rounded-full transition-all ${i === currentIndex ? 'bg-white w-3' : 'bg-white/40'
                                            }`}
                                    />
                                ))}
                            </div>
                        </>
                    )}

                    {post.originalPost && (
                        <div className="absolute bottom-0 left-0 right-0 bg-[#F0F2F5] px-4 py-3 flex items-center justify-between border-t border-gray-200">
                            <div className="flex items-center gap-3">
                                <Link to={`/profile/${post.originalPost.userId}`} className="shrink-0">
                                    <img
                                        src={post.originalPost.avatar}
                                        alt=""
                                        className="h-10 w-10 rounded-full object-cover border border-gray-200"
                                    />
                                </Link>
                                <div className="flex flex-col">
                                    <Link to={`/profile/${post.originalPost.userId}`} className="text-sm font-bold text-gray-900 hover:underline">
                                        {post.originalPost.author}
                                    </Link>
                                    <span className="text-[11px] text-gray-500">{post.originalPost.timeAgo}</span>
                                </div>
                            </div>

                            {currentUser?.id !== originalAuthorId && originalAuthorId && (
                                <button
                                    onClick={handleFollowOriginalClick}
                                    disabled={isFollowPendingOriginal}
                                    className="text-sm font-bold text-[#2563EB] hover:text-blue-700 transition-colors px-3 py-1"
                                >
                                    {isFollowPendingOriginal ? '...' : (isFollowingOriginal ? t('social.profile.following') : (isFollowerOriginal ? t('social.profile.followBack') : t('social.feed.post.actions.follow')))}
                                </button>
                            )}
                        </div>
                    )}

                    <div className="absolute bottom-0 left-0 right-0 p-4 pt-10 bg-gradient-to-t from-black/80 to-transparent md:hidden">
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-2">
                                <Link
                                    to={`/profile/${post.userId}`}
                                    className="h-9 w-9 shrink-0 overflow-hidden rounded-full border border-white/20 transition-opacity hover:opacity-80"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <img src={post.avatar} alt="" className="h-full w-full object-cover" />
                                </Link>
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-2">
                                        <Link
                                            to={`/profile/${post.userId}`}
                                            className="font-bold text-white text-sm hover:underline transition-all"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            {post.author}
                                        </Link>
                                        {currentUser?.id !== post.userId && (
                                            <button
                                                onClick={handleFollowAuthorClick}
                                                disabled={isFollowPendingAuthor}
                                                className="text-[#4A8B8B] text-xs font-semibold hover:text-[#3B6363] transition-colors"
                                            >
                                                {isFollowPendingAuthor ? '...' : (isFollowingAuthor ? `• ${t('social.profile.following')}` : (isFollowerAuthor ? `• ${t('social.profile.followBack')}` : `• ${t('social.feed.post.actions.follow')}`))}
                                            </button>
                                        )}
                                    </div>
                                    <span className="text-white/60 text-[10px]">{post.timeAgo}</span>
                                </div>
                            </div>

                            {post.caption && (
                                <p className="text-white text-sm line-clamp-2">
                                    {post.caption}
                                </p>
                            )}

                            <div className="flex items-center gap-6 mt-2">
                                <button
                                    onClick={handleLikeClick}
                                    disabled={isLiking}
                                    className="flex items-center gap-1.5 text-white"
                                >
                                    <Heart className={`h-6 w-6 ${post.isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                                    <span 
                                        className="text-sm font-medium hover:underline cursor-pointer"
                                        onClick={handleLikersClick}
                                    >
                                        {post.likes > 0 ? post.likes : ''}
                                    </span>
                                </button>
                                <button
                                    onClick={handleCommentClick}
                                    className="flex items-center gap-1.5 text-white"
                                >
                                    <MessageCircle className="h-6 w-6" />
                                    <span className="text-sm font-medium">{post.comments > 0 ? post.comments : ''}</span>
                                </button>
                                <button
                                    onClick={handleShareClick}
                                    className="flex items-center gap-1.5 text-white"
                                >
                                    <Share2 className="h-6 w-6" />
                                    <span className="text-sm font-medium">{post.shares > 0 ? post.shares : ''}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="hidden md:block w-[450px] shrink-0 border-l border-white/10 bg-white">
                    <CommentSection post={post} onClose={() => navigate(-1)} />
                </div>
            </div>

            <CommentModal
                isOpen={isCommentModalOpen}
                onClose={() => setIsCommentModalOpen(false)}
                post={post}
            />

            <ShareModal
                isOpen={isShareModalOpen}
                onClose={() => setIsShareModalOpen(false)}
                postId={post.id}
            />

            <LikersModal 
                isOpen={isLikersModalOpen}
                onClose={() => setIsLikersModalOpen(false)}
                postId={post.id}
            />
        </div>
    );
};
