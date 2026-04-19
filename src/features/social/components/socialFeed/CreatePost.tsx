import { Share2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { CreatePostProps } from '@/types';

export const CreatePost = ({ onClick }: CreatePostProps) => {
	const { t } = useTranslation();

	return (
		<button
			type="button"
			onClick={onClick}
			className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(90deg,#36656B_0%,#75B06F_100%)] px-5 py-3 text-base font-semibold text-white shadow-md transition-transform duration-200 hover:-translate-y-0.5"
		>
			<Share2 className="h-4 w-4" />
			{t('social.feed.createPost')}
		</button>
	);
};
