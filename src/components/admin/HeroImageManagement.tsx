import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Plus, Edit, Trash2, Image as ImageIcon, MoveUp, MoveDown, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useHeroImages } from '@/hooks/useHeroImages';
import {
  addHeroImage,
  updateHeroImage,
  deleteHeroImage,
  HeroImage,
  CreateHeroImage,
} from '@/services/heroImageService';

export const HeroImageManagement = () => {
  const { heroImages, loading } = useHeroImages();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editingImage, setEditingImage] = useState<HeroImage | null>(null);
  const [formData, setFormData] = useState<CreateHeroImage>({
    imageUrl: '',
    order: 0,
    isActive: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenForm = (image?: HeroImage) => {
    if (image) {
      setEditingImage(image);
      setFormData({
        imageUrl: image.imageUrl,
        order: image.order,
        isActive: image.isActive,
      });
    } else {
      setEditingImage(null);
      setFormData({
        imageUrl: '',
        order: heroImages.length,
        isActive: true,
      });
    }
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingImage(null);
    setFormData({
      imageUrl: '',
      order: 0,
      isActive: true,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingImage) {
        await updateHeroImage(editingImage.id, formData);
        toast({
          title: 'تم التحديث بنجاح',
          description: 'تم تحديث صورة الغلاف بنجاح',
        });
      } else {
        await addHeroImage(formData);
        toast({
          title: 'تم الإضافة بنجاح',
          description: 'تم إضافة صورة الغلاف بنجاح',
        });
      }
      handleCloseForm();
    } catch (error) {
      console.error('Error saving hero image:', error);
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء حفظ الصورة',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteHeroImage(id);
      toast({
        title: 'تم الحذف بنجاح',
        description: 'تم حذف صورة الغلاف بنجاح',
      });
    } catch (error) {
      console.error('Error deleting hero image:', error);
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء حذف الصورة',
        variant: 'destructive',
      });
    }
  };

  const handleToggleActive = async (image: HeroImage) => {
    try {
      await updateHeroImage(image.id, { isActive: !image.isActive });
      toast({
        title: 'تم التحديث',
        description: `تم ${!image.isActive ? 'تفعيل' : 'إلغاء تفعيل'} الصورة`,
      });
    } catch (error) {
      console.error('Error toggling active status:', error);
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء تحديث الحالة',
        variant: 'destructive',
      });
    }
  };

  const handleMoveUp = async (image: HeroImage, index: number) => {
    if (index === 0) return;
    const prevImage = heroImages[index - 1];
    try {
      await updateHeroImage(image.id, { order: prevImage.order });
      await updateHeroImage(prevImage.id, { order: image.order });
    } catch (error) {
      console.error('Error moving image:', error);
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء نقل الصورة',
        variant: 'destructive',
      });
    }
  };

  const handleMoveDown = async (image: HeroImage, index: number) => {
    if (index === heroImages.length - 1) return;
    const nextImage = heroImages[index + 1];
    try {
      await updateHeroImage(image.id, { order: nextImage.order });
      await updateHeroImage(nextImage.id, { order: image.order });
    } catch (error) {
      console.error('Error moving image:', error);
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء نقل الصورة',
        variant: 'destructive',
      });
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
        <h2 className="text-2xl font-bold">إدارة صور الغلاف</h2>
        <p className="text-sm text-muted-foreground mt-1">
          صور الغلاف تظهر في الصفحة الرئيسية ويتم التبديل بينها كل 2 ثانية
        </p>
      </div>

      {/* Add/Edit Form */}
      {!showForm ? (
        <Card className="shadow-soft border-dashed border-2 hover:border-black/30 transition-colors">
          <CardContent className="p-8 text-center">
            <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <Button
              className="rounded-full bg-black text-white hover:bg-black/90 px-6 py-2 shadow-sm"
              onClick={() => handleOpenForm()}
            >
              <Plus className="h-4 w-4 mr-2" />
              إضافة صورة غلاف جديدة
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="shadow-soft border-2 border-black/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-lg">
              {editingImage ? 'تعديل صورة الغلاف' : 'إضافة صورة غلاف جديدة'}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCloseForm}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Image URL */}
              <div className="space-y-2">
                <Label htmlFor="imageUrl">
                  رابط الصورة <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="imageUrl"
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={formData.imageUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, imageUrl: e.target.value })
                  }
                  required
                  className="text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  يمكنك رفع الصورة على خدمة استضافة مثل Imgur ثم نسخ الرابط هنا
                </p>
              </div>

              {/* Preview */}
              {formData.imageUrl && (
                <div className="space-y-2">
                  <Label>معاينة الصورة</Label>
                  <div className="relative w-full h-48 rounded-md overflow-hidden bg-gray-100 border">
                    <img
                      src={formData.imageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder.svg';
                      }}
                    />
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
                    الصور غير النشطة لن تظهر في الصفحة الرئيسية
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

              {/* Form Actions */}
              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseForm}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  إلغاء
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || !formData.imageUrl}
                  className="flex-1 bg-black text-white hover:bg-black/90"
                >
                  {isSubmitting
                    ? 'جاري الحفظ...'
                    : editingImage
                    ? 'تحديث الصورة'
                    : 'إضافة الصورة'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {heroImages.length === 0 ? (
        <Card className="shadow-soft">
          <CardContent className="p-8 text-center">
            <ImageIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">لا توجد صور غلاف بعد</h3>
            <p className="text-muted-foreground">
              استخدم الفورم أعلاه لإضافة صور الغلاف
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="shadow-soft">
          <CardContent className="p-6">
            <div className="space-y-4">
              {heroImages.map((image, index) => (
                <div
                  key={image.id}
                  className="p-4 border rounded-lg bg-white hover:shadow-md transition-shadow"
                >
                  {/* Top Section: Image & Info */}
                  <div className="flex items-center gap-4 mb-3">
                    {/* Preview Image */}
                    <div className="relative w-24 sm:w-32 h-16 sm:h-20 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                      <img
                        src={image.imageUrl}
                        alt={`Hero ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder.svg';
                        }}
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">صورة #{index + 1}</span>
                        <Badge variant={image.isActive ? 'default' : 'secondary'} className="text-xs">
                          {image.isActive ? 'نشط' : 'غير نشط'}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {image.imageUrl}
                      </p>
                    </div>
                  </div>

                  {/* Bottom Section: Actions */}
                  <div className="flex flex-wrap items-center gap-2 pt-3 border-t">
                    {/* Order Controls */}
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleMoveUp(image, index)}
                        disabled={index === 0}
                        className="h-9 w-9 p-0"
                        title="نقل لأعلى"
                      >
                        <MoveUp className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleMoveDown(image, index)}
                        disabled={index === heroImages.length - 1}
                        className="h-9 w-9 p-0"
                        title="نقل لأسفل"
                      >
                        <MoveDown className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Active Toggle */}
                    <div className="flex items-center gap-2 px-3 py-1 border rounded-md bg-gray-50">
                      <span className="text-xs font-medium text-gray-700">نشط</span>
                      <Switch
                        checked={image.isActive}
                        onCheckedChange={() => handleToggleActive(image)}
                      />
                    </div>

                    {/* Edit Button */}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenForm(image)}
                      className="h-9 px-3"
                      title="تعديل"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      <span className="text-xs">تعديل</span>
                    </Button>

                    {/* Delete Button */}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-destructive hover:text-destructive h-9 px-3"
                          title="حذف"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          <span className="text-xs">حذف</span>
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
                          <AlertDialogDescription>
                            هل أنت متأكد من حذف هذه الصورة؟ لا يمكن التراجع عن هذا الإجراء.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>إلغاء</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(image.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            حذف
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

