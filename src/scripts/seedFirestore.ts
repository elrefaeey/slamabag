import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { products, categories } from '@/data/products';

const PRODUCTS_COLLECTION = 'products';
const CATEGORIES_COLLECTION = 'categories';

export const seedFirestore = async () => {
  try {
    console.log('Starting Firestore seeding...');

    // Check if categories already exist
    const categoriesRef = collection(db, CATEGORIES_COLLECTION);
    const existingCategories = await getDocs(categoriesRef);

    if (existingCategories.size === 0) {
      console.log('Seeding categories...');
      // Add all categories to Firestore
      const categoryPromises = categories.map(async (category) => {
        const { id, ...categoryData } = category; // Remove the local ID
        return addDoc(categoriesRef, {
          ...categoryData,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      });

      await Promise.all(categoryPromises);
      console.log(`Successfully seeded ${categories.length} categories to Firestore!`);
    } else {
      console.log('Categories already exist in Firestore. Skipping categories seed.');
    }

    // Check if products already exist
    const productsRef = collection(db, PRODUCTS_COLLECTION);
    const existingProducts = await getDocs(productsRef);

    if (existingProducts.size === 0) {
      console.log('Seeding products...');
      // Add all products to Firestore
      const productPromises = products.map(async (product) => {
        const { id, ...productData } = product; // Remove the local ID
        return addDoc(productsRef, {
          ...productData,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      });

      await Promise.all(productPromises);
      console.log(`Successfully seeded ${products.length} products to Firestore!`);
    } else {
      console.log('Products already exist in Firestore. Skipping products seed.');
    }

    console.log('Firestore seeding completed!');
  } catch (error) {
    console.error('Error seeding Firestore:', error);
    throw error;
  }
};

// Function to call from browser console for manual seeding
if (typeof window !== 'undefined') {
  (window as any).seedFirestore = seedFirestore;
}
