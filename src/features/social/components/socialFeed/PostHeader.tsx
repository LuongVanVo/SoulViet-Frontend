import { useTranslation } from 'react-i18next';
import type { PostHeaderProps } from '@/types';

export const PostHeader = ({ avatar, author, timeAgo, location, vibe }: PostHeaderProps) => {
	const { t } = useTranslation();

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

			<span className="rounded-full bg-[#E9EEF7] px-3 py-1 text-xs font-medium text-[#42618B]">
				{t(vibe)}
			</span>
		</div>
	);
};
