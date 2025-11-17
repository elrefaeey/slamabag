import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Product } from '@/data/products';
import { useCart } from '@/hooks/useCart';
import { Minus, Plus, ShoppingCart, ChevronDown } from 'lucide-react';
import { Offer } from './admin/OfferForm';

interface ProductDetailsModalProps {
  product: Product;
  offer?: Offer;
  isOpen: boolean;
  onClose: () => void;
  onNavigateToCart?: () => void;
  initialColorName?: string;
}

export const ProductDetailsModal = ({ product, offer, isOpen, onClose, onNavigateToCart, initialColorName }: ProductDetailsModalProps) => {
  // Normalize colors: ensure at least one option
  const productColors = useMemo(() => {
    if (product.colors && product.colors.length > 0) return product.colors;
    const fallback = product.images?.[0] || '/api/placeholder/600/600';
    return [{ name: 'Default', image: fallback }];
  }, [product.colors, product.images]);

  const [selectedColor, setSelectedColor] = useState(() => {
    if (initialColorName) {
      const match = productColors.find(c => c.name === initialColorName);
      if (match) return match;
    }
    try {
      const stored = sessionStorage.getItem(`selectedColor:${product.id}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        const match = productColors.find(c => c.name === parsed.name);
        if (match) return match;
      }
    } catch {}
    return productColors[0];
  });
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  const isOnSale = !!product.originalPrice || !!offer;
  const originalPrice = product.originalPrice || product.price;
  const discountedPrice = offer ? product.price * (1 - offer.discount / 100) : product.price;
  const displayPrice = offer ? discountedPrice : (product.originalPrice || product.price);
  const discountPercentage = offer
    ? Math.round(offer.discount)
    : product.originalPrice
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : 0;

  const increaseQuantity = () => setQuantity((q) => q + 1);
  const decreaseQuantity = () => setQuantity((q) => Math.max(1, q - 1));

  const handleAddToCart = () => {
    if (!product.inStock) return;
    addToCart({
      productId: product.id,
      name: product.name,
      price: Number(displayPrice.toFixed(2)),
      quantity,
      image: selectedColor.image,
      color: selectedColor.name,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="p-0 overflow-hidden" aria-describedby="product-dialog-description">
        <DialogHeader className="sr-only">
          <DialogTitle>{product.name}</DialogTitle>
          <DialogDescription id="product-dialog-description">
            Product details and actions for {product.name}
          </DialogDescription>
        </DialogHeader>
        {/* Vertical smooth content scroll */}
        <div className="max-h-[85vh] overflow-y-auto scroll-smooth">
          {/* Image: show full image without cropping */}
          <div className="relative w-full overflow-hidden bg-transparent flex items-center justify-center">
            <img
              src={selectedColor.image}
              alt={`${product.name} - ${selectedColor.name}`}
              className="block max-h-[70vh] w-auto h-auto object-contain select-none touch-none"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/api/placeholder/600/600';
              }}
            />

            {/* Discount badge */}
            {isOnSale && discountPercentage > 0 && (
              <div className="absolute top-3 left-3">
                <span className="inline-flex items-center justify-center rounded-full bg-red-600 text-white text-xs font-bold px-3 py-1 shadow-lg">
                  -{discountPercentage}%
                </span>
              </div>
            )}

            {/* Scroll indicator with gradient */}
            <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white/90 via-white/40 to-transparent pointer-events-none">
              <div className="absolute inset-x-0 bottom-4 flex justify-center">
                <div className="flex flex-col items-center gap-1">
                  <span className="text-xs font-semibold text-gray-800 drop-shadow-lg">مرر للأسفل لرؤية التفاصيل</span>
                  <ChevronDown className="h-4 w-4 text-gray-700 animate-bounce drop-shadow-lg" strokeWidth={2.5} />
                </div>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="p-4 sm:p-6 space-y-4">
            {/* Title */}
            <h1 className="text-xl sm:text-2xl font-bold leading-tight text-foreground line-clamp-2">{product.name}</h1>

            {/* Price */}
            <div className="flex items-center gap-3">
              <span className="text-xl sm:text-2xl font-bold text-foreground">EGP {displayPrice.toFixed(2)}</span>
              {isOnSale && (
                <span className="text-muted-foreground line-through text-base sm:text-lg">EGP {originalPrice.toFixed(2)}</span>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{product.description}</p>
            )}

            {/* Colors inside modal */}
            {productColors.length > 1 && (
              <div>
                <h3 className="text-sm font-semibold mb-2">Colors</h3>
                <div className="flex gap-2 flex-wrap">
                  {productColors.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColor(color)}
                      className={`w-9 h-9 rounded-full border-2 transition-all duration-200 overflow-hidden ${
                        selectedColor.name === color.name
                          ? 'border-blue-500 shadow'
                          : 'border-gray-300 hover:border-blue-300'
                      }`}
                      style={{
                        backgroundImage: `url(${color.image})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                      }}
                      title={color.name}
                      aria-label={`Select color ${color.name}`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <h3 className="text-sm font-semibold mb-2">الكمية</h3>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" onClick={decreaseQuantity} disabled={quantity <= 1} className="w-9 h-9 p-0">
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="text-base font-semibold min-w-[2.5rem] text-center">{quantity}</span>
                <Button variant="outline" size="sm" onClick={increaseQuantity} className="w-9 h-9 p-0">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Add to cart or Coming Soon */}
            <Button className="w-full btn-gold text-base py-3" onClick={handleAddToCart} disabled={!product.inStock}>
              <ShoppingCart className="h-5 w-5 mr-2" />
              {product.inStock ? 'Add to Cart' : 'Coming Soon'}
            </Button>

            {/* Labels */}
            <div className="flex items-center gap-2 pt-2">
              {!product.inStock && (
                <Badge variant="secondary" className="bg-muted text-muted-foreground">Not Available</Badge>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
