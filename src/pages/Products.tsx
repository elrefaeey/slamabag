import { useState } from 'react';
import { Header } from '@/components/Header';
import { ProductsSection } from '@/components/ProductsSection';
import { useCart } from '@/hooks/useCart';
import { useActiveOffers } from '@/hooks/useOffers';
import { Offer } from '@/components/admin/OfferForm';

interface ProductsProps {
  onBackToHome: () => void;
  onNavigateToCart?: () => void;
}

export const Products = ({ onBackToHome, onNavigateToCart }: ProductsProps) => {
  const { offers } = useActiveOffers();
  const {
    cart,
    isCartOpen,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartItemsCount,
    toggleCart,
    setIsCartOpen
  } = useCart();

  const handleCheckout = () => {
    // This would typically navigate to checkout
    console.log('Navigate to checkout');
  };

  const handleOfferExpired = (offerId: string) => {
    // Offers will be automatically removed by the Firebase subscription
    // when they expire, so we don't need to manually manage state here
    console.log('Offer expired:', offerId);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        onCartClick={() => {
          if (onNavigateToCart) onNavigateToCart();
        }}
        cartItemsCount={getCartItemsCount()}
        onBackToHome={onBackToHome}
      />

      <main className="pt-16">
        <ProductsSection offers={offers} onOfferExpired={handleOfferExpired} onNavigateToCart={onNavigateToCart} />
      </main>
    </div>
  );
};