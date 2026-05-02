import { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '@/store';
import { useFollowUser } from '@/hooks';
import { CommentSection } from './CommentSection';
import type { SocialPost } from '@/types';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface CommentModalProps {
    isOpen: boolean;
    onClose: () => void;
    post: SocialPost;
}

export const CommentModal = ({ isOpen, onClose, post }: CommentModalProps) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const currentUser = useAuthStore((state) => state.user);
    const originalAuthorId = post.originalPost?.userId || '';

    const {
        isFollowing,
        isFollower,
        isPending,
        followUser,
        unfollowUser
    } = useFollowUser(originalAuthorId, {
        isFollowing: post.originalPost?.isFollowingAuthor,
        isFollower: post.originalPost?.isFollowerAuthor
    });

    const handleFollowToggle = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!currentUser) {
            navigate(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
            return;
        }
        try {
            if (isFollowing) {
                await unfollowUser();
            } else {
                await followUser();
            }
        } catch (error) {
            console.error('Failed to toggle follow:', error);
        }
    };
    const [currentIndex, setCurrentIndex] = useState(0);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const targetPost = post.originalPost || post;
    const mediaItems = targetPost.media && targetPost.media.length > 0
        ? targetPost.media
        : (targetPost.images && targetPost.images.length > 0
            ? targetPost.images.map(url => ({ url, type: 'image' as const }))
            : (targetPost.image ? [{ url: targetPost.image, type: 'image' as const }] : []));

    const handleScroll = () => {
        if (scrollRef.current) {
            const { scrollLeft, clientWidth } = scrollRef.current;
            const index = Math.round(scrollLeft / clientWidth);
            setCurrentIndex(index);
        }
    };

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const { scrollLeft, clientWidth } = scrollRef.current;
            const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
            scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-end justify-center p-0 md:items-center md:p-10">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity md:bg-black/90 md:backdrop-blur-md"
                onClick={onClose}
            />

            <button
                onClick={onClose}
                className="absolute right-4 top-4 z-[60] rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors hidden md:block"
            >
                <X className="h-6 w-6" />
            </button>

            <div className="relative z-10 flex h-[85vh] w-full flex-col overflow-hidden rounded-t-[20px] bg-white shadow-2xl animate-in slide-in-from-bottom duration-300 md:h-full md:max-h-[90vh] md:max-w-[1200px] md:flex-row md:rounded-lg">

                <div className="flex w-full justify-center py-2 md:hidden shrink-0">
                    <div className="h-1 w-10 rounded-full bg-[#E2E8F0]" />
                </div>

                <div className="relative hidden h-full flex-1 flex-col items-center justify-center bg-black md:flex">
                    <div
                        ref={scrollRef}
                        onScroll={handleScroll}
                        className="flex h-full w-full snap-x snap-mandatory overflow-x-auto scrollbar-hide"
                    >
                        {mediaItems.map((item, idx) => (
                            <div key={idx} className="flex h-full w-full shrink-0 snap-center items-center justify-center">
                                {item.type === 'video' ? (
                                    <video src={item.url} className="h-full w-full object-contain" controls />
                                ) : (
                                    <img src={item.url} alt="" className="h-full w-full object-contain" />
                                )}
                            </div>
                        ))}
                    </div>

                    {mediaItems.length > 1 && (
                        <>
                            <button
                                onClick={() => scroll('left')}
                                className={`absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/20 p-2 text-white backdrop-blur-md hover:bg-black/40 transition-colors ${currentIndex === 0 ? 'hidden' : ''}`}
                            >
                                <ChevronLeft className="h-6 w-6" />
                            </button>
                            <button
                                onClick={() => scroll('right')}
                                className={`absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/20 p-2 text-white backdrop-blur-md hover:bg-black/40 transition-colors ${currentIndex === mediaItems.length - 1 ? 'hidden' : ''}`}
                            >
                                <ChevronRight className="h-6 w-6" />
                            </button>
                            <div className="absolute bottom-20 left-1/2 flex -translate-x-1/2 gap-1.5 z-20">
                                {mediaItems.map((_, idx) => (
                                    <div key={idx} className={`h-1.5 w-1.5 rounded-full transition-all ${idx === currentIndex ? 'bg-white w-3' : 'bg-white/40'}`} />
                                ))}
                            </div>
                        </>
                    )}

                    {post.originalPost && (
                        <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between bg-white/95 px-6 py-4 backdrop-blur-sm">
                            <div className="flex items-center gap-3">
                                <Link 
                                    to={`/profile/${post.originalPost.userId}`}
                                    className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#E2E8F0] text-sm font-bold text-[#0F172A] hover:opacity-80 transition-opacity"
                                >
                                    {post.originalPost.avatar ? (
                                        <img src={post.originalPost.avatar} alt={post.originalPost.author} className="h-full w-full object-cover" />
                                    ) : (
                                        <span>{post.originalPost.author.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()}</span>
                                    )}
                                </Link>
                                <div className="flex flex-col">
                                    <Link 
                                        to={`/profile/${post.originalPost.userId}`}
                                        className="text-[14px] font-bold text-gray-900 hover:underline"
                                    >
                                        {post.originalPost.author}
                                    </Link>
                                    <span className="text-[12px] text-gray-500">{post.originalPost.timeAgo}</span>
                                </div>
                            </div>
                            {currentUser?.id !== originalAuthorId && originalAuthorId && (
                                <button
                                    onClick={handleFollowToggle}
                                    disabled={isPending}
                                    className="text-[14px] font-bold text-[#4A8B8B] hover:text-[#3B6363] transition-colors disabled:opacity-50"
                                >
                                    {isPending ? '...' : (isFollowing ? t('social.profile.following', { defaultValue: 'Đang theo dõi' }) : (isFollower ? t('social.profile.followBack', { defaultValue: 'Theo dõi lại' }) : t('social.feed.post.actions.follow', { defaultValue: 'Theo dõi' })))}
                                </button>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex h-full w-full flex-col md:w-[400px] lg:w-[450px]">
                    <CommentSection
                        post={post}
                        onClose={onClose}
                    />
                </div>
            </div>
        </div>
    );
};
