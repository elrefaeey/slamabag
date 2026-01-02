import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { X, Percent, Hash } from 'lucide-react';
import { DiscountCode, CreateDiscountCode } from '@/services/discountService';

interface DiscountCodeFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (discountCodeData: CreateDiscountCode | (DiscountCode & { id: string })) => Promise<void>;
  discountCode?: DiscountCode;
}

export const DiscountCodeForm = ({ 
  isOpen, 
  onClose, 
  onSave, 
  discountCode 
}: DiscountCodeFormProps) => {
  const [formData, setFormData] = useState({
    code: '',
    discountPercentage: 10,
    isActive: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens/closes or when editing different discount code
  useEffect(() => {
    if (isOpen) {
      if (discountCode) {
        // Editing existing discount code
        setFormData({
          code: discountCode.code,
          discountPercentage: discountCode.discountPercentage,
          isActive: discountCode.isActive
        });
      } else {
        // Creating new discount code
        setFormData({
          code: '',
          discountPercentage: 10,
          isActive: true
        });
      }
    }
  }, [isOpen, discountCode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      isActive: checked
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.code.trim()) {
      alert('Please enter a discount code');
      return;
    }

    if (formData.discountPercentage <= 0 || formData.discountPercentage > 100) {
      alert('Discount percentage must be between 1 and 100');
      return;
    }

    setIsSubmitting(true);

    try {
      const discountCodeData: CreateDiscountCode = {
        code: formData.code.toUpperCase().trim(),
        discountPercentage: formData.discountPercentage,
        isActive: formData.isActive
      };

      if (discountCode) {
        // Update existing discount code
        await onSave({ ...discountCodeData, id: discountCode.id } as DiscountCode & { id: string });
      } else {
        // Create new discount code
        await onSave(discountCodeData);
      }

      onClose();
    } catch (error) {
      console.error('Error saving discount code:', error);
      alert('Failed to save discount code. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent dir="rtl" className="sm:max-w-xl rounded-2xl shadow-medium p-0 max-h-[90vh] overflow-hidden flex flex-col" aria-describedby="discount-dialog-description">
        <div className="bg-secondary/60 border-b border-clean-neutral/60 rounded-t-2xl px-6 py-5 flex-shrink-0">
          <DialogHeader className="p-0">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-2xl font-bold">{discountCode ? 'تعديل كود خصم' : 'إنشاء كود خصم جديد'}</DialogTitle>
              <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0 rounded-full" aria-label="إغلاق">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <DialogDescription id="discount-dialog-description" className="mt-1">
              {discountCode ? 'قم بتحديث بيانات كود الخصم أدناه.' : 'أنشئ كود خصم جديد ليستخدمه العملاء عند الدفع.'}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="flex-1 overflow-y-auto px-1">
          <form onSubmit={handleSubmit} className="px-5 py-6 space-y-8">
          <Card className="shadow-soft">
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6">
              {/* Discount Code */}
              <div className="space-y-1.5">
                <Label htmlFor="code" className="font-medium"><Hash className="h-4 w-4 inline ml-2" />كود الخصم *</Label>
                <Input id="code" name="code" type="text" value={formData.code} onChange={handleChange} required className="h-11 rounded-lg" placeholder="SPRINGSALE" style={{ textTransform: 'uppercase' }} />
                <p className="text-xs text-muted-foreground">أدخل كودًا فريدًا (مثل SPRINGSALE أو WELCOME10)</p>
              </div>

              {/* Discount Percentage */}
              <div className="space-y-1.5">
                <Label htmlFor="discountPercentage" className="font-medium"><Percent className="h-4 w-4 inline ml-2" />نسبة الخصم *</Label>
                <div className="relative">
                  <Input id="discountPercentage" name="discountPercentage" type="number" min="1" max="100" value={formData.discountPercentage} onChange={handleChange} required className="h-11 rounded-lg pr-12" placeholder="10" />
                  <span className="absolute affix-end top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                </div>
                <p className="text-xs text-muted-foreground">نسبة ما بين 1 و100</p>
              </div>

              {/* Active Status */}
              <div className="md:col-span-2 flex items-center justify-between pt-2">
                <div>
                  <Label htmlFor="isActive" className="font-medium">الحالة</Label>
                  <p className="text-xs text-muted-foreground">الأكواد المفعّلة فقط قابلة للاستخدام</p>
                </div>
                <Switch id="isActive" checked={formData.isActive} onCheckedChange={handleSwitchChange} />
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex flex-col sm:flex-row gap-3 justify-end pb-4">
            <Button type="button" variant="ghost" onClick={onClose} className="btn-gradient-outline" disabled={isSubmitting}>إلغاء</Button>
            <Button type="submit" className="h-11 rounded-full bg-black text-white hover:bg-black/90 hover:ring-2 hover:ring-accent hover:shadow-accent transition" disabled={isSubmitting}>
              {isSubmitting ? 'جارٍ الحفظ...' : discountCode ? 'تحديث الكود' : 'إنشاء الكود'}
            </Button>
          </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
