import * as HomeFeature from '@/features'; 

export const Home = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <HomeFeature.HeroSection />
      <HomeFeature.TouristAttractionsSection />
      <HomeFeature.CraftSection />
    </div>
  );
};
