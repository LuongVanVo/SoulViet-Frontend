import { useTranslation } from 'react-i18next'

export const MarketplaceHeroSection = () => {
  const { t } = useTranslation()

  return (
    <section className="relative isolate min-h-[360px] bg-[#fff8f5] md:min-h-[520px]">
      <div className="absolute inset-0 -z-10">
        <img
          src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=2000&q=80"
          alt={t('marketplace.hero.imageAlt')}
          className="absolute inset-0 h-full w-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-linear-to-b from-black/70 via-black/40 to-black/10" />
      </div>

      <div className="relative mx-auto flex h-full min-h-[360px] max-w-7xl flex-col items-center justify-center px-4 text-center md:px-6">
        <h1 className="max-w-3xl text-3xl font-extrabold tracking-tight text-white md:text-5xl">
          {t('marketplace.hero.title')}
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-white/80 md:text-base">{t('marketplace.hero.subtitle')}</p>
      </div>
    </section>
  )
}