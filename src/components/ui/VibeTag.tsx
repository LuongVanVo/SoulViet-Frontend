import { cn } from '../../utils/cn';
import type { VibeTag as VibeTagType } from '../../types';

interface VibeTagProps {
  tag: VibeTagType;
  variant?: 'outline' | 'solid' | 'hero';
  className?: string;
}

export const VibeTag = ({
  tag,
  variant = 'outline',
  className
}: VibeTagProps) => {
  return (
    <span
      className={cn(
        'inline-flex cursor-pointer items-center justify-center rounded-full font-clamp font-medium transition-colors badge-no-shrink',
        variant === 'outline'
          ? 'border border-white/20 bg-white/5 px-3 py-2 text-white hover:bg-white/10'
          : variant === 'hero'
            ? 'border border-[#bed9c7] bg-[#edf5ef] px-4 py-2 text-[0.98rem] font-semibold text-[#2d6a4f] hover:border-[#2d6a4f] hover:bg-[#2d6a4f] hover:text-white'
            : 'bg-secondary px-2 py-0.5 text-xs text-text-dark',  
        className
      )}
    >
      {tag.name}
    </span>
  );
};