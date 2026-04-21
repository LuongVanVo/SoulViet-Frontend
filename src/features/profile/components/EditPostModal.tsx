import { useEffect, useId, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { ImagePlus, MapPin, Pencil, Tag, X, ArrowLeft, Search, Sprout, Mountain, Diamond, Lightbulb, Globe, Home } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useVibeTags } from '@/hooks';
import type { CreatePostPayload, SocialPost } from '@/types';

interface EditPostModalProps {
	isOpen: boolean;
	post: SocialPost | null;
	isSubmitting: boolean;
	onClose: () => void;
	onSubmit: (postId: string, payload: Partial<CreatePostPayload>) => Promise<void>;
}

const buildUploadedMediaUrls = (files: File[]) =>
	files.map((_, index) => `https://i.pinimg.com/736x/b1/56/a6/b156a6129a622b9284eba286737b2656.jpg?img=${index + 1}`);

const revokePreviewUrls = (urls: string[]) => {
	urls.forEach((url) => URL.revokeObjectURL(url));
};

export const EditPostModal = ({ isOpen, post, isSubmitting, onClose, onSubmit }: EditPostModalProps) => {
	const { t } = useTranslation();
	const captionId = useId();
	const fileInputRef = useRef<HTMLInputElement | null>(null);
	const selectedVibeButtonRef = useRef<HTMLButtonElement | null>(null);
	const previewUrlsRef = useRef<string[]>([]);
	const { data: vibeTags = [] } = useVibeTags();

	const [caption, setCaption] = useState('');
	const [selectedVibe, setSelectedVibe] = useState<number>(1);
	const [existingMediaUrls, setExistingMediaUrls] = useState<string[]>([]);
	const [mediaFiles, setMediaFiles] = useState<File[]>([]);
	const [mediaPreviewUrls, setMediaPreviewUrls] = useState<string[]>([]);
	const [showLocationInfo, setShowLocationInfo] = useState(false);
	const [showVibePicker, setShowVibePicker] = useState(false);
	const [vibeSearchQuery, setVibeSearchQuery] = useState('');

	const clearSelectedUploads = () => {
		setMediaPreviewUrls((prev) => {
			revokePreviewUrls(prev);
			previewUrlsRef.current = [];
			return [];
		});
		setMediaFiles([]);
		if (fileInputRef.current) {
			fileInputRef.current.value = '';
		}
	};

	const handleClose = () => {
		clearSelectedUploads();
		onClose();
	};

	useEffect(() => {
		if (!isOpen || !post) {
			return;
		}

		setCaption(post.caption);
		setSelectedVibe(post.vibeTag ?? 1);
		setExistingMediaUrls(post.images);
		setShowLocationInfo(false);
		setShowVibePicker(false);
		setVibeSearchQuery('');
		clearSelectedUploads();
	}, [isOpen, post]);

	useEffect(() => {
		if (!isOpen) {
			return;
		}

		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = 'hidden';

		return () => {
			document.body.style.overflow = previousOverflow;
		};
	}, [isOpen]);

	useEffect(
		() => () => {
			revokePreviewUrls(previewUrlsRef.current);
		},
		[]
	);

	useEffect(() => {
		previewUrlsRef.current = mediaPreviewUrls;
	}, [mediaPreviewUrls]);

	useEffect(() => {
		if (!showVibePicker || !selectedVibeButtonRef.current) {
			return;
		}

		selectedVibeButtonRef.current.scrollIntoView({ block: 'center', behavior: 'smooth' });
	}, [selectedVibe, showVibePicker]);

	const displayMediaUrls = mediaPreviewUrls.length > 0 ? mediaPreviewUrls : existingMediaUrls;
	const primaryPreview = displayMediaUrls[0];
	const mediaCount = displayMediaUrls.length;
	const vibeConfig: Record<number, { icon: typeof Sprout; color: string; bgColor: string }> = {
		1: { icon: Sprout, color: 'text-[#16A34A]', bgColor: 'bg-[#EAF7EF]' },
		2: { icon: Mountain, color: 'text-[#2563EB]', bgColor: 'bg-[#EAF0FB]' },
		3: { icon: Diamond, color: 'text-[#D97706]', bgColor: 'bg-[#FBF5E8]' },
		4: { icon: Lightbulb, color: 'text-[#9333EA]', bgColor: 'bg-[#F4ECFB]' },
		5: { icon: Globe, color: 'text-[#4F46E5]', bgColor: 'bg-[#ECEFFE]' },
		6: { icon: Home, color: 'text-[#EA580C]', bgColor: 'bg-[#FAF1E8]' },
	};
	const vibeOptions = vibeTags.map((tag) => ({
		id: tag.id,
		label: tag.name,
	}));

	const canSave = useMemo(() => {
		if (!post) {
			return false;
		}

		const trimmedCaption = caption.trim();
		const currentMediaUrls = mediaPreviewUrls.length > 0 ? buildUploadedMediaUrls(mediaFiles) : existingMediaUrls;

		return (
			trimmedCaption.length > 0 &&
			(trimmedCaption !== post.caption ||
				selectedVibe !== (post.vibeTag ?? 1) ||
				JSON.stringify(currentMediaUrls) !== JSON.stringify(post.images))
		);
	}, [caption, existingMediaUrls, mediaFiles, mediaPreviewUrls.length, post, selectedVibe]);

	const removePrimaryMedia = () => {
		if (mediaPreviewUrls.length > 0) {
			const [first, ...rest] = mediaPreviewUrls;
			if (first) {
				URL.revokeObjectURL(first);
			}
			setMediaPreviewUrls(rest);
			setMediaFiles((prev) => prev.slice(1));
			return;
		}

		setExistingMediaUrls((prev) => prev.slice(1));
	};

	const handleMediaChange = (event: ChangeEvent<HTMLInputElement>) => {
		const files = event.target.files;
		if (!files || files.length === 0) {
			return;
		}

		const selectedFiles = Array.from(files);
		const nextPreviewUrls = selectedFiles.map((file) => URL.createObjectURL(file));

		setMediaFiles((prev) => [...prev, ...selectedFiles]);
		setMediaPreviewUrls((prev) => [...prev, ...nextPreviewUrls]);
	};

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!post || !canSave || isSubmitting) {
			return;
		}

		const payload: Partial<CreatePostPayload> = {
			content: caption.trim(),
			vibeTag: selectedVibe,
			mediaUrls: mediaPreviewUrls.length > 0 ? buildUploadedMediaUrls(mediaFiles) : existingMediaUrls,
		};

		await onSubmit(post.id, payload);
		handleClose();
	};

	if (!isOpen || !post) {
		return null;
	}

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-[#6B728099] p-4">
			<div className="w-full max-w-[360px] overflow-hidden rounded-3xl bg-[#FCFCFD] shadow-2xl">
				<div className="flex items-center justify-between border-b border-[#EAECF0] px-4 py-4">
					<h3 className="text-[18px] font-semibold text-[#2F3A48]">{t('profile.user.posts.editModal.title')}</h3>
					<button
						type="button"
						onClick={handleClose}
						aria-label={t('profile.user.posts.editModal.close')}
						className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#E5E7EB] text-[#4B5563] hover:bg-[#D1D5DB]"
					>
						<X className="h-5 w-5" />
					</button>
				</div>

				<form className="space-y-4 p-4" onSubmit={handleSubmit}>
					<div className="flex items-center gap-2 px-1">
						<div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1F58A5] text-sm font-semibold text-white">
							{post.author.charAt(0).toUpperCase()}
						</div>
						<div>
							<p className="text-[17px] font-semibold text-[#2F3A48]">{post.author}</p>
							<div className="inline-flex items-center gap-2 rounded-full bg-[#E5E7EB] px-3 py-1 text-xs font-semibold text-[#111827]">
								<Tag className="h-3.5 w-3.5" />
								<span>{t('profile.user.posts.editModal.privacyLabel')}</span>
							</div>
						</div>
					</div>

					<label htmlFor={captionId} className="sr-only">
						{t('profile.user.posts.editModal.captionLabel')}
					</label>
					<textarea
						id={captionId}
						value={caption}
						onChange={(event) => setCaption(event.target.value)}
						rows={3}
						className="w-full resize-none bg-transparent px-1 text-[26px] leading-tight text-[#2F3A48] outline-none placeholder:text-[#C0C4CC]"
						placeholder={t('profile.user.posts.editModal.captionPlaceholder', { name: post.author })}
					/>

					{primaryPreview ? (
						<div className="relative overflow-hidden rounded-2xl border border-[#D9DEE6] bg-white">
							<img src={primaryPreview} alt={t('profile.user.posts.editModal.mediaPreviewAlt')} className="h-64 w-full object-cover" />
							<div className="absolute left-3 top-3">
								<button
									type="button"
									onClick={() => fileInputRef.current?.click()}
									className="inline-flex items-center gap-2 rounded-2xl bg-white px-3 py-2 text-base font-semibold text-[#111827] shadow-sm"
								>
									<Pencil className="h-4 w-4" />
									{t('profile.user.posts.editModal.changeMedia')}
								</button>
							</div>
							<button
								type="button"
								onClick={removePrimaryMedia}
								aria-label={t('profile.user.posts.editModal.removeMedia')}
								className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#4B5563] shadow-sm"
							>
								<X className="h-5 w-5" />
							</button>
							{mediaCount > 1 ? (
								<div className="absolute bottom-3 right-3 rounded-full bg-black/65 px-2.5 py-1 text-xs font-semibold text-white">
									+{mediaCount - 1}
								</div>
							) : null}
						</div>
					) : null}

					<div className="rounded-2xl bg-[#EEF2F6] p-2.5">
						<div className="flex items-center justify-between gap-3">
							<p className="text-sm font-semibold text-[#4B5563]">{t('profile.user.posts.editModal.addToPost')}</p>
							<div className="flex items-center gap-2">
								<input
									ref={fileInputRef}
									type="file"
									accept="image/*"
									multiple
									onChange={handleMediaChange}
									className="hidden"
								/>
								<button
									type="button"
									onClick={() => fileInputRef.current?.click()}
									aria-label={t('profile.user.posts.editModal.addMedia')}
										className="flex h-8 w-8 items-center justify-center rounded-full bg-[#DCE7F5] text-[#1F58A5] hover:bg-[#CADBF2]"
								>
									<ImagePlus className="h-4 w-4" />
								</button>
									<button
										type="button"
										onClick={() => setShowLocationInfo((prev) => !prev)}
										aria-label={t('social.feed.createModal.locationLabel')}
										className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
											showLocationInfo ? 'bg-[#1F58A5] text-white' : 'bg-[#DCE7F5] text-[#1F58A5] hover:bg-[#CADBF2]'
										}`}
									>
										<MapPin className="h-4 w-4" />
									</button>
									<button
										type="button"
										onClick={() => setShowVibePicker((prev) => !prev)}
										aria-label={t('social.feed.createModal.tagLabel')}
										className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
											showVibePicker || selectedVibe ? 'bg-[#1F58A5] text-white' : 'bg-[#DCE7F5] text-[#1F58A5] hover:bg-[#CADBF2]'
										}`}
									>
										<Tag className="h-4 w-4" />
									</button>
							</div>
						</div>

						{showLocationInfo ? (
							<div className="mt-2 rounded-xl border border-[#D9DEE6] bg-white px-3 py-2 text-sm text-[#1F2937]">
								<span className="font-semibold text-[#4B5563]">{t('social.feed.createModal.locationLabel')}:</span>{' '}
								{post.location}
							</div>
						) : null}

						{showVibePicker ? (
							<div className="mt-2 flex h-[420px] flex-col overflow-hidden rounded-xl border border-[#D9DEE6] bg-white">
								<div className="flex items-center gap-3 border-b border-[#EAECF0] px-4 py-3">
									<button
										type="button"
										onClick={() => setShowVibePicker(false)}
										className="rounded-full p-1.5 text-[#6B7280] transition-colors hover:bg-[#EEF2F7]"
									>
										<ArrowLeft className="h-5 w-5" />
									</button>
									<div className="min-w-0 flex-1">
										<h3 className="text-[18px] font-semibold text-[#111827]">{t('social.feed.createModal.vibePickerTitle')}</h3>
										<p className="truncate text-sm text-[#6B7280]">
											{t('profile.user.posts.editModal.feelingLabel')}{' '}
											<span className="font-semibold text-[#1F58A5]">
												{vibeTags.find((tag) => tag.id === selectedVibe)?.name ?? ''}
											</span>
										</p>
									</div>
								</div>

								<div className="px-4 py-3">
									<div className="relative">
										<Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#6B7280]" />
										<input
											type="text"
											value={vibeSearchQuery}
											onChange={(event) => setVibeSearchQuery(event.target.value)}
											placeholder={t('social.feed.createModal.vibeSearchPlaceholder')}
											className="h-12 w-full rounded-[28px] border-none bg-[#E7E9EC] py-3 pl-12 pr-5 text-[15px] font-medium text-[#111827] outline-none placeholder:text-[#6B7280]"
										/>
									</div>
								</div>

								<div className="flex-1 overflow-y-auto pb-4">
									<div className="flex flex-col px-4">
										{vibeOptions
											.filter((tag) => tag.label.toLowerCase().includes(vibeSearchQuery.toLowerCase()))
											.map((tag) => {
												const config = vibeConfig[tag.id];
												const Icon = config?.icon || Tag;
												const isSelected = selectedVibe === tag.id;
												return (
													<button
														key={tag.id}
														type="button"
														onClick={() => {
															setSelectedVibe(tag.id);
															setShowVibePicker(false);
														}}
														ref={isSelected ? selectedVibeButtonRef : null}
														className={`flex items-center gap-4 border-b border-[#D8DDE5] py-5 text-left transition-colors hover:bg-[#F9FAFB] ${
															isSelected ? 'bg-[#F6F9FF]' : ''
														}`}
													>
														<div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${config?.bgColor || 'bg-gray-50'}`}>
															<Icon className={`h-6 w-6 ${config?.color || 'text-gray-500'}`} />
														</div>
														<span className={`text-[16px] font-medium leading-[1.3] ${isSelected ? 'text-[#1F58A5]' : 'text-[#111827]'}`}>
															{tag.label}
														</span>
													</button>
												);
											})}
										{vibeOptions.filter((tag) => tag.label.toLowerCase().includes(vibeSearchQuery.toLowerCase())).length === 0 && vibeSearchQuery.length > 0 ? (
											<p className="px-1 text-center text-base text-[#6B7280]">{t('social.feed.createModal.vibeEmptySearch')}</p>
										) : null}
									</div>
								</div>
							</div>
							) : null}
					</div>

					<div className="pt-1">
						<button
							type="submit"
							disabled={!canSave || isSubmitting}
							className="w-full rounded-xl bg-[#1F58A5] px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-[#D1D5DB]"
						>
							{isSubmitting ? t('profile.user.posts.editModal.saving') : t('profile.user.posts.editModal.save')}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};