import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { useToast } from '@/hooks/use-toast'
import { useCategories } from '@/hooks/useCategories'
import { Category, addCategory, updateCategory, deleteCategory } from '@/services/categoryService'
import { Plus, Edit, Trash2, Image } from 'lucide-react'

export const CategoryManagement: React.FC = () => {
  const { toast } = useToast()
  const { categories, loading } = useCategories()

  const [showDialog, setShowDialog] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // dialog form data (name only)
  const [formData, setFormData] = useState({ name: '' })

  // inline quick add field
  const [quickName, setQuickName] = useState('')

  const handleOpenDialog = (category?: Category) => {
    if (category) {
      setEditingCategory(category)
      setFormData({ name: category.name })
    } else {
      setEditingCategory(null)
      setFormData({ name: '' })
    }
    setShowDialog(true)
  }

  const handleCloseDialog = () => {
    setShowDialog(false)
    setEditingCategory(null)
    setFormData({ name: '' })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name?.trim()) {
      toast({ title: 'خطأ في التحقق', description: 'يرجى إدخال اسم الفئة', variant: 'destructive' })
      return
    }

    setIsLoading(true)
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, { name: formData.name.trim() })
        toast({ title: 'تم تحديث الفئة', description: 'تم تحديث الفئة بنجاح' })
      } else {
        await addCategory({ name: formData.name.trim() })
        toast({ title: 'تم إضافة الفئة', description: 'تم إضافة الفئة بنجاح' })
      }
      handleCloseDialog()
    } catch (error) {
      toast({ title: 'خطأ', description: 'فشل في حفظ الفئة', variant: 'destructive' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (categoryId: string, categoryName: string) => {
    setIsLoading(true)
    try {
      await deleteCategory(categoryId)
      toast({ title: 'تم حذف الفئة', description: 'تم حذف الفئة بنجاح' })
    } catch (error) {
      toast({ title: 'خطأ', description: 'فشل في حذف الفئة', variant: 'destructive' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickAdd = async () => {
    const name = quickName.trim()
    if (!name) return
    setIsLoading(true)
    try {
      await addCategory({ name })
      setQuickName('')
      toast({ title: 'تم إضافة الفئة', description: 'تم إضافة الفئة بنجاح' })
    } catch (e) {
      toast({ title: 'خطأ', description: 'فشل في إضافة الفئة', variant: 'destructive' })
    } finally {
      setIsLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">إدارة الفئات</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <Card key={index} className="animate-pulse">
              <div className="h-48 bg-gray-200 rounded-t-lg" />
              <CardContent className="p-4">
                <div className="h-4 bg-gray-200 rounded mb-2" />
                <div className="h-3 bg-gray-200 rounded w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">إدارة الفئات</h2>
            <Button onClick={() => handleOpenDialog()} className="hidden">إضافة فئة</Button>
          </div>

          {/* شريط إضافة سريع بشكل مبسط وحديث */}
          <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-slate-50 to-gray-50 rounded-2xl border border-gray-200/60 shadow-sm">
            <Button 
              onClick={handleQuickAdd} 
              disabled={isLoading || !quickName.trim()} 
              className="h-12 px-6 rounded-full bg-slate-700 hover:bg-slate-800 text-white font-medium shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              <span>إضافة فئة</span>
            </Button>
            <div className="flex-1">
              <Input
                value={quickName}
                onChange={(e) => setQuickName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && quickName.trim()) {
                    handleQuickAdd();
                  }
                }}
                placeholder="اختر الفئة"
                className="h-12 rounded-xl border-gray-300 focus:border-slate-400 focus:ring-slate-400 bg-white px-4 text-right"
                dir="rtl"
              />
            </div>
          </div>
        </div>

        {categories.length === 0 ? (
          <Card className="border-dashed border-2 border-gray-300">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <Image className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-700">لا توجد فئات بعد</h3>
              <p className="text-gray-500 mb-6">ابدأ بإضافة فئة جديدة لتنظيم منتجاتك</p>
              <Button 
                onClick={() => handleOpenDialog()} 
                className="bg-slate-700 hover:bg-slate-800 text-white px-6 py-2 rounded-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                إضافة أول فئة
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {categories.map((category) => (
              <Card key={category.id} className="group hover:shadow-lg transition-all duration-200 border border-gray-200 hover:border-gray-300 rounded-xl">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="font-semibold text-xl truncate text-gray-800 group-hover:text-slate-700 transition-colors">
                      {category.name}
                    </h3>
                    <div className="flex gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenDialog(category)}
                        disabled={isLoading}
                        aria-label="تعديل الفئة"
                        title="تعديل"
                        className="h-8 w-8 p-0 hover:bg-blue-50 text-blue-600 hover:text-blue-700"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={isLoading}
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                            aria-label="حذف الفئة"
                            title="حذف"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent dir="rtl">
                          <AlertDialogHeader>
                            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
                            <AlertDialogDescription>
                              هل أنت متأكد من حذف فئة "{category.name}"؟ لا يمكن التراجع عن هذا الإجراء.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>إلغاء</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDelete(category.id, category.name)} 
                              className="bg-red-600 hover:bg-red-700"
                            >
                              حذف
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Dialog: Add/Edit name only */}
      <Dialog open={showDialog} onOpenChange={handleCloseDialog}>
        <DialogContent aria-describedby="category-dialog-description" className="sm:max-w-md rounded-2xl">
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-xl font-bold">
              {editingCategory ? 'تعديل الفئة' : 'إضافة فئة جديدة'}
            </DialogTitle>
            <DialogDescription id="category-dialog-description" className="text-muted-foreground">
              {editingCategory ? 'قم بتعديل اسم الفئة' : 'أدخل اسم الفئة الجديدة'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name">اسم الفئة</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="أدخل اسم الفئة الجديدة"
                required
                className="h-12 rounded-xl text-lg"
              />
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={handleCloseDialog} className="h-10 rounded-xl">
                إلغاء
              </Button>
              <Button type="submit" disabled={isLoading} className="h-10 rounded-xl">
                {isLoading ? 'جارٍ الحفظ...' : editingCategory ? 'تحديث الفئة' : 'إضافة الفئة'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
