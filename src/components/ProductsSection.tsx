import { OffersSection } from './OffersSection';
import { AllProductsSection } from './AllProductsSection';
import { Offer } from './admin/OfferForm';
import { useProducts } from '@/hooks/useProducts';

interface ProductsSectionProps {
  offers?: Offer[];
  onOfferExpired?: (offerId: string) => void;
  onNavigateToCart?: () => void;
}

export const ProductsSection = ({ offers = [], onOfferExpired, onNavigateToCart }: ProductsSectionProps) => {
  // Use all products for accurate offer matching
  const { products: allProducts } = useProducts();

  return (
    <>
      {/* Special Offers Section */}
      <OffersSection
        offers={offers}
        products={allProducts}
        onOfferExpired={onOfferExpired || (() => {})}
        onNavigateToCart={onNavigateToCart}
      />

      {/* All Products Section */}
      <AllProductsSection offers={offers} onNavigateToCart={onNavigateToCart} />
    </>
  );
};
