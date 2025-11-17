import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  CheckCircle,
  XCircle,
  Package,
  User,
  MapPin,
  Phone,
  Calendar,
  DollarSign,
  Search,
  Filter,
  Trash2,
  AlertTriangle,
  MessageCircle
} from 'lucide-react';
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
import {
  getAllOrders,
  confirmOrder,
  unconfirmOrder,
  deleteOrder,
  subscribeToOrders,
  Order
} from '@/services/orderService';
import { sendWhatsAppMessage, OrderData } from '@/services/whatsappService';

export const OrdersManagement = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'confirmed' | 'pending'>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [deletingOrderId, setDeletingOrderId] = useState<string | null>(null);
  const { toast } = useToast();

  // Load orders from Firebase
  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = subscribeToOrders((liveOrders) => {
      setOrders(liveOrders);
      setFilteredOrders(liveOrders);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [toast]);

  // Filter orders based on search and status
  useEffect(() => {
    let filtered = orders;

    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.primaryPhone.includes(searchTerm) ||
        (order.secondaryPhone && order.secondaryPhone.includes(searchTerm)) ||
        order.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(order =>
        filterStatus === 'confirmed' ? order.isConfirmed : !order.isConfirmed
      );
    }

    setFilteredOrders(filtered);
  }, [orders, searchTerm, filterStatus]);

  const handleConfirmOrder = async (orderId: string) => {
    try {
      await confirmOrder(orderId);
      setOrders(prev => prev.map(order =>
        order.id === orderId ? { ...order, isConfirmed: true } : order
      ));
      toast({
        title: "تم التأكيد",
        description: "تم تأكيد الطلب بنجاح",
      });
    } catch (error) {
      console.error('Error confirming order:', error);
      toast({
        title: "خطأ",
        description: "فشل في تأكيد الطلب. يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
    }
  };

  const handleUnconfirmOrder = async (orderId: string) => {
    try {
      await unconfirmOrder(orderId);
      setOrders(prev => prev.map(order =>
        order.id === orderId ? { ...order, isConfirmed: false } : order
      ));
      toast({
        title: "تم إلغاء التأكيد",
        description: "تم إلغاء تأكيد الطلب بنجاح",
      });
    } catch (error) {
      console.error('Error unconfirming order:', error);
      toast({
        title: "خطأ",
        description: "فشل في إلغاء تأكيد الطلب. يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    setDeletingOrderId(orderId);
    try {
      await deleteOrder(orderId);
      setOrders(prev => prev.filter(order => order.id !== orderId));
      toast({
        title: "تم الحذف",
        description: "تم حذف الطلب بنجاح",
      });
    } catch (error) {
      console.error('Error deleting order:', error);
      toast({
        title: "خطأ",
        description: "فشل في حذف الطلب. يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
    } finally {
      setDeletingOrderId(null);
    }
  };

  const handleResendWhatsApp = (order: Order) => {
    try {
      const orderData: OrderData = {
        orderId: order.id,
        customerName: order.customerName,
        primaryPhone: order.primaryPhone,
        secondaryPhone: order.secondaryPhone,
        governorate: order.governorate,
        district: order.district,
        detailedAddress: order.detailedAddress,
        items: order.items.map(item => ({
          id: `${item.productId}-${item.color}`,
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
          color: item.color
        })),
        total: order.total,
        subtotal: order.subtotal,
        discountCode: order.discountCode,
        discountAmount: order.discountAmount
      };

      sendWhatsAppMessage(orderData);
      toast({
        title: "تم إرسال الرسالة",
        description: "تم فتح الواتساب مع تفاصيل الطلب",
      });
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      toast({
        title: "خطأ",
        description: "فشل في إرسال رسالة الواتساب",
        variant: "destructive",
      });
    }
  };

  // Calculate total revenue from confirmed orders
  const totalRevenue = orders
    .filter(order => order.isConfirmed)
    .reduce((sum, order) => sum + order.total, 0);

  const confirmedOrdersCount = orders.filter(order => order.isConfirmed).length;
  const pendingOrdersCount = orders.filter(order => !order.isConfirmed).length;

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">إجمالي الطلبات</p>
                <p className="text-2xl font-bold">{orders.length}</p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">طلبات مؤكدة</p>
                <p className="text-2xl font-bold text-green-600">{confirmedOrdersCount}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">طلبات معلقة</p>
                <p className="text-2xl font-bold text-orange-600">{pendingOrdersCount}</p>
              </div>
              <XCircle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">إجمالي الإيرادات</p>
                <p className="text-2xl font-bold text-green-600">${totalRevenue.toFixed(2)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">البحث في الطلبات</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="البحث بالاسم، رقم الهاتف، أو رقم الطلب..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label>تصفية حسب الحالة</Label>
              <div className="flex gap-2 mt-2">
                <Button
                  variant={filterStatus === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus('all')}
                >
                  الكل
                </Button>
                <Button
                  variant={filterStatus === 'confirmed' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus('confirmed')}
                >
                  مؤكدة
                </Button>
                <Button
                  variant={filterStatus === 'pending' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus('pending')}
                >
                  معلقة
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">لا توجد طلبات</h3>
              <p className="text-muted-foreground">
                {searchTerm || filterStatus !== 'all' 
                  ? 'لا توجد طلبات تطابق معايير البحث'
                  : 'لم يتم تقديم أي طلبات بعد'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredOrders.map((order) => (
            <Card key={order.id} className="shadow-soft">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                    <CardTitle className="text-lg">طلب #{order.id}</CardTitle>
                    <Badge variant={order.isConfirmed ? 'default' : 'secondary'}>
                      {order.isConfirmed ? 'مؤكد' : 'معلق'}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {order.items.length} منتج
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-4 flex-wrap justify-end">
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`confirm-${order.id}`} className="text-sm">
                        {order.isConfirmed ? 'إلغاء التأكيد' : 'تأكيد الطلب'}
                      </Label>
                      <Switch
                        id={`confirm-${order.id}`}
                        checked={order.isConfirmed}
                        onCheckedChange={(checked) =>
                          checked ? handleConfirmOrder(order.id) : handleUnconfirmOrder(order.id)
                        }
                      />
                    </div>

                    {/* WhatsApp Resend Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleResendWhatsApp(order)}
                      className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
                    >
                      <MessageCircle className="h-4 w-4" />
                      <span className="ml-1">واتساب</span>
                    </Button>

                    {/* Delete Order Button */}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                          disabled={deletingOrderId === order.id}
                        >
                          {deletingOrderId === order.id ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                          <span className="ml-1">حذف</span>
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-red-600" />
                            تأكيد حذف الطلب
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            هل أنت متأكد من حذف الطلب #{order.id}؟
                            <br />
                            <strong>العميل:</strong> {order.customerName}
                            <br />
                            <strong>المبلغ:</strong> ${order.total.toFixed(2)}
                            <br />
                            <br />
                            هذا الإجراء لا يمكن التراجع عنه وسيتم حذف جميع بيانات الطلب نهائياً.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>إلغاء</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteOrder(order.id)}
                            className="bg-red-600 hover:bg-red-700 text-white"
                          >
                            حذف الطلب
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-5 px-5 py-4">
                {/* Customer Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">اسم العميل:</span>
                      <span>{order.customerName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">الهاتف الأساسي:</span>
                      <span>{order.primaryPhone}</span>
                    </div>
                    {order.secondaryPhone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">الهاتف الثانوي:</span>
                        <span>{order.secondaryPhone}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">المحافظة:</span>
                      <span className="text-sm">{order.governorate}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">المنطقة:</span>
                      <span className="text-sm">{order.district}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">العنوان التفصيلي:</span>
                      <span className="text-sm">{order.detailedAddress}</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">تاريخ الطلب:</span>
                      <span>{order.orderDate.toLocaleDateString('ar-EG', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">وقت الطلب:</span>
                      <span>{order.orderDate.toLocaleTimeString('ar-EG', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true
                      })}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">عدد المنتجات:</span>
                      <span>{order.items.length} منتج</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">إجمالي القطع:</span>
                      <span>{order.items.reduce((sum, item) => sum + item.quantity, 0)} قطعة</span>
                    </div>
                    {/* Subtotal, Discount, Total */}
                    {typeof order.subtotal === 'number' && (
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">المجموع الفرعي:</span>
                        <span className="text-lg font-semibold">${order.subtotal.toFixed(2)}</span>
                      </div>
                    )}
                    {order.discountCode && typeof order.discountAmount === 'number' && (
                      <div className="flex items-center gap-2 text-green-700">
                        <span className="font-medium">الخصم:</span>
                        <span className="font-semibold">-${order.discountAmount.toFixed(2)}</span>
                        <Button
                          variant="link"
                          className="p-0 h-auto text-green-700 underline"
                          onClick={() => navigate('/admin?tab=discounts&code=' + encodeURIComponent(order.discountCode!))}
                        >
                          {order.discountCode}
                        </Button>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">الإجمالي:</span>
                      <span className="text-lg font-bold text-clean-accent">${order.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div>
                  <h4 className="font-semibold text-lg mb-3">المنتجات المطلوبة:</h4>
                  <div className="space-y-3">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex items-center gap-4 p-4 bg-secondary/30 rounded-xl">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-14 h-14 object-cover rounded-md"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-base">{item.name}</p>
                          <p className="text-sm text-muted-foreground truncate">
                            اللون: {item.color} | الكمية: {item.quantity}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-semibold">${item.price.toFixed(2)}</p>
                          <p className="text-sm text-muted-foreground">
                            المجموع: ${(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                {order.notes && (
                  <div>
                    <h4 className="font-medium mb-2">ملاحظات:</h4>
                    <p className="text-sm text-muted-foreground bg-secondary/30 p-3 rounded-lg">
                      {order.notes}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
