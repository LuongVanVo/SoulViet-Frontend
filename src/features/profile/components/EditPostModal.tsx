import { useEffect, useId, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { ImagePlus, MapPin, Pencil, Tag, X, ArrowLeft, Search, Sprout, Mountain, Diamond, Lightbulb, Globe, Home, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { mediaApi, touristApi, apiService } from '@/services';
import { useVibeTags } from '@/hooks';
import type { CreatePostPayload, PostMediaPayload, SocialPost, FileUploadRequest, TouristAttractionCardItem } from '@/types';
import { LocationMapPickerModal } from '@/features/social/components/socialFeed/LocationMapPickerModal';
import { getPostCheckinLocationId, getPostLocationName, SOCIAL_LOCATION_ID_REGEX } from '@/utils/socialLocation';

interface EditPostModalProps {
	isOpen: boolean;
	post: SocialPost | null;
	isSubmitting: boolean;
	onClose: () => void;
	onSubmit: (postId: string, payload: Partial<CreatePostPayload>) => Promise<void>;
}

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
	const [existingMedia, setExistingMedia] = useState<{ url: string; type: 'image' | 'video'; objectKey: string }[]>([]);
	const [aspectRatio, setAspectRatio] = useState<'horizontal' | 'vertical' | 'square'>('square');
	const [mediaFiles, setMediaFiles] = useState<File[]>([]);
	const [mediaPreviewItems, setMediaPreviewItems] = useState<{ url: string; type: 'image' | 'video'; objectKey: string }[]>([]);
	const [selectedLocation, setSelectedLocation] = useState<TouristAttractionCardItem | null>(null);
	const [isLocationPickerOpen, setIsLocationPickerOpen] = useState(false);
	const [touristLocations, setTouristLocations] = useState<TouristAttractionCardItem[]>([]);
	const [isLoadingLocations, setIsLoadingLocations] = useState(false);
	const [showVibePicker, setShowVibePicker] = useState(false);
	const [vibeSearchQuery, setVibeSearchQuery] = useState('');

	const clearSelectedUploads = () => {
		setMediaPreviewItems((prev) => {
			revokePreviewUrls(prev.map(item => item.url));
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

		setCaption(post.caption ?? '');
		setSelectedVibe(post.vibeTag ?? 1);
		setExistingMedia(post.media || []);
		setAspectRatio(post.aspectRatio || 'square');
		const postLocationName = getPostLocationName(post);
		const postLocationId = getPostCheckinLocationId(post);
		if (postLocationId || postLocationName) {
			setSelectedLocation({
				id: postLocationId || '',
				name: postLocationName || '',
				address: '',
				tagId: '',
				likes: 0,
				imageUrl: '',
			});
		} else {
			setSelectedLocation(null);
		}
		setShowVibePicker(false);
		setVibeSearchQuery('');
		clearSelectedUploads();
	}, [isOpen, post?.id]);

	useEffect(() => {
		if (!isOpen) return;

		let cancelled = false;
		if (touristLocations.length > 0) return;

		const loadLocations = async () => {
			setIsLoadingLocations(true);
			try {
				const response = await touristApi.getTouristAttractions();
				if (!cancelled) {
					if (response.items.length > 0) {
						setTouristLocations(response.items);
						return;
					}
					const fallback = await apiService.getTouristAttractionsCards();
					setTouristLocations(fallback.items);
				}
			} catch (error) {
				if (!cancelled) {
					console.warn('Using fallback locations for edit post map.', error);
					const fallback = await apiService.getTouristAttractionsCards();
					setTouristLocations(fallback.items);
				}
			} finally {
				if (!cancelled) setIsLoadingLocations(false);
			}
		};

		loadLocations();

		return () => {
			cancelled = true;
		};
	}, [isOpen, touristLocations.length]);

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
		previewUrlsRef.current = mediaPreviewItems.map(item => item.url);
	}, [mediaPreviewItems]);

	const [currentIndex, setCurrentIndex] = useState(0);
	const scrollRef = useRef<HTMLDivElement>(null);

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

	const displayMedia = [...existingMedia, ...mediaPreviewItems];
	const mediaCount = displayMedia.length;

	const removeMediaAtIndex = (index: number) => {
		if (index < existingMedia.length) {
			const newItems = [...existingMedia];
			newItems.splice(index, 1);
			setExistingMedia(newItems);
		} else {
			const previewIndex = index - existingMedia.length;
			const newItems = [...mediaPreviewItems];
			const removed = newItems.splice(previewIndex, 1);
			if (removed[0]) {
				URL.revokeObjectURL(removed[0].url);
			}
			setMediaPreviewItems(newItems);
			setMediaFiles((prev) => {
				const newFiles = [...prev];
				newFiles.splice(previewIndex, 1);
				return newFiles;
			});
		}

		if (currentIndex >= mediaCount - 1 && currentIndex > 0) {
			setCurrentIndex(currentIndex - 1);
		}
	};

	const vibeConfig: Record<number, { icon: typeof Sprout; color: string; bgColor: string }> = {
		1: { icon: Sprout, color: 'text-[#16A34A]', bgColor: 'bg-[#EAF7EF]' },
		2: { icon: Mountain, color: 'text-[#2563EB]', bgColor: 'bg-[#EAF0FB]' },
		3: { icon: Diamond, color: 'text-[#D97706]', bgColor: 'bg-[#FBF5E8]' },
		4: { icon: Lightbulb, color: 'text-[#9333EA]', bgColor: 'bg-[#F4ECFB]' },
		5: { icon: Globe, color: 'text-[#4F46E5]', bgColor: 'bg-[#ECEFFE]' },
		6: { icon: Home, color: 'text-[#EA580C]', bgColor: 'bg-[#FAF1E8]' },
	};
	const vibeOptions = vibeTags.map((tag: any) => ({
		id: tag.id,
		label: tag.name,
	}));

	const canSave = useMemo(() => {
		if (!post) {
			return false;
		}

		const trimmedCaption = caption.trim();
		const hasMediaChanges = mediaFiles.length > 0 || JSON.stringify(existingMedia) !== JSON.stringify(post.media);
		const hasContent = trimmedCaption.length > 0 || displayMedia.length > 0 || Boolean(post.checkinLocationId) || Boolean(selectedLocation);

		return (
			hasContent &&
			(trimmedCaption !== (post.caption ?? '') ||
				selectedVibe !== (post.vibeTag ?? 1) ||
				aspectRatio !== (post.aspectRatio || 'square') ||
				hasMediaChanges ||
				(Boolean(selectedLocation) !== Boolean(post.checkinLocationId) || (selectedLocation?.name ?? '') !== (post.location ?? '')))
		);
	}, [caption, existingMedia, mediaFiles, displayMedia.length, post, selectedVibe, aspectRatio, selectedLocation]);

	useEffect(() => {
		if (!showVibePicker || !selectedVibeButtonRef.current) {
			return;
		}

		selectedVibeButtonRef.current.scrollIntoView({ block: 'center', behavior: 'smooth' });
	}, [selectedVibe, showVibePicker]);

	const handleMediaChange = (event: ChangeEvent<HTMLInputElement>) => {
		const files = event.target.files;
		if (!files || files.length === 0) {
			return;
		}

		const selectedFiles = Array.from(files);
		const nextPreviewItems = selectedFiles.map((file) => ({
			url: URL.createObjectURL(file),
			type: (file.type.startsWith('video/') ? 'video' : 'image') as 'image' | 'video',
			objectKey: '',
		}));

		setMediaFiles((prev) => [...prev, ...selectedFiles]);
		setMediaPreviewItems((prev) => [...prev, ...nextPreviewItems]);
	};


	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!post || !canSave || isSubmitting) {
			return;
		}

		try {
			let finalMedia: PostMediaPayload[] = [];

			const mappedExistingMedia = existingMedia.map((m, idx) => ({
				url: m.url,
				objectKey: m.objectKey,
				mediaType: m.type === 'video' ? 2 : 1,
				width: 0,
				height: 0,
				fileSizeBytes: 0,
				sortOrder: idx,
			}));

			if (mediaFiles.length > 0) {
				const uploadRequests: FileUploadRequest[] = mediaFiles.map((file) => ({
					fileName: file.name,
					contentType: file.type,
				}));

				const presignedUrls = await mediaApi.getSocialPostPresignedUrls(uploadRequests);

				const uploadTasks = mediaFiles.map(async (file, index) => {
					const presignedInfo = presignedUrls[index];
					await mediaApi.uploadFileToR2(presignedInfo.uploadUrl, file, presignedInfo.fileName);
					const currentSortOrder = mappedExistingMedia.length + index;
					return {
						url: presignedInfo.publicUrl,
						objectKey: presignedInfo.objectKey,
						mediaType: presignedInfo.mediaType,
						width: 0,
						height: 0,
						fileSizeBytes: file.size,
						sortOrder: currentSortOrder,
					};
				});

				const newMedia = await Promise.all(uploadTasks);
				finalMedia = [...mappedExistingMedia, ...newMedia];
			} else {
				finalMedia = mappedExistingMedia;
			}

			const rawLocationId = selectedLocation?.id;
			const isIdValidGuid = rawLocationId ? SOCIAL_LOCATION_ID_REGEX.test(rawLocationId.trim()) : false;
			const finalLocationId = isIdValidGuid && rawLocationId ? rawLocationId.trim() : undefined;

			const payload = {
				id: post.id,
				userId: post.userId,
				content: caption.trim() || undefined,
				media: finalMedia,
				taggedProductIds: [],
				vibeTag: selectedVibe,
				checkinLocationId: finalLocationId || null,
				checkinLocationName: selectedLocation?.name || undefined,
				aspectRatio: aspectRatio,
			};

			await onSubmit(post.id, payload as any);
			handleClose();
		} catch (error) {
			console.error('Failed to update post media:', (error as any)?.response?.data ?? error);
		}
	};

	if (!isOpen || !post) {
		return null;
	}

	return (
		<div className="fixed inset-0 z-[100] flex items-end justify-center bg-[#6B728099] p-0 sm:items-center sm:p-4" onClick={handleClose}>
			<div 
				className="relative flex w-full max-w-full max-h-[calc(100dvh-0.5rem)] flex-col overflow-hidden rounded-t-[2rem] bg-[#FCFCFD] shadow-2xl sm:max-w-[360px] sm:max-h-[calc(100dvh-2rem)] sm:rounded-3xl"
				onClick={(e) => e.stopPropagation()}
			>
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

				<form className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4 scrollbar-hide" onSubmit={handleSubmit}>
					<div className="flex items-center gap-2 px-1">
						<div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1F58A5] text-sm font-semibold text-white">
							{post.author.charAt(0).toUpperCase()}
						</div>
						<div>
							<p className="text-[17px] font-semibold text-[#2F3A48]">{post.author}</p>
						</div>
					</div>

					<textarea
						id={captionId}
						value={caption}
						onChange={(event) => setCaption(event.target.value)}
						rows={3}
						className="w-full resize-none bg-transparent px-1 text-[26px] leading-tight text-[#2F3A48] outline-none placeholder:text-[#C0C4CC]"
						placeholder={t('profile.user.posts.editModal.captionPlaceholder', { name: post.author })}
					/>

					{post.type !== 'shared-post' && (
						<>
							<div className="flex gap-2 px-1">
								<button
									type="button"
									onClick={() => setAspectRatio('square')}
									className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${aspectRatio === 'square' ? 'bg-[#1F58A5] text-white' : 'bg-[#F0F2F5] text-[#4B5563] hover:bg-[#E4E6E9]'}`}
								>
									{t('social.feed.createModal.aspectRatio.square', { defaultValue: '1:1' })}
								</button>
								<button
									type="button"
									onClick={() => setAspectRatio('horizontal')}
									className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${aspectRatio === 'horizontal' ? 'bg-[#1F58A5] text-white' : 'bg-[#F0F2F5] text-[#4B5563] hover:bg-[#E4E6E9]'}`}
								>
									{t('social.feed.createModal.aspectRatio.horizontal', { defaultValue: '16:9' })}
								</button>
								<button
									type="button"
									onClick={() => setAspectRatio('vertical')}
									className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${aspectRatio === 'vertical' ? 'bg-[#1F58A5] text-white' : 'bg-[#F0F2F5] text-[#4B5563] hover:bg-[#E4E6E9]'}`}
								>
									{t('social.feed.createModal.aspectRatio.vertical', { defaultValue: '4:5' })}
								</button>
							</div>

							{mediaCount > 0 ? (
								<div className="relative group overflow-hidden rounded-2xl border border-[#D9DEE6] bg-[#F8FAFC]">
									<div
										ref={scrollRef}
										onScroll={handleScroll}
										className={`flex snap-x snap-mandatory overflow-x-auto scrollbar-hide w-full ${aspectRatio === 'vertical'
											? 'aspect-[4/5]'
											: (aspectRatio === 'horizontal' ? 'aspect-[16/9]' : 'aspect-square')
											}`}
									>
										{displayMedia.map((item, idx) => (
											<div key={idx} className="w-full shrink-0 snap-center relative flex items-center justify-center overflow-hidden">
												{item.type === 'video' ? (
													<video src={item.url} className="h-full w-full object-contain bg-black" controls />
												) : (
													<img src={item.url} alt="" className="h-full w-full object-contain" />
												)}

												<div className="absolute left-3 top-3 z-10">
													<button
														type="button"
														onClick={() => fileInputRef.current?.click()}
														className="inline-flex items-center gap-2 rounded-2xl bg-white/90 px-3 py-2 text-sm font-semibold text-[#111827] shadow-sm backdrop-blur-sm"
													>
														<Pencil className="h-3.5 w-3.5" />
														{t('profile.user.posts.editModal.changeMedia')}
													</button>
												</div>

												<button
													type="button"
													onClick={() => removeMediaAtIndex(idx)}
													className="absolute right-3 top-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-[#4B5563] shadow-sm backdrop-blur-sm"
												>
													<X className="h-5 w-5" />
												</button>
											</div>
										))}
									</div>

									{mediaCount > 1 && (
										<>
											<button
												type="button"
												onClick={() => scroll('left')}
												className={`absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-1 shadow-md z-10 transition-opacity ${currentIndex === 0 ? 'opacity-0' : 'opacity-100'}`}
											>
												<ChevronLeft className="h-4 w-4" />
											</button>
											<button
												type="button"
												onClick={() => scroll('right')}
												className={`absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-1 shadow-md z-10 transition-opacity ${currentIndex === mediaCount - 1 ? 'opacity-0' : 'opacity-100'}`}
											>
												<ChevronRight className="h-4 w-4" />
											</button>

											<div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1 px-2 py-1 z-10">
												{displayMedia.map((_, idx) => (
													<div
														key={idx}
														className={`h-1 w-1 rounded-full transition-all ${idx === currentIndex ? 'bg-blue-600 w-2' : 'bg-gray-300'}`}
													/>
												))}
											</div>
										</>
									)}
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
											onClick={() => setIsLocationPickerOpen(true)}
											aria-label={t('social.feed.createModal.locationLabel')}
											className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${isLocationPickerOpen || selectedLocation ? 'bg-[#1F58A5] text-white' : 'bg-[#DCE7F5] text-[#1F58A5] hover:bg-[#CADBF2]'
												}`}
										>
											<MapPin className="h-4 w-4" />
										</button>
										<button
											type="button"
											onClick={() => setShowVibePicker((prev) => !prev)}
											aria-label={t('social.feed.createModal.tagLabel')}
											className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${showVibePicker || selectedVibe ? 'bg-[#1F58A5] text-white' : 'bg-[#DCE7F5] text-[#1F58A5] hover:bg-[#CADBF2]'
												}`}
										>
											<Tag className="h-4 w-4" />
										</button>
									</div>
								</div>

								{selectedLocation ? (
									<div className="mt-2 flex items-center justify-between rounded-xl border border-[#D9DEE6] bg-white px-3 py-2">
										<div className="flex items-center gap-2 overflow-hidden">
											<MapPin className="h-4 w-4 shrink-0 text-[#1F58A5]" />
											<span className="truncate text-sm font-medium text-[#1F2937]">{selectedLocation.name}</span>
										</div>
										<button
											type="button"
											onClick={() => setSelectedLocation(null)}
											className="rounded-full p-1 text-[#9CA3AF] hover:bg-[#F3F4F6] hover:text-[#4B5563]"
										>
											<X className="h-3 w-3" />
										</button>
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
													{t('social.feed.createModal.vibePickerSubtitle', { defaultValue: 'Bạn đang cảm thấy thế nào?' })}{' '}
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
													.filter((tag: any) => tag.label.toLowerCase().includes(vibeSearchQuery.toLowerCase()))
													.map((tag: any) => {
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
																className={`flex items-center gap-4 border-b border-[#D8DDE5] py-5 text-left transition-colors hover:bg-[#F9FAFB] ${isSelected ? 'bg-[#F6F9FF]' : ''
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
												{vibeOptions.filter((tag: any) => tag.label.toLowerCase().includes(vibeSearchQuery.toLowerCase())).length === 0 && vibeSearchQuery.length > 0 ? (
													<p className="px-1 text-center text-base text-[#6B7280]">{t('social.feed.createModal.vibeEmptySearch')}</p>
												) : null}
											</div>
										</div>
									</div>
								) : null}
							</div>
						</>
					)}

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

				<LocationMapPickerModal
					isOpen={isLocationPickerOpen}
					locations={touristLocations}
					selectedLocationId={selectedLocation?.id ?? null}
					isLoadingLocations={isLoadingLocations}
					title={t('social.feed.createModal.locationPickerTitle')}
					searchHint={t('social.feed.createModal.locationPickerHint')}
					loadingText={t('social.feed.createModal.locationPickerLoading')}
					emptyText={t('social.feed.createModal.locationPickerEmpty')}
					selectButtonText={t('social.feed.createModal.locationPickerConfirm')}
					onClose={() => setIsLocationPickerOpen(false)}
					onSelect={(location) => {
						setSelectedLocation(location);
						setIsLocationPickerOpen(false);
					}}
				/>
			</div>
		</div>
	);
};