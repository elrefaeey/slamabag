import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Header } from '@/components/Header';
import { HeroSection } from '@/components/HeroSection';
import { BannerTextSection } from '@/components/BannerTextSection';
import { BestSellerSection } from '@/components/BestSellerSection';
import { Footer } from '@/components/Footer';
import { CartSidebar } from '@/components/CartSidebar';
import { FloatingSocialIcons } from '@/components/FloatingSocialIcons';
import { Checkout } from '@/pages/Checkout';
import { Products } from '@/pages/Products';
import { Admin } from '@/pages/Admin';
import { useCart } from '@/hooks/useCart';
import { Button } from '@/components/ui/button';
import { Shield } from 'lucide-react';

type Page = 'home' | 'products' | 'checkout' | 'admin';

const Index = () => {
  const location = useLocation();
  const [currentPage, setCurrentPage] = useState<Page>('home');

  // Check if we should open products page when navigating back
  useEffect(() => {
    if (location.state?.openProducts) {
      setCurrentPage('products');
    }
  }, [location.state]);
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

  const scrollToBestSellers = () => {
    setCurrentPage('products');
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;
    setCurrentPage('checkout');
    setIsCartOpen(false);
  };

  const handleCartClick = () => {
    setCurrentPage('checkout');
    setIsCartOpen(false);
  };

  const handleOrderSuccess = () => {
    clearCart();
    setCurrentPage('home');
  };

  if (currentPage === 'checkout') {
    return (
      <Checkout
        cart={cart}
        onBackToHome={() => setCurrentPage('home')}
        onOrderSuccess={handleOrderSuccess}
      />
    );
  }

  if (currentPage === 'products') {
    return (
      <Products
        onBackToHome={() => setCurrentPage('home')}
        onNavigateToCart={() => setCurrentPage('checkout')}
      />
    );
  }

  if (currentPage === 'admin') {
    return (
      <Admin onBackToHome={() => setCurrentPage('home')} />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header
        onCartClick={handleCartClick}
        cartItemsCount={getCartItemsCount()}
        onBackToHome={() => setCurrentPage('home')}
        onNavigateToProducts={() => setCurrentPage('products')}
      />
      
      <main>
        <HeroSection onShopNowClick={scrollToBestSellers} />
        
        <BannerTextSection />

        <BestSellerSection onNavigateToCart={() => setCurrentPage('checkout')} onNavigateToProducts={() => setCurrentPage('products')} />
      </main>

      <Footer
        onAdminClick={() => setCurrentPage('admin')}
        onNavigateToHome={() => setCurrentPage('home')}
        onNavigateToProducts={() => setCurrentPage('products')}
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

export default Index;
