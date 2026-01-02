import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useHeroImages } from '@/hooks/useHeroImages';

interface HeroSectionProps {
  onShopNowClick: () => void;
}

export const HeroSection = ({ onShopNowClick }: HeroSectionProps) => {
  // Get active hero images from Firebase
  const { heroImages, loading } = useHeroImages(true);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (heroImages.length === 0) return;
    
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % heroImages.length);
    }, 2000); // change every 2 seconds
    return () => clearInterval(id);
  }, [heroImages.length]);

  // Show loading or default state if no images
  if (loading || heroImages.length === 0) {
    return (
      <section id="home" className="relative w-full h-[40vh] sm:h-[45vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-800 to-black">
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/50 sm:bg-black/40" />

        {/* Content */}
        <div className="relative z-10 text-center text-white px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 sm:mb-6 animate-fade-in tracking-wider">
              <span className="text-white drop-shadow-2xl">MY BAG</span>
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-white/90 mb-6 animate-fade-in [animation-delay:200ms] max-w-2xl mx-auto">
              Discover luxury handbags that define your style
            </p>
            <div className="animate-fade-in [animation-delay:400ms]">
              <Button
                className="btn-gold text-sm sm:text-base px-6 sm:px-8 py-2 sm:py-3 shadow-2xl"
                onClick={onShopNowClick}
              >
                Shop Now
              </Button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="home" className="relative w-full h-[40vh] sm:h-[45vh] flex items-center justify-center overflow-hidden">
      {/* Background Slideshow */}
      <div className="absolute inset-0">
        {heroImages.map((image, i) => (
          <img
            key={image.id}
            src={image.imageUrl}
            alt={`Hero background ${i + 1}`}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
              i === index ? 'opacity-100' : 'opacity-0'
            }`}
            aria-hidden={i !== index}
          />
        ))}
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 sm:bg-black/40" />

      {/* Content */}
      <div className="relative z-10 text-center text-white px-4 sm:px-6 lg:px-8 w-full">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 sm:mb-6 animate-fade-in tracking-wider">
            <span className="text-white drop-shadow-2xl">MY BAG</span>
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-white/90 mb-6 animate-fade-in [animation-delay:200ms] max-w-2xl mx-auto">
            Discover luxury handbags that define your style
          </p>
          <div className="animate-fade-in [animation-delay:400ms]">
            <Button
              className="btn-gold text-sm sm:text-base px-6 sm:px-8 py-2 sm:py-3 shadow-2xl"
              onClick={onShopNowClick}
            >
              Shop Now
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};