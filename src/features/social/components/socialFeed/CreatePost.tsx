import { Image, MapPin, Tag } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { CreatePostProps } from '@/types';

export const CreatePost = ({ onClick, onPhotoClick, onLocationClick, onVibeClick }: CreatePostProps) => {
	const { t } = useTranslation();

	return (
		<div className="w-full rounded-2xl bg-white p-3 shadow-sm sm:p-4">
			<div className="flex items-start gap-3">
				<div className="h-10 w-10 flex-shrink-0 rounded-full bg-gray-200" />
				<button
					type="button"
					onClick={onClick}
					className="flex-1 text-left text-sm text-gray-600 hover:text-gray-800"
					aria-label={t('social.feed.createPost')}
				>
					{t('social.feed.createModal.captionPlaceholder', "What's your latest discovery?")}
				</button>
			</div>

			<div className="mt-3 flex items-center gap-2 overflow-x-auto sm:gap-2">
				<button
					type="button"
					onClick={onPhotoClick ?? onClick}
					aria-label={t('social.feed.photo', 'Photo')}
					className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-emerald-600 shadow-sm transition-colors hover:bg-emerald-50"
				>
					<Image className="h-4 w-4" />
				</button>

				<button
					type="button"
					onClick={onLocationClick ?? onClick}
					aria-label={t('social.feed.location', 'Location')}
					className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-red-500 shadow-sm transition-colors hover:bg-red-50"
				>
					<MapPin className="h-4 w-4" />
				</button>

				<button
					type="button"
					onClick={onVibeClick ?? onClick}
					aria-label={t('social.feed.vibe', 'Vibe')}
					className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-amber-500 shadow-sm transition-colors hover:bg-amber-50"
				>
					<Tag className="h-4 w-4" />
				</button>

				<div className="ml-auto flex-shrink-0 sm:col-span-1 sm:ml-auto">
					<button
						type="button"
						onClick={onClick}
						className="rounded-full bg-[#0F8A48] px-4 py-2 text-sm font-semibold text-white shadow"
					>
						{t('social.feed.createModal.publish', 'POST')}
					</button>
				</div>
			</div>
		</div>
	);
};
