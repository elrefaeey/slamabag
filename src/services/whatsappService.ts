import { CartItem } from '@/data/orders';

export interface OrderData {
  orderId: string;
  customerName: string;
  primaryPhone: string;
  secondaryPhone?: string;
  governorate: string;
  district: string;
  detailedAddress: string;
  items: CartItem[];
  total: number;
  subtotal?: number;
  discountCode?: string;
  discountAmount?: number;
  shippingCost?: number;
}

// Fixed WhatsApp phone number (Egypt): +20 10 6879 8221
const getWhatsAppPhone = (): string => {
  return '201068798221';
};

export const formatOrderMessage = (orderData: OrderData): string => {
  const {
    orderId,
    customerName,
    primaryPhone,
    secondaryPhone,
    governorate,
    district,
    detailedAddress,
    items,
    total,
    subtotal,
    discountCode,
    discountAmount,
    shippingCost
  } = orderData;

  // Format items list in Arabic
  const itemsList = items.map((item, index) => 
    `${index + 1}. ${item.name}\n   اللون: ${item.color}\n   الكمية: ${item.quantity}\n   السعر: EG ${(item.price * item.quantity).toFixed(2)}`
  ).join('\n\n');

  // Get current date and time in Arabic format
  const now = new Date();
  const dateOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Africa/Cairo'
  };
  const arabicDate = now.toLocaleDateString('ar-EG', dateOptions);

  // Create the complete message in Arabic
  const message = `🛍️ *طلب جديد من SALMA BAG* 🛍️

📋 *تفاصيل الطلب:*
رقم الطلب: #${orderId}
تاريخ الطلب: ${arabicDate}

👤 *بيانات العميل:*
الاسم: ${customerName}
الهاتف الأساسي: ${primaryPhone}${secondaryPhone ? `\nهاتف إضافي: ${secondaryPhone}` : ''}

📍 *عنوان التوصيل:*
المحافظة: ${governorate}${district ? `\nالمنطقة: ${district}` : ''}
العنوان التفصيلي: ${detailedAddress}

🛒 *المنتجات المطلوبة:*
${itemsList}

💰 *ملخص الطلب:*${subtotal ? `\nالمجموع الفرعي: EG ${subtotal.toFixed(2)}` : ''}${discountCode ? `\n🎟️ كود الخصم: ${discountCode}` : ''}${discountAmount ? `\n💸 قيمة الخصم: -EG ${discountAmount.toFixed(2)}` : ''}${typeof shippingCost === 'number' ? `\n+ سعر التوصيل: EG ${shippingCost.toFixed(2)}` : ''}
= *الإجمالي الكلي: EG ${total.toFixed(2)}*${discountAmount ? `\n✨ وفر العميل: EG ${discountAmount.toFixed(2)}!` : ''}

سنتواصل معك لتأكيد الطلب قريبًا.

*شكراً لك على استخدام SALMA BAG* 💝`;

  return message;
};

export const sendWhatsAppMessage = (orderData: OrderData): void => {
  const message = formatOrderMessage(orderData);
  const encodedMessage = encodeURIComponent(message);
  const whatsappPhone = getWhatsAppPhone();
  const whatsappUrl = `https://wa.me/${whatsappPhone}?text=${encodedMessage}`;
  
  // Open WhatsApp in a new tab/window
  window.open(whatsappUrl, '_blank');
};

// Generate sequential order ID
export const generateOrderId = async (): Promise<string> => {
  try {
    // Get the current order count from localStorage or start from 1
    const currentCount = parseInt(localStorage.getItem('orderCount') || '0', 10);
    const newCount = currentCount + 1;
    
    // Save the new count
    localStorage.setItem('orderCount', newCount.toString());
    
    // Format as 3-digit number with leading zeros
    return newCount.toString().padStart(3, '0');
  } catch (error) {
    console.error('Error generating order ID:', error);
    // Fallback to timestamp-based ID
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `${timestamp}-${random}`;
  }
};
