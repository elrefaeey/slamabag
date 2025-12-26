import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { HeroSection } from '@/components/HeroSection';
import { BannerTextSection } from '@/components/BannerTextSection';
import { BestSellerSection } from '@/components/BestSellerSection';
import { ProductsSection } from '@/components/ProductsSection';
import { Footer } from '@/components/Footer';
import { CartSidebar } from '@/components/CartSidebar';
import { FloatingSocialIcons } from '@/components/FloatingSocialIcons';
import { Checkout } from '@/pages/Checkout';
import { Admin } from '@/pages/Admin';
import { useCart } from '@/hooks/useCart';
import { useActiveOffers } from '@/hooks/useOffers';

type Section = 'home' | 'checkout' | 'admin';

const SinglePageApp = () => {
  const [currentSection, setCurrentSection] = useState<Section>('home');
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

  const scrollToProducts = () => {
    const productsElement = document.getElementById('products-section');
    if (productsElement) {
      productsElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;
    setCurrentSection('checkout');
    setIsCartOpen(false);
  };

  const handleCartClick = () => {
    toggleCart();
  };

  const handleOrderSuccess = () => {
    clearCart();
    setCurrentSection('home');
  };

  const handleOfferExpired = (offerId: string) => {
    console.log('Offer expired:', offerId);
  };

  if (currentSection === 'checkout') {
    return (
      <Checkout
        cart={cart}
        onBackToHome={() => setCurrentSection('home')}
        onOrderSuccess={handleOrderSuccess}
      />
    );
  }

  if (currentSection === 'admin') {
    return (
      <Admin onBackToHome={() => setCurrentSection('home')} />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header
        onCartClick={handleCartClick}
        cartItemsCount={getCartItemsCount()}
        onBackToHome={() => setCurrentSection('home')}
        onNavigateToProducts={scrollToProducts}
      />
      
      <main>
        <HeroSection onShopNowClick={scrollToProducts} />
        
        <BannerTextSection />

        <BestSellerSection 
          onNavigateToCart={handleCheckout} 
          onNavigateToProducts={scrollToProducts} 
        />

        {/* Products Section */}
        <div id="products-section">
          <ProductsSection 
            offers={offers} 
            onOfferExpired={handleOfferExpired} 
            onNavigateToCart={handleCheckout} 
          />
        </div>
      </main>

      <Footer
        onAdminClick={() => setCurrentSection('admin')}
        onNavigateToHome={() => setCurrentSection('home')}
        onNavigateToProducts={scrollToProducts}
      />

      <CartSidebar
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={(productId, color, quantity) => updateQuantity(productId, color, quantity)}
        onRemoveItem={(productId, color) => removeFromCart(productId, color)}
        onCheckout={handleCheckout}
      />

      <FloatingSocialIcons />
    </div>
  );
};

export default SinglePageApp;