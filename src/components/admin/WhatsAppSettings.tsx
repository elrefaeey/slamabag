import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { MessageCircle, Phone, Save, TestTube } from 'lucide-react';
import { formatOrderMessage, OrderData } from '@/services/whatsappService';

export const WhatsAppSettings: React.FC = () => {
  const { toast } = useToast();
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Load saved WhatsApp number on component mount
  useEffect(() => {
    const savedNumber = localStorage.getItem('whatsappNumber') || '201068798221';
    setWhatsappNumber(savedNumber);
  }, []);

  const handleSave = async () => {
    if (!whatsappNumber.trim()) {
      toast({
        title: 'خطأ في التحقق',
        description: 'يرجى إدخال رقم الواتساب',
        variant: 'destructive'
      });
      return;
    }

    // Validate phone number format (should be numbers only)
    const cleanNumber = whatsappNumber.replace(/\D/g, '');
    if (cleanNumber.length < 10) {
      toast({
        title: 'خطأ في التحقق',
        description: 'يرجى إدخال رقم هاتف صحيح',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    try {
      localStorage.setItem('whatsappNumber', cleanNumber);
      toast({
        title: 'تم الحفظ',
        description: 'تم حفظ رقم الواتساب بنجاح'
      });
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'فشل في حفظ الإعدادات',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestMessage = () => {
    // Create a test order data
    const testOrderData: OrderData = {
      orderId: '001',
      customerName: 'أحمد محمد',
      primaryPhone: '01234567890',
      secondaryPhone: '01098765432',
      governorate: 'القاهرة',
      district: 'مدينة نصر',
      detailedAddress: 'شارع مصطفى النحاس، مدينة نصر، القاهرة',
      items: [
        {
          id: 'test-1',
          productId: 'bag-1',
          name: 'حقيبة يد أنيقة',
          price: 250,
          quantity: 1,
          image: '/placeholder.jpg',
          color: 'أسود'
        },
        {
          id: 'test-2',
          productId: 'bag-2',
          name: 'حقيبة ظهر رياضية',
          price: 180,
          quantity: 2,
          image: '/placeholder.jpg',
          color: 'أزرق'
        }
      ],
      total: 570,
      subtotal: 610,
      discountCode: 'WELCOME10',
      discountAmount: 40
    };

    const message = formatOrderMessage(testOrderData);
    const encodedMessage = encodeURIComponent(message);
    const cleanNumber = whatsappNumber.replace(/\D/g, '');
    const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
    
    toast({
      title: 'تم إرسال رسالة تجريبية',
      description: 'تم فتح الواتساب مع رسالة تجريبية'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">إعدادات الواتساب</h2>
      </div>

      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-green-600" />
            إعدادات رقم الواتساب
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="whatsapp-number" className="font-medium">
              رقم الواتساب لاستقبال الطلبات
            </Label>
            <div className="flex gap-3">
              <div className="flex-1">
                <Input
                  id="whatsapp-number"
                  type="tel"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  placeholder="201068798221"
                  className="text-left"
                  dir="ltr"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  أدخل الرقم بالكود الدولي (مثال: 201068798221)
                </p>
              </div>
              <Button
                onClick={handleSave}
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700 text-white px-6"
              >
                <Save className="h-4 w-4 mr-2" />
                حفظ
              </Button>
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium mb-1">اختبار الرسالة</h3>
                <p className="text-sm text-muted-foreground">
                  أرسل رسالة تجريبية لاختبار الإعدادات
                </p>
              </div>
              <Button
                onClick={handleTestMessage}
                variant="outline"
                className="border-green-200 text-green-700 hover:bg-green-50"
              >
                <TestTube className="h-4 w-4 mr-2" />
                إرسال رسالة تجريبية
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>معلومات مهمة</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 mb-2">كيفية عمل النظام:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• عند إتمام العميل للطلب، سيتم إرسال رسالة واتساب تلقائياً</li>
              <li>• الرسالة تحتوي على جميع تفاصيل الطلب والعميل</li>
              <li>• يتم حفظ الطلب في قاعدة البيانات لمتابعته من لوحة الإدارة</li>
            </ul>
          </div>
          
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h4 className="font-medium text-amber-800 mb-2">نصائح مهمة:</h4>
            <ul className="text-sm text-amber-700 space-y-1">
              <li>• تأكد من أن رقم الواتساب صحيح ومفعل</li>
              <li>• استخدم الكود الدولي للرقم (مثل 20 لمصر)</li>
              <li>• اختبر الرسالة قبل تفعيل النظام</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};