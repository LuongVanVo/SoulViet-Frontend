import { HeroSection } from '../features/home/components/HeroSection';
import { TouristAttractionsSection } from '../features/home/components/TouristAttractionsSection';
import { CraftSection } from '../features/home/components/CraftSection';

export const Home = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <HeroSection />
      <TouristAttractionsSection />
      <CraftSection />
    </div>
  );
};
