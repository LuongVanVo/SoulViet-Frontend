import { Home, MapPin, ShoppingBag, Sparkles, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { useBottomNav } from '@/hooks/useBottomNav';
import type { BottomNavTab } from '@/types/home';
import { cn } from '@/utils/cn';
import { useEffect } from 'react';

interface BottomNavProps {
    activeTab?: BottomNavTab;
    onTabChange?: (tab: BottomNavTab) => void;
}

const navItems: Array<{ tab: BottomNavTab; labelKey: string; icon: typeof Home; to: string }> = [
    { tab: 'home', labelKey: 'bottomNav.home', icon: Home, to: '/' },
    { tab: 'map', labelKey: 'bottomNav.map', icon: MapPin, to: '/map' },
    { tab: 'aiPlan', labelKey: 'bottomNav.aiPlan', icon: Sparkles, to: '/ai-plan' },
    { tab: 'social', labelKey: 'bottomNav.social', icon: Users, to: '/social' },
    { tab: 'marketplace', labelKey: 'bottomNav.marketplace', icon: ShoppingBag, to: '/community' }
];

export const BottomNav = ({ activeTab, onTabChange }: BottomNavProps) => {
    const { t } = useTranslation();
    const location = useLocation();
    const navigate = useNavigate();
    const { activeTab: storedTab, setActiveTab } = useBottomNav();

    useEffect(() => {
        if (location.pathname === '/') {
            setActiveTab('home');
            return;
        }

        if (location.pathname.startsWith('/map')) {
            setActiveTab('map');
            return;
        }

        if (location.pathname.startsWith('/ai-plan')) {
            setActiveTab('aiPlan');
            return;
        }

        if (location.pathname.startsWith('/community')) {
            setActiveTab('marketplace');
            return;
        }

        if (location.pathname.startsWith('/social')) {
            setActiveTab('social');
            return;
        }
    }, [location.pathname, setActiveTab]);

    const currentTab = activeTab ?? storedTab;

    const handleTabChange = (tab: BottomNavTab) => {
        setActiveTab(tab);
        onTabChange?.(tab);

        const selected = navItems.find((item) => item.tab === tab);
        if (selected) {
            navigate(selected.to);
        }
    };

    return (
        <nav
  className="
    block lg:hidden
    fixed inset-x-0 bottom-0
    z-[60]
    rounded-t-3xl
    border border-gray-100 border-b-0
    bg-white
    shadow-[0_-8px_24px_-18px_rgba(15,23,42,0.45)]
    pb-[env(safe-area-inset-bottom)]
  "
>
            <div className="grid min-h-[78px] grid-cols-5 items-end gap-x-1 px-2 pb-1 md:h-[82px] md:px-3">
                {navItems.map((item) => {
                    const isActive = currentTab === item.tab;
                    const Icon = item.icon;
                    const isCenterAi = item.tab === 'aiPlan';

                    return (
                        <button
                            key={item.tab}
                            type="button"
                            onClick={() => handleTabChange(item.tab)}
                            className={cn(
                                'relative flex flex-col items-center justify-center gap-1 text-xs font-medium transition-colors',
                                isCenterAi ? 'justify-start pt-0 overflow-visible' : 'pt-1',
                                isActive ? 'text-brand' : 'text-gray-400'
                            )}
                        >
                            {isCenterAi ? (
                                <span
                                    className={cn(
                                        'absolute -top-9 flex h-[74px] w-[74px] items-center justify-center rounded-full border-[5px] border-white shadow-[0_12px_28px_-10px_rgba(245,158,11,0.65)] transition-transform',
                                        isActive ? 'bg-amber-400 text-white' : 'bg-amber-400 text-white/95'
                                    )}
                                >
                                    <Icon className="h-8 w-8" />
                                </span>
                            ) : (
                                <span
                                    className={cn(
                                        'flex h-11 w-11 items-center justify-center rounded-2xl transition-colors',
                                        isActive ? 'bg-slate-200 text-[#1d4f91]' : 'text-gray-400'
                                    )}
                                >
                                    <Icon className="h-5 w-5" />
                                </span>
                            )}
                            <span
                                className={cn(
                                    'max-w-[72px] whitespace-nowrap text-center leading-tight',
                                    isCenterAi ? 'mt-11' : 'mt-0.5',
                                    'text-xs'
                                )}
                            >
                                {t(item.labelKey)}
                            </span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
};