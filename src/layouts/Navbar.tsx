import { ShoppingBag } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { NavLink, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui';
import { Badge } from '@/components/ui/Badge';
import type { BottomNavTab } from '@/types/home';

const desktopNavItems: Array<{ tab: BottomNavTab; labelKey: string; to: string }> = [
  { tab: 'map', labelKey: 'bottomNav.map', to: '/map' },
  { tab: 'aiPlan', labelKey: 'bottomNav.aiPlan', to: '/ai-plan' },
  { tab: 'social', labelKey: 'bottomNav.social', to: '/social' },
  { tab: 'marketplace', labelKey: 'bottomNav.marketplace', to: '/community' }
];

export const Navbar = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <header
      className={`z-50 h-14 md:h-16 ${
        isHomePage
          ? 'absolute left-0 right-0 top-0 bg-transparent'
          : 'sticky top-0 border-b border-gray-100 bg-white shadow-sm'
      }`}
    >
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <a
          href="/"
          className={`text-lg font-bold tracking-[0.18em] md:text-xl ${isHomePage ? 'text-white' : 'text-brand'}`}
        >
          {t('navbar.logo')}
        </a>

        <nav
          className={`hidden items-center gap-1 lg:flex ${
            isHomePage
              ? 'rounded-full border border-white/20 bg-white/12 px-2 py-1 backdrop-blur-md'
              : ''
          }`}
          aria-label="Desktop navigation"
        >
          {desktopNavItems.map((item) => (
            <NavLink
              key={item.tab}
              to={item.to}
              className={({ isActive }) =>
                `rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  isHomePage
                    ? isActive
                      ? 'bg-white/22 text-white'
                      : 'text-white/80 hover:bg-white/18 hover:text-white'
                    : isActive
                      ? 'bg-brand/10 text-brand'
                      : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                }`
              }
            >
              {t(item.labelKey)}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            className={`h-10 px-4 text-sm font-medium ${
              isHomePage
                ? 'border border-white/40 bg-transparent text-white hover:bg-white/10'
                : 'border border-gray-200 text-gray-700'
            }`}
          >
            {t('navbar.login')}
          </Button>

          <button
            type="button"
            className={`relative inline-flex h-10 w-10 items-center justify-center rounded-full border transition ${
              isHomePage
                ? 'border-white/40 text-white hover:bg-white/10'
                : 'border-gray-200 text-gray-700 hover:border-brand hover:text-brand'
            }`}
            aria-label={t('navbar.cart')}
          >
            <ShoppingBag className="h-5 w-5" />
            <Badge className="absolute -right-1 -top-1 h-5 min-w-5 justify-center px-1 text-[10px] leading-none">2</Badge>
          </button>
        </div>
      </div>
    </header>
  );
};