import { useState, useEffect } from 'react';
import { 
  DiscountCode, 
  getAllDiscountCodes, 
  subscribeToDiscountCodes 
} from '@/services/discountService';

export const useDiscountCodes = () => {
  const [discountCodes, setDiscountCodes] = useState<DiscountCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Initial load
    const loadDiscountCodes = async () => {
      try {
        setLoading(true);
        const codes = await getAllDiscountCodes();
        setDiscountCodes(codes);
        setError(null);
      } catch (err) {
        console.error('Error loading discount codes:', err);
        setError('Failed to load discount codes');
      } finally {
        setLoading(false);
      }
    };

    loadDiscountCodes();

    // Subscribe to real-time updates
    const unsubscribe = subscribeToDiscountCodes((codes) => {
      setDiscountCodes(codes);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return {
    discountCodes,
    loading,
    error
  };
};
