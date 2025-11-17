import { useState } from 'react';
import { ShoppingCart, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/useCart';

interface HeaderProps {
  onCartClick: () => void;
  cartItemsCount: number;
  onBackToHome?: () => void;
  onNavigateToProducts?: () => void;
}

export const Header = ({ onCartClick, cartItemsCount, onBackToHome, onNavigateToProducts }: HeaderProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { name: 'Home', href: 'home' },
    { name: 'Products', href: 'products' }
  ];

  const handleNavigation = (page: string) => {
    if (page === 'home' && onBackToHome) {
      onBackToHome();
    } else if (page === 'products' && onNavigateToProducts) {
      onNavigateToProducts();
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-clean-neutral">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="hidden md:flex items-center justify-between h-16">
          {/* Desktop: Left nav */}
          <nav className="">
            <div className="flex items-center space-x-8">
              {navItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleNavigation(item.href)}
                  className="text-foreground underline underline-offset-4 decoration-[#374957] hover:decoration-2 transition-colors duration-200 font-medium"
                >
                  {item.name}
                </button>
              ))}
            </div>
          </nav>

          {/* Desktop: Center title (click to go Home) */}
          <div className="flex-shrink-0">
            <button
              onClick={() => (onBackToHome ? onBackToHome() : (window.location.href = '/'))}
              className="text-2xl font-bold text-black hover:text-clean-accent transition-colors"
              aria-label="العودة للصفحة الرئيسية"
            >
              MY BAG
            </button>
          </div>

          {/* Desktop: Right cart */}
          <div className="flex items-center">
            <Button
              variant="default"
              size="sm"
              className="relative p-2 rounded-md bg-[#374957] hover:bg-[#374957]"
              onClick={onCartClick}
            >
              <ShoppingCart className="h-6 w-6 text-white" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-clean-accent text-black text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItemsCount}
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* Mobile header: left menu, center title, right cart */}
        <div className="md:hidden grid grid-cols-3 items-center h-16">
          {/* Left: menu button */}
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              className="p-2"
              onClick={() => setIsMobileMenuOpen((v) => !v)}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>

          {/* Center: title (click to go Home) */}
          <div className="flex items-center justify-center">
            <button
              onClick={() => (onBackToHome ? onBackToHome() : (window.location.href = '/'))}
              className="text-xl font-bold text-black hover:text-clean-accent transition-colors"
              aria-label="العودة للصفحة الرئيسية"
            >
              MY BAG
            </button>
          </div>

          {/* Right: cart */}
          <div className="flex items-center justify-end">
            <Button
              variant="default"
              size="icon"
              className="relative p-2 rounded-full bg-[#374957] hover:bg-[#374957] border border-transparent"
              onClick={onCartClick}
              aria-label="Open cart"
            >
              <ShoppingCart className="h-5 w-5 text-white" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-clean-accent text-black text-[10px] font-extrabold rounded-full h-4 min-w-4 px-1 flex items-center justify-center">
                  {cartItemsCount}
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-clean-neutral pb-3">
            <nav className="pt-2">
              <ul className="flex flex-col gap-1">
                <li>
                  <button
                    onClick={() => handleNavigation('home')}
                    className="w-full text-left px-2 py-2 rounded hover:bg-secondary text-sm"
                  >
                    Home
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleNavigation('products')}
                    className="w-full text-left px-2 py-2 rounded hover:bg-secondary text-sm"
                  >
                    Products
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};