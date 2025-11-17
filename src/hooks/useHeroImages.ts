import { useState, useEffect } from 'react';
import { HeroImage, subscribeToHeroImages, subscribeToActiveHeroImages } from '@/services/heroImageService';

export const useHeroImages = (activeOnly: boolean = false) => {
  const [heroImages, setHeroImages] = useState<HeroImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = activeOnly
      ? subscribeToActiveHeroImages((images) => {
          setHeroImages(images);
          setLoading(false);
        })
      : subscribeToHeroImages((images) => {
          setHeroImages(images);
          setLoading(false);
        });

    return () => unsubscribe();
  }, [activeOnly]);

  return { heroImages, loading };
};

