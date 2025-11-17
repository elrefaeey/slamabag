import { useState, useEffect } from 'react';
import { ProductCard } from './ProductCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Offer } from './admin/OfferForm';
import { useFeaturedProducts, useProductsByCategory } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { useActiveOffers } from '@/hooks/useOffers';
import { Product } from '@/data/products';
import { Loader2 } from 'lucide-react';

interface HomepageProductsSectionProps {
  onNavigateToCart?: () => void;
  onNavigateToProducts?: () => void;
}

export const HomepageProductsSection = ({ onNavigateToCart, onNavigateToProducts }: HomepageProductsSectionProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const { categories, loading: categoriesLoading } = useCategories();
  const { products: featuredProducts, loading: featuredLoading } = useFeaturedProducts();
  const { products: categoryProducts, loading: categoryLoading } = useProductsByCategory(
    selectedCategory === 'all' ? undefined : selectedCategory
  );
  const { offers } = useActiveOffers();

  // Combine all products
  const allProducts = selectedCategory === 'all' 
    ? [...featuredProducts, ...categoryProducts]
    : categoryProducts;

  // Remove duplicates
  const uniqueProducts = allProducts.filter((product, index, self) =>
    index === self.findIndex(p => p.id === product.id)
  );

  // Limit to 8 products for homepage display
  const displayProducts = uniqueProducts.slice(0, 8);

  const loading = categoriesLoading || featuredLoading || categoryLoading;

  return (
    <section className="py-16 sm:py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Our Products</h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover our curated collection of premium bags and accessories
          </p>
        </div>

        {/* Category Filter Buttons */}
        <div className="mb-8 sm:mb-12">
          {/* Desktop Layout - Single Row */}
          <div className="hidden sm:flex sm:flex-wrap sm:justify-center sm:gap-3 lg:gap-4">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              onClick={() => setSelectedCategory('all')}
              className="mb-2"
            >
              All Products
              <Badge variant="secondary" className="ml-2">
                {uniqueProducts.length}
              </Badge>
            </Button>
            
            {categories.map((category) => {
              const categoryProductCount = featuredProducts.concat(categoryProducts)
                .filter(product => product.category === category.id).length;
              
              return (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory(category.id)}
                  className="mb-2"
                >
                  {category.name}
                  <Badge variant="secondary" className="ml-2">
                    {categoryProductCount}
                  </Badge>
                </Button>
              );
            })}
          </div>

          {/* Mobile Layout - Multiple Rows */}
          <div className="sm:hidden">
            {/* All Products button - full width */}
            <div className="mb-3">
              <Button
                variant={selectedCategory === 'all' ? 'default' : 'outline'}
                onClick={() => setSelectedCategory('all')}
                className="w-full text-sm py-3 px-4"
              >
                All Products
                <Badge variant="secondary" className="ml-2 text-xs">
                  {uniqueProducts.length}
                </Badge>
              </Button>
            </div>

            {/* Category buttons in responsive grid */}
            <div className={`grid gap-2 ${categories.length > 4 ? 'grid-cols-3' : 'grid-cols-2'}`}>
              {categories.map((category) => {
                const categoryProductCount = featuredProducts.concat(categoryProducts)
                  .filter(product => product.category === category.id).length;
                
                return (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? 'default' : 'outline'}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`text-xs py-3 min-h-[48px] flex flex-col items-center justify-center gap-1 ${
                      categories.length > 4 ? 'px-1' : 'px-2'
                    }`}
                    size="sm"
                  >
                    <span className="text-center leading-tight font-medium text-[11px]">
                      {category.name}
                    </span>
                    <Badge variant="secondary" className="text-[9px] px-1 py-0.5">
                      {categoryProductCount}
                    </Badge>
                  </Button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-lg">Loading products...</span>
          </div>
        )}

        {/* Error State */}
        {!loading && displayProducts.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-2xl font-semibold mb-2">No Products Found</h3>
            <p className="text-muted-foreground">
              {selectedCategory === 'all' 
                ? 'No products available at the moment.' 
                : `No products found in the selected category.`
              }
            </p>
            {selectedCategory !== 'all' && (
              <Button 
                variant="outline" 
                onClick={() => setSelectedCategory('all')}
                className="mt-4"
              >
                View All Products
              </Button>
            )}
          </div>
        )}

        {/* Products Grid */}
        {!loading && displayProducts.length > 0 && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {displayProducts.map((product) => {
                const productOffer = offers.find(offer =>
                  offer.productId === product.id &&
                  offer.isActive &&
                  offer.endTime > new Date()
                );

                return (
                  <div key={product.id} className="animate-fade-in">
                    <ProductCard product={product} offer={productOffer} onNavigateToCart={onNavigateToCart} />
                  </div>
                );
              })}
            </div>

            {/* View All Products Button */}
            {uniqueProducts.length > 8 && (
              <div className="text-center mt-8 sm:mt-12">
                <Button 
                  className="btn-accent px-8 py-3"
                  onClick={() => {
                    if (onNavigateToProducts) {
                      onNavigateToProducts();
                    }
                  }}
                >
                  View All Products ({uniqueProducts.length})
                </Button>
              </div>
            )}

            {/* Results Summary */}
            <div className="text-center mt-6">
              <p className="text-sm text-muted-foreground">
                Showing {displayProducts.length} of {uniqueProducts.length} product{uniqueProducts.length !== 1 ? 's' : ''} 
                {selectedCategory !== 'all' && (
                  <span> in {categories.find(c => c.id === selectedCategory)?.name}</span>
                )}
              </p>
            </div>
          </>
        )}
      </div>
    </section>
  );
};