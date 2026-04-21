import { ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store';
import { MyPostsSection } from './components';

export const MyPost = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return (
      <section className="px-4 py-6 sm:px-6">
        <div className="mx-auto w-full max-w-2xl space-y-4">
          <button
            type="button"
            onClick={() => navigate('/profile')}
            className="inline-flex items-center gap-2 rounded-xl border border-[#D7DEE7] bg-white px-3 py-2 text-sm font-semibold text-[#334155]"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('profile.user.posts.backToProfile')}
          </button>

          <div className="rounded-2xl border border-dashed border-[#D8DEE6] bg-white px-4 py-10 text-center text-sm text-[#6B7280]">
            {t('profile.user.posts.empty')}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="px-4 py-6 sm:px-6">
      <div className="mx-auto w-full max-w-2xl space-y-4">
        <button
          type="button"
          onClick={() => navigate('/profile')}
          className="inline-flex items-center gap-2 rounded-xl border border-[#D7DEE7] bg-white px-3 py-2 text-sm font-semibold text-[#334155] transition-colors hover:bg-[#F8FAFC]"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('profile.user.posts.backToProfile')}
        </button>

        <h1 className="text-2xl font-semibold text-[#111827]">{t('profile.user.posts.pageTitle')}</h1>

        <MyPostsSection userId={user.id} />
      </div>
    </section>
  );
};