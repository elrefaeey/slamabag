import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/hooks/useCart';
import { Product } from '@/data/products';
import { getProductById, subscribeToProduct } from '@/services/productService';
import { ChevronDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useActiveOffers } from '@/hooks/useOffers';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const { offers } = useActiveOffers();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedColorName, setSelectedColorName] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    const fetchData = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const p = await getProductById(id);
        setProduct(p || null);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    if (id) {
      unsubscribe = subscribeToProduct(id, (p) => setProduct(p));
    }
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [id]);

  const productColors = useMemo(() => {
    if (!product) return [] as { name: string; image: string }[];
    if (product.colors && product.colors.length > 0) return product.colors;
    const fallback = product.images?.[0] || '/api/placeholder/600/600';
    return [{ name: 'Default', image: fallback }];
  }, [product]);

  const selectedColor = useMemo(() => {
    if (!productColors.length) return null;
    if (selectedColorName) {
      const match = productColors.find((c) => c.name === selectedColorName);
      if (match) return match;
    }
    return productColors[0];
  }, [productColors, selectedColorName]);

  // Find active offer for this product
  const activeOffer = useMemo(() => {
    if (!product) return null;
    return offers.find(offer => offer.productId === product.id);
  }, [offers, product]);

  // Calculate prices with offer consideration
  const basePrice = product?.price || 0;
  const baseOriginalPrice = product?.originalPrice || basePrice;
  
  // If there's an active offer, apply it to the base price
  const offerDiscountedPrice = activeOffer 
    ? basePrice * (1 - activeOffer.discount / 100) 
    : basePrice;
  
  const displayPrice = activeOffer ? offerDiscountedPrice : basePrice;
  const originalPrice = activeOffer ? basePrice : baseOriginalPrice;
  
  const isOnSale = !!product?.originalPrice || !!activeOffer;
  const discountPercentage = activeOffer 
    ? activeOffer.discount 
    : (product?.originalPrice 
        ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) 
        : 0);

  const increaseQuantity = () => setQuantity((q) => q + 1);
  const decreaseQuantity = () => setQuantity((q) => Math.max(1, q - 1));

  const handleBackToProducts = () => {
    // Always navigate to home with products open state
    navigate('/', { state: { openProducts: true }, replace: true });
  };

  const handleAddToCart = () => {
    if (!product || !selectedColor) return;
    if (!product.inStock) return;
    addToCart({
      productId: product.id,
      name: product.name,
      price: Number(displayPrice.toFixed(2)),
      quantity,
      image: selectedColor.image,
      color: selectedColor.name
    });
    // Tiny toast on the side: Arabic message, auto-dismiss quickly
    toast({
      title: 'تمت الإضافة إلى السلة',
      description: `${product.name}`,
      duration: 2000,
    });
    // Navigate back to products list
    handleBackToProducts();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">المنتج غير موجود</p>
        <Button onClick={handleBackToProducts}>الرجوع</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-3 sm:px-6 py-3 sm:py-6">
        <div className="sticky top-2 z-30 mb-3 sm:mb-4">
          <Button
            variant="outline"
            onClick={handleBackToProducts}
            className="rounded-xl px-5 py-2 font-semibold w-fit"
          >
            BACK
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 items-start">
          <div className="w-full">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-3 text-center md:text-left">{product.name}</h1>
            <div className="relative w-full overflow-hidden bg-transparent flex items-center justify-center rounded-lg shadow-sm">
              {selectedColor && (
                <img
                  src={selectedColor.image}
                  alt={`${product.name} - ${selectedColor.name}`}
                  className="block w-full h-auto object-contain max-h-[60vh] sm:max-h-[70vh]"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/api/placeholder/600/600';
                  }}
                />
              )}
              {isOnSale && discountPercentage > 0 && (
                <div className="absolute top-3 left-3">
                  <span className="inline-flex items-center justify-center rounded-full bg-red-600 text-white text-xs font-bold px-3 py-1 shadow-lg">
                    -{discountPercentage}%
                  </span>
                </div>
              )}
              {/* Scroll hint */}
              <div className="absolute bottom-0 left-0 right-0 h-16 sm:h-20 bg-gradient-to-t from-white/90 via-white/40 to-transparent flex items-end justify-center pointer-events-none">
                <div className="mb-2 text-xs sm:text-sm text-gray-700 drop-shadow">
                  <div className="flex items-center gap-2">
                    <span>مرر لأسفل للمزيد من التفاصيل</span>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
            {productColors.length > 1 && (
              <div className="mt-3 sm:mt-4">
                <div className="grid grid-cols-6 gap-2">
                  {productColors.slice(0, 6).map((color) => (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColorName(color.name)}
                      className={`w-10 h-10 sm:w-9 sm:h-9 rounded-full border-2 transition-all duration-200 overflow-hidden ${
                        selectedColor?.name === color.name ? 'border-blue-500 shadow' : 'border-gray-300 hover:border-blue-300'
                      }`}
                      style={{ backgroundImage: `url(${color.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                      title={color.name}
                      aria-label={`اختيار اللون ${color.name}`}
                    />
                  ))}
                </div>
                {productColors.length > 6 && (
                  <div className="grid grid-cols-6 gap-2 mt-2">
                    {productColors.slice(6).map((color) => (
                      <button
                        key={color.name}
                        onClick={() => setSelectedColorName(color.name)}
                        className={`w-10 h-10 sm:w-9 sm:h-9 rounded-full border-2 transition-all duration-200 overflow-hidden ${
                          selectedColor?.name === color.name ? 'border-blue-500 shadow' : 'border-gray-300 hover:border-blue-300'
                        }`}
                        style={{ backgroundImage: `url(${color.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                        title={color.name}
                        aria-label={`اختيار اللون ${color.name}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
            <div className="mt-2 text-sm text-muted-foreground">
              Color: {selectedColor?.name}
            </div>
          </div>

          <div className="p-1 sm:p-2 w-full">
            <p className="text-muted-foreground mb-4 leading-relaxed text-sm sm:text-base">{product.description}</p>
            <div className="flex items-center gap-3 mb-3 sm:mb-4">
              {isOnSale && (
                <Badge className="bg-destructive text-destructive-foreground">-{discountPercentage}%</Badge>
              )}
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-semibold text-clean-accent">EGP {displayPrice.toFixed(2)}</span>
                {isOnSale && originalPrice > 0 && (
                  <span className="text-muted-foreground line-through text-lg decoration-2 decoration-red-500">
                    EGP {originalPrice.toFixed(2)}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-4 mb-2 sm:mb-6">
              <div className="inline-flex items-center border rounded w-fit">
                <button className="px-4 py-3 sm:px-3 sm:py-2" onClick={decreaseQuantity} aria-label="decrease">-</button>
                <span className="px-5 sm:px-4 select-none">{quantity}</span>
                <button className="px-4 py-3 sm:px-3 sm:py-2" onClick={increaseQuantity} aria-label="increase">+</button>
              </div>
              <Button className="btn-gold w-full sm:w-auto py-4 sm:py-2" disabled={!product.inStock} onClick={handleAddToCart}>
                {product.inStock ? 'ADD TO CART' : 'Out of Stock'}
              </Button>
            </div>
            <div className="mt-1 text-xs sm:text-sm">
              <button
                className="text-muted-foreground hover:text-foreground underline"
                onClick={handleBackToProducts}
              >
                Back to Products
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* sticky bar removed as requested */}
    </div>
  );
};

export default ProductDetails;


