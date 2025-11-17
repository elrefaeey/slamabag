import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useBannerText } from '@/hooks/useBannerText';
import {
  addBannerText,
  updateBannerText,
  CreateBannerText,
} from '@/services/bannerTextService';

export const BannerTextManagement = () => {
  const { bannerText, loading } = useBannerText();
  const { toast } = useToast();
  const [formData, setFormData] = useState<CreateBannerText>({
    text: '',
    isActive: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update form when banner text loads
  useEffect(() => {
    if (bannerText) {
      setFormData({
        text: bannerText.text,
        isActive: bannerText.isActive,
      });
    }
  }, [bannerText]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (bannerText) {
        // Update existing banner text
        await updateBannerText(bannerText.id, formData);
        toast({
          title: 'تم التحديث بنجاح',
          description: 'تم تحديث الجملة بنجاح',
        });
      } else {
        // Create new banner text
        await addBannerText(formData);
        toast({
          title: 'تم الإضافة بنجاح',
          description: 'تم إضافة الجملة بنجاح',
        });
      }
    } catch (error) {
      console.error('Error saving banner text:', error);
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء حفظ الجملة',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">جاري التحميل...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">إدارة الجملة الإعلانية</h2>
        <p className="text-sm text-muted-foreground mt-1">
          الجملة تظهر في الصفحة الرئيسية تحت صور الغلاف وفوق Best Sellers
        </p>
      </div>

      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            {bannerText ? 'تعديل الجملة' : 'إضافة جملة جديدة'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Text Input */}
            <div className="space-y-2">
              <Label htmlFor="text">
                النص <span className="text-red-500">*</span>
              </Label>
              <Input
                id="text"
                type="text"
                placeholder="مثال: مساء الخير الاوردرات فيها ضغط بس الفتره الحاليه"
                value={formData.text}
                onChange={(e) =>
                  setFormData({ ...formData, text: e.target.value })
                }
                required
                className="text-sm"
              />
              <p className="text-xs text-muted-foreground">
                اكتب الجملة التي تريد عرضها للزوار
              </p>
            </div>

            {/* Preview */}
            {formData.text && (
              <div className="space-y-2">
                <Label>معاينة</Label>
                <div className="p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
                  <p className="text-center text-sm sm:text-base text-gray-800 font-medium">
                    {formData.text}
                  </p>
                </div>
              </div>
            )}

            {/* Active Status */}
            <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
              <div className="space-y-0.5">
                <Label htmlFor="isActive" className="font-medium">
                  حالة التفعيل
                </Label>
                <p className="text-xs text-muted-foreground">
                  عند إلغاء التفعيل لن تظهر الجملة في الصفحة الرئيسية
                </p>
              </div>
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isActive: checked })
                }
              />
            </div>

            {/* Current Status */}
            {bannerText && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-900">
                      الحالة الحالية
                    </p>
                    <p className="text-xs text-blue-700 mt-1">
                      {bannerText.isActive
                        ? '✓ الجملة نشطة وتظهر في الموقع'
                        : '✗ الجملة غير نشطة ولا تظهر في الموقع'}
                    </p>
                  </div>
                  <div className="text-xs text-blue-600">
                    آخر تحديث: {new Date(bannerText.updatedAt).toLocaleString('ar-EG')}
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting || !formData.text}
              className="w-full bg-black text-white hover:bg-black/90"
              size="lg"
            >
              {isSubmitting
                ? 'جاري الحفظ...'
                : bannerText
                ? 'تحديث الجملة'
                : 'إضافة الجملة'}
            </Button>
          </form>
        </CardContent>
      </Card>

    </div>
  );
};

