import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, X } from 'lucide-react';
import { Product, categories } from '@/data/products';
import { useToast } from '@/hooks/use-toast';

interface ProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product;
  onSave: (product: Omit<Product, 'id'> & { id?: string }) => void;
}

interface ColorInput {
  name: string;
  image: string;
}

export const ProductForm = ({ isOpen, onClose, product, onSave }: ProductFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    inStock: true,
    featured: false
  });
  const [colors, setColors] = useState<ColorInput[]>([{ name: '', image: '' }]);
  const [images, setImages] = useState<string[]>(['']);
  const [newCategory, setNewCategory] = useState('');
  const [showNewCategory, setShowNewCategory] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price.toString(),
        category: product.category,
        inStock: product.inStock,
        featured: product.featured || false
      });
      setColors(product.colors);
      setImages(product.images);
    } else {
      setFormData({
        name: '',
        description: '',
        price: '',
        category: '',
        inStock: true,
        featured: false
      });
      setColors([{ name: '', image: '' }]);
      setImages(['']);
    }
  }, [product, isOpen]);

  const addColorField = () => {
    setColors([...colors, { name: '', image: '' }]);
  };

  const removeColorField = (index: number) => {
    setColors(colors.filter((_, i) => i !== index));
  };

  const updateColor = (index: number, field: keyof ColorInput, value: string) => {
    const newColors = [...colors];
    newColors[index][field] = value;
    setColors(newColors);
  };

  const addImageField = () => {
    setImages([...images, '']);
  };

  const removeImageField = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const updateImage = (index: number, value: string) => {
    const newImages = [...images];
    newImages[index] = value;
    setImages(newImages);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price || !formData.category) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const validColors = colors.filter(color => color.name && color.image);
    const validImages = images.filter(img => img);

    const productData = {
      ...(product && { id: product.id }),
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      category: showNewCategory ? newCategory : formData.category,
      images: validImages,
      colors: validColors,
      inStock: formData.inStock,
      featured: formData.featured
    };

    onSave(productData);
    onClose();
    
    toast({
      title: "Success",
      description: `Product ${product ? 'updated' : 'created'} successfully`,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" aria-describedby="product-dialog-description">
        <DialogHeader>
          <DialogTitle>{product ? 'Edit Product' : 'Add New Product'}</DialogTitle>
          <DialogDescription id="product-dialog-description">
            {product ? 'Update the product details below.' : 'Fill in the form to create a new product.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter product name"
                required
              />
            </div>
            <div>
              <Label htmlFor="price">Price *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="0.00"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter product description (optional)"
              rows={3}
            />
          </div>

          {/* Category */}
          <div>
            <Label>Category *</Label>
            <div className="space-y-2">
              <Select
                value={showNewCategory ? 'new' : formData.category}
                onValueChange={(value) => {
                  if (value === 'new') {
                    setShowNewCategory(true);
                  } else {
                    setShowNewCategory(false);
                    setFormData({ ...formData, category: value });
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                  <SelectItem value="new">+ Create New Category</SelectItem>
                </SelectContent>
              </Select>

              {showNewCategory && (
                <Input
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="Enter new category name"
                  required
                />
              )}
            </div>
          </div>

          {/* Images */}
          <div>
            <Label>Product Images</Label>
            <div className="space-y-2">
              {images.map((image, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={image}
                    onChange={(e) => updateImage(index, e.target.value)}
                    placeholder="Enter image URL"
                  />
                  {images.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeImageField(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addImageField}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Image
              </Button>
            </div>
          </div>

          {/* Colors */}
          <div>
            <Label>Colors</Label>
            <div className="space-y-2">
              {colors.map((color, index) => (
                <div key={index} className="grid grid-cols-2 gap-2">
                  <Input
                    value={color.name}
                    onChange={(e) => updateColor(index, 'name', e.target.value)}
                    placeholder="Color name"
                  />
                  <div className="flex gap-2">
                    <Input
                      value={color.image}
                      onChange={(e) => updateColor(index, 'image', e.target.value)}
                      placeholder="Color image URL"
                    />
                    {colors.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeColorField(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addColorField}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Color
              </Button>
            </div>
          </div>

          {/* Status */}
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.inStock}
                onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })}
                className="rounded"
              />
              <span>In Stock</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.featured}
                onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                className="rounded"
              />
              <span>Featured Product</span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="btn-gold">
              {product ? 'Update Product' : 'Create Product'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};