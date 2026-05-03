import { useEffect, useState } from 'react';
import { ChevronUp } from 'lucide-react';
import { cn } from '@/utils/cn';

export const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 400) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);

    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <button
      type="button"
      onClick={scrollToTop}
      className={cn(
        'fixed bottom-[156px] right-6 z-40 hidden h-14 w-14 items-center justify-center rounded-full bg-brand/80 text-white shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:bg-brand active:scale-95 md:flex md:bottom-24 md:right-8',
        isVisible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-10 opacity-0'
      )}
      aria-label="Scroll to top"
    >
      <ChevronUp className="h-6 w-6" />
    </button>
  );
};
