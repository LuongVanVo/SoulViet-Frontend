import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

interface PageHeroSectionProps {
  title: string;
  subtitle: string;
  badge?: ReactNode;
  children?: ReactNode;
  className?: string;
}

export const PageHeroSection = ({ title, subtitle, badge, children, className }: PageHeroSectionProps) => {
  return (
    <section
      className={cn(
        'relative overflow-hidden rounded-b-4xl bg-[linear-gradient(135deg,_#36656B_0%,_#75B06F_100%)] text-white shadow-lg px-6 pt-15 pb-8 sm:px-8 sm:pt-8 sm:pb-10',
        className
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_30%,#ffffff26_0_2px,transparent_2.5px),radial-gradient(circle_at_75%_20%,#ffffff1c_0_2px,transparent_2.5px),radial-gradient(circle_at_55%_70%,#ffffff20_0_2px,transparent_2.5px)] bg-size-[160px_120px] opacity-20" />

      {badge ? (
        <div className="absolute right-4 top-15 rounded-full bg-secondary px-4 py-2 text-sm font-bold text-primary-dark shadow-md sm:right-8 sm:top-8 sm:px-5 sm:py-2.5">
          {badge}
        </div>
      ) : null}

      <div className="relative max-w-3xl px-4 text-left sm:mx-auto sm:px-8 sm:text-center">
        <h2 className="mb-1.5 text-[1.25rem] font-semibold leading-tight text-white sm:text-[2rem]">{title}</h2>
        <p className="mb-6 mt-1 text-base font-medium text-text-hero-subtitle sm:text-lg">{subtitle}</p>

        {children}
      </div>
    </section>
  );
};