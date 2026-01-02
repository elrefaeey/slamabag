import { ProductCard } from './ProductCard';
import { useFeaturedProducts } from '@/hooks/useProducts';
import { Button } from '@/components/ui/button';

interface BestSellerSectionProps {
  onNavigateToCart?: () => void;
  onNavigateToProducts?: () => void;
}

export const BestSellerSection = ({ onNavigateToCart, onNavigateToProducts }: BestSellerSectionProps) => {
  const { products: featuredProducts, loading, error } = useFeaturedProducts();

  // Create a test product if no products are available
  const testProduct = {
    id: 'test-product-1',
    name: 'حقيبة يد أنيقة',
    description: 'حقيبة يد جميلة ومريحة للاستخدام اليومي',
    price: 299,
    category: 'handbags',
    images: ['/api/placeholder/400/400'],
    colors: [
      { name: 'أسود', image: '/api/placeholder/400/400' },
      { name: 'بني', image: '/api/placeholder/400/400' }
    ],
    inStock: true,
    featured: true
  };

  const bestSellers = featuredProducts.length > 0 ? featuredProducts.slice(0, 4) : [testProduct];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 text-foreground">Best Sellers</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Our most loved pieces, chosen by customers worldwide.
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="aspect-square bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-8">
            <p className="text-red-500 mb-4">خطأ في تحميل المنتجات المميزة</p>
            <button
              onClick={() => window.location.reload()}
              className="text-primary hover:underline"
            >
              إعادة المحاولة
            </button>
          </div>
        )}

        {/* Products Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
            {bestSellers.map((product) => (
              <div key={product.id} className="animate-fade-in">
                <ProductCard product={product} onNavigateToCart={onNavigateToCart} />
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && bestSellers.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">لا توجد منتجات مميزة حالياً</p>
            <p className="text-sm text-muted-foreground">
              يرجى الذهاب إلى لوحة التحكم وإضافة منتجات أو تحميل البيانات الأولية
            </p>
          </div>
        )}

        {/* CTA: All Products */}
        {!loading && !error && (
          <div className="text-center mt-10">
            <Button
              onClick={() => {
                if (onNavigateToProducts) {
                  onNavigateToProducts();
                  return;
                }
                const params = new URLSearchParams(window.location.search);
                params.set('tab', 'products');
                window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
                const el = document.getElementById('products-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="btn-gold"
            >
              ALL PRODUCTS
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};