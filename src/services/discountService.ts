import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  onSnapshot,
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Discount Code Interface
export interface DiscountCode {
  id: string;
  code: string;
  discountPercentage: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Type for creating new discount codes (without id and timestamps)
export type CreateDiscountCode = Omit<DiscountCode, 'id' | 'createdAt' | 'updatedAt'>;

// Type for updating discount codes
export type UpdateDiscountCode = Partial<Omit<DiscountCode, 'id' | 'createdAt'>>;

const COLLECTION_NAME = 'discountCodes';

// Convert Firestore timestamp to Date
const convertTimestamp = (timestamp: any): Date => {
  if (timestamp && timestamp.toDate) {
    return timestamp.toDate();
  }
  return new Date(timestamp);
};

// Convert DiscountCode for Firestore (Date to Timestamp)
const convertForFirestore = (discountCode: Partial<DiscountCode>) => {
  const converted: any = { ...discountCode };

  if (converted.createdAt) {
    converted.createdAt = Timestamp.fromDate(converted.createdAt);
  }
  if (converted.updatedAt) {
    converted.updatedAt = Timestamp.fromDate(converted.updatedAt);
  }

  return converted;
};

// Convert Firestore document to DiscountCode
const convertFromFirestore = (doc: any): DiscountCode => {
  const data = doc.data();
  return {
    id: doc.id,
    code: data.code,
    discountPercentage: data.discountPercentage,
    isActive: data.isActive,
    createdAt: convertTimestamp(data.createdAt),
    updatedAt: convertTimestamp(data.updatedAt),
  };
};

// Add a new discount code
export const addDiscountCode = async (discountCodeData: CreateDiscountCode): Promise<string> => {
  try {
    const now = new Date();
    const discountCodeWithTimestamps = {
      ...discountCodeData,
      createdAt: now,
      updatedAt: now
    };

    const convertedData = convertForFirestore(discountCodeWithTimestamps);
    const docRef = await addDoc(collection(db, COLLECTION_NAME), convertedData);
    
    console.log('Discount code added with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error adding discount code:', error);
    throw error;
  }
};

// Get all discount codes
export const getAllDiscountCodes = async (): Promise<DiscountCode[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
    const discountCodes: DiscountCode[] = [];
    
    querySnapshot.forEach((doc) => {
      discountCodes.push(convertFromFirestore(doc));
    });
    
    return discountCodes;
  } catch (error) {
    console.error('Error getting discount codes:', error);
    throw error;
  }
};

// Get a discount code by code string
export const getDiscountCodeByCode = async (code: string): Promise<DiscountCode | null> => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME), 
      where('code', '==', code.toUpperCase()),
      where('isActive', '==', true)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    const doc = querySnapshot.docs[0];
    const discountCode = convertFromFirestore(doc);

    return discountCode;
  } catch (error) {
    console.error('Error getting discount code by code:', error);
    throw error;
  }
};

// Update a discount code
export const updateDiscountCode = async (id: string, updates: UpdateDiscountCode): Promise<void> => {
  try {
    const updatesWithTimestamp = {
      ...updates,
      updatedAt: new Date()
    };
    
    const convertedUpdates = convertForFirestore(updatesWithTimestamp);
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, convertedUpdates);
    
    console.log('Discount code updated:', id);
  } catch (error) {
    console.error('Error updating discount code:', error);
    throw error;
  }
};

// Delete a discount code
export const deleteDiscountCode = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
    
    console.log('Discount code deleted:', id);
  } catch (error) {
    console.error('Error deleting discount code:', error);
    throw error;
  }
};

// Subscribe to discount codes changes (real-time updates)
export const subscribeToDiscountCodes = (callback: (discountCodes: DiscountCode[]) => void) => {
  const unsubscribe = onSnapshot(
    collection(db, COLLECTION_NAME),
    (querySnapshot) => {
      const discountCodes: DiscountCode[] = [];
      querySnapshot.forEach((doc) => {
        discountCodes.push(convertFromFirestore(doc));
      });
      callback(discountCodes);
    },
    (error) => {
      console.error('Error in discount codes subscription:', error);
    }
  );
  
  return unsubscribe;
};



// Validate discount code (comprehensive validation)
export const validateDiscountCode = async (code: string): Promise<{
  isValid: boolean;
  discountCode?: DiscountCode;
  error?: string;
}> => {
  try {
    if (!code || code.trim().length === 0) {
      return { isValid: false, error: 'Please enter a discount code' };
    }

    const discountCode = await getDiscountCodeByCode(code.trim());
    
    if (!discountCode) {
      return { isValid: false, error: 'Invalid discount code' };
    }
    
    if (!discountCode.isActive) {
      return { isValid: false, error: 'This discount code is no longer active' };
    }

    return { isValid: true, discountCode };
  } catch (error) {
    console.error('Error validating discount code:', error);
    return { isValid: false, error: 'Error validating discount code. Please try again.' };
  }
};
