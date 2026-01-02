import { useState, useEffect } from 'react';
import { BannerText, subscribeToBannerText } from '@/services/bannerTextService';

export const useBannerText = () => {
  const [bannerText, setBannerText] = useState<BannerText | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToBannerText((text) => {
      setBannerText(text);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { bannerText, loading };
};

