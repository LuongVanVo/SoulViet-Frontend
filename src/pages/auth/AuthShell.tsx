import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/utils/cn';

interface AuthShellProps {
  children: ReactNode;
  image: string;
  imageTitle: ReactNode;
  imageSubtitle?: ReactNode;
  imageTitleUnderline?: 'green' | 'white';
  reverse?: boolean;
  formBg?: 'white' | 'cream';
}

export const AuthShell = ({
  children,
  image,
  imageTitle,
  imageSubtitle,
  imageTitleUnderline,
  reverse = false,
  formBg = 'white'
}: AuthShellProps) => {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'vi' ? 'en' : 'vi';
    i18n.changeLanguage(newLang);
  };

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] md:min-h-[calc(100vh-4rem)] w-full font-sans -mb-24 md:-mb-28 lg:-mb-20">
      <div
        className={cn(
          "flex w-full flex-col lg:w-1/2 relative",
          formBg === 'cream' ? 'bg-[#FAF7F2]' : 'bg-white',
          reverse ? 'order-2' : 'order-1'
        )}
      >
        <div className="absolute right-6 top-6 z-10">
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-[10px] font-bold tracking-widest text-gray-700 shadow-sm transition-hover hover:bg-gray-50"
          >
            {i18n.language === 'en' ? 'ENGLISH' : 'VIỆT NAM'}
            <ChevronDown className="h-3 w-3" />
          </button>
        </div>

        <div className="flex flex-1 items-center justify-center p-6 sm:p-12 lg:p-16">
          <div className="w-full max-w-[440px]">
            {children}
          </div>
        </div>
      </div>

      {/* Image Side */}
      <div
        className={cn(
          "hidden w-full lg:block lg:w-1/2 relative",
          reverse ? 'order-1' : 'order-2'
        )}
      >
        <div className="absolute inset-0 bg-gray-900">
          <img
            src={image}
            alt="SoulViet Background"
            className="h-full w-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/80" />
        </div>

        <div className="absolute bottom-16 left-16 right-16">
          <h2 className="text-4xl font-bold tracking-tight text-white leading-[1.1] mb-6">
            {imageTitle}
          </h2>

          {imageTitleUnderline && (
            <div className={cn(
              "h-1 w-16 mb-6",
              imageTitleUnderline === 'green' ? 'bg-[#0D5C46]' : 'bg-white/30'
            )} />
          )}

          {imageSubtitle && (
            <p className="text-xs font-normal text-white/80">
              {imageSubtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
