import { Bell, ShoppingBag, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { NavLink, useLocation, Link } from 'react-router-dom';
import { Button } from '@/components/ui';
import { Badge } from '@/components/ui/Badge';
import type { BottomNavTab } from '@/types/home';
import { useAuthStore } from '@/store';
import { useMyCart } from '@/hooks/useMyCart';

const desktopNavItems: Array<{ tab: BottomNavTab; labelKey: string; to: string }> = [
  { tab: 'map', labelKey: 'bottomNav.map', to: '/map' },
  { tab: 'aiPlan', labelKey: 'bottomNav.aiPlan', to: '/ai-plan' },
  { tab: 'social', labelKey: 'bottomNav.social', to: '/social' },
  { tab: 'marketplace', labelKey: 'bottomNav.marketplace', to: '/marketplace' }
];

export const Navbar = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const isHomePage = location.pathname === '/';

  const { data: cart } = useMyCart();
  const cartCount = cart?.items.reduce((sum, it) => sum + (it.quantity ?? 0), 0) ?? 0;

  return (
    <header
      className={`z-50 h-14 md:h-16 ${
        isHomePage
          ? 'absolute left-0 right-0 top-0 bg-transparent'
          : 'sticky top-0 border-b border-gray-100 bg-white shadow-sm'
      }`}
    >
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          className={`text-lg font-bold tracking-[0.18em] md:text-xl ${isHomePage ? 'text-white' : 'text-brand'}`}
        >
          {t('navbar.logo')}
        </Link>

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

        <div className="flex items-center gap-2 sm:gap-3">
          {user ? (
            <>
              <button
                type="button"
                className={`relative inline-flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-full border transition-all hover:scale-105 active:scale-95 ${
                  isHomePage
                    ? 'border-white/40 text-white hover:bg-white/10'
                    : 'border-gray-200 text-gray-700 hover:border-brand hover:text-brand bg-white shadow-sm'
                }`}
                aria-label={t('navbar.notifications')}
              >
                <Bell className="h-4 w-4 md:h-5 md:w-5" />
              </button>

              <Link
                to="/cart"
                id="navbar-cart-button"
                className="relative inline-flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-full border transition-all hover:scale-105 active:scale-95 border-gray-200 text-gray-700 hover:border-brand hover:text-brand bg-white shadow-sm"
                aria-label={t('navbar.cart')}
              >
                <ShoppingBag className="h-4 w-4 md:h-5 md:w-5" />
                <Badge className="absolute -right-1 -top-1 h-4 min-w-4 justify-center bg-brand px-1 text-[8px] leading-none md:h-5 md:min-w-5 md:text-[10px]">
                  {cartCount}
                </Badge>
              </Link>

              <Link
                to="/profile"
                className={`flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-full border transition-all hover:scale-105 active:scale-95 ${
                  isHomePage
                    ? 'border-white/40 bg-white/10 text-white'
                    : 'border-gray-200 bg-gray-50 text-brand shadow-sm'
                }`}
              >
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.name} className="h-full w-full rounded-full object-cover" />
                ) : (
                  <User className="h-4 w-4 md:h-5 md:w-5" />
                )}
              </Link>
            </>
          ) : (
            <>
              <button
                type="button"
                className={`relative inline-flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-full border transition-all hover:scale-105 active:scale-95 ${
                  isHomePage
                    ? 'border-white/40 text-white hover:bg-white/10'
                    : 'border-gray-200 text-gray-700 hover:border-brand hover:text-brand bg-white shadow-sm'
                }`}
                aria-label={t('navbar.cart')}
              >
                <ShoppingBag className="h-4 w-4 md:h-5 md:w-5" />
                <Badge className="absolute -right-1 -top-1 h-4 min-w-4 justify-center bg-brand px-1 text-[8px] leading-none md:h-5 md:min-w-5 md:text-[10px]">
                  2
                </Badge>
              </button>

              <Link to="/login">
                <Button
                  variant="ghost"
                  className={`h-9 md:h-10 px-3 md:px-4 text-[10px] md:text-sm font-bold tracking-widest uppercase transition-all hover:scale-105 ${
                    isHomePage
                      ? 'border border-white/40 bg-transparent text-white hover:bg-white/20'
                      : 'border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 shadow-sm'
                  }`}
                >
                  {t('navbar.login')}
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};