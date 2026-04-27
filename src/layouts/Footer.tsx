import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui';

export const Footer = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setEmail('');
  };

  return (
    <footer className="border-t border-gray-100 bg-[#faf8f2]">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.3fr_1fr_1fr_1.2fr] lg:px-8">
        <div>
          <p className="text-lg font-bold tracking-[0.18em] text-brand">{t('navbar.logo')}</p>
          <p className="mt-3 max-w-sm text-sm leading-6 text-gray-600">{t('footer.tagline')}</p>
          <p className="mt-4 text-xs text-gray-500">{t('footer.copyright')}</p>
        </div>

        <div className="space-y-3 text-sm text-gray-600">
          <p className="font-semibold text-gray-900">{t('footer.links.col1.0')}</p>
          <p>{t('footer.links.col1.1')}</p>
        </div>

        <div className="space-y-3 text-sm text-gray-600">
          <p className="font-semibold text-gray-900">{t('footer.links.col2.0')}</p>
          <p>{t('footer.links.col2.1')}</p>
        </div>

        <div>
          <p className="text-sm font-semibold text-gray-900">{t('footer.newsletter.heading')}</p>
          <form className="mt-4 flex gap-2" onSubmit={handleSubmit}>
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              placeholder={t('footer.newsletter.placeholder')}
              className="min-w-0 flex-1 rounded-full border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-brand focus:ring-2 focus:ring-brand/20"
            />
            <Button type="submit" className="px-5">
              {t('footer.newsletter.button')}
            </Button>
          </form>
        </div>
      </div>
    </footer>
  );
};