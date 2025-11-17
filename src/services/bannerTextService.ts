import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDocs,
  onSnapshot,
  query,
  limit,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface BannerText {
  id: string;
  text: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateBannerText {
  text: string;
  isActive: boolean;
}

const COLLECTION_NAME = 'bannerText';

// Convert Firestore document to BannerText
const convertToBannerText = (doc: any): BannerText => {
  const data = doc.data();
  return {
    id: doc.id,
    text: data.text || '',
    isActive: data.isActive !== undefined ? data.isActive : true,
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
  };
};

// Get the active banner text (we'll only store one)
export const getBannerText = async (): Promise<BannerText | null> => {
  try {
    const q = query(collection(db, COLLECTION_NAME), limit(1));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    return convertToBannerText(querySnapshot.docs[0]);
  } catch (error) {
    console.error('Error getting banner text:', error);
    throw error;
  }
};

// Add new banner text (if none exists)
export const addBannerText = async (bannerTextData: CreateBannerText): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...bannerTextData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding banner text:', error);
    throw error;
  }
};

// Update banner text
export const updateBannerText = async (
  id: string,
  bannerTextData: Partial<CreateBannerText>
): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, {
      ...bannerTextData,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating banner text:', error);
    throw error;
  }
};

// Subscribe to banner text changes
export const subscribeToBannerText = (
  callback: (bannerText: BannerText | null) => void
): (() => void) => {
  const q = query(collection(db, COLLECTION_NAME), limit(1));
  return onSnapshot(
    q,
    (snapshot) => {
      if (snapshot.empty) {
        callback(null);
      } else {
        const bannerText = convertToBannerText(snapshot.docs[0]);
        callback(bannerText);
      }
    },
    (error) => {
      console.error('Error subscribing to banner text:', error);
    }
  );
};

