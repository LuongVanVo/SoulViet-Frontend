import { useEffect, useState, useRef } from 'react';
import { CommentSection } from './CommentSection';
import type { SocialPost } from '@/types';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface CommentModalProps {
    isOpen: boolean;
    onClose: () => void;
    post: SocialPost;
}

export const CommentModal = ({ isOpen, onClose, post }: CommentModalProps) => {
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

    const mediaItems = post.media && post.media.length > 0
        ? post.media
        : (post.images && post.images.length > 0
            ? post.images.map(url => ({ url, type: 'image' as const }))
            : (post.image ? [{ url: post.image, type: 'image' as const }] : []));

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
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity md:bg-black/90 md:backdrop-blur-md" 
                onClick={onClose}
            />

            {/* Close Button (Desktop Only) */}
            <button 
                onClick={onClose}
                className="absolute right-4 top-4 z-[60] rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors hidden md:block"
            >
                <X className="h-6 w-6" />
            </button>

            {/* Modal Content */}
            <div className="relative z-10 flex h-[85vh] w-full flex-col overflow-hidden rounded-t-[20px] bg-white shadow-2xl animate-in slide-in-from-bottom duration-300 md:h-full md:max-h-[90vh] md:max-w-[1200px] md:flex-row md:rounded-lg">
                
                {/* Mobile Drag Handle */}
                <div className="flex w-full justify-center py-2 md:hidden shrink-0">
                    <div className="h-1 w-10 rounded-full bg-[#E2E8F0]" />
                </div>

                {/* Left Side: Media (Hidden on Mobile) */}
                <div className="relative hidden h-full flex-1 items-center justify-center bg-black md:flex">
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
                            <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5">
                                {mediaItems.map((_, idx) => (
                                    <div key={idx} className={`h-1.5 w-1.5 rounded-full transition-all ${idx === currentIndex ? 'bg-white w-3' : 'bg-white/40'}`} />
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {/* Right Side: Comment Section (Full Width on Mobile) */}
                <div className="flex h-full w-full flex-col md:w-[400px] lg:w-[450px]">
                    <CommentSection 
                        postId={post.id} 
                        postAuthorId={post.userId} 
                        onClose={onClose}
                        authorName={post.author}
                        authorAvatar={post.avatar}
                        caption={post.caption}
                        createdAt={post.createdAt}
                    />
                </div>
            </div>
        </div>
    );
};
