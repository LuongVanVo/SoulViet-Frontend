import { useEffect, useId, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import axios from 'axios';
import {
  ImagePlus,
  MapPin,
  Tag,
  X,
  ArrowLeft,
  Search,
  Sprout,
  Mountain,
  Diamond,
  Lightbulb,
  Globe,
  Home,
  Pencil,
  type LucideIcon,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { apiService, postApi, touristApi, mediaApi } from '@/services';
import { useAuthStore } from '@/store';
import type { CreatePostModalProps, PostMediaPayload, TouristAttractionCardItem, FileUploadRequest } from '@/types';
import { LocationMapPickerModal } from './LocationMapPickerModal';

const GUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;



export const CreatePostModal = ({ isOpen, onClose, initialAction = null }: CreatePostModalProps) => {
  const { t } = useTranslation();
  const inputId = useId();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const user = useAuthStore((state) => state.user);

  const [caption, setCaption] = useState('');
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaNames, setMediaNames] = useState<string[]>([]);
  const [mediaPreviewUrls, setMediaPreviewUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const [selectedVibe, setSelectedVibe] = useState<number | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<TouristAttractionCardItem | null>(null);
  const [isLocationPickerOpen, setIsLocationPickerOpen] = useState(false);
  const [touristLocations, setTouristLocations] = useState<TouristAttractionCardItem[]>([]);
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);

  const [isSelectingVibe, setIsSelectingVibe] = useState(false);
  const [vibeSearchQuery, setVibeSearchQuery] = useState('');
  const appliedInitialActionRef = useRef<'photo' | 'location' | 'vibe' | null>(null);

  const vibeConfig: Record<number, { icon: LucideIcon; color: string; bgColor: string }> = {
    1: { icon: Sprout, color: 'text-[#16A34A]', bgColor: 'bg-[#EAF7EF]' },
    2: { icon: Mountain, color: 'text-[#2563EB]', bgColor: 'bg-[#EAF0FB]' },
    3: { icon: Diamond, color: 'text-[#D97706]', bgColor: 'bg-[#FBF5E8]' },
    4: { icon: Lightbulb, color: 'text-[#9333EA]', bgColor: 'bg-[#F4ECFB]' },
    5: { icon: Globe, color: 'text-[#4F46E5]', bgColor: 'bg-[#ECEFFE]' },
    6: { icon: Home, color: 'text-[#EA580C]', bgColor: 'bg-[#FAF1E8]' },
  };

  const [aspectRatio, setAspectRatio] = useState<'horizontal' | 'vertical' | 'square'>('square');

  const vibeOptions = [1, 2, 3, 4, 5, 6].map((id) => ({
    id,
    label: t(`social.feed.createModal.vibeNames.${id}`),
  }));

  useEffect(() => {
    if (!isOpen) {
      appliedInitialActionRef.current = null;
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (touristLocations.length > 0) {
      return;
    }

    let cancelled = false;

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
          console.warn('Using fallback locations for create post map.', error);
          const fallback = await apiService.getTouristAttractionsCards();
          setTouristLocations(fallback.items);
        }
      } finally {
        if (!cancelled) {
          setIsLoadingLocations(false);
        }
      }
    };

    loadLocations();

    return () => {
      cancelled = true;
    };
  }, [isOpen, touristLocations.length]);

  useEffect(() => {
    if (!isOpen || !initialAction) {
      return;
    }

    if (appliedInitialActionRef.current === initialAction) {
      return;
    }

    appliedInitialActionRef.current = initialAction;

    if (initialAction === 'photo') {
      fileInputRef.current?.click();
      return;
    }

    if (initialAction === 'location') {
      setIsLocationPickerOpen(true);
      return;
    }

    if (initialAction === 'vibe') {
      setIsSelectingVibe(true);
    }
  }, [initialAction, isOpen]);

  if (!isOpen) {
    return null;
  }

  const clearMedia = () => {
    mediaPreviewUrls.forEach((url) => URL.revokeObjectURL(url));
    setMediaFiles([]);
    setMediaNames([]);
    setMediaPreviewUrls([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleMediaChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) {
      return;
    }

    const selectedFiles = Array.from(files);
    const nextPreviewUrls = selectedFiles.map((file) => URL.createObjectURL(file));

    setMediaFiles((prev) => [...prev, ...selectedFiles]);
    setMediaNames((prev) => [...prev, ...selectedFiles.map((file) => file.name)]);
    setMediaPreviewUrls((prev) => [...prev, ...nextPreviewUrls]);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeMediaAt = (index: number) => {
    const previewUrl = mediaPreviewUrls[index];
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setMediaFiles((prev) => prev.filter((_, idx) => idx !== index));
    setMediaNames((prev) => prev.filter((_, idx) => idx !== index));
    setMediaPreviewUrls((prev) => prev.filter((_, idx) => idx !== index));
  };

  const resetForm = () => {
    setCaption('');
    clearMedia();
    setSelectedVibe(null);
    setSelectedLocation(null);
    setIsSelectingVibe(false);
    setIsLocationPickerOpen(false);
    setVibeSearchQuery('');
    setSubmitError('');
    setIsSubmitting(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canPublish || isSubmitting) {
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError('');

      let uploadedMedia: PostMediaPayload[] = [];
      if (mediaFiles.length > 0) {
        const uploadRequests: FileUploadRequest[] = mediaFiles.map((file) => ({
          fileName: file.name,
          contentType: file.type,
        }));

        const presignedUrls = await mediaApi.getSocialPostPresignedUrls(uploadRequests);

        const uploadTasks = mediaFiles.map(async (file, index) => {
          const presignedInfo = presignedUrls[index];
          await mediaApi.uploadFileToR2(presignedInfo.uploadUrl, file, presignedInfo.fileName);
          return {
            url: presignedInfo.publicUrl,
            Url: presignedInfo.publicUrl,
            objectKey: presignedInfo.objectKey,
            ObjectKey: presignedInfo.objectKey,
            mediaType: presignedInfo.mediaType,
            MediaType: presignedInfo.mediaType,
            width: 0,
            Width: 0,
            height: 0,
            Height: 0,
            fileSizeBytes: file.size,
            FileSizeBytes: file.size,
            sortOrder: index,
            SortOrder: index,
          };
        });

        uploadedMedia = await Promise.all(uploadTasks);
      }

      const normalizedContent = caption.trim();
      const resolvedCheckinLocationId =
        selectedLocation?.id && GUID_REGEX.test(selectedLocation.id)
          ? selectedLocation.id
          : undefined;

      const payload: any = {
        content: normalizedContent || undefined,
        media: uploadedMedia,
        Media: uploadedMedia,
        aspectRatio: aspectRatio,
        AspectRatio: aspectRatio,
        taggedProductIds: [],
        vibeTag: selectedVibe ?? 0,
        checkinLocationId: resolvedCheckinLocationId,
      };

      console.log('Publishing post with payload:', payload);

      await postApi.createPost(payload);
      handleClose();
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const data = error.response?.data as unknown;

        if (typeof data === 'string' && data.trim()) {
          setSubmitError(data);
        } else if (typeof data === 'object' && data !== null) {
          const normalized = data as {
            message?: string;
            title?: string;
            errors?: Record<string, string[] | string>;
          };

          if (normalized.message) {
            setSubmitError(normalized.message);
          } else if (normalized.title) {
            setSubmitError(normalized.title);
          } else if (normalized.errors) {
            const firstFieldError = Object.values(normalized.errors)[0];
            setSubmitError(Array.isArray(firstFieldError) ? firstFieldError[0] : firstFieldError);
          } else {
            setSubmitError(t('social.feed.createModal.submitError'));
          }
        } else {
          setSubmitError(t('social.feed.createModal.submitError'));
        }
      } else {
        setSubmitError(t('social.feed.createModal.submitError'));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const userName = user?.name ?? t('social.feed.createModal.defaultUserName');
  const canPublish = caption.trim().length > 0 || mediaFiles.length > 0 || Boolean(selectedLocation);
  const avatarInitial = userName.charAt(0).toUpperCase();
  const primaryPreview = mediaPreviewUrls[0];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[#6B728099] p-4 sm:items-center">
      <div className="relative w-full max-w-[360px] overflow-hidden rounded-3xl bg-[#FCFCFD] shadow-2xl max-h-[calc(100dvh-2rem)] sm:max-w-[420px]">
        {isSelectingVibe ? (
          <div className="flex max-h-[calc(100dvh-2rem)] flex-col bg-[#FCFCFD]">
            <div className="flex items-center gap-3 border-b border-[#EAECF0] px-5 py-4">
              <button
                type="button"
                onClick={() => setIsSelectingVibe(false)}
                className="rounded-full p-1.5 text-[#6B7280] transition-colors hover:bg-[#EEF2F7]"
              >
                <ArrowLeft className="h-6 w-6" />
              </button>
              <h3 className="text-[18px] font-semibold text-[#111827]">{t('social.feed.createModal.vibePickerTitle')}</h3>
            </div>

            <div className="px-5 py-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#6B7280]" />
                <input
                  type="text"
                  value={vibeSearchQuery}
                  onChange={(e) => setVibeSearchQuery(e.target.value)}
                  placeholder={t('social.feed.createModal.vibeSearchPlaceholder')}
                  className="h-14 w-full rounded-[28px] border-none bg-[#E7E9EC] py-3 pl-12 pr-5 text-[16px] font-medium text-[#111827] outline-none placeholder:text-[#6B7280]"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto pb-5">
              <div className="flex flex-col px-5">
                {vibeOptions
                  .filter((tag) => tag.label.toLowerCase().includes(vibeSearchQuery.toLowerCase()))
                  .map((tag) => {
                    const config = vibeConfig[tag.id];
                    const Icon = config?.icon || Tag;
                    return (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => {
                          setSelectedVibe(tag.id);
                          setIsSelectingVibe(false);
                        }}
                        className="flex items-center gap-4 border-b border-[#D8DDE5] py-7 text-left transition-colors hover:bg-[#F9FAFB]"
                      >
                        <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full ${config?.bgColor || 'bg-gray-50'}`}>
                          <Icon className={`h-7 w-7 ${config?.color || 'text-gray-500'}`} />
                        </div>
                        <span className="text-[16px] font-medium leading-[1.3] text-[#111827]">{tag.label}</span>
                      </button>
                    );
                  })}
                {vibeOptions.filter((tag) => tag.label.toLowerCase().includes(vibeSearchQuery.toLowerCase())).length === 0 &&
                vibeSearchQuery.length > 0 ? (
                  <p className="px-1 text-center text-base text-[#6B7280]">{t('social.feed.createModal.vibeEmptySearch')}</p>
                ) : null}
              </div>
            </div>
          </div>
        ) : (
          <div className="max-h-[calc(100dvh-2rem)] overflow-y-auto p-4">
            <div className="flex items-center gap-2 border-b border-[#EAECF0] pb-3">
              <button
                type="button"
                onClick={handleClose}
                aria-label={t('social.feed.createModal.close')}
                className="rounded-full p-1.5 text-[#6B7280] transition-colors hover:bg-[#EEF2F7]"
              >
                <X className="h-4 w-4" />
              </button>
              <h3 className="text-lg font-semibold text-[#2F3A48]">{t('social.feed.createModal.title')}</h3>
            </div>

            <form className="space-y-4 pt-3" onSubmit={handleSubmit}>
              <div className="flex items-center gap-2 px-1">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt={userName} className="h-9 w-9 rounded-full object-cover" />
                ) : (
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1F58A5] text-sm font-semibold text-white">
                    {avatarInitial}
                  </div>
                )}
                <div className="flex flex-col">
                  <p className="text-[17px] font-semibold text-[#2F3A48]">{userName}</p>
                  {selectedVibe ? (
                    <p className="text-sm text-[#6B7280]">
                      {t('social.feed.createModal.vibeLabelPrefix')}{' '}
                      <span className="font-semibold text-[#1F58A5]">
                        {selectedVibe ? t(`social.feed.createModal.vibeNames.${selectedVibe}`) : ''}
                      </span>
                    </p>
                  ) : null}
                </div>
              </div>

              <div>
                <label htmlFor={inputId} className="sr-only">
                  {t('social.feed.createModal.captionLabel')}
                </label>
                <textarea
                  id={inputId}
                  value={caption}
                  onChange={(event) => setCaption(event.target.value)}
                  rows={3}
                  placeholder={t('social.feed.createModal.captionPlaceholder', { name: userName })}
                  className="w-full resize-none bg-transparent px-1 text-[26px] leading-tight text-[#2F3A48] outline-none placeholder:text-[#C0C4CC]"
                />
              </div>

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

              {primaryPreview ? (
                <div className="relative overflow-hidden rounded-2xl border border-[#D9DEE6] bg-white">
                  <img src={primaryPreview} alt={t('social.feed.createModal.mediaPreviewAlt')} className="h-64 w-full object-cover" />

                  <div className="absolute left-3 top-3">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-2 rounded-2xl bg-white px-3 py-2 text-base font-semibold text-[#111827] shadow-sm"
                    >
                      <Pencil className="h-4 w-4" />
                      {t('social.feed.createModal.editMedia')}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeMediaAt(0)}
                    aria-label={t('social.feed.createModal.removeMedia')}
                    className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#4B5563] shadow-sm"
                  >
                    <X className="h-5 w-5" />
                  </button>

                  {mediaPreviewUrls.length > 1 ? (
                    <div className="absolute bottom-3 right-3 rounded-full bg-black/65 px-2.5 py-1 text-xs font-semibold text-white">
                      +{mediaPreviewUrls.length - 1}
                    </div>
                  ) : null}
                </div>
              ) : null}

              <div className="rounded-2xl bg-[#EEF2F6] p-2.5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-[#4B5563]">{t('social.feed.createModal.addToPost')}</p>

                  <div className="flex items-center gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,video/*"
                      multiple
                      onChange={handleMediaChange}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      aria-label={t('social.feed.createModal.mediaButton')}
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-[#DCE7F5] text-[#1F58A5] transition-colors hover:bg-[#CADBF2]"
                    >
                      <ImagePlus className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsLocationPickerOpen(true)}
                      aria-label={t('social.feed.createModal.locationLabel')}
                      className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
                        isLocationPickerOpen || selectedLocation
                          ? 'bg-[#1F58A5] text-white'
                          : 'bg-[#DCE7F5] text-[#1F58A5] hover:bg-[#CADBF2]'
                      }`}
                    >
                      <MapPin className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsSelectingVibe(true)}
                      aria-label={t('social.feed.createModal.tagLabel')}
                      className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
                        selectedVibe ? 'bg-[#1F58A5] text-white' : 'bg-[#DCE7F5] text-[#1F58A5] hover:bg-[#CADBF2]'
                      }`}
                    >
                      <Tag className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {mediaNames.length > 0 ? (
                  <div className="mt-2 space-y-2">
                    <p className="text-xs text-[#64748B]">{t('social.feed.createModal.selectedMedia', { count: mediaNames.length })}</p>
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {mediaPreviewUrls.map((url, index) => (
                        <div key={`${url}-${index}`} className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-[#D1D5DB] bg-white">
                          <img src={url} alt={mediaNames[index] ?? t('social.feed.createModal.mediaPreviewAlt')} className="h-full w-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeMediaAt(index)}
                            className="absolute right-0 top-0 rounded-bl-md bg-black/60 px-1 text-[10px] text-white"
                            aria-label={t('social.feed.createModal.removeMedia')}
                          >
                            x
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                {selectedLocation ? (
                  <div className="mt-3 flex items-center justify-between rounded-xl border border-[#D9DEE6] bg-white px-3 py-2">
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
              </div>

              {submitError ? <p className="text-sm font-medium text-red-600">{submitError}</p> : null}

              <button
                type="submit"
                disabled={!canPublish || isSubmitting}
                className="w-full rounded-xl bg-[#D8DEE6] px-4 py-2.5 text-base font-semibold text-[#5A6573] disabled:cursor-not-allowed enabled:bg-primary enabled:text-white enabled:hover:bg-primary-dark"
              >
                {isSubmitting ? t('social.feed.createModal.publishing') : t('social.feed.createModal.publish')}
              </button>
            </form>
          </div>
        )}

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
