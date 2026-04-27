import { useState, useRef, useEffect } from 'react';
import { Calendar, MapPin, Search, Users, Tag, Wallet, Package, ChevronDown, ChevronUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/utils/cn';
import { useSearchTab } from '@/hooks/useSearchTab';

export const SearchBar = () => {
  const { t } = useTranslation();
  const { activeTab, setActiveTab } = useSearchTab();

  const isStaysTab = activeTab === 'stays';
  const isTourTab = activeTab === 'tours';
  const isSouvenirsTab = activeTab === 'souvenirs';

  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [categorySearch, setCategorySearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const categoryRef = useRef<HTMLDivElement>(null);

  const categories = [
    "Gốm sứ",
    "Tranh thêu",
    "Đặc sản trà",
    "Lụa tơ tằm",
    "Đồ gỗ mỹ nghệ",
    "Sơn mài",
    "Nón lá",
    "Trang sức bạc"
  ];

  const filteredCategories = categories.filter(cat =>
    cat.toLowerCase().includes(categorySearch.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoryRef.current && !categoryRef.current.contains(event.target as Node)) {
        setIsCategoryOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="w-full rounded-[2rem] bg-white/95 p-5 shadow-2xl backdrop-blur-md ring-1 ring-black/5 sm:p-6 font-montserrat">
      <div className="mb-6 flex flex-wrap gap-6 px-2">
        {[
          { key: 'stays', label: t('searchBar.tabs.stays') },
          { key: 'tours', label: t('searchBar.tabs.tours') },
          { key: 'souvenirs', label: t('searchBar.tabs.souvenirs') }
        ].map((tab) => {
          const isActive = activeTab === tab.key;

          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={cn(
                'relative px-2 py-1 text-sm font-medium transition-all',
                isActive ? 'text-white' : 'text-gray-600 hover:text-gray-900'
              )}
            >
              <div
                className={cn(
                  "absolute inset-x-[-12px] inset-y-[-6px] -z-10 rounded-full bg-[#0D5C46] shadow-sm transition-opacity duration-200",
                  isActive ? "opacity-100" : "opacity-0"
                )}
              />
              <span className="relative z-10">{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div
        key={activeTab}
        className={cn(
          "grid gap-4 md:gap-6 lg:items-end",
          isStaysTab ? "lg:grid-cols-[1.5fr_1fr_auto]" :
            isTourTab ? "lg:grid-cols-[1fr_0.8fr_0.7fr_auto]" :
              "lg:grid-cols-[1.2fr_0.9fr_0.9fr_auto]"
        )}
      >
        <div key="field-1" className="space-y-2">
          <span className="ml-4 text-[10px] font-medium tracking-widest text-gray-400 uppercase">
            {isSouvenirsTab ? t('searchBar.souvenirProductLabel') : isTourTab ? t('searchBar.tourLocationLabel') : t('searchBar.locationLabel')}
          </span>
          <label className="flex items-center gap-3 rounded-2xl bg-[#FEF6F1] px-5 py-3 md:py-4 transition-shadow focus-within:ring-2 focus-within:ring-[#0D5C46]/20">
            {isSouvenirsTab ? <Package className="h-5 w-5 shrink-0 text-gray-500" /> : <MapPin className="h-5 w-5 shrink-0 text-gray-500" />}
            <input
              type="text"
              placeholder={isSouvenirsTab ? t('searchBar.souvenirProductPlaceholder') : isTourTab ? t('searchBar.tourLocationPlaceholder') : t('searchBar.locationPlaceholder')}
              className="w-full bg-transparent text-sm font-normal text-gray-800 outline-none placeholder:text-gray-400"
            />
          </label>
        </div>

        <div key="field-2" className="space-y-2">
          <span className="ml-4 text-[10px] font-medium tracking-widest text-gray-400 uppercase">
            {isSouvenirsTab ? t('searchBar.souvenirCategoryLabel') : isTourTab ? t('searchBar.tourDateLabel') : t('searchBar.dateLabel')}
          </span>

          {isSouvenirsTab ? (
            <div className="relative" ref={categoryRef}>
              <button
                type="button"
                onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                className="flex w-full items-center justify-between rounded-2xl bg-[#FEF6F1] px-5 py-3 md:py-4 transition-all focus:ring-2 focus:ring-[#0D5C46]/20"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <Tag className="h-5 w-5 shrink-0 text-gray-500" />
                  <span className={cn(
                    "truncate text-sm font-normal",
                    selectedCategory ? "text-gray-800" : "text-gray-400"
                  )}>
                    {selectedCategory || t('searchBar.souvenirCategoryPlaceholder')}
                  </span>
                </div>
                {isCategoryOpen ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
              </button>

              {isCategoryOpen && (
                <div className="absolute top-[calc(100%+8px)] left-0 z-50 w-full min-w-[240px] rounded-2xl bg-white p-2 shadow-xl ring-1 ring-black/5 animate-in fade-in zoom-in duration-200">
                  <div className="relative mb-2">
                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      autoFocus
                      placeholder={t('searchBar.souvenirCategorySearchPlaceholder')}
                      className="w-full rounded-xl border border-gray-100 bg-gray-50 py-2.5 pl-10 pr-4 text-xs outline-none focus:border-[#0D5C46]/30 focus:bg-white"
                      value={categorySearch}
                      onChange={(e) => setCategorySearch(e.target.value)}
                    />
                  </div>

                  <div className="max-h-[200px] overflow-y-auto px-1 custom-scrollbar text-gray-800">
                    <span className="mb-2 block px-2 text-[10px] font-bold text-gray-400 uppercase">
                      {t('searchBar.souvenirCategoryPleaseSelect')}
                    </span>
                    {filteredCategories.length > 0 ? (
                      filteredCategories.map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => {
                            setSelectedCategory(cat);
                            setIsCategoryOpen(false);
                          }}
                          className={cn(
                            "w-full rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-gray-50",
                            selectedCategory === cat ? "bg-[#0D5C46]/5 font-medium text-[#0D5C46]" : "text-gray-600"
                          )}
                        >
                          {cat}
                        </button>
                      ))
                    ) : (
                      <div className="px-3 py-2 text-xs text-gray-400 italic text-center">
                        {t('searchBar.noResults')}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <label className="flex items-center gap-3 rounded-2xl bg-[#FEF6F1] px-5 py-4 transition-shadow focus-within:ring-2 focus-within:ring-[#0D5C46]/20 cursor-pointer">
              <Calendar className="h-5 w-5 shrink-0 text-gray-500" />
              <input
                key="date-input"
                type="text"
                onFocus={(e) => {
                  e.target.type = 'date';
                  try { e.target.showPicker(); } catch (err) { }
                }}
                onBlur={(e) => {
                  if (!e.target.value) e.target.type = 'text';
                }}
                placeholder={isTourTab ? t('searchBar.tourDatePlaceholder') : t('searchBar.datePlaceholder')}
                className="w-full bg-transparent text-sm font-normal text-gray-800 outline-none placeholder:text-gray-400 cursor-pointer"
              />
            </label>
          )}
        </div>

        {(isTourTab || isSouvenirsTab) && (
          <div key="field-3" className="space-y-2">
            <span className="ml-4 text-[10px] font-medium tracking-widest text-gray-400 uppercase">
              {isSouvenirsTab ? t('searchBar.souvenirBudgetLabel') : t('searchBar.tourPeopleLabel')}
            </span>
            <label className="flex items-center gap-3 rounded-2xl bg-[#FEF6F1] px-5 py-4 transition-shadow focus-within:ring-2 focus-within:ring-[#0D5C46]/20">
              {isSouvenirsTab ? <Wallet className="h-5 w-5 shrink-0 text-gray-500" /> : <Users className="h-5 w-5 shrink-0 text-gray-500" />}
              <input
                type="text"
                placeholder={isSouvenirsTab ? t('searchBar.souvenirBudgetPlaceholder') : t('searchBar.tourPeoplePlaceholder')}
                className="w-full bg-transparent text-sm font-normal text-gray-800 outline-none placeholder:text-gray-400"
              />
            </label>
          </div>
        )}

        <button key="search-btn" className="flex h-[56px] items-center justify-center gap-2 rounded-full bg-[#0D5C46] px-8 text-sm font-medium tracking-widest text-white shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98] lg:min-w-[160px]">
          <Search className="h-4 w-4" />
          {t('searchBar.cta', 'KHÁM PHÁ')}
        </button>
      </div>
    </div>
  );
};