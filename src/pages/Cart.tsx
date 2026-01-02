import { useState } from 'react';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCart } from '@/hooks/useCart';
import { useDiscountCodes } from '@/hooks/useDiscountCodes';
import { useProducts } from '@/hooks/useProducts';
import { ArrowLeft, Plus, Minus, Trash2, ShoppingBag, Percent, X, Check, Gift } from 'lucide-react';

interface CartProps {
  onBackToHome: () => void;
  onNavigateToCheckout: () => void;
}

export const Cart = ({ onBackToHome, onNavigateToCheckout }: CartProps) => {
  const {
    cart,
    updateQuantity,
    removeFromCart,
    getCartTotal,
    getDiscountedTotal,
    getDiscountAmount,
    getCartItemsCount,
    clearCart,
    appliedDiscount,
    discountError,
    isValidatingDiscount,
    applyDiscountCode,
    removeDiscountCode
  } = useCart();

  const { discountCodes } = useDiscountCodes();
  const featuredCode = discountCodes.find(dc => dc.isActive);
  const { products } = useProducts();
  const [discountCodeInput, setDiscountCodeInput] = useState('');

  const handleQuantityChange = (productId: string, color: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId, color);
    } else {
      updateQuantity(productId, color, newQuantity);
    }
  };

  const handleApplyDiscount = async () => {
    if (discountCodeInput.trim()) {
      const success = await applyDiscountCode(discountCodeInput.trim());
      if (success) {
        setDiscountCodeInput('');
      }
    }
  };

  const handleRemoveDiscount = () => {
    removeDiscountCode();
  };

  const handleCheckout = () => {
    if (cart.length > 0) {
      onNavigateToCheckout();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        onCartClick={() => {}}
        cartItemsCount={getCartItemsCount()}
        onBackToHome={onBackToHome}
      />
      
      <main className="pt-16 pb-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Discount Code Banner (top, both mobile and desktop) */}
          {featuredCode && !appliedDiscount && (
            <Card className="mb-4 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-blue-700">Use this discount code:</p>
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-blue-800 text-lg">{featuredCode.code}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        const ok = await applyDiscountCode(featuredCode.code);
                        if (ok) setDiscountCodeInput('');
                      }}
                    >
                      Apply
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="ghost"
              onClick={onBackToHome}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Shop
            </Button>
            <h1 className="text-3xl font-bold">Shopping Cart</h1>
          </div>

          {/* Discount Codes Promotional Banner */}
          {discountCodes.length > 0 && !appliedDiscount && (
            <Card className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Gift className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold text-blue-800">Available Discount Codes</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {discountCodes.map((code) => (
                    <div
                      key={code.id}
                      className="bg-white rounded-lg p-3 border border-blue-200 cursor-pointer hover:bg-blue-50 transition-colors"
                      onClick={() => setDiscountCodeInput(code.code)}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-blue-700">{code.code}</span>
                        <span className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          {code.discountPercentage}% OFF
                        </span>
                      </div>
                      {code.description && (
                        <p className="text-xs text-gray-600 mt-1">{code.description}</p>
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-sm text-blue-600 mt-3">
                  💡 Click on any code to apply it to your order!
                </p>
              </CardContent>
            </Card>
          )}

          {cart.length === 0 ? (
            /* Empty Cart */
            <Card className="text-center py-16">
              <CardContent>
                <ShoppingBag className="h-24 w-24 text-muted-foreground mx-auto mb-6" />
                <h2 className="text-2xl font-semibold mb-4">Your cart is empty</h2>
                <p className="text-muted-foreground mb-6">
                  Looks like you haven't added any items to your cart yet.
                </p>
                <Button onClick={onBackToHome} className="btn-gold">
                  Continue Shopping
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">
                    Cart Items ({getCartItemsCount()})
                  </h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearCart}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear Cart
                  </Button>
                </div>

                {cart.map((item) => {
                  const product = products.find(p => p.id === item.productId);
                  const promoPrice = product?.originalPrice ? product.price : undefined;
                  const baseUnitPrice = product?.originalPrice ? product.price : item.price;
                  const hasCodeDiscount = !!appliedDiscount;
                  const subtotal = baseUnitPrice * item.quantity;
                  const codeDiscountAmount = hasCodeDiscount ? (subtotal * (appliedDiscount!.discountPercentage / 100)) : 0;
                  const finalTotal = subtotal - codeDiscountAmount;

                  return (
                    <Card key={`${item.productId}-${item.color}`} className="shadow-soft">
                      <CardContent className="p-6">
                        {/* Vertical layout: image -> name -> price -> quantity */}
                        <div className="flex flex-col items-stretch gap-3">
                          {/* Product Image */}
                          <div className="w-full aspect-[4/3] bg-secondary rounded-lg overflow-hidden">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          {/* Product Name */}
                          <h3 className="font-semibold text-base sm:text-lg truncate">{item.name}</h3>
                          <p className="text-sm text-muted-foreground">Color: {item.color}</p>

                          {/* Price (promo + code discount display) */}
                          <div className="space-y-1">
                            {product?.originalPrice ? (
                              <div className="flex items-center gap-2">
                                <span className="text-sm line-through text-muted-foreground">EGP {product.originalPrice.toFixed(2)}</span>
                                <span className="text-lg font-bold text-green-700">EGP {product.price.toFixed(2)}</span>
                                <Badge className="bg-green-100 text-green-700">-{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%</Badge>
                              </div>
                            ) : (
                              <span className="text-lg font-bold text-green-700">EGP {baseUnitPrice.toFixed(2)}</span>
                            )}

                            {hasCodeDiscount && (
                              <div className="text-xs text-green-700">
                                Code discount ({appliedDiscount!.discountPercentage}%): -EGP {codeDiscountAmount.toFixed(2)} on this item total
                              </div>
                            )}
                          </div>

                          {/* Quantity Controls */}
                          <div className="flex items-center gap-3">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleQuantityChange(item.productId, item.color, item.quantity - 1)}
                              className="w-8 h-8 p-0"
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="text-lg font-semibold min-w-[2rem] text-center">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleQuantityChange(item.productId, item.color, item.quantity + 1)}
                              className="w-8 h-8 p-0"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                            <div className="ml-auto text-right">
                              <div className="text-sm">Item total</div>
                              <div className="text-lg font-bold text-green-700">EGP {finalTotal.toFixed(2)}</div>
                            </div>
                          </div>

                          {/* Remove */}
                          <div className="flex justify-end">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFromCart(item.productId, item.color)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4 mr-1" /> Remove
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <Card className="shadow-soft sticky top-24">
                  <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal ({getCartItemsCount()} items)</span>
                      <span>EGP {getCartTotal().toFixed(2)}</span>
                    </div>

                    {/* Discount Code Section */}
                    <div className="space-y-3 py-2">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <Percent className="h-4 w-4" />
                        <span>Discount Code</span>
                      </div>

                      {appliedDiscount ? (
                        /* Applied Discount Display */
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Check className="h-4 w-4 text-green-600" />
                              <span className="font-mono font-bold text-green-700">
                                {appliedDiscount.code}
                              </span>
                              <span className="text-sm text-green-600">
                                ({appliedDiscount.discountPercentage}% off)
                              </span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleRemoveDiscount}
                              className="h-6 w-6 p-0 text-green-600 hover:text-green-700"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        /* Discount Code Input */
                        <div className="space-y-2">
                          <div className="flex gap-2">
                            <Input
                              placeholder="Enter discount code"
                              value={discountCodeInput}
                              onChange={(e) => setDiscountCodeInput(e.target.value.toUpperCase())}
                              className="flex-1"
                              disabled={isValidatingDiscount}
                            />
                            <Button
                              variant="outline"
                              onClick={handleApplyDiscount}
                              disabled={!discountCodeInput.trim() || isValidatingDiscount}
                              className="px-4"
                            >
                              {isValidatingDiscount ? 'Checking...' : 'Apply'}
                            </Button>
                          </div>
                          {discountError && (
                            <p className="text-sm text-red-600">{discountError}</p>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between text-sm">
                      <span>Shipping</span>
                      <span className="text-green-600">Free</span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span>Tax</span>
                      <span>EGP 0.00</span>
                    </div>

                    {/* Discount Amount Display */}
                    {appliedDiscount && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Discount ({appliedDiscount.discountPercentage}% off)</span>
                        <span>-EGP {getDiscountAmount().toFixed(2)}</span>
                      </div>
                    )}

                    <hr className="my-4" />

                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span className="text-green-600 text-2xl">
                        EGP {appliedDiscount ? getDiscountedTotal().toFixed(2) : getCartTotal().toFixed(2)}
                      </span>
                    </div>

                    {/* Original Price Display (when discount is applied) */}
                    {appliedDiscount && (
                      <div className="text-center text-sm text-muted-foreground">
                        <span className="line-through">EGP {getCartTotal().toFixed(2)}</span>
                        <span className="ml-2 text-green-600 font-semibold">
                          You save ${getDiscountAmount().toFixed(2)}!
                        </span>
                      </div>
                    )}

                    <Button
                      className="w-full btn-gold text-lg py-6"
                      onClick={handleCheckout}
                    >
                      Proceed to Checkout
                    </Button>

                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={onBackToHome}
                    >
                      Continue Shopping
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
