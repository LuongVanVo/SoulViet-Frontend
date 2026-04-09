import { Cog, Heart, MapPin, UserRound } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { UserProfile } from '../../types';

interface UserProfilePageProps {
  user: UserProfile;
}

export const UserProfilePage = ({ user }: UserProfilePageProps) => {
  const { t } = useTranslation();

  return (
    <section className="px-4 pb-6 sm:px-6">
      <div className="rounded-3xl bg-[linear-gradient(135deg,_#36656B_0%,_#75B06F_100%)] p-5 text-white shadow-soft">
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
            <Cog className="h-5 w-5" />
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
    </section>
  );
};