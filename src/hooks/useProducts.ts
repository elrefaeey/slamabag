import { useState, useEffect } from 'react';
import { Product } from '@/data/products';
import { 
  getAllProducts, 
  getProductsByCategory, 
  getFeaturedProducts,
  subscribeToProducts 
} from '@/services/productService';

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const productsData = await getAllProducts();
        setProducts(productsData);
        setError(null);
      } catch (err) {
        setError('Failed to load products');
        console.error('Error loading products:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();

    // Subscribe to real-time updates
    const unsubscribe = subscribeToProducts((productsData) => {
      setProducts(productsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { products, loading, error };
};

export const useProductsByCategory = (category: string) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const productsData = await getProductsByCategory(category);
        setProducts(productsData);
        setError(null);
      } catch (err) {
        setError('Failed to load products');
        console.error('Error loading products by category:', err);
      } finally {
        setLoading(false);
      }
    };

    if (category) {
      loadProducts();
    } else {
      setProducts([]);
      setLoading(false);
    }
  }, [category]);

  return { products, loading, error };
};

export const useFeaturedProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const productsData = await getFeaturedProducts();
        setProducts(productsData);
        setError(null);
      } catch (err) {
        setError('Failed to load featured products');
        console.error('Error loading featured products:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  return { products, loading, error };
};
