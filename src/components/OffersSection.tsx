import { useState, useEffect } from 'react';
import { ProductCard } from './ProductCard';
import { Offer } from './admin/OfferForm';
import { Product } from '@/data/products';
import { Badge } from '@/components/ui/badge';

interface OffersSectionProps {
  offers: Offer[];
  products: Product[];
  onOfferExpired: (offerId: string) => void;
  onNavigateToCart?: () => void;
}

export const OffersSection = ({ offers, products, onOfferExpired, onNavigateToCart }: OffersSectionProps) => {
  const [activeOffers, setActiveOffers] = useState<Offer[]>([]);

  useEffect(() => {
    // Filter active offers that haven't expired
    const now = new Date();
    const validOffers = offers.filter(offer => 
      offer.isActive && offer.endTime > now
    );
    setActiveOffers(validOffers);

    // Set up timers to remove expired offers
    const timers = validOffers.map(offer => {
      const timeUntilExpiry = offer.endTime.getTime() - now.getTime();
      if (timeUntilExpiry > 0) {
        return setTimeout(() => {
          onOfferExpired(offer.id);
          setActiveOffers(prev => prev.filter(o => o.id !== offer.id));
        }, timeUntilExpiry);
      }
      return null;
    }).filter(Boolean);

    return () => {
      timers.forEach(timer => timer && clearTimeout(timer));
    };
  }, [offers, onOfferExpired]);

  // Get products that have active offers
  const offeredProducts = activeOffers.map(offer => {
    const product = products.find(p => p.id === offer.productId);
    return product ? { product, offer } : null;
  }).filter(Boolean);

  // Always show the section, with placeholder if no offers
  const hasOffers = offeredProducts.length > 0;

  return (
    <section className="py-12 section-secondary border-b border-clean-neutral">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 text-offer-red">Special Offers</h2>
          {hasOffers ? (
            <>
              <div className="flex items-center justify-center gap-3 mb-4">
                <Badge className="bg-offer-red text-white text-lg px-4 py-2 animate-pulse">
                  🔥 OFFERS
                </Badge>
                <Badge className="bg-offer-blue text-white text-lg px-4 py-2 animate-pulse">
                  DEALS 🔥
                </Badge>
              </div>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Don't miss out on these amazing deals! Limited time only.
              </p>
            </>
          ) : (
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Stay tuned for upcoming offers in the coming days!
            </p>
          )}
        </div>

        {/* Offers Content */}
        {hasOffers ? (
          <>
            {/* Offers Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-8">
              {offeredProducts.map(({ product, offer }) => (
                <div key={`${product.id}-${offer.id}`} className="relative">
                  {/* Large Discount Badge */}
                  <div className="absolute -top-2 -right-2 z-20">
                    <Badge className="bg-offer-red text-white text-lg font-bold px-3 py-2 rounded-full shadow-lg animate-bounce">
                      -{offer.discount}%
                    </Badge>
                  </div>

                  {/* Product Card */}
                  <div className="transform hover:scale-105 transition-transform duration-300">
                    <ProductCard product={product} offer={offer} onNavigateToCart={onNavigateToCart} />
                  </div>
                </div>
              ))}
            </div>

            {/* Call to Action */}
            <div className="text-center mt-8">
              <p className="text-red-600 font-semibold text-lg animate-pulse">
                🔥 Limited time offers - Don't miss out!
              </p>
            </div>
          </>
        ) : (
          /* Placeholder when no offers */
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🎁</div>
            <p className="text-gray-500 text-lg">
              No special offers available at the moment
            </p>
            <p className="text-gray-400 text-sm mt-2">
              Check back soon for exciting deals!
            </p>
          </div>
        )}
      </div>
    </section>
  );
};
