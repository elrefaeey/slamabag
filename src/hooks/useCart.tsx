import { useState, useCallback, useEffect, createContext, useContext, ReactNode } from 'react';
import { CartItem } from '@/data/orders';
import { DiscountCode, validateDiscountCode } from '@/services/discountService';

const CART_STORAGE_KEY = 'mybag-cart';
const DISCOUNT_STORAGE_KEY = 'mybag-discount';

// Check if localStorage is available
const isStorageAvailable = (): boolean => {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
};

// Load cart from sessionStorage (reset on browser/tab close)
const loadCartFromStorage = (): CartItem[] => {
  try {
    const stored = sessionStorage.getItem(CART_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.warn('Error loading cart from session storage:', error);
    return [];
  }
};

// Save cart to sessionStorage
const saveCartToStorage = (cart: CartItem[]) => {
  try {
    sessionStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } catch (error) {
    console.warn('Error saving cart to session storage:', error);
  }
};

// Load discount from sessionStorage (clears on browser/tab close)
const loadDiscountFromStorage = (): DiscountCode | null => {
  try {
    const stored = sessionStorage.getItem(DISCOUNT_STORAGE_KEY);
    if (stored) {
      const discount = JSON.parse(stored);
      // Convert date strings back to Date objects
      if (discount.createdAt) discount.createdAt = new Date(discount.createdAt);
      if (discount.updatedAt) discount.updatedAt = new Date(discount.updatedAt);
      return discount;
    }
    return null;
  } catch (error) {
    console.warn('Error loading discount from session storage:', error);
    return null;
  }
};

// Save discount to sessionStorage
const saveDiscountToStorage = (discount: DiscountCode | null) => {
  try {
    if (discount) {
      sessionStorage.setItem(DISCOUNT_STORAGE_KEY, JSON.stringify(discount));
    } else {
      sessionStorage.removeItem(DISCOUNT_STORAGE_KEY);
    }
  } catch (error) {
    console.warn('Error saving discount to session storage:', error);
  }
};

// Cart Context Type
interface CartContextType {
  cart: CartItem[];
  isCartOpen: boolean;
  appliedDiscount: DiscountCode | null;
  discountError: string | null;
  isValidatingDiscount: boolean;
  addToCart: (item: Omit<CartItem, 'id'>) => void;
  removeFromCart: (productId: string, color?: string) => void;
  updateQuantity: (productId: string, color: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getDiscountedTotal: () => number;
  getDiscountAmount: () => number;
  getCartItemsCount: () => number;
  toggleCart: () => void;
  setIsCartOpen: (open: boolean) => void;
  applyDiscountCode: (code: string) => Promise<boolean>;
  removeDiscountCode: () => void;
}

// Create Cart Context
const CartContext = createContext<CartContextType | undefined>(undefined);

// Cart Provider Component
export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>(() => loadCartFromStorage());
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [appliedDiscount, setAppliedDiscount] = useState<DiscountCode | null>(() => loadDiscountFromStorage());
  const [discountError, setDiscountError] = useState<string | null>(null);
  const [isValidatingDiscount, setIsValidatingDiscount] = useState(false);

  // Save cart to localStorage whenever cart changes
  useEffect(() => {
    saveCartToStorage(cart);
    const totalItems = cart.reduce((count, item) => count + item.quantity, 0);
    console.log(`🛒 Cart updated - Total items: ${totalItems}`);
  }, [cart]);

  // Save discount to localStorage whenever discount changes
  useEffect(() => {
    saveDiscountToStorage(appliedDiscount);
  }, [appliedDiscount]);

  const addToCart = useCallback((item: Omit<CartItem, 'id'>) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(
        cartItem => cartItem.productId === item.productId && cartItem.color === item.color
      );

      if (existingItem) {
        console.log(`✅ Updated quantity for ${item.name} (${item.color}) - New quantity: ${existingItem.quantity + item.quantity}`);
        return prevCart.map(cartItem =>
          cartItem.productId === item.productId && cartItem.color === item.color
            ? { ...cartItem, quantity: cartItem.quantity + item.quantity }
            : cartItem
        );
      }

      const newItem: CartItem = {
        ...item,
        id: `cart-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      };

      console.log(`✅ Added ${item.name} (${item.color}) to cart - Quantity: ${item.quantity}`);
      return [...prevCart, newItem];
    });
  }, []);

  const removeFromCart = useCallback((productId: string, color?: string) => {
    setCart(prevCart => {
      if (color) {
        // Remove by productId and color
        const item = prevCart.find(item => item.productId === productId && item.color === color);
        if (item) {
          console.log(`Removed ${item.name} (${color}) from cart`);
        }
        return prevCart.filter(item => !(item.productId === productId && item.color === color));
      } else {
        // Remove by item id (for backward compatibility)
        const item = prevCart.find(item => item.id === productId);
        if (item) {
          console.log(`Removed ${item.name} from cart`);
        }
        return prevCart.filter(item => item.id !== productId);
      }
    });
  }, []);

  const updateQuantity = useCallback((productId: string, color: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, color);
      return;
    }

    setCart(prevCart =>
      prevCart.map(item =>
        item.productId === productId && item.color === color
          ? { ...item, quantity }
          : item
      )
    );
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setCart([]);
    console.log('Cart cleared');
  }, []);

  const getCartTotal = useCallback(() => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  }, [cart]);

  const getDiscountAmount = useCallback(() => {
    if (!appliedDiscount) return 0;
    const subtotal = getCartTotal();
    return subtotal * (appliedDiscount.discountPercentage / 100);
  }, [cart, appliedDiscount, getCartTotal]);

  const getDiscountedTotal = useCallback(() => {
    const subtotal = getCartTotal();
    const discount = getDiscountAmount();
    return Math.max(0, subtotal - discount);
  }, [getCartTotal, getDiscountAmount]);

  const getCartItemsCount = useCallback(() => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  }, [cart]);

  const toggleCart = useCallback(() => {
    setIsCartOpen(prev => !prev);
  }, []);

  const applyDiscountCode = useCallback(async (code: string): Promise<boolean> => {
    if (!code.trim()) {
      setDiscountError('Please enter a discount code');
      return false;
    }

    setIsValidatingDiscount(true);
    setDiscountError(null);

    try {
      const validation = await validateDiscountCode(code);

      if (validation.isValid && validation.discountCode) {
        setAppliedDiscount(validation.discountCode);
        setDiscountError(null);
        console.log(`✅ Discount code applied: ${validation.discountCode.code} (${validation.discountCode.discountPercentage}% off)`);
        return true;
      } else {
        setDiscountError(validation.error || 'Invalid discount code');
        setAppliedDiscount(null);
        return false;
      }
    } catch (error) {
      console.error('Error applying discount code:', error);
      setDiscountError('Error validating discount code. Please try again.');
      setAppliedDiscount(null);
      return false;
    } finally {
      setIsValidatingDiscount(false);
    }
  }, []);

  const removeDiscountCode = useCallback(() => {
    setAppliedDiscount(null);
    setDiscountError(null);
    console.log('🗑️ Discount code removed');
  }, []);

  const value: CartContextType = {
    cart,
    isCartOpen,
    appliedDiscount,
    discountError,
    isValidatingDiscount,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getDiscountedTotal,
    getDiscountAmount,
    getCartItemsCount,
    toggleCart,
    setIsCartOpen,
    applyDiscountCode,
    removeDiscountCode
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

// Custom hook to use cart context
export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};