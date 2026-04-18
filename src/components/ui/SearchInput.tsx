import type { InputHTMLAttributes } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/utils/cn';

interface SearchInputProps extends InputHTMLAttributes<HTMLInputElement> {}

export const SearchInput = ({ className, ...props }: SearchInputProps) => {
  const { t } = useTranslation();

  return (
    <div className={cn('w-full max-w-2xl', className)}>
      <input
        type="text"
        className="block w-full rounded-full border border-transparent bg-background-input px-6 py-4 text-[1.05rem] text-text-input shadow-input-inner outline-none transition placeholder:text-text-input-placeholder focus:border-secondary-alt focus:ring-2 focus:ring-secondary-alt/33"
        placeholder={t('home.searchPlaceholder')}
        {...props}
      />
    </div>
  );
};
