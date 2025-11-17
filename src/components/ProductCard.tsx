import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Product } from '@/data/products';
import { useCart } from '@/hooks/useCart';
import { ShoppingCart } from 'lucide-react';
import { Offer } from './admin/OfferForm';
import { ProductDetailsModal } from './ProductDetailsModal';

interface ProductCardProps {
  product: Product;
  offer?: Offer;
  onNavigateToCart?: () => void;
}

export const ProductCard = ({ product, offer, onNavigateToCart }: ProductCardProps) => {
  // Ensure product has colors, if not create a default one
  const defaultColor = { name: 'Default', image: product.images?.[0] || '/api/placeholder/400/400' };
  const productColors = product.colors && product.colors.length > 0 ? product.colors : [defaultColor];

  // Persist selected color in sessionStorage per product
  const [selectedColor, setSelectedColor] = useState(() => {
    const key = `selectedColor:${product.id}`;
    try {
      const stored = sessionStorage.getItem(key);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Find matching color object by name; fallback to first
        const match = (product.colors || []).find(c => c.name === parsed.name) || productColors[0];
        return match;
      }
    } catch {}
    return productColors[0];
  });
  const [isHovered, setIsHovered] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const handleAddToCart = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!product.inStock) return;

    addToCart({
      productId: product.id,
      name: product.name,
      price: displayPrice,
      quantity: quantity,
      image: selectedColor.image,
      color: selectedColor.name
    });
  };

  const handleCardClick = () => {
    navigate(`/products/${product.id}`);
  };

  const isOnSale = !!product.originalPrice || !!offer;
  const originalPrice = product.originalPrice || product.price;
  const discountedPrice = offer ? product.price * (1 - offer.discount / 100) : product.price;
  const displayPrice = offer ? discountedPrice : product.price;
  
  const discountPercentage = offer ? offer.discount : 
    (product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0);

  return (
    <>
      <div
        className="product-card group relative cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleCardClick}
      >
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden bg-secondary">
        <img
          src={selectedColor.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {!product.inStock && (
            <Badge variant="secondary" className="bg-muted text-muted-foreground">
              Not Available
            </Badge>
          )}
          {isOnSale && (
            <Badge className="bg-destructive text-destructive-foreground">
              -{discountPercentage}%
            </Badge>
          )}

        </div>







        {/* Sold Out Overlay */}
        {!product.inStock && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <span className="text-lg font-semibold text-muted-foreground">Not Available</span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-1">{product.name}</h3>
        <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{product.description}</p>
        
        {/* Price */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl font-bold text-clean-accent">EGP {displayPrice.toFixed(2)}</span>
          {isOnSale && (
            <span className="text-muted-foreground line-through text-sm decoration-2 decoration-red-500">
              EGP {originalPrice.toFixed(2)}
            </span>
          )}
        </div>

        {/* Colors (outside details) */}
        {productColors.length > 0 && (
          <div className="mb-3">
            {/* Show 3 thumbnails side-by-side with horizontal scroll (like a ruler) */}
            <div className="overflow-x-auto no-scrollbar flex gap-2 flex-nowrap scroll-smooth snap-x snap-mandatory max-w-[112px] pr-1">
              {productColors.map((color) => (
                <button
                  key={color.name}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedColor(color);
                    try {
                      sessionStorage.setItem(`selectedColor:${product.id}`, JSON.stringify({ name: color.name }));
                    } catch {}
                  }}
                  className={`w-7 h-7 rounded-full border-2 transition-all duration-200 overflow-hidden snap-start ${
                    selectedColor.name === color.name
                      ? 'border-blue-500 shadow'
                      : 'border-gray-300 hover:border-blue-300'
                  }`}
                  style={{
                    backgroundImage: `url(${color.image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                  title={color.name}
                  aria-label={`اختيار اللون ${color.name}`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Primary Action Button */}
        <Button
          className="w-full btn-gold"
          onClick={handleCardClick}
          disabled={!product.inStock}
        >
          {product.inStock ? 'Shop Now' : 'Coming Soon'}
        </Button>
      </div>
    </div>

    {/* Modal no longer used when navigating to dedicated page */}
  </>
  );
};