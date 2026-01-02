import { useEffect, useState } from 'react';
import { DeliveryArea, getAllDeliveryAreas, subscribeToDeliveryAreas } from '@/services/deliveryService';

export const useDeliveryAreas = () => {
  const [areas, setAreas] = useState<DeliveryArea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await getAllDeliveryAreas();
        setAreas(data);
        setError(null);
      } catch (e) {
        console.error('Failed to load delivery areas', e);
        setError('Failed to load delivery areas');
      } finally {
        setLoading(false);
      }
    };
    load();

    const unsub = subscribeToDeliveryAreas((data) => {
      setAreas(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  return { areas, loading, error };
};