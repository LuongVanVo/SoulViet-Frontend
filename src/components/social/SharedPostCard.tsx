import { useState, useRef, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import type { SocialPost } from '@/types';
import { useAuthStore } from '@/store';
import { SocialPostActions } from './SocialPostActions';
import { SocialPostHeader } from './SocialPostHeader';
import { ShareModal } from './ShareModal';
import { CommentModal } from '@/features/social/components/comments';

interface SharedPostCardProps {
	sharePost: SocialPost;
	post: SocialPost;
	footer?: ReactNode;
	onEditPost?: (postId: string) => void;
	onDeletePost?: (postId: string) => void;
	onLikePost?: (postId: string) => void;
	isLiking?: boolean;
}

export const SharedPostCard = ({
	sharePost,
	post,
	footer,
	onEditPost,
	onDeletePost,
	onLikePost,
	isLiking,
}: SharedPostCardProps) => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const location = useLocation();
	const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

	// If the original post is missing (e.g., deleted), don't render the share card
	if (!post) return null;

	const [currentIndex, setCurrentIndex] = useState(0);
	const scrollRef = useRef<HTMLDivElement>(null);
	const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
	const [isShareModalOpen, setIsShareModalOpen] = useState(false);

	const originalAuthorInitials = post.author
		.split(' ')
		.filter(Boolean)
		.slice(0, 2)
		.map((part) => part[0]?.toUpperCase())
		.join('');

	const mediaItems = post.media && post.media.length > 0
		? post.media
		: (post.images && post.images.length > 0
			? post.images.map(url => ({ url, type: 'image' as const }))
			: (post.image ? [{ url: post.image, type: 'image' as const }] : []));

	const aspectRatioClass = post.aspectRatio === 'vertical'
		? 'aspect-[4/5]'
		: (post.aspectRatio === 'horizontal' ? 'aspect-[16/9]' : 'aspect-square');

	const scroll = (direction: 'left' | 'right') => {
		if (scrollRef.current) {
			const { scrollLeft, clientWidth } = scrollRef.current;
			const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
			scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
		}
	};

	const handleScroll = () => {
		if (scrollRef.current) {
			const { scrollLeft, clientWidth } = scrollRef.current;
			const index = Math.round(scrollLeft / clientWidth);
			setCurrentIndex(index);
		}
	};

	const handleCommentClick = () => {
		if (!isLoggedIn) {
			const redirect = encodeURIComponent(`${location.pathname}${location.search}${location.hash}`);
			navigate(`/login?redirect=${redirect}`);
			return;
		}
		setIsCommentModalOpen(true);
	};

	const handleLikeClick = (postId: string) => {
		if (!isLoggedIn) {
			const redirect = encodeURIComponent(`${location.pathname}${location.search}${location.hash}`);
			navigate(`/login?redirect=${redirect}`);
			return;
		}
		onLikePost?.(postId);
	};

	const handleShareClick = () => {
		if (!isLoggedIn) {
			const redirect = encodeURIComponent(`${location.pathname}${location.search}${location.hash}`);
			navigate(`/login?redirect=${redirect}`);
			return;
		}
		setIsShareModalOpen(true);
	};

	const handleOriginalPostClick = () => {
		navigate(`/posts/${post.id}`);
	};

	return (
		<article className="overflow-hidden rounded-3xl border border-[#ECEEF1] bg-white shadow-[0_10px_25px_-18px_rgba(15,23,42,0.45)]">
			<SocialPostHeader
				avatar={sharePost.avatar}
				author={sharePost.author}
				timeAgo={sharePost.timeAgo}
				location={sharePost.location}
				vibe={sharePost.vibe ?? ''}
				postId={sharePost.id}
				authorId={sharePost.userId}
				onEdit={onEditPost}
				onDelete={onDeletePost}
			/>

			{sharePost.caption && (
				<div className="px-4 pb-3">
					<p className="text-[15px] leading-6 text-[#334155] break-words whitespace-pre-wrap">{sharePost.caption}</p>
				</div>
			)}

			<div className="px-4 pb-2">
				<div
					className="group/original overflow-hidden rounded-[20px] border border-[#ECEEF1] bg-white transition-all hover:border-[#E2E8F0] cursor-pointer"
					onClick={handleOriginalPostClick}
				>
					{mediaItems.length > 0 && (
						<div className="relative group/media overflow-hidden bg-gray-50 flex items-center justify-center">
							<div
								ref={scrollRef}
								onScroll={handleScroll}
								className={`flex snap-x snap-mandatory overflow-x-auto scrollbar-hide w-full ${aspectRatioClass}`}
							>
								{mediaItems.map((item, idx) => (
									<div key={idx} className="w-full shrink-0 snap-center relative flex items-center justify-center overflow-hidden">
										{item.type === 'video' ? (
											<video
												src={item.url}
												className="h-full w-full object-contain bg-black"
												playsInline
											/>
										) : (
											<img
												src={item.url}
												alt={`${post.author} - ${idx + 1}`}
												className="h-full w-full object-contain"
											/>
										)}
									</div>
								))}
							</div>

							{mediaItems.length > 1 && (
								<>
									<button
										onClick={(e) => { e.preventDefault(); e.stopPropagation(); scroll('left'); }}
										className={`absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-1 shadow-sm backdrop-blur-sm transition-all hover:bg-white z-10 hidden md:flex ${currentIndex === 0 ? 'opacity-0 pointer-events-none' : 'opacity-0 group-hover/media:opacity-100'}`}
									>
										<ChevronLeft className="h-4 w-4 text-gray-800" />
									</button>
									<button
										onClick={(e) => { e.preventDefault(); e.stopPropagation(); scroll('right'); }}
										className={`absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-1 shadow-sm backdrop-blur-sm transition-all hover:bg-white z-10 hidden md:flex ${currentIndex === mediaItems.length - 1 ? 'opacity-0 pointer-events-none' : 'opacity-0 group-hover/media:opacity-100'}`}
									>
										<ChevronRight className="h-4 w-4 text-gray-800" />
									</button>

									<div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1 px-2 py-0.5 rounded-full bg-black/20 backdrop-blur-sm z-10">
										{mediaItems.map((_, idx) => (
											<div
												key={idx}
												className={`h-1 w-1 rounded-full transition-all duration-300 shadow-sm ${idx === currentIndex ? 'bg-white w-2' : 'bg-white/50'}`}
											/>
										))}
									</div>
								</>
							)}
						</div>
					)}

					{post.caption && (
						<div className="px-4 pt-3 pb-2">
							<p className="text-[14px] leading-relaxed text-[#475569] line-clamp-3 italic">"{post.caption}"</p>
						</div>
					)}

					<div className="flex items-center justify-between px-4 py-3 border-t border-[#ECEEF1]/50">
						<div className="flex items-center gap-2.5 min-w-0">
							<div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#E2E8F0] text-xs font-bold text-[#0F172A]">
								{post.avatar ? (
									<img src={post.avatar} alt={post.author} className="h-full w-full object-cover" />
								) : (
									<span>{originalAuthorInitials}</span>
								)}
							</div>
							<div className="min-w-0">
								<p className="truncate text-[14px] font-bold text-gray-900 leading-tight">{post.author}</p>
								<p className="text-[11px] text-gray-500">{post.timeAgo}</p>
							</div>
						</div>
						<button
							className="text-[13px] font-bold text-blue-600 hover:text-blue-700 transition-colors"
							onClick={(e) => { e.stopPropagation(); navigate(`/profile/${post.userId}`); }}
						>
							{t('social.feed.post.actions.follow', { defaultValue: 'Follow' })}
						</button>
					</div>
				</div>
			</div>

			<SocialPostActions
				likes={sharePost.likes}
				comments={sharePost.comments}
				shares={sharePost.shares}
				postId={sharePost.id}
				onLike={handleLikeClick}
				isLiking={isLiking}
				isLiked={sharePost.isLiked}
				onComment={handleCommentClick}
				onShare={handleShareClick}
			/>

			{footer ? <div className="px-4 pb-4">{footer}</div> : null}

			<CommentModal
				isOpen={isCommentModalOpen}
				onClose={() => setIsCommentModalOpen(false)}
				post={sharePost}
			/>

			<ShareModal
				isOpen={isShareModalOpen}
				onClose={() => setIsShareModalOpen(false)}
				postId={sharePost.id}
				postUrl={`${window.location.origin}/posts/${sharePost.id}`}
			/>
		</article>
	);
};
