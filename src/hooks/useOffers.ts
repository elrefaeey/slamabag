import { useState, useEffect } from 'react';
import { Offer } from '@/components/admin/OfferForm';
import { 
  getAllOffers, 
  getActiveOffers, 
  subscribeToOffers, 
  subscribeToActiveOffers,
  deactivateExpiredOffers 
} from '@/services/offerService';

export const useOffers = () => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadOffers = async () => {
      try {
        setLoading(true);
        // Clean up expired offers first
        await deactivateExpiredOffers();
        const offersData = await getAllOffers();
        setOffers(offersData);
        setError(null);
      } catch (err) {
        setError('Failed to load offers');
        console.error('Error loading offers:', err);
      } finally {
        setLoading(false);
      }
    };

    loadOffers();

    // Subscribe to real-time updates
    const unsubscribe = subscribeToOffers((offersData) => {
      setOffers(offersData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { offers, loading, error };
};

export const useActiveOffers = () => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadActiveOffers = async () => {
      try {
        setLoading(true);
        // Clean up expired offers first
        await deactivateExpiredOffers();
        const offersData = await getActiveOffers();
        setOffers(offersData);
        setError(null);
      } catch (err) {
        setError('Failed to load active offers');
        console.error('Error loading active offers:', err);
      } finally {
        setLoading(false);
      }
    };

    loadActiveOffers();

    // Subscribe to real-time updates for active offers
    const unsubscribe = subscribeToActiveOffers((offersData) => {
      setOffers(offersData);
      setLoading(false);
    });

    // Set up interval to check for expired offers every minute
    const intervalId = setInterval(async () => {
      try {
        await deactivateExpiredOffers();
      } catch (error) {
        console.error('Error deactivating expired offers:', error);
      }
    }, 60000); // Check every minute

    return () => {
      unsubscribe();
      clearInterval(intervalId);
    };
  }, []);

  return { offers, loading, error };
};
