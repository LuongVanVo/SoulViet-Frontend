import { ChevronRight, Heart, LogOut, MapPin, PenLine, Route, Settings, Shield, TicketCheck, UserRound } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import type { UserProfile } from '@/types';
import { authApi } from '@/services';

interface UserProfilePageProps {
  user: UserProfile;
  onLoggedOut: () => void;
}

export const UserProfilePage = ({ user, onLoggedOut }: UserProfilePageProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const quickMenus = [
    { id: 'journey', icon: Route, label: t('profile.user.quickMenu.journey') },
    { id: 'bookings', icon: TicketCheck, label: t('profile.user.quickMenu.bookings') },
    { id: 'posts', icon: PenLine, label: t('profile.user.quickMenu.posts') },
    { id: 'settings', icon: Settings, label: t('profile.user.quickMenu.settings') },
    { id: 'support', icon: Shield, label: t('profile.user.quickMenu.support') },
  ];

  async function handleLogout() {
    setIsLoggingOut(true);
    await authApi.logout();
    onLoggedOut();
    navigate('/login');
  }

  return (
    <section className="">
      <div className="rounded-b-3xl bg-[linear-gradient(135deg,_#36656B_0%,_#75B06F_100%)] px-5 py-10 text-white shadow-soft sm:px-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-white/45 bg-white/15 backdrop-blur-sm">
              <UserRound className="h-8 w-8 text-white" />
            </div>
            <div>
              <p className="text-3xl font-semibold leading-none">{user.name}</p>
              <p className="mt-2 text-sm text-white/80">{t('profile.user.role')}</p>
            </div>
          </div>
          <button type="button" className="rounded-full p-2 text-white/80 hover:bg-white/10 hover:text-white">
            <Settings className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-3">
          <div className="rounded-2xl border border-white/20 bg-white/10 px-3 py-4 text-center backdrop-blur-sm">
            <p className="text-3xl font-semibold leading-none">2,450</p>
            <p className="mt-2 text-xs text-white/80">{t('profile.user.stats.soulCoins')}</p>
          </div>
          <div className="rounded-2xl border border-white/20 bg-white/10 px-3 py-4 text-center backdrop-blur-sm">
            <div className="inline-flex items-center justify-center rounded-full bg-white/10 p-1.5">
              <MapPin className="h-4 w-4 text-white/85" />
            </div>
            <p className="mt-2 text-2xl font-semibold leading-none">12</p>
            <p className="mt-2 text-xs text-white/80">{t('profile.user.stats.visitedPlaces')}</p>
          </div>
          <div className="rounded-2xl border border-white/20 bg-white/10 px-3 py-4 text-center backdrop-blur-sm">
            <div className="inline-flex items-center justify-center rounded-full bg-white/10 p-1.5">
              <Heart className="h-4 w-4 text-white/85" />
            </div>
            <p className="mt-2 text-2xl font-semibold leading-none">38</p>
            <p className="mt-2 text-xs text-white/80">{t('profile.user.stats.favorites')}</p>
          </div>
        </div>
      </div>

      <div className="mt-5 px-4 pb-8 sm:px-6">
        <p className="mb-3 px-1 text-sm font-semibold text-gray-600">{t('profile.user.accountSectionTitle')}</p>

        <div className="space-y-3">
          {quickMenus.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                if (item.id === 'posts') {
                  navigate(`/profile/${user.id}`);
                }
              }}
              className="flex w-full items-center justify-between rounded-2xl border border-gray-200 bg-white px-4 py-4 text-left shadow-sm transition hover:border-primary/30"
            >
              <span className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-primary">
                  <item.icon className="h-5 w-5" />
                </span>
                <span className="text-base font-semibold text-gray-800">{item.label}</span>
              </span>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </button>
          ))}

          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex w-full items-center justify-between rounded-2xl border border-red-200 bg-white px-4 py-4 text-left shadow-sm transition hover:bg-red-50 disabled:opacity-60"
          >
            <span className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-500">
                <LogOut className="h-5 w-5" />
              </span>
              <span className="text-base font-semibold text-red-500">
                {isLoggingOut ? t('profile.user.loggingOut') : t('profile.user.logout')}
              </span>
            </span>
            <ChevronRight className="h-5 w-5 text-red-300" />
          </button>
        </div>

        <p className="mt-6 text-center text-xs text-gray-400">SoulViet v1.0.0</p>
      </div>
    </section>
  );
};