import { useState, useRef, useEffect } from 'react';
import { Edit3, Trash2, EllipsisVertical } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { PostHeaderProps } from '@/types';

export interface SocialPostHeaderExtProps extends PostHeaderProps {
	postId?: string;
	onEdit?: (postId: string) => void;
	onDelete?: (postId: string) => void;
}

export const SocialPostHeader = ({
	avatar,
	author,
	timeAgo,
	location,
	vibe,
	postId,
	onEdit,
	onDelete,
}: SocialPostHeaderExtProps) => {
	const { t } = useTranslation();
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const menuRef = useRef<HTMLDivElement>(null);

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

	return (
		<div className="flex items-start justify-between gap-3 p-4">
			<div className="flex min-w-0 items-center gap-3">
				<img src={avatar} alt={author} className="h-10 w-10 rounded-full object-cover" />
				<div className="min-w-0">
					<p className="truncate text-base font-semibold text-[#1F2937]">{author}</p>
					<p className="truncate text-xs text-[#6B7280]">
						{timeAgo}
						<span className="mx-1">•</span>
						{location}
					</p>
				</div>
			</div>

			<div className="flex items-center gap-3">
				<span className="rounded-full bg-[#E9EEF7] px-3 py-1 text-xs font-medium text-[#42618B]">
					{vibe}
				</span>

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