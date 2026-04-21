import { useEffect, useId, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import axios from 'axios';
import { ImagePlus, MapPin, Tag, X, ArrowLeft, Search, Sprout, Mountain, Diamond, Lightbulb, Globe, Home, Pencil } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { postApi, touristApi } from '@/services';
import { useAuthStore } from '@/store';
import type { CreatePostModalProps, CreatePostPayload, TouristAttractionCardItem } from '@/types';

const EMPTY_GUID = '00000000-0000-0000-0000-000000000000';

export const CreatePostModal = ({ isOpen, onClose }: CreatePostModalProps) => {
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

  // Vibe Tag States
  const [selectedVibe, setSelectedVibe] = useState<number | null>(null);

  // Location States
  const [showLocationSearch, setShowLocationSearch] = useState(false);
  const [locationQuery, setLocationQuery] = useState('');
  const [locationResults, setLocationResults] = useState<TouristAttractionCardItem[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<TouristAttractionCardItem | null>(null);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);

  // Vibe Selection View State
  const [isSelectingVibe, setIsSelectingVibe] = useState(false);
  const [vibeSearchQuery, setVibeSearchQuery] = useState('');

  const vibeConfig: Record<number, { icon: any; color: string; bgColor: string }> = {
    1: { icon: Sprout, color: 'text-[#16A34A]', bgColor: 'bg-[#EAF7EF]' },
    2: { icon: Mountain, color: 'text-[#2563EB]', bgColor: 'bg-[#EAF0FB]' },
    3: { icon: Diamond, color: 'text-[#D97706]', bgColor: 'bg-[#FBF5E8]' },
    4: { icon: Lightbulb, color: 'text-[#9333EA]', bgColor: 'bg-[#F4ECFB]' },
    5: { icon: Globe, color: 'text-[#4F46E5]', bgColor: 'bg-[#ECEFFE]' },
    6: { icon: Home, color: 'text-[#EA580C]', bgColor: 'bg-[#FAF1E8]' },
  };

  const vibeOptions = [1, 2, 3, 4, 5, 6].map((id) => ({
    id,
    label: t(`social.feed.createModal.vibeNames.${id}`),
  }));

  useEffect(() => {
    if (locationQuery.trim().length > 1) {
      const timer = setTimeout(async () => {
        setIsSearchingLocation(true);
        try {
          const response = await touristApi.getTouristAttractions();
          const filtered = response.items.filter(item =>
            item.name.toLowerCase().includes(locationQuery.toLowerCase())
          );
          setLocationResults(filtered);
        } catch (error) {
          console.error('Failed to fetch locations', error);
        } finally {
          setIsSearchingLocation(false);
        }
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setLocationResults([]);
    }
  }, [locationQuery]);

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
      clearMedia();
      return;
    }

    const selectedFiles = Array.from(files);
    const nextPreviewUrls = selectedFiles.map((file) => URL.createObjectURL(file));

    mediaPreviewUrls.forEach((url) => URL.revokeObjectURL(url));
    setMediaFiles(selectedFiles);
    setMediaNames(selectedFiles.map((file) => file.name));
    setMediaPreviewUrls(nextPreviewUrls);
  };

  const resetForm = () => {
    setCaption('');
    clearMedia();
    setSelectedVibe(null);
    setSelectedLocation(null);
    setLocationQuery('');
    setShowLocationSearch(false);
    setIsSelectingVibe(false);
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

      // userId is intentionally omitted — the backend resolves it from the
      // Authorization token via User.GetCurrentUserId(), so any frontend
      // validation or derivation here is unnecessary and error-prone.
      const payload: CreatePostPayload = {
        content: caption.trim(),
        mediaUrls: mediaFiles.map((_, index) => `https://i.pinimg.com/736x/b1/56/a6/b156a6129a622b9284eba286737b2656.jpg?img=${index + 1}`),
        vibeTag: selectedVibe ?? 1,
        checkinLocationId: selectedLocation?.id ?? EMPTY_GUID,
      };

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
  const canPublish = caption.trim().length > 0;
  const avatarInitial = userName.charAt(0).toUpperCase();
  const primaryPreview = mediaPreviewUrls[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#6B728099] p-4">
      <div className="w-full max-w-[360px] overflow-hidden rounded-3xl bg-[#FCFCFD] shadow-2xl">
        {isSelectingVibe ? (
          <div className="flex h-[640px] flex-col bg-[#FCFCFD]">
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
                {vibeOptions.filter((tag) => tag.label.toLowerCase().includes(vibeSearchQuery.toLowerCase())).length === 0 && vibeSearchQuery.length > 0 && (
                  <p className="px-1 text-center text-base text-[#6B7280]">{t('social.feed.createModal.vibeEmptySearch')}</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4">
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
                  {selectedVibe && (
                    <p className="text-sm text-[#6B7280]">
                      {t('social.feed.createModal.vibeLabelPrefix')}{' '}
                      <span className="font-semibold text-[#1F58A5]">
                        {selectedVibe ? t(`social.feed.createModal.vibeNames.${selectedVibe}`) : ''}
                      </span>
                    </p>
                  )}
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
                  required
                  placeholder={t('social.feed.createModal.captionPlaceholder', { name: userName })}
                  className="w-full resize-none bg-transparent px-1 text-[26px] leading-tight text-[#2F3A48] outline-none placeholder:text-[#C0C4CC]"
                />
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
                    onClick={clearMedia}
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
                      onClick={() => {
                        setShowLocationSearch((prev) => !prev);
                        if (!showLocationSearch) {
                          setSelectedLocation(null);
                        }
                      }}
                      aria-label={t('social.feed.createModal.locationLabel')}
                      className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
                        showLocationSearch || selectedLocation ? 'bg-[#1F58A5] text-white' : 'bg-[#DCE7F5] text-[#1F58A5] hover:bg-[#CADBF2]'
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
                  <p className="mt-2 text-xs text-[#64748B]">
                    {t('social.feed.createModal.selectedMedia', { count: mediaNames.length })}
                  </p>
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

                {showLocationSearch && !selectedLocation ? (
                  <div className="mt-3 space-y-2">
                    <div className="relative">
                      <input
                        type="text"
                        value={locationQuery}
                        onChange={(event) => setLocationQuery(event.target.value)}
                        autoFocus
                        placeholder={t('social.feed.createModal.locationPlaceholder')}
                        className="w-full rounded-xl border border-[#D9DEE6] bg-white px-3 py-2 text-sm text-[#1F2937] outline-none focus:border-[#1F58A5] focus:ring-1 focus:ring-[#1F58A5]"
                      />
                      {isSearchingLocation && (
                        <div className="absolute right-3 top-2.5 h-4 w-4 animate-spin rounded-full border-2 border-[#1F58A5] border-t-transparent" />
                      )}
                    </div>

                    {locationResults.length > 0 ? (
                      <div className="max-h-[150px] overflow-y-auto rounded-xl border border-[#D9DEE6] bg-white py-1 shadow-sm">
                        {locationResults.map((loc) => (
                          <button
                            key={loc.id}
                            type="button"
                            onClick={() => {
                              setSelectedLocation(loc);
                              setShowLocationSearch(false);
                              setLocationQuery('');
                            }}
                            className="flex w-full items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-[#F3F4F6]"
                          >
                            <MapPin className="h-4 w-4 text-[#6B7280]" />
                            <div>
                              <p className="text-sm font-medium text-[#1F2937]">{loc.name}</p>
                              <p className="text-[11px] text-[#6B7280]">{loc.address}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : locationQuery.length > 1 && !isSearchingLocation ? (
                      <p className="px-1 text-[11px] text-[#6B7280]">{t('social.feed.createModal.locationEmptySearch')}</p>
                    ) : null}
                  </div>
                ) : (
                  !selectedLocation && showLocationSearch && (
                    <div className="mt-2 flex items-center gap-2 text-xs text-[#6B7280]">
                      <MapPin className="h-3 w-3" />
                      <span>{t('social.feed.createModal.locationSearchPlaceholder')}</span>
                    </div>
                  )
                )}
              </div>

              {submitError ? (
                <p className="text-sm font-medium text-red-600">{submitError}</p>
              ) : null}

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
      </div>
    </div>
  );
};
