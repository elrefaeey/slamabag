export interface CartItem {
  id: string;
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
  customerPhone: string;
  customerEmail: string;
  address: {
    province: string;
    city: string;
    fullAddress: string;
  };
  items: CartItem[];
  total: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminStats {
  totalProducts: number;
  totalCategories: number;
  totalOrders: number;
  totalSales: number;
  todaySales: number;
  weekSales: number;
  monthSales: number;
}

export const mockOrders: Order[] = [
  {
    id: "ORD-001",
    customerName: "Sarah Johnson",
    customerPhone: "+1234567890",
    customerEmail: "sarah@example.com",
    address: {
      province: "Ontario",
      city: "Toronto",
      fullAddress: "123 Queen St W, Toronto, ON M5H 2M9"
    },
    items: [
      {
        id: "item-1",
        productId: "h1",
        name: "Classic Leather Tote",
        price: 299,
        quantity: 1,
        image: "/api/placeholder/400/400",
        color: "Black"
      },
      {
        id: "item-2",
        productId: "w1",
        name: "Classic Bi-fold Wallet",
        price: 89,
        quantity: 1,
        image: "/api/placeholder/400/400",
        color: "Brown"
      }
    ],
    total: 388,
    status: "pending",
    createdAt: new Date("2024-01-15T10:30:00"),
    updatedAt: new Date("2024-01-15T10:30:00")
  },
  {
    id: "ORD-002",
    customerName: "Michael Chen",
    customerPhone: "+1987654321",
    customerEmail: "michael@example.com",
    address: {
      province: "British Columbia",
      city: "Vancouver",
      fullAddress: "456 Robson St, Vancouver, BC V6B 2B5"
    },
    items: [
      {
        id: "item-3",
        productId: "b1",
        name: "Urban Laptop Backpack",
        price: 159,
        quantity: 2,
        image: "/api/placeholder/400/400",
        color: "Charcoal"
      }
    ],
    total: 318,
    status: "shipped",
    createdAt: new Date("2024-01-14T14:20:00"),
    updatedAt: new Date("2024-01-15T09:15:00")
  },
  {
    id: "ORD-003",
    customerName: "Emma Wilson",
    customerPhone: "+1122334455",
    customerEmail: "emma@example.com",
    address: {
      province: "Quebec",
      city: "Montreal",
      fullAddress: "789 Rue Sainte-Catherine, Montreal, QC H3B 1B4"
    },
    items: [
      {
        id: "item-4",
        productId: "h2",
        name: "Luxury Satchel",
        price: 459,
        quantity: 1,
        image: "/api/placeholder/400/400",
        color: "Navy Blue"
      }
    ],
    total: 459,
    status: "delivered",
    createdAt: new Date("2024-01-12T16:45:00"),
    updatedAt: new Date("2024-01-14T11:30:00")
  }
];

export const getAdminStats = (): AdminStats => {
  // Reset all non-Firebase stats (no real sales yet)
  return {
    totalProducts: 0,
    totalCategories: 0,
    totalOrders: 0,
    totalSales: 0,
    todaySales: 0,
    weekSales: 0,
    monthSales: 0,
  };
};