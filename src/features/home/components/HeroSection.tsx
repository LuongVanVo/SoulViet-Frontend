import { useTranslation } from 'react-i18next';
import { SearchBar } from '@/features/home/components/SearchBar';

export const HeroSection = () => {
  const { t } = useTranslation();

  return (
    <section className="relative isolate min-h-[600px] bg-gray-950 text-white md:min-h-[100dvh] font-montserrat">
      <img
        src="https://images.unsplash.com/photo-1709064159097-91b634741c96?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        alt="Vietnam landscape"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/45 to-black/10" />

      <div className="relative mx-auto flex min-h-[600px] max-w-7xl flex-col justify-center px-4 pb-48 pt-20 sm:px-6 lg:px-8 md:min-h-[100dvh] md:pb-32">
        <div className="mx-auto max-w-4xl space-y-5 text-center md:space-y-6">
          <h1 className="text-4xl font-extrabold tracking-tight drop-shadow md:text-5xl lg:text-6xl text-white font-montserrat">
            {t('hero.title')}
          </h1>
          <p className="mx-auto max-w-2xl text-base leading-7 text-white md:text-lg font-montserrat">
            {t('hero.subtitle')}
          </p>
        </div>

        <div className="absolute bottom-0 left-1/2 z-10 w-[calc(100%-2rem)] max-w-5xl -translate-x-1/2 translate-y-1/2 sm:w-[calc(100%-3rem)] lg:w-full">
          <SearchBar />
        </div>
      </div>
    </section>
  );
};