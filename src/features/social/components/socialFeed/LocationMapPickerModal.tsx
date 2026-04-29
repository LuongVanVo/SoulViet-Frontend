import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Check, LoaderCircle, MapPin, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { LocationMapPickerModalProps, SearchLocationSuggestion } from '@/types';

export const LocationMapPickerModal = ({
  isOpen,
  locations,
  selectedLocationId,
  isLoadingLocations,
  title,
  searchHint,
  loadingText,
  emptyText,
  selectButtonText,
  onClose,
  onSelect,
}: LocationMapPickerModalProps) => {
  const { t } = useTranslation();
  const [activeLocationId, setActiveLocationId] = useState<string | null>(selectedLocationId);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchLocationSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedSearchResult, setSelectedSearchResult] = useState<SearchLocationSuggestion | null>(null);
  const [userCoords, setUserCoords] = useState<[number, number] | null>(null);
  const [currentLocationSuggestion, setCurrentLocationSuggestion] = useState<SearchLocationSuggestion | null>(null);

  const distanceInKm = useMemo(
    () => (a: [number, number], b: [number, number]) => {
      const toRadians = (value: number) => (value * Math.PI) / 180;
      const earthRadiusKm = 6371;
      const latDiff = toRadians(b[0] - a[0]);
      const lonDiff = toRadians(b[1] - a[1]);
      const latA = toRadians(a[0]);
      const latB = toRadians(b[0]);

      const h =
        Math.sin(latDiff / 2) * Math.sin(latDiff / 2) +
        Math.sin(lonDiff / 2) * Math.sin(lonDiff / 2) * Math.cos(latA) * Math.cos(latB);

      return 2 * earthRadiusKm * Math.asin(Math.sqrt(h));
    },
    []
  );

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setActiveLocationId(selectedLocationId);
    setSearchQuery('');
    setSearchResults([]);
    setSelectedSearchResult(null);
    setCurrentLocationSuggestion(null);
  }, [isOpen, selectedLocationId]);

  useEffect(() => {
    if (!isOpen || typeof navigator === 'undefined' || !navigator.geolocation) {
      return;
    }

    let cancelled = false;

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        if (cancelled) {
          return;
        }

        const coords: [number, number] = [position.coords.latitude, position.coords.longitude];
        setUserCoords(coords);

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${coords[0]}&lon=${coords[1]}`
          );

          if (!response.ok || cancelled) {
            return;
          }

          const data = (await response.json()) as {
            display_name?: string;
            name?: string;
          };

          const displayName = data.display_name ?? `${coords[0].toFixed(5)}, ${coords[1].toFixed(5)}`;
          const [name, ...rest] = displayName.split(',');

          setCurrentLocationSuggestion({
            id: 'current-location',
            name: name?.trim() || t('social.feed.createModal.locationPickerCurrentLocation'),
            address: rest.join(',').trim() || 'Vietnam',
            latitude: coords[0],
            longitude: coords[1],
          });
        } catch {
          setCurrentLocationSuggestion({
            id: 'current-location',
            name: t('social.feed.createModal.locationPickerCurrentLocation'),
            address: `${coords[0].toFixed(5)}, ${coords[1].toFixed(5)}`,
            latitude: coords[0],
            longitude: coords[1],
          });
        }
      },
      () => {
        setUserCoords(null);
        setCurrentLocationSuggestion(null);
      },
      {
        enableHighAccuracy: false,
        timeout: 8000,
        maximumAge: 120000,
      }
    );

    return () => {
      cancelled = true;
    };
  }, [isOpen, t]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const query = searchQuery.trim();
    if (query.length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=8&q=${encodeURIComponent(`${query}, Vietnam`)}`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          setSearchResults([]);
          return;
        }

        const data = (await response.json()) as Array<{
          place_id?: number;
          display_name?: string;
          lat?: string;
          lon?: string;
        }>;

        const nextResults = data
          .map((item) => {
            const lat = Number(item.lat);
            const lon = Number(item.lon);
            const displayName = item.display_name ?? '';
            const [name, ...rest] = displayName.split(',');

            if (!Number.isFinite(lat) || !Number.isFinite(lon) || !name) {
              return null;
            }

            return {
              id: `search-${item.place_id ?? `${lat}-${lon}`}`,
              name: name.trim(),
              address: rest.join(',').trim() || 'Vietnam',
              latitude: lat,
              longitude: lon,
            } satisfies SearchLocationSuggestion;
          })
          .filter((item): item is SearchLocationSuggestion => item !== null);

        setSearchResults(nextResults);
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [isOpen, searchQuery]);

  const activeLocation = useMemo(
    () => locations.find((location) => location.id === activeLocationId) ?? null,
    [activeLocationId, locations]
  );

  const orderedLocations = useMemo(() => {
    if (!userCoords) {
      return locations;
    }

    return [...locations].sort((a, b) => {
      const aHasCoords = typeof a.latitude === 'number' && typeof a.longitude === 'number';
      const bHasCoords = typeof b.latitude === 'number' && typeof b.longitude === 'number';

      if (!aHasCoords && !bHasCoords) {
        return 0;
      }

      if (!aHasCoords) {
        return 1;
      }

      if (!bHasCoords) {
        return -1;
      }

      const aDistance = distanceInKm(userCoords, [a.latitude as number, a.longitude as number]);
      const bDistance = distanceInKm(userCoords, [b.latitude as number, b.longitude as number]);

      return aDistance - bDistance;
    });
  }, [locations, userCoords]);

  const canConfirm = Boolean(activeLocation || selectedSearchResult);
  const showSearchResults = searchQuery.trim().length >= 2;

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[110] flex flex-col bg-[#FCFCFD] sm:absolute sm:z-10">
      <div className="flex items-center gap-3 border-b border-[#EAECF0] px-5 py-4">
        <button
          type="button"
          onClick={onClose}
          className="rounded-full p-1.5 text-[#6B7280] transition-colors hover:bg-[#EEF2F7]"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h3 className="text-[18px] font-semibold text-[#111827]">{title}</h3>
      </div>

      <div className="border-b border-[#EAECF0] px-5 py-3 text-xs text-[#6B7280]">{searchHint}</div>

      <div className="border-b border-[#EAECF0] px-4 py-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder={t('social.feed.createModal.locationPickerSearchPlaceholder')}
            className="h-10 w-full rounded-full bg-[#E5E7EB] py-2 pl-9 pr-3 text-sm text-[#111827] outline-none placeholder:text-[#6B7280]"
          />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        <div className="mb-2 px-1 text-lg font-semibold text-[#111827]">{t('social.feed.createModal.locationPickerSuggestions')}</div>

        {isLoadingLocations ? (
          <div className="px-1 py-2 text-sm text-[#6B7280]">
            <span className="inline-flex items-center gap-2">
              <LoaderCircle className="h-4 w-4 animate-spin" />
              {loadingText}
            </span>
          </div>
        ) : null}

        {isSearching && !isLoadingLocations ? (
          <div className="px-1 py-2 text-sm text-[#6B7280]">{t('social.feed.createModal.locationPickerSearching')}</div>
        ) : null}

        {!isSearching && showSearchResults ? (
          <div className="space-y-2">
            {searchResults.map((result) => {
              const isActive = selectedSearchResult?.id === result.id;

              return (
                <button
                  key={result.id}
                  type="button"
                  onClick={() => {
                    setSelectedSearchResult(result);
                    setActiveLocationId(null);
                  }}
                  className={`flex w-full items-start justify-between rounded-xl border px-3 py-3 text-left transition-colors ${isActive
                      ? 'border-[#1F58A5] bg-[#EDF4FF]'
                      : 'border-[#E5E7EB] bg-white hover:border-[#CBD5E1]'
                    }`}
                >
                  <div className="flex items-start gap-2">
                    <MapPin className={`mt-0.5 h-4 w-4 ${isActive ? 'text-[#1F58A5]' : 'text-[#6B7280]'}`} />
                    <div>
                      <p className="text-sm font-semibold text-[#111827]">{result.name}</p>
                      <p className="text-xs text-[#6B7280]">{result.address}</p>
                    </div>
                  </div>
                  {isActive ? <Check className="h-4 w-4 text-[#1F58A5]" /> : null}
                </button>
              );
            })}

            {searchResults.length === 0 ? (
              <p className="px-1 py-2 text-sm text-[#6B7280]">{t('social.feed.createModal.locationPickerNoSearchResult')}</p>
            ) : null}
          </div>
        ) : null}

        {!showSearchResults ? (
          <div className="space-y-2">
            {currentLocationSuggestion ? (
              <button
                key={currentLocationSuggestion.id}
                type="button"
                onClick={() => {
                  setSelectedSearchResult(currentLocationSuggestion);
                  setActiveLocationId(null);
                }}
                className={`flex w-full items-start justify-between rounded-xl border px-3 py-3 text-left transition-colors ${selectedSearchResult?.id === currentLocationSuggestion.id
                    ? 'border-[#1F58A5] bg-[#EDF4FF]'
                    : 'border-[#E5E7EB] bg-white hover:border-[#CBD5E1]'
                  }`}
              >
                <div className="flex items-start gap-2">
                  <MapPin className={`mt-0.5 h-4 w-4 ${selectedSearchResult?.id === currentLocationSuggestion.id ? 'text-[#1F58A5]' : 'text-[#6B7280]'}`} />
                  <div>
                    <p className="text-sm font-semibold text-[#111827]">{t('social.feed.createModal.locationPickerCurrentLocation')}</p>
                    <p className="text-xs text-[#6B7280]">{currentLocationSuggestion.address}</p>
                  </div>
                </div>
                {selectedSearchResult?.id === currentLocationSuggestion.id ? <Check className="h-4 w-4 text-[#1F58A5]" /> : null}
              </button>
            ) : null}

            {orderedLocations.map((location) => {
              const isActive = activeLocationId === location.id;

              return (
                <button
                  key={location.id}
                  type="button"
                  onClick={() => {
                    setActiveLocationId(location.id);
                    setSelectedSearchResult(null);
                  }}
                  className={`flex w-full items-start justify-between rounded-xl border px-3 py-3 text-left transition-colors ${isActive
                      ? 'border-[#1F58A5] bg-[#EDF4FF]'
                      : 'border-[#E5E7EB] bg-white hover:border-[#CBD5E1]'
                    }`}
                >
                  <div className="flex items-start gap-2">
                    <MapPin className={`mt-0.5 h-4 w-4 ${isActive ? 'text-[#1F58A5]' : 'text-[#6B7280]'}`} />
                    <div>
                      <p className="text-sm font-semibold text-[#111827]">{location.name}</p>
                      <p className="text-xs text-[#6B7280]">{location.address}</p>
                    </div>
                  </div>
                  {isActive ? <Check className="h-4 w-4 text-[#1F58A5]" /> : null}
                </button>
              );
            })}

            {!isLoadingLocations && orderedLocations.length === 0 && !currentLocationSuggestion ? (
              <p className="px-1 py-2 text-sm text-[#6B7280]">{emptyText}</p>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="relative z-20 border-t border-[#EAECF0] bg-[#FCFCFD] p-4 pb-6 sm:pb-4">
        <button
          type="button"
          disabled={!canConfirm}
          onClick={() => {
            if (activeLocation) {
              onSelect(activeLocation);
              return;
            }

            if (selectedSearchResult) {
              onSelect({
                id: selectedSearchResult.id,
                name: selectedSearchResult.name,
                address: selectedSearchResult.address,
                tagId: 'manual',
                likes: 0,
                imageUrl: '',
                latitude: selectedSearchResult.latitude,
                longitude: selectedSearchResult.longitude,
              });
            }
          }}
          className="w-full rounded-xl bg-[#1F58A5] px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-[#D1D5DB]"
        >
          {selectButtonText}
        </button>
      </div>
    </div>
  );
};
