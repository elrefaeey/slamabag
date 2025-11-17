import { ShoppingBag, Trash2, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { CartItem } from '@/data/orders';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (productId: string, color: string, quantity: number) => void;
  onRemoveItem: (productId: string, color: string) => void;
  onCheckout: () => void;
}

export const CartSidebar = ({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
}: CartSidebarProps) => {
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (cart.length === 0) {
    return (
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="w-full sm:max-w-lg">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              سلة التسوق
            </SheetTitle>
          </SheetHeader>

          <div className="flex flex-col h-full mt-6">
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">سلة التسوق فارغة</h3>
              <p className="text-muted-foreground mb-6">
                أضف بعض الحقائب الجميلة للبدء!
              </p>
              <Button className="btn-accent" onClick={onClose}>
                متابعة التسوق
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            سلة التسوق ({cart.length})
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="flex-1 mt-6 -mx-6 px-6">
          <div className="space-y-4">
            {cart.map((item) => (
              <div key={`${item.productId}-${item.color}`} className="flex gap-4 p-4 bg-secondary/30 rounded-lg">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm truncate">{item.name}</h4>
                  <p className="text-xs text-muted-foreground">اللون: {item.color}</p>
                  <p className="text-sm font-bold text-clean-accent mt-1">
                    {item.price.toFixed(2)} جنيه
                  </p>
                  
                  <div className="flex items-center gap-2 mt-2">
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-7 w-7"
                      onClick={() => onUpdateQuantity(item.productId, item.color, Math.max(1, item.quantity - 1))}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-7 w-7"
                      onClick={() => onUpdateQuantity(item.productId, item.color, item.quantity + 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={() => onRemoveItem(item.productId, item.color)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="mt-4 space-y-4">
          <Separator />
          <div className="flex items-center justify-between text-lg font-bold">
            <span>الإجمالي:</span>
            <span className="text-clean-accent">{total.toFixed(2)} جنيه</span>
          </div>
          <Button className="w-full btn-gold" size="lg" onClick={onCheckout}>
            إتمام الطلب
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};