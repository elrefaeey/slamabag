export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  images: string[];
  colors: Array<{
    name: string;
    image: string;
  }>;
  inStock: boolean;

  discount?: number;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  image: string;
}

export const categories: Category[] = [
  {
    id: "handbags",
    name: "Handbags",
    description: "Elegant handbags for every occasion",
    image: "/api/placeholder/300/200"
  },
  {
    id: "wallets",
    name: "Wallets",
    description: "Premium leather wallets",
    image: "/api/placeholder/300/200"
  },
  {
    id: "backpacks",
    name: "Backpacks",
    description: "Stylish backpacks for modern life",
    image: "/api/placeholder/300/200"
  },
  {
    id: "crossbody",
    name: "Crossbody",
    description: "Trendy crossbody bags",
    image: "/api/placeholder/300/200"
  }
];

export const products: Product[] = [
  // Handbags
  {
    id: "h1",
    name: "Classic Leather Tote",
    description: "Timeless leather tote bag perfect for work and daily use",
    price: 299,
    category: "handbags",
    images: ["/api/placeholder/400/400", "/api/placeholder/400/400", "/api/placeholder/400/400"],
    colors: [
      { name: "Black", image: "/api/placeholder/400/400" },
      { name: "Brown", image: "/api/placeholder/400/400" },
      { name: "Beige", image: "/api/placeholder/400/400" }
    ],
    inStock: true
  },
  {
    id: "h2",
    name: "Luxury Satchel",
    description: "Elegant satchel with gold hardware details",
    price: 459,
    originalPrice: 599,
    category: "handbags",
    images: ["/api/placeholder/400/400", "/api/placeholder/400/400"],
    colors: [
      { name: "Navy Blue", image: "/api/placeholder/400/400" },
      { name: "Burgundy", image: "/api/placeholder/400/400" }
    ],
    inStock: true,
    discount: 23
  },
  {
    id: "h3",
    name: "Mini Evening Clutch",
    description: "Compact clutch perfect for evening events",
    price: 129,
    category: "handbags",
    images: ["/api/placeholder/400/400"],
    colors: [
      { name: "Gold", image: "/api/placeholder/400/400" },
      { name: "Silver", image: "/api/placeholder/400/400" },
      { name: "Black", image: "/api/placeholder/400/400" }
    ],
    inStock: false
  },
  {
    id: "h4",
    name: "Designer Hobo Bag",
    description: "Spacious hobo bag with premium finish",
    price: 389,
    category: "handbags",
    images: ["/api/placeholder/400/400", "/api/placeholder/400/400"],
    colors: [
      { name: "Tan", image: "/api/placeholder/400/400" },
      { name: "Black", image: "/api/placeholder/400/400" }
    ],
    inStock: true
  },

  // Wallets
  {
    id: "w1",
    name: "Classic Bi-fold Wallet",
    description: "Premium leather bi-fold wallet with multiple card slots",
    price: 89,
    category: "wallets",
    images: ["/api/placeholder/400/400"],
    colors: [
      { name: "Black", image: "/api/placeholder/400/400" },
      { name: "Brown", image: "/api/placeholder/400/400" }
    ],
    inStock: true
  },
  {
    id: "w2",
    name: "Slim Card Holder",
    description: "Minimalist card holder for the modern professional",
    price: 49,
    category: "wallets",
    images: ["/api/placeholder/400/400"],
    colors: [
      { name: "Black", image: "/api/placeholder/400/400" },
      { name: "Navy", image: "/api/placeholder/400/400" },
      { name: "Gray", image: "/api/placeholder/400/400" }
    ],
    inStock: true
  },
  {
    id: "w3",
    name: "Long Zip Wallet",
    description: "Spacious zip-around wallet with coin compartment",
    price: 119,
    category: "wallets",
    images: ["/api/placeholder/400/400"],
    colors: [
      { name: "Rose Pink", image: "/api/placeholder/400/400" },
      { name: "Black", image: "/api/placeholder/400/400" }
    ],
    inStock: true
  },

  // Backpacks
  {
    id: "b1",
    name: "Urban Laptop Backpack",
    description: "Professional backpack with laptop compartment",
    price: 159,
    category: "backpacks",
    images: ["/api/placeholder/400/400", "/api/placeholder/400/400"],
    colors: [
      { name: "Charcoal", image: "/api/placeholder/400/400" },
      { name: "Navy", image: "/api/placeholder/400/400" }
    ],
    inStock: true
  },
  {
    id: "b2",
    name: "Mini Fashion Backpack",
    description: "Stylish mini backpack for casual outings",
    price: 89,
    category: "backpacks",
    images: ["/api/placeholder/400/400"],
    colors: [
      { name: "White", image: "/api/placeholder/400/400" },
      { name: "Pink", image: "/api/placeholder/400/400" },
      { name: "Black", image: "/api/placeholder/400/400" }
    ],
    inStock: true
  },
  {
    id: "b3",
    name: "Travel Backpack",
    description: "Large capacity backpack for travel and adventures",
    price: 219,
    category: "backpacks",
    images: ["/api/placeholder/400/400"],
    colors: [
      { name: "Olive Green", image: "/api/placeholder/400/400" },
      { name: "Black", image: "/api/placeholder/400/400" }
    ],
    inStock: false
  },

  // Crossbody
  {
    id: "c1",
    name: "Chain Crossbody Bag",
    description: "Trendy crossbody with gold chain strap",
    price: 129,
    category: "crossbody",
    images: ["/api/placeholder/400/400"],
    colors: [
      { name: "Black", image: "/api/placeholder/400/400" },
      { name: "Cream", image: "/api/placeholder/400/400" }
    ],
    inStock: true
  },
  {
    id: "c2",
    name: "Camera Bag Style",
    description: "Vintage-inspired camera bag crossbody",
    price: 99,
    category: "crossbody",
    images: ["/api/placeholder/400/400"],
    colors: [
      { name: "Cognac Brown", image: "/api/placeholder/400/400" },
      { name: "Black", image: "/api/placeholder/400/400" }
    ],
    inStock: true
  },
  {
    id: "c3",
    name: "Belt Bag Crossbody",
    description: "Convertible belt bag that doubles as crossbody",
    price: 79,
    category: "crossbody",
    images: ["/api/placeholder/400/400"],
    colors: [
      { name: "Tan", image: "/api/placeholder/400/400" },
      { name: "Black", image: "/api/placeholder/400/400" },
      { name: "White", image: "/api/placeholder/400/400" }
    ],
    inStock: true
  }
];

export const getProductsByCategory = (categoryId: string) => {
  return products.filter(product => product.category === categoryId);
};



export const getProductById = (id: string) => {
  return products.find(product => product.id === id);
};