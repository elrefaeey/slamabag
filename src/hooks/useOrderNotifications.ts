import { useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { subscribeToOrders, Order } from '@/services/orderService';

export const useOrderNotifications = () => {
  const { toast } = useToast();
  const previousOrdersRef = useRef<Order[]>([]);
  const isInitialLoadRef = useRef(true);

  useEffect(() => {
    const unsubscribe = subscribeToOrders((orders) => {
      // Skip notifications on initial load
      if (isInitialLoadRef.current) {
        previousOrdersRef.current = orders;
        isInitialLoadRef.current = false;
        return;
      }

      // Check for new orders
      const previousOrders = previousOrdersRef.current;
      const newOrders = orders.filter(order => 
        !previousOrders.some(prevOrder => prevOrder.id === order.id)
      );

      // Show notification for each new order
      newOrders.forEach(order => {
        // Play notification sound (optional)
        try {
          const audio = new Audio('/notification.mp3');
          audio.volume = 0.5;
          audio.play().catch(() => {
            // Ignore audio play errors (user interaction required)
          });
        } catch (error) {
          // Ignore audio errors
        }

        // Show toast notification
        toast({
          title: "🛍️ طلب جديد!",
          description: `طلب جديد من ${order.customerName} بقيمة ${order.total.toFixed(2)} جنيه`,
          duration: 8000,
        });

        // Show browser notification if permission granted
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('طلب جديد - SALMA BAG', {
            body: `طلب جديد من ${order.customerName} بقيمة ${order.total.toFixed(2)} جنيه`,
            icon: '/favicon.ico',
            tag: `order-${order.id}`,
          });
        }
      });

      previousOrdersRef.current = orders;
    });

    return unsubscribe;
  }, [toast]);

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);
};