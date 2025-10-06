import { 
  collection, 
  doc, 
  getDoc,
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  onSnapshot,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Product } from '@/data/products';

const PRODUCTS_COLLECTION = 'products';

// Get all products
export const getAllProducts = async (): Promise<Product[]> => {
  try {
    const productsRef = collection(db, PRODUCTS_COLLECTION);
    const q = query(productsRef, orderBy('name'));
    const querySnapshot = await getDocs(q);
    
    const products: Product[] = [];
    querySnapshot.forEach((doc) => {
      products.push({
        id: doc.id,
        ...doc.data()
      } as Product);
    });
    
    return products;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw new Error('Failed to fetch products');
  }
};

// Get products by category
export const getProductsByCategory = async (category: string): Promise<Product[]> => {
  try {
    const productsRef = collection(db, PRODUCTS_COLLECTION);
    const q = query(
      productsRef,
      where('category', '==', category)
    );
    const querySnapshot = await getDocs(q);

    const products: Product[] = [];
    querySnapshot.forEach((doc) => {
      products.push({
        id: doc.id,
        ...doc.data()
      } as Product);
    });

    // Sort by name on client side
    return products.sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error('Error fetching products by category:', error);
    throw new Error('Failed to fetch products by category');
  }
};

// Get featured products
export const getFeaturedProducts = async (): Promise<Product[]> => {
  try {
    // Get all products first, then filter on client side
    const allProducts = await getAllProducts();

    // Filter featured products on client side
    const featuredProducts = allProducts.filter(product => product.featured === true);

    return featuredProducts;
  } catch (error) {
    console.error('Error fetching featured products:', error);
    // If no featured products, return first 4 products
    try {
      const allProducts = await getAllProducts();
      return allProducts.slice(0, 4);
    } catch (fallbackError) {
      console.error('Error fetching fallback products:', fallbackError);
      return [];
    }
  }
};

// Get a single product by id
export const getProductById = async (productId: string): Promise<Product | null> => {
  try {
    const productRef = doc(db, PRODUCTS_COLLECTION, productId);
    const snapshot = await getDoc(productRef);
    if (!snapshot.exists()) return null;
    return { id: snapshot.id, ...(snapshot.data() as Product) };
  } catch (error) {
    console.error('Error fetching product by id:', error);
    throw new Error('Failed to fetch product');
  }
};

// Subscribe to a single product by id
export const subscribeToProduct = (
  productId: string,
  callback: (product: Product | null) => void
) => {
  const productRef = doc(db, PRODUCTS_COLLECTION, productId);
  return onSnapshot(productRef, (snapshot) => {
    if (!snapshot.exists()) {
      callback(null);
      return;
    }
    callback({ id: snapshot.id, ...(snapshot.data() as Product) });
  }, (error) => {
    console.error('Error listening to product:', error);
  });
};

// Add a new product
export const addProduct = async (productData: Omit<Product, 'id'>): Promise<string> => {
  try {
    const productsRef = collection(db, PRODUCTS_COLLECTION);
    const docRef = await addDoc(productsRef, {
      ...productData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Error adding product:', error);
    throw new Error('Failed to add product');
  }
};

// Update a product
export const updateProduct = async (productId: string, productData: Partial<Product>): Promise<void> => {
  try {
    const productRef = doc(db, PRODUCTS_COLLECTION, productId);
    await updateDoc(productRef, {
      ...productData,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error updating product:', error);
    throw new Error('Failed to update product');
  }
};

// Delete a product
export const deleteProduct = async (productId: string): Promise<void> => {
  try {
    const productRef = doc(db, PRODUCTS_COLLECTION, productId);
    await deleteDoc(productRef);
  } catch (error) {
    console.error('Error deleting product:', error);
    throw new Error('Failed to delete product');
  }
};

// Listen to products changes (real-time)
export const subscribeToProducts = (callback: (products: Product[]) => void) => {
  const productsRef = collection(db, PRODUCTS_COLLECTION);
  const q = query(productsRef, orderBy('name'));
  
  return onSnapshot(q, (querySnapshot) => {
    const products: Product[] = [];
    querySnapshot.forEach((doc) => {
      products.push({
        id: doc.id,
        ...doc.data()
      } as Product);
    });
    callback(products);
  }, (error) => {
    console.error('Error listening to products:', error);
  });
};
