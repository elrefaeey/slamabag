import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Product } from '@/data/products';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Percent, Clock } from 'lucide-react';

export interface Offer {
  id: string;
  productId: string;
  productName: string;
  discount: number;
  endTime: Date;
  isActive: boolean;
}

interface OfferFormProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onSave: (offer: Omit<Offer, 'id'>) => void;
}

export const OfferForm = ({ isOpen, onClose, products, onSave }: OfferFormProps) => {
  const [formData, setFormData] = useState({
    productId: '',
    discount: '',
    hours: '',
    minutes: '',
    seconds: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    if (!isOpen) {
      setFormData({ productId: '', discount: '', hours: '', minutes: '', seconds: '' });
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.productId || !formData.discount) {
      toast({ title: 'خطأ في التحقق', description: 'اختر منتجًا وحدد نسبة الخصم', variant: 'destructive' });
      return;
    }

    const discount = parseFloat(formData.discount);
    if (discount <= 0 || discount > 100) {
      toast({ title: 'خطأ في التحقق', description: 'النسبة بين 1 و 100', variant: 'destructive' });
      return;
    }

    const hours = parseInt(formData.hours) || 0;
    const minutes = parseInt(formData.minutes) || 0;
    const seconds = parseInt(formData.seconds) || 0;
    if (hours === 0 && minutes === 0 && seconds === 0) {
      toast({ title: 'خطأ في التحقق', description: 'اضبط مؤقت العدّ التنازلي', variant: 'destructive' });
      return;
    }

    const selectedProduct = products.find((p) => p.id === formData.productId);
    if (!selectedProduct) {
      toast({ title: 'خطأ', description: 'المنتج غير موجود', variant: 'destructive' });
      return;
    }

    const totalMs = (hours * 3600 + minutes * 60 + seconds) * 1000;
    const endTime = new Date(Date.now() + totalMs);

    const offerData = {
      productId: formData.productId,
      productName: selectedProduct.name,
      discount,
      endTime,
      isActive: true,
    };

    onSave(offerData);
    onClose();

    toast({ title: 'نجاح', description: 'تم إنشاء العرض بنجاح' });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent dir="rtl" className="sm:max-w-2xl rounded-2xl shadow-soft animate-fade-in max-h-[90vh] overflow-hidden flex flex-col" aria-describedby="offer-dialog-description">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-2xl font-bold">إنشاء عرض جديد</DialogTitle>
          <DialogDescription id="offer-dialog-description">
            اختر منتجًا، حدد نسبة الخصم، واضبط مؤقت العدّ التنازلي لعرض محدود المدة.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-1">
          <form onSubmit={handleSubmit} className="space-y-6 pb-4">
          {/* Product Section */}
          <section className="card-admin p-4 sm:p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium">المنتج</h3>
              <Badge variant="secondary" className="rounded-full">إلزامي</Badge>
            </div>
            <div className="space-y-2">
              <Label className="font-medium">اختر المنتج *</Label>
              <Select value={formData.productId} onValueChange={(value) => setFormData({ ...formData, productId: value })}>
                <SelectTrigger className="h-11 rounded-xl border-clean-neutral focus:ring-2 focus:ring-accent">
                  <SelectValue placeholder="اختر منتج" />
                </SelectTrigger>
                <SelectContent>
                  {products.filter((p) => p.inStock).map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name} — {product.price} جنيه
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">يظهر هنا فقط المنتجات المتوفرة بالمخزون</p>
            </div>
          </section>

          {/* Discount Section */}
          <section className="card-admin p-4 sm:p-6 animate-fade-in">
            <div className="flex items-center gap-2 mb-2">
              <Percent className="h-4 w-4" />
              <h3 className="text-sm font-medium">نسبة الخصم *</h3>
            </div>
            <div className="relative">
              <Input
                id="discount"
                type="number"
                min="1"
                max="100"
                value={formData.discount}
                onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                placeholder="25"
                required
                className="h-11 rounded-xl pr-12 border-clean-neutral focus:ring-2 focus:ring-accent transition"
              />
              <span className="absolute affix-end top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">اختر نسبة بين 1 و 100</p>
          </section>

          {/* Timer Section */}
          <section className="card-admin p-4 sm:p-6 animate-fade-in">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-4 w-4" />
              <h3 className="text-sm font-medium">مؤقت العدّ التنازلي *</h3>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="hours" className="text-xs text-muted-foreground">ساعات</Label>
                <Input
                  id="hours"
                  type="number"
                  min="0"
                  max="99"
                  value={formData.hours}
                  onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                  placeholder="0"
                  className="h-11 rounded-xl border-clean-neutral focus:ring-2 focus:ring-accent"
                />
              </div>
              <div>
                <Label htmlFor="minutes" className="text-xs text-muted-foreground">دقائق</Label>
                <Input
                  id="minutes"
                  type="number"
                  min="0"
                  max="59"
                  value={formData.minutes}
                  onChange={(e) => setFormData({ ...formData, minutes: e.target.value })}
                  placeholder="0"
                  className="h-11 rounded-xl border-clean-neutral focus:ring-2 focus:ring-accent"
                />
              </div>
              <div>
                <Label htmlFor="seconds" className="text-xs text-muted-foreground">ثواني</Label>
                <Input
                  id="seconds"
                  type="number"
                  min="0"
                  max="59"
                  value={formData.seconds}
                  onChange={(e) => setFormData({ ...formData, seconds: e.target.value })}
                  placeholder="0"
                  className="h-11 rounded-xl border-clean-neutral focus:ring-2 focus:ring-accent"
                />
              </div>
            </div>
          </section>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-end pt-2">
            <Button type="button" variant="ghost" onClick={onClose} className="btn-gradient-outline">
              إلغاء
            </Button>
            <Button
              type="submit"
              className="h-11 rounded-full bg-black text-white hover:bg-black/90 hover:ring-2 hover:ring-accent hover:shadow-accent transition"
            >
              إنشاء العرض
            </Button>
          </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
