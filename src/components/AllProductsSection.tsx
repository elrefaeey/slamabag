import { useState } from 'react';
import { ProductCard } from './ProductCard';
import { Button } from '@/components/ui/button';
import { Offer } from './admin/OfferForm';
import { useProducts, useProductsByCategory } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { Loader2 } from 'lucide-react';

interface AllProductsSectionProps {
  offers?: Offer[];
  onNavigateToCart?: () => void;
}

export const AllProductsSection = ({ offers = [], onNavigateToCart }: AllProductsSectionProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const { categories, loading: categoriesLoading } = useCategories();

  // Load all products for the "All Products" view
  const { products: allProducts, loading: allLoading } = useProducts();

  // Load products by category when a specific category is selected
  const { products: categoryProducts, loading: categoryLoading } = useProductsByCategory(
    selectedCategory === 'all' ? '' : selectedCategory
  );

  // Choose products source based on selection
  const productsToShow = selectedCategory === 'all' ? allProducts : categoryProducts;

  // Unified loading state
  const loading = categoriesLoading || (selectedCategory === 'all' ? allLoading : categoryLoading);

  return (
    <section className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Category Filter Buttons */}
        <div className="mb-8 sm:mb-12">
          {/* Desktop Layout - Single Row */}
          <div className="hidden sm:flex sm:flex-nowrap sm:justify-center sm:gap-3 lg:gap-4 overflow-x-auto">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              onClick={() => setSelectedCategory('all')}
              className="mb-2 whitespace-nowrap"
            >
              All Products
            </Button>
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(category.id)}
                className="mb-2 whitespace-nowrap"
              >
                {category.name}
              </Button>
            ))}
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
              </Button>
            </div>

            {/* Category buttons in responsive grid */}
            <div className={`grid gap-2 ${categories.length > 4 ? 'grid-cols-3' : 'grid-cols-2'}`}>
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`text-xs py-3 min-h-[48px] flex items-center justify-center ${
                    categories.length > 4 ? 'px-1' : 'px-2'
                  }`}
                  size="sm"
                >
                  <span className="text-center leading-tight font-medium text-[11px]">
                    {category.name}
                  </span>
                </Button>
              ))}
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

        {/* Error/Empty State */}
        {!loading && productsToShow.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-2xl font-semibold mb-2">No Products Found</h3>
            <p className="text-muted-foreground">
              {selectedCategory === 'all' 
                ? 'No products available at the moment.' 
                : `No products found in the selected category.`}
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
        {!loading && productsToShow.length > 0 && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {productsToShow.map((product) => {
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
          </>
        )}
      </div>
    </section>
  );
};
