import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy,
  onSnapshot,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  color: string;
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail?: string;
  primaryPhone: string;
  secondaryPhone?: string;
  governorate: string;
  district: string;
  detailedAddress: string;
  items: OrderItem[];
  total: number;
  subtotal?: number;
  discountCode?: string;
  discountAmount?: number;
  isConfirmed: boolean;
  orderDate: Date;
  notes?: string;
}

const ORDERS_COLLECTION = 'orders';

// Get all orders
export const getAllOrders = async (): Promise<Order[]> => {
  try {
    const ordersRef = collection(db, ORDERS_COLLECTION);
    const q = query(ordersRef, orderBy('orderDate', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const orders: Order[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      orders.push({
        id: doc.id,
        ...data,
        orderDate: data.orderDate?.toDate() || new Date()
      } as Order);
    });
    
    return orders;
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw new Error('Failed to fetch orders');
  }
};

// Add a new order
export const addOrder = async (orderData: Omit<Order, 'id'>): Promise<string> => {
  try {
    const ordersRef = collection(db, ORDERS_COLLECTION);

    // Remove undefined fields to satisfy Firestore requirements
    const cleaned: any = Object.fromEntries(
      Object.entries(orderData).filter(([_, v]) => v !== undefined)
    );

    const docRef = await addDoc(ordersRef, {
      ...cleaned,
      orderDate: Timestamp.fromDate(orderData.orderDate),
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Error adding order:', error);
    throw new Error('Failed to add order');
  }
};

// Update an order
export const updateOrder = async (orderId: string, orderData: Partial<Order>): Promise<void> => {
  try {
    const orderRef = doc(db, ORDERS_COLLECTION, orderId);
    const updateData: any = {
      ...orderData,
      updatedAt: Timestamp.now()
    };
    
    // Convert Date to Timestamp if orderDate is being updated
    if (orderData.orderDate) {
      updateData.orderDate = Timestamp.fromDate(orderData.orderDate);
    }
    
    await updateDoc(orderRef, updateData);
  } catch (error) {
    console.error('Error updating order:', error);
    throw new Error('Failed to update order');
  }
};

// Delete an order
export const deleteOrder = async (orderId: string): Promise<void> => {
  try {
    const orderRef = doc(db, ORDERS_COLLECTION, orderId);
    await deleteDoc(orderRef);
  } catch (error) {
    console.error('Error deleting order:', error);
    throw new Error('Failed to delete order');
  }
};

// Confirm an order
export const confirmOrder = async (orderId: string): Promise<void> => {
  try {
    await updateOrder(orderId, { isConfirmed: true });
  } catch (error) {
    console.error('Error confirming order:', error);
    throw new Error('Failed to confirm order');
  }
};

// Unconfirm an order
export const unconfirmOrder = async (orderId: string): Promise<void> => {
  try {
    await updateOrder(orderId, { isConfirmed: false });
  } catch (error) {
    console.error('Error unconfirming order:', error);
    throw new Error('Failed to unconfirm order');
  }
};

// Listen to orders changes (real-time)
export const subscribeToOrders = (callback: (orders: Order[]) => void) => {
  const ordersRef = collection(db, ORDERS_COLLECTION);
  const q = query(ordersRef, orderBy('orderDate', 'desc'));
  
  return onSnapshot(q, (querySnapshot) => {
    const orders: Order[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      orders.push({
        id: doc.id,
        ...data,
        orderDate: data.orderDate?.toDate() || new Date()
      } as Order);
    });
    callback(orders);
  }, (error) => {
    console.error('Error listening to orders:', error);
  });
};
