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

export interface Category {
  id: string;
  name: string;
  description?: string; // optional now
  image?: string;       // optional now
  createdAt?: Date;
  updatedAt?: Date;
}

const CATEGORIES_COLLECTION = 'categories';

// Get all categories
export const getAllCategories = async (): Promise<Category[]> => {
  try {
    const categoriesRef = collection(db, CATEGORIES_COLLECTION);
    const q = query(categoriesRef, orderBy('name'));
    const querySnapshot = await getDocs(q);
    
    const categories: Category[] = [];
    querySnapshot.forEach((doc) => {
      categories.push({
        id: doc.id,
        ...doc.data()
      } as Category);
    });
    
    return categories;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw new Error('Failed to fetch categories');
  }
};

// Add a new category (name only is required)
export const addCategory = async (categoryData: { name: string; description?: string; image?: string; }): Promise<string> => {
  try {
    const categoriesRef = collection(db, CATEGORIES_COLLECTION);
    const docRef = await addDoc(categoriesRef, {
      name: categoryData.name,
      // only include optional fields if provided
      ...(categoryData.description ? { description: categoryData.description } : {}),
      ...(categoryData.image ? { image: categoryData.image } : {}),
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Error adding category:', error);
    throw new Error('Failed to add category');
  }
};

// Update a category
export const updateCategory = async (categoryId: string, categoryData: Partial<Category>): Promise<void> => {
  try {
    const categoryRef = doc(db, CATEGORIES_COLLECTION, categoryId);
    await updateDoc(categoryRef, {
      ...categoryData,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error updating category:', error);
    throw new Error('Failed to update category');
  }
};

// Delete a category
export const deleteCategory = async (categoryId: string): Promise<void> => {
  try {
    const categoryRef = doc(db, CATEGORIES_COLLECTION, categoryId);
    await deleteDoc(categoryRef);
  } catch (error) {
    console.error('Error deleting category:', error);
    throw new Error('Failed to delete category');
  }
};

// Listen to categories changes (real-time)
export const subscribeToCategories = (callback: (categories: Category[]) => void) => {
  const categoriesRef = collection(db, CATEGORIES_COLLECTION);
  const q = query(categoriesRef, orderBy('name'));
  
  return onSnapshot(q, (querySnapshot) => {
    const categories: Category[] = [];
    querySnapshot.forEach((doc) => {
      categories.push({
        id: doc.id,
        ...doc.data()
      } as Category);
    });
    callback(categories);
  }, (error) => {
    console.error('Error listening to categories:', error);
  });
};
