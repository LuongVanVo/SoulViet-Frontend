import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, X, Heart, MessageCircle, Share2, MoreHorizontal } from 'lucide-react';
import { usePostById } from '@/hooks/usePostById';
import { CommentSection } from '@/features/social/components/comments/CommentSection';
import { CommentModal } from '@/features/social/components/comments/CommentModal';
import { ShareModal } from '@/components/social/ShareModal';
import { useState, useRef, useMemo } from 'react';
import { toSocialPost } from '@/utils/socialMapper';
import { useAuthStore } from '@/store';
import { useVibeTags } from '@/hooks/useVibeTags';
import { useSocialPostActions } from '@/hooks';

export const PostDetailPage = () => {
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

    const [currentIndex, setCurrentIndex] = useState(0);
    const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

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

    const mediaList = post.media || [];

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

                            <div className="absolute bottom-40 md:bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5">
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
                                        <button className="text-[#4A8B8B] text-xs font-semibold hover:text-[#3B6363] transition-colors">Theo dõi</button>
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
                                    <span className="text-sm font-medium">{post.likes > 0 ? post.likes : ''}</span>
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
        </div>
    );
};
