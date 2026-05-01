import { useState, useRef, useEffect } from 'react';
import { Edit3, Trash2, EllipsisVertical } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { PostHeaderProps } from '@/types';
import { useAuthStore } from '@/store';
import { Link, useNavigate } from 'react-router-dom';
import { useFollowUser } from '@/hooks/useFollowUser';

export interface SocialPostHeaderExtProps extends PostHeaderProps {
	postId?: string;
	authorId?: string;
	onEdit?: (postId: string) => void;
	onDelete?: (postId: string) => void;
	isShared?: boolean;
	isFollowingAuthor?: boolean;
}

export const SocialPostHeader = ({
	avatar,
	author,
	timeAgo,
	location,
	vibe,
	postId,
	authorId,
	onEdit,
	onDelete,
	isShared,
	isLocalPartner,
}: SocialPostHeaderExtProps) => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const currentUserId = useAuthStore((state) => state.user?.id);
	const isOwnPost = currentUserId === authorId;
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const menuRef = useRef<HTMLDivElement>(null);

	const { isFollowing, isFollower, followUser, unfollowUser, isLoading } = useFollowUser(authorId || '');

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
				setIsMenuOpen(false);
			}
		};

		if (isMenuOpen) {
			document.addEventListener('mousedown', handleClickOutside);
		}

		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [isMenuOpen]);

	const profileLink = authorId ? `/profile/${authorId}` : '#';

	return (
		<div className="flex items-start justify-between gap-3 p-4">
			<div className="flex min-w-0 items-center gap-3">
				<Link to={profileLink} className="shrink-0 transition-opacity hover:opacity-80">
					<img src={avatar} alt={author} className="h-10 w-10 rounded-full object-cover" />
				</Link>
				<div className="min-w-0">
					<div className="flex items-center gap-2">
						<Link to={profileLink} className="truncate text-base font-semibold text-[#1F2937] hover:underline">
							{author}
						</Link>
						{isLocalPartner && (
							<span className="bg-primary/5 text-primary text-[10px] px-1.5 py-0.5 rounded-md border border-primary/10 uppercase tracking-wider font-extrabold flex items-center shrink-0">
								Partner
							</span>
						)}
						{isShared && (
							<span className="text-sm text-gray-500 font-normal">
								 {t('social.feed.sharedPost.shared', { defaultValue: 'đã chia sẻ bài viết này' })}
							</span>
						)}
						{!isOwnPost && authorId && (
							<button 
								onClick={(e) => {
									e.preventDefault();
									e.stopPropagation();
									if (!currentUserId) {
										const currentPath = window.location.pathname + window.location.search;
										navigate(`/login?redirect=${encodeURIComponent(currentPath)}`);
										return;
									}
									isFollowing ? unfollowUser() : followUser();
								}}
								disabled={isLoading}
								className={`text-sm font-bold transition-colors ${
									isFollowing ? 'text-gray-500 hover:text-gray-600' : 'text-[#4A8B8B] hover:text-[#3B6363]'
								}`}
							>
								• {isFollowing
                                    ? (t('profile.public.following') || 'Đang theo dõi')
                                    : (isFollower ? (t('profile.public.followBack') || 'Theo dõi lại') : (t('profile.public.follow') || 'Theo dõi'))
                                }
							</button>
						)}
					</div>
					<div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#6B7280]">
						<div className="flex min-w-0 items-center">
							<span className="truncate">{timeAgo}</span>
							{location && (
								<>
									<span className="mx-1 shrink-0">•</span>
									<span className="truncate">{location}</span>
								</>
							)}
						</div>
						{vibe && (
							<span className="shrink-0 rounded-full bg-[#E9EEF7] px-2 py-0.5 text-[10px] font-medium text-[#42618B] sm:hidden">
								{vibe}
							</span>
						)}
					</div>
				</div>
			</div>

			<div className="flex shrink-0 items-center gap-2">
				{vibe && (
					<span className="hidden rounded-full bg-[#E9EEF7] px-3 py-1 text-xs font-medium text-[#42618B] sm:inline-block">
						{vibe}
					</span>
				)}

				{(onEdit || onDelete) && (
					<div ref={menuRef} className="relative">
						<button
							type="button"
							onClick={() => setIsMenuOpen(!isMenuOpen)}
							className="rounded-full p-1.5 hover:bg-[#F0F1F3] transition-colors"
							aria-label="Post actions"
						>
							<EllipsisVertical className="h-5 w-5 text-[#6B7280]" />
						</button>

						{isMenuOpen && (
							<div className="absolute right-0 top-full mt-2 w-40 rounded-xl bg-white shadow-lg border border-[#E5E7EB] z-10">
								{onEdit && postId && (
									<button
										type="button"
										onClick={() => {
											onEdit(postId);
											setIsMenuOpen(false);
										}}
										className="flex w-full items-center gap-2 px-4 py-2.5 text-sm font-medium text-[#334155] hover:bg-[#F8FAFC] transition-colors first:rounded-t-xl"
									>
										<Edit3 className="h-4 w-4" />
										{t('profile.user.posts.actions.edit')}
									</button>
								)}
								{onDelete && postId && (
									<button
										type="button"
										onClick={() => {
											onDelete(postId);
											setIsMenuOpen(false);
										}}
										className="flex w-full items-center gap-2 px-4 py-2.5 text-sm font-medium text-[#DC2626] hover:bg-[#FEF2F2] transition-colors last:rounded-b-xl border-t border-[#E5E7EB]"
									>
										<Trash2 className="h-4 w-4" />
										{t('profile.user.posts.actions.delete')}
									</button>
								)}
							</div>
						)}
					</div>
				)}
			</div>
		</div>
	);
};