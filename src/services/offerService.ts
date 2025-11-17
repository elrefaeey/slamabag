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
  Timestamp,
  where
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Offer } from '@/components/admin/OfferForm';

const OFFERS_COLLECTION = 'offers';

// Get all offers
export const getAllOffers = async (): Promise<Offer[]> => {
  try {
    const offersRef = collection(db, OFFERS_COLLECTION);
    const q = query(offersRef, orderBy('endTime', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const offers: Offer[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      offers.push({
        id: doc.id,
        ...data,
        endTime: data.endTime.toDate() // Convert Firestore Timestamp to Date
      } as Offer);
    });
    
    return offers;
  } catch (error) {
    console.error('Error fetching offers:', error);
    throw new Error('Failed to fetch offers');
  }
};

// Get active offers only
export const getActiveOffers = async (): Promise<Offer[]> => {
  try {
    const offersRef = collection(db, OFFERS_COLLECTION);
    const now = new Date();

    // Get all active offers first (single field query)
    const q = query(offersRef, where('isActive', '==', true));
    const querySnapshot = await getDocs(q);

    const offers: Offer[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const endTime = data.endTime.toDate();

      // Filter out expired offers in memory
      if (endTime > now) {
        offers.push({
          id: doc.id,
          ...data,
          endTime
        } as Offer);
      }
    });

    // Sort by end time
    offers.sort((a, b) => a.endTime.getTime() - b.endTime.getTime());

    return offers;
  } catch (error) {
    console.error('Error fetching active offers:', error);
    throw new Error('Failed to fetch active offers');
  }
};

// Subscribe to offers changes
export const subscribeToOffers = (callback: (offers: Offer[]) => void) => {
  const offersRef = collection(db, OFFERS_COLLECTION);
  const q = query(offersRef, orderBy('endTime', 'desc'));
  
  return onSnapshot(q, (querySnapshot) => {
    const offers: Offer[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      offers.push({
        id: doc.id,
        ...data,
        endTime: data.endTime.toDate()
      } as Offer);
    });
    callback(offers);
  });
};

// Subscribe to active offers only
export const subscribeToActiveOffers = (callback: (offers: Offer[]) => void) => {
  const offersRef = collection(db, OFFERS_COLLECTION);

  // Subscribe to all active offers (single field query)
  const q = query(offersRef, where('isActive', '==', true));

  return onSnapshot(q, (querySnapshot) => {
    const now = new Date();
    const offers: Offer[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const endTime = data.endTime.toDate();

      // Filter out expired offers in memory
      if (endTime > now) {
        offers.push({
          id: doc.id,
          ...data,
          endTime
        } as Offer);
      }
    });

    // Sort by end time
    offers.sort((a, b) => a.endTime.getTime() - b.endTime.getTime());

    callback(offers);
  });
};

// Add a new offer
export const addOffer = async (offerData: Omit<Offer, 'id'>): Promise<string> => {
  try {
    const offersRef = collection(db, OFFERS_COLLECTION);
    const docRef = await addDoc(offersRef, {
      ...offerData,
      endTime: Timestamp.fromDate(offerData.endTime),
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Error adding offer:', error);
    throw new Error('Failed to add offer');
  }
};

// Update an offer
export const updateOffer = async (offerId: string, offerData: Partial<Omit<Offer, 'id'>>): Promise<void> => {
  try {
    const offerRef = doc(db, OFFERS_COLLECTION, offerId);
    const updateData: any = {
      ...offerData,
      updatedAt: Timestamp.now()
    };
    
    // Convert endTime to Timestamp if provided
    if (offerData.endTime) {
      updateData.endTime = Timestamp.fromDate(offerData.endTime);
    }
    
    await updateDoc(offerRef, updateData);
  } catch (error) {
    console.error('Error updating offer:', error);
    throw new Error('Failed to update offer');
  }
};

// Delete an offer
export const deleteOffer = async (offerId: string): Promise<void> => {
  try {
    const offerRef = doc(db, OFFERS_COLLECTION, offerId);
    await deleteDoc(offerRef);
  } catch (error) {
    console.error('Error deleting offer:', error);
    throw new Error('Failed to delete offer');
  }
};

// Deactivate expired offers
export const deactivateExpiredOffers = async (): Promise<void> => {
  try {
    const offersRef = collection(db, OFFERS_COLLECTION);
    const now = new Date();

    // Get all active offers first (single field query)
    const q = query(offersRef, where('isActive', '==', true));
    const querySnapshot = await getDocs(q);

    // Filter expired offers in memory to avoid composite index requirement
    const expiredOffers = querySnapshot.docs.filter(doc => {
      const data = doc.data();
      const endTime = data.endTime?.toDate() || new Date();
      return endTime <= now;
    });

    // Update expired offers to inactive
    const updatePromises = expiredOffers.map(doc =>
      updateDoc(doc.ref, {
        isActive: false,
        updatedAt: Timestamp.now()
      })
    );

    if (updatePromises.length > 0) {
      await Promise.all(updatePromises);
      console.log(`Deactivated ${updatePromises.length} expired offers`);
    }
  } catch (error) {
    console.error('Error deactivating expired offers:', error);
    // Don't throw error to prevent blocking the app
    console.warn('Continuing without deactivating expired offers');
  }
};
