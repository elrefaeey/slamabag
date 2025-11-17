import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useCategories } from '@/hooks/useCategories';
import { addCategory, updateCategory } from '@/services/categoryService';
import { Product } from '@/data/products';
import { Plus, Trash2, Edit } from 'lucide-react';

interface Color {
  name: string;
  image: string;
}

interface EnhancedProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product;
  onSave: (productData: Omit<Product, 'id'> & { id?: string }) => void;
}

export const EnhancedProductForm: React.FC<EnhancedProductFormProps> = ({
  isOpen,
  onClose,
  product,
  onSave
}) => {
  const { toast } = useToast();
  const { categories, loading: categoriesLoading } = useCategories();
  
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    originalPrice: '',
    category: '',
    description: '',
    inStock: true,
    featured: false
  });
  
  const [colors, setColors] = useState<Color[]>([{ name: '', image: '' }]);
  const [showNewCategoryDialog, setShowNewCategoryDialog] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        price: product.price.toString(),
        originalPrice: product.originalPrice ? product.originalPrice.toString() : '',
        category: product.category,
        description: product.description,
        inStock: product.inStock,
        featured: product.featured || false
      });
      setColors(product.colors.length > 0 ? product.colors : [{ name: '', image: '' }]);
    } else {
      setFormData({
        name: '',
        price: '',
        originalPrice: '',
        category: '',
        description: '',
        inStock: true,
        featured: false
      });
      setColors([{ name: '', image: '' }]);
    }
  }, [product, isOpen]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleColorChange = (index: number, field: 'name' | 'image', value: string) => {
    const newColors = [...colors];
    newColors[index][field] = value;
    setColors(newColors);
  };

  const addColor = () => {
    setColors([...colors, { name: '', image: '' }]);
  };

  const removeColor = (index: number) => {
    if (colors.length > 1) {
      setColors(colors.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price || !formData.category) {
      return;
    }

    const validColors = colors.filter(color => color.name && color.image);
    
    if (validColors.length === 0) {
      toast({
        title: "خطأ في التحقق",
        description: "يرجى إضافة لون واحد على الأقل مع صورة",
        variant: "destructive"
      });
      return;
    }

    const productData = {
      ...(product && { id: product.id }),
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      ...(formData.originalPrice && { originalPrice: parseFloat(formData.originalPrice) }),
      category: formData.category,
      images: validColors.map(color => color.image),
      colors: validColors,
      inStock: formData.inStock,
      featured: formData.featured
    };

    onSave(productData);
    onClose();
  };

  const handleNewCategory = async () => {
    if (!newCategoryName.trim()) {
      toast({
        title: "خطأ في التحقق",
        description: "يرجى إدخال اسم الفئة فقط",
        variant: "destructive"
      });
      return;
    }

    try {
      const categoryId = await addCategory({
        name: newCategoryName.trim(),
        description: '',
        image: ''
      });

      toast({
        title: "تم إضافة الفئة",
        description: `تم إضافة فئة "${newCategoryName}" بنجاح`,
      });

      setFormData(prev => ({ ...prev, category: categoryId }));
      setShowNewCategoryDialog(false);
      setNewCategoryName('');
    } catch (error) {
      toast({
        title: "خطأ في إضافة الفئة",
        description: "فشل في إضافة الفئة الجديدة",
        variant: "destructive"
      });
    }
  };

  const handleUpdateCategory = async () => {
    if (!editingCategoryId || !newCategoryName.trim()) {
      toast({
        title: "خطأ في التحقق",
        description: "يرجى إدخال اسم الفئة",
        variant: "destructive"
      });
      return;
    }

    try {
      await updateCategory(editingCategoryId, { name: newCategoryName.trim() });
      toast({ title: "تم التحديث", description: "تم تعديل اسم الفئة بنجاح" });
      setShowNewCategoryDialog(false);
      setEditingCategoryId(null);
      setNewCategoryName('');
    } catch (error) {
      toast({
        title: "خطأ في تعديل الفئة",
        description: "فشل في تعديل اسم الفئة",
        variant: "destructive"
      });
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent dir="rtl" className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-medium p-0">
          <div className="bg-secondary/60 border-b border-clean-neutral/60 rounded-t-2xl px-6 py-5">
            <DialogHeader className="p-0">
              <DialogTitle className="text-2xl font-bold">{product ? 'تعديل المنتج' : 'إضافة منتج جديد'}</DialogTitle>
              <DialogDescription className="mt-1">
                {product ? 'قم بتعديل بيانات المنتج أدناه' : 'أدخل بيانات المنتج الجديد' }
              </DialogDescription>
            </DialogHeader>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-6 space-y-8">
            {/* Grid: Basic info + Toggles */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2 shadow-soft">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">البيانات الأساسية</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="name" className="text-sm font-medium">اسم المنتج *</Label>
                    <Input id="name" value={formData.name} onChange={(e) => handleInputChange('name', e.target.value)} placeholder="أدخل اسم المنتج" required className="h-11 rounded-lg" />
                    <p className="text-xs text-muted-foreground">اسم واضح ومختصر يساعد في البحث</p>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="price" className="text-sm font-medium">السعر الحالي (جنيه مصري) *</Label>
                    <Input id="price" type="number" step="0.01" min="0" value={formData.price} onChange={(e) => handleInputChange('price', e.target.value)} placeholder="0.00" required className="h-11 rounded-lg" />
                    <p className="text-xs text-muted-foreground">السعر بعد الخصم (إن وجد)</p>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="originalPrice" className="text-sm font-medium">السعر الأصلي (اختياري)</Label>
                    <Input id="originalPrice" type="number" step="0.01" min="0" value={formData.originalPrice} onChange={(e) => handleInputChange('originalPrice', e.target.value)} placeholder="0.00" className="h-11 rounded-lg" />
                    <p className="text-xs text-muted-foreground">السعر قبل الخصم (اتركه فارغًا إذا لم يكن هناك خصم)</p>
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <Label className="text-sm font-medium">الفئة *</Label>
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                          <SelectTrigger className="h-11 rounded-lg">
                            <SelectValue placeholder="اختر الفئة" />
                          </SelectTrigger>
                          <SelectContent>
                            {categoriesLoading ? (
                              <SelectItem value="loading" disabled>جاري التحميل...</SelectItem>
                            ) : (
                              categories.map((category) => (
                                <SelectItem key={category.id} value={category.id}>
                                  <div className="flex items-center justify-between gap-3">
                                    <span>{category.name}</span>
                                    <Button
                                      type="button"
                                      size="icon"
                                      variant="ghost"
                                      className="h-7 w-7 rounded-full"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setEditingCategoryId(category.id);
                                        setNewCategoryName(category.name);
                                        setShowNewCategoryDialog(true);
                                      }}
                                      aria-label={`تعديل ${category.name}`}
                                    >
                                      <Edit className="h-3.5 w-3.5" />
                                    </Button>
                                  </div>
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button type="button" variant="outline" size="sm" onClick={() => setShowNewCategoryDialog(true)} className="rounded-full whitespace-nowrap">
                        <Plus className="h-4 w-4 ml-1" /> إضافة فئة
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">يمكنك إنشاء فئة جديدة إن لم تكن موجودة</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-soft">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">الإعدادات</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="inStock" className="text-sm font-medium">متوفر في المخزون</Label>
                    <Switch id="inStock" checked={formData.inStock} onCheckedChange={(checked) => handleInputChange('inStock', checked)} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="featured" className="text-sm font-medium">منتج مميز</Label>
                    <Switch id="featured" checked={formData.featured} onCheckedChange={(checked) => handleInputChange('featured', checked)} />
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Colors */}
            <section>
              <Card className="shadow-soft">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">الألوان والصور</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {colors.map((color, index) => (
                    <div key={index} className="p-4 border rounded-xl bg-white/60 hover:shadow-soft transition-[box-shadow,transform] duration-300 ease-out">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">اللون {index + 1}</h4>
                        {colors.length > 1 && (
                          <Button type="button" variant="outline" size="sm" onClick={() => removeColor(index)} className="rounded-full">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label className="text-sm">اسم اللون</Label>
                          <Input value={color.name} onChange={(e) => handleColorChange(index, 'name', e.target.value)} placeholder="مثال: أسود، أبيض، بني" className="h-11 rounded-lg" />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-sm">رابط صورة اللون</Label>
                          <Input value={color.image} onChange={(e) => handleColorChange(index, 'image', e.target.value)} placeholder="https://example.com/image.jpg" className="h-11 rounded-lg" />
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button type="button" variant="outline" onClick={addColor} className="w-full rounded-xl border-clean-neutral hover:shadow-soft transition-all duration-300">
                    <Plus className="h-4 w-4 ml-2" /> إضافة لون آخر
                  </Button>
                </CardContent>
              </Card>
            </section>

            {/* Description */}
            <section>
              <Card className="shadow-soft">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">الوصف</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1.5">
                  <Label htmlFor="description" className="text-sm font-medium">الوصف (اختياري)</Label>
                  <Textarea id="description" value={formData.description} onChange={(e) => handleInputChange('description', e.target.value)} placeholder="يمكن تركه فارغًا" rows={4} className="rounded-lg" />
                  <p className="text-xs text-muted-foreground">صف مزايا المنتج والخامات والحجم إن لزم</p>
                </CardContent>
              </Card>
            </section>

            {/* Submit Buttons */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={onClose} className="h-11 rounded-full sm:min-w-[120px]">إلغاء</Button>
              <Button type="submit" className="h-11 rounded-full bg-black text-white hover:bg-black/90 sm:min-w-[140px]">
                {product ? 'تحديث المنتج' : 'إضافة المنتج'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* New/Edit Category Dialog */}
      <Dialog
        open={showNewCategoryDialog}
        onOpenChange={(open) => {
          setShowNewCategoryDialog(open);
          if (!open) {
            setEditingCategoryId(null);
            setNewCategoryName('');
          }
        }}
      >
        <DialogContent dir="rtl" aria-describedby="category-dialog-description">
          <DialogHeader>
            <DialogTitle>{editingCategoryId ? 'تعديل اسم الفئة' : 'إضافة فئة جديدة'}</DialogTitle>
            <DialogDescription id="category-dialog-description">
              {editingCategoryId ? 'قم بتعديل اسم الفئة فقط' : 'أدخل اسم الفئة الجديدة'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="categoryName">اسم الفئة</Label>
              <Input
                id="categoryName"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="مثال: حقائب يد"
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowNewCategoryDialog(false);
                  setEditingCategoryId(null);
                }}
              >
                إلغاء
              </Button>
              {editingCategoryId ? (
                <Button onClick={handleUpdateCategory}>تحديث الاسم</Button>
              ) : (
                <Button onClick={handleNewCategory}>إضافة الفئة</Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
