import { useBannerText } from '@/hooks/useBannerText';

export const BannerTextSection = () => {
  const { bannerText, loading } = useBannerText();

  // Don't render if loading or no banner text or inactive
  if (loading || !bannerText || !bannerText.isActive) {
    return null;
  }

  return (
    <section className="w-full py-3 sm:py-4">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-3 px-4 sm:px-6 bg-white rounded-lg shadow-sm border-2 border-[#4A5568]">
          <p className="text-center text-sm sm:text-base text-gray-700">
            {bannerText.text}
          </p>
        </div>
      </div>
    </section>
  );
};

