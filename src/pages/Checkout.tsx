import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DiscountBanner } from '@/components/DiscountBanner';
import { CartItem } from '@/data/orders';
import { CheckCircle, ArrowLeft, Percent, X, Check } from 'lucide-react';
import { egyptianGovernorates } from '@/data/egyptianGovernorates';
import { sendWhatsAppMessage, generateOrderId, OrderData } from '@/services/whatsappService';
import { addOrder, OrderItem } from '@/services/orderService';
import { useCart } from '@/hooks/useCart';
import { useDiscountCodes } from '@/hooks/useDiscountCodes';
import { useDeliveryAreas } from '@/hooks/useDeliveryAreas';

interface Governorate {
  id: string;
  name: string;
  centers?: string[];
  districts?: { id: string; name: string }[];
}

interface CheckoutProps {
  cart: CartItem[];
  onBackToHome: () => void;
  onOrderSuccess: () => void;
}
// نهاية الملف

export const Checkout = ({ cart, onBackToHome, onOrderSuccess }: CheckoutProps) => {
  const {
    appliedDiscount,
    discountError,
    isValidatingDiscount,
    getCartTotal,
    getDiscountedTotal,
    getDiscountAmount,
    updateQuantity,
    removeFromCart,
    applyDiscountCode,
    removeDiscountCode,
    clearCart
  } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [countdownInterval, setCountdownInterval] = useState<NodeJS.Timeout | null>(null);
  const { discountCodes } = useDiscountCodes();
  const featuredCode = discountCodes.find(dc => dc.isActive);
  
  // Ref to programmatically focus the discount code input when navigated from banner
  const discountInputRef = useRef<HTMLInputElement | null>(null);

  // Cleanup countdown interval on unmount
  useEffect(() => {
    return () => {
      if (countdownInterval) {
        clearInterval(countdownInterval);
      }
    };
  }, [countdownInterval]);

  // On mount, check navigation hints and focus the discount input
  useEffect(() => {
    let shouldFocus = false;
    // 1) Flag set by DiscountBanner when switching pages without URL
    try {
      if (localStorage.getItem('scrollToDiscount') === '1') {
        shouldFocus = true;
        localStorage.removeItem('scrollToDiscount');
      }
    } catch {}
    // 2) Deep-link via URL hash or query
    if (!shouldFocus) {
      const hash = typeof window !== 'undefined' ? window.location.hash : '';
      const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams();
      shouldFocus = hash === '#discount-code' || params.get('focus') === 'discount-code';
    }
    if (shouldFocus) {
      setTimeout(() => {
        discountInputRef.current?.focus();
        discountInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 120);
    }
  }, []);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedGovernorate, setSelectedGovernorate] = useState<Governorate | null>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    primaryPhone: '',
    secondaryPhone: '',
    governorate: '',
    detailedAddress: ''
  });
  const [discountCodeInput, setDiscountCodeInput] = useState('');
  
  const { areas } = useDeliveryAreas();
  const [selectedAreaId, setSelectedAreaId] = useState<string>('');
  const [shippingCost, setShippingCost] = useState(0);
  // We no longer use areas' price for total — shipping is computed by our rules below
  const selectedArea = areas.find(a => a.id === selectedAreaId) || null;
  const shippingPrice = shippingCost;

  const subtotal = getCartTotal();
  const discountAmount = getDiscountAmount();
  const discountedSubtotal = appliedDiscount ? getDiscountedTotal() : subtotal;
  const total = discountedSubtotal + shippingCost;
  const itemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleGovernorateChange = (val: string) => {
    setSelectedAreaId(val);
    const governorate = egyptianGovernorates.find(g => g.id === val);
    setFormData(prev => ({ ...prev, governorate: governorate ? governorate.name : '' }));

    // Update shipping cost based on selected governorate
    const cost = governorate ? calculateShippingCost(governorate.name) : 0;
    setShippingCost(cost); // Update shipping cost state
  };

  const calculateShippingCost = (governorateName: string): number => {
    const shippingRates: Record<string, number> = {
      "القاهرة": 66,
      "الجيزة": 66,
      "الإسكندرية": 72,
      "الدقهلية": 83,
      "الغربية": 83,
      "كفر الشيخ": 83,
      "المنوفية": 83,
      "الشرقية": 83,
      "دمياط": 83,
      "بورسعيد": 83,
      "الإسماعيلية": 83,
      "السويس": 83,
      "بني سويف": 99,
      "الفيوم": 99,
      "المنيا": 99,
      "أسيوط": 99,
      "سوهاج": 99,
      "قنا": 99,
      "الأقصر": 99,
      "أسوان": 99,
      "البحر الأحمر": 99,
      "الوادي الجديد": 132,
      "جنوب سيناء": 132,
      "مطروح": 132,
      "شرم الشيخ": 132
    };
    return shippingRates[governorateName] || 0;
  };

  const calculateTotal = (): number => {
    const orderTotal = getCartTotal();
    return orderTotal + shippingCost;
  };

  const handleImmediateReturn = () => {
    if (countdownInterval) {
      clearInterval(countdownInterval);
      setCountdownInterval(null);
    }
    onBackToHome();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fullName || !formData.primaryPhone || !formData.governorate ||
        !formData.detailedAddress) {
      alert('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    setIsSubmitting(true);

    try {
      // Generate unique order ID
      const orderId = await generateOrderId();
      
      // Prepare order data
      const orderData: OrderData = {
        orderId,
        customerName: formData.fullName,
        primaryPhone: formData.primaryPhone,
        secondaryPhone: formData.secondaryPhone || '',
        governorate: formData.governorate,
        district: '',
        detailedAddress: formData.detailedAddress,
        items: cart.map(item => ({
          id: item.id,
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
          color: item.color
        })),
        total,
        subtotal,
        discountCode: appliedDiscount?.code,
        discountAmount: discountAmount,
        shippingCost: shippingCost
      };
      
      // Send WhatsApp message
      await sendWhatsAppMessage(orderData);
      
      // Add order to database
      const orderItems: OrderItem[] = cart.map(item => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
        color: item.color
      }));
      
      await addOrder({
        customerName: formData.fullName,
        primaryPhone: formData.primaryPhone,
        secondaryPhone: formData.secondaryPhone,
        governorate: formData.governorate,
        district: '',
        detailedAddress: formData.detailedAddress,
        items: orderItems,
        total: total,
        subtotal: subtotal,
        discountCode: appliedDiscount?.code,
        discountAmount: discountAmount,
        isConfirmed: false,
        orderDate: new Date()
      });
      
      setShowSuccess(true);
      
      // إفراغ السلة وإزالة كود الخصم بعد إتمام الطلب بنجاح
      clearCart();
      removeDiscountCode();
      
      // بدء العداد التنازلي
      setCountdown(3);
      const interval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            onBackToHome(); // العودة للصفحة الرئيسية
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      setCountdownInterval(interval);
    } catch (error) {
      console.error('Error submitting order:', error);
      alert('حدث خطأ أثناء إرسال طلبك. يرجى المحاولة مرة أخرى.');
      setIsSubmitting(false);
    }
  };

  return (
    <div dir="rtl" className="min-h-screen bg-secondary/30 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 mb-4 sm:mb-6">
          <Button
            variant="ghost"
            onClick={onBackToHome}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            العودة للتسوق
          </Button>
          <div className="text-right">
            <h1 className="text-3xl font-bold">إتمام الشراء</h1>
            <p className="text-muted-foreground">أكمل طلبك</p>
          </div>
        </div>

        {/* Checkout discount banner (always visible if there is an active code) */}
        <div className="mb-4 sm:mb-6">
          <DiscountBanner />
        </div>

        {/* Layout: على الموبايل يظهر ملخص الطلب أولاً ثم الشحن */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-10">
            {/* Shipping Information */}
            <Card className="shadow-soft order-2 lg:order-1">
              <CardHeader>
                <CardTitle className="text-right">معلومات الشحن</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="fullName" className="text-right block mb-2">الاسم الكامل</Label>
                      <Input
                        id="fullName"
                        name="fullName"
                        placeholder="أدخل اسمك الكامل"
                        value={formData.fullName}
                        onChange={handleChange}
                        className="w-full text-right"
                        dir="rtl"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="primaryPhone" className="text-right block mb-2">رقم الهاتف الأساسي</Label>
                      <Input
                        id="primaryPhone"
                        name="primaryPhone"
                        placeholder="أدخل رقم هاتفك"
                        value={formData.primaryPhone}
                        onChange={handleChange}
                        className="w-full text-right"
                        dir="rtl"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="secondaryPhone" className="text-right block mb-2">رقم هاتف إضافي (اختياري)</Label>
                      <Input
                        id="secondaryPhone"
                        name="secondaryPhone"
                        placeholder="أدخل رقم هاتف إضافي (اختياري)"
                        value={formData.secondaryPhone}
                        onChange={handleChange}
                        className="w-full text-right"
                        dir="rtl"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="governorate" className="text-right block mb-2">المحافظة</Label>
                      <Select
                        value={selectedAreaId}
                        onValueChange={(val) => {
                          // Keep internal selection
                          setSelectedAreaId(val);
                          // Map to governorate name
                          const gov = egyptianGovernorates.find(g => g.id === val);
                          setFormData(prev => ({ ...prev, governorate: gov ? gov.name : '' }));
                          // Update shipping cost per rules
                          const cost = gov ? calculateShippingCost(gov.name) : 0;
                          setShippingCost(cost);
                        }}
                      >
                        <SelectTrigger className="w-full text-right" dir="rtl">
                          <SelectValue placeholder="اختر المحافظة" />
                        </SelectTrigger>
                        <SelectContent>
                          {egyptianGovernorates.map((governorate) => (
                            <SelectItem key={governorate.id} value={governorate.id} className="text-right">
                              {governorate.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    

                    <div>
                      <Label htmlFor="detailedAddress" className="text-right block mb-2">العنوان بالتفصيل</Label>
                      <Textarea
                        id="detailedAddress"
                        name="detailedAddress"
                        placeholder="أدخل عنوانك بالتفصيل"
                        value={formData.detailedAddress}
                        onChange={handleChange}
                        className="w-full text-right"
                        dir="rtl"
                        required
                      />
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'جاري إرسال الطلب...' : 'إرسال الطلب'}
                  </Button>
                </form>
                
                {showSuccess && (
                  <div className="mt-6 p-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <CheckCircle className="text-green-500 h-6 w-6" />
                      <h3 className="text-lg font-semibold text-green-800">تم إرسال طلبك بنجاح! 🎉</h3>
                    </div>
                    <div className="text-green-700 space-y-2">
                      <p>✅ تم حفظ طلبك في النظام</p>
                      <p>📱 تم إرسال تفاصيل الطلب عبر الواتساب</p>
                      <p>🛒 تم إفراغ السلة تلقائياً</p>
                      <p>📞 سنتواصل معك قريباً لتأكيد الطلب وترتيب التوصيل</p>
                      <p className="font-medium mt-3">شكراً لك على ثقتك في SALMA BAG! 💝</p>
                      <p className="text-sm text-green-600 mt-3 animate-pulse">
                        🔄 سيتم توجيهك للصفحة الرئيسية خلال {countdown} ثانية...
                      </p>
                      <div className="mt-4 pt-3 border-t border-green-200">
                        <Button 
                          onClick={handleImmediateReturn}
                          className="w-full bg-green-600 hover:bg-green-700"
                        >
                          العودة للصفحة الرئيسية الآن
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Order Summary */}
            <Card className="shadow-soft lg:sticky lg:top-8 h-fit order-1 lg:order-2">
              <CardHeader>
                <CardTitle className="text-right">ملخص الطلب</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cart.map((item) => (
                  <div key={item.id} className="flex flex-row-reverse gap-4 pb-4 border-b border-border last:border-b-0 items-center">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-md"
                    />
                    <div className="flex-1 min-w-0 text-right">
                      <h4 className="font-medium truncate">{item.name}</h4>
                      <p className="text-sm text-muted-foreground">{item.color}</p>
                      <div className="flex flex-row-reverse justify-between items-center mt-1 gap-2">
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline" onClick={() => updateQuantity(item.productId, item.color, item.quantity + 1)}>+</Button>
                          <span className="text-sm">{item.quantity}</span>
                          <Button size="sm" variant="outline" onClick={() => updateQuantity(item.productId, item.color, item.quantity - 1)}>-</Button>
                        </div>
                        <span className="text-sm font-semibold">جنيه {item.price * item.quantity}</span>
                      </div>
                    </div>
                  </div>
                ))}
                
                <div className="pt-4 border-t border-border">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold">المجموع الفرعي:</span>
                    <span>جنيه {subtotal}</span>
                  </div>
                  
                  {/* Discount Code Section */}
                  <div className="space-y-3 py-2">
                    <div className="flex items-center gap-2 text-sm font-medium justify-end">
                      <span>كود الخصم</span>
                      <Percent className="h-4 w-4" />
                    </div>

                    {appliedDiscount ? (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-600" />
                            <span className="font-mono font-bold text-green-700">
                              {appliedDiscount.code}
                            </span>
                            <span className="text-sm text-green-600">
                              ({appliedDiscount.discountPercentage}% خصم)
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeDiscountCode()}
                            className="h-6 w-6 p-0 text-green-600 hover:text-green-700"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <Input
                            id="discount-code-input"
                            placeholder="أدخل كود الخصم"
                            value={discountCodeInput}
                            onChange={(e) => setDiscountCodeInput(e.target.value.toUpperCase())}
                            className="flex-1 text-right"
                            dir="rtl"
                            disabled={isValidatingDiscount}
                            ref={discountInputRef}
                          />
                          <Button
                            variant="outline"
                            onClick={async () => {
                              if (discountCodeInput.trim()) {
                                const ok = await applyDiscountCode(discountCodeInput.trim());
                                if (ok) setDiscountCodeInput('');
                              }
                            }}
                            disabled={!discountCodeInput.trim() || isValidatingDiscount}
                            className="px-4"
                          >
                            {isValidatingDiscount ? 'جارٍ التحقق...' : 'تطبيق'}
                          </Button>
                        </div>
                        {/* Helper hint showing potential saving */}
                        {discountCodeInput.trim() && !appliedDiscount && !discountError && (
                          <p className="text-xs text-muted-foreground text-right">
                            لو الكود صحيح، هتاخد خصم حسب نسبة الكود. جرّب تطبيقه لمعرفة المبلغ المخصوم.
                          </p>
                        )}
                        {discountError && (
                          <p className="text-sm text-red-600 text-right">{discountError}</p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Discount amount row */}
                  {appliedDiscount && (
                    <div className="flex justify-between items-center mb-2 text-green-600">
                      <span className="font-semibold flex items-center gap-1">
                        <Percent className="h-4 w-4" />
                        الخصم:
                      </span>
                      <span>جنيه {discountAmount}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center text-lg font-bold mt-2">
                    <span>الإجمالي:</span>
                    <span className="text-green-600 text-2xl">جنيه {total}</span>
                  </div>

                  <div className="text-xs sm:text-sm text-muted-foreground mt-2 text-right">
                    {itemsCount} منتج
                  </div>

                </div>
              </CardContent>
            </Card>

            {/* New Card: تفاصيل الطلب */}
            <Card className="bg-pink-100 p-4 rounded-lg shadow-md">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-center">الإجمالي:</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-2xl font-bold text-pink-600">EG {subtotal.toFixed(2)}</p>
                  <p className="text-md font-medium text-gray-700">+ سعر التوصيل: EG {shippingPrice.toFixed(2)}</p>
                  <p className="text-lg font-bold text-pink-700 mt-2">= الإجمالي الكلي: EG {total.toFixed(2)}</p>
                </div>
              </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}