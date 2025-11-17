import { useState, useEffect } from 'react';
import { Category } from '@/services/categoryService';
import { 
  getAllCategories, 
  subscribeToCategories 
} from '@/services/categoryService';

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        const categoriesData = await getAllCategories();
        setCategories(categoriesData);
        setError(null);
      } catch (err) {
        setError('Failed to load categories');
        console.error('Error loading categories:', err);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();

    // Subscribe to real-time updates
    const unsubscribe = subscribeToCategories((categoriesData) => {
      setCategories(categoriesData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { categories, loading, error };
};
